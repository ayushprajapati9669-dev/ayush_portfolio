import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { runOnIdle, cancelIdle } from '../../utils/idle';

const cosmosVertexShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uScroll;
  
  attribute float aScale;
  attribute float aRandom;
  attribute vec3 aVelocity;

  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    vec3 pos = position;

    // Slow orbital drift
    float angle = uTime * (0.05 + aRandom * 0.05);
    float cosA = cos(angle);
    float sinA = sin(angle);
    pos.xz = vec2(pos.x * cosA - pos.z * sinA, pos.x * sinA + pos.z * cosA);

    // Subtle vertical breathing
    pos.y += sin(uTime * 0.8 + aRandom * 6.28) * 0.8;

    // Mouse repulsion in 3D
    float distToMouse = distance(pos.xy, uMouse * 16.0);
    float pushFactor = smoothstep(12.0, 0.0, distToMouse);
    pos.xy += normalize(pos.xy - uMouse * 16.0 + vec2(0.0001)) * pushFactor * 3.5;

    // Parallax scroll shift
    pos.y += uScroll * 4.0;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Attenuation based on distance
    float pSize = (aScale * 38.0) / -mvPosition.z;
    gl_PointSize = clamp(pSize, 1.5, 32.0);

    // Alpha based on depth and distance
    float depthAlpha = smoothstep(-60.0, -10.0, mvPosition.z);
    vAlpha = (0.25 + aRandom * 0.45) * depthAlpha;

    // Warm alabaster cream with subtle amber tint
    vColor = mix(vec3(0.96, 0.94, 0.91), vec3(1.0, 0.55, 0.35), aRandom * 0.4);
  }
`;

const cosmosFragmentShader = `
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    float dist = distance(gl_PointCoord, vec2(0.5));
    if (dist > 0.5) discard;
    float core = smoothstep(0.5, 0.05, dist);
    gl_FragColor = vec4(vColor, core * vAlpha);
  }
`;

export function HeroCosmosCanvas({ className = '' }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // State machine flags
    const isMounted = { current: true };
    const inViewport = { current: true };
    const isTabVisible = { current: typeof document !== 'undefined' ? !document.hidden : true };
    const isLoopRunning = { current: false };

    let renderer = null;
    let scene = null;
    let camera = null;
    let geometry = null;
    let material = null;
    let particles = null;
    let animationFrameId = null;
    let clock = new THREE.Clock();
    let resizeObserver = null;
    let intersectionObserver = null;
    const targetMouse = new THREE.Vector2(0, 0);

    const handlePointerMove = (e) => {
      targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const handleVisibilityChange = () => {
      isTabVisible.current = !document.hidden;
      updateLoopState();
    };

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const nw = container.clientWidth || window.innerWidth;
      const nh = container.clientHeight || 700;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    function updateLoopState() {
      const shouldAnimate = isMounted.current && inViewport.current && isTabVisible.current;
      if (shouldAnimate && !isLoopRunning.current && renderer && material) {
        isLoopRunning.current = true;
        clock.start();
        animationFrameId = requestAnimationFrame(animate);
      } else if (!shouldAnimate && isLoopRunning.current) {
        isLoopRunning.current = false;
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      }
    }

    const animate = () => {
      if (!isLoopRunning.current) return;

      const time = prefersReducedMotion ? 0 : clock.getElapsedTime();
      if (material) {
        material.uniforms.uTime.value = time;
        material.uniforms.uMouse.value.lerp(targetMouse, 0.08);
        material.uniforms.uScroll.value = window.scrollY / window.innerHeight;
      }

      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }

      if (isLoopRunning.current) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    // Staggered initialization on idle: allows initial DOM paint and hero text to settle first
    const idleHandle = runOnIdle(() => {
      if (!isMounted.current || !container) return;

      scene = new THREE.Scene();
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || 700;

      camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
      camera.position.set(0, 0, 32);

      try {
        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance'
        });
      } catch (e) {
        console.warn('HeroCosmosCanvas: WebGL unavailable, falling back cleanly:', e);
        return;
      }

      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);

      const count = 750;
      const positions = new Float32Array(count * 3);
      const scales = new Float32Array(count);
      const randoms = new Float32Array(count);
      const velocities = new Float32Array(count * 3);

      for (let i = 0; i < count; i++) {
        const radius = 6 + Math.pow(Math.random(), 1.5) * 32;
        const theta = Math.random() * Math.PI * 2;
        const y = (Math.random() - 0.5) * 34;

        positions[i * 3] = Math.cos(theta) * radius;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = Math.sin(theta) * (radius * 0.6) - 5;

        scales[i] = 0.6 + Math.random() * 1.8;
        randoms[i] = Math.random();
        velocities[i * 3] = (Math.random() - 0.5) * 0.02;
        velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
      }

      geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
      geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));
      geometry.setAttribute('aVelocity', new THREE.BufferAttribute(velocities, 3));

      material = new THREE.ShaderMaterial({
        vertexShader: cosmosVertexShader,
        fragmentShader: cosmosFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(0, 0) },
          uScroll: { value: 0 }
        }
      });

      particles = new THREE.Points(geometry, material);
      scene.add(particles);

      window.addEventListener('pointermove', handlePointerMove, { passive: true });
      document.addEventListener('visibilitychange', handleVisibilityChange);

      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(container);

      intersectionObserver = new IntersectionObserver(
        ([entry]) => {
          inViewport.current = entry ? entry.isIntersecting : false;
          updateLoopState();
        },
        { threshold: 0.02 }
      );
      intersectionObserver.observe(container);

      // Start animation loop cleanly
      updateLoopState();
    }, { timeout: 2500, minBudget: 12 });

    return () => {
      isMounted.current = false;
      isLoopRunning.current = false;
      cancelIdle(idleHandle);

      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (resizeObserver) resizeObserver.disconnect();
      if (intersectionObserver) intersectionObserver.disconnect();

      if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      if (geometry) geometry.dispose();
      if (material) material.dispose();
      if (renderer) renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none z-0 transition-opacity duration-700 ease-out ${className}`}
      aria-hidden="true"
    />
  );
}

export default HeroCosmosCanvas;
