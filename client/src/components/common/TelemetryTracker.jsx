import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { runOnIdle, cancelIdle } from '../../utils/idle';

export function TelemetryTracker() {
  const location = useLocation();
  const lastPathRef = useRef('');

  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath === lastPathRef.current) return;
    lastPathRef.current = currentPath;

    // Send async telemetry ping during idle to prevent network contention during critical render
    const payload = {
      type: currentPath.startsWith('/projects/') ? 'project_view' : 'pageview',
      path: currentPath,
      title: document.title || currentPath,
      referrer: document.referrer || (typeof window !== 'undefined' ? window.location.href : 'Direct')
    };

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    let handle = null;
    const timer = setTimeout(() => {
      handle = runOnIdle(() => {
        fetch('/api/public/telemetry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => {
          // Silently ignore offline or failed analytics
        });
      }, { timeout: 3000 });
    }, isMobile ? 6000 : 2500);

    return () => {
      clearTimeout(timer);
      cancelIdle(handle);
    };
  }, [location.pathname]);

  return null;
}
