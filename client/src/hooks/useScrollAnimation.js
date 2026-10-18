import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function useScrollAnimation(dependencyKey) {
  useEffect(() => {
    try {
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.getAll().forEach(t => t.kill());
      const revealBlocks = document.querySelectorAll('.scroll-reveal');
      revealBlocks.forEach((el, idx) => {
        gsap.fromTo(
          el,
          { opacity: 0.85, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            delay: (idx % 3) * 0.05,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 92%',
              toggleActions: 'play none none none'
            }
          }
        );
      });
      ScrollTrigger.refresh();
    } catch (_err) {
      // Fallback if ScrollTrigger is unavailable in test environment
    }
  }, [dependencyKey]);
}
