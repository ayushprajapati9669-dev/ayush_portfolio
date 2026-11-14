import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

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
        if (typeof window !== 'undefined') window.__lenis = null;
      }
      return;
    }

    // On mobile touchscreens, native compositor scrolling provides optimal 120Hz performance with zero main-thread overhead
    const isMobileTouch =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      (window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(max-width: 768px)').matches);

    if (isMobileTouch) {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
        setLenisInstance(null);
        if (typeof window !== 'undefined') window.__lenis = null;
      }
      return;
    }

    // Dynamically load Lenis & ScrollTrigger on public desktop without blocking critical initial paint
    let cancelled = false;
    let onGsapTicker = null;
    let removeTicker = null;

    Promise.all([import('lenis'), import('gsap'), import('gsap/ScrollTrigger')]).then(([lenisMod, gsapMod, stMod]) => {
      if (cancelled) return;
      const LenisClass = lenisMod.default || lenisMod;
      const gsap = gsapMod.default || gsapMod;
      const { ScrollTrigger } = stMod;
      try {
        gsap.registerPlugin(ScrollTrigger);
      } catch (_e) {}
      if (typeof window !== 'undefined') {
        window.gsap = gsap;
        window.ScrollTrigger = ScrollTrigger;
      }

      const lenis = new LenisClass({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
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
      if (typeof window !== 'undefined') window.__lenis = lenis;

      lenis.on('scroll', (e) => {
        ScrollTrigger.update();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('lenis-scroll', { detail: e }));
        }
      });
      onGsapTicker = (time) => {
        lenis.raf(time * 1000);
      };
      gsap.ticker.add(onGsapTicker);
      removeTicker = () => {
        if (onGsapTicker) gsap.ticker.remove(onGsapTicker);
      };
    });

    return () => {
      cancelled = true;
      if (removeTicker) removeTicker();
      if (typeof window !== 'undefined' && window.__lenis === lenisRef.current) window.__lenis = null;
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      setLenisInstance(null);
    };
  }, [isAdmin]);

  const isInitialMount = useRef(true);

  // Route transition scroll reset & ScrollTrigger recalculation
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }

    const timer = setTimeout(() => {
      try {
        if (typeof window !== 'undefined' && window.ScrollTrigger) {
          window.ScrollTrigger.refresh();
        }
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
