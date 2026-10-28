#!/usr/bin/env python3
"""Probe translucent Chridari watermark inversion."""
from pathlib import Path

import cv2
import numpy as np

SRC = Path("scripts/_wm_probe/v2.jpg")
OUT = Path("scripts/_wm_probe")


def watermark_mask(bgr: np.ndarray) -> np.ndarray:
    h, w = bgr.shape[:2]
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY).astype(np.float32)
    bg = cv2.GaussianBlur(gray, (0, 0), sigmaX=max(w, h) * 0.045)
    residual = np.clip(gray - bg, 0, None)

    yy, xx = np.mgrid[0:h, 0:w]
    cy, cx = h * 0.5, w * 0.5
    band = (np.abs(yy - cy) < h * 0.11) & (np.abs(xx - cx) < w * 0.30)
    score = residual * band.astype(np.float32)
    thr = max(6.0, float(np.percentile(score[band], 82)))
    mask = ((score > thr) & band).astype(np.uint8) * 255
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, k, iterations=2)
    mask = cv2.dilate(mask, k, iterations=1)
    return mask


def invert_white_watermark(bgr: np.ndarray, mask: np.ndarray) -> np.ndarray:
    """Undo I = (1-a)*B + a*W for a white/light watermark."""
    h, w = bgr.shape[:2]
    out = bgr.astype(np.float32).copy()
    soft = cv2.GaussianBlur(mask, (5, 5), 0).astype(np.float32) / 255.0

    for c in range(3):
        ch = out[:, :, c]
        bg = cv2.GaussianBlur(ch, (0, 0), sigmaX=max(w, h) * 0.05)
        # Estimate alpha from lift toward white.
        lift = np.clip(ch - bg, 0, None)
        denom = np.maximum(255.0 - bg, 8.0)
        alpha = np.clip(lift / denom, 0.0, 0.65) * soft
        # Recover background.
        recovered = (ch - alpha * 255.0) / np.maximum(1.0 - alpha, 0.25)
        # Blend only where mask says watermark.
        ch2 = ch * (1.0 - soft) + recovered * soft
        # Where recovery undershoots, fall back toward local bg.
        bad = soft > 0.2
        ch2 = np.where(bad & (ch2 < bg - 25), bg, ch2)
        out[:, :, c] = ch2

    cleaned = np.clip(out, 0, 255).astype(np.uint8)
    # Light inpaint only on remaining high-confidence glyph cores.
    core = cv2.erode(mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3)), iterations=1)
    if core.any():
        cleaned = cv2.inpaint(cleaned, core, inpaintRadius=2, flags=cv2.INPAINT_TELEA)
    return cleaned


def main() -> None:
    bgr = cv2.imread(str(SRC))
    if bgr is None:
        raise SystemExit(f"missing {SRC}")
    mask = watermark_mask(bgr)
    cleaned = invert_white_watermark(bgr, mask)
    cv2.imwrite(str(OUT / "cleaned.jpg"), cleaned, [int(cv2.IMWRITE_JPEG_QUALITY), 92])
    cv2.imwrite(str(OUT / "mask.jpg"), mask)
    # Side-by-side for inspection.
    pair = np.hstack([bgr, cleaned])
    cv2.imwrite(str(OUT / "compare.jpg"), pair, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
    print("wrote cleaned/compare mask_px", int(mask.sum() / 255))


if __name__ == "__main__":
    main()
