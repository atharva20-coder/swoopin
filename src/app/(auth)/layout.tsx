"use client"

import React from 'react'
import Image from 'next/image'
import LandingNav from '@/components/global/landing-nav'

type Props = {
  children: React.ReactNode
}

const Layout = ({ children }: Props) => {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <LandingNav />
      <div className="flex min-h-screen items-center justify-center px-4 py-16">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-3">
            <Image
              src="/landingpage-images/Autcorn-logo.svg"
              alt="Logo"
              width={56}
              height={56}
              className="mx-auto"
              priority
            />
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Welcome to Auctorn</h2>
            <p className="text-base text-gray-600">Try Auctorn for free</p>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
          </div>
          
          {children}
        </div>
      </div>
    </div>
  )
}

export default Layout