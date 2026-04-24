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
    if (contentType.includes("application/json")) {
      const body = (await req.json().catch(() => ({}))) as DirectUploadRequest;
      const action = body.action;

      if (action === "create-direct-upload") {
        const title = body.title || "";
        const description = body.description || "";

        const response = await fetch(`${STREAM_API_URL}/direct_upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${CLOUDFLARE_STREAM_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            maxDurationSeconds: 300,
            meta: {
              name: title,
              description,
              uploadedBy: user.id,
            },
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          return new Response(
            JSON.stringify({ error: "Failed to create direct upload URL", details: error }),
            { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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

