import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

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

    // Harmonic multi-octave rolling terrain waves
    float wave1 = sin(pos.x * 0.18 + uTime * 1.3) * cos(pos.y * 0.16 + uTime * 1.0) * 2.8;
    float wave2 = sin(pos.x * 0.38 - uTime * 1.7 + pos.y * 0.22) * 1.2;
    float wave3 = cos(length(pos.xy) * 0.26 - uTime * 2.0) * 0.85;
    float wave4 = sin(pos.x * 0.72 + uTime * 2.4) * 0.35;
    float elevation = wave1 + wave2 + wave3 + wave4;

    // Fluid interactive mouse ripple displacement
    float distToMouse = distance(pos.xy, uMouse);
    float mouseInfluence = smoothstep(16.0, 0.0, distToMouse);
    float ripple = sin(distToMouse * 2.0 - uTime * 4.2) * (1.6 + uMouseSpeed * 0.5);
    elevation += mouseInfluence * ripple;

    pos.z += elevation;

    vElevation = elevation;
    vPosition = pos;
    vDistToMouse = distToMouse;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Dynamic point size scaling with depth and mouse proximity
    float pSize = (32.0 / -mvPosition.z) * (1.0 + mouseInfluence * 0.8);
    gl_PointSize = clamp(pSize, 2.0, 16.0);
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
      // Anti-aliased circular particle with glowing core
      float dist = distance(gl_PointCoord, vec2(0.5));
      if (dist > 0.5) discard;
      alpha = smoothstep(0.5, 0.08, dist);
    }

    // Normalized elevation mapping: -3.5 to +4.5
    float normElevation = clamp((vElevation + 3.2) / 6.8, 0.0, 1.0);

    // Multi-stage luxury metallic gold color transition
    vec3 color = mix(uColorAbyss, uColorGold, smoothstep(0.08, 0.55, normElevation));
    color = mix(color, uColorCrest, smoothstep(0.55, 0.95, normElevation));

    // Interactive radiant cursor aura
    float mouseGlow = smoothstep(12.0, 0.0, vDistToMouse);
    color += vec3(1.0, 0.88, 0.45) * mouseGlow * 0.65;

    // Peak sparkle highlight
    float crestSparkle = smoothstep(0.78, 1.0, normElevation) * 0.35;
    color += vec3(crestSparkle);

    // Distance vignette fade along edges
    float edgeFade = smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.88, vUv.x) *
                     smoothstep(0.0, 0.12, vUv.y) * smoothstep(1.0, 0.88, vUv.y);

    float finalAlpha = (uIsPoints > 0.5 ? alpha * 0.92 : 0.45 + normElevation * 0.45) * edgeFade;

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

    // 1. Scene & Cinematic Camera Setup
    const scene = new THREE.Scene();
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 360;

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100);
    camera.position.set(0, 9.5, 20.5);
    camera.lookAt(0, 0, 0);

    // 2. High-Performance WebGL Renderer with graceful fallback
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
    } catch (e) {
      console.warn('InteractiveMeshWave: WebGL unavailable, falling back cleanly:', e);
      return;
    }
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // 3. Dense 3D Plane Geometry
    // 84 cols x 56 rows provides lush, silky liquid contours
    const geometry = new THREE.PlaneGeometry(38, 25, 84, 56);

    // 4. Uniforms
    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(-999, -999) },
      uMouseSpeed: { value: 0 },
      uColorAbyss: { value: new THREE.Color('#141006') },  // deep dark obsidian gold
      uColorGold:  { value: new THREE.Color('#d4af37') },  // vibrant 24k metallic gold
      uColorCrest: { value: new THREE.Color('#fff9e6') },  // luminous diamond white crest
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
    wireframeMesh.position.y = -1.2;
    scene.add(wireframeMesh);

    // Layer 2: Glowing Crest Star Particles on the exact same geometry vertices
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
    pointsMesh.position.y = -1.2;
    scene.add(pointsMesh);

    // 5. Mouse Interaction Tracking with Raycaster plane
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const raycaster = new THREE.Raycaster();
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
      mouseSpeed = Math.min(Math.sqrt(dx * dx + dy * dy) * 0.04, 3.5);
      prevMouseX = clientX;
      prevMouseY = clientY;

      // Project onto the plane
      targetMousePos.x = mouseNorm.x * 16.0;
      targetMousePos.y = mouseNorm.y * 12.0;
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
      const nw = container.clientWidth || 600;
      const nh = container.clientHeight || 360;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 7. Visibility Observer (Pause when off-screen)
    let inViewport = true;
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        inViewport = entry.isIntersecting;
        setIsVisible(inViewport);
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    // 8. Animation Render Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!inViewport) return;

      const time = prefersReducedMotion ? 0 : clock.getElapsedTime();

      wireframeMaterial.uniforms.uTime.value = time;
      pointsMaterial.uniforms.uTime.value = time;

      // Smooth mouse interpolation
      wireframeMaterial.uniforms.uMouse.value.lerp(targetMousePos, 0.14);
      pointsMaterial.uniforms.uMouse.value.lerp(targetMousePos, 0.14);

      mouseSpeed = THREE.MathUtils.lerp(mouseSpeed, 0, 0.07);
      wireframeMaterial.uniforms.uMouseSpeed.value = mouseSpeed;
      pointsMaterial.uniforms.uMouseSpeed.value = mouseSpeed;

      // Subtle dynamic camera drift
      if (!prefersReducedMotion) {
        wireframeMesh.rotation.z = Math.sin(time * 0.2) * 0.035;
        pointsMesh.rotation.z = Math.sin(time * 0.2) * 0.035;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 9. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
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
      className={`relative w-full h-full min-h-[300px] overflow-hidden select-none pointer-events-auto ${className}`}
      aria-hidden="true"
    />
  );
}
