import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const vertexShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uMouseSpeed;
  
  varying vec3 vPosition;
  varying float vElevation;
  varying float vDistToMouse;

  void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    
    // Multi-frequency undulating wave
    float wave1 = sin(modelPosition.x * 0.16 + uTime * 0.85) * cos(modelPosition.z * 0.14 + uTime * 0.7) * 1.6;
    float wave2 = sin(modelPosition.x * 0.32 - uTime * 1.1) * 0.5;
    float wave3 = cos(modelPosition.z * 0.28 + uTime * 0.9) * 0.4;
    
    float elevation = wave1 + wave2 + wave3;
    
    // Interactive mouse displacement ripple
    float dist = distance(modelPosition.xz, uMouse);
    float mouseInfluence = smoothstep(14.0, 0.0, dist);
    elevation += mouseInfluence * sin(dist * 1.8 - uTime * 3.5) * (1.2 + uMouseSpeed * 0.5);

    modelPosition.y += elevation;
    
    vElevation = elevation;
    vPosition = modelPosition.xyz;
    vDistToMouse = dist;

    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;

    // Attenuated point size with dynamic hover scaling
    gl_PointSize = (22.0 / -viewPosition.z) * (1.0 + mouseInfluence * 0.7);
  }
`;

const fragmentShader = `
  uniform vec3 uColorLow;
  uniform vec3 uColorMid;
  uniform vec3 uColorHigh;
  
  varying vec3 vPosition;
  varying float vElevation;
  varying float vDistToMouse;

  void main() {
    // Soft anti-aliased circular particle dot
    float dist = distance(gl_PointCoord, vec2(0.5));
    if (dist > 0.5) discard;
    float alpha = smoothstep(0.5, 0.12, dist);

    // Elevation gradient: deep stone -> warm amber -> alabaster cream
    float normElevation = clamp((vElevation + 1.8) / 3.6, 0.0, 1.0);
    vec3 color = mix(uColorLow, uColorMid, smoothstep(0.0, 0.5, normElevation));
    color = mix(color, uColorHigh, smoothstep(0.5, 1.0, normElevation));

    // Subtle highlight near cursor
    float mouseGlow = smoothstep(10.0, 0.0, vDistToMouse) * 0.35;
    color += vec3(mouseGlow * 0.9, mouseGlow * 0.55, mouseGlow * 0.3);

    gl_FragColor = vec4(color, alpha * 0.72);
  }
`;

export function InteractiveMeshWave({ className = '' }) {
  const mountRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Respect reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 360;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 14, 28);
    camera.lookAt(0, 0, 0);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // 3. 3D Grid Geometry
    const cols = 56;
    const rows = 42;
    const spacing = 0.65;
    const count = cols * rows;

    const positions = new Float32Array(count * 3);
    let idx = 0;
    const xOffset = ((cols - 1) * spacing) / 2;
    const zOffset = ((rows - 1) * spacing) / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        positions[idx * 3] = c * spacing - xOffset;
        positions[idx * 3 + 1] = 0;
        positions[idx * 3 + 2] = r * spacing - zOffset;
        idx++;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // 4. Custom GLSL Shader Material
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(-999, -999) },
        uMouseSpeed: { value: 0 },
        uColorLow: { value: new THREE.Color('#383531') },      // dim stone
        uColorMid: { value: new THREE.Color('#9a968f') },      // warm stone
        uColorHigh: { value: new THREE.Color('#f4f1ec') }      // alabaster cream
      }
    });

    const points = new THREE.Points(geometry, material);
    points.rotation.x = -Math.PI * 0.08;
    scene.add(points);

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

      // Track speed
      const dx = clientX - prevMouseX;
      const dy = clientY - prevMouseY;
      mouseSpeed = Math.min(Math.sqrt(dx * dx + dy * dy) * 0.05, 3.0);
      prevMouseX = clientX;
      prevMouseY = clientY;

      raycaster.setFromCamera(mouseNorm, camera);
      const intersectionPoint = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(plane, intersectionPoint)) {
        targetMousePos.x = intersectionPoint.x;
        targetMousePos.y = intersectionPoint.z;
      }
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

      const delta = clock.getDelta();
      const time = prefersReducedMotion ? 0 : clock.getElapsedTime();

      material.uniforms.uTime.value = time;

      // Smooth mouse interpolation
      material.uniforms.uMouse.value.lerp(targetMousePos, 0.12);
      mouseSpeed = THREE.MathUtils.lerp(mouseSpeed, 0, 0.08);
      material.uniforms.uMouseSpeed.value = mouseSpeed;

      // Gentle auto-rotation drift
      if (!prefersReducedMotion) {
        points.rotation.y = Math.sin(time * 0.15) * 0.05;
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
      material.dispose();
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

