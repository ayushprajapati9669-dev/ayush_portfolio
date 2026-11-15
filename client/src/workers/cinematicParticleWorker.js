/**
 * Cinematic Particle Card Geometry & Target Buffer Worker
 * Generates particle coordinate buffers, 3D target morph positions, colors, and sizes
 * off the main thread, transferring raw Float32Array buffers with zero copying.
 */

self.onmessage = function (e) {
  const data = e.data;
  if (!data || data.type !== 'GENERATE_BUFFERS') return;

  const { particleCount, allTargets, gen } = data;

  if (!particleCount || !allTargets || !Array.isArray(allTargets)) {
    self.postMessage({
      type: 'BUFFERS_ERROR',
      gen,
      error: 'Invalid particleCount or allTargets'
    });
    return;
  }

  try {
    const target0 = new Float32Array(particleCount * 3);
    const target1 = new Float32Array(particleCount * 3);
    const target2 = new Float32Array(particleCount * 3);
    const targets = [target0, target1, target2];

    for (let tIdx = 0; tIdx < 3; tIdx++) {
      const srcTarget = allTargets[tIdx] || [{ x: 0, y: 0, z: 0 }];
      const srcLen = srcTarget.length;
      const dest = targets[tIdx];

      for (let i = 0; i < particleCount; i++) {
        const pt = srcTarget[i % srcLen];
        const i3 = i * 3;
        dest[i3] = pt.x;
        dest[i3 + 1] = pt.y;
        dest[i3 + 2] = pt.z;
      }
    }

    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    // Color definitions (Luxury Rich Gold, Warm Light Gold, White Sparkle)
    const gold = [0.91, 0.74, 0.42];        // #e8bd6b rich champagne gold
    const lightGold = [0.98, 0.88, 0.68];   // #fae1ad warm shimmering gold
    const white = [1.0, 0.98, 0.94];        // warm diamond sparkle

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = target0[i3] + (Math.random() - 0.5) * 6;
      positions[i3 + 1] = target0[i3 + 1] + (Math.random() - 0.5) * 6;
      positions[i3 + 2] = target0[i3 + 2] + (Math.random() - 0.5) * 6;

      const r = Math.random();
      let c;
      if (r > 0.80) c = white;         // 20% sparkling highlights
      else if (r > 0.45) c = lightGold; // 35% warm light gold
      else c = gold;                   // 45% rich champagne gold

      colors[i3] = c[0];
      colors[i3 + 1] = c[1];
      colors[i3 + 2] = c[2];

      sizes[i] = Math.random() * 0.09 + 0.06;
    }

    // Zero-copy transfer of all typed array buffers
    self.postMessage(
      {
        type: 'BUFFERS_RESULT',
        gen,
        target0,
        target1,
        target2,
        positions,
        colors,
        sizes
      },
      [
        target0.buffer,
        target1.buffer,
        target2.buffer,
        positions.buffer,
        colors.buffer,
        sizes.buffer
      ]
    );
  } catch (err) {
    self.postMessage({
      type: 'BUFFERS_ERROR',
      gen,
      error: err && err.message ? err.message : String(err)
    });
  }
};

