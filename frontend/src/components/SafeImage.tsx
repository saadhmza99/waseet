import { useEffect, useRef, useState, type ImgHTMLAttributes } from "react";

type SafeImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src?: string | null;
  /** Used when src is empty or fails to load (dead host, 404, etc.). */
  fallback: string;
};

const AUTO_RETRIES = 2;

const withRetryNonce = (src: string, nonce: number) =>
  nonce > 0 ? `${src}${src.includes("?") ? "&" : "?"}retry=${nonce}` : src;

/** Retries a cancelled first download, then swaps to fallback so broken URLs stay quiet. */
export const SafeImage = ({ src, fallback, alt = "", onError, ...rest }: SafeImageProps) => {
  const preferred = (src || "").trim() || fallback;
  const [attempt, setAttempt] = useState(0);
  const [useFallback, setUseFallback] = useState(false);
  const attemptRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setUseFallback(false);
    setAttempt(0);
    attemptRef.current = 0;
    return () => {
      if (timerRef.current != null) window.clearTimeout(timerRef.current);
    };
  }, [preferred]);

  const current =
    useFallback || preferred === fallback ? fallback : withRetryNonce(preferred, attempt);

  return (
    <img
      {...rest}
      src={current}
      alt={alt}
      onError={(e) => {
        if (!useFallback && preferred !== fallback && attemptRef.current < AUTO_RETRIES) {
          if (timerRef.current != null) window.clearTimeout(timerRef.current);
          timerRef.current = window.setTimeout(() => {
            timerRef.current = null;
            const next = attemptRef.current + 1;
            attemptRef.current = next;
            setAttempt(next);
          }, 350);
          return;
        }
        if (!useFallback && preferred !== fallback) setUseFallback(true);
        onError?.(e);
      }}
    />
  );
};
