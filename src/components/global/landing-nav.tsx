import React, { useState } from "react";
import Link from "next/link";
import { Inter } from "next/font/google";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

const LandingNav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className={`${inter.className} fixed top-0 left-0 right-0 z-50 bg-white/30 backdrop-blur-xl border-b border-white/20 shadow-sm`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-[72px] md:h-[80px] lg:h-[72px]">
          {/* Logo and Navigation Links */}
          <div className="flex items-center space-x-4 md:space-x-6 lg:space-x-8">
            <Link href="/" className="font-['Brice'] font-bold text-2xl md:text-2xl lg:text-3xl flex items-center gap-1 text-[#111827]">
              <Image
                src="/landingpage-images/Autcorn-logo.svg"
                alt="Auctorn Logo"
                width={52}
                height={52}
                className="w-10 h-10 md:w-11 md:h-11 lg:w-12 lg:h-12"
              />
            </Link>
            <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
              <Link href="#" className="text-[#111827] text-xs md:text-sm font-medium relative group">
                <span className="relative inline-block">PRODUCT
                  <span className="absolute left-0 bottom-0 w-full h-0.5 bg-[#000000] transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100"></span>
                </span>
              </Link>
              <Link href="#" className="text-[#111827] text-xs md:text-sm font-medium relative group">
                <span className="relative inline-block">SOLUTIONS
                  <span className="absolute left-0 bottom-0 w-full h-0.5 bg-[#000000] transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100"></span>
                </span>
              </Link>
              <Link href="#" className="text-[#111827] text-xs md:text-sm font-medium relative group">
                <span className="relative inline-block">AGENCIES
                  <span className="absolute left-0 bottom-0 w-full h-0.5 bg-[#000000] transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100"></span>
                </span>
              </Link>
              <Link href="#" className="text-[#111827] text-xs md:text-sm font-medium relative group">
                <span className="relative inline-block">PRICING
                  <span className="absolute left-0 bottom-0 w-full h-0.5 bg-[#000000] transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100"></span>
                </span>
              </Link>
              <Link href="#" className="text-[#111827] text-xs md:text-sm font-medium relative group">
                <span className="relative inline-block">RESOURCES
                  <span className="absolute left-0 bottom-0 w-full h-0.5 bg-[#000000] transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100"></span>
                </span>
              </Link>
            </div>
          </div>

          {/* Hamburger Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 ml-auto"
            aria-expanded={isMenuOpen}
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6 text-gray-600 transform transition-transform duration-300 ease-in-out"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                className={`transform transition-transform duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}
                d="M4 6h16"
              />
              <path
                className={`transform transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}
                d="M4 12h16"
              />
              <path
                className={`transform transition-transform duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}
                d="M4 18h16"
              />
            </svg>
          </button>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6 ml-auto">
            <Link href="/dashboard" className="group relative text-xs md:text-sm font-medium text-[#111827] hover:text-[#4F46E5] px-4 md:px-6 py-2 md:py-2.5 rounded-lg border border-[#111827] hover:border-[#4F46E5] transition-all duration-300 overflow-hidden hover:rounded-none">
              <span className="relative z-10 flex items-center justify-center gap-2 w-full">
                <span className="absolute left-0 transform -translate-x-6 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
                <span className="transform group-hover:translate-x-3 transition-transform duration-300">SIGN IN</span>
              </span>
            </Link>
            <Link href="/dashboard" className="group relative bg-black text-white px-4 md:px-6 py-2 md:py-2.5 text-xs md:text-sm font-medium rounded-lg transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden hover:bg-[#1a1a1a] hover:rounded-none">
              <span className="relative z-10 flex items-center justify-center gap-2 w-full">
                <span className="absolute left-0 transform -translate-x-6 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
                <span className="transform group-hover:translate-x-3 transition-transform duration-300">GET STARTED</span>
              </span>
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden absolute left-0 right-0 top-[72px] bg-white border-b border-gray-200 shadow-lg transform transition-all duration-300 ease-in-out origin-top ${isMenuOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'}`}
        >
          <div className="h-[calc(100vh-72px)] overflow-y-auto px-4 pt-2 pb-8 space-y-4 flex flex-col">
            <div className="flex-1 space-y-4">
              <Link href="#" className="block text-[#111827] text-base font-medium relative group py-4 px-3">
                <span className="relative inline-block">PRODUCT
                  <span className="absolute left-0 bottom-0 w-full h-0.5 bg-[#4F46E5] transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100"></span>
                </span>
              </Link>
              <Link href="#" className="block text-[#111827] text-base font-medium relative group py-4 px-3">
                <span className="relative inline-block">SOLUTIONS
                  <span className="absolute left-0 bottom-0 w-full h-0.5 bg-[#4F46E5] transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100"></span>
                </span>
              </Link>
              <Link href="#" className="block text-[#111827] text-base font-medium relative group py-4 px-3">
                <span className="relative inline-block">AGENCIES
                  <span className="absolute left-0 bottom-0 w-full h-0.5 bg-[#4F46E5] transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100"></span>
                </span>
              </Link>
              <Link href="#" className="block text-[#111827] text-base font-medium relative group py-4 px-3">
                <span className="relative inline-block">PRICING
                  <span className="absolute left-0 bottom-0 w-full h-0.5 bg-[#4F46E5] transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100"></span>
                </span>
              </Link>
              <Link href="#" className="block text-[#111827] text-base font-medium relative group py-4 px-3">
                <span className="relative inline-block">RESOURCES
                  <span className="absolute left-0 bottom-0 w-full h-0.5 bg-[#4F46E5] transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100"></span>
                </span>
              </Link>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <Link href="/dashboard" className="group relative block text-sm font-medium text-[#111827] hover:text-[#4F46E5] px-6 py-2.5 rounded-lg border border-[#111827] hover:border-[#4F46E5] transition-all duration-300 overflow-hidden hover:rounded-none">
                <span className="relative z-10 flex items-center justify-center gap-2 w-full">
                  <span className="absolute left-0 transform -translate-x-6 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                  <span className="transform group-hover:translate-x-3 transition-transform duration-300">SIGN IN</span>
                </span>
              </Link>
              <Link href="/dashboard" className="group relative block bg-black text-white px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden hover:bg-[#1a1a1a] hover:rounded-none mt-4">
                <span className="relative z-10 flex items-center justify-center gap-2 w-full">
                  <span className="absolute left-0 transform -translate-x-6 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                  <span className="transform group-hover:translate-x-3 transition-transform duration-300">GET STARTED</span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default LandingNav;