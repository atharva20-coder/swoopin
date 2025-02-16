"use client"

import { useRef, useEffect } from 'react'
import Image from 'next/image'

export const InfiniteBrands = () => {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleScroll = () => {
            if (containerRef.current) {
                const scrollPosition = window.scrollY
                const translateX = (scrollPosition * 0.5) % 100
                containerRef.current.style.transform = `translateX(-${translateX}%)`
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const brands = [
        "/brands/brands_benefit-logo.avif",
        "/brands/brands_hotmart-logo.png",
        "/brands/brands_jenna-logo.svg",
        "/brands/brands_sugar-logo.avif",
        "/brands/brands_amy-logo.avif"
    ]

    // Duplicate brands array for seamless infinite scroll
    const allBrands = [...brands, ...brands]

    return (
        <div className="w-full overflow-hidden bg-background py-12">
            <div 
                ref={containerRef}
                className="flex transition-transform duration-100 ease-linear"
                style={{ width: `${200}%` }}
            >
                {allBrands.map((brand, index) => (
                    <div 
                        key={index}
                        className="flex-shrink-0 px-8"
                        style={{ width: `${100 / allBrands.length}%` }}
                    >
                        <Image
                            src={brand}
                            alt="Brand Logo"
                            width={150}
                            height={60}
                            className="w-auto h-12 object-contain"
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}