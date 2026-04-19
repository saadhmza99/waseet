// Supabase Edge Function for secure video upload to Cloudflare Stream
// This function acts as a proxy to keep your Cloudflare API token secure

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CLOUDFLARE_ACCOUNT_ID = Deno.env.get("CLOUDFLARE_ACCOUNT_ID");
const CLOUDFLARE_STREAM_TOKEN = Deno.env.get("CLOUDFLARE_STREAM_TOKEN");
const STREAM_API_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream`;

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
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
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get form data
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string | null;
    const description = formData.get("description") as string | null;

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Upload to Cloudflare Stream
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    if (title) uploadFormData.append("meta", JSON.stringify({ name: title }));

    const response = await fetch(`${STREAM_API_URL}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_STREAM_TOKEN}`,
      },
      body: uploadFormData,
    });

    if (!response.ok) {
      const error = await response.text();
      return new Response(
        JSON.stringify({ error: "Failed to upload to Cloudflare Stream", details: error }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const videoData = await response.json();

    return new Response(
      JSON.stringify({
        success: true,
        video: {
          id: videoData.result?.uid,
          thumbnail: videoData.result?.thumbnail,
          duration: videoData.result?.duration,
          status: videoData.result?.status,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

