"use client"

import Image from "next/image";
import Link from "next/link";
import LandingNav from "@/components/global/landing-nav";
import { ChatInterface } from "@/components/ui/chat-interface";
import { Brands } from "@/components/ui/brands";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import Footer from "@/components/global/footer";

export default function LandingPage() {
  const heroRef = useScrollReveal();
  const trustedRef = useScrollReveal();
  const featuresRef = useScrollReveal();
  const leadGenRef = useScrollReveal();
  const statsRef = useScrollReveal();
  const testimonialRef = useScrollReveal();
  const getStartedRef = useScrollReveal();

  return (
    <main className="min-h-screen bg-[#EFE8F7]">
      <LandingNav />
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-background overflow-hidden mt-[72px] opacity-0 translate-y-4 transition-all duration-700">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="font-['Brice'] font-bold text-6xl md:text-8xl mb-8 text-black tracking-tight leading-tight">
            SMART MOVES, VIRAL WINS: AUTOMATE & THRIVE
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto font-light">
            Drive more sales and conversions on Instagram, WhatsApp,<br />and Messenger using automation.
          </p>
          <Link href="/dashboard" className="inline-block bg-[#4F46E5] text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-[#4338CA] transition-colors shadow-sm hover:shadow-md">
            GET STARTED FOR FREE
          </Link>
    
          {/* Feature Cards */}
          <div className="mt-16 relative max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 px-4">
            {/* Card 1 - Social Media Automation */}
            <div className="relative bg-[#D4ADFF] rounded-[32px] p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-black min-h-[280px] flex flex-col justify-between transform hover:-translate-y-1 md:scale-90 z-10">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-black text-white text-lg font-medium w-10 h-10 flex items-center justify-center rounded-full shadow-md hover:shadow-lg transition-all duration-200">
                #1
              </div>
              <div className="flex items-start space-x-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Social Media Automation</h3>
                  <p className="text-xl font-regular text-gray-800">Automate Your Posts With Just Few <strong className="font-['Brice']">TAPS!</strong></p>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none flex justify-center items-center">
                <div className="flex items-center space-x-4 mb-12">
                  <span className="text-[30px] font-['Brice'] font-bold text-black/5 leading-none">TAP</span>
                  <span className="text-[30px] font-['Brice'] font-bold text-black leading-none">TAP</span>
                  <span className="text-[30px] font-['Brice'] font-bold text-black/5 leading-none">TAP</span>
                </div>
              </div>
            </div>

            {/* Card 2 - Sign Up */}
            <div className="bg-[#FEDE65] rounded-[32px] p-8 shadow-xl hover:shadow-2xl transition-all duration-300 relative border-2 border-black flex flex-col min-h-[320px] justify-between transform md:translate-y-4 md:scale-110 hover:-translate-y-1 z-20">
              <Image
                src="/landingpage-images/hand.svg"
                alt="Hand illustration"
                width={150}
                height={180}
                className="absolute left-1/2 -top-5 transform -translate-x-1/2 z-10 animate-float"
              />
              <div className="flex-grow"></div>

              <div className="flex flex-col items-center gap-4 mt-auto relative z-10">
              <p className="text-black font-medium text-lg animate-pulse">Click to Get Started!</p>
                <Link href="/dashboard">
                <button className="wiggle-on-hover bg-white text-black px-6 py-3 rounded-2xl font-['Brice'] hover:bg-gray-100 transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black transform rotate-3 hover:rotate-0">
                  SIGN UP NOW
                </button>
                </Link>
              </div>
            </div>

            {/* Card 3 - Rating */}
            <div className="bg-white rounded-[32px] p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-black min-h-[280px] flex flex-col justify-between relative transform hover:-translate-y-1 md:scale-90 z-10">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-black text-white text-lg font-medium w-10 h-10 flex items-center justify-center rounded-full shadow-md hover:shadow-lg transition-all duration-200">
                ⚡
              </div>
              <div className="flex flex-col items-center justify-center h-full">
                <h2 className="text-5xl font-['Brice'] font-bold text-gray-900 mb-4">24/7</h2>
                <p className="text-gray-600 text-center">AI-Powered <strong>Automation<br />& Support</strong></p>
              </div>
            </div>
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
      <section ref={featuresRef} className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-background opacity-0 translate-y-4 transition-all duration-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto pb-4 snap-x snap-mandatory">
            <div className="p-8 bg-gradient-to-b from-pink-50 to-transparent shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer flex-shrink-0 w-[85vw] md:w-auto snap-start">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-6">
                <Image src="/icons/Instagram.svg" alt="Instagram" width={24} height={24} className="w-6 h-6" />
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

            <div className="p-8 bg-gradient-to-b from-green-50 to-transparent shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer relative flex-shrink-0 w-[85vw] md:w-auto snap-start">
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

            <div className="p-8 bg-gradient-to-b from-blue-50 to-transparent shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer relative flex-shrink-0 w-[85vw] md:w-auto snap-start">
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

            <div className="p-8 bg-gradient-to-b from-purple-50 to-transparent shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer relative flex-shrink-0 w-[85vw] md:w-auto snap-start">
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
          <h1 className={`font-['Brice'] font-bold text-6xl md:text-8xl sm:text-6xl mb-16 text-black tracking-tight leading-tight`}>
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
              <h2 className={`font-['Brice'] text-5xl sm:text-6xl font-normal mb-8 text-black tracking-tight leading-tight`}>
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
              <h2 className={`font-['Brice'] text-5xl sm:text-6xl font-normal mb-8 text-black tracking-tight leading-tight`}>
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
              <h2 className={`font-['Brice'] text-5xl sm:text-6xl font-normal mb-8 text-black tracking-tight leading-tight`}>
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
              <h2 className={`font-['Brice'] text-5xl sm:text-6xl font-normal mb-8 text-black tracking-tight leading-tight`}>
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
              <h2 className={`font-['Brice'] font-bold text-5xl sm:text-6xl mb-8 text-black tracking-tight leading-tight`}>
                Auctorn AI: A Smarter Way to Chat
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
          <h2 className={`font-['Brice'] font-bold text-6xl md:text-8xl sm:text-6xl mb-16 text-black tracking-tight leading-tight`}>
            Discover why 1M+ brands trust Auctorn
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-8">
            <div className="p-8 flex flex-col items-center justify-center">
              <div className={`font-['Brice'] text-5xl sm:text-6xl font-normal mb-4 text-[#4F46E5]`}>1M+</div>
              <p className="text-gray-600 text-lg">Businesses chose Auctorn</p>
            </div>
            <div className="p-8 flex flex-col items-center justify-center">
              <div className={`font-['Brice'] text-5xl sm:text-6xl font-normal mb-4 text-[#4F46E5]`}>4B+</div>
              <p className="text-gray-600 text-lg">Messages automated</p>
            </div>
            <div className="p-8 flex flex-col items-center justify-center">
              <div className={`font-['Brice'] text-5xl sm:text-6xl font-normal mb-4 text-[#4F46E5]`}>170+</div>
              <p className="text-gray-600 text-lg">Global reach</p>
            </div>
            <div className="p-8 flex flex-col items-center justify-center relative">
              <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full shadow-sm">
                ★ Featured
              </div>
              <div className={`font-['Brice'] text-5xl sm:text-6xl font-normal mb-4 text-[#4F46E5]`}>#1</div>
              <p className="text-gray-600 text-lg">Social automation platform</p>
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
      <section ref={getStartedRef} className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white opacity-0 translate-y-4 transition-all duration-700">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className={`font-['Brice'] text-5xl sm:text-6xl font-bold mb-16 text-black tracking-tight leading-tight`}>
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
      <Footer />
    </main>
  );
}