"use client"

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-20 px-4 sm:px-6 lg:px-8 bg-black">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className={`font-['Brice'] font-bold text-6xl md:text-8xl sm:text-6xl mb-8 text-white tracking-tight leading-tight`}>
          Try Auctorn for free
        </h2>
        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto font-light">
          Transform more conversations into sales, leads,<br />and conversions today
        </p>
        <Link href="/dashboard" className="inline-block bg-[#FFE600] text-black px-8 py-4 rounded-full font-medium text-lg hover:bg-[#FFD700] transition-colors shadow-sm hover:shadow-md mb-20">
          GET STARTED
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12 text-left">
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
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-800">
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