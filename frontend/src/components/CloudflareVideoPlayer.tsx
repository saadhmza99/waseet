import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { streamService } from '@/services/streamService';
import { MediaRetryOverlay } from '@/components/RetryImage';
import { cn } from '@/lib/utils';

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

/** Reliable play/pause for same-origin `<video>` (e.g. HLS reels). */
export function streamHtmlVideoCommand(
  video: HTMLVideoElement | null,
  action: 'play' | 'pause'
): void {
  if (!video) return;
  if (action === 'play') void video.play().catch(() => {});
  else video.pause();
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
  const [retryNonce, setRetryNonce] = useState(0);
  const [failed, setFailed] = useState(false);
  const resolvedId =
    iframeDomId ||
    `cf-stream-${String(videoId || '')
      .trim()
      .replace(/[^a-zA-Z0-9-_]/g, '')}`;

  useEffect(() => {
    setFailed(false);
    void ensureStreamEmbedSdk().catch(() => {});
  }, [videoId, retryNonce]);

  const embedUrl = streamService.getVideoEmbedUrl(videoId);
  const params = new URLSearchParams({
    autoplay: autoPlay ? 'true' : 'false',
    loop: loop ? 'true' : 'false',
    muted: muted ? 'true' : 'false',
    controls: controls ? 'true' : 'false',
  });
  if (retryNonce > 0) params.set('retry', String(retryNonce));

  return (
    <div className={cn('relative h-full w-full min-h-0', className)}>
      <iframe
        id={resolvedId}
        ref={iframeRef}
        title="Reel vidéo"
        src={`${embedUrl}?${params.toString()}`}
        className="h-full w-full"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        loading="lazy"
        onError={() => setFailed(true)}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          maxHeight: '100%',
        }}
      />
      {failed ? (
        <MediaRetryOverlay
          dark
          onRetry={() => {
            setFailed(false);
            setRetryNonce((n) => n + 1);
          }}
        />
      ) : null}
    </div>
  );
};

export type CloudflareHLSPlayerProps = CloudflareVideoPlayerProps & {
  /** DOM id for `document.getElementById` (reels play/pause). */
  videoDomId?: string;
  objectFit?: 'contain' | 'cover';
  clipEndSeconds?: number;
  onLoadStateChange?: (state: 'loading' | 'ready' | 'error') => void;
};

/**
 * Native `<video>` + HLS (hls.js where needed). Use for reels when iframe/SDK pause is unreliable.
 */
export const CloudflareHLSPlayer = ({
  videoId,
  videoDomId,
  className = '',
  autoPlay = true,
  loop = true,
  muted = true,
  controls = false,
  objectFit = 'contain',
  clipEndSeconds,
  onLoadStateChange,
}: CloudflareHLSPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const onLoadStateChangeRef = useRef(onLoadStateChange);
  onLoadStateChangeRef.current = onLoadStateChange;
  const [retryNonce, setRetryNonce] = useState(0);
  const [failed, setFailed] = useState(false);
  const resolvedId =
    videoDomId ||
    `cf-hls-${String(videoId || '')
      .trim()
      .replace(/[^a-zA-Z0-9-_]/g, '')}`;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    setFailed(false);
    const src = streamService.getVideoPlaybackUrl(videoId);
    onLoadStateChangeRef.current?.('loading');
    hlsRef.current?.destroy();
    hlsRef.current = null;
    video.removeAttribute('src');
    video.load();

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
      });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setFailed(false);
        onLoadStateChangeRef.current?.('ready');
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          console.error('HLS fatal error', data);
          setFailed(true);
          onLoadStateChangeRef.current?.('error');
        }
      });
    } else {
      video.src = src;
    }

    const onCanPlay = () => {
      setFailed(false);
      onLoadStateChangeRef.current?.('ready');
    };
    const onWaiting = () => onLoadStateChangeRef.current?.('loading');
    const onError = () => {
      setFailed(true);
      onLoadStateChangeRef.current?.('error');
    };
    const onTimeUpdate = () => {
      if (!clipEndSeconds || clipEndSeconds <= 0) return;
      if (video.currentTime < clipEndSeconds) return;
      if (loop) {
        video.currentTime = 0;
        void video.play().catch(() => {});
      } else {
        video.pause();
      }
    };
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('error', onError);
    video.addEventListener('timeupdate', onTimeUpdate);

    return () => {
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('error', onError);
      video.removeEventListener('timeupdate', onTimeUpdate);
      hlsRef.current?.destroy();
      hlsRef.current = null;
      video.pause();
      video.removeAttribute('src');
      video.load();
    };
  }, [videoId, clipEndSeconds, loop, retryNonce]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (autoPlay) void video.play().catch(() => {});
    else video.pause();
  }, [autoPlay]);

  return (
    <div className={cn('relative h-full w-full min-h-0', className)}>
      <video
        id={resolvedId}
        ref={videoRef}
        className="h-full w-full"
        loop={loop}
        muted={muted}
        controls={controls}
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit,
        }}
      />
      {failed ? (
        <MediaRetryOverlay
          dark
          onRetry={() => {
            setFailed(false);
            setRetryNonce((n) => n + 1);
          }}
        />
      ) : null}
    </div>
  );
};

