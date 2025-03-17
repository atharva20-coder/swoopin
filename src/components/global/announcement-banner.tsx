"use client";

import { useEffect, useRef, useState } from 'react';

export const AnnouncementBanner = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const scrollContent = scrollContainer.firstElementChild as HTMLElement;
    if (!scrollContent) return;

    const scrollWidth = scrollContent.offsetWidth;
    let position = scrollContainer.offsetWidth;

    const animate = () => {
      position--;
      if (position <= -scrollWidth) {
        position = scrollContainer.offsetWidth;
      }
      scrollContent.style.transform = `translateX(${position}px)`;
      requestAnimationFrame(animate);
    };

    const animation = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animation);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="sticky top-[72px] w-full bg-fuchsia-500 z-40 overflow-hidden py-2">
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
        aria-label="Close announcement"
      >
        ✕
      </button>
      <div ref={scrollRef} className="relative whitespace-nowrap pr-12">
         <div className="inline-block text-white font-medium">
          🚀 Limited Time Offer: Be Among the First Few Users! ✨ Get 5% OFF + 1 Month Premium Access FREE 🎁 • <a href="/waitlist" className="underline hover:text-blue-400 transition-colors">Join Waitlist Now</a> 🌟 • Exclusive Early-Bird Benefits Ending Soon ⏰ &nbsp;&nbsp;&nbsp;
          🚀 Limited Time Offer: Be Among the First Few Users! ✨ Get 5% OFF + 1 Month Premium Access FREE 🎁 • <a href="/waitlist" className="underline hover:text-blue-400 transition-colors">Join Waitlist Now</a> 🌟 • Exclusive Early-Bird Benefits Ending Soon ⏰ &nbsp;&nbsp;&nbsp;
        </div>
      </div>
    </div>
  );
};