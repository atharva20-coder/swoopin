'use client';

import Link from "next/link";
import { useTheme } from "@/contexts/theme-context";
import { Instagram, Twitter, Linkedin, Youtube, Sun, Moon } from "lucide-react";
import NinthNodeLogo from "./ninth-node-logo";

export default function Footer() {
  const { theme, toggleTheme } = useTheme();

  const footerLinks = [
    {
      title: 'Product',
      links: [
        { label: 'Automations', href: '/features/automations' },
        { label: 'Inbox', href: '/features/inbox' },
        { label: 'Analytics', href: '/features/analytics' },
        { label: 'Scheduler', href: '/features/scheduler' },
        { label: 'Integrations', href: '/integrations' },
        { label: 'Pricing', href: '/pricing' },
      ]
    },
    {
      title: 'Platforms',
      links: [
        { label: 'Instagram', href: '/platforms/instagram' },
        { label: 'Facebook', href: '/platforms/facebook', soon: true },
        { label: 'WhatsApp', href: '/platforms/whatsapp', soon: true },
        { label: 'LinkedIn', href: '/platforms/linkedin', soon: true },
      ]
    },
    {
      title: 'Resources',
      links: [
        { label: 'Help Center', href: '/help' },
        { label: 'Blog', href: '/blog' },
        { label: 'Community', href: '/community' },
        { label: 'API Docs', href: '/docs' },
        { label: 'Changelog', href: '/changelog' },
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Careers', href: '/careers' },
        { label: 'Privacy', href: '/privacy' },
        { label: 'Terms', href: '/terms' },
        { label: 'Contact', href: '/contact' },
      ]
    },
  ];

  const socialLinks = [
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
  ];

  return (
    <footer className="bg-gray-50 dark:bg-black border-t border-gray-200 dark:border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Logo & Description */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <NinthNodeLogo showText={true} />
            </Link>
            <p className="text-gray-500 dark:text-neutral-500 text-sm mb-6">
              Automate your social media growth with AI-powered DM automation and scheduling.
            </p>
            {/* Status Indicator */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <div className="absolute inset-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              </div>
              <span className="text-gray-500 dark:text-neutral-500 text-xs">All systems operational</span>
            </div>
          </div>

          {/* Link Columns */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-gray-900 dark:text-white text-sm font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href}
                      className="text-gray-500 dark:text-neutral-500 text-sm hover:text-gray-900 dark:hover:text-white transition-colors inline-flex items-center gap-2"
                    >
                      {link.label}
                      {link.soon && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-200 dark:bg-neutral-800 text-gray-500 dark:text-neutral-600 rounded">Soon</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200 dark:border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <div className="flex items-center gap-4">
            <p className="text-gray-500 dark:text-neutral-600 text-sm">
              © {new Date().getFullYear()} NinthNode. All rights reserved.
            </p>
          </div>

          {/* Social Links & Theme Toggle */}
          <div className="flex items-center gap-4">
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 dark:text-neutral-600 hover:text-gray-900 dark:hover:text-white transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </Link>
              ))}
            </div>

            {/* Divider */}
            <div className="w-px h-4 bg-gray-300 dark:bg-neutral-800" />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="text-gray-400 dark:text-neutral-600 hover:text-gray-900 dark:hover:text-white transition-colors p-1"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}