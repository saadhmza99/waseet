#!/usr/bin/env python3
from pathlib import Path
import importlib.util

import cv2
import numpy as np
from PIL import Image
from simple_lama_inpainting import SimpleLama

# Reuse mask from batch script.
spec = importlib.util.spec_from_file_location("batch", "scripts/dewatermark_chridari_covers.py")
batch = importlib.util.module_from_spec(spec)
spec.loader.exec_module(batch)

SRC = Path("scripts/_wm_probe/uploaded_check.jpg")  # previously cleaned but still marked
# Prefer original if present
orig = Path("scripts/_wm_probe/lobby_src.jpg")
OUT = Path("scripts/_wm_probe/lama_cleaned2.jpg")
MASK = Path("scripts/_wm_probe/lama_mask2.jpg")


def main() -> None:
    path = orig if orig.exists() else SRC
    bgr = cv2.imread(str(path))
    mask = batch.watermark_mask(bgr)
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    lama = SimpleLama()
    result = lama(Image.fromarray(rgb), Image.fromarray(mask))
    result.save(OUT, quality=92)
    cv2.imwrite(str(MASK), mask)
    print("src", path, "mask_px", int(mask.sum() / 255), "->", OUT)


if __name__ == "__main__":
    main()
