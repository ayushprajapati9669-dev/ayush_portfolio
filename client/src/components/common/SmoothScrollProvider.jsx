import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const SmoothScrollContext = createContext(null);

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}

export function useLenisScrollTo() {
  const lenis = useSmoothScroll();
  return useCallback((target, options = {}) => {
    if (lenis) {
      lenis.scrollTo(target, {
        offset: options.offset ?? -70,
        duration: options.duration ?? 1.25,
        easing: options.easing ?? ((t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))),
        ...options
      });
    } else if (typeof target === 'string') {
      const el = target.startsWith('#') || target.startsWith('.') ? document.querySelector(target) : document.getElementById(target);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (target instanceof HTMLElement) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }, [lenis]);
}

export function SmoothScrollProvider({ children }) {
  const location = useLocation();
  const lenisRef = useRef(null);
  const [lenisInstance, setLenisInstance] = useState(null);

  // Administrative CMS workspace and login screen require native scrolling for nested flex/grid panes
  const isAdmin = Boolean(
    location.pathname &&
    (location.pathname.startsWith('/admin') || location.pathname.startsWith('/login'))
  );

  useEffect(() => {
    // Respect user's motion preference or bypass Lenis on Admin routes to preserve 100% native nested scroll
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || isAdmin) {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
        setLenisInstance(null);
      }
      return;
    }

    // Initialize Lenis smooth scroll on public showcase pages with luxury physics and nested scroll protection
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth exponential curve
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.5,
      infinite: false,
      autoRaf: false,
      prevent: (node) => {
        if (!node) return false;
        return (
          node.hasAttribute?.('data-lenis-prevent') ||
          Boolean(
            node.closest?.(
              '[data-lenis-prevent], .sidebar-nav, .admin-sidebar, .cmd-results, .hero-media-grid, .modal-box, .premium-modal, .admin-modal-box, select, textarea, input[type="range"]'
            )
          )
        );
      }
    });

    lenisRef.current = lenis;
    setLenisInstance(lenis);

    // Synchronize Lenis with GSAP ScrollTrigger on every frame
    lenis.on('scroll', ScrollTrigger.update);

    const onGsapTicker = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(onGsapTicker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onGsapTicker);
      lenis.destroy();
      lenisRef.current = null;
      setLenisInstance(null);
    };
  }, [isAdmin]);

  // Route transition scroll reset & ScrollTrigger recalculation
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }

    const timer = setTimeout(() => {
      try {
        ScrollTrigger.refresh();
      } catch (_e) {}
    }, 120);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <SmoothScrollContext.Provider value={lenisInstance}>
      {children}
    </SmoothScrollContext.Provider>
  );
}

export default SmoothScrollProvider;
