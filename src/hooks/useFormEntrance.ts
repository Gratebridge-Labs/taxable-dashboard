'use client';
import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

interface FormEntranceOptions {
  duration?: number;
  stagger?: number;
  y?: number;
  ease?: string;
}

export function useFormEntrance<T extends HTMLElement>(
  options: FormEntranceOptions = {}
) {
  const ref = useRef<T>(null);
  const { duration = 0.6, stagger = 0.04, y = 12, ease = 'power2.out' } = options;

  useLayoutEffect(() => {
    if (!ref.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set('[data-animate]', { opacity: 1, y: 0, clearProps: 'all' });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-animate]',
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration,
          stagger,
          ease,
          onStart: () => gsap.set('[data-animate]', { transition: 'none' }),
          onComplete: () => gsap.set('[data-animate]', { clearProps: 'transition' }),
        }
      );
    }, ref);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
}