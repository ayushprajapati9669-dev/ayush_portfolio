import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * InteractiveMeshWave — Top 0.001% Refined 3D Topographical Terrain Engine
 * User-friendly, elegant quiet-luxury aesthetic:
 *  - Harmonic, gentle rolling wave displacement (subtle elevation, zero jarring peaks).
 *  - Refined champagne-gold and obsidian palette (subtle, non-garish, non-neon).
 *  - Fluid interactive mouse ripple with graceful dampening.
 *  - 60FPS WebGL performance with automatic lifecycle disposal.
 */

const waveVertexShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uMouseSpeed;
  
  varying vec3 vPosition;
  varying float vElevation;
  varying float vDistToMouse;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // Harmonic, serene rolling terrain waves (gentle natural elevation)
    float wave1 = sin(pos.x * 0.15 + uTime * 1.0) * cos(pos.y * 0.14 + uTime * 0.8) * 1.45;
    float wave2 = sin(pos.x * 0.30 - uTime * 1.3 + pos.y * 0.18) * 0.65;
    float wave3 = cos(length(pos.xy) * 0.20 - uTime * 1.5) * 0.35;
    float elevation = wave1 + wave2 + wave3;

    // Fluid interactive mouse ripple displacement
    float distToMouse = distance(pos.xy, uMouse);
    float mouseInfluence = smoothstep(14.0, 0.0, distToMouse);
    float ripple = sin(distToMouse * 2.2 - uTime * 3.6) * (1.1 + uMouseSpeed * 0.4);
    elevation += mouseInfluence * ripple;

    pos.z += elevation;

    vElevation = elevation;
    vPosition = pos;
    vDistToMouse = distToMouse;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Dynamic point size scaling with depth and mouse proximity
    float pSize = (24.0 / -mvPosition.z) * (1.0 + mouseInfluence * 0.6);
    gl_PointSize = clamp(pSize, 1.8, 8.0);
  }
`;

const waveFragmentShader = `
  uniform vec3 uColorAbyss;
  uniform vec3 uColorGold;
  uniform vec3 uColorCrest;
  uniform float uIsPoints;
  
  varying vec3 vPosition;
  varying float vElevation;
  varying float vDistToMouse;
  varying vec2 vUv;

  void main() {
    float alpha = 1.0;

    if (uIsPoints > 0.5) {
      // Soft circular particle with anti-aliasing
      float dist = distance(gl_PointCoord, vec2(0.5));
      if (dist > 0.5) discard;
      alpha = smoothstep(0.5, 0.12, dist);
    }

    // Normalized elevation mapping: gentle gradient
    float normElevation = clamp((vElevation + 2.2) / 4.4, 0.0, 1.0);

    // Subtle, luxurious metallic gold transition (refined, non-blinding)
    vec3 color = mix(uColorAbyss, uColorGold, smoothstep(0.12, 0.60, normElevation));
    color = mix(color, uColorCrest, smoothstep(0.60, 0.98, normElevation));

    // Interactive radiant cursor aura (gentle warm glow)
    float mouseGlow = smoothstep(10.0, 0.0, vDistToMouse);
    color += vec3(0.85, 0.72, 0.4) * mouseGlow * 0.45;

    // Edge distance vignette fade
    float edgeFade = smoothstep(0.0, 0.14, vUv.x) * smoothstep(1.0, 0.86, vUv.x) *
                     smoothstep(0.0, 0.14, vUv.y) * smoothstep(1.0, 0.86, vUv.y);

    float finalAlpha = (uIsPoints > 0.5 ? alpha * 0.85 : 0.35 + normElevation * 0.35) * edgeFade;

    gl_FragColor = vec4(color, finalAlpha);
  }
