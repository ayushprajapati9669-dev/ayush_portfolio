/**
 * Portrait Particle Sampling Web Worker
 * Offloads pixel data scanning, alpha filtering, and particle trajectory generation
 * off the main UI thread to eliminate main-thread blocking during bootstrap and resize.
 */

const MATRIX_GLYPHS = ['0', '1', '+', '*', '·', 'x', ':', '•', '◇', '▲'];

self.onmessage = function (e) {
  const data = e.data;
  if (!data || data.type !== 'SAMPLE_IMAGE') return;

  const { width, height, step, imgBuffer, gen } = data;

  if (!width || !height || !imgBuffer || !(imgBuffer instanceof ArrayBuffer)) {
    self.postMessage({
      type: 'SAMPLING_ERROR',
      gen,
      error: 'Invalid input parameters or buffer missing'
    });
    return;
  }

  try {
    const imgData = new Uint8ClampedArray(imgBuffer);
    const pts = [];
    const glyphCount = MATRIX_GLYPHS.length;

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const idx = (y * width + x) * 4;
        const a = imgData[idx + 3];

        // Only keep subject silhouette pixels
        if (a > 45) {
          const r = imgData[idx];
          const g = imgData[idx + 1];
          const b = imgData[idx + 2];
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;

          // Spatial depth: 0.25 (deep) to 1.0 (foreground)
          const z = 0.25 + (y / height) * 0.45 + Math.random() * 0.3;

          // Scatter trajectory: outward and upward fan
          const angle = -Math.PI * 0.5 + ((x / width) - 0.5) * 1.1 + (Math.random() - 0.5) * 0.6;
          const speed = 0.8 + Math.random() * 1.1;

          // 18% matrix glyphs, 82% circular stardust points
          const isChar = Math.random() < 0.18;
          const char = isChar ? MATRIX_GLYPHS[Math.floor(Math.random() * glyphCount)] : null;

          // Warm golden highlight tint for celestial AI builder theme
          let finalR = r;
          let finalG = g;
          let finalB = b;
          if (luma > 130) {
            finalR = Math.min(255, Math.floor(r * 1.1 + 25));
            finalG = Math.min(255, Math.floor(g * 1.05 + 15));
            finalB = Math.max(0, Math.floor(b * 0.82));
          }

          pts.push({
            ox: x,
            oy: y,
            x,
            y,
            z,
            r: finalR,
            g: finalG,
            b: finalB,
            baseAlpha: Math.min(1, (a / 255) * (0.65 + (luma / 255) * 0.35)),
            radius: 1.1 + (luma / 255) * 1.7 * z,
            char,
            angle,
            speed,
            freq: 0.5 + Math.random() * 0.8,
            phase: Math.random() * Math.PI * 2,
            ampX: (4 + Math.random() * 10) * z,
            ampY: (4 + Math.random() * 8) * z,
            dispX: 0,
            dispY: 0
          });
        }
      }
    }

    self.postMessage({
      type: 'SAMPLING_RESULT',
      gen,
      particles: pts
    });
  } catch (err) {
    self.postMessage({
      type: 'SAMPLING_ERROR',
      gen,
      error: err && err.message ? err.message : String(err)
    });
  }
};

