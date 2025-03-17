import React, { useState } from "react";
import Link from "next/link";
import { Inter } from "next/font/google";
import Image from "next/image";
import { useTheme } from "@/contexts/theme-context";

const inter = Inter({ subsets: ["latin"] });

const LandingNav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className={`${inter.className} fixed top-0 left-0 right-0 z-50 bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl border-b border-white/20 dark:border-gray-800/20 shadow-sm`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-[72px] md:h-[80px] lg:h-[72px]">
          {/* Logo and Navigation Links */}
          <div className="flex items-center space-x-4 md:space-x-6 lg:space-x-8">
            <Link href="/" className="font-['Brice'] font-bold text-2xl md:text-2xl lg:text-3xl flex items-center gap-1 text-gray-900 dark:text-white">
              <Image
                src="/landingpage-images/Autcorn-logo.svg"
                alt="Auctorn Logo"
                width={52}
                height={52}
                className="w-10 h-10 md:w-11 md:h-11 lg:w-12 lg:h-12"
              />
            </Link>
            <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
              <Link href="#" className="text-gray-900 dark:text-white text-xs md:text-sm font-medium relative group">
                <span className="relative inline-block">PRODUCT
                  <span className="absolute left-0 bottom-0 w-full h-0.5 bg-gray-900 dark:bg-white transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100"></span>
                </span>
              </Link>
              <Link href="#" className="text-gray-900 dark:text-white text-xs md:text-sm font-medium relative group">
                <span className="relative inline-block">SOLUTIONS
                  <span className="absolute left-0 bottom-0 w-full h-0.5 bg-gray-900 dark:bg-white transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100"></span>
                </span>
              </Link>
              <Link href="#" className="text-gray-900 dark:text-white text-xs md:text-sm font-medium relative group">
                <span className="relative inline-block">AGENCIES
                  <span className="absolute left-0 bottom-0 w-full h-0.5 bg-gray-900 dark:bg-white transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100"></span>
                </span>
              </Link>
              <Link href="#" className="text-gray-900 dark:text-white text-xs md:text-sm font-medium relative group">
                <span className="relative inline-block">PRICING
                  <span className="absolute left-0 bottom-0 w-full h-0.5 bg-gray-900 dark:bg-white transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100"></span>
                </span>
              </Link>
              <Link href="#" className="text-gray-900 dark:text-white text-xs md:text-sm font-medium relative group">
                <span className="relative inline-block">RESOURCES
                  <span className="absolute left-0 bottom-0 w-full h-0.5 bg-gray-900 dark:bg-white transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100"></span>
                </span>
              </Link>
            </div>
          </div>

          {/* Hamburger Menu */}
          <div className="flex items-center gap-4 ml-auto">
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2"
              aria-expanded={isMenuOpen}
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6 text-gray-600 dark:text-gray-300 transform transition-transform duration-300 ease-in-out"
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
            <button
              onClick={toggleTheme}
              className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg
                  className="w-5 h-5 text-gray-900 dark:text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-gray-900 dark:text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6 ml-4">
            <Link href="/dashboard" className="group relative text-xs md:text-sm font-medium text-gray-900 dark:text-white hover:text-[#4F46E5] dark:hover:text-[#4F46E5] px-4 md:px-6 py-2 md:py-2.5 rounded-lg border border-gray-900 dark:border-white hover:border-[#4F46E5] dark:hover:border-[#4F46E5] transition-all duration-300 overflow-hidden hover:rounded-none">
              <span className="relative z-10 flex items-center justify-center gap-2 w-full">
                <span className="absolute left-0 transform -translate-x-6 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
                <span className="transform group-hover:translate-x-3 transition-transform duration-300">SIGN IN</span>
              </span>
            </Link>
            <Link href="/dashboard" className="group relative bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 md:px-6 py-2 md:py-2.5 text-xs md:text-sm font-medium rounded-lg transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden hover:bg-[#1a1a1a] dark:hover:bg-gray-100 hover:rounded-none">
              <span className="relative z-10 flex items-center justify-center gap-2 w-full">
                <span className="absolute left-0 transform -translate-x-6 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
                <span className="transform group-hover:translate-x-3 transition-transform duration-300">GET STARTED</span>
              </span>
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg
                  className="w-5 h-5 text-gray-900 dark:text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-gray-900 dark:text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden absolute left-0 right-0 top-[72px] bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-lg transform transition-all duration-300 ease-in-out origin-top ${isMenuOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'}`}
        >
          <div className="h-[calc(100vh-72px)] overflow-y-auto px-4 pt-2 pb-8 space-y-4 flex flex-col">
            <div className="flex-1 space-y-4">
              <Link href="#" className="block text-gray-900 dark:text-white text-base font-medium relative group py-4 px-3">
                <span className="relative inline-block">PRODUCT
                  <span className="absolute left-0 bottom-0 w-full h-0.5 bg-[#4F46E5] transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100"></span>
                </span>
              </Link>
              <Link href="#" className="block text-gray-900 dark:text-white text-base font-medium relative group py-4 px-3">
                <span className="relative inline-block">SOLUTIONS
                  <span className="absolute left-0 bottom-0 w-full h-0.5 bg-[#4F46E5] transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100"></span>
                </span>
              </Link>
              <Link href="#" className="block text-gray-900 dark:text-white text-base font-medium relative group py-4 px-3">
                <span className="relative inline-block">AGENCIES
                  <span className="absolute left-0 bottom-0 w-full h-0.5 bg-[#4F46E5] transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100"></span>
                </span>
              </Link>
              <Link href="#" className="block text-gray-900 dark:text-white text-base font-medium relative group py-4 px-3">
                <span className="relative inline-block">PRICING
                  <span className="absolute left-0 bottom-0 w-full h-0.5 bg-[#4F46E5] transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100"></span>
                </span>
              </Link>
              <Link href="#" className="block text-gray-900 dark:text-white text-base font-medium relative group py-4 px-3">
                <span className="relative inline-block">RESOURCES
                  <span className="absolute left-0 bottom-0 w-full h-0.5 bg-[#4F46E5] transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100"></span>
                </span>
              </Link>
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              <Link href="/dashboard" className="group relative block text-sm font-medium text-gray-900 dark:text-white hover:text-[#4F46E5] dark:hover:text-[#4F46E5] px-6 py-2.5 rounded-lg border border-gray-900 dark:border-white hover:border-[#4F46E5] dark:hover:border-[#4F46E5] transition-all duration-300 overflow-hidden hover:rounded-none">
                <span className="relative z-10 flex items-center justify-center gap-2 w-full">
                  <span className="absolute left-0 transform -translate-x-6 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                  <span className="transform group-hover:translate-x-3 transition-transform duration-300">SIGN IN</span>
                </span>
              </Link>
              <Link href="/dashboard" className="group relative block bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden hover:bg-[#1a1a1a] dark:hover:bg-gray-100 hover:rounded-none mt-4">
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