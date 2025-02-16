"use client";

import { useEffect, useRef } from 'react';

export const useCarouselScroll = () => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const scroll = () => {
      if (!scrollContainer) return;

      const currentScroll = scrollContainer.scrollLeft;
      const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;

      // Reset to start when reaching the end
      if (currentScroll >= maxScroll) {
        scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        // Scroll by one card width (280px + gap)
        scrollContainer.scrollTo({
          left: currentScroll + 284,
          behavior: 'smooth'
        });
      }
    };

    const intervalId = setInterval(scroll, 3000); // Scroll every 3 seconds

    return () => clearInterval(intervalId);
  }, []);

  return scrollRef;
};