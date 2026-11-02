import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * InteractiveGlobe3D — Awwwards-Grade 3D Telemetry Earth Globe
 * - High-craft dark obsidian & champagne-gold sphere with lat/long grid & particle landmasses.
 * - Glowing beacon marker at Bhopal, India (23.2599° N, 77.4126° E) with pulsing radio wave rings.
 * - Interactive 3D drag-to-rotate with realistic inertia physics & auto-spin when idle.
 * - Lightweight WebGL implementation with 60FPS performance & clean memory disposal.
 */
export function InteractiveGlobe3D({ className = '' }) {
  const mountRef = useRef(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [currentCity, setCurrentCity] = useState('Bhopal, India');

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 300;

    // 1. Three.js Scene, Camera & Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 240);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
    } catch (e) {
      console.warn('InteractiveGlobe3D: WebGL unavailable', e);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Root Group for Globe
    const globeGroup = new THREE.Group();
    // Tilt globe slightly on axis (approx 23.5 degrees)
    globeGroup.rotation.z = 0.28;
    globeGroup.rotation.x = 0.18;
    scene.add(globeGroup);

    const GLOBE_RADIUS = 76;

    // 2. Base Dark Sphere (Subtle Inner Body)
    const baseSphereGeom = new THREE.SphereGeometry(GLOBE_RADIUS - 0.5, 40, 40);
    const baseSphereMat = new THREE.MeshBasicMaterial({
      color: 0x07090e,
      transparent: true,
      opacity: 0.88
    });
    const baseSphere = new THREE.Mesh(baseSphereGeom, baseSphereMat);
    globeGroup.add(baseSphere);

    // 3. Latitude & Longitude Wireframe Rings
    const ringGroup = new THREE.Group();
    const ringMat = new THREE.LineBasicMaterial({
      color: 0xd4af37,
      transparent: true,
      opacity: 0.14
    });

    // Latitudes
    for (let lat = -60; lat <= 60; lat += 30) {
      const phi = (90 - lat) * (Math.PI / 180);
      const r = GLOBE_RADIUS * Math.sin(phi);
      const y = GLOBE_RADIUS * Math.cos(phi);
      const circleGeom = new THREE.BufferGeometry();
      const pts = [];
      for (let i = 0; i <= 64; i++) {
        const theta = (i / 64) * Math.PI * 2;
        pts.push(new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta)));
      }
      circleGeom.setFromPoints(pts);
      const line = new THREE.Line(circleGeom, ringMat);
      ringGroup.add(line);
    }

    // Longitudes
    for (let lon = 0; lon < 180; lon += 30) {
      const circleGeom = new THREE.BufferGeometry();
      const pts = [];
      for (let i = 0; i <= 64; i++) {
        const theta = (i / 64) * Math.PI * 2;
        const x = GLOBE_RADIUS * Math.cos(theta);
        const y = GLOBE_RADIUS * Math.sin(theta);
        const z = 0;
        pts.push(new THREE.Vector3(x, y, z));
      }
      circleGeom.setFromPoints(pts);
      const line = new THREE.Line(circleGeom, ringMat);
      line.rotation.y = (lon * Math.PI) / 180;
      ringGroup.add(line);
    }
    globeGroup.add(ringGroup);

    // 4. Dot-Matrix Landmass Surface Particles
    // Generate organic distributed points over the globe sphere
    const DOTS_COUNT = 1400;
    const dotPositions = new Float32Array(DOTS_COUNT * 3);
    const dotColors = new Float32Array(DOTS_COUNT * 3);

    const goldColor = new THREE.Color(0xd4af37);
    const dimColor = new THREE.Color(0x3b4252);
    const brightColor = new THREE.Color(0xffe89e);

    for (let i = 0; i < DOTS_COUNT; i++) {
      // Golden Spiral distribution on sphere
      const phi = Math.acos(1 - (2 * (i + 0.5)) / DOTS_COUNT);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      // Density masking to mimic landmass concentration
      const latDeg = 90 - (phi * 180) / Math.PI;
      const lonDeg = ((theta * 180) / Math.PI) % 360;

      // Approximate land-favored sampling
      const isLandCandidate =
        (latDeg > -40 && latDeg < 65) &&
        ((lonDeg > 40 && lonDeg < 140) || // Eurasia / India / Asia
         (lonDeg > 230 && lonDeg < 320) || // Americas
         (lonDeg > 340 || lonDeg < 45));   // Africa / Europe

      const r = GLOBE_RADIUS + (isLandCandidate ? 0.8 : 0.2);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);

      dotPositions[i * 3] = x;
      dotPositions[i * 3 + 1] = y;
      dotPositions[i * 3 + 2] = z;

      const chosenColor = isLandCandidate
        ? (Math.random() > 0.4 ? goldColor : brightColor)
        : dimColor;

      dotColors[i * 3] = chosenColor.r;
      dotColors[i * 3 + 1] = chosenColor.g;
      dotColors[i * 3 + 2] = chosenColor.b;
    }

    const dotGeom = new THREE.BufferGeometry();
    dotGeom.setAttribute('position', new THREE.BufferAttribute(dotPositions, 3));
    dotGeom.setAttribute('color', new THREE.BufferAttribute(dotColors, 3));

    const dotMat = new THREE.PointsMaterial({
      size: 2.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    const dotMesh = new THREE.Points(dotGeom, dotMat);
    globeGroup.add(dotMesh);

    // 5. Pin Coordinates Converter (lat/lon to 3D Cartesian)
    const latLonToVector3 = (lat, lon, radius = GLOBE_RADIUS) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      return new THREE.Vector3(x, y, z);
    };

    // Bhopal, India Coordinates: 23.2599° N, 77.4126° E
    const bhopalPos = latLonToVector3(23.2599, 77.4126, GLOBE_RADIUS + 1.2);

    // 6. Glowing Beacon Pin at Bhopal
    const pinGroup = new THREE.Group();
    pinGroup.position.copy(bhopalPos);

    // Beacon Core Sphere
    const beaconGeom = new THREE.SphereGeometry(2.4, 16, 16);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.95
    });
    const beaconCore = new THREE.Mesh(beaconGeom, beaconMat);
    pinGroup.add(beaconCore);

    // Pulsing Waves (Ripples)
    const rippleCount = 2;
    const ripples = [];
    for (let r = 0; r < rippleCount; r++) {
      const ripGeom = new THREE.RingGeometry(2.8, 3.6, 32);
      const ripMat = new THREE.MeshBasicMaterial({
        color: 0xffd700,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
      });
      const ripMesh = new THREE.Mesh(ripGeom, ripMat);
      ripMesh.lookAt(bhopalPos.clone().multiplyScalar(2));
      pinGroup.add(ripMesh);
      ripples.push({ mesh: ripMesh, offset: r * 0.5 });
    }

    globeGroup.add(pinGroup);

    // 7. Telemetry Arcs (Connecting Bhopal to global engineering hubs: London, SF, Tokyo, Singapore)
    const remoteHubs = [
      { name: 'San Francisco, USA', lat: 37.7749, lon: -122.4194 },
      { name: 'London, UK', lat: 51.5074, lon: -0.1278 },
      { name: 'Singapore', lat: 1.3521, lon: 103.8198 },
      { name: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503 }
    ];

    const createArcCurve = (v1, v2) => {
      const distance = v1.distanceTo(v2);
      const mid = v1.clone().add(v2).multiplyScalar(0.5);
      const midLength = mid.length();
      mid.normalize().multiplyScalar(midLength + distance * 0.35);

      const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
      const points = curve.getPoints(40);
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: 0xd4af37,
        transparent: true,
        opacity: 0.38
      });
      return new THREE.Line(geom, mat);
    };

    remoteHubs.forEach((hub) => {
      const hubPos = latLonToVector3(hub.lat, hub.lon, GLOBE_RADIUS + 0.8);
      const arc = createArcCurve(bhopalPos, hubPos);
      globeGroup.add(arc);

      // Hub pin
      const hGeom = new THREE.SphereGeometry(1.2, 8, 8);
      const hMat = new THREE.MeshBasicMaterial({ color: 0x61dafb, transparent: true, opacity: 0.8 });
      const hMesh = new THREE.Mesh(hGeom, hMat);
      hMesh.position.copy(hubPos);
      globeGroup.add(hMesh);
    });

    // 8. Outer Atmospheric Glow Halo
    const haloGeom = new THREE.SphereGeometry(GLOBE_RADIUS + 9, 32, 32);
    const haloMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.8);
          gl_FragColor = vec4(0.83, 0.68, 0.21, 1.0) * intensity * 0.65;
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });
    const halo = new THREE.Mesh(haloGeom, haloMat);
    scene.add(halo);

    // Initial orientation: Rotate globe so India faces forward
    globeGroup.rotation.y = -1.6;

    // 9. Interactive Drag & Spin Physics
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let velocityX = 0;
    let velocityY = 0;

    const onMouseDown = (e) => {
      isDragging = true;
      setIsInteracting(true);
      prevMouseX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      prevMouseY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

      const deltaX = clientX - prevMouseX;
      const deltaY = clientY - prevMouseY;

      velocityX = deltaX * 0.005;
      velocityY = deltaY * 0.005;

      globeGroup.rotation.y += velocityX;
      globeGroup.rotation.x = Math.max(-0.6, Math.min(0.6, globeGroup.rotation.x + velocityY));

      prevMouseX = clientX;
      prevMouseY = clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
      setTimeout(() => setIsInteracting(false), 800);
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    domEl.addEventListener('touchstart', onMouseDown, { passive: true });
    window.addEventListener('touchmove', onMouseMove, { passive: true });
    window.addEventListener('touchend', onMouseUp);

    // 10. Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Ripple wave pulse animation
      ripples.forEach((rip) => {
        const t = (elapsed * 1.8 + rip.offset) % 1.0;
        const scale = 1.0 + t * 2.8;
        rip.mesh.scale.set(scale, scale, scale);
        rip.mesh.material.opacity = Math.max(0, 0.8 * (1.0 - t));
      });

      // Beacon core subtle pulsing scale
      const pulseScale = 1.0 + Math.sin(elapsed * 4.0) * 0.15;
      beaconCore.scale.set(pulseScale, pulseScale, pulseScale);

      // Inertia & Damping
      if (!isDragging) {
        if (!prefersReducedMotion) {
          // Slow graceful auto-rotation
          globeGroup.rotation.y += 0.0028;
        }

        // Apply decay to drag velocity
        velocityX *= 0.93;
        velocityY *= 0.93;
        globeGroup.rotation.y += velocityX;
        globeGroup.rotation.x = Math.max(-0.6, Math.min(0.6, globeGroup.rotation.x + velocityY));
      }

      renderer.render(scene, camera);
    };

    animate();

    // 11. Handle Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };

    window.addEventListener('resize', handleResize);

    // 12. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      domEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domEl.removeEventListener('touchstart', onMouseDown);
      window.removeEventListener('touchmove', onMouseMove);
      window.removeEventListener('touchend', onMouseUp);

      // Dispose Three.js objects
      baseSphereGeom.dispose();
      baseSphereMat.dispose();
      ringMat.dispose();
      dotGeom.dispose();
      dotMat.dispose();
      beaconGeom.dispose();
      beaconMat.dispose();
      haloGeom.dispose();
      haloMat.dispose();
      renderer.dispose();

      if (container && domEl.parentNode === container) {
        container.removeChild(domEl);
      }
    };
  }, []);

  return (
    <div className={`relative w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#10121a]/90 to-[#07090e]/95 p-4 shadow-2xl backdrop-blur-xl ${className}`}>
      {/* Top Telemetry Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="font-mono text-[10px] tracking-widest text-emerald-400 uppercase font-semibold">
            Global Telemetry Node
          </span>
        </div>
        <span className="font-mono text-[10px] text-slate-400">
          23.25°N · 77.41°E
        </span>
      </div>

      {/* 3D Canvas Mounting Stage */}
      <div
        ref={mountRef}
        className="relative mx-auto my-2 h-[260px] w-full cursor-grab active:cursor-grabbing select-none"
        title="Click and drag to spin 3D globe"
      />

      {/* Interactive Bottom Overlay */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
        <div className="flex items-center gap-1.5 text-stone-300 font-mono">
          <i className="fa-solid fa-location-dot text-amber-400 text-xs" />
          <span className="font-semibold text-white">Base:</span>
          <span>Bhopal, India (UTC+5:30)</span>
        </div>
        <div className="font-mono text-[10px] text-amber-300/80 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
          {isInteracting ? 'Free Orbit Mode' : 'Drag to Orbit'}
        </div>
      </div>
    </div>
  );
}

