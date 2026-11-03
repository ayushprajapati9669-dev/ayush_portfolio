import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export function CinematicParticleCard({ className = '' }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [currentState, setCurrentState] = useState(0);

  // References for animation loop & cleanup
  const stateRef = useRef({
    currentState: 0,
    morphProgress: 1,
    autoCycleId: null,
    renderer: null,
    scene: null,
    camera: null,
    material: null,
    geometry: null,
    texture: null,
    resizeTimeout: null
  });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return undefined;

    let isMounted = true;
    const state = stateRef.current;

    // Dimensions
    const width = container.clientWidth || 540;
    const height = container.clientHeight || 420;

    // Check WebGL availability
    let gl = null;
    try {
      gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    } catch (_e) {
      gl = null;
    }

    // Text point generator using 2D canvas
    function getTextPoints(text, fontSize, w, h, yOffset = 0, is2D = false) {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d');
      if (!ctx) return [];
      ctx.fillStyle = 'white';
      ctx.font = `800 ${fontSize}px "Inter", "Segoe UI", Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, w / 2, h / 2);

      const imgData = ctx.getImageData(0, 0, w, h).data;
      const points = [];
      const step = is2D ? 3 : 2;

      const textWidth = Math.min(width * 0.82, 420);
      const startX = (width - textWidth) / 2;

      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const index = (y * w + x) * 4;
          if (imgData[index + 3] > 128) {
            if (is2D) {
              const px = startX + (x / w) * textWidth;
              const py = height / 2 + yOffset + ((y / h) - 0.5) * 60;
              points.push({
                x: px,
                y: py,
                baseX: px,
                baseY: py,
                size: Math.random() * 1.5 + 1.1,
                color: Math.random() > 0.45 ? '#e5b869' : Math.random() > 0.2 ? '#f5d19a' : '#ffffff'
              });
            } else {
              const px = (x / w - 0.5) * 32;
              const py = -((y / h - 0.5) * 12) + yOffset;
              const pz = (Math.random() - 0.5) * 1.5;
              points.push({ x: px, y: py, z: pz });
            }
          }
        }
      }
      return points;
    }

    // If WebGL is NOT available, run high-fidelity 2D Canvas Fallback
    if (!gl) {
      const ctx2d = canvas.getContext('2d');
      if (!ctx2d) return undefined;
      canvas.width = width;
      canvas.height = height;

      const target2DA = [
        ...getTextPoints('AYUSH', 68, 512, 140, -32, true),
        ...getTextPoints('PRAJAPATI', 56, 512, 140, 34, true)
      ];
      const target2DB = [
        ...getTextPoints('FULL STACK', 52, 512, 140, -32, true),
        ...getTextPoints('ENGINEER', 64, 512, 140, 34, true)
      ];
      const target2DC = [
        ...getTextPoints('AI / ML', 66, 512, 140, -32, true),
        ...getTextPoints('LEARNER', 66, 512, 140, 34, true)
      ];
      const targets2D = [target2DA, target2DB, target2DC];

      let current2DState = 0;
      let animId2D = null;
      let mouse2D = { x: -1000, y: -1000 };

      const handleMouseMove2D = (e) => {
        const rect = container.getBoundingClientRect();
        mouse2D.x = e.clientX - rect.left;
        mouse2D.y = e.clientY - rect.top;
      };
      const handleMouseLeave2D = () => {
        mouse2D.x = -1000;
        mouse2D.y = -1000;
      };

      container.addEventListener('mousemove', handleMouseMove2D);
      container.addEventListener('mouseleave', handleMouseLeave2D);

      const triggerNext2D = () => {
        if (!isMounted) return;
        current2DState = (current2DState + 1) % 3;
        state.currentState = current2DState;
        setCurrentState(current2DState);
      };
      state.autoCycleId = setInterval(triggerNext2D, 6000);

      let time2D = 0;
      const render2D = () => {
        if (!isMounted) return;
        time2D += 0.03;
        ctx2d.clearRect(0, 0, width, height);

        const activePoints = targets2D[current2DState] || [];
        for (let i = 0; i < activePoints.length; i++) {
          const pt = activePoints[i];
          const waveX = Math.sin(time2D * 0.8 + i * 0.1) * 1.5;
          const waveY = Math.cos(time2D * 1.1 + i * 0.08) * 2;

          let targetX = pt.baseX + waveX;
          let targetY = pt.baseY + waveY;

          // Mouse repel
          const dx = targetX - mouse2D.x;
          const dy = targetY - mouse2D.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 80 && dist > 0) {
            const force = (80 - dist) / 80;
            targetX += (dx / dist) * force * 35;
            targetY += (dy / dist) * force * 35;
          }

          pt.x += (targetX - pt.x) * 0.1;
          pt.y += (targetY - pt.y) * 0.1;

          ctx2d.fillStyle = pt.color;
          ctx2d.beginPath();
          ctx2d.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
          ctx2d.fill();
        }

        animId2D = requestAnimationFrame(render2D);
      };
      render2D();

      return () => {
        isMounted = false;
        clearInterval(state.autoCycleId);
        cancelAnimationFrame(animId2D);
        container.removeEventListener('mousemove', handleMouseMove2D);
        container.removeEventListener('mouseleave', handleMouseLeave2D);
      };
    }

    // --- FULL 3D THREE.JS WEBGL ENGINE ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030303, 0.005);
    state.scene = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 30;
    camera.lookAt(0, 0, 0);
    state.camera = camera;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(width, height, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setClearColor(0x000000, 0);
      state.renderer = renderer;
    } catch (e) {
      console.warn('WebGL init failed:', e);
      return undefined;
    }

    const group = new THREE.Group();
    scene.add(group);

    // 3 Targets:
    const targetA = [
      ...getTextPoints('AYUSH', 145, 1024, 256, 3.4),
      ...getTextPoints('PRAJAPATI', 125, 1024, 256, -4.0)
    ];
    const targetB = [
      ...getTextPoints('FULL STACK', 110, 1024, 256, 3.4),
      ...getTextPoints('ENGINEER', 140, 1024, 256, -4.0)
    ];
    const targetC = [
      ...getTextPoints('AI / ML', 145, 1024, 256, 3.4),
      ...getTextPoints('LEARNER', 145, 1024, 256, -4.0)
    ];
    const allTargets = [
      targetA.length ? targetA : [{ x: 0, y: 0, z: 0 }],
      targetB.length ? targetB : [{ x: 0, y: 0, z: 0 }],
      targetC.length ? targetC : [{ x: 0, y: 0, z: 0 }]
    ];

    const particleCount = 24000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    const targetPositions = allTargets.map((t) => {
      const arr = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        const pt = t[i % t.length];
        arr[i * 3] = pt.x;
        arr[i * 3 + 1] = pt.y;
        arr[i * 3 + 2] = pt.z;
      }
      return arr;
    });

    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const goldColor = new THREE.Color(0xe5b869);
    const whiteColor = new THREE.Color(0xffffff);
    const lightGoldColor = new THREE.Color(0xf5d19a);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = targetPositions[0][i3] + (Math.random() - 0.5) * 6;
      positions[i3 + 1] = targetPositions[0][i3 + 1] + (Math.random() - 0.5) * 6;
      positions[i3 + 2] = targetPositions[0][i3 + 2] + (Math.random() - 0.5) * 6;

      const r = Math.random();
      let color;
      if (r > 0.55) color = whiteColor;
      else if (r > 0.22) color = lightGoldColor;
      else color = goldColor;

      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      sizes[i] = Math.random() * 0.15 + 0.1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    state.geometry = geometry;

    // Create radial soft particle texture
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      const grad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.6, 'rgba(255,255,255,0.8)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 32, 32);
    }
    const particleTexture = new THREE.CanvasTexture(pCanvas);
    state.texture = particleTexture;

    // Shader Material
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: particleTexture },
        uTime: { value: 0 },
        uMorphProgress: { value: 0 }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vDepth;
        uniform float uTime;
        
        void main() {
          float hueShift = sin(uTime * 0.8 + position.x * 0.2) * 0.03;
          vColor = color + vec3(hueShift, hueShift, 0.0);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vDepth = -mvPosition.z;
          gl_PointSize = size * (400.0 / vDepth);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform float uMorphProgress;
        varying vec3 vColor;
        varying float vDepth;
        
        void main() {
          vec4 texColor = texture2D(uTexture, gl_PointCoord);
          float dof = smoothstep(15.0, 25.0, vDepth) * (1.0 - smoothstep(35.0, 45.0, vDepth));
          float trail = mix(0.9, 1.0, uMorphProgress);
          gl_FragColor = vec4(vColor, texColor.a * 1.0 * dof * trail);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    state.material = material;

    const particles = new THREE.Points(geometry, material);
    group.add(particles);

    // Initial immediate render to guarantee visible frame on mount/refresh
    renderer.render(scene, camera);

    // State Cycling
    const triggerNextState = () => {
      if (!isMounted) return;
      state.currentState = (state.currentState + 1) % 3;
      state.morphProgress = 0;
      setCurrentState(state.currentState);
    };

    state.autoCycleId = setInterval(triggerNextState, 6000);

    // Mouse Interaction - Default to center so camera never flies away
    const mouse = new THREE.Vector2(0, 0);
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const mouse3D = new THREE.Vector3(-1000, -1000, 0);
    const targetMouse3D = new THREE.Vector3(-1000, -1000, 0);

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      raycaster.ray.intersectPlane(plane, targetMouse3D);
    };

    const handleMouseLeave = () => {
      targetMouse3D.set(-1000, -1000, 0);
      mouse.set(0, 0);
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    const clock = new THREE.Clock();
    const floatOffsets = new Float32Array(particleCount).map(() => Math.random() * Math.PI * 2);
    const driftOffsets = new Float32Array(particleCount).map(() => Math.random() * 100);

    // Render loop
    renderer.setAnimationLoop(() => {
      if (!isMounted) return;
      const time = clock.getElapsedTime();
      material.uniforms.uTime.value = time;

      if (state.morphProgress < 1) {
        state.morphProgress += 0.03;
        if (state.morphProgress > 1) state.morphProgress = 1;
      }
      material.uniforms.uMorphProgress.value = state.morphProgress;

      mouse3D.lerp(targetMouse3D, 0.1);

      const posAttr = geometry.attributes.position;
      const array = posAttr.array;
      const lerpSpeed = 0.08;
      const repelRadius = 6;
      const repelStrength = 1.5;
      const activeTarget = targetPositions[state.currentState];

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        let tx = activeTarget[i3];
        let ty = activeTarget[i3 + 1];
        let tz = activeTarget[i3 + 2];

        tx += Math.sin(time * 0.8 + floatOffsets[i]) * 0.05;
        ty += Math.cos(time * 1.2 + driftOffsets[i]) * 0.08;
        tz += Math.sin(time * 1.5 + floatOffsets[i] * 2) * 0.1;

        array[i3] += (tx - array[i3]) * lerpSpeed;
        array[i3 + 1] += (ty - array[i3 + 1]) * lerpSpeed;
        array[i3 + 2] += (tz - array[i3 + 2]) * lerpSpeed;

        const dx = array[i3] - mouse3D.x;
        const dy = array[i3 + 1] - mouse3D.y;
        const dz = array[i3 + 2] - mouse3D.z;
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < repelRadius * repelRadius && distSq > 0.01) {
          const dist = Math.sqrt(distSq);
          const force = (repelRadius - dist) / repelRadius;
          array[i3] += (dx / dist) * force * repelStrength;
          array[i3 + 1] += (dy / dist) * force * repelStrength;
          array[i3 + 2] += (dz / dist) * force * repelStrength * 0.5;
        }
      }

      posAttr.needsUpdate = true;

      const targetCamX = mouse.x * 1.0 + Math.sin(time * 0.1) * 0.5;
      const targetCamY = mouse.y * 0.8 + Math.cos(time * 0.08) * 0.3;
      camera.position.x += (targetCamX - camera.position.x) * 0.05;
      camera.position.y += (targetCamY - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    });

    // Handle Resize
    const handleResize = () => {
      clearTimeout(state.resizeTimeout);
      state.resizeTimeout = setTimeout(() => {
        if (!container || !isMounted || !renderer) return;
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        if (newWidth === 0 || newHeight === 0) return;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight, false);
      }, 100);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      clearInterval(state.autoCycleId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);

      if (renderer) {
        renderer.setAnimationLoop(null);
        renderer.dispose();
      }
      if (geometry) geometry.dispose();
      if (material) material.dispose();
      if (particleTexture) particleTexture.dispose();
    };
  }, []);

  const handleClick = () => {
    const state = stateRef.current;
    clearInterval(state.autoCycleId);
    state.currentState = (state.currentState + 1) % 3;
    state.morphProgress = 0;
    setCurrentState(state.currentState);
    state.autoCycleId = setInterval(() => {
      state.currentState = (state.currentState + 1) % 3;
      state.morphProgress = 0;
      setCurrentState(state.currentState);
    }, 6000);
  };

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClick()}
      className={`particle-container group select-none relative w-full h-[400px] sm:h-[440px] flex items-center justify-center cursor-pointer rounded-3xl overflow-hidden border border-white/10 shadow-2xl transition-all duration-500 hover:border-amber-400/40 hover:shadow-amber-500/10 ${className}`}
      style={{
        background: 'radial-gradient(circle at 50% 50%, rgba(229,184,105,0.04) 0%, rgba(10,10,14,0.96) 80%)',
        boxShadow: '0 30px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)'
      }}
      title="Click to morph particle typography"
    >
      {/* Top Left Badge */}
      <div className="absolute top-5 left-5 z-10 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 border border-white/10 backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-[#e5b869] shadow-[0_0_10px_#e5b869] animate-pulse" />
        <span className="font-mono text-[11px] font-bold text-[#e5b869] uppercase tracking-wider">
          Cinematic Particles
        </span>
      </div>

      {/* WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full absolute inset-0 z-0 block bg-transparent"
      />

      {/* State Indicator Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md">
        {[0, 1, 2].map((idx) => (
          <span
            key={idx}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              idx === currentState
                ? 'bg-[#e5b869] shadow-[0_0_10px_#e5b869] scale-125'
                : 'bg-white/25 hover:bg-white/40'
            }`}
          />
        ))}
      </div>

      {/* Click to Morph Hint */}
      <div className="absolute bottom-5 right-5 z-10 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 border border-white/10 backdrop-blur-md font-mono text-[11px] text-zinc-400 pointer-events-none group-hover:text-zinc-200 transition-colors">
        <svg
          className="w-3.5 h-3.5 stroke-[#e5b869]"
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
        <span>Click to morph</span>
      </div>
    </div>
  );
}

export default CinematicParticleCard;
