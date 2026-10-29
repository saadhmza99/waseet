import { ImgHTMLAttributes, useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

/** A cancelled first download (common on mobile when the feed reshuffles) should retry before the overlay. */
const AUTO_RETRIES = 2;

const withRetryNonce = (src: string, nonce: number) =>
  nonce > 0 ? `${src}${src.includes("?") ? "&" : "?"}retry=${nonce}` : src;

export function MediaRetryOverlay({
  compact,
  dark,
  onRetry,
}: {
  compact?: boolean;
  dark?: boolean;
  onRetry: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onRetry();
      }}
      className={cn(
        "absolute inset-0 z-[18] flex flex-col items-center justify-center gap-1 px-3 text-center",
        dark ? "bg-black/80 text-white" : "bg-muted/95 text-card-foreground"
      )}
    >
      <span className={cn("font-semibold leading-tight", compact ? "text-xs" : "text-sm")}>
        Impossible de charger
      </span>
      <span
        className={cn(
          "leading-tight",
          compact ? "text-[10px]" : "text-xs",
          dark ? "text-white/80" : "text-muted-foreground"
        )}
      >
        Appuyez pour réessayer
      </span>
    </button>
  );
}

type RetryImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  wrapClassName?: string;
  wrapStyle?: CSSProperties;
  compact?: boolean;
};

export function RetryImage({
  src,
  alt = "",
  className,
  wrapClassName,
  wrapStyle,
  compact,
  onError,
  onLoad,
  ...rest
}: RetryImageProps) {
  const [nonce, setNonce] = useState(0);
  const [failed, setFailed] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const nonceRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setFailed(false);
    setRetrying(false);
    setNonce(0);
    nonceRef.current = 0;
    return () => {
      if (timerRef.current != null) window.clearTimeout(timerRef.current);
    };
  }, [src]);

  const bumpNonce = () => {
    const next = nonceRef.current + 1;
    nonceRef.current = next;
    setNonce(next);
  };

  const resolved = src ? withRetryNonce(src, nonce) : src;

  return (
    <div className={cn("relative overflow-hidden", wrapClassName)} style={wrapStyle}>
      {resolved ? (
        <img
          {...rest}
          src={resolved}
          alt={alt}
          className={cn(className, retrying && "invisible")}
          onError={(e) => {
            if (nonceRef.current < AUTO_RETRIES) {
              setRetrying(true);
              if (timerRef.current != null) window.clearTimeout(timerRef.current);
              timerRef.current = window.setTimeout(() => {
                timerRef.current = null;
                bumpNonce();
              }, 350);
              return;
            }
            setRetrying(false);
            setFailed(true);
            onError?.(e);
          }}
          onLoad={(e) => {
            setRetrying(false);
            setFailed(false);
            onLoad?.(e);
          }}
        />
      ) : (
        <div className={cn("bg-muted", className)} aria-hidden />
      )}
      {failed ? (
        <MediaRetryOverlay
          compact={compact}
          onRetry={() => {
            setFailed(false);
            setRetrying(true);
            bumpNonce();
          }}
        />
      ) : null}
    </div>
  );
}
