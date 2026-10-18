import { useState, useEffect } from 'react';

export function useLiveClock() {
  const formatClock = () => {
    try {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      return `${timeStr} IST`;
    } catch (_e) {
      return 'IST (UTC+5:30)';
    }
  };

  const [clockText, setClockText] = useState(formatClock);

  useEffect(() => {
    const timer = setInterval(() => {
      setClockText(formatClock());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  return clockText;
}
