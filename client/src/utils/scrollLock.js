import { useEffect } from 'react';

let lockCount = 0;
let previousOverflow = '';

/**
 * Acquire a body scroll lock.
 * Uses reference counting so multiple overlays can be open simultaneously
 * without interfering with each other's lock state.
 */
export function lockScroll() {
  if (typeof document === 'undefined') return;

  if (lockCount === 0) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  lockCount++;
}

/**
 * Release a body scroll lock.
 * Only restores the original body overflow style when all active locks are released.
 */
export function unlockScroll() {
  if (typeof document === 'undefined') return;

  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = previousOverflow || '';
    previousOverflow = '';
  }
}

/**
 * React hook to lock body scrolling while `isLocked` is true.
 * Automatically cleans up on false or unmount.
 */
export function useScrollLock(isLocked) {
  useEffect(() => {
    if (!isLocked) return;

    lockScroll();
    return () => {
      unlockScroll();
    };
  }, [isLocked]);
}

