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

/** Best-effort play/pause for Cloudflare Stream iframe embeds (cross-origin). */
export function streamIframePostCommand(iframe: HTMLIFrameElement | null, action: 'play' | 'pause') {
  const w = iframe?.contentWindow;
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
    // Optional: Load video metadata
    // streamService.getVideo(videoId).then(console.log);
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

