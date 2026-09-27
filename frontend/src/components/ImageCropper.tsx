import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type Offset = { x: number; y: number };

interface ImageCropperProps {
  file: File;
  aspect: number;
  round?: boolean;
  outputWidth: number;
  onCancel: () => void;
  onConfirm: (file: File) => void;
}

const MAX_ZOOM = 4;

const ImageCropper = ({ file, aspect, round = false, outputWidth, onCancel, onConfirm }: ImageCropperProps) => {
  const frameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchStart = useRef<{ distance: number; zoom: number } | null>(null);
  const [src, setSrc] = useState("");
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [frame, setFrame] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      setNatural({ w: img.naturalWidth, h: img.naturalHeight });
    };
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useLayoutEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      setFrame({ w, h: w / aspect });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [aspect]);

  const baseScale = natural.w && frame.w ? Math.max(frame.w / natural.w, frame.h / natural.h) : 1;
  const scale = baseScale * zoom;

  const clamp = useCallback(
    (next: Offset, currentScale: number): Offset => {
      const minX = frame.w - natural.w * currentScale;
      const minY = frame.h - natural.h * currentScale;
      return {
        x: Math.min(0, Math.max(minX, next.x)),
        y: Math.min(0, Math.max(minY, next.y)),
      };
    },
    [frame.w, frame.h, natural.w, natural.h],
  );

  useEffect(() => {
    if (!natural.w || !frame.w) return;
    setZoom(1);
    setOffset({
      x: (frame.w - natural.w * baseScale) / 2,
      y: (frame.h - natural.h * baseScale) / 2,
    });
    // Recentre only when the image or frame size changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [natural.w, natural.h, frame.w, frame.h]);

  const applyZoom = useCallback(
    (nextZoom: number) => {
      const z = Math.min(MAX_ZOOM, Math.max(1, nextZoom));
      const nextScale = baseScale * z;
      setOffset((prev) => {
        const cx = (frame.w / 2 - prev.x) / scale;
        const cy = (frame.h / 2 - prev.y) / scale;
        return clamp({ x: frame.w / 2 - cx * nextScale, y: frame.h / 2 - cy * nextScale }, nextScale);
      });
      setZoom(z);
    },
    [baseScale, clamp, frame.w, frame.h, scale],
  );

  const onPointerDown = (event: React.PointerEvent) => {
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinchStart.current = { distance: Math.hypot(a.x - b.x, a.y - b.y), zoom };
    }
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const previous = pointers.current.get(event.pointerId);
    if (!previous) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2 && pinchStart.current) {
      const [a, b] = [...pointers.current.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      applyZoom(pinchStart.current.zoom * (distance / pinchStart.current.distance));
      return;
    }
    const dx = event.clientX - previous.x;
    const dy = event.clientY - previous.y;
    setOffset((prev) => clamp({ x: prev.x + dx, y: prev.y + dy }, scale));
  };

  const onPointerUp = (event: React.PointerEvent) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
  };

  const confirm = () => {
    const img = imageRef.current;
    if (!img || !frame.w) return;
    setSaving(true);
    const outputHeight = Math.round(outputWidth / aspect);
    const canvas = document.createElement("canvas");
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setSaving(false);
      return;
    }
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, -offset.x / scale, -offset.y / scale, frame.w / scale, frame.h / scale, 0, 0, outputWidth, outputHeight);
    canvas.toBlob(
      (blob) => {
        setSaving(false);
        if (!blob) return;
        const name = file.name.replace(/\.[^.]+$/, "") || "photo";
        onConfirm(new File([blob], `${name}.jpg`, { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.9,
    );
  };

  return (
    <div className="space-y-3">
      <div
        ref={frameRef}
        className={`relative w-full touch-none select-none overflow-hidden bg-neutral-900 ${round ? "mx-auto max-w-[260px]" : "rounded-md"}`}
        style={{ height: frame.h || undefined, aspectRatio: frame.h ? undefined : String(aspect) }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={(event) => applyZoom(zoom - event.deltaY * 0.002)}
      >
        {src && natural.w ? (
          <img
            src={src}
            alt=""
            draggable={false}
            className="pointer-events-none absolute left-0 top-0 max-w-none origin-top-left"
            style={{
              width: natural.w,
              height: natural.h,
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            }}
          />
        ) : null}
        {round ? (
          <div className="pointer-events-none absolute inset-0 rounded-full shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] ring-2 ring-white/80" />
        ) : (
          <div className="pointer-events-none absolute inset-0 rounded-md ring-2 ring-inset ring-white/80" />
        )}
      </div>

      <div className="flex items-center gap-3">
        <button type="button" onClick={() => applyZoom(zoom - 0.2)} aria-label="Dézoomer" className="text-muted-foreground">
          <Minus className="h-4 w-4" />
        </button>
        <input
          type="range"
          min={1}
          max={MAX_ZOOM}
          step={0.01}
          value={zoom}
          onChange={(e) => applyZoom(Number(e.target.value))}
          className="h-1 flex-1 cursor-pointer accent-[#174f43]"
          aria-label="Zoom"
        />
        <button type="button" onClick={() => applyZoom(zoom + 0.2)} aria-label="Zoomer" className="text-muted-foreground">
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <p className="text-center text-xs text-muted-foreground">Faites glisser pour repositionner, zoomez pour recadrer.</p>

      <div className="flex justify-center gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button
          type="button"
          onClick={confirm}
          disabled={saving || !natural.w}
          className="bg-[#174f43] text-white hover:bg-[#123d34]"
        >
          {saving ? "..." : "Valider"}
        </Button>
      </div>
    </div>
  );
};

export default ImageCropper;
