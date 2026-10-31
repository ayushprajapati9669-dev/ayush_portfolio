import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';

// Art-directed 3D sphere compositions per section
// Spheres frame content along outer margins and depth planes, leaving text & controls 100% legible
const SECTION_SPHERE_CONFIGS = {
  home: [
    {
      id: 'h1',
      depth: 'bg',
      size: 400,
      top: '-6%',
      right: '-8%',
      floatClass: 'float-slow-1',
      depthFactor: 0.015,
      opacity: 0.55
    },
    {
      id: 'h2',
      depth: 'mid',
      size: 220,
      top: '60%',
      left: '-6%',
      floatClass: 'float-slow-2',
      depthFactor: 0.035,
      opacity: 0.75
    },
    {
      id: 'h3',
      depth: 'fg',
      size: 110,
      top: '32%',
      right: '6%',
      floatClass: 'float-slow-3',
      depthFactor: 0.06,
      opacity: 0.92
    },
    {
      id: 'h4',
      depth: 'bg',
      size: 160,
      bottom: '8%',
      right: '18%',
      floatClass: 'float-slow-1',
      depthFactor: 0.02,
      opacity: 0.5
    }
  ],
  projects: [
    // Outer perimeter framing — center column & filter bar remain 100% clean and unobstructed
    {
      id: 'p1',
      depth: 'bg',
      size: 340,
      top: '6%',
      left: '-10%',
      floatClass: 'float-slow-2',
      depthFactor: 0.015,
      opacity: 0.55
    },
    {
      id: 'p2',
      depth: 'mid',
      size: 250,
      top: '10%',
      right: '-8%',
      floatClass: 'float-slow-1',
      depthFactor: 0.035,
      opacity: 0.7
    },
    {
      id: 'p3',
      depth: 'bg',
      size: 180,
      top: '55%',
      right: '1%',
      floatClass: 'float-slow-3',
      depthFactor: 0.02,
      opacity: 0.45
    },
    {
      id: 'p4',
      depth: 'fg',
      size: 95,
      bottom: '10%',
      left: '3%',
      floatClass: 'float-slow-2',
      depthFactor: 0.055,
      opacity: 0.88
    }
  ],
  about: [
    {
      id: 'a1',
      depth: 'mid',
      size: 290,
      top: '14%',
      right: '1%',
      floatClass: 'float-slow-1',
      depthFactor: 0.035,
      opacity: 0.75
    },
    {
      id: 'a2',
      depth: 'bg',
      size: 350,
      top: '52%',
      left: '-12%',
      floatClass: 'float-slow-2',
      depthFactor: 0.015,
      opacity: 0.5
    },
    {
      id: 'a3',
      depth: 'fg',
      size: 100,
      bottom: '12%',
      right: '12%',
      floatClass: 'float-slow-3',
      depthFactor: 0.055,
      opacity: 0.85
    }
  ],
  skills: [
    {
      id: 's1',
      depth: 'bg',
      size: 320,
      top: '8%',
      left: '-8%',
      floatClass: 'float-slow-1',
      depthFactor: 0.018,
      opacity: 0.55
    },
    {
      id: 's2',
      depth: 'mid',
      size: 270,
      top: '42%',
      right: '-6%',
      floatClass: 'float-slow-2',
      depthFactor: 0.035,
      opacity: 0.7
    },
    {
      id: 's3',
      depth: 'fg',
      size: 90,
      bottom: '12%',
      left: '4%',
      floatClass: 'float-slow-3',
      depthFactor: 0.05,
      opacity: 0.88
    }
  ],
  certificates: [
    {
      id: 'c1',
      depth: 'mid',
      size: 310,
      top: '10%',
      right: '2%',
      floatClass: 'float-slow-1',
      depthFactor: 0.035,
      opacity: 0.72
    },
    {
      id: 'c2',
      depth: 'bg',
      size: 260,
      top: '56%',
      left: '-8%',
      floatClass: 'float-slow-2',
      depthFactor: 0.02,
      opacity: 0.5
    }
  ],
  contact: [
    {
      id: 'ct1',
      depth: 'mid',
      size: 320,
      top: '16%',
      left: '4%',
      floatClass: 'float-slow-1',
      depthFactor: 0.035,
      opacity: 0.7
    },
    {
      id: 'ct2',
      depth: 'bg',
      size: 270,
      bottom: '10%',
      right: '4%',
      floatClass: 'float-slow-2',
      depthFactor: 0.02,
      opacity: 0.55
    },
    {
      id: 'ct3',
      depth: 'fg',
      size: 85,
      top: '42%',
      right: '8%',
      floatClass: 'float-slow-3',
      depthFactor: 0.05,
      opacity: 0.88
    }
  ]
};

