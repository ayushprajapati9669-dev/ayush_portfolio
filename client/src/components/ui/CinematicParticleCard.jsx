import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { runOnIdle, cancelIdle } from '../../utils/idle';
import { usePortfolio } from '../../app/providers/ThemeProvider';

export function CinematicParticleCard({ className = '' }) {
  let portfolioContext = null;
  try {
    portfolioContext = usePortfolio();
  } catch (_e) {
    portfolioContext = null;
  }
  const particlesEnabled = portfolioContext?.appState?.settings?.particlesEnabled !== false;
  const particlesEnabledRef = useRef(particlesEnabled);

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
    resizeTimeout: null,
    updateLoop: null
  });

  useEffect(() => {
    particlesEnabledRef.current = particlesEnabled;
    const canvas = canvasRef.current;
    if (!particlesEnabled) {
      const state = stateRef.current;
      if (state.autoCycleId) {
        clearInterval(state.autoCycleId);
        state.autoCycleId = null;
      }
      if (state.renderer) {
        state.renderer.clear();
      } else if (canvas) {
        const ctx2d = canvas.getContext('2d');
        if (ctx2d) ctx2d.clearRect(0, 0, canvas.width, canvas.height);
      }
    } else if (stateRef.current.updateLoop) {
      stateRef.current.updateLoop();
    }
  }, [particlesEnabled]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return undefined;

    // State machine flags
    const isMounted = { current: true };
    const inViewport = { current: true };
    const isTabVisible = { current: typeof document !== 'undefined' ? !document.hidden : true };
    const isLoopRunning = { current: false };

    const state = stateRef.current;
    const width = container.clientWidth || 540;
    const height = container.clientHeight || 420;

    let animId = null;
    let idleInitHandle = null;
    const clock = new THREE.Clock();

    // Check WebGL availability
    let gl = null;
    try {
      gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    } catch (_e) {
      gl = null;
    }

    // Text point generator with bounded scan and aspect-ratio preservation
    function getTextPoints(text, fontSize, w, h, yOffset = 0, is2D = false) {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d');
      if (!ctx) return [];
      ctx.fillStyle = 'white';
      ctx.font = `700 ${fontSize}px "Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if ('letterSpacing' in ctx) {
        ctx.letterSpacing = is2D ? '4px' : '6px';
      }
      ctx.fillText(text, w / 2, h / 2);

      let imgData;
      try {
        imgData = ctx.getImageData(0, 0, w, h).data;
      } catch (_e) {
        return [];
      }

      const points = [];
      const step = is2D ? 4 : 3;
      const textWidth = Math.min(width * 0.82, 420);
      const startX = (width - textWidth) / 2;

      // Maintain exact 1:1 aspect ratio in 3D world space
      const spanY = 6.8;
      const spanX = spanY * (w / h);

      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const index = (y * w + x) * 4;
          if (imgData[index + 3] > 140) {
            if (is2D) {
              const px = startX + (x / w) * textWidth;
              const py = height / 2 + yOffset + ((y / h) - 0.5) * 56;
              points.push({
                x: px,
                y: py,
                baseX: px,
                baseY: py,
                size: Math.random() * 1.2 + 0.9,
                color: Math.random() > 0.45 ? '#e5b869' : Math.random() > 0.2 ? '#f5d19a' : '#ffffff'
              });
            } else {
              const px = (x / w - 0.5) * spanX;
              const py = -((y / h - 0.5) * spanY) + yOffset;
              const pz = (Math.random() - 0.5) * 0.8;
              points.push({ x: px, y: py, z: pz });
            }
          }
        }
      }
      return points;
    }

    // ── 2D Fallback Path ──────────────────────────────────────────────────
    if (!gl) {
      const ctx2d = canvas.getContext('2d');
      if (!ctx2d) return undefined;
      canvas.width = width;
      canvas.height = height;

      const target2DA = [
        ...getTextPoints('AYUSH', 52, 512, 140, -26, true),
        ...getTextPoints('PRAJAPATI', 44, 512, 140, 26, true)
      ];
      const target2DB = [
        ...getTextPoints('FULL STACK', 42, 512, 140, -26, true),
        ...getTextPoints('ENGINEER', 48, 512, 140, 26, true)
      ];
      const target2DC = [
        ...getTextPoints('AI / ML', 50, 512, 140, -26, true),
        ...getTextPoints('LEARNER', 48, 512, 140, 26, true)
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
        if (!isMounted.current) return;
        current2DState = (current2DState + 1) % 3;
        state.currentState = current2DState;
        setCurrentState(current2DState);
      };
      state.autoCycleId = setInterval(triggerNext2D, 6000);

      let time2D = 0;
      const render2D = () => {
        if (!isMounted.current) return;
        if (!particlesEnabledRef.current) {
          ctx2d.clearRect(0, 0, width, height);
          return;
        }
        time2D += 0.03;
        ctx2d.clearRect(0, 0, width, height);

        const activePoints = targets2D[current2DState] || [];
        for (let i = 0; i < activePoints.length; i++) {
          const pt = activePoints[i];
          const waveX = Math.sin(time2D * 0.8 + i * 0.1) * 1.5;
          const waveY = Math.cos(time2D * 1.1 + i * 0.08) * 2;

          let targetX = pt.baseX + waveX;
          let targetY = pt.baseY + waveY;

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
        isMounted.current = false;
        clearInterval(state.autoCycleId);
        cancelAnimationFrame(animId2D);
        container.removeEventListener('mousemove', handleMouseMove2D);
        container.removeEventListener('mouseleave', handleMouseLeave2D);
      };
    }

    // ── FULL 3D THREE.JS WEBGL ENGINE (TIME-SLICED INITIALIZATION) ────────
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

    // Mouse Interaction
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

    container.addEventListener('mousemove', handleMouseMove, { passive: true });
    container.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    // Handle Resize
    const handleResize = () => {
      clearTimeout(state.resizeTimeout);
      state.resizeTimeout = setTimeout(() => {
        if (!container || !isMounted.current || !renderer) return;
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        if (newWidth === 0 || newHeight === 0) return;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight, false);
      }, 100);
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // Initialize Web Worker for background buffer & target generation
    let worker = null;
    try {
      if (typeof Worker !== 'undefined') {
        worker = new Worker(new URL('../../workers/cinematicParticleWorker.js', import.meta.url), { type: 'module' });
      }
    } catch (_workerErr) {
      worker = null;
    }

    const isMobileCard = (typeof window !== 'undefined' && window.innerWidth <= 768) || width <= 480;
    const particleCount = isMobileCard ? 12000 : 24000;
    let geometry = null;
    let material = null;
    let particleTexture = null;
    let targetPositions = [];
    const floatOffsets = new Float32Array(particleCount);
    const driftOffsets = new Float32Array(particleCount);

    for (let k = 0; k < particleCount; k++) {
      floatOffsets[k] = Math.random() * Math.PI * 2;
      driftOffsets[k] = Math.random() * 100;
    }

    // Complete RAF State Machine
    function updateLoopState() {
      const shouldAnimate = particlesEnabledRef.current && isMounted.current && inViewport.current && isTabVisible.current;
      if (shouldAnimate && !isLoopRunning.current && renderer && material) {
        isLoopRunning.current = true;
        clock.start();
        animId = requestAnimationFrame(animate);

        // Resume autoCycle
        if (!state.autoCycleId) {
          state.autoCycleId = setInterval(triggerNextState, 6000);
        }
      } else if (!shouldAnimate && isLoopRunning.current) {
        isLoopRunning.current = false;
        if (animId) {
          cancelAnimationFrame(animId);
          animId = null;
        }
        // Pause autoCycle while offscreen or disabled to avoid wasted background cycles
        if (state.autoCycleId) {
          clearInterval(state.autoCycleId);
          state.autoCycleId = null;
        }
        if (renderer && scene && camera) {
          renderer.clear();
        }
      }
    }
    state.updateLoop = updateLoopState;

    const handleVisibilityChange = () => {
      isTabVisible.current = !document.hidden;
      updateLoopState();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        inViewport.current = entry ? entry.isIntersecting : false;
        updateLoopState();
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    const triggerNextState = () => {
      if (!isMounted.current) return;
      state.currentState = (state.currentState + 1) % 3;
      state.morphProgress = 0;
      setCurrentState(state.currentState);
    };

    const animate = () => {
      if (!isLoopRunning.current || !particlesEnabledRef.current) {
        isLoopRunning.current = false;
        if (animId) {
          cancelAnimationFrame(animId);
          animId = null;
        }
        if (renderer && scene && camera) {
          renderer.clear();
        }
        return;
      }

      const time = clock.getElapsedTime();
      if (material) {
        material.uniforms.uTime.value = time;
        if (state.morphProgress < 1) {
          state.morphProgress += 0.03;
          if (state.morphProgress > 1) state.morphProgress = 1;
        }
        material.uniforms.uMorphProgress.value = state.morphProgress;
      }

      mouse3D.lerp(targetMouse3D, 0.1);

      if (geometry && targetPositions.length > 0) {
        const posAttr = geometry.attributes.position;
        const array = posAttr.array;
        const lerpSpeed = 0.08;
        const repelRadius = 3.2;
        const repelStrength = 0.8;
        const activeTarget = targetPositions[state.currentState];

        if (activeTarget) {
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
        }
      }

      const targetCamX = mouse.x * 1.0 + Math.sin(time * 0.1) * 0.5;
      const targetCamY = mouse.y * 0.8 + Math.cos(time * 0.08) * 0.3;
      camera.position.x += (targetCamX - camera.position.x) * 0.05;
      camera.position.y += (targetCamY - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);

      if (isLoopRunning.current) {
        animId = requestAnimationFrame(animate);
      }
    };

    // ── TIME-SLICED TARGET INITIALIZATION (Eliminates Monolithic 1,869ms Task) ──
    let allTargets = [];

    const step1 = () => {
      if (!isMounted.current) return;
      const targetA = [
        ...getTextPoints('AYUSH', 108, 1024, 256, 2.4),
        ...getTextPoints('PRAJAPATI', 88, 1024, 256, -2.4)
      ];
      allTargets.push(targetA.length ? targetA : [{ x: 0, y: 0, z: 0 }]);
      idleInitHandle = runOnIdle(step2, { timeout: 100, minBudget: 12 });
    };

    const step2 = () => {
      if (!isMounted.current) return;
      const targetB = [
        ...getTextPoints('FULL STACK', 82, 1024, 256, 2.4),
        ...getTextPoints('ENGINEER', 94, 1024, 256, -2.4)
      ];
      allTargets.push(targetB.length ? targetB : [{ x: 0, y: 0, z: 0 }]);
      idleInitHandle = runOnIdle(step3, { timeout: 100, minBudget: 12 });
    };

    const step3 = () => {
      if (!isMounted.current) return;
      const targetC = [
        ...getTextPoints('AI / ML', 96, 1024, 256, 2.4),
        ...getTextPoints('LEARNER', 88, 1024, 256, -2.4)
      ];
      allTargets.push(targetC.length ? targetC : [{ x: 0, y: 0, z: 0 }]);
      idleInitHandle = runOnIdle(step4BuildBuffers, { timeout: 100, minBudget: 12 });
    };

    const finishBuild = (builtTargets, builtGeo) => {
      if (!isMounted.current) return;
      targetPositions = builtTargets;
      geometry = builtGeo;
      state.geometry = geometry;

      // Radial texture
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
      particleTexture = new THREE.CanvasTexture(pCanvas);
      state.texture = particleTexture;

      // Shader Material
      material = new THREE.ShaderMaterial({
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
            gl_PointSize = size * (290.0 / vDepth);
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
            gl_FragColor = vec4(vColor, texColor.a * 0.92 * dof * trail);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      state.material = material;

      const particles = new THREE.Points(geometry, material);
      group.add(particles);

      // Start loop when buffers are complete
      updateLoopState();
    };

    const mainThreadBuild = () => {
      if (!isMounted.current) return;

      const geo = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);

      const targets = allTargets.map((t) => {
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

      const goldColor = new THREE.Color(0xe8bd6b);
      const lightGoldColor = new THREE.Color(0xfae1ad);
      const whiteColor = new THREE.Color(0xfffdf0);

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3] = targets[0][i3] + (Math.random() - 0.5) * 6;
        positions[i3 + 1] = targets[0][i3 + 1] + (Math.random() - 0.5) * 6;
        positions[i3 + 2] = targets[0][i3 + 2] + (Math.random() - 0.5) * 6;

        const r = Math.random();
        let color;
        if (r > 0.80) color = whiteColor;
        else if (r > 0.45) color = lightGoldColor;
        else color = goldColor;

        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;

        sizes[i] = Math.random() * 0.09 + 0.06;
      }

      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      finishBuild(targets, geo);
    };

    const step4BuildBuffers = () => {
      if (!isMounted.current) return;

      if (worker) {
        worker.onmessage = (e) => {
          const res = e.data;
          if (!res || !isMounted.current) return;
          if (res.type === 'BUFFERS_RESULT') {
            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(res.positions, 3));
            geo.setAttribute('color', new THREE.BufferAttribute(res.colors, 3));
            geo.setAttribute('size', new THREE.BufferAttribute(res.sizes, 1));
            finishBuild([res.target0, res.target1, res.target2], geo);
          } else {
            mainThreadBuild();
          }
        };

        worker.onerror = () => {
          mainThreadBuild();
        };

        try {
          worker.postMessage({
            type: 'GENERATE_BUFFERS',
            particleCount,
            allTargets,
            gen: 1
          });
          return;
        } catch (_postErr) {
          mainThreadBuild();
          return;
        }
      }

      mainThreadBuild();
    };

    // Kick off time-sliced pipeline
    idleInitHandle = runOnIdle(step1, { timeout: 100, minBudget: 12 });

    return () => {
      isMounted.current = false;
      isLoopRunning.current = false;
      cancelIdle(idleInitHandle);
      if (worker) {
        worker.terminate();
        worker = null;
      }
      if (animId) cancelAnimationFrame(animId);
      if (state.autoCycleId) clearInterval(state.autoCycleId);

      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      intersectionObserver.disconnect();

      if (renderer) {
        renderer.dispose();
      }
      if (geometry) geometry.dispose();
      if (material) material.dispose();
      if (particleTexture) particleTexture.dispose();
      state.updateLoop = null;
    };
  }, []);

  const handleClick = () => {
    const state = stateRef.current;
    if (state.autoCycleId) clearInterval(state.autoCycleId);
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

      {/* State Switcher Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center px-1.5 py-0.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md">
        {[0, 1, 2].map((idx) => (
          <button
            key={idx}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const state = stateRef.current;
              if (state.autoCycleId) clearInterval(state.autoCycleId);
              state.currentState = idx;
              state.morphProgress = 0;
              setCurrentState(idx);
              state.autoCycleId = setInterval(() => {
                state.currentState = (state.currentState + 1) % 3;
                state.morphProgress = 0;
                setCurrentState(state.currentState);
              }, 6000);
            }}
            aria-label={`Morph to particle scene ${idx + 1}`}
            className="group/btn relative flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] rounded-full cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-400/50"
          >
            <span
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 pointer-events-none ${
                idx === currentState
                  ? 'bg-[#e5b869] shadow-[0_0_10px_#e5b869] scale-125'
                  : 'bg-white/25 group-hover/btn:bg-white/60'
              }`}
            />
          </button>
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
