#!/usr/bin/env python3
from pathlib import Path

import cv2
import numpy as np

SRC = Path("scripts/_wm_probe/lobby_src.jpg")
OUT = Path("scripts/_wm_probe/inverted.jpg")
MASK = Path("scripts/_wm_probe/inverted_mask.jpg")


def main() -> None:
    bgr = cv2.imread(str(SRC))
    h, w = bgr.shape[:2]
    out = bgr.astype(np.float32)
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY).astype(np.float32)
    bg = cv2.GaussianBlur(gray, (0, 0), sigmaX=max(w, h) * 0.04)
    residual = np.clip(gray - bg, 0, None)

    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    cy, cx = (h - 1) / 2.0, (w - 1) / 2.0
    weight = ((np.abs(yy - cy) / cy) < 0.78) & ((np.abs(xx - cx) / cx) < 0.82)
    score = residual * weight.astype(np.float32)
    thr = max(4.0, float(np.percentile(score[weight], 86)))
    mask = ((score > thr) & weight).astype(np.uint8) * 255
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, k, iterations=2)
    mask = cv2.dilate(mask, k, iterations=1)
    soft = cv2.GaussianBlur(mask, (7, 7), 0).astype(np.float32) / 255.0

    for c in range(3):
        ch = out[:, :, c]
        local = cv2.GaussianBlur(ch, (0, 0), sigmaX=max(w, h) * 0.045)
        lift = np.clip(ch - local, 0, None)
        alpha = np.clip(lift / np.maximum(255.0 - local, 10.0), 0.0, 0.55) * soft
        recovered = (ch - alpha * 255.0) / np.maximum(1.0 - alpha, 0.35)
        recovered = np.clip(recovered, 0, 255)
        # Pull recovered toward local bg if overshoot
        recovered = np.where(recovered < local - 30, local, recovered)
        out[:, :, c] = ch * (1.0 - soft) + recovered * soft

    cleaned = np.clip(out, 0, 255).astype(np.uint8)
    # Tiny inpaint only on strongest glyph cores
    core = cv2.erode(mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3)), iterations=1)
    if core.any():
        cleaned = cv2.inpaint(cleaned, core, 2, cv2.INPAINT_TELEA)

    cv2.imwrite(str(OUT), cleaned, [int(cv2.IMWRITE_JPEG_QUALITY), 92])
    cv2.imwrite(str(MASK), mask)
    print("mask_px", int(mask.sum() / 255), "->", OUT)


if __name__ == "__main__":
    main()
