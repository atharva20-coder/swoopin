import Image from 'next/image'
import { useRef, useEffect } from 'react'

export const ChatInterface = () => {
    const backgroundRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleScroll = () => {
            if (backgroundRef.current) {
                const scrollPosition = window.scrollY
                backgroundRef.current.style.transform = `translateY(${-scrollPosition * 0.3}px)`
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div className="relative w-[320px] h-[650px] mx-auto perspective-[1000px]">
            {/* Phone Frame */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 338 663"
                fill="none"
                className="absolute top-0 left-0 w-full h-full z-10"
                width="320"
                height="650"
            >
                <rect
                    width="325.371"
                    height="650"
                    x="6.449"
                    y="6.449"
                    stroke="#000000"
                    strokeWidth="11.102px"
                    rx="39.711"
                    fill="none"
                />
            </svg>
    
            {/* Scrolling Background */}
            <div 
                ref={backgroundRef}
                className="absolute top-[6.449px] left-[6.449px] w-[calc(100% - 12.898px)] h-[calc(100% - 12.898px)] overflow-hidden"
                style={{
                    clipPath: 'inset(0 0 0 0 round 39.711px)',
                    transform: 'translateY(0)',
                    maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)'
                }}
            >
                <Image
                    src="/header/svgexport-8.svg"
                    alt="Phone Background"
                    width={325}
                    height={1135}
                    className="w-full h-full object-cover"
                    priority
                />
            </div>

            {/* Chat Content */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden px-4 py-6 z-20">
                <div className="flex flex-col space-y-4">
                    {/* User Message 1 */}
                    <div className="flex items-end justify-end space-x-2">
                        <div className="bg-[#F4DAFF] rounded-[28px] px-6 py-4 shadow-md transform hover:scale-105 transition-all duration-300 hover:z-30 relative max-w-[240px]">
                            <p className="text-black text-sm">Get 10% off my first order</p>
                        </div>
                        <div className="w-10 h-10 rounded-full overflow-hidden shadow-md">
                            <Image
                                src="/header/avatar.png"
                                alt="User Avatar"
                                width={40}
                                height={40}
                            />
                        </div>
                    </div>

                    {/* Bot Message 1 */}
                    <div className="flex items-end space-x-2">
                        <div className="w-10 h-10 shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 56 56" fill="none">
                                <mask id="mask0" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="56" height="56">
                                    <circle cx="28" cy="28" r="28" fill="#D9D9D9"/>
                                </mask>
                                <g mask="url(#mask0)">
                                    <circle cx="28" cy="28" r="28" fill="#F4F3B0"/>
                                </g>
                                <path d="M32.5713 13L32.5713 18" stroke="black" strokeWidth="2"/>
                                <path d="M35.6419 11C35.6419 12.6402 34.2835 14 32.5705 14C30.8574 14 29.499 12.6402 29.499 11C29.499 9.35976 30.8574 8 32.5705 8C34.2835 8 35.6419 9.35976 35.6419 11Z" fill="black" stroke="black" strokeWidth="2"/>
                                <path d="M22.647 41.675L22.6417 40.6803H21.647H21.5634C15.274 40.6803 10.1602 35.5851 10.1602 29.3401C10.1602 23.0952 15.274 18 21.5634 18H35.4355C41.7248 18 46.8387 23.0952 46.8387 29.3401C46.8387 35.5851 41.7248 40.6803 35.4355 40.6803H29.8545H29.513L29.2429 40.8891L22.6697 45.9711L22.647 41.675Z" fill="black" stroke="black" strokeWidth="2"/>
                                <path d="M26.4633 29.0889C26.4633 26.4222 25.6803 25 23.9187 25C22.157 25 21.374 26.4222 21.374 29.0889C21.374 31.5778 22.157 33 23.9187 33C25.6803 33 26.4633 31.5778 26.4633 29.0889Z" fill="#F4F3B0"/>
                                <path d="M35.6244 29.0889C35.6244 26.4222 34.8415 25 33.0798 25C31.3181 25 30.5352 26.4222 30.5352 29.0889C30.5352 31.5778 31.3181 33 33.0798 33C34.8415 33 35.6244 31.5778 35.6244 29.0889Z" fill="#F4F3B0"/>
                            </svg>
                        </div>
                        <div className="bg-[#F4DAFF] rounded-[28px] px-6 py-4 shadow-md transform hover:scale-105 transition-all duration-300 hover:z-30 relative max-w-[240px]">
                            <p className="text-black text-sm">Sure! Confirm your email address ✨</p>
                        </div>
                    </div>

                    {/* User Message 2 */}
                    <div className="flex items-end justify-end space-x-2">
                        <div className="bg-[#F4DAFF] rounded-[28px] px-6 py-4 shadow-md transform hover:scale-105 transition-all duration-300 hover:z-30 relative max-w-[240px]">
                            <p className="text-black text-sm">josie@auctorn.com</p>
                        </div>
                        <div className="w-10 h-10 rounded-full overflow-hidden shadow-md">
                            <Image
                                src="/header/avatar.png"
                                alt="User Avatar"
                                width={40}
                                height={40}
                            />
                        </div>
                    </div>

                    {/* Bot Message 2 */}
                    <div className="flex items-end space-x-2">
                        <div className="w-10 h-10 shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 56 56" fill="none">
                                <mask id="mask1" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="56" height="56">
                                    <circle cx="28" cy="28" r="28" fill="#D9D9D9"/>
                                </mask>
                                <g mask="url(#mask1)">
                                    <circle cx="28" cy="28" r="28" fill="#F4F3B0"/>
                                </g>
                                <path d="M32.5713 13L32.5713 18" stroke="black" strokeWidth="2"/>
                                <path d="M35.6419 11C35.6419 12.6402 34.2835 14 32.5705 14C30.8574 14 29.499 12.6402 29.499 11C29.499 9.35976 30.8574 8 32.5705 8C34.2835 8 35.6419 9.35976 35.6419 11Z" fill="black" stroke="black" strokeWidth="2"/>
                                <path d="M22.647 41.675L22.6417 40.6803H21.647H21.5634C15.274 40.6803 10.1602 35.5851 10.1602 29.3401C10.1602 23.0952 15.274 18 21.5634 18H35.4355C41.7248 18 46.8387 23.0952 46.8387 29.3401C46.8387 35.5851 41.7248 40.6803 35.4355 40.6803H29.8545H29.513L29.2429 40.8891L22.6697 45.9711L22.647 41.675Z" fill="black" stroke="black" strokeWidth="2"/>
                                <path d="M26.4633 29.0889C26.4633 26.4222 25.6803 25 23.9187 25C22.157 25 21.374 26.4222 21.374 29.0889C21.374 31.5778 22.157 33 23.9187 33C25.6803 33 26.4633 31.5778 26.4633 29.0889Z" fill="#F4F3B0"/>
                                <path d="M35.6244 29.0889C35.6244 26.4222 34.8415 25 33.0798 25C31.3181 25 30.5352 26.4222 30.5352 29.0889C30.5352 31.5778 31.3181 33 33.0798 33C34.8415 33 35.6244 31.5778 35.6244 29.0889Z" fill="#F4F3B0"/>
                            </svg>
                        </div>
                        <div className="bg-[#F4F4B0] rounded-[28px] px-6 py-4 shadow-md transform hover:scale-105 transition-all duration-300 hover:z-30 relative max-w-[240px]">
                            <p className="text-black text-sm">Use code WELCOME10 at checkout</p>
                        </div>
                    </div>

                    {/* Shop Now Button */}
                    <div className="flex justify-center mt-4">
                        <button className="bg-white text-black px-8 py-3 rounded-full font-medium flex items-center space-x-2 shadow-lg transform hover:translate-z-4 hover:scale-105 transition-all duration-300 hover:z-30 relative">
                            <span>Shop Now</span>
                            <span>🎁</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
