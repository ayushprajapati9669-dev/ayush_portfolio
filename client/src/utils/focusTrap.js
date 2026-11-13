import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(', ');

/**
 * React hook to trap keyboard focus within a container while `isActive` is true.
 * Automatically saves the previously focused element and restores focus upon dismissal.
 */
export function useFocusTrap(containerRef, isActive, options = {}) {
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    // Save the element that currently has focus to restore it later
    triggerRef.current = document.activeElement;

    const container = containerRef.current;
    if (!container) return;

    // Shift focus into container with a small delay for mounting/animations
    const timer = setTimeout(() => {
      const focusables = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR))
        .filter((el) => el.offsetParent !== null || getComputedStyle(el).display !== 'none');

      if (options.initialFocusSelector) {
        const initial = container.querySelector(options.initialFocusSelector);
        if (initial && typeof initial.focus === 'function') {
          initial.focus();
          return;
        }
      }

      if (focusables.length > 0) {
        focusables[0].focus();
      }
    }, 60);

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      const focusables = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR))
        .filter((el) => el.offsetParent !== null || getComputedStyle(el).display !== 'none');

      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === first || !container.contains(document.activeElement)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        // Tab
        if (document.activeElement === last || !container.contains(document.activeElement)) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      container.removeEventListener('keydown', handleKeyDown);

      // Restore focus to the trigger that opened this modal/drawer
      if (options.restoreFocus !== false && triggerRef.current && typeof triggerRef.current.focus === 'function') {
        setTimeout(() => {
          try {
            triggerRef.current?.focus();
          } catch (_e) {}
        }, 40);
      }
    };
  }, [isActive, containerRef, options.initialFocusSelector, options.restoreFocus]);
}

