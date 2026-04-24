import { supabase } from '@/lib/supabase';

// Cloudflare Stream API endpoints
const CLOUDFLARE_ACCOUNT_ID = import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID;
const STREAM_API_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream`;

/** Hard cap before we even ask for a direct-upload ticket (cost + UX). */
export const REEL_UPLOAD_MAX_BYTES = 250 * 1024 * 1024;

const MAX_REEL_TITLE_CHARS = 512;
const MAX_REEL_DESCRIPTION_CHARS = 2000;

function postFormDataWithProgress(
  uploadURL: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', uploadURL);

    xhr.upload.onprogress = (e) => {
      if (!onProgress) return;
      if (e.lengthComputable && e.total > 0) {
        onProgress(Math.min(100, Math.round((100 * e.loaded) / e.total)));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        if (onProgress) onProgress(100);
        resolve();
      } else {
        reject(new Error(`Upload vidéo refusé (${xhr.status}): ${xhr.responseText?.slice(0, 200) || ''}`));
      }
    };
    xhr.onerror = () => reject(new Error('Échec réseau pendant l’upload vidéo'));
    xhr.onabort = () => reject(new Error('Upload annulé'));

    const formData = new FormData();
    formData.append('file', file);
    xhr.send(formData);
  });
}

export type UploadVideoOptions = {
  onUploadProgress?: (percent: number) => void;
};

/**
 * Upload a video to Cloudflare Stream
 * Note: This should be done through a backend proxy/worker for security
 * This is a client-side example - in production, use a Supabase Edge Function or Cloudflare Worker
 */
export const streamService = {
  /**
   * Get video details by video ID
   */
  async getVideo(videoId: string) {
    try {
      const response = await fetch(`${STREAM_API_URL}/${videoId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_CLOUDFLARE_STREAM_TOKEN}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch video');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching video:', error);
      throw error;
    }
  },

  /**
   * Get video embed URL for playback
   */
  getVideoEmbedUrl(videoId: string): string {
    return `https://customer-${CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${videoId}/iframe`;
  },

  /**
   * Get video playback URL (HLS)
   */
  getVideoPlaybackUrl(videoId: string): string {
    return `https://customer-${CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${videoId}/manifest/video.m3u8`;
  },

  /**
   * Get video thumbnail URL
   */
  getVideoThumbnailUrl(videoId: string, timeInSeconds: number = 1): string {
    return `https://customer-${CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${videoId}/thumbnails/thumbnail.jpg?time=${timeInSeconds}s`;
  },

  /**
   * Upload video through backend proxy
   * This should call your Supabase Edge Function or Cloudflare Worker
   */
  async uploadVideo(
    file: File,
    metadata?: { title?: string; description?: string },
    options?: UploadVideoOptions
  ) {
    if (file.size > REEL_UPLOAD_MAX_BYTES) {
      const maxMb = Math.round(REEL_UPLOAD_MAX_BYTES / (1024 * 1024));
      throw new Error(`Vidéo trop volumineuse (max ${maxMb} Mo). Réduis la taille ou la durée.`);
    }

    // Step 1: Mint a Cloudflare direct-upload URL via Edge Function.
    // Use raw fetch + JSON (never FormData here) so the request stays tiny — avoids 413 at the gateway.
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) {
      throw new Error('You must be signed in to upload a reel');
    }

    const ticketUrl = `${supabaseUrl.replace(/\/$/, '')}/functions/v1/upload-video`;
    const ticketRes = await fetch(ticketUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        apikey: supabaseAnonKey,
      },
      body: JSON.stringify({
        action: 'create-direct-upload',
        title: (metadata?.title || '').slice(0, MAX_REEL_TITLE_CHARS),
        description: (metadata?.description || '').slice(0, MAX_REEL_DESCRIPTION_CHARS),
      }),
    });

    const ticketJson = (await ticketRes.json().catch(() => ({}))) as {
      error?: string;
      hint?: string;
      details?: string;
      upstreamStatus?: number;
    };
    if (!ticketRes.ok) {
      const msg =
        typeof ticketJson?.error === 'string'
          ? ticketJson.error
          : `upload-video failed (${ticketRes.status})`;
      const hint = typeof ticketJson?.hint === 'string' ? ` — ${ticketJson.hint}` : '';
      const details =
        typeof ticketJson?.details === 'string' && ticketJson.details.trim()
          ? ` (${ticketJson.details.trim().slice(0, 400)})`
          : '';
      const upstream =
        typeof ticketJson?.upstreamStatus === 'number'
          ? ` [Cloudflare HTTP ${ticketJson.upstreamStatus}]`
          : '';
      throw new Error(`${msg}${hint}${details}${upstream}`);
    }

    const directData = ticketJson as {
      directUpload?: { uploadURL?: string; uid?: string };
    };

    const uploadURL = directData?.directUpload?.uploadURL;
    const uid = directData?.directUpload?.uid;
    if (!uploadURL || !uid) {
      throw new Error('Direct upload URL generation failed');
    }

    // Step 2: Upload video directly to Cloudflare Stream (XHR = progress events; fetch often lacks them)
    options?.onUploadProgress?.(0);
    await postFormDataWithProgress(uploadURL, file, options?.onUploadProgress);

    return {
      success: true,
      video: {
        id: uid,
      },
    };
  },

  /**
   * Delete a video
   */
  async deleteVideo(videoId: string) {
    try {
      const response = await fetch(`${STREAM_API_URL}/${videoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_CLOUDFLARE_STREAM_TOKEN}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete video');
      }

      return true;
    } catch (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  },
};

