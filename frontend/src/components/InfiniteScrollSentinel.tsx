import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

export const PAGE_SIZE = 2;

interface InfiniteScrollSentinelProps {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
}

const InfiniteScrollSentinel = ({ hasMore, loading, onLoadMore }: InfiniteScrollSentinelProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  useEffect(() => {
    const el = ref.current;
    if (!el || !hasMore || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onLoadMoreRef.current();
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  if (!hasMore && !loading) return null;

  return (
    <div ref={ref} className="flex justify-center py-6" aria-live="polite">
      {loading ? <Loader2 className="h-6 w-6 animate-spin text-[#174f43]" aria-label="Chargement" /> : <span className="h-6" />}
    </div>
  );
};

export default InfiniteScrollSentinel;
