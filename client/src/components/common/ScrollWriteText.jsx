import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

try {
  gsap.registerPlugin(ScrollTrigger);
} catch (_e) {}

const SCRAMBLE_GLYPHS = '✦01XΔ§#░▓※⟡<>{}[]';

/**
 * ScrollWriteText — Top 1% Kinetic Text & Decoder Animation Engine
 *
 * Modes:
 * - 'mask' (Default): Kinetic masked split-text reveal with 3D perspective slide-up (Apple / Stripe standard)
 * - 'words': Staggered fluid ink-blur reveal
 * - 'scramble': Cyberpunk / Linear terminal decoder character shuffle
 * - 'typewriter': Natural cadence character typing with 2px gold laser caret
 * - 'scrub': GSAP ScrollTrigger opacity and keyword scrub tied to scroll velocity
 */
export function ScrollWriteText({
  children,
  text = '',
  as: Tag = 'p',
  inline = false,
  mode = 'mask',
  className = '',
  stagger = 0.032,
  delay = 0.08,
  threshold = 0.15,
  once = true,
  highlightWords = [],
  cursor = true,
  typewriterSpeed = 32,
  scrambleDuration = 24
}) {
  const content = (typeof children === 'string' ? children : text || '').trim();
  const cleanAria = useMemo(() => content.replace(/\*/g, ''), [content]);
  const containerRef = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [typedLength, setTypedLength] = useState(mode === 'typewriter' ? 0 : cleanAria.length);
  const [scrambledText, setScrambledText] = useState(cleanAria);
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
          { opacity: 0.18, y: 6, filter: 'blur(3px)' },
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

  // Mode: Typewriter Effect
  useEffect(() => {
    if (mode !== 'typewriter' || !isRevealed || prefersReducedMotion) {
      if (prefersReducedMotion) setTypedLength(cleanAria.length);
      return;
    }

    setTypedLength(0);
    let currentIdx = 0;
    let timerId;

    const typeNext = () => {
      currentIdx += 1;
      setTypedLength(currentIdx);
      if (currentIdx < cleanAria.length) {
        // Natural human velocity variance (20ms - 45ms)
        const jitter = Math.floor(Math.random() * 18) - 9;
        const nextDelay = Math.max(16, typewriterSpeed + jitter);
        timerId = setTimeout(typeNext, nextDelay);
      }
    };

    timerId = setTimeout(typeNext, delay * 1000);
    return () => clearTimeout(timerId);
  }, [mode, isRevealed, cleanAria, typewriterSpeed, prefersReducedMotion, delay]);

  // Mode: Scramble Decoder Effect
  useEffect(() => {
    if (mode !== 'scramble' || !isRevealed || prefersReducedMotion) {
      setScrambledText(cleanAria);
      return;
    }

    let frame = 0;
    const totalFrames = scrambleDuration;
    const len = cleanAria.length;
    let animId;

    const updateScramble = () => {
      frame++;
      const progress = frame / totalFrames;
      let output = '';

      for (let i = 0; i < len; i++) {
        const charThreshold = (i + 1) / len;
        if (cleanAria[i] === ' ' || cleanAria[i] === '·' || cleanAria[i] === '•') {
          output += cleanAria[i];
        } else if (progress >= charThreshold) {
          output += cleanAria[i];
        } else {
          output += SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)];
        }
      }

      setScrambledText(output);

      if (frame < totalFrames) {
        animId = requestAnimationFrame(updateScramble);
      } else {
        setScrambledText(cleanAria);
      }
    };

    const startTimer = setTimeout(() => {
      animId = requestAnimationFrame(updateScramble);
    }, delay * 1000);

    return () => {
      clearTimeout(startTimer);
      cancelAnimationFrame(animId);
    };
  }, [mode, isRevealed, cleanAria, scrambleDuration, delay, prefersReducedMotion]);

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
        className={`scroll-write-container scroll-write-typewriter ${inline ? 'scroll-write-inline' : ''} ${className}`}
        aria-label={cleanAria}
      >
        <span aria-hidden="true">
          {displayed}
          {cursor && (
            <span
              className={`scroll-typewriter-cursor ${isDone ? 'cursor-blink-slow' : 'cursor-blink-fast'}`}
              aria-hidden="true"
            />
          )}
        </span>
      </Tag>
    );
  }

  // Scramble Decoder Mode Output
  if (mode === 'scramble') {
    return (
      <Tag
        ref={containerRef}
        className={`scroll-write-container scroll-write-decoder ${inline ? 'scroll-write-inline' : ''} ${className}`}
        aria-label={cleanAria}
      >
        <span aria-hidden="true" className="scroll-decoder-inner font-mono">
          {scrambledText}
        </span>
      </Tag>
    );
  }

  // Kinetic Mask (Default) or Words Ink Reveal
  return (
    <Tag
      ref={containerRef}
      className={`scroll-write-container ${inline ? 'scroll-write-inline' : ''} ${isRevealed ? 'is-revealed' : ''} ${className}`}
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
            <span key={index} className="scroll-token-mask">
              <span
                className={`scroll-write-token ${mode === 'chars' ? 'token-char' : 'token-word'} ${
                  isHighlighted ? 'token-highlight' : ''
                } ${isItalic ? 'token-italic' : ''}`}
                style={{
                  transitionDelay: isRevealed ? `${delay + index * stagger}s` : '0s'
                }}
              >
                {tokenText}
                {index < parsedTokens.length - 1 ? '\u00A0' : ''}
              </span>
            </span>
          );
        })}
      </span>
    </Tag>
  );
}
