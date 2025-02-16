import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

const LandingNav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className={`${inter.className} fixed top-0 left-0 right-0 z-50 bg-white/30 backdrop-blur-xl border-b border-white/20 shadow-sm`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold flex items-center">
              <Image src="/images/manychat-logo.svg" alt="Manychat" width={130} height={32} />
            </Link>
          </div>

          {/* Hamburger Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2"
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

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#" className="text-[#111827] text-sm font-medium hover:text-[#4F46E5] transition-colors">
              PRODUCT
            </Link>
            <Link href="#" className="text-[#111827] text-sm font-medium hover:text-[#4F46E5] transition-colors">
              SOLUTIONS
            </Link>
            <Link href="#" className="text-[#111827] text-sm font-medium hover:text-[#4F46E5] transition-colors">
              AGENCIES
            </Link>
            <Link href="#" className="text-[#111827] text-sm font-medium hover:text-[#4F46E5] transition-colors">
              PRICING
            </Link>
            <Link href="#" className="text-[#111827] text-sm font-medium hover:text-[#4F46E5] transition-colors">
              RESOURCES
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/dashboard" className="text-sm font-medium text-[#111827] hover:text-[#4F46E5] transition-colors">
              SIGN IN
            </Link>
            <Link href="/dashboard" className="bg-[#4F46E5] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#4338CA] transition-colors shadow-sm hover:shadow-md">
              GET STARTED
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden absolute left-0 right-0 top-[72px] bg-white border-b border-gray-200 shadow-lg transform transition-all duration-300 ease-in-out origin-top ${isMenuOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'}`}
        >
          <div className="h-[calc(100vh-72px)] overflow-y-auto px-4 pt-2 pb-8 space-y-4 flex flex-col">
            <div className="flex-1 space-y-4">
              <Link href="#" className="block text-[#111827] text-sm font-medium hover:text-[#4F46E5] transition-colors py-2">
                PRODUCT
              </Link>
              <Link href="#" className="block text-[#111827] text-sm font-medium hover:text-[#4F46E5] transition-colors py-2">
                SOLUTIONS
              </Link>
              <Link href="#" className="block text-[#111827] text-sm font-medium hover:text-[#4F46E5] transition-colors py-2">
                AGENCIES
              </Link>
              <Link href="#" className="block text-[#111827] text-sm font-medium hover:text-[#4F46E5] transition-colors py-2">
                PRICING
              </Link>
              <Link href="#" className="block text-[#111827] text-sm font-medium hover:text-[#4F46E5] transition-colors py-2">
                RESOURCES
              </Link>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <Link href="/dashboard" className="block text-sm font-medium text-[#111827] hover:text-[#4F46E5] transition-colors py-2">
                SIGN IN
              </Link>
              <Link href="/dashboard" className="block bg-[#4F46E5] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#4338CA] transition-colors shadow-sm hover:shadow-md text-center mt-4">
                GET STARTED
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default LandingNav;