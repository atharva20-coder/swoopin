"use client"

import Image from "next/image";
import Link from "next/link";
import LandingNav from "@/components/global/landing-nav";
import { ChatInterface } from "@/components/ui/chat-interface";
import { Climate_Crisis } from "next/font/google";
import { Bebas_Neue } from "next/font/google";
import { Brands } from "@/components/ui/brands";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const climateCrisis = Climate_Crisis({ subsets: ["latin"], weight: ["400"] });
const bebasNeue = Bebas_Neue({ subsets: ["latin"], weight: ["400"] });

export default function LandingPage() {
  const heroRef = useScrollReveal();
  const trustedRef = useScrollReveal();
  const featuresRef = useScrollReveal();
  const leadGenRef = useScrollReveal();
  const statsRef = useScrollReveal();
  const testimonialRef = useScrollReveal();
  const getStartedRef = useScrollReveal();

  return (
    <main className="min-h-screen bg-background">
      <LandingNav />
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 bg-background overflow-hidden mt-[72px] opacity-0 translate-y-4 transition-all duration-700">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className={`${climateCrisis.className} text-6xl md:text-8xl font-normal mb-8 text-black tracking-tight leading-tight`}>
            Unleash the power of social media marketing
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto font-light">
            Drive more sales and conversions on Instagram, WhatsApp,<br />and Messenger using automation.
          </p>
          <Link href="/dashboard" className="inline-block bg-[#4F46E5] text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-[#4338CA] transition-colors shadow-sm hover:shadow-md">
            GET STARTED FOR FREE
          </Link>
    
          {/* Chat Preview */}
          <div className="mt-16 relative max-w-lg mx-auto">
            <ChatInterface />
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section ref={trustedRef} className="py-12 px-4 sm:px-6 lg:px-8 bg-background opacity-0 translate-y-4 transition-all duration-700">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-8">Trusted by 1M+ Businesses</h2>
          <Brands />
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-12 px-4 sm:px-6 lg:px-8 bg-background opacity-0 translate-y-4 transition-all duration-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto pb-4 snap-x snap-mandatory">
            <div className="p-8 bg-gradient-to-b from-pink-50 to-transparent hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer flex-shrink-0 w-[85vw] md:w-auto snap-start">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-6">
                <Image src="/icons/instagram.svg" alt="Instagram" width={24} height={24} className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Instagram DMs</h3>
              <p className="text-sm text-muted-foreground mb-6 line-clamp-3">Answer every single question, comment, and story reply 24/7, to attract more leads, increase sales, and drive higher conversions on IG</p>
              <Link 
                href="/learn-more" 
                className="text-primary font-medium inline-flex items-center group text-sm"
              >
                <span className="relative after:content-[''] after:absolute after:w-full after:h-0.5 after:bg-primary after:left-0 after:-bottom-1 after:scale-x-0 after:origin-right after:transition-transform group-hover:after:scale-x-100 group-hover:after:origin-left">LEARN MORE</span>
                <span className="ml-2 transform transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>

            <div className="p-8 bg-gradient-to-b from-green-50 to-transparent hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer relative flex-shrink-0 w-[85vw] md:w-auto snap-start">
              <span className="absolute top-4 right-4 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full shadow-sm">Upcoming</span>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <Image src="/icons/whatsapp.svg" alt="WhatsApp" width={24} height={24} className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-4">WhatsApp</h3>
              <p className="text-sm text-muted-foreground mb-6 line-clamp-3">Use WhatsApp Automation to help customers discover products, retrieve order information and deliver customer support — all on autopilot</p>
              <Link 
                href="/learn-more" 
                className="text-primary font-medium inline-flex items-center group text-sm"
              >
                <span className="relative after:content-[''] after:absolute after:w-full after:h-0.5 after:bg-primary after:left-0 after:-bottom-1 after:scale-x-0 after:origin-right after:transition-transform group-hover:after:scale-x-100 group-hover:after:origin-left">LEARN MORE</span>
                <span className="ml-2 transform transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>

            <div className="p-8 bg-gradient-to-b from-blue-50 to-transparent hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer relative flex-shrink-0 w-[85vw] md:w-auto snap-start">
              <span className="absolute top-4 right-4 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full shadow-sm">Upcoming</span>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <Image src="/icons/messenger.svg" alt="Messenger" width={24} height={24} className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Facebook Messenger</h3>
              <p className="text-sm text-muted-foreground mb-6 line-clamp-3">Auctorn for Messenger automates conversations to fuel more sales, generate leads, automate FAQs and run marketing campaigns</p>
              <Link 
                href="/learn-more" 
                className="text-primary font-medium inline-flex items-center group text-sm"
              >
                <span className="relative after:content-[''] after:absolute after:w-full after:h-0.5 after:bg-primary after:left-0 after:-bottom-1 after:scale-x-0 after:origin-right after:transition-transform group-hover:after:scale-x-100 group-hover:after:origin-left">LEARN MORE</span>
                <span className="ml-2 transform transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>

            <div className="p-8 bg-gradient-to-b from-purple-50 to-transparent hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer relative flex-shrink-0 w-[85vw] md:w-auto snap-start">
              <span className="absolute top-4 right-4 bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full shadow-sm">Upcoming</span>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <Image src="/icons/threads.svg" alt="Instagram Threads" width={24} height={24} className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Instagram Threads</h3>
              <p className="text-sm text-muted-foreground mb-6 line-clamp-3">Engage with your audience through automated responses on Threads, build community, and drive engagement through meaningful conversations</p>
              <Link 
                href="/learn-more" 
                className="text-primary font-medium inline-flex items-center group text-sm"
              >
                <span className="relative after:content-[''] after:absolute after:w-full after:h-0.5 after:bg-primary after:left-0 after:-bottom-1 after:scale-x-0 after:origin-right after:transition-transform group-hover:after:scale-x-100 group-hover:after:origin-left">LEARN MORE</span>
                <span className="ml-2 transform transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Lead Generation Section */}
      <section ref={leadGenRef} className="py-20 px-4 sm:px-6 lg:px-8 bg-background opacity-0 translate-y-4 transition-all duration-700">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className={`${climateCrisis.className} text-5xl sm:text-6xl font-normal mb-16 text-black tracking-tight leading-tight`}>
          Use Chat Marketing to drive more sales on autopilot
          </h1>
        </div>
        <div className="max-w-7xl mx-auto space-y-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div ref={useScrollReveal()} className="relative opacity-0 translate-y-4 transition-all duration-700">
              <video autoPlay loop muted playsInline className="w-full rounded-2xl shadow-xl">
                <source src="/images/feature_generate-qualified-leads.webm" type="video/webm" />
              </video>
            </div>
            <div ref={useScrollReveal()} className="opacity-0 translate-y-4 transition-all duration-700">
              <h2 className={`${bebasNeue.className} text-5xl sm:text-6xl font-normal mb-8 text-black tracking-tight leading-tight`}>
              Supercharge your lead generation
              </h2>
              <p className="text-lg text-muted-foreground mb-8">Capture and nurture leads through automated conversations. Convert website visitors into customers with personalized engagement strategies.</p>
              <Link href="/dashboard" className="bg-[#4F46E5] text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-[#4338CA] transition-colors shadow-sm hover:shadow-md inline-block">
                Get Started
              </Link>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div ref={useScrollReveal()} className="lg:order-2 opacity-0 translate-y-4 transition-all duration-700">
              <video autoPlay loop muted playsInline className="w-full rounded-2xl shadow-xl">
                <source src="/images/feature_increase-roi.webm" type="video/webm" />
              </video>
            </div>
            <div ref={useScrollReveal()} className="lg:order-1 opacity-0 translate-y-4 transition-all duration-700">
              <h2 className={`${bebasNeue.className} text-5xl sm:text-6xl font-normal mb-8 text-black tracking-tight leading-tight`}>
              Increase conversion rates by up to 90%
              </h2>
              <p className="text-lg text-muted-foreground mb-8">Leverage AI-powered automation to optimize your marketing campaigns, boost engagement rates, and maximize your return on investment.</p>
              <Link href="/dashboard" className="bg-[#4F46E5] text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-[#4338CA] transition-colors shadow-sm hover:shadow-md inline-block">
                Get Started
              </Link>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div ref={useScrollReveal()} className="relative opacity-0 translate-y-4 transition-all duration-700">
              <video autoPlay loop muted playsInline className="w-full rounded-2xl shadow-xl">
                <source src="/images/features_story-mentions-trigger.webm" type="video/webm" />
              </video>
            </div>
            <div ref={useScrollReveal()} className="opacity-0 translate-y-4 transition-all duration-700">
              <h2 className={`${bebasNeue.className} text-5xl sm:text-6xl font-normal mb-8 text-black tracking-tight leading-tight`}>
              Automatically respond to every message
              </h2>
              <p className="text-lg text-muted-foreground mb-8">Automatically engage with every story mention, comment, and DM. Turn social interactions into meaningful conversations that drive sales.</p>
              <Link href="/dashboard" className="bg-[#4F46E5] text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-[#4338CA] transition-colors shadow-sm hover:shadow-md inline-block">
                Get Started
              </Link>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div ref={useScrollReveal()} className="lg:order-2 opacity-0 translate-y-4 transition-all duration-700">
              <video autoPlay loop muted playsInline className="w-full rounded-2xl shadow-xl">
                <source src="/images/feature_deliver-instant-support.webm" type="video/webm" />
              </video>
            </div>
            <div ref={useScrollReveal()} className="lg:order-1 opacity-0 translate-y-4 transition-all duration-700">
              <h2 className={`${bebasNeue.className} text-5xl sm:text-6xl font-normal mb-8 text-black tracking-tight leading-tight`}>
              Claim back your time & slash costs
              </h2>
              <p className="text-lg text-muted-foreground mb-8">Provide 24/7 customer support with automated responses to common questions. Keep your customers satisfied while saving time and resources.</p>
              <Link href="/dashboard" className="bg-[#4F46E5] text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-[#4338CA] transition-colors shadow-sm hover:shadow-md inline-block">
                Get Started
              </Link>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div ref={useScrollReveal()} className="relative opacity-0 translate-y-4 transition-all duration-700">
              <video autoPlay loop muted playsInline className="w-full rounded-2xl shadow-xl">
                <source src="/images/feature_manychat-ai.webm" type="video/webm" />
              </video>
            </div>
            <div ref={useScrollReveal()} className="opacity-0 translate-y-4 transition-all duration-700">
              <h2 className={`${bebasNeue.className} text-5xl sm:text-6xl font-normal mb-8 text-black tracking-tight leading-tight`}>
                Smart AI: A Smarter Way to Chat
              </h2>
              <p className="text-lg text-muted-foreground mb-8">Level up the experiences your followers already love with the new Auctorn AI. Create more engaging and personalized conversations.</p>
              <Link href="/dashboard" className="bg-[#4F46E5] text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-[#4338CA] transition-colors shadow-sm hover:shadow-md inline-block">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-12 px-4 sm:px-6 lg:px-8 bg-background opacity-0 translate-y-4 transition-all duration-700">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className={`${climateCrisis.className} text-5xl sm:text-6xl font-normal mb-16 text-black tracking-tight leading-tight`}>
            Discover why 1M+ brands trust Auctorn
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="p-6">
              <div className={`${climateCrisis.className} text-5xl sm:text-6xl font-normal mb-4 text-[#4F46E5]`}>1M+</div>
              <p className="text-gray-600 text-lg">Businesses chose Auctorn to grow</p>
            </div>
            <div className="p-6">
              <div className={`${climateCrisis.className} text-5xl sm:text-6xl font-normal mb-4 text-[#4F46E5]`}>4B+</div>
              <p className="text-gray-600 text-lg">Conversations powered by Auctorn</p>
            </div>
            <div className="p-6">
              <div className={`${climateCrisis.className} text-5xl sm:text-6xl font-normal mb-4 text-[#4F46E5]`}>170+</div>
              <p className="text-gray-600 text-lg">Countries use Auctorn across the world</p>
            </div>
            <div className="p-6">
              <div className={`${climateCrisis.className} text-5xl sm:text-6xl font-normal mb-4 text-[#4F46E5]`}>#1</div>
              <p className="text-gray-600 text-lg">Platform in leading marketing tool</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section ref={testimonialRef} className="py-12 px-4 sm:px-6 lg:px-8 bg-background opacity-0 translate-y-4 transition-all duration-700">
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-white p-8 md:p-12 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-start gap-8 md:gap-16">
                <div className="w-full md:w-[30%] h-[400px] relative">
                  <Image
                    src="/images/testimonial_nike-football.avif"
                    alt="Nike Football"
                    fill
                    style={{ objectFit: 'cover' }}
                    className="shadow-lg"
                  />
                </div>
                <div className="w-full md:w-[70%] space-y-6">
                  <Image
                    src="/images/backqotes.svg"
                    alt="Quotes"
                    width={48}
                    height={48}
                    className="mb-4"
                  />
                  <p className="text-xl md:text-2xl text-gray-800 leading-relaxed mb-8">
                    We would definitely use Auctorn in the future. The team was helpful in answering our questions and assisting with the custom analytics dashboard. We imagine Auctorn could be used in the future for any social chatbot experience including campaigns that let us be as creative with the conversations as possible.
                  </p>
                  <div>
                    <p className="font-semibold text-gray-900">ROMINA THALER, UNIT9 SENIOR PRODUCER</p>
                    <p className="text-gray-600">NIKE FOOTBALL X LIL M&apos;BAPPE</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Get Started Section */}
      <section ref={getStartedRef} className="py-20 px-4 sm:px-6 lg:px-8 bg-white opacity-0 translate-y-4 transition-all duration-700">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className={`${climateCrisis.className} text-5xl sm:text-6xl font-normal mb-16 text-black tracking-tight leading-tight`}>
            Get started with Auctorn
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg rounded-xl">
              <div className="w-32 h-32 mx-auto mb-6 flex items-center justify-center transform transition-transform hover:rotate-3">
                <Image src="/images/steps_01.svg" alt="Step 1" width={500} height={500} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Step 1.</h3>
              <p className="text-gray-600">Join 1 million+ smart brands and sign up for a risk-free trial</p>
            </div>
            <div className="text-center p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg rounded-xl">
              <div className="w-32 h-32 mx-auto mb-6 flex items-center justify-center transform transition-transform hover:rotate-3">
                <Image src="/images/steps_02.svg" alt="Step 2" width={500} height={500} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Step 2.</h3>
              <p className="text-gray-600">Use our template gallery to create a customized Chat Marketing campaign in as little as 15 minutes</p>
            </div>
            <div className="text-center p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg rounded-xl">
              <div className="w-32 h-32 mx-auto mb-6 flex items-center justify-center transform transition-transform hover:rotate-3">
                <Image src="/images/steps_03.svg" alt="Step 3" width={500} height={500} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Step 3.</h3>
              <p className="text-gray-600">Leverage your social media channels to generate more conversions, sales, and revenue 24/7</p>
            </div>
          </div>
          <Link href="/dashboard" className="bg-[#4F46E5] text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-[#4338CA] transition-colors shadow-sm hover:shadow-md inline-block">
            GET STARTED FREE
          </Link>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="py-20 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className={`${climateCrisis.className} text-5xl sm:text-6xl font-normal mb-8 text-white tracking-tight leading-tight`}>
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
    </main>
  );
}