`;

export function InteractiveMeshWave({ className = '' }) {
  const mountRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Respect user motion preference
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Scene & Perspective Camera
    const scene = new THREE.Scene();
    const width = container.clientWidth || 560;
    const height = container.clientHeight || 280;

    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 100);
    camera.position.set(0, 8.5, 20.0);
    camera.lookAt(0, 0, 0);

    // 2. High-Performance WebGL Renderer
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
    } catch (e) {
      console.warn('InteractiveMeshWave: WebGL unavailable:', e);
      return;
    }
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // 3. Dense 3D Plane Geometry (Lush topographical wireframe)
    const geometry = new THREE.PlaneGeometry(36, 22, 76, 48);

    // 4. Uniforms: Sophisticated quiet luxury palette
    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(-999, -999) },
      uMouseSpeed: { value: 0 },
      uColorAbyss: { value: new THREE.Color('#090a0f') },  // deep obsidian-slate
      uColorGold:  { value: new THREE.Color('#d4af37') },  // classic 24k champagne gold
      uColorCrest: { value: new THREE.Color('#f5e6b3') },  // soft warm ivory-gold crest
      uIsPoints:   { value: 0.0 }
    };

    // Layer 1: Luminous Wireframe Terrain Mesh
    const wireframeMaterial = new THREE.ShaderMaterial({
      vertexShader: waveVertexShader,
      fragmentShader: waveFragmentShader,
      transparent: true,
      wireframe: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        ...uniforms,
        uIsPoints: { value: 0.0 }
      }
    });

    const wireframeMesh = new THREE.Mesh(geometry, wireframeMaterial);
    wireframeMesh.rotation.x = -Math.PI * 0.44;
    wireframeMesh.position.y = -1.0;
    scene.add(wireframeMesh);

    // Layer 2: Subtle Crest Star Particles on the exact same geometry vertices
    const pointsMaterial = new THREE.ShaderMaterial({
      vertexShader: waveVertexShader,
      fragmentShader: waveFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        ...uniforms,
        uIsPoints: { value: 1.0 }
      }
    });

    const pointsMesh = new THREE.Points(geometry, pointsMaterial);
    pointsMesh.rotation.x = -Math.PI * 0.44;
    pointsMesh.position.y = -1.0;
    scene.add(pointsMesh);

    // 5. Mouse Interaction Tracking
    const mouseNorm = new THREE.Vector2(-999, -999);
    const targetMousePos = new THREE.Vector2(-999, -999);
    let prevMouseX = 0;
    let prevMouseY = 0;
    let mouseSpeed = 0;

    const handlePointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      mouseNorm.x = (clientX / rect.width) * 2 - 1;
      mouseNorm.y = -(clientY / rect.height) * 2 + 1;

      const dx = clientX - prevMouseX;
      const dy = clientY - prevMouseY;
      mouseSpeed = Math.min(Math.sqrt(dx * dx + dy * dy) * 0.03, 2.5);
      prevMouseX = clientX;
      prevMouseY = clientY;

      targetMousePos.x = mouseNorm.x * 15.0;
      targetMousePos.y = mouseNorm.y * 11.0;
    };

    const handlePointerLeave = () => {
      targetMousePos.set(-999, -999);
      mouseSpeed = 0;
    };

    container.addEventListener('pointermove', handlePointerMove, { passive: true });
    container.addEventListener('pointerleave', handlePointerLeave);

    // 6. Resize Observer
    const handleResize = () => {
      if (!container) return;
      const nw = container.clientWidth || 560;
      const nh = container.clientHeight || 280;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 7. Visibility Observer
    let inViewport = true;
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        inViewport = entry.isIntersecting;
        setIsVisible(inViewport);
      },
      { threshold: 0.1 }
    );
    intersectionObserver.observe(container);

    // 8. Animation Loop
    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (!inViewport) return;

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth mouse lerping
      uniforms.uMouse.value.lerp(targetMousePos, 0.08);
      uniforms.uMouseSpeed.value += (mouseSpeed - uniforms.uMouseSpeed.value) * 0.08;

      if (!prefersReducedMotion) {
        uniforms.uTime.value = time * 0.55; // gentle, elegant speed
        wireframeMesh.rotation.z = Math.sin(time * 0.08) * 0.03;
        pointsMesh.rotation.z = wireframeMesh.rotation.z;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 9. Memory Cleanup
    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerleave', handlePointerLeave);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      geometry.dispose();
      wireframeMaterial.dispose();
      pointsMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full cursor-grab active:cursor-grabbing select-none ${className}`}
      aria-label="Interactive 3D Terrain Wave Displacement"
      role="img"
    />
  );
}

export default InteractiveMeshWave;
