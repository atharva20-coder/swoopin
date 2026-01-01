"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import LandingNav from "@/components/global/landing-nav";
import Footer from "@/components/global/footer";
import { Check, X, Zap, Crown, Building2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const pricingPlans = [
  {
    name: "Starter",
    description: "Perfect for testing the waters",
    price: { monthly: 0, yearly: 0 },
    icon: Zap,
    popular: false,
    features: [
      { text: "50 DMs & Comments/month", included: true },
      { text: "1 Automation", included: true },
      { text: "7 days analytics history", included: true },
      { text: "Community support", included: true },
      { text: "Scheduled posts", included: false },
      { text: "AI-powered responses", included: false },
      { text: "Remove branding", included: false },
    ],
    cta: "Get Started Free",
    href: "/dashboard",
  },
  {
    name: "Pro",
    description: "For serious creators & businesses",
    price: { monthly: 999, yearly: 9990 },
    icon: Crown,
    popular: true,
    features: [
      { text: "1,000 DMs & Comments/month", included: true },
      { text: "10 Automations", included: true },
      { text: "20 Scheduled Posts/month", included: true },
      { text: "50 AI responses/month", included: true },
      { text: "90 days analytics history", included: true },
      { text: "Comment replies", included: true },
      { text: "No branding", included: true },
      { text: "Priority email support", included: true },
    ],
    cta: "Start Free Trial",
    href: "/dashboard",
  },
  {
    name: "Enterprise",
    description: "Tailored for your needs",
    price: { monthly: 0, yearly: 0 },
    icon: Building2,
    popular: false,
    isEnterprise: true,
    features: [
      { text: "Custom DM & Comment limits", included: true },
      { text: "Unlimited Automations", included: true },
      { text: "Unlimited Scheduling", included: true },
      { text: "Unlimited AI responses", included: true },
      { text: "API access available", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "Custom integrations", included: true },
      { text: "Priority phone support", included: true },
    ],
    cta: "Contact Sales",
    href: "/contact",
  },
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <main className="min-h-screen bg-white dark:bg-black">
      <LandingNav />
      
      {/* Hero Section */}
      <section className="pt-40 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
              Simple{" "}
              <motion.span 
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                style={{ 
                  backgroundImage: 'linear-gradient(to right, #60A5FA, #22D3EE, #60A5FA, #EB491C, #60A5FA, #22D3EE)',
                  backgroundSize: '200% auto'
                }}
                className="text-transparent bg-clip-text"
              >
                pricing
              </motion.span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-neutral-400 max-w-xl mx-auto mb-10">
              Start free, upgrade when you&apos;re ready. No hidden fees.
            </p>
          </motion.div>
          
          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 text-sm">
            <span className={cn(
              "font-medium transition-colors",
              !isYearly ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-neutral-500"
            )}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={cn(
                "relative w-14 h-7 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EB491C]",
                isYearly ? "bg-[#EB491C]" : "bg-gray-200 dark:bg-neutral-800"
              )}
            >
              <div className={cn(
                "absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow-sm",
                isYearly ? "translate-x-8" : "translate-x-1"
              )} />
            </button>
            <span className={cn(
              "font-medium transition-colors",
              isYearly ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-neutral-500"
            )}>
              Yearly
              <span className="ml-2 text-[#EB491C] text-xs font-bold bg-[#EB491C]/10 px-2 py-0.5 rounded-full">Save 17%</span>
            </span>
          </div>
          
          <p className="text-xs text-gray-400 dark:text-neutral-600 mt-6">
            *Prices are GST exclusive. Platform charges may apply.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-4 sm:px-6 lg:px-8 pb-32">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                className={cn(
                  "relative rounded-2xl p-8 border transition-all hover:shadow-lg",
                  plan.popular
                    ? "border-[#EB491C]"
                    : "border-gray-200 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700"
                )}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-[#EB491C] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="mb-8">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-neutral-900 flex items-center justify-center mb-4">
                    <plan.icon className="w-6 h-6 text-gray-900 dark:text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-neutral-500 leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-8">
                  {plan.isEnterprise ? (
                    <span className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                      Custom
                    </span>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                        {plan.price.monthly === 0 ? "₹0" : (
                          <>₹{isYearly ? Math.round(plan.price.yearly / 12) : plan.price.monthly}</>
                        )}
                      </span>
                      <span className="text-gray-500 dark:text-neutral-500 text-sm font-medium">
                        /mo
                      </span>
                    </div>
                  )}
                  {isYearly && plan.price.monthly > 0 && (
                    <p className="text-xs text-[#EB491C] font-medium mt-2">
                      Billed ₹{plan.price.yearly.toLocaleString()} yearly
                    </p>
                  )}
                </div>

                {/* CTA Button */}
                <Link
                  href={plan.href}
                  className={cn(
                    "flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold transition-all mb-8 text-sm",
                    plan.popular
                      ? "bg-[#EB491C] hover:bg-[#d64016] text-white shadow-lg shadow-orange-500/20"
                      : "bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-neutral-800"
                  )}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {/* Features */}
                <ul className="space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      {feature.included ? (
                        <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-green-600 dark:text-green-500" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-gray-100 dark:bg-neutral-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <X className="w-3 h-3 text-gray-400 dark:text-neutral-600" />
                        </div>
                      )}
                      <span className={cn(
                        "text-sm leading-tight",
                        feature.included
                          ? "text-gray-700 dark:text-neutral-300"
                          : "text-gray-400 dark:text-neutral-600"
                      )}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Simple CTA */}
      <section className="px-4 sm:px-6 lg:px-8 pb-32">
        <div className="max-w-2xl mx-auto text-center p-8 sm:p-12 rounded-3xl bg-gray-50 dark:bg-neutral-900/50 border border-gray-100 dark:border-neutral-800">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Still have questions?
          </h2>
          <p className="text-gray-600 dark:text-neutral-400 mb-8 max-w-lg mx-auto">
            We&apos;re here to help you find the right plan for your business needs. Chat with our team.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-[#EB491C] font-semibold hover:gap-3 transition-all"
          >
            Contact Support
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
      
      <Footer />
    </main>
  );
}
