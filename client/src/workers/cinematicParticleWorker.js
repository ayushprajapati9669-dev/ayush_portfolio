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

    // Color definitions (Gold, White, Light Gold)
    const gold = [0.898, 0.722, 0.412];     // #e5b869
    const white = [1.0, 1.0, 1.0];          // #ffffff
    const lightGold = [0.961, 0.820, 0.604]; // #f5d19a

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = target0[i3] + (Math.random() - 0.5) * 6;
      positions[i3 + 1] = target0[i3 + 1] + (Math.random() - 0.5) * 6;
      positions[i3 + 2] = target0[i3 + 2] + (Math.random() - 0.5) * 6;

      const r = Math.random();
      let c;
      if (r > 0.55) c = white;
      else if (r > 0.22) c = lightGold;
      else c = gold;

      colors[i3] = c[0];
      colors[i3 + 1] = c[1];
      colors[i3 + 2] = c[2];

      sizes[i] = Math.random() * 0.15 + 0.1;
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

