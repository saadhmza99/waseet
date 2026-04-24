// Supabase Edge Function for secure Cloudflare Stream direct uploads

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CLOUDFLARE_ACCOUNT_ID = Deno.env.get("CLOUDFLARE_ACCOUNT_ID");
const CLOUDFLARE_STREAM_TOKEN = Deno.env.get("CLOUDFLARE_STREAM_TOKEN");
const STREAM_API_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type DirectUploadRequest = {
  action?: string;
  title?: string;
  description?: string;
};

/** Cloudflare Stream rejects oversized `meta`; keep payloads small. */
const MAX_TITLE_LEN = 512;
const MAX_DESCRIPTION_LEN = 2000;

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_STREAM_TOKEN) {
      return new Response(
        JSON.stringify({
          error: "Missing Cloudflare configuration",
          hint: "Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_STREAM_TOKEN in Supabase secrets",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // New flow (pro): create direct upload URL so file is uploaded directly to Cloudflare.
    // This avoids Edge Function body size limits (413).
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      return new Response(
        JSON.stringify({
          error: "Video must not be uploaded to this endpoint",
          hint: "Deploy the latest frontend: it requests a direct upload URL (JSON), then uploads the file to Cloudflare.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const maxJsonBytes = 65_536;
    const contentLengthRaw = req.headers.get("content-length");
    if (contentLengthRaw) {
      const n = Number.parseInt(contentLengthRaw, 10);
      if (Number.isFinite(n) && n > maxJsonBytes) {
        return new Response(
          JSON.stringify({
            error: "Request body too large",
            hint: "This function only accepts a small JSON body (action=create-direct-upload). The video uploads directly to Cloudflare.",
          }),
          { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const body = (await req.json().catch(() => ({}))) as DirectUploadRequest;
    const action = body.action;

    if (action === "create-direct-upload") {
      const title = String(body.title || "").slice(0, MAX_TITLE_LEN);
      const description = String(body.description || "").slice(0, MAX_DESCRIPTION_LEN);

      const { error: quotaError } = await supabaseClient.rpc("assert_reel_quota_ok");
      if (quotaError) {
        return new Response(JSON.stringify({ error: quotaError.message }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const response = await fetch(`${STREAM_API_URL}/direct_upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CLOUDFLARE_STREAM_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          maxDurationSeconds: 30,
          meta: {
            name: title,
            description,
            uploadedBy: user.id,
          },
        }),
      });

      if (!response.ok) {
        const details = await response.text();
        // Do not mirror upstream status (e.g. 413): browsers confuse it with "your POST body was huge".
        return new Response(
          JSON.stringify({
            error: "Failed to create direct upload URL",
            details: details.slice(0, 4000),
            upstreamStatus: response.status,
          }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const directUploadData = await response.json();
      return new Response(
        JSON.stringify({
          success: true,
          directUpload: {
            uploadURL: directUploadData?.result?.uploadURL,
            uid: directUploadData?.result?.uid,
          },
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Unsupported request payload",
        hint: "Use JSON body with action=create-direct-upload",
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

