'use client'

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useTheme } from "@/contexts/theme-context"
import { Menu, X, Sun, Moon, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import NinthNodeLogo from "./ninth-node-logo"

const LandingNav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
    document.body.style.overflow = !isMenuOpen ? 'hidden' : ''
  }

  const navLinks = [
    { label: 'Solutions', href: '#solutions' },
    { label: 'Agencies', href: '#agencies' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Blog', href: '/blog' },
    { label: 'Resources', href: '#resources' },
  ]

  return (
    <>
      <nav 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled 
            ? "bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-200 dark:border-neutral-800" 
            : "bg-transparent"
        )}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <NinthNodeLogo showText={true} />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 dark:text-neutral-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              
              <Link
                href="/sign-in"
                className="text-sm text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Log in
              </Link>

              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black text-sm font-medium rounded-full hover:bg-gray-800 dark:hover:bg-neutral-200 transition-colors"
              >
                Sign up
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={toggleMenu}
                className="p-2 text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div 
        className={cn(
          "fixed inset-0 z-40 md:hidden transition-all duration-300",
          isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="absolute inset-0 bg-white/90 dark:bg-black/90 backdrop-blur-xl" onClick={toggleMenu} />
        
        <div className={cn(
          "absolute inset-x-0 top-16 bg-white dark:bg-black transition-transform duration-300",
          isMenuOpen ? "translate-y-0" : "-translate-y-full"
        )}>
          <div className="px-6 py-8 space-y-6">
            {navLinks.map((link, i) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={toggleMenu}
                className="block text-2xl font-medium text-gray-900 dark:text-white"
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                {link.label}
              </Link>
            ))}
            
            <div className="pt-6 border-t border-gray-200 dark:border-neutral-800 space-y-4">
              <Link
                href="/sign-in"
                onClick={toggleMenu}
                className="block w-full text-center py-3 text-gray-600 dark:text-neutral-400 border border-gray-300 dark:border-neutral-700 rounded-full hover:border-gray-400 dark:hover:border-neutral-600 transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/dashboard"
                onClick={toggleMenu}
                className="block w-full text-center py-3 bg-gray-900 dark:bg-white text-white dark:text-black font-medium rounded-full hover:bg-gray-800 dark:hover:bg-neutral-200 transition-colors"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default LandingNav