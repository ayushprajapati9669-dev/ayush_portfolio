import React, { useRef, useState } from 'react';
import gsap from 'gsap';

export function TiltCard({
  children,
  className = '',
  maxTilt = 8,
  glareOpacity = 0.15,
  ...rest
}) {
  const cardRef = useRef(null);
  const [glarePos, setGlarePos] = useState({ x: '50%', y: '50%' });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const rect = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    const rotX = (py - 0.5) * -2 * maxTilt;
    const rotY = (px - 0.5) * 2 * maxTilt;

    gsap.to(cardRef.current, {
      rotateX: rotX,
      rotateY: rotY,
      transformPerspective: 1000,
      duration: 0.35,
      ease: 'power2.out',
      overwrite: 'auto'
    });

    setGlarePos({ x: `${px * 100}%`, y: `${py * 100}%` });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.7,
        ease: 'elastic.out(1, 0.3)',
        overwrite: 'auto'
      });
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1000
      }}
      className={`relative overflow-hidden ${className}`}
      {...rest}
    >
      {/* 3D Elevated Content */}
      <div style={{ transform: 'translateZ(20px)' }} className="relative z-10 w-full h-full">
        {children}
      </div>

      {/* Dynamic Cursor Spotlight Glare Sheen */}
      {isHovered && (
        <div
          className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 240px at ${glarePos.x} ${glarePos.y}, rgba(255, 255, 255, ${glareOpacity}), transparent 80%)`
          }}
        />
      )}
    </div>
  );
}

export default TiltCard;
