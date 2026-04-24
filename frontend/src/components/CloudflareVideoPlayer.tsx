import { useEffect, useRef } from 'react';
import { streamService } from '@/services/streamService';

interface CloudflareVideoPlayerProps {
  videoId: string;
  /** Stable DOM id so parent can call `streamIframePostCommand` (play/pause). */
  iframeDomId?: string;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
}

type StreamEmbedPlayer = {
  play?: () => Promise<void>;
  pause?: () => void;
};

declare global {
  interface Window {
    Stream?: (element: HTMLElement) => StreamEmbedPlayer;
  }
}

const STREAM_SDK_SCRIPT_ID = 'cf-stream-embed-sdk';
const STREAM_SDK_SRC = 'https://embed.cloudflarestream.com/embed/sdk.latest.js';

let streamSdkLoadPromise: Promise<void> | null = null;

/** Loads Cloudflare’s Stream iframe SDK (required for programmatic play/pause). */
export function ensureStreamEmbedSdk(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (typeof window.Stream === 'function') return Promise.resolve();
  if (streamSdkLoadPromise) return streamSdkLoadPromise;

  streamSdkLoadPromise = new Promise((resolve, reject) => {
    const finish = () => {
      if (typeof window.Stream === 'function') resolve();
      else reject(new Error('Stream SDK loaded but window.Stream is missing'));
    };

    const existing = document.getElementById(STREAM_SDK_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      if (typeof window.Stream === 'function') {
        resolve();
        return;
      }
      existing.addEventListener('load', finish, { once: true });
      existing.addEventListener('error', () => reject(new Error('Stream SDK script error')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = STREAM_SDK_SCRIPT_ID;
    script.src = STREAM_SDK_SRC;
    script.async = true;
    script.onload = () => finish();
    script.onerror = () => reject(new Error('Stream SDK script failed to load'));
    document.head.appendChild(script);
  });

  return streamSdkLoadPromise;
}

function postMessagePlayPauseFallback(iframe: HTMLIFrameElement, action: 'play' | 'pause') {
  const w = iframe.contentWindow;
  if (!w) return;
  const variants: unknown[] = [
    { event: action },
    { method: action },
    { type: `player:${action}` },
    action,
  ];
  for (const payload of variants) {
    try {
      w.postMessage(payload, '*');
    } catch {
      /* ignore */
    }
  }
}

/**
 * Play / pause for Cloudflare Stream iframe embeds.
 * Uses the official embed SDK when possible; see https://developers.cloudflare.com/stream/viewing-videos/using-the-stream-player/using-the-player-api/
 */
export async function streamIframePostCommand(
  iframe: HTMLIFrameElement | null,
  action: 'play' | 'pause'
): Promise<void> {
  if (!iframe) return;

  try {
    await ensureStreamEmbedSdk();
    const StreamFn = window.Stream;
    if (typeof StreamFn === 'function') {
      const attempts = 10;
      for (let i = 0; i < attempts; i++) {
        try {
          const player = StreamFn(iframe);
          if (action === 'play') {
            await player.play?.().catch(() => {});
          } else {
            player.pause?.();
          }
          return;
        } catch {
          await new Promise((r) => setTimeout(r, 100));
        }
      }
    }
  } catch {
    /* use fallback */
  }

  postMessagePlayPauseFallback(iframe, action);
}

/**
 * Cloudflare Stream Video Player Component
 * Uses Cloudflare Stream's iframe embed for optimal playback
 */
export const CloudflareVideoPlayer = ({
  videoId,
  iframeDomId,
  className = '',
  autoPlay = true,
  loop = true,
  muted = true,
  controls = false,
}: CloudflareVideoPlayerProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const resolvedId =
    iframeDomId ||
    `cf-stream-${String(videoId || '')
      .trim()
      .replace(/[^a-zA-Z0-9-_]/g, '')}`;

  useEffect(() => {
    void ensureStreamEmbedSdk().catch(() => {});
  }, [videoId]);

  const embedUrl = streamService.getVideoEmbedUrl(videoId);
  const params = new URLSearchParams({
    autoplay: autoPlay ? 'true' : 'false',
    loop: loop ? 'true' : 'false',
    muted: muted ? 'true' : 'false',
    controls: controls ? 'true' : 'false',
  });

  return (
    <iframe
      id={resolvedId}
      ref={iframeRef}
      title="Reel vidéo"
      src={`${embedUrl}?${params.toString()}`}
      className={className}
      allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
      allowFullScreen
      loading="lazy"
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
        maxHeight: '100%',
      }}
    />
  );
};

/**
 * Alternative: Native HTML5 video player using HLS
 * Use this if you need more control over the video player
 */
export const CloudflareHLSPlayer = ({
  videoId,
  className = '',
  autoPlay = true,
  loop = true,
  muted = true,
  controls = false,
}: CloudflareVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Use HLS.js for HLS playback if needed
    const playbackUrl = streamService.getVideoPlaybackUrl(videoId);
    video.src = playbackUrl;

    if (autoPlay) {
      video.play().catch(console.error);
    }
  }, [videoId, autoPlay]);

  return (
    <video
      ref={videoRef}
      className={className}
      loop={loop}
      muted={muted}
      controls={controls}
      playsInline
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
      }}
    />
  );
};