export function BackgroundLayers() {
  const mouseLightRef = useRef(null);
  const spheresRef = useRef(null);
  const location = useLocation();

  // Route detection
  const pathname = location.pathname || '/';
  const isCaseStudy = Boolean(pathname.startsWith('/projects/') && pathname !== '/projects');
  const isAdmin = Boolean(pathname.startsWith('/admin') || pathname.startsWith('/login'));

  // Determine active section layout
  let sectionKey = 'home';
  if (pathname.startsWith('/about')) sectionKey = 'about';
  else if (pathname.startsWith('/projects')) sectionKey = 'projects';
  else if (pathname.startsWith('/skills')) sectionKey = 'skills';
  else if (pathname.startsWith('/certificates')) sectionKey = 'certificates';
  else if (pathname.startsWith('/contact')) sectionKey = 'contact';

  const currentSpheres = SECTION_SPHERE_CONFIGS[sectionKey] || SECTION_SPHERE_CONFIGS.home;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(timer);
  }, []);

  // Smooth mouse light follower & multi-plane sphere parallax
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const mouseEl = mouseLightRef.current;
    const spheresContainer = spheresRef.current;

    // QuickTo interpolators for cursor light
    const xTo = mouseEl ? gsap.quickTo(mouseEl, 'left', { duration: 0.35, ease: 'power2.out' }) : null;
    const yTo = mouseEl ? gsap.quickTo(mouseEl, 'top', { duration: 0.35, ease: 'power2.out' }) : null;

    // Parallax targets for each depth plane
    const bgElements = spheresContainer ? spheresContainer.querySelectorAll('.sphere-depth-bg') : [];
    const midElements = spheresContainer ? spheresContainer.querySelectorAll('.sphere-depth-mid') : [];
    const fgElements = spheresContainer ? spheresContainer.querySelectorAll('.sphere-depth-fg') : [];

    const handleMouseMove = (e) => {
      if (xTo && yTo) {
        xTo(e.clientX);
        yTo(e.clientY);
      }

      if (!spheresContainer) return;

      const normX = (e.clientX / window.innerWidth - 0.5) * 2;
      const normY = (e.clientY / window.innerHeight - 0.5) * 2;

      if (bgElements.length) {
        gsap.to(bgElements, {
          x: normX * 12,
          y: normY * 12,
          duration: 1.2,
          ease: 'power1.out',
          overwrite: 'auto'
        });
      }
      if (midElements.length) {
        gsap.to(midElements, {
          x: normX * 24,
          y: normY * 24,
          duration: 0.8,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }
      if (fgElements.length) {
        gsap.to(fgElements, {
          x: normX * 45,
          y: normY * 45,
          duration: 0.5,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mounted, sectionKey]);

  return (
    <>
      {/* Realistic 3D Deep Oceanic Liquid Background */}
      <div className={`liquid-bg ${isCaseStudy ? 'liquid-bg-case-study' : ''}`} aria-hidden="true">
        <div className="aurora-blob aurora-1" />
        <div className="aurora-blob aurora-2" />
        <div className="aurora-blob aurora-3" />
      </div>

      {/* Photorealistic Studio-Lit 3D Spheres — strategically art-directed per section */}
      {!isCaseStudy && !isAdmin && mounted && (
        <div className="spheres-container" ref={spheresRef} aria-hidden="true">
          {currentSpheres.map((s) => {
            const style = {
              width: `${s.size}px`,
              height: `${s.size}px`,
              opacity: s.opacity,
              top: s.top,
              bottom: s.bottom,
              left: s.left,
              right: s.right
            };

            const depthClass = `sphere-depth-${s.depth}`;
            return (
              <div
                key={`${sectionKey}-${s.id}`}
                className={`studio-sphere ${depthClass} ${s.floatClass}`}
                style={style}
              />
            );
          })}
        </div>
      )}

      {/* Subtle Noise Texture Overlay */}
            {/* Sarthak Sharma 4-Column Architectural Guides */}
      <div className="editorial-grid-guides" aria-hidden="true" />

      {/* Subtle Noise Texture Overlay */}
      <div className="bg-noise" aria-hidden="true" />

      {/* Interactive Water Blue Mouse Light Follower */}
      <div className="mouse-light" id="mouseLight" ref={mouseLightRef} aria-hidden="true" />
    </>
  );
}
