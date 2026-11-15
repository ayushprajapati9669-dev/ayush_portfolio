import { useState, useEffect } from 'react';

/**
 * useInView — bidirectional IntersectionObserver hook for scroll-triggered animations.
 *
 * Returns `true` when at least 15% of the element is visible,
 * `false` only when intersectionRatio === 0 (fully off-screen).
 * Never unobserves so the animation replays in both scroll directions.
 * Respects prefers-reduced-motion — returns `true` immediately if enabled.
 */
export function useInView(ref) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    // SSR guard
    if (typeof window === 'undefined') {
      setInView(true);
      return;
    }

    // Respect prefers-reduced-motion
    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionMq.matches) {
      setInView(true);
      return;
    }

    // IntersectionObserver not supported (old browsers)
    if (!window.IntersectionObserver) {
      setInView(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio >= 0.15) {
            // Element is at least 15% visible → animate in
            setInView(true);
          } else if (entry.intersectionRatio === 0) {
            // Fully off-screen → reset so it can re-animate
            setInView(false);
          }
          // Between 0 and 0.15: keep current state to avoid flicker at viewport edge
        });
      },
      {
        threshold: [0, 0.15],
        rootMargin: '0px 0px -6% 0px',
      }
    );

    observer.observe(el);

    // Do NOT call unobserve inside the callback — bidirectional replay requires
    // the observer to remain active. Clean up only on component unmount.
    return () => {
      observer.unobserve(el);
      observer.disconnect();
    };
  }, [ref]);

  return inView;
}

export default useInView;
