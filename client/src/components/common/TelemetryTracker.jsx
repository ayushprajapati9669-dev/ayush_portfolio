import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export function TelemetryTracker() {
  const location = useLocation();
  const lastPathRef = useRef('');

  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath === lastPathRef.current) return;
    lastPathRef.current = currentPath;

    // Send async telemetry ping
    const payload = {
      type: currentPath.startsWith('/projects/') ? 'project_view' : 'pageview',
      path: currentPath,
      title: document.title || currentPath,
      referrer: document.referrer || (typeof window !== 'undefined' ? window.location.href : 'Direct')
    };

    fetch('/api/public/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {
      // Silently ignore offline or failed analytics
    });
  }, [location.pathname]);

  return null;
}
