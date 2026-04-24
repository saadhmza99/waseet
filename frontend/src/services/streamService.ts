import { supabase } from '@/lib/supabase';

// Cloudflare Stream API endpoints
const CLOUDFLARE_ACCOUNT_ID = import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID;
const STREAM_API_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream`;

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
  async uploadVideo(file: File, metadata?: { title?: string; description?: string }) {
    // Step 1: Ask backend for a direct upload URL (no video payload through Edge Function)
    const { data: directData, error: createError } = await supabase.functions.invoke('upload-video', {
      body: {
        action: 'create-direct-upload',
        title: metadata?.title || '',
        description: metadata?.description || '',
      },
    });

    if (createError) throw createError;

    const uploadURL = directData?.directUpload?.uploadURL;
    const uid = directData?.directUpload?.uid;
    if (!uploadURL || !uid) {
      throw new Error('Direct upload URL generation failed');
    }

    // Step 2: Upload video directly to Cloudflare Stream
    const formData = new FormData();
    formData.append('file', file);
    const uploadResponse = await fetch(uploadURL, {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      const details = await uploadResponse.text().catch(() => '');
      throw new Error(`Direct upload failed (${uploadResponse.status}): ${details}`);
    }

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

