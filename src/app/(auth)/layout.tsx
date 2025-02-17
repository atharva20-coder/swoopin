"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import LandingNav from '@/components/global/landing-nav'

type Props = {
  children: React.ReactNode
}

const motivationalTexts = [
  "Transform your social media presence with intelligent automation.",
  "Join thousands of creators growing their audience effortlessly.",
  "Take your content strategy to the next level with AI-powered tools.",
  "Automate your way to social media success.",
  "Connect, grow, and engage - all in one place."
]

const Layout = ({ children }: Props) => {
  const [motivationalText, setMotivationalText] = useState(motivationalTexts[0])
  const [isTyping, setIsTyping] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const typingDuration = 3000
    const erasingDuration = 1500
    const pauseDuration = 1000

    const animateText = () => {
      // Start typing animation
      setIsTyping(true)
      
      // After typing duration, start erasing
      const typingTimeout = setTimeout(() => {
        setIsTyping(false)
        
        // After erasing, update to next text and restart cycle
        const erasingTimeout = setTimeout(() => {
          const nextIndex = (currentIndex + 1) % motivationalTexts.length
          setCurrentIndex(nextIndex)
          setMotivationalText(motivationalTexts[nextIndex])
        }, erasingDuration + pauseDuration)

        return () => clearTimeout(erasingTimeout)
      }, typingDuration)

      return () => clearTimeout(typingTimeout)
    }

    const interval = setInterval(animateText, typingDuration + erasingDuration + pauseDuration * 2)
    animateText()

    return () => clearInterval(interval)
  }, [currentIndex])

  return (
    <div className="min-h-screen bg-white">
      <LandingNav />
      <div className="flex min-h-screen pt-[72px]">
        <div className="hidden lg:flex w-1/2 bg-[#F5F7FF] items-center justify-center p-8 flex-col gap-6">
          <div className="-mt-12">
            <Image
              src="/images/signin-form.svg"
              alt="Authentication illustration"
              width={150}
              height={242}
              priority
              className="max-w-[80%] h-auto"
            />
          </div>
          <div className="h-20 flex items-center justify-center">
            <p className={`typewriter text-lg text-gray-600 text-center max-w-md font-medium w-[600px] ${isTyping ? 'animate-[typing_2s_steps(40,end)]' : 'animate-[erasing_1s_steps(40,end)]'}`} style={{ width: '600px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {motivationalText}
            </p>
          </div>
        </div>
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Layout