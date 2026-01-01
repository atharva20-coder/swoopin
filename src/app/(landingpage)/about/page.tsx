"use client";

import LandingNav from "@/components/global/landing-nav";
import Footer from "@/components/global/footer";
import { Zap, Users, Shield, Globe } from "lucide-react";

export default function AboutPage() {
  const values = [
    {
      icon: Zap,
      title: "Innovation",
      description: "We constantly push boundaries to deliver cutting-edge automation solutions."
    },
    {
      icon: Users,
      title: "Community",
      description: "We build tools that help creators and businesses grow their communities."
    },
    {
      icon: Shield,
      title: "Trust",
      description: "Security and privacy are at the core of everything we build."
    },
    {
      icon: Globe,
      title: "Accessibility",
      description: "We make powerful automation tools accessible to everyone."
    }
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-black">
      <LandingNav />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-32">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            About NinthNode
          </h1>
          <p className="text-xl text-gray-600 dark:text-neutral-400 max-w-3xl mx-auto">
            We&apos;re on a mission to help creators and businesses automate their social media 
            growth, so they can focus on what matters most—creating great content.
          </p>
        </div>

        {/* Story Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Our Story
          </h2>
          <div className="prose prose-lg prose-gray dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-neutral-400 mb-4">
              NinthNode was born from a simple observation: creators and businesses spend countless 
              hours managing DMs, responding to comments, and trying to grow their social media presence. 
              We knew there had to be a better way.
            </p>
            <p className="text-gray-600 dark:text-neutral-400 mb-4">
              Our team of developers and social media enthusiasts came together to build an all-in-one 
              platform that automates the repetitive tasks while keeping the human touch that makes 
              social media engagement meaningful.
            </p>
            <p className="text-gray-600 dark:text-neutral-400">
              Today, NinthNode powers thousands of creators and businesses, helping them save time, 
              generate leads, and grow their communities on autopilot.
            </p>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Our Values
          </h2>
          <div className="grid sm:grid-cols-2 gap-8">
            {values.map((value) => (
              <div 
                key={value.title}
                className="p-6 bg-gray-50 dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800"
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-neutral-400">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-20">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-neutral-900 dark:to-neutral-800 rounded-3xl p-8 sm:p-12">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              NinthNode in Numbers
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl sm:text-5xl font-bold text-white mb-2">10K+</div>
                <div className="text-gray-400">Active Users</div>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-bold text-white mb-2">1M+</div>
                <div className="text-gray-400">Messages Sent</div>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-bold text-white mb-2">50M+</div>
                <div className="text-gray-400">Comments Processed</div>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-bold text-white mb-2">99.9%</div>
                <div className="text-gray-400">Uptime</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Join Us on This Journey
          </h2>
          <p className="text-lg text-gray-600 dark:text-neutral-400 mb-8 max-w-2xl mx-auto">
            Whether you&apos;re a creator, business, or agency, we&apos;re here to help you grow. 
            Start automating your social media today.
          </p>
          <a 
            href="/dashboard"
            className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black font-semibold rounded-full hover:bg-gray-800 dark:hover:bg-neutral-200 transition-colors"
          >
            Get Started Free
          </a>
        </section>
      </div>
      <Footer />
    </main>
  );
}
