import { useEffect, useRef } from 'react';
import { streamService } from '@/services/streamService';

interface CloudflareVideoPlayerProps {
  videoId: string;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
}

/**
 * Cloudflare Stream Video Player Component
 * Uses Cloudflare Stream's iframe embed for optimal playback
 */
export const CloudflareVideoPlayer = ({
  videoId,
  className = '',
  autoPlay = true,
  loop = true,
  muted = true,
  controls = false,
}: CloudflareVideoPlayerProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
      ref={iframeRef}
      src={`${embedUrl}?${params.toString()}`}
      className={className}
      allow="autoplay; encrypted-media; picture-in-picture"
      allowFullScreen
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
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

