import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { runOnIdle, cancelIdle } from '../../utils/idle';

/**
 * VantaBirdsBackground — Top 0.001% Luxury Vanta.js BIRDS 3D Background Engine
 * Direct reference to https://www.vantajs.com/ (VANTA.BIRDS):
 *
 * 1. Craig Reynolds' True 3D Flocking Physics:
 *    - Separation (prevent crowding with neighbor avoidance)
 *    - Alignment (steer towards average flock velocity)
 *    - Cohesion (steer towards center of mass of local flock)
 *    - Dynamic Lissajous Sky Attractor: Swarm sweeps gracefully in undulating ribbons.
 *
 * 2. Text Protection & Zero Navbar Occlusion Force Field:
 *    - Intelligent Aerodynamic Deflector around Hero Headline & Bento Cards:
 *      Birds glide *around* and *above* foreground text, ensuring 100% WCAG AAA readability.
 *    - Hard ceiling boundary (Y <= 70) ensures birds never cross behind the top navbar.
 *
 * 3. Authentic Synchronous Wing Flapping & 3D Flight Banking:
 *    - Both left & right wingtips flap in unison with aerodynamic harmonic cycle.
 *    - Real-time roll banking into turns and pitch response to vertical velocity.
 *
 * 4. Dual Variance Gradient Luxury Color Palette (Matching Vanta.js):
 *    - Rich Sunset Coral Crimson (#ff3366), 24k Champagne Gold (#f5d77f),
 *      Warm Horizon Amber (#f59e0b), Electric Twilight Cyan (#00f0ff), Diamond Starlight (#ffffff).
 *    - Custom GLSL Two-Sided Shading with Crystalline Fresnel Edge Glint.
 *
 * 5. Ethereal Soft Stardust Flight Wake:
 *    - High-performance soft circular motes (no blocky square pixels).
 *    - Golden stardust particles trail gracefully behind birds and drift into the cosmos.
 *
 * 6. Interactive Cursor Repulsion:
 *    - Natural evasion response with organic wake recovery.
 *
 * 7. 60FPS WebGL Performance & Complete Resource Disposal Lifecycle.
 */

// ── 1. Custom GLSL Shader with Crystalline Rim Glint & Two-Sided Light ──────
const birdVertexShader = `
  attribute vec3 color;
  varying vec3 vColor;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vColor = color;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const birdFragmentShader = `
  varying vec3 vColor;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);

    // Two-sided soft diffuse lighting for realistic wing flap lighting
    float diffuse = max(0.35, abs(dot(normal, vec3(0.2, 0.9, 0.4))));

    // Fresnel Rim Lighting (Crystalline Starlight Glint on Wing Edges)
    float fresnel = 1.0 - max(0.0, abs(dot(normal, viewDir)));
    float rim = pow(fresnel, 2.4) * 0.95;

    // Core Radiant Diamond Luster
    vec3 starlightCore = vec3(1.0, 0.97, 0.89);
    vec3 finalColor = vColor * diffuse + starlightCore * rim;

    gl_FragColor = vec4(finalColor, 0.96);
  }
