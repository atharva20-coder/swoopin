"use client"

import React from 'react'
import LandingNav from '@/components/global/landing-nav'

type Props = {
  children: React.ReactNode
}

const Layout = ({ children }: Props) => {
  return (
    <div className="min-h-screen bg-[#F5F0EB] dark:bg-gray-900">
      <LandingNav />
      {/* Add padding-top to account for fixed navbar height */}
      <div className="pt-[72px] md:pt-[80px] lg:pt-[72px]">
        {children}
      </div>
    </div>
  )
}

export default Layout