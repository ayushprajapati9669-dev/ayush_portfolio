from PIL import Image, ImageFilter, ImageOps, ImageEnhance, ImageDraw, ImageChops
from collections import deque

def process_portrait():
    src_path = 'C:/Users/Lenovo/.gemini/antigravity/brain/a65f0578-4a47-4a84-8743-3af3312bebbb/.user_uploaded/media_1793506189384_213954ac.jpg'
    img = Image.open(src_path).convert('RGB')
    
    # 768 x 1024 -> Crop to bust (head + chest)
    crop_box = (60, 100, 750, 880)
    cropped = img.crop(crop_box)
    cw, ch = cropped.size # 690 x 780
    pixels = cropped.load()

    # Step 1: Flood-fill background from perimeter
    is_bg = [[False for _ in range(ch)] for _ in range(cw)]
    visited = [[False for _ in range(ch)] for _ in range(cw)]
    
    queue = deque()

    # Seed all border pixels on top, left, and right
    for x in range(cw):
        for y in range(4):
            r, g, b = pixels[x, y]
            lum = 0.299 * r + 0.587 * g + 0.114 * b
            if lum > 140:
                queue.append((x, y))
                visited[x][y] = True
                is_bg[x][y] = True

    for y in range(ch):
        for x in [0, 1, 2, 3, cw-4, cw-3, cw-2, cw-1]:
            if not visited[x][y]:
                r, g, b = pixels[x, y]
                lum = 0.299 * r + 0.587 * g + 0.114 * b
                if lum > 130 or y < 460:
                    queue.append((x, y))
                    visited[x][y] = True
                    is_bg[x][y] = True

    # 4-connected BFS flood-fill
    while queue:
        cx, cy = queue.popleft()
        
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < cw and 0 <= ny < ch and not visited[nx][ny]:
                r, g, b = pixels[nx, ny]
                lum = 0.299 * r + 0.587 * g + 0.114 * b

                is_skin = (r > 120) and (r > b + 18) and (g > b + 5) and (lum < 235)
                is_dark = (lum < 110)

                if not is_skin and not is_dark and (lum > 155 or (cy < 380 and lum > 130)):
                    visited[nx][ny] = True
                    is_bg[nx][ny] = True
                    queue.append((nx, ny))
                else:
                    visited[nx][ny] = True

    # Build mask from is_bg
    mask = Image.new('L', (cw, ch), 0)
    for x in range(cw):
        for y in range(ch):
            # Clean left shelf artifacts
            if x < 115 and y < 430:
                mask.putpixel((x, y), 0)
            elif not is_bg[x][y]:
                mask.putpixel((x, y), 255)

    # Protect the face & neck ellipse from any background bleed
    for y in range(ch):
        for x in range(cw):
            # Face core
            if ((x - 340) / 108.0) ** 2 + ((y - 280) / 135.0) ** 2 <= 1.0:
                mask.putpixel((x, y), 255)
            # Neck core
            if 270 <= x <= 430 and 380 <= y <= 450:
                mask.putpixel((x, y), 255)

    # Smooth the mask
    mask = mask.filter(ImageFilter.MaxFilter(5))
    mask = mask.filter(ImageFilter.MinFilter(5))
    mask = mask.filter(ImageFilter.GaussianBlur(radius=2.0))

    # Bottom dissolve & soft edge vignette
    m_pixels = mask.load()
    for y in range(ch):
        for x in range(cw):
            val = m_pixels[x, y]
            if val > 0:
                # dissolve bust at bottom into #030303
                if y > ch - 160:
                    val = int(val * max(0.0, 1.0 - (y - (ch - 160)) / 160.0))
                if x < 40:
                    val = int(val * (x / 40.0))
                elif x > cw - 40:
                    val = int(val * ((cw - x) / 40.0))
                m_pixels[x, y] = val

    # Editorial High-Contrast Grayscale
    gray = ImageOps.grayscale(cropped)
    gray = ImageEnhance.Contrast(gray).enhance(1.42)
    gray = ImageEnhance.Brightness(gray).enhance(1.03)

    # Warm Editorial Tint (Alabaster cream highlights, deep blacks)
    editorial = ImageOps.colorize(
        gray,
        black=(3, 3, 3),
        mid=(158, 152, 144),
        white=(248, 243, 235)
    )

    # Amber rim light on right contour (#ff8c59)
    rim_layer = Image.new('RGB', (cw, ch), (3, 3, 3))
    for y in range(80, ch - 60):
        for x in range(cw - 1, 250, -1):
            if m_pixels[x, y] > 180:
                for d in range(16):
                    px = x - d
                    if px > 0:
                        intensity = ((1.0 - d / 16.0) ** 1.6) * 0.55
                        ar = int(255 * intensity)
                        ag = int(140 * intensity)
                        ab = int(89 * intensity)
                        rim_layer.putpixel((px, y), (ar, ag, ab))
                break

    rim_layer = rim_layer.filter(ImageFilter.GaussianBlur(radius=3))
    editorial_with_rim = Image.blend(editorial, ImageChops.add(editorial, rim_layer), 0.8)

    # Micro stipple / digital particle texture
    stipple_img = editorial_with_rim.copy()
    s_pix = stipple_img.load()
    for y in range(0, ch, 2):
        for x in range(0, cw, 2):
            if m_pixels[x, y] > 40:
                r, g, b = s_pix[x, y]
                factor = 1.08 if ((x // 2 + y // 2) % 2 == 0) else 0.93
                s_pix[x, y] = (
                    min(255, int(r * factor)),
                    min(255, int(g * factor)),
                    min(255, int(b * factor))
                )

    # Composite onto pure pitch black #030303
    pure_black = Image.new('RGB', (cw, ch), (3, 3, 3))
    final = Image.composite(stipple_img, pure_black, mask)

    # Save outputs
    final.save('client/public/images/ayush-sarthak-portrait.png', 'PNG')
    final.save('client/public/images/ayush-sarthak-portrait.webp', 'WEBP', quality=95)
    final.save('client/public/images/ayush-portrait-new.jpg', 'JPEG', quality=95)
    print(f'Done! Saved {cw}x{ch} to client/public/images/ayush-sarthak-portrait.png')

if __name__ == '__main__':
    process_portrait()