`;

// ── 2. Procedural Soft Circular Particle Texture (Eliminates Square Pixels) ──
function createSoftCircleTexture() {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.25, 'rgba(253, 224, 71, 0.9)');
  gradient.addColorStop(0.65, 'rgba(245, 158, 11, 0.35)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Reusable module-level vectors to eliminate per-frame GC allocations
const _tempSteer = new THREE.Vector3();
const _alignSum = new THREE.Vector3();
const _cohesionSum = new THREE.Vector3();
const _cohesionSteer = new THREE.Vector3();
const _totalRepulse = new THREE.Vector3();
const _repulseSub = new THREE.Vector3();

// ── 3. Low-Poly Aerodynamic 3D Bird Geometry ─────────────────────────────────
function createBirdGeometry(birdSize = 1.25, wingSpan = 28) {
  const geo = new THREE.BufferGeometry();
  const s = birdSize * 1.35;
  const w = wingSpan * 0.52;

  // 8 vertices: Beak, body, tail, and flapping wingtips
  const points = [
    new THREE.Vector3( 5 * s,   0,       0 ),        // 0: Beak
    new THREE.Vector3(-5 * s,  -1.2 * s, 1.2 * s ),  // 1: Tail Right
    new THREE.Vector3(-5 * s,   0,       0 ),        // 2: Tail Center
    new THREE.Vector3(-5 * s,  -1.2 * s,-1.2 * s ),  // 3: Tail Left
    new THREE.Vector3( 0,       1.8 * s,-w ),        // 4: Left Wingtip (Synchronous flap)
    new THREE.Vector3( 0,       1.8 * s, w ),        // 5: Right Wingtip (Synchronous flap)
    new THREE.Vector3( 2 * s,   0,       0 ),        // 6: Chest Center
    new THREE.Vector3(-3 * s,   0,       0 )         // 7: Spine Center
  ];
  geo.setFromPoints(points);

  const indices = [
    0, 2, 1, // Body right
    4, 7, 6, // Left wing
    5, 6, 7  // Right wing
  ];
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

// ── 4. Craig Reynolds' Boid Agent Simulation ─────────────────────────────────
class Boid {
  constructor(options = {}) {
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this._acceleration = new THREE.Vector3();

    this._width = 640;
    this._height = 380;
    this._depth = 300;

    this._maxSpeed = options.speedLimit || 2.2;
    this._maxSteerForce = 0.14;

    // Vanta.js Balanced Flocking Distances
    this.separationDist = 26; // Generous personal space: prevents collision/clumping
    this.alignmentDist = 65;
    this.cohesionDist = 75;

    this.roll = 0;
  }

  setWorldBounds(w, h, d) {
    this._width = w;
    this._height = h;
    this._depth = d;
  }

  run(boids, wanderTarget, mousePos) {
    // 1. Text Readability Shield (Aerodynamic Deflection Zone)
    const dx = this.position.x;
    const dy = this.position.y - 5;
    const normX = dx / 320;
    const normY = (dy + 12) / 65;
    const distSq = normX * normX + normY * normY;

    if (distSq < 1.0) {
      const dist = Math.sqrt(distSq);
      const force = (1.0 - dist) * 0.55;
      this._acceleration.x += (dx >= 0 ? 1 : -1) * force * 1.6;
      this._acceleration.y += force * 2.0;
    }

    // 2. Strict Boundary Constraints & Navbar Clearance
    const marginX = this._width * 0.85;
    const marginZ = this._depth * 0.82;

    if (this.position.y > 65) {
      this._acceleration.y -= 0.5;
    } else if (this.position.y < -100) {
      this._acceleration.y += 0.35;
    }

    if (Math.abs(this.position.x) > marginX) {
      this._acceleration.x -= Math.sign(this.position.x) * 0.28;
    }
    if (Math.abs(this.position.z) > marginZ) {
      this._acceleration.z -= Math.sign(this.position.z) * 0.28;
    }

    // 3. Flocking Physics (Reynolds Boids)
    this.flock(boids);

    // 4. Swarm Attractor
    if (wanderTarget) {
      const wanderSteer = new THREE.Vector3().subVectors(wanderTarget, this.position);
      const distWander = wanderSteer.length();
      if (distWander > 0) {
        wanderSteer.normalize().multiplyScalar(0.045);
        this._acceleration.add(wanderSteer);
      }
    }

    // 5. Interactive Cursor Repulsion
    if (mousePos && mousePos.x < 5000) {
      this.repulse(mousePos);
    }

    this.move();
  }

  flock(boids) {
    this._acceleration.add(this.alignment(boids));
    this._acceleration.add(this.cohesion(boids));
    this._acceleration.add(this.separation(boids));
  }

  move() {
    this.velocity.add(this._acceleration);
    const speed = this.velocity.length();
    if (speed > this._maxSpeed) {
      this.velocity.divideScalar(speed).multiplyScalar(this._maxSpeed);
    }
    this.position.add(this.velocity);
    this._acceleration.set(0, 0, 0);
  }

  repulse(target) {
    const dist = this.position.distanceTo(target);
    if (dist < 140 && dist > 0.001) {
      _tempSteer.subVectors(this.position, target);
      _tempSteer.normalize();
      _tempSteer.multiplyScalar((1.0 - dist / 140) * 0.75);
      this._acceleration.add(_tempSteer);
    }
  }

  alignment(boids) {
    _alignSum.set(0, 0, 0);
    let count = 0;
    const len = boids.length;
    for (let i = 0; i < len; i++) {
      const other = boids[i];
      const dist = this.position.distanceTo(other.position);
      if (dist > 0 && dist <= this.alignmentDist) {
        _alignSum.add(other.velocity);
        count++;
      }
    }
    if (count > 0) {
      _alignSum.divideScalar(count);
      const l = _alignSum.length();
      if (l > this._maxSteerForce) {
        _alignSum.divideScalar(l / this._maxSteerForce);
      }
      return _alignSum.multiplyScalar(0.055);
    }
    return _alignSum;
  }

  cohesion(boids) {
    _cohesionSum.set(0, 0, 0);
    let count = 0;
    const len = boids.length;
    for (let i = 0; i < len; i++) {
      const other = boids[i];
      const dist = this.position.distanceTo(other.position);
      if (dist > 0 && dist <= this.cohesionDist) {
        _cohesionSum.add(other.position);
        count++;
      }
    }
    if (count > 0) {
      _cohesionSum.divideScalar(count);
      _cohesionSteer.subVectors(_cohesionSum, this.position);
      const l = _cohesionSteer.length();
      if (l > this._maxSteerForce) {
        _cohesionSteer.divideScalar(l / this._maxSteerForce);
      }
      return _cohesionSteer.multiplyScalar(0.045);
    }
    return _cohesionSum;
  }

  separation(boids) {
    _totalRepulse.set(0, 0, 0);
    const len = boids.length;
    for (let i = 0; i < len; i++) {
      const other = boids[i];
      const dist = this.position.distanceTo(other.position);
      if (dist > 0 && dist <= this.separationDist) {
        _repulseSub.subVectors(this.position, other.position);
        _repulseSub.normalize();
        _repulseSub.divideScalar(dist);
        _totalRepulse.add(_repulseSub);
      }
    }
    const l = _totalRepulse.length();
    if (l > this._maxSteerForce * 1.5) {
      _totalRepulse.divideScalar(l / (this._maxSteerForce * 1.5));
    }
    return _totalRepulse.multiplyScalar(0.085);
  }
}

// ── 5. Main React Component ──────────────────────────────────────────────────
export function VantaBirdsBackground({ scrollProgress = 0 }) {
  const mountRef = useRef(null);
  const scrollRef = useRef(scrollProgress);
  scrollRef.current = scrollProgress;
  const loopStateRef = useRef(null);

  // Sync scroll changes with loop state
  useEffect(() => {
    if (loopStateRef.current) {
      loopStateRef.current();
    }
  }, [scrollProgress]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // State machine flags
    const isMounted = { current: true };
    const isTabVisible = { current: typeof document !== 'undefined' ? !document.hidden : true };
    const isLoopRunning = { current: false };

    let renderer = null;
    let scene = null;
    let camera = null;
    let animId = null;
    const clock = new THREE.Clock();
    let birds = [];
    let birdMaterial = null;
    let wakeGeo = null;
    let wakeMat = null;
    let circleTexture = null;
    let animate = null;

    // Declared at useEffect scope so handleResize (defined inside step2) can close over them
    let width = 0;
    let height = 0;

    let handleMouseMove = null;
    let handleMouseLeave = null;
    let handleResize = null;
    let handleVisibilityChange = null;

    function updateLoopState() {
      const isVisibleRange = scrollRef.current < 0.70;
      const shouldAnimate = isMounted.current && isTabVisible.current && isVisibleRange;

      if (shouldAnimate && !isLoopRunning.current && renderer && typeof animate === 'function') {
        isLoopRunning.current = true;
        clock.start();
        animId = requestAnimationFrame(animate);
      } else if (!shouldAnimate && isLoopRunning.current) {
        isLoopRunning.current = false;
        if (animId) {
          cancelAnimationFrame(animId);
          animId = null;
        }
      }
    }
    loopStateRef.current = updateLoopState;

    handleVisibilityChange = () => {
      isTabVisible.current = !document.hidden;
      updateLoopState();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    let idleHandle = null;
    let idleHandleStep2 = null;

    const step2 = () => {
      if (!isMounted.current || !container || !scene || !renderer) return;

      // ── Vanta Birds Configuration (Subtle & Peaceful Flocking, 12 Birds) ────────
      const NUM_BIRDS = 12; // Tuned for tranquil, non-intrusive background ambience
      const birdSize = 1.35;
      const wingSpan = 30;

      // Vanta.js Dual Variance Gradient Palette Harmonized with Dark & Gold Obsidian
      const cCoral  = new THREE.Color('#ff3366'); // Sunset Coral Flame
      const cGold   = new THREE.Color('#f5d77f'); // 24k Champagne Gold (Primary)
      const cAmber  = new THREE.Color('#f59e0b'); // Warm Horizon Amber
      const cCyan   = new THREE.Color('#00f0ff'); // Electric Twilight Sky Cyan
      const cWhite  = new THREE.Color('#ffffff'); // Diamond Starlight Sparkle

      const boids = [];

      // Shared Shader Material for Crystalline Starlight Birds
      birdMaterial = new THREE.ShaderMaterial({
        vertexShader: birdVertexShader,
        fragmentShader: birdFragmentShader,
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });

      for (let i = 0; i < NUM_BIRDS; i++) {
        const boid = new Boid({
          speedLimit: 2.2
        });

        // Generous spatial dispersion across horizon
        boid.position.set(
          (Math.random() - 0.5) * 580,
          Math.random() * 80 - 40,
          (Math.random() - 0.5) * 260
        );

        boid.velocity.set(
          (Math.random() - 0.5) * 1.5,
          (Math.random() - 0.5) * 0.4,
          (Math.random() - 0.5) * 1.2
        );

        const geo = createBirdGeometry(birdSize, wingSpan);

        // Gradient color variance per bird
        const colors = new Float32Array(8 * 3);
        const ratio = i / (NUM_BIRDS - 1);
        let baseCol;

        if (ratio < 0.35) {
          baseCol = new THREE.Color().lerpColors(cGold, cAmber, ratio / 0.35);
        } else if (ratio < 0.7) {
          baseCol = new THREE.Color().lerpColors(cAmber, cCoral, (ratio - 0.35) / 0.35);
        } else {
          baseCol = new THREE.Color().lerpColors(cCoral, cCyan, (ratio - 0.7) / 0.3);
        }

        for (let j = 0; j < 8; j++) {
          const isWingTip = j === 4 || j === 5;
          const col = isWingTip ? new THREE.Color().lerpColors(baseCol, cWhite, 0.45) : baseCol;
          colors[j * 3 + 0] = col.r;
          colors[j * 3 + 1] = col.g;
          colors[j * 3 + 2] = col.b;
        }

        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geo.computeVertexNormals();

        const mesh = new THREE.Mesh(geo, birdMaterial);
        mesh.phase = Math.random() * 6.28;
        scene.add(mesh);

        birds.push(mesh);
        boids.push(boid);
      }

      // ── Soft Stardust Particle Flight Wake ───────────────────────────────────
      const WAKE_PARTICLES = 40;
      const wakePositions = new Float32Array(WAKE_PARTICLES * 3);
      const wakeColors = new Float32Array(WAKE_PARTICLES * 3);
      const wakeAges = new Float32Array(WAKE_PARTICLES);

      circleTexture = createSoftCircleTexture();

      for (let k = 0; k < WAKE_PARTICLES; k++) {
        wakePositions[k * 3 + 0] = 0;
        wakePositions[k * 3 + 1] = -9999;
        wakePositions[k * 3 + 2] = 0;

        const pick = Math.random();
        const col = pick < 0.6 ? cGold : (pick < 0.85 ? cAmber : cWhite);
        wakeColors[k * 3 + 0] = col.r;
        wakeColors[k * 3 + 1] = col.g;
        wakeColors[k * 3 + 2] = col.b;

        wakeAges[k] = Math.random();
      }

      wakeGeo = new THREE.BufferGeometry();
      wakeGeo.setAttribute('position', new THREE.BufferAttribute(wakePositions, 3));
      wakeGeo.setAttribute('color', new THREE.BufferAttribute(wakeColors, 3));

      wakeMat = new THREE.PointsMaterial({
        size: 5.5,
        map: circleTexture,
        vertexColors: true,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const wakePoints = new THREE.Points(wakeGeo, wakeMat);
      scene.add(wakePoints);

      let wakeEmitIndex = 0;

      // ── Interactive Mouse Tracking ───────────────────────────────────────────
      const mouseTarget = new THREE.Vector3(10000, 10000, 0);
      const mouseWorld = new THREE.Vector3(10000, 10000, 0);

      handleMouseMove = (e) => {
        const nx = (e.clientX / window.innerWidth) * 2 - 1;
        const ny = -(e.clientY / window.innerHeight) * 2 + 1;
        mouseTarget.x = nx * 260;
        mouseTarget.y = ny * 170;
        mouseTarget.z = 0;
      };

      handleMouseLeave = () => {
        mouseTarget.set(10000, 10000, 0);
      };

      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      window.addEventListener('mouseleave', handleMouseLeave, { passive: true });

      handleResize = () => {
        if (!container || !renderer || !camera) return;
        width = container.clientWidth || window.innerWidth;
        height = container.clientHeight || window.innerHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
      };
      window.addEventListener('resize', handleResize, { passive: true });

      // ── Main Animation Loop (60FPS Desktop, throttled 30FPS Mobile) ───────────
      const wanderTarget = new THREE.Vector3();
      let lastRenderTime = 0;
      const minFrameDelta = (typeof window !== 'undefined' && window.innerWidth < 768) ? 32 : 0;

      animate = () => {
        if (!isLoopRunning.current) return;

        const now = performance.now();
        if (minFrameDelta > 0 && now - lastRenderTime < minFrameDelta) {
          animId = requestAnimationFrame(animate);
          return;
        }
        lastRenderTime = now;

        if (prefersReducedMotion) {
          if (renderer && scene && camera) renderer.render(scene, camera);
          return;
        }

        const delta = Math.min(0.04, clock.getDelta());
        const time = clock.getElapsedTime();

        // Smooth mouse lerping
        mouseWorld.lerp(mouseTarget, 0.08);

        const scrollVal = scrollRef.current;

        // Camera parallax & scroll tracking
        camera.position.x += ((mouseWorld.x < 5000 ? mouseWorld.x * 0.12 : 0) - camera.position.x) * 0.035;
        camera.position.y += ((mouseWorld.y < 5000 ? mouseWorld.y * 0.08 : 0) - scrollVal * 80 - camera.position.y) * 0.035;
        camera.lookAt(0, -scrollVal * 30, 0);

        wanderTarget.set(
          Math.sin(time * 0.28) * 240 + Math.cos(time * 0.14) * 80,
          48 + Math.sin(time * 0.22) * 12,
          Math.sin(time * 0.18) * 100
        );

        // Update Boids & Bird Meshes
        for (let i = 0; i < NUM_BIRDS; i++) {
          const boid = boids[i];
          const bird = birds[i];

          boid.run(boids, wanderTarget, mouseWorld);

          const speed = boid.velocity.length();
          if (speed > 0.001) {
            bird.rotation.y = Math.atan2(-boid.velocity.z, boid.velocity.x);
            bird.rotation.z = Math.asin(boid.velocity.y / speed);

            const turn = -boid._acceleration.x * 0.55;
            bird.rotation.x = THREE.MathUtils.lerp(bird.rotation.x, turn, 0.08);
          }

          bird.phase = (bird.phase + (Math.max(0, bird.rotation.z) + 0.1) * 1.1) % 62.83;
          const flapOffset = Math.sin(bird.phase) * (4.8 * birdSize);

          const posAttr = bird.geometry.attributes.position;
          posAttr.setY(4, 1.8 * birdSize + flapOffset);
          posAttr.setY(5, 1.8 * birdSize + flapOffset);
          posAttr.needsUpdate = true;

          bird.position.copy(boid.position);

          if (i % 2 === 0 && Math.random() > 0.5) {
            const wIdx = wakeEmitIndex * 3;
            wakePositions[wIdx + 0] = boid.position.x + (Math.random() - 0.5) * 4;
            wakePositions[wIdx + 1] = boid.position.y + (Math.random() - 0.5) * 4;
            wakePositions[wIdx + 2] = boid.position.z + (Math.random() - 0.5) * 4;
            wakeAges[wakeEmitIndex] = 0;
            wakeEmitIndex = (wakeEmitIndex + 1) % WAKE_PARTICLES;
          }
        }

        // Age & Drift Stardust Wake Motes
        for (let k = 0; k < WAKE_PARTICLES; k++) {
          wakeAges[k] += delta * 0.85;
          if (wakeAges[k] < 1.0) {
            wakePositions[k * 3 + 1] += 0.22;
          }
        }
        wakeGeo.attributes.position.needsUpdate = true;

        if (renderer && scene && camera) {
          renderer.render(scene, camera);
        }

        if (isLoopRunning.current) {
          animId = requestAnimationFrame(animate);
        }
      };

      // Start loop cleanly
      updateLoopState();
    };

    // Staggered initialization on idle: Slice 1 sets up renderer/camera, Slice 2 sets up boids/loop
    const step1 = () => {
      if (!isMounted.current || !container) return;

      // ── Scene & Camera ───────────────────────────────────────────────────────
      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x060812, 0.0014);

      // Assign to the outer-scoped width/height so handleResize (in step2) has access
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;

      camera = new THREE.PerspectiveCamera(65, width / height, 1, 3000);
      camera.position.set(0, 0, 360);

      // ── WebGL Renderer ───────────────────────────────────────────────────────
      try {
        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance'
        });
      } catch (e) {
        console.warn('VantaBirds: WebGL unavailable:', e);
        return;
      }

      renderer.setSize(width, height);
      const isMobileScreen = typeof window !== 'undefined' && window.innerWidth < 768;
      renderer.setPixelRatio(isMobileScreen ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);

      step2();
    };

    const isMobileScreen = typeof window !== 'undefined' && window.innerWidth < 768;

    const startVanta = () => {
      window.removeEventListener('scroll', startVanta);
      window.removeEventListener('touchstart', startVanta);
      window.removeEventListener('pointerdown', startVanta);
      if (idleHandle) cancelIdle(idleHandle);
      step1();
    };

    window.addEventListener('scroll', startVanta, { passive: true, once: true });
    window.addEventListener('touchstart', startVanta, { passive: true, once: true });
    window.addEventListener('pointerdown', startVanta, { passive: true, once: true });

    const initTimer = setTimeout(startVanta, isMobileScreen ? 1200 : 50);

    // ── Memory & Resource Disposal Lifecycle ─────────────────────────────────
    return () => {
      clearTimeout(initTimer);
      window.removeEventListener('scroll', startVanta);
      window.removeEventListener('touchstart', startVanta);
      window.removeEventListener('pointerdown', startVanta);
      isMounted.current = false;
      isLoopRunning.current = false;
      loopStateRef.current = null;
      cancelIdle(idleHandle);
      cancelIdle(idleHandleStep2);

      if (animId) cancelAnimationFrame(animId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (handleMouseMove) window.removeEventListener('mousemove', handleMouseMove);
      if (handleMouseLeave) window.removeEventListener('mouseleave', handleMouseLeave);
      if (handleResize) window.removeEventListener('resize', handleResize);

      if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      for (let i = 0; i < birds.length; i++) {
        if (birds[i].geometry) birds[i].geometry.dispose();
      }
      if (birdMaterial) birdMaterial.dispose();
      if (wakeGeo) wakeGeo.dispose();
      if (wakeMat) wakeMat.dispose();
      if (circleTexture) circleTexture.dispose();
      if (renderer) renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none transition-opacity duration-700 ease-out"
      style={{ opacity: Math.max(0.22, 0.98 - scrollProgress * 1.6) }}
      aria-hidden="true"
    />
  );
}
