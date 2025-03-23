"use client";
import React from "react";
import { Sigmar } from 'next/font/google';
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Instagram, CreditCard } from 'lucide-react';

const sigmar = Sigmar({ weight: '400', subsets: ['latin'] })

const Billing = () => {
  const { user } = useUser();
  const params = useParams();
  const slug = params.slug as string;

  return (
    <div className="flex flex-col items-center w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 dark:bg-black">
      {/* Hero Section */}
      <div className="text-center mb-16 max-w-3xl">
        <h1 className={`${sigmar.className} text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6`}>
          Let us help you grow more.
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg mb-8">
          We&apos;ll get you set up in minutes. And we&apos;ll be here as your business expands. Open a Business account online—no monthly commitments, no hidden fees.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => window.location.href = 'tel:+91-7000523270'}
            className="bg-[#2E329F] text-white px-8 py-2 rounded-full hover:bg-[#2E329F]/90 transition-all dark:bg-[#3D3FA8] dark:hover:bg-[#3D3FA8]/90"
            size="lg"
          >
            Contact Sales
          </Button>
          
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
          Talk to an account specialist to get started, <a href="tel:+91-7000523270" className="text-[#2E329F] hover:underline dark:text-[#4B4EC6]">91-7000-523-270</a>.
        </p>
        <div className="mt-12 w-full max-w-3xl mx-auto">
          <Image
            src="/images/subscriptionpage.webp"
            alt="Subscription Page"
            width={1200}
            height={800}
            className="w-full h-auto rounded-lg shadow-lg"
            priority
          />
        </div>
      </div>

      {/* Connect Store Section */}
      <div className="text-center mb-16 max-w-3xl">
        <h2 className={`${sigmar.className} text-3xl font-bold text-gray-900 dark:text-white mb-4`}>
          Get a subscribed to Auctorn and automate your success.
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          We&apos;re integrated with the most popular ecommerce platforms out there. Link your Business account today for hassle-free payments.
        </p>

        <div className="text-center">
          <button
            onClick={() => window.location.href = 'https://www.instagram.com/auctorn_com/'}
            className="bg-white hover:bg-[#2E329F]/10 font-semibold py-3 px-6 rounded-full border border-[#2E329F] text-[#2E329F] shadow-sm transition-all duration-300 flex items-center gap-2 mx-auto dark:bg-gray-800 dark:text-[#4B4EC6] dark:border-[#4B4EC6] dark:hover:bg-[#4B4EC6]/10"
          >
            <Instagram />
            DM us on instagram
          </button>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Contact us for UPI payments or any payment-related issues</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">OR</p>
          <a
            href="mailto:atharvajoshi2520@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-[#2E329F] transition-colors duration-300 mt-2 inline-block dark:text-gray-400 dark:hover:text-[#4B4EC6]"
          >
            Mail to atharvajoshi2520@gmail.com
          </a>
        </div>
      </div>

      {/* Plans Section */}
      <div className="w-full rounded-lg bg-gradient-to-r from-[#020024] via-[#090979] to-[#0061ff] p-8 -mx-4 sm:-mx-6 lg:-mx-8 dark:from-[#010019] dark:via-[#050546] dark:to-[#004BC2]">
        <div className="text-center mb-12">
          <h2 className={`${sigmar.className} text-3xl font-bold text-white mb-4`}>
            Subscribe up today.<br />Here&apos;s your plan:
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* FREE Plan */}
          <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow dark:bg-gray-800/95 dark:border-gray-700">
            <div className="text-[#2E329F] dark:text-[#4B4EC6] font-bold text-2xl mb-4">
              FREE
              <div className="text-xs text-gray-400 dark:text-gray-500 font-normal mt-1">Your current plan</div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Standard</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Perfect for getting started with automation</p>
            <div className="mb-6">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">₹0</span>
              <span className="text-gray-600 dark:text-gray-300">/month</span>
            </div>
            <div className="space-y-3">
              <p className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <span className="text-[#2E329F] dark:text-[#4B4EC6]">✓</span> 200 DMs and Comments
              </p>
              <p className="flex items-center gap-2 text-gray-600">
                <span className="text-[#2E329F]">✓</span> Boost engagement with target responses
              </p>
              <p className="flex items-center gap-2 text-gray-600">
                <span className="text-[#2E329F]">✓</span> Automate comment replies
              </p>
              <p className="flex items-center gap-2 text-gray-600">
                <span className="text-[#2E329F]">✓</span> Turn followers into customers
              </p>
            </div>
          </div>
          
          {/* PRO Plan */}
          <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow dark:bg-gray-800/95 dark:border-gray-700">
            <div className="text-[#2E329F] dark:text-[#4B4EC6] font-bold text-2xl mb-4">PRO</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Smart AI</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">For power users and agencies</p>
            <div className="mb-6">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">₹799</span>
              <span className="text-gray-600 dark:text-gray-300">/month</span>
            </div>
            <div className="space-y-3">
              <p className="flex items-center gap-2 text-gray-600">
                <span className="text-[#2E329F]">✓</span> Unlimited DMs and Comments
              </p>
              <p className="flex items-center gap-2 text-gray-600">
                <span className="text-[#2E329F]">✓</span> AI-powered response generation
              </p>
              <p className="flex items-center gap-2 text-gray-600">
                <span className="text-[#2E329F]">✓</span> Advanced analytics and insights
              </p>
              <p className="flex items-center gap-2 text-gray-600">
                <span className="text-[#2E329F]">✓</span> Priority customer support
              </p>
              <p className="flex items-center gap-2 text-gray-600">
                <span className="text-[#2E329F]">✓</span> Custom branding options
              </p>
            </div>
            <button
              onClick={() => window.location.href = 'https://www.instagram.com/auctorn_com/'}
              className="mt-6 w-full bg-white hover:bg-[#2E329F]/10 font-semibold py-3 px-6 rounded-full border border-[#2E329F] text-[#2E329F] shadow-sm transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Instagram />
              DM with &quot;Pro&quot; or &quot;Subscribe&quot;
            </button>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="text-center mt-16 max-w-3xl">
        <h2 className={`${sigmar.className} text-3xl font-bold text-gray-900 dark:text-white mb-6`}>
          Unlock the full potential of your Instagram presence
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Automate your engagement, generate AI-powered responses, and watch your Instagram following grow. Experience the power of smart automation today.
        </p>
        
        {/* Feedback Section */}
        <div className="mt-12 mb-8">
          <p className="text-lg text-gray-700 dark:text-gray-200 mb-4">We value your feedback! Help us improve our service.</p>
          <Button
            onClick={() => window.location.href = 'mailto:atharvajoshi2520@gmail.com?subject=Auctorn%20Feedback'}
            className="bg-[#2E329F] text-white px-8 py-2 rounded-full hover:bg-[#2E329F]/90 transition-all dark:bg-[#3D3FA8] dark:hover:bg-[#3D3FA8]/90"
            size="lg"
          >
            Share Feedback
          </Button>
        </div>

        {/* Unsubscribe Button */}
        <div className="mt-8 text-center">
          <Button
            variant="destructive"
            onClick={() => window.location.href = 'https://www.instagram.com/auctorn_com/'}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg shadow-sm transition-all duration-300 flex items-center gap-2 mx-auto"
          >
            <CreditCard className="w-5 h-5" />
            DM with &quot;Unsubcribe&quot; on instagram;
          </Button>
          <p className="text-sm text-gray-600 mt-2">Cancel your Pro subscription and return to the Free plan</p>
        </div>

        {/* Footer Section */}
      </div>
    </div>
  );
};

export default Billing;