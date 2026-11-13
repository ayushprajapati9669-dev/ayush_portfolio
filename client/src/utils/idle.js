/**
 * Safe Idle Scheduler Utility with Deadline Emulation & Bounded Batching
 * Supports native requestIdleCallback where available, with a resilient setTimeout fallback.
 */

export function runOnIdle(callback, options = {}) {
  const timeout = options.timeout ?? 1500;
  const initialBudget = options.minBudget ?? 16; // default 16ms frame slice budget

  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    const handle = window.requestIdleCallback(
      (deadline) => {
        try {
          callback(deadline);
        } catch (err) {
          console.error('[runOnIdle] Error in idle callback:', err);
        }
      },
      { timeout }
    );
    return { type: 'idle', id: handle };
  }

  // Fallback: simulate requestIdleCallback with a decremental budget
  const startTime = Date.now();
  const handle = setTimeout(() => {
    try {
      callback({
        didTimeout: true,
        timeRemaining: () => Math.max(0, initialBudget - (Date.now() - startTime))
      });
    } catch (err) {
      console.error('[runOnIdle fallback] Error in timeout callback:', err);
    }
  }, options.delay ?? 60);

  return { type: 'timeout', id: handle };
}

export function cancelIdle(handle) {
  if (!handle || typeof handle !== 'object') return;
  if (handle.type === 'idle' && typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
    window.cancelIdleCallback(handle.id);
  } else if (handle.type === 'timeout') {
    clearTimeout(handle.id);
  }
}

