"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import LandingNav from '@/components/global/landing-nav'

type Props = {
  children: React.ReactNode
}

const motivationalTexts = [
  "Transform your social media presence with intelligent automation.",
  "Elevate your brand with AI-powered social engagement.",
  "Streamline your social strategy with smart automation tools.",
  "Unlock the power of automated social media management."
]

const Layout = ({ children }: Props) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false)
      
      setTimeout(() => {
        setCurrentTextIndex((prevIndex) => (prevIndex + 1) % motivationalTexts.length)
        setIsVisible(true)
      }, 300) // Wait for fade out before changing text
    }, 3000) // Change text every 4 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <LandingNav />
      <div className="flex min-h-screen pt-[72px]">
        <div className="hidden lg:flex w-1/2 bg-[#F5F7FF] items-center justify-center p-8 flex-col gap-6">
          <div className="-mt-24">
            <Image
              src="/images/signin-form.svg"
              alt="Authentication illustration"
              width={150}
              height={242}
              priority
              className="max-w-[80%] h-auto"
            />
          </div>
          <div className="h-auto flex items-center justify-center">
            <p 
              className={`text-lg text-gray-600 text-center font-medium transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            >
              {motivationalTexts[currentTextIndex]}
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