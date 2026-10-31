import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ReferenceInteractiveFX
 * Provides the signature interactive effects from the uploaded reference:
 * 1. Top 2px Scroll Progress Bar
 * 2. Desktop Custom Smooth Cursor (dot + lerp outline ring with hover expansion)
 * 3. Bento Card Spotlight mouse-tracking
 * 4. Magnetic Arrow Link tracking
 */
export function ReferenceInteractiveFX() {
  const progressBarRef = useRef(null);
  const cursorDotRef = useRef(null);
  const cursorOutlineRef = useRef(null);
  const location = useLocation();

  // 1. Scroll Progress Bar
  useEffect(() => {
    const handleScroll = () => {
      const progressBar = progressBarRef.current;
      if (!progressBar) return;
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (scrollHeight <= 0) {
        progressBar.style.width = '0%';
        return;
      }
      const scrollPercent = Math.min(Math.max((scrollTop / scrollHeight) * 100, 0), 100);
      progressBar.style.width = `${scrollPercent}%`;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  // 2. Custom Smooth Cursor with Lerp
  useEffect(() => {
    // Disable on touch devices or small screens
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch || window.innerWidth <= 768) return;

    const dot = cursorDotRef.current;
    const outline = cursorOutlineRef.current;
    if (!dot || !outline) return;

    let mouseX = -100;
    let mouseY = -100;
    let outlineX = -100;
    let outlineY = -100;
    let isVisible = false;
    let animId = null;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        dot.style.opacity = '1';
        outline.style.opacity = '1';
        outlineX = mouseX;
        outlineY = mouseY;
      }

      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
    };

    const handleMouseLeaveWindow = () => {
      isVisible = false;
      dot.style.opacity = '0';
      outline.style.opacity = '0';
    };

    const render = () => {
      if (isVisible) {
        outlineX += (mouseX - outlineX) * 0.16;
        outlineY += (mouseY - outlineY) * 0.16;
        outline.style.left = `${outlineX}px`;
        outline.style.top = `${outlineY}px`;
      }
      animId = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeaveWindow);
    animId = requestAnimationFrame(render);

    // Interactive Hover expansion
    const attachHoverListeners = () => {
      const hoverTargets = document.querySelectorAll(
        'a, button, .bento-card, .btn-ref, .skill-item, .arrow-link, input, select, textarea'
      );
      hoverTargets.forEach((el) => {
        el.addEventListener('mouseenter', () => outline.classList.add('hover'));
        el.addEventListener('mouseleave', () => outline.classList.remove('hover'));
      });
    };

    const timer = setTimeout(attachHoverListeners, 150);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeaveWindow);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [location.pathname]);

  // 3. Bento Card Spotlight & Magnetic Arrow Links
  useEffect(() => {
    const handleCardMouseMove = (e) => {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    };

    const handleMagneticLinkMove = (e) => {
      const link = e.currentTarget;
      const rect = link.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      link.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    };

    const handleMagneticLinkLeave = (e) => {
      const link = e.currentTarget;
      link.style.transform = 'translate(0, 0)';
    };

    const attachSpotlightAndMagnetic = () => {
      const cards = document.querySelectorAll('.bento-card');
      cards.forEach((card) => {
        card.addEventListener('mousemove', handleCardMouseMove);
      });

      const links = document.querySelectorAll('.arrow-link');
      links.forEach((link) => {
        link.addEventListener('mousemove', handleMagneticLinkMove);
        link.addEventListener('mouseleave', handleMagneticLinkLeave);
      });
    };

    const timer = setTimeout(attachSpotlightAndMagnetic, 150);

    return () => {
      clearTimeout(timer);
      const cards = document.querySelectorAll('.bento-card');
      cards.forEach((card) => card.removeEventListener('mousemove', handleCardMouseMove));
      const links = document.querySelectorAll('.arrow-link');
      links.forEach((link) => {
        link.removeEventListener('mousemove', handleMagneticLinkMove);
        link.removeEventListener('mouseleave', handleMagneticLinkLeave);
      });
    };
  }, [location.pathname]);

  return (
    <>
      {/* 1. Scroll Progress Bar */}
      <div className="scroll-progress" ref={progressBarRef} aria-hidden="true" />

      {/* 2. Custom Smooth Cursor */}
      <div className="cursor-dot" ref={cursorDotRef} aria-hidden="true" style={{ opacity: 0 }} />
      <div className="cursor-outline" ref={cursorOutlineRef} aria-hidden="true" style={{ opacity: 0 }} />
    </>
  );
}
