import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function MagneticButton({
  children,
  className = '',
  onClick,
  strength = 0.35,
  textStrength = 0.18,
  type = 'button',
  ...rest
}) {
  const ref = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const textX = useMotionValue(0);
  const textY = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);
  const smoothTextX = useSpring(textX, springConfig);
  const smoothTextY = useSpring(textY, springConfig);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const deltaX = (clientX - centerX) * strength;
    const deltaY = (clientY - centerY) * strength;

    x.set(deltaX);
    y.set(deltaY);
    textX.set(deltaX * textStrength);
    textY.set(deltaY * textStrength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    textX.set(0);
    textY.set(0);
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: smoothX, y: smoothY }}
      whileTap={{ scale: 0.96 }}
      className={`relative inline-flex items-center justify-center cursor-pointer select-none ${className}`}
      {...rest}
    >
      <motion.span
        style={{ x: smoothTextX, y: smoothTextY }}
        className="inline-flex items-center justify-center gap-2 pointer-events-none"
      >
        {children}
      </motion.span>
    </motion.button>
  );
}

