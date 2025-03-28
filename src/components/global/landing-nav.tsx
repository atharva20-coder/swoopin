import React, { useState } from "react";
import Link from "next/link";
import { Inter } from "next/font/google";
import Image from "next/image";
import { useTheme } from "@/contexts/theme-context";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList className="space-x-4 lg:space-x-8">
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-gray-900 dark:text-white text-xs md:text-sm font-medium bg-transparent hover:bg-transparent">PRODUCT</NavigationMenuTrigger>
                  <NavigationMenuContent className="p-8">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <Link href="/social/instagram" className="group block p-4 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                        <div className="flex items-center gap-3 mb-2">
                          <Image src="https://img.icons8.com/fluency/48/instagram-new.png" alt="Instagram" width={32} height={32} className="w-8 h-8" />
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Instagram Automation</h3>
                            <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30 rounded-full">Active</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Automated responses, comment management, and engagement tools - Updated daily with new features</p>
                      </Link>
                      <Link href="/social/facebook" className="group block p-4 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                        <div className="flex items-center gap-3 mb-2">
                          <Image src="https://img.icons8.com/fluency/48/facebook-new.png" alt="Facebook" width={32} height={32} className="w-8 h-8" />
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Facebook Automation</h3>
                            <span className="px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30 rounded-full">Coming Soon</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Page management, post scheduling, and audience engagement tools</p>
                      </Link>
                      <Link href="/newsletter" className="group block p-4 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                        <div className="flex items-center gap-3 mb-2">
                          <Image src="https://img.icons8.com/fluency/48/email.png" alt="Newsletter" width={32} height={32} className="w-8 h-8" />
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Newsletter Automation</h3>
                            <span className="px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30 rounded-full">Coming Soon</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Email campaign management and subscriber engagement automation</p>
                      </Link>
                      <Link href="/messenger" className="group block p-4 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                        <div className="flex items-center gap-3 mb-2">
                          <Image src="https://img.icons8.com/fluency/48/facebook-messenger.png" alt="Messenger" width={32} height={32} className="w-8 h-8" />
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Messenger Automation</h3>
                            <span className="px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30 rounded-full">Coming Soon</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Chat automation, response templates, and customer support tools</p>
                      </Link>
                      <Link href="/sheets" className="group block p-4 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                        <div className="flex items-center gap-3 mb-2">
                          <Image src="https://img.icons8.com/fluency/48/google-sheets.png" alt="Google Sheets" width={32} height={32} className="w-8 h-8" />
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Google Sheets Automation</h3>
                            <span className="px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30 rounded-full">Coming Soon</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Data automation, reporting, and integration with other services</p>
                      </Link>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-gray-900 dark:text-white text-xs md:text-sm font-medium bg-transparent hover:bg-transparent">SOLUTIONS</NavigationMenuTrigger>
                  <NavigationMenuContent className="p-8">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <Link href="#" className="group block p-4 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">For Enterprise</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Large scale solutions for enterprise</p>
                      </Link>
                      <Link href="#" className="group block p-4 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">For Startups</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Flexible solutions for growing businesses</p>
                      </Link>
                      <Link href="#" className="group block p-4 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">For Agencies</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Specialized solutions for marketing agencies</p>
                      </Link>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-gray-900 dark:text-white text-xs md:text-sm font-medium bg-transparent hover:bg-transparent">AGENCIES</NavigationMenuTrigger>
                  <NavigationMenuContent className="p-8">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Link href="#" className="group block p-4 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Partner Program</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Join our partner network</p>
                      </Link>
                      <Link href="#" className="group block p-4 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Agency Directory</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Find certified agency partners</p>
                      </Link>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink href="/social/pricings" className="text-gray-900 dark:text-white text-xs md:text-sm font-medium relative group inline-flex items-center">
                    <span className="relative inline-block">PRICING
                      <span className="absolute left-0 bottom-0 w-full h-0.5 bg-gray-900 dark:bg-white transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100"></span>
                    </span>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-gray-900 dark:text-white text-xs md:text-sm font-medium bg-transparent hover:bg-transparent">RESOURCES</NavigationMenuTrigger>
                  <NavigationMenuContent className="p-8">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <Link href="#" className="group block p-4 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">How to guide</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Learn how automations work in Auctorn</p>
                      </Link>
                      <Link href="#" className="group block p-4 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Blogs</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">For growing businesses and increasing follower count</p>
                      </Link>
                      <Link href="#" className="group block p-4 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Meet Developer</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Get in touch with the developer</p>
                      </Link>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
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
            <div className="flex-1">
              <Accordion type="single" collapsible className="space-y-2">
                <AccordionItem value="product" className="border-none">
                  <AccordionTrigger className="text-gray-900 dark:text-white text-base font-medium py-4 px-3 hover:no-underline">
                    PRODUCT
                  </AccordionTrigger>
                  <AccordionContent className="px-3">
                    <div className="space-y-4">
                      <Link href="/social/instagram" className="block p-4 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                        <div className="flex items-center gap-3 mb-2">
                          <Image src="https://img.icons8.com/fluency/48/instagram-new.png" alt="Instagram" width={32} height={32} className="w-8 h-8" />
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Instagram Automation</h3>
                            <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30 rounded-full">Active</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Automated responses, comment management, and engagement tools - Updated daily with new features</p>
                      </Link>
                      <Link href="/social/facebook" className="block p-4 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                        <div className="flex items-center gap-3 mb-2">
                          <Image src="https://img.icons8.com/fluency/48/facebook-new.png" alt="Facebook" width={32} height={32} className="w-8 h-8" />
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Facebook Automation</h3>
                            <span className="px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30 rounded-full">Coming Soon</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Page management, post scheduling, and audience engagement tools</p>
                      </Link>
                      <Link href="/newsletter" className="block p-4 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                        <div className="flex items-center gap-3 mb-2">
                          <Image src="https://img.icons8.com/fluency/48/email.png" alt="Newsletter" width={32} height={32} className="w-8 h-8" />
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Newsletter Automation</h3>
                            <span className="px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30 rounded-full">Coming Soon</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Email campaign management and subscriber engagement automation</p>
                      </Link>
                      <Link href="/messenger" className="block p-4 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                        <div className="flex items-center gap-3 mb-2">
                          <Image src="https://img.icons8.com/fluency/48/facebook-messenger.png" alt="Messenger" width={32} height={32} className="w-8 h-8" />
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Messenger Automation</h3>
                            <span className="px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30 rounded-full">Coming Soon</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Chat automation, response templates, and customer support tools</p>
                      </Link>
                      <Link href="/sheets" className="block p-4 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                        <div className="flex items-center gap-3 mb-2">
                          <Image src="https://img.icons8.com/fluency/48/google-sheets.png" alt="Google Sheets" width={32} height={32} className="w-8 h-8" />
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Google Sheets Automation</h3>
                            <span className="px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30 rounded-full">Coming Soon</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Data automation, reporting, and integration with other services</p>
                      </Link>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="solutions" className="border-none">
                  <AccordionTrigger className="text-gray-900 dark:text-white text-base font-medium py-4 px-3 hover:no-underline">
                    SOLUTIONS
                  </AccordionTrigger>
                  <AccordionContent className="px-3">
                    <div className="space-y-4">
                      <Link href="#" className="block text-sm text-gray-600 dark:text-gray-300 hover:text-[#4F46E5] dark:hover:text-[#4F46E5]">For Enterprise</Link>
                      <Link href="#" className="block text-sm text-gray-600 dark:text-gray-300 hover:text-[#4F46E5] dark:hover:text-[#4F46E5]">For Startups</Link>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="agencies" className="border-none">
                  <AccordionTrigger className="text-gray-900 dark:text-white text-base font-medium py-4 px-3 hover:no-underline">
                    AGENCIES
                  </AccordionTrigger>
                  <AccordionContent className="px-3">
                    <div className="space-y-4">
                      <Link href="#" className="block text-sm text-gray-600 dark:text-gray-300 hover:text-[#4F46E5] dark:hover:text-[#4F46E5]">Partner Program</Link>
                      <Link href="#" className="block text-sm text-gray-600 dark:text-gray-300 hover:text-[#4F46E5] dark:hover:text-[#4F46E5]">Agency Directory</Link>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="pricing" className="border-none">
                  <Link href="/social/pricings" className="block text-gray-900 dark:text-white text-base font-medium py-4 px-3">
                    PRICING
                  </Link>
                </AccordionItem>

                <AccordionItem value="resources" className="border-none">
                  <AccordionTrigger className="text-gray-900 dark:text-white text-base font-medium py-4 px-3 hover:no-underline">
                    RESOURCES
                  </AccordionTrigger>
                  <AccordionContent className="px-3">
                    <div className="space-y-4">
                      <Link href="#" className="block text-sm text-gray-600 dark:text-gray-300 hover:text-[#4F46E5] dark:hover:text-[#4F46E5]">How to guide</Link>
                      <Link href="#" className="block text-sm text-gray-600 dark:text-gray-300 hover:text-[#4F46E5] dark:hover:text-[#4F46E5]">Blogs</Link>
                      <Link href="#" className="block text-sm text-gray-600 dark:text-gray-300 hover:text-[#4F46E5] dark:hover:text-[#4F46E5]">Meet Developer</Link>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
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