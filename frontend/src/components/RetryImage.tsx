import { ImgHTMLAttributes, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

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
  compact?: boolean;
};

export function RetryImage({
  src,
  alt = "",
  className,
  wrapClassName,
  compact,
  onError,
  onLoad,
  ...rest
}: RetryImageProps) {
  const [nonce, setNonce] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
    setNonce(0);
  }, [src]);

  const resolved =
    src && nonce > 0 ? `${src}${src.includes("?") ? "&" : "?"}retry=${nonce}` : src;

  return (
    <div className={cn("relative overflow-hidden", wrapClassName)}>
      {resolved ? (
        <img
          {...rest}
          src={resolved}
          alt={alt}
          className={className}
          onError={(e) => {
            setFailed(true);
            onError?.(e);
          }}
          onLoad={(e) => {
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
            setNonce((n) => n + 1);
          }}
        />
      ) : null}
    </div>
  );
}
