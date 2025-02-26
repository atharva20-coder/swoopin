"use client"

import Link from "next/link";
import Image from "next/link";

export default function Footer() {
  return (
    <footer className="py-20 px-4 sm:px-6 lg:px-8 bg-black mt-20 relative bg-[url('/landingpage-images/footer-bg.png')] bg-cover bg-center bg-no-repeat before:content-[''] before:absolute before:inset-0 before:bg-black/60 before:z-0">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
        {/* Left Column */}
        <div className="flex flex-col justify-between">
          <div>
            <h2 className={`font-['Brice'] font-bold text-6xl md:text-8xl sm:text-6xl mb-8 text-white tracking-tight leading-tight`}>
              Try Auctorn for free
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl font-light">
              Transform more conversations into sales, leads,<br />and conversions today
            </p>
            <Link href="/dashboard" className="group relative bg-black text-white px-12 py-6 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden hover:bg-[#1a1a1a] hover:rounded-none inline-block mb-12">
              <span className="relative z-10 flex items-center justify-center gap-2">
                <span className="absolute left-0 transform -translate-x-6 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
                <span className="transform group-hover:translate-x-3 transition-transform duration-300 text-2xl">GET STARTED</span>
              </span>
            </Link>
          </div>
          <div className="flex gap-6">
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
              </svg>
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Right Column */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
          <div className="col-span-1">
            <h3 className="text-sm font-semibold mb-4 uppercase text-white">Auctorn</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-sm text-gray-400 hover:text-white transition-colors">About</Link></li>
              <li><Link href="/careers" className="text-sm text-gray-400 hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy & Security</Link></li>
            </ul>
          </div>
          <div className="col-span-1">
            <h3 className="text-sm font-semibold mb-4 uppercase text-white">AGENCIES</h3>
            <ul className="space-y-3">
              <li><Link href="/hire-agency" className="text-sm text-gray-400 hover:text-white transition-colors">Hire an Agency</Link></li>
              <li><Link href="/affiliate" className="text-sm text-gray-400 hover:text-white transition-colors">Join the Affiliate Program</Link></li>
            </ul>
          </div>
          <div className="col-span-1">
            <h3 className="text-sm font-semibold mb-4 uppercase text-white">PRODUCT</h3>
            <ul className="space-y-3">
              <li><Link href="/messenger" className="text-sm text-gray-400 hover:text-white transition-colors">Messenger</Link></li>
              <li><Link href="/instagram" className="text-sm text-gray-400 hover:text-white transition-colors">Instagram</Link></li>
              <li><Link href="/manychat-ai" className="text-sm text-gray-400 hover:text-white transition-colors">Auctorn AI</Link></li>
              <li><Link href="/sms" className="text-sm text-gray-400 hover:text-white transition-colors">SMS Marketing</Link></li>
              <li><Link href="/integrations" className="text-sm text-gray-400 hover:text-white transition-colors">Integrations</Link></li>
              <li><Link href="/ecommerce" className="text-sm text-gray-400 hover:text-white transition-colors">For eCommerce</Link></li>
              <li><Link href="/changelog" className="text-sm text-gray-400 hover:text-white transition-colors">Changelog</Link></li>
              <li><Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
            </ul>
          </div>
          <div className="col-span-1">
            <h3 className="text-sm font-semibold mb-4 uppercase text-white">RESOURCES</h3>
            <ul className="space-y-3">
              <li><Link href="/status" className="text-sm text-gray-400 hover:text-white transition-colors">Status Page</Link></li>
              <li><Link href="/help" className="text-sm text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="/community" className="text-sm text-gray-400 hover:text-white transition-colors">Community</Link></li>
              <li><Link href="/video-course" className="text-sm text-gray-400 hover:text-white transition-colors">Video Course</Link></li>
              <li><Link href="/how-to" className="text-sm text-gray-400 hover:text-white transition-colors">How To</Link></li>
              <li><Link href="/blog" className="text-sm text-gray-400 hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/privacy-settings" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Settings</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="col-span-1 lg:col-span-2 flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-600 mt-12">
          <p className="text-sm text-gray-400 mb-4 md:mb-0">©2025, AUCTORN, INC.</p>
          <div className="flex space-x-6">
            <Link href="./privacy_policy" className="text-sm text-gray-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">PRIVACY POLICY</Link>
            <Link href="./privacy_policy" className="text-sm text-gray-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">TERMS OF SERVICE</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}