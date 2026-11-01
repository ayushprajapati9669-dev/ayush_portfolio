from PIL import Image, ImageFilter, ImageEnhance

im = Image.open('client/public/images/ayush-portrait-new.jpg').convert('RGB')
w, h = im.size

mask = Image.new('L', (w, h), 255)
mask_pixels = mask.load()
im_pixels = im.load()

for y in range(h):
    for x in range(w):
        # Protected face/head box
        if 200 <= x <= 490 and 130 <= y <= 540:
            mask_pixels[x, y] = 255
            continue

        r, g, b = im_pixels[x, y]
        brightness = (r + g + b) / 3.0
        rb_diff = r - b

        # If it's neutral wall
        if rb_diff < 22 and brightness > 130:
            mask_pixels[x, y] = 0
        elif brightness > 220:
            mask_pixels[x, y] = 0
        else:
            if y > h * 0.70:
                fade = max(0.0, min(1.0, 1.0 - (y - h * 0.70) / (h * 0.30)))
                mask_pixels[x, y] = int(255 * fade)
            else:
                mask_pixels[x, y] = 255

# Feather the mask with smooth blur
mask = mask.filter(ImageFilter.GaussianBlur(radius=2))

# Create monochrome high-contrast Ayush image with warm rim lighting
gray = im.convert('L')
enhancer = ImageEnhance.Contrast(gray)
contrast_gray = enhancer.enhance(1.22)
contrast_rgb = contrast_gray.convert('RGB')
rgb_pixels = contrast_rgb.load()

for y in range(h):
    for x in range(w):
        lum = rgb_pixels[x, y][0]
        # Add subtle warm rim lighting on right side
        if x > w * 0.48:
            rim = (x - w * 0.48) / (w * 0.52)
            amber_r = int(rim * 35)
            amber_g = int(rim * 18)
        else:
            amber_r = 0
            amber_g = 0
        rgb_pixels[x, y] = (
            min(255, lum + amber_r),
            min(255, int(lum * 0.96) + amber_g),
            min(255, int(lum * 0.90))
        )

# Composite onto pure black #030303
black_bg = Image.new('RGB', (w, h), (3, 3, 3))
composite = Image.composite(contrast_rgb, black_bg, mask)

# Crop nicely around head and chest
crop_box = (int(w * 0.12), int(h * 0.08), int(w * 0.88), int(h * 0.75))
cropped = composite.crop(crop_box)
cropped.save('client/public/images/ayush-sarthak-portrait.png', 'PNG')
print('Successfully saved clean ayush-sarthak-portrait.png!')
