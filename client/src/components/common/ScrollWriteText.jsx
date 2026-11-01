import React, { useEffect, useRef, useState, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

try {
  gsap.registerPlugin(ScrollTrigger);
} catch (_e) {}

/**
 * ScrollWriteText
 * Award-winning scroll-driven and scroll-triggered text reveal animations.
 *
 * Modes:
 * - 'words': Staggered ink-reveal word by word (default)
 * - 'chars': Fine-grained character reveal
 * - 'typewriter': Real typewriter character typing with blinking gold caret
 * - 'scrub': GSAP ScrollTrigger opacity scrubber tied directly to scroll progress
 */
export function ScrollWriteText({
  children,
  text = '',
  as: Tag = 'p',
  mode = 'words',
  className = '',
  stagger = 0.028,
  delay = 0.08,
  threshold = 0.15,
  once = true,
  highlightWords = [],
  cursor = true,
  typewriterSpeed = 38
}) {
  const content = (typeof children === 'string' ? children : text || '').trim();
  const cleanAria = useMemo(() => content.replace(/\*/g, ''), [content]);
  const containerRef = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [typedLength, setTypedLength] = useState(mode === 'typewriter' ? 0 : cleanAria.length);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check reduced motion preference
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(media.matches);
      const listener = (e) => setPrefersReducedMotion(e.matches);
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, []);

  // Parse words with support for multi-word markdown *italic* phrases
  const parsedTokens = useMemo(() => {
    if (!content) return [];
    if (mode === 'chars') {
      return cleanAria.split('').map((char) => ({ text: char, isItalic: false }));
    }

    const result = [];
    const rawTokens = content.split(/\s+/).filter(Boolean);
    let insideItalic = false;

    for (const raw of rawTokens) {
      let word = raw;
      let isItalic = insideItalic;

      if (word.startsWith('*') && word.endsWith('*') && word.length > 2) {
        word = word.slice(1, -1);
        isItalic = true;
      } else if (word.startsWith('*')) {
        word = word.slice(1);
        insideItalic = true;
        isItalic = true;
      } else if (word.endsWith('*')) {
        word = word.slice(0, -1);
        insideItalic = false;
        isItalic = true;
      }

      result.push({ text: word, isItalic });
    }

    return result;
  }, [content, cleanAria, mode]);

  // Handle intersection / scroll activation
  useEffect(() => {
    const el = containerRef.current;
    if (!el || prefersReducedMotion) {
      setIsRevealed(true);
      if (mode === 'typewriter') setTypedLength(cleanAria.length);
      return;
    }

    if (mode === 'scrub') {
      const words = el.querySelectorAll('.scroll-write-token');
      if (words.length > 0) {
        const tween = gsap.fromTo(
          words,
          { opacity: 0.18, y: 4, filter: 'blur(3px)' },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            stagger: 0.04,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              end: 'bottom 55%',
              scrub: 0.8
            }
          }
        );

        return () => {
          if (tween.scrollTrigger) tween.scrollTrigger.kill();
          tween.kill();
        };
      }
      return;
    }

    // IntersectionObserver for 'words', 'chars', or 'typewriter'
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsRevealed(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setIsRevealed(false);
          }
        });
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, threshold, mode, prefersReducedMotion, cleanAria.length]);

  // Typewriter effect interval
  useEffect(() => {
    if (mode !== 'typewriter' || !isRevealed || prefersReducedMotion) {
      if (prefersReducedMotion) setTypedLength(cleanAria.length);
      return;
    }

    setTypedLength(0);
    let currentIdx = 0;
    const interval = setInterval(() => {
      currentIdx += 1;
      setTypedLength(currentIdx);
      if (currentIdx >= cleanAria.length) {
        clearInterval(interval);
      }
    }, typewriterSpeed);

    return () => clearInterval(interval);
  }, [mode, isRevealed, cleanAria, typewriterSpeed, prefersReducedMotion]);

  // If reduced motion is requested, render plain text immediately
  if (prefersReducedMotion) {
    return <Tag className={className}>{cleanAria}</Tag>;
  }

  // Typewriter Mode Output
  if (mode === 'typewriter') {
    const displayed = cleanAria.slice(0, typedLength);
    const isDone = typedLength >= cleanAria.length;

    return (
      <Tag
        ref={containerRef}
        className={`scroll-write-container scroll-write-typewriter ${className}`}
        aria-label={cleanAria}
      >
        <span aria-hidden="true">
          {displayed}
          {cursor && (
            <span
              className={`scroll-typewriter-cursor ${isDone ? 'cursor-blink-slow' : 'cursor-blink-fast'}`}
            >
              |
            </span>
          )}
        </span>
      </Tag>
    );
  }

  // Words or Chars Stagger Mode Output
  return (
    <Tag
      ref={containerRef}
      className={`scroll-write-container ${isRevealed ? 'is-revealed' : ''} ${className}`}
      aria-label={cleanAria}
    >
      <span aria-hidden="true" className="scroll-write-inner">
        {parsedTokens.map((tokenObj, index) => {
          const tokenText = tokenObj.text;
          const cleanToken = tokenText.replace(/^[^\w]+|[^\w]+$/g, '').toLowerCase();
          const isHighlighted = highlightWords.some(
            (hw) => hw.toLowerCase() === cleanToken || tokenText.toLowerCase().includes(hw.toLowerCase())
          );
          const isItalic = tokenObj.isItalic;

          return (
            <span
              key={index}
              className={`scroll-write-token ${mode === 'chars' ? 'token-char' : 'token-word'} ${
                isHighlighted ? 'token-highlight' : ''
              } ${isItalic ? 'token-italic' : ''}`}
              style={{
                transitionDelay: isRevealed ? `${delay + index * stagger}s` : '0s'
              }}
            >
              {tokenText}
              {mode === 'words' && index < parsedTokens.length - 1 ? '\u00A0' : ''}
            </span>
          );
        })}
      </span>
    </Tag>
  );
}
