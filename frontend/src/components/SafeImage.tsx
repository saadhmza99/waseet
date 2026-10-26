import { useEffect, useState, type ImgHTMLAttributes } from "react";

type SafeImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src?: string | null;
  /** Used when src is empty or fails to load (dead host, 404, etc.). */
  fallback: string;
};

/** Swaps to fallback once on load error so broken seed/hotlink URLs stay quiet. */
export const SafeImage = ({ src, fallback, alt = "", onError, ...rest }: SafeImageProps) => {
  const preferred = (src || "").trim() || fallback;
  const [current, setCurrent] = useState(preferred);

  useEffect(() => {
    setCurrent((src || "").trim() || fallback);
  }, [src, fallback]);

  return (
    <img
      {...rest}
      src={current}
      alt={alt}
      onError={(e) => {
        if (current !== fallback) setCurrent(fallback);
        onError?.(e);
      }}
    />
  );
};
