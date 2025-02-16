import Image from 'next/image'
import { useRef, useEffect } from 'react'

export const BrandsSection = () => {
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleScroll = () => {
            if (scrollRef.current) {
                const scrollPosition = window.scrollY
                const speed = 0.2
                scrollRef.current.style.transform = `translateX(${-scrollPosition * speed}px)`
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div className="w-full py-16 overflow-hidden bg-background">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12">Trusted by 1M+ Businesses</h2>
                <div className="relative">
                    <div 
                        ref={scrollRef}
                        className="flex space-x-12 transition-transform duration-300 animate-scroll"
                        style={{ minWidth: 'max-content' }}
                    >
                        <div className="flex-shrink-0">
                            <Image
                                src="/brands/brands_amy-logo.avif"
                                alt="Amy Logo"
                                width={120}
                                height={60}
                                className="object-contain"
                            />
                        </div>
                        <div className="flex-shrink-0">
                            <Image
                                src="/brands/brands_benefit-logo.avif"
                                alt="Benefit Logo"
                                width={120}
                                height={60}
                                className="object-contain"
                            />
                        </div>
                        <div className="flex-shrink-0">
                            <Image
                                src="/brands/brands_hotmart-logo.png"
                                alt="Hotmart Logo"
                                width={120}
                                height={60}
                                className="object-contain"
                            />
                        </div>
                        <div className="flex-shrink-0">
                            <Image
                                src="/brands/brands_jenna-logo.svg"
                                alt="Jenna Logo"
                                width={120}
                                height={60}
                                className="object-contain"
                            />
                        </div>
                        <div className="flex-shrink-0">
                            <Image
                                src="/brands/brands_sugar-logo.avif"
                                alt="Sugar Logo"
                                width={120}
                                height={60}
                                className="object-contain"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}