"use client"

import Image from "next/image";
import Link from "next/link";
import LandingNav from "@/components/global/landing-nav";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import Footer from "@/components/global/footer";
import { FAQSection } from "@/components/global/FAQ/faq-section";
import { AnnouncementBanner } from "@/components/global/announcement-banner";

export default function LandingPage() {
  const heroRef = useScrollReveal();
  const featuresRef = useScrollReveal();
  const leadGenRef = useScrollReveal();


  return (
    <main className="min-h-screen snap-y snap-mandatory overflow-y-auto">
      <LandingNav />
      <AnnouncementBanner />
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center py-8 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#8794FF] overflow-hidden mt-[52px] sm:mt-[144px] opacity-0 translate-y-4 transition-all duration-700">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center relative z-10">
          {/* Mobile Image */}
          <div className="block lg:hidden w-full mb-8">
            <Image
              src="/landingpage-images/ig-story.png"
              alt="Instagram Story Interface"
              width={800}
              height={600}
              className="w-full h-auto"
              priority
            />
          </div>
          <div className="text-left px-2 sm:px-0">
            <p className="text-black mb-3 sm:mb-4 font-medium text-xs sm:text-base">AUCTORN</p>
            <h1 className="font-['Brice'] font-bold text-3xl sm:text-6xl md:text-7xl mb-3 sm:mb-6 text-black tracking-tight leading-tight">
            SMART MOVES, VIRAL WINS: AUTOMATE & THRIVE
            </h1>
            <p className="text-sm sm:text-xl text-gray-800 mb-4 sm:mb-8 max-w-2xl">
            Boost your sales and conversions on Instagram, WhatsApp, and Messenger with our automation tools. Whether you&apos;re launching a new campaign or scaling up your business, watch your success soar with our customizable solutions.
            </p>
            <Link href="/dashboard" className="group relative bg-black text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden hover:bg-[#1a1a1a] hover:rounded-none inline-block w-full sm:w-auto text-center">
                <span className="relative z-10 flex items-center justify-center gap-2 w-full">
                  <span className="absolute left-0 transform -translate-x-6 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                  <span className="transform group-hover:translate-x-3 transition-transform duration-300 text-lg sm:text-xl font-bold">Try Auctorn For Free</span>
                </span>
              </Link>
          </div>
          
          {/* Right Column - Image with 3D Hover Effect */}
          <div 
            className="relative w-full h-full min-h-[400px] hidden lg:flex items-center justify-center perspective-1500"
            onMouseMove={(e) => {
              const bounds = e.currentTarget.getBoundingClientRect();
              const mouseX = e.clientX;
              const mouseY = e.clientY;
              const leftX = mouseX - bounds.x;
              const topY = mouseY - bounds.y;
              const center = {
                x: leftX - bounds.width / 2,
                y: topY - bounds.height / 2
              };
              const distance = Math.sqrt(center.x ** 2 + center.y ** 2);
              
              const imageEl = e.currentTarget.querySelector('.hover-image') as HTMLElement;
              
              if (imageEl) {
                imageEl.style.transform = `
                  rotate3d(
                    ${center.y / 100},
                    ${-center.x / 100},
                    0,
                    ${Math.log(distance) * 2}deg
                  )
                `;
              }
            }}
            onTouchMove={(e) => {
              const touch = e.touches[0];
              const bounds = e.currentTarget.getBoundingClientRect();
              const touchX = touch.clientX;
              const touchY = touch.clientY;
              const leftX = touchX - bounds.x;
              const topY = touchY - bounds.y;
              const center = {
                x: leftX - bounds.width / 2,
                y: topY - bounds.height / 2
              };
              const distance = Math.sqrt(center.x ** 2 + center.y ** 2);
              
              const imageEl = e.currentTarget.querySelector('.hover-image') as HTMLElement;
              
              if (imageEl) {
                imageEl.style.transform = `
                  rotate3d(
                    ${center.y / 100},
                    ${-center.x / 100},
                    0,
                    ${Math.log(distance) * 2}deg
                  )
                `;
              }
            }}
            onMouseLeave={(e) => {
              const imageEl = e.currentTarget.querySelector('.hover-image') as HTMLElement;
              if (imageEl) {
                imageEl.style.transform = '';
              }
            }}
            onTouchEnd={(e) => {
              const imageEl = e.currentTarget.querySelector('.hover-image') as HTMLElement;
              if (imageEl) {
                imageEl.style.transform = '';
              }
            }}
          >
            <div className="relative">
              <Image
                src="/landingpage-images/ig-post-bw.svg"
                alt="Instagram Post Illustration"
                width={100}
                height={100}
                className="w-full max-w-lg h-auto hover-image transition-transform duration-300 ease-out"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Showcase Section */}
      <section className="relative py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-background mt-16 sm:mt-28">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-[#4F46E5] mb-3 sm:mb-4 font-medium tracking-wide text-sm">POWERFUL DASHBOARD</p>
          <h2 className="font-['Brice'] font-normal text-4xl sm:text-6xl md:text-7xl mb-4 sm:mb-6 text-black tracking-tight leading-tight max-w-4xl mx-auto mt-6 sm:mt-10">
            Manage your social presence with our intuitive dashboard
          </h2>
          <p className="text-base sm:text-xl text-gray-800 mb-8 sm:mb-12 max-w-2xl mx-auto mt-6 sm:mt-10">
            Take control of your social media strategy with our comprehensive dashboard. Monitor engagement, track performance, and make data-driven decisions to grow your online presence.
          </p>
          <Link href="/dashboard" className="group relative bg-black text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden hover:bg-[#1a1a1a] hover:rounded-none inline-block w-full sm:w-auto text-center">
                <span className="relative z-10 flex items-center justify-center gap-2 w-full">
                  <span className="absolute left-0 transform -translate-x-6 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                  <span className="transform group-hover:translate-x-3 transition-transform duration-300 text-lg sm:text-xl font-bold">Try Dashboard</span>
                </span>
            </Link>
          
          <div className="max-w-4xl mx-auto mt-10">
            <div 
              className="relative w-full perspective-1500"
              onMouseMove={(e) => {
                const bounds = e.currentTarget.getBoundingClientRect();
                const mouseX = e.clientX;
                const mouseY = e.clientY;
                const leftX = mouseX - bounds.x;
                const topY = mouseY - bounds.y;
                const center = {
                  x: leftX - bounds.width / 2,
                  y: topY - bounds.height / 2
                };
                const distance = Math.sqrt(center.x ** 2 + center.y ** 2);
                
                const imageEl = e.currentTarget.querySelector('.hover-image') as HTMLElement;
                
                if (imageEl) {
                  imageEl.style.transform = `
                    rotate3d(
                      ${center.y / 100},
                      ${-center.x / 100},
                      0,
                      ${Math.log(distance) * 2}deg
                    )
                  `;
                }
              }}
              onTouchMove={(e) => {
                const touch = e.touches[0];
                const bounds = e.currentTarget.getBoundingClientRect();
                const touchX = touch.clientX;
                const touchY = touch.clientY;
                const leftX = touchX - bounds.x;
                const topY = touchY - bounds.y;
                const center = {
                  x: leftX - bounds.width / 2,
                  y: topY - bounds.height / 2
                };
                const distance = Math.sqrt(center.x ** 2 + center.y ** 2);
                
                const imageEl = e.currentTarget.querySelector('.hover-image') as HTMLElement;
                
                if (imageEl) {
                  imageEl.style.transform = `
                    rotate3d(
                      ${center.y / 100},
                      ${-center.x / 100},
                      0,
                      ${Math.log(distance) * 2}deg
                    )
                  `;
                }
              }}
              onMouseLeave={(e) => {
                const imageEl = e.currentTarget.querySelector('.hover-image') as HTMLElement;
                if (imageEl) {
                  imageEl.style.transform = '';
                }
              }}
              onTouchEnd={(e) => {
                const imageEl = e.currentTarget.querySelector('.hover-image') as HTMLElement;
                if (imageEl) {
                  imageEl.style.transform = '';
                }
              }}
            >
              <Image
                src="/landingpage-images/dashboard.png"
                alt="Auctorn Dashboard Interface"
                width={800}
                height={600}
                className="w-full h-auto rounded-xl shadow-2xl hover-image transition-transform duration-300 ease-out"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Product Launch Timeline Section */}
      <section className="relative min-h-screen flex items-center px-4 sm:px-6 lg:px-8 bg-background snap-start py-8 sm:py-12 mt-16 sm:mt-0">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24 items-center">
            <div className="text-left px-2 sm:px-0">
              <h4 className="font-['Brice'] font-normal text-3xl sm:text-5xl md:text-6xl mb-4 sm:mb-6 text-black tracking-tight leading-tight">
                Automate Your Success
              </h4>
              <p className="text-base sm:text-xl text-gray-800 mb-4 sm:mb-6 leading-relaxed">
                Transform your social media presence with intelligent automation that handles engagement, grows your audience, and drives conversions 24/7.
              </p>
              <div className="mt-6 sm:mt-8 space-y-6 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                  <span className="font-semibold text-base sm:text-base sm:min-w-[140px] text-black">Smart Scheduling:</span>
                  <p className="text-gray-700 text-base sm:text-base leading-relaxed">Set up automated responses and engagement patterns that work around the clock, ensuring you never miss an opportunity to connect.</p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                  <span className="font-semibold text-base sm:text-base sm:min-w-[140px] text-black">AI-Powered Engagement:</span>
                  <p className="text-gray-700 text-base sm:text-base leading-relaxed">Let our AI handle comments, DMs, and story mentions with personalized responses that feel authentic and drive meaningful conversations.</p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                  <span className="font-semibold text-base sm:text-base sm:min-w-[140px] text-black">Analytics & Growth:</span>
                  <p className="text-gray-700 text-base sm:text-base leading-relaxed">Track your performance metrics and audience growth in real-time, making data-driven decisions to optimize your social strategy.</p>
                </div>
              </div>
              <Link href="/dashboard" className="group relative bg-black text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden hover:bg-[#1a1a1a] hover:rounded-none inline-block w-full sm:w-auto text-center mt-8 sm:mt-12">
                <span className="relative z-10 flex items-center justify-center gap-2 w-full">
                  <span className="absolute left-0 transform -translate-x-6 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                  <span className="transform group-hover:translate-x-3 transition-transform duration-300 text-lg sm:text-xl font-bold">Schedule Your Success</span>
                </span>
              </Link>
            </div>
            <div className="relative w-full h-[450px] sm:h-[500px] lg:mt-0 order-first lg:order-none">
              <Image
                src="/landingpage-images/img1.png"
                alt="Social Media Automation Illustration"
                fill
                style={{ objectFit: 'contain' }}
                className="sm:rounded-xl"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Post Launch Section */}
      <section className="relative min-h-screen flex items-center px-4 sm:px-6 lg:px-8 bg-background snap-start py-8 sm:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24 items-center">
            <div className="relative w-full h-[400px] sm:h-[500px] mt-12 sm:mt-0 lg:order-1">
              <Image
                src="/landingpage-images/post-launch.png"
                alt="Post Launch Illustration"
                fill
                style={{ objectFit: 'contain' }}
                className="sm:rounded-xl"
                priority
              />
            </div>
            <div className="text-left lg:order-2">
              <p className="text-[#4F46E5] mb-2 sm:mb-4 font-semibold text-base sm:text-sm tracking-wide">AUTOMATION SUITE</p>
              <h4 className="font-['Brice'] font-normal text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6 text-black tracking-tight leading-[1.15]">Your All-in-One Social Automation Hub</h4>
              <p className="text-base sm:text-lg md:text-xl text-gray-800 mb-6 sm:mb-8 leading-relaxed max-w-2xl">
                Transform your Instagram presence today with our powerful AI automation, while preparing for tomorrow with upcoming integrations for Threads, Facebook, WhatsApp, Newsletter, Telegram, X, and LinkedIn. Our intelligent platform helps you create engaging conversations, deliver 24/7 customer support, and scale your social media engagement effortlessly across all channels.
              </p>
              <Link href="/dashboard" className="group relative bg-black text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden hover:bg-[#1a1a1a] hover:rounded-none inline-block w-full sm:w-auto text-center mt-8 sm:mt-12">
                <span className="relative z-10 flex items-center justify-center gap-2 w-full">
                  <span className="absolute left-0 transform -translate-x-6 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                  <span className="transform group-hover:translate-x-3 transition-transform duration-300 text-lg sm:text-xl font-bold">Integrate Instagram</span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="mt-16 sm:mt-32 relative min-h-screen flex items-center px-4 sm:px-6 lg:px-8 bg-background snap-start opacity-0 translate-y-4 transition-all duration-700 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-['Brice'] font-bold text-4xl sm:text-6xl md:text-8xl mb-8 sm:mb-16 text-black tracking-tight leading-tight text-center">
            For an out-of-this-world success
          </h1>
          <p className="text-base sm:text-xl text-gray-600 mb-8 sm:mb-16 max-w-3xl mx-auto text-center">
            Fuel your project with a simplified product launch plan. Then, dive into the specifics with templates from our Community.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white p-4 sm:p-8 -mx-4 sm:mx-0">
              <Image
                src="/landingpage-images/target-audience.png"
                alt="Target Audience"
                width={400}
                height={400}
                className="w-full h-auto"
              />
              <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3 mt-4 sm:mt-6">Target audience</h3>
              <p className="text-gray-600 text-sm sm:text-base">Understand the needs of a promising customer base before launch.</p>
            </div>

            <div className="bg-white p-4 sm:p-8 -mx-4 sm:mx-0">
              <Image
                src="/landingpage-images/likes-comment-expression.png"
                alt="Social Media Planner"
                width={400}
                height={400}
                className="w-full h-auto"
              />
              <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3 mt-4 sm:mt-6">Social media planner</h3>
              <p className="text-gray-600 text-sm sm:text-base">Strengthen your messaging with a consistent posting schedule.</p>
            </div>

            <div className="bg-white p-4 sm:p-8 -mx-4 sm:mx-0">
              <Image
                src="/landingpage-images/flow-builder.png"
                alt="Other Templates"
                width={400}
                height={400}
                className="w-full h-auto"
              />
              <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3 mt-4 sm:mt-6">Other templates from the community</h3>
              <p className="text-gray-600 text-sm sm:text-base">Endeavor in new directions with business insights from all angles.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Lead Generation Section */}
      <section ref={leadGenRef} className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-background opacity-0 translate-y-4 transition-all duration-700 mt-16 sm:mt-32">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className={`font-['Brice'] font-bold text-4xl sm:text-6xl md:text-8xl mb-24 text-black tracking-tight leading-tight`}>
          Use Chat Marketing to drive more sales on autopilot
          </h1>
        </div>
        <div className="max-w-7xl mx-auto space-y-16 sm:space-y-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div ref={useScrollReveal()} className="relative opacity-0 translate-y-4 transition-all duration-700">
              <video autoPlay loop muted playsInline className="w-full rounded-lg sm:rounded-2xl shadow-xl">
                <source src="/images/feature_generate-qualified-leads.webm" type="video/webm" />
              </video>
            </div>
            <div ref={useScrollReveal()} className="opacity-0 translate-y-4 transition-all duration-700 px-4">
              <h2 className="font-['Brice'] text-3xl sm:text-5xl md:text-6xl mb-4 sm:mb-8 text-black tracking-tight leading-tight">
                Supercharge your lead generation
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8">Capture and nurture leads through automated conversations. Convert website visitors into customers with personalized engagement strategies.</p>
              <Link href="/dashboard" className="group relative bg-black text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden hover:bg-[#1a1a1a] hover:rounded-none inline-block w-full sm:w-auto text-center mt-8 sm:mt-12">
                <span className="relative z-10 flex items-center justify-center gap-2 w-full">
                  <span className="absolute left-0 transform -translate-x-6 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                  <span className="transform group-hover:translate-x-3 transition-transform duration-300 text-lg sm:text-xl font-bold">Get Started</span>
                </span>
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
              <Link href="/dashboard" className="group relative bg-black text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden hover:bg-[#1a1a1a] hover:rounded-none inline-block w-full sm:w-auto text-center mt-8 sm:mt-12">
                <span className="relative z-10 flex items-center justify-center gap-2 w-full">
                  <span className="absolute left-0 transform -translate-x-6 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                  <span className="transform group-hover:translate-x-3 transition-transform duration-300 text-lg sm:text-xl font-bold">Get Started</span>
                </span>
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
              <h2 className={`font-['Brice'] font-bold text-5xl sm:text-6xl mb-8 text-black tracking-tight leading-tight`}>
                Automatically respond to every message
              </h2>
              <p className="text-lg text-muted-foreground mb-8">Automatically engage with every story mention, comment, and DM. Turn social interactions into meaningful conversations that drive sales.</p>
              <Link href="/dashboard" className="group relative bg-black text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden hover:bg-[#1a1a1a] hover:rounded-none inline-block w-full sm:w-auto text-center mt-8 sm:mt-12">
                <span className="relative z-10 flex items-center justify-center gap-2 w-full">
                  <span className="absolute left-0 transform -translate-x-6 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                  <span className="transform group-hover:translate-x-3 transition-transform duration-300 text-lg sm:text-xl font-bold">Get Started</span>
                </span>
              </Link>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div ref={useScrollReveal()} className="opacity-0 translate-y-4 transition-all duration-700">
              <h2 className={`font-['Brice'] font-bold text-5xl sm:text-6xl mb-8 text-black tracking-tight leading-tight`}>
                Auctorn AI: A Smarter Way to Chat
              </h2>
              <p className="text-lg text-muted-foreground mb-8">Level up the experiences your followers already love with the new Auctorn AI. Create more engaging and personalized conversations.</p>
              <Link href="/dashboard" className="group relative bg-black text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden hover:bg-[#1a1a1a] hover:rounded-none inline-block w-full sm:w-auto text-center mt-8 sm:mt-12">
                <span className="relative z-10 flex items-center justify-center gap-2 w-full">
                  <span className="absolute left-0 transform -translate-x-6 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                  <span className="transform group-hover:translate-x-3 transition-transform duration-300 text-lg sm:text-xl font-bold">Get Started</span>
                </span>
              </Link>
            </div>
            <div ref={useScrollReveal()} className="relative opacity-0 translate-y-4 transition-all duration-700">
              <video autoPlay loop muted playsInline className="w-full rounded-2xl shadow-xl">
                <source src="/images/feature_manychat-ai.webm" type="video/webm" />
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}

      {/* IG-Story Image Section */}
      <section className="hidden sm:block relative py-12 sm:py-20 bg-background mt-16 sm:mt-28">
        <div className="w-full px-4 sm:px-0">
          <div className="w-full">
            <div className="relative w-full perspective-1500">
              <Image
                src="/landingpage-images/ig-story.png"
                alt="Instagram Story Interface"
                width={800}
                height={600}
                className="w-full h-auto hover-image transition-transform duration-300 ease-out rounded-lg sm:rounded-none"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}

      <FAQSection />

      <Footer />
    </main>
  );
}