"use client";

import { useEffect, useRef } from 'react';

interface UseScrollRevealProps {
  threshold?: number;
  rootMargin?: string;
}

export const useScrollReveal = ({
  threshold = 0.1,
  rootMargin = '0px',
}: UseScrollRevealProps = {}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add('animate-in');
          observer.unobserve(element);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, rootMargin]);

  return ref;
};