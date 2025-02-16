'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

const brandLogos = [
    { src: '/brands/Jenna Kuther image.svg', alt: 'Jenna Kuther' },
    { src: '/brands/Mindvalley image.svg', alt: 'Mindvalley' },
    { src: '/brands/Nike image.svg', alt: 'Nike' },
    { src: '/brands/brands_amy-logo.avif', alt: 'Amy' },
    { src: '/brands/brands_benefit-logo.avif', alt: 'Benefit' },
    { src: '/brands/brands_hotmart-logo.png', alt: 'Hotmart' },
    { src: '/brands/brands_jenna-logo.svg', alt: 'Jenna' },
    { src: '/brands/brands_sugar-logo.avif', alt: 'Sugar' },
];

export function Brands() {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer) return;

        const scroll = () => {
            if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
                scrollContainer.scrollLeft = 0;
            } else {
                scrollContainer.scrollLeft += 1;
            }
        };

        const timer = setInterval(scroll, 30);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="w-full overflow-hidden bg-background py-12">
            <div
                ref={scrollRef}
                className="flex gap-8 overflow-hidden whitespace-nowrap"
                style={{
                    maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
                    WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
                }}
            >
                {/* First set of logos */}
                {brandLogos.map((logo, index) => (
                    <div
                        key={`logo-1-${index}`}
                        className="relative h-16 w-32 flex-shrink-0"
                    >
                        <Image
                            src={logo.src}
                            alt={logo.alt}
                            fill
                            className="object-contain"
                        />
                    </div>
                ))}
                {/* Duplicate set for seamless loop */}
                {brandLogos.map((logo, index) => (
                    <div
                        key={`logo-2-${index}`}
                        className="relative h-16 w-32 flex-shrink-0"
                    >
                        <Image
                            src={logo.src}
                            alt={logo.alt}
                            fill
                            className="object-contain"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}