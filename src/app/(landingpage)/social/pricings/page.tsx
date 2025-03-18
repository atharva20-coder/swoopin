"use client";

import { Sigmar } from 'next/font/google';
import LandingNav from '@/components/global/landing-nav';
import Footer from '@/components/global/footer';
import { Button } from "@/components/ui/button";
import { PLANS } from "@/constants/pages";
import { CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const sigmar = Sigmar({ weight: '400', subsets: ['latin'] });

export default function PricingPage() {
  return (
    <>
      <LandingNav />
    <div className="min-h-screen bg-white dark:bg-black py-20 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto mb-20">
        <h1 className={`${sigmar.className} text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6`}>
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Scale your Instagram presence with our powerful automation tools
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 items-start">
        {PLANS.map((plan, index) => (
          <div
            key={plan.name}
            className={cn(
              "relative group",
              index === 1 && "md:translate-y-4"
            )}
          >
            <div className="absolute -inset-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
            <div className="relative bg-white dark:bg-black rounded-2xl p-8 h-full">
              <div className="flex flex-col h-full">
                <div className="mb-8">
                  <h3 className={`${sigmar.className} text-2xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent`}>
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                      {plan.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 ml-2">/month</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8 flex-grow">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <CircleCheck className="h-6 w-6 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto mt-32 text-center">
        <h2 className={`${sigmar.className} text-3xl font-bold text-gray-900 dark:text-white mb-12`}>
          Frequently Asked Questions
        </h2>
        <div className="space-y-8 text-left">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">How does the free plan work?</h3>
            <p className="text-gray-600 dark:text-gray-400">Our free plan includes 200 DMs and Comments per month, perfect for getting started with automation. You can upgrade anytime as your needs grow.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Can I switch plans later?</h3>
            <p className="text-gray-600 dark:text-gray-400">Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">What payment methods do you accept?</h3>
            <p className="text-gray-600 dark:text-gray-400">We accept all major credit cards and UPI payments. For specific payment queries, please contact our support team.</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto mt-32 text-center">
        <h2 className={`${sigmar.className} text-3xl font-bold text-gray-900 dark:text-white mb-6`}>
          Ready to grow your Instagram presence?
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Join thousands of creators who trust Auctorn for their Instagram automation needs
        </p>
        <Button
          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-8 py-6 text-lg font-semibold rounded-xl hover:opacity-90 transition-all duration-300"
          onClick={() => window.location.href = 'https://www.instagram.com/auctorn_com/'}
        >
          Get Started Now
        </Button>
      </div>
    </div>
      <Footer />
    </>
  );
}