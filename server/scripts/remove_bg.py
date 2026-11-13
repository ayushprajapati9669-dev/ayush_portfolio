#!/usr/bin/env python3
"""
High-performance background removal helper using rembg (u2netp model).
Reads input image from path or stdin base64, writes output PNG/WebP to path or stdout.
"""
import sys
import os
import io
import base64
from PIL import Image

def remove_background(input_data):
    from rembg import remove, new_session
    # Use lightweight 4MB u2netp model for sub-second execution
    session = new_session('u2netp')
    
    if isinstance(input_data, str) and (os.path.exists(input_data) or input_data.startswith('data:image')):
        if input_data.startswith('data:image'):
            # Base64 data URL
            header, encoded = input_data.split(',', 1)
            raw = base64.b64decode(encoded)
            img = Image.open(io.BytesIO(raw))
        else:
            img = Image.open(input_data)
    elif isinstance(input_data, bytes):
        img = Image.open(io.BytesIO(input_data))
    else:
        img = input_data

    # Ensure RGBA
    if img.mode != 'RGBA':
        img = img.convert('RGBA')

    cutout = remove(img, session=session)

    # Soft edge feathering so no flat cropped borders exist anywhere
    w, h = cutout.size
    pixels = cutout.load()

    # 1. Feather bottom (bottom 18%) so it dissolves naturally above footer
    fade_bottom = int(h * 0.82)
    for y in range(fade_bottom, h):
        factor = (h - y) / (h - fade_bottom)
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if a > 0:
                pixels[x, y] = (r, g, b, int(a * factor))

    # 2. Feather left edge (left 6%) if cropped arm/shoulder touches x=0
    left_touch = any(pixels[0, y][3] > 0 for y in range(h))
    if left_touch:
        fade_left = int(w * 0.06)
        for x in range(fade_left):
            factor = x / fade_left
            for y in range(h):
                r, g, b, a = pixels[x, y]
                if a > 0:
                    pixels[x, y] = (r, g, b, int(a * factor))

    # 3. Feather right edge (right 6%) if cropped body touches x=w-1
    right_touch = any(pixels[w - 1, y][3] > 0 for y in range(h))
    if right_touch:
        fade_right = int(w * 0.06)
        for x in range(w - fade_right, w):
            factor = (w - 1 - x) / fade_right
            for y in range(h):
                r, g, b, a = pixels[x, y]
                if a > 0:
                    pixels[x, y] = (r, g, b, int(a * factor))

    return cutout

def main():
    if len(sys.argv) < 2:
        print("Usage: python remove_bg.py <input_path_or_base64> [output_path]", file=sys.stderr)
        sys.exit(1)

    input_arg = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else None

    # Handle stdin or base64 file if input is '-'
    if input_arg == '-':
        input_data = sys.stdin.read().strip()
    else:
        input_data = input_arg

    cutout = remove_background(input_data)

    if output_path:
        ext = os.path.splitext(output_path)[1].lower()
        if ext in ['.webp']:
            cutout.save(output_path, 'WEBP', lossless=True)
        else:
            cutout.save(output_path, 'PNG', optimize=True)
        print(f"OK:{output_path}")
    else:
        # Output as lossless high-fidelity WebP data URL to stdout (100% original quality preserved)
        buf = io.BytesIO()
        cutout.save(buf, format='WEBP', lossless=True)
        b64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        print(f"data:image/webp;base64,{b64}")

if __name__ == '__main__':
    main()

