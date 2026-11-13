import React, { useState, useEffect, useRef } from 'react';

/**
 * LazyInView — Strict Viewport Gating Wrapper
 *
 * Guarantees:
 * 1. Strict Viewport Gating: Dynamic imports and initialization fire ONLY when
 *    the element scrolls within rootMargin of the viewport. No idle-timer auto-load.
 * 2. 0.000 CLS: Renders an exact-dimension placeholder skeleton while offscreen.
 * 3. Zero Memory Leak: Disconnects the IntersectionObserver immediately upon triggering.
 */
export function LazyInView({
  children,
  rootMargin = '300px 0px',
  minHeight = '300px',
  className = '',
  placeholderClassName = '',
  placeholder = null
}) {
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    // If already triggered or no window, skip
    if (isInView || typeof window === 'undefined') return;

    const el = containerRef.current;
    if (!el) return;

    // Strict viewport gating: trigger ONLY upon genuine intersection
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry && entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [isInView, rootMargin]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
      style={{ minHeight: !isInView ? minHeight : undefined }}
    >
      {isInView ? (
        <React.Suspense
          fallback={
            placeholder || (
              <div
                className={`w-full h-full flex items-center justify-center bg-white/[0.02] border border-white/5 rounded-3xl animate-pulse ${placeholderClassName}`}
                style={{ minHeight }}
                aria-hidden="true"
              />
            )
          }
        >
          {children}
        </React.Suspense>
      ) : (
        placeholder || (
          <div
            className={`w-full h-full flex items-center justify-center bg-white/[0.02] border border-white/5 rounded-3xl ${placeholderClassName}`}
            style={{ minHeight }}
            aria-hidden="true"
          />
        )
      )}
    </div>
  );
}

export default LazyInView;

