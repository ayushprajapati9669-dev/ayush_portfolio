from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import collections

# Load image
im = Image.open('client/public/images/ayush-portrait-new.jpg').convert('RGB')
w, h = im.size

mask = Image.new('L', (w, h), 255)
mask_pixels = mask.load()
im_pixels = im.load()

# Face protection bounding box:
# Ayush's head is between x in [220, 560] and y in [180, 680]
def in_subject_core(x, y):
    # Head and face center ellipse
    cx = 384
    cy = 400
    rx = 175
    ry = 220
    if ((x - cx) ** 2) / (rx ** 2) + ((y - cy) ** 2) / (ry ** 2) <= 1.0:
        return True
    # Body below neck
    if y >= 580 and 150 <= x <= 650:
        return True
    return False

visited = set()
queue = collections.deque()

for x in range(w):
    queue.append((x, 0))
    visited.add((x, 0))

for y in range(int(h * 0.75)):
    queue.append((0, y))
    queue.append((w - 1, y))
    visited.add((0, y))
    visited.add((w - 1, y))

while queue:
    cx, cy = queue.popleft()
    if in_subject_core(cx, cy):
        continue

    r, g, b = im_pixels[cx, cy]
    brightness = (r + g + b) / 3.0

    if brightness > 125:
        mask_pixels[cx, cy] = 0
        for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
            if 0 <= nx < w and 0 <= ny < int(h * 0.85):
                if (nx, ny) not in visited:
                    visited.add((nx, ny))
                    if not in_subject_core(nx, ny):
                        nr, ng, nb = im_pixels[nx, ny]
                        nbrightness = (nr + ng + nb) / 3.0
                        if nbrightness > 120:
                            queue.append((nx, ny))

# Feather the mask with smooth blur
mask = mask.filter(ImageFilter.GaussianBlur(radius=3))

# Monochrome with film contrast like Sarthak
gray = im.convert('L')
enhancer = ImageEnhance.Contrast(gray)
contrast_gray = enhancer.enhance(1.25)
contrast_rgb = contrast_gray.convert('RGB')

# Warm amber tint on right edge like Sarthak image
rgb_pixels = contrast_rgb.load()
for y in range(h):
    for x in range(w):
        lum = rgb_pixels[x, y][0]
        # Right rim light factor
        if x > w * 0.45:
            rim = (x - w * 0.45) / (w * 0.55)
            amber_r = int(rim * 38)
            amber_g = int(rim * 20)
        else:
            amber_r = 0
            amber_g = 0
        rgb_pixels[x, y] = (
            min(255, lum + amber_r),
            min(255, int(lum * 0.96) + amber_g),
            min(255, int(lum * 0.90))
        )

black_bg = Image.new('RGB', (w, h), (3, 3, 3))
composite = Image.composite(contrast_rgb, black_bg, mask)

# Bottom fade
comp_pixels = composite.load()
for y in range(int(h * 0.62), h):
    factor = 1.0 - ((y - h * 0.62) / (h * 0.38))
    factor = max(0.0, min(1.0, factor))
    for x in range(w):
        r, g, b = comp_pixels[x, y]
        comp_pixels[x, y] = (
            int(r * factor + 3 * (1 - factor)),
            int(g * factor + 3 * (1 - factor)),
            int(b * factor + 3 * (1 - factor))
        )

# Crop
crop_box = (int(w * 0.10), int(h * 0.10), int(w * 0.90), int(h * 0.78))
cropped = composite.crop(crop_box)
cropped.save('client/public/images/ayush-sarthak-portrait.png', 'PNG')
print('Successfully generated refined ayush-sarthak-portrait.png!')
