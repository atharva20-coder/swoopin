"use client"

import Image from "next/image";
import Link from "next/link";
import LandingNav from "@/components/global/landing-nav";
import { ChatInterface } from "@/components/ui/chat-interface";
import { Brands } from "@/components/ui/brands";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import Footer from "@/components/global/footer";
import { FAQSection } from "@/components/global/FAQ/faq-section";
import { AnnouncementBanner } from "@/components/global/announcement-banner";

export default function LandingPage() {
  const heroRef = useScrollReveal();
  const trustedRef = useScrollReveal();
  const featuresRef = useScrollReveal();
  const leadGenRef = useScrollReveal();
  const statsRef = useScrollReveal();
  const testimonialRef = useScrollReveal();
  const getStartedRef = useScrollReveal();

  return (
    <main className="min-h-screen snap-y snap-mandatory overflow-y-auto">
      <LandingNav />
      <AnnouncementBanner />
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#8794FF] overflow-hidden mt-[144px] opacity-0 translate-y-4 transition-all duration-700">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left Column - Content */}
          <div className="text-left">
            <p className="text-black mb-4 font-medium">AUCTORN</p>
            <h1 className="font-['Brice'] font-normal text-6xl md:text-7xl mb-6 text-black tracking-tight leading-tight">
              Achieve lift-off with our product launch plan template
            </h1>
            <p className="text-xl text-gray-800 mb-8 max-w-2xl">
              Whether it&apos;s a new team project, a freelance pitch, or a thrilling side hustle, watch your next project take off with our customizable planning templates.
            </p>
            <Link href="/dashboard" className="group relative bg-black text-white px-8 py-4 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden hover:bg-[#1a1a1a] hover:rounded-none inline-block mb-12">
              <span className="relative z-10 flex items-center justify-center gap-2">
                <span className="absolute left-0 transform -translate-x-6 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
                <span className="transform group-hover:translate-x-3 transition-transform duration-300 text-lg">Try Auctorn For Free</span>
              </span>
            </Link>
          </div>
          
          {/* Right Column - Image with 3D Hover Effect */}
          <div 
            className="relative w-full h-full min-h-[400px] flex items-center justify-center perspective-1500"
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
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-background mt-28">
        <div className="max-w-7xl mx-auto text-center">
        <p className="text-[#4F46E5] mb-4 font-medium tracking-wide">POWERFUL DASHBOARD</p>
          <h2 className="font-['Brice'] font-normal text-6xl md:text-7xl mb-6 text-black tracking-tight leading-tight max-w-4xl mx-auto mt-10">
            Manage your social presence with our intuitive dashboard
          </h2>
          <p className="text-xl text-gray-800 mb-12 max-w-2xl mx-auto mt-10">
          Take control of your social media strategy with our comprehensive dashboard. Monitor engagement, track performance, and make data-driven decisions to grow your online presence.
          </p>
          <Link href="/dashboard" className="inline-block mt-10 bg-black text-white px-8 py-4 rounded-lg font-medium text-lg hover:bg-gray-900 transition-colors shadow-sm hover:shadow-md mb-16">
            Try Dashboard
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
      <section className="relative h-screen flex items-center px-4 sm:px-6 lg:px-8 bg-background snap-start">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="text-left">
            <h4 className="font-['Brice'] font-normal text-5xl md:text-6xl mb-6 text-black tracking-tight leading-tight">
                Automate Your Success
              </h4>
              <p className="text-xl text-gray-800 mb-6">
                Transform your social media presence with intelligent automation that handles engagement, grows your audience, and drives conversions 24/7.
              </p>
              <div className="mt-8 space-y-3">
                <div className="flex items-start">
                  <span className="font-medium min-w-[140px]">Smart Scheduling:</span>
                  <p className="text-gray-600">Set up automated responses and engagement patterns that work around the clock, ensuring you never miss an opportunity to connect.</p>
                </div>
                <div className="flex items-start">
                  <span className="font-medium min-w-[140px]">AI-Powered Engagement:</span>
                  <p className="text-gray-600">Let our AI handle comments, DMs, and story mentions with personalized responses that feel authentic and drive meaningful conversations.</p>
                </div>
                <div className="flex items-start">
                  <span className="font-medium min-w-[140px]">Analytics & Growth:</span>
                  <p className="text-gray-600">Track your performance metrics and audience growth in real-time, making data-driven decisions to optimize your social strategy.</p>
                </div>
              </div>
              <Link href="/dashboard" className="group relative bg-black text-white px-8 py-4 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden hover:bg-[#1a1a1a] hover:rounded-none inline-block mt-6">
                <span className="relative z-10 flex items-center justify-center gap-2 w-full">
                  <span className="absolute left-0 transform -translate-x-6 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                  <span className="transform group-hover:translate-x-3 transition-transform duration-300">Start automating</span>
                </span>
              </Link>
            </div>
            <div className="relative w-full h-[500px]">
              <Image
                src="/landingpage-images/img1.png"
                alt="Social Media Automation Illustration"
                fill
                style={{ objectFit: 'contain' }}
                className="rounded-xl"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Post Launch Section */}
      <section className="relative h-screen flex items-center px-4 sm:px-6 lg:px-8 bg-background snap-start">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="relative w-full h-[500px]">
              <Image
                src="/landingpage-images/post-launch.png"
                alt="Post Launch Illustration"
                fill
                style={{ objectFit: 'contain' }}
                className="rounded-xl"
                priority
              />
            </div>
            <div className="text-left">
              <p className="text-[#4F46E5] mb-4 font-medium">AUTOMATION SUITE</p>
              <h4 className="font-['Brice'] font-normal text-5xl md:text-6xl mb-6 text-black tracking-tight leading-tight">
                Your All-in-One Social Automation Hub
              </h4>
              <p className="text-xl text-gray-800 mb-8">
                Transform your Instagram presence today with our powerful AI automation, while preparing for tomorrow with upcoming integrations for Threads, Facebook, WhatsApp, Newsletter, Telegram, X, and LinkedIn. Our intelligent platform helps you create engaging conversations, deliver 24/7 customer support, and scale your social media engagement effortlessly across all channels.
              </p>
              <Link href="/dashboard" className="group relative bg-black text-white px-8 py-4 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden hover:bg-[#1a1a1a] hover:rounded-none inline-block mt-6">
                <span className="relative z-10 flex items-center justify-center gap-2 w-full">
                  <span className="absolute left-0 transform -translate-x-6 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                  <span className="transform group-hover:translate-x-3 transition-transform duration-300">Start automating</span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="mt-32 relative h-screen flex items-center px-4 sm:px-6 lg:px-8 bg-background snap-start opacity-0 translate-y-4 transition-all duration-700">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-['Brice'] font-bold text-6xl md:text-8xl sm:text-6xl mb-16 text-black tracking-tight leading-tight text-center">
            For an out-of-this-world success
          </h1>
          <p className="text-xl text-gray-600 mb-16 max-w-3xl mx-auto text-center">
            Fuel your project with a simplified product launch plan. Then, dive into the specifics with templates from our Community.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8">
              <Image
                src="/landingpage-images/target-audience.png"
                alt="Target Audience"
                width={400}
                height={400}
                className="w-full h-auto"
              />
              <h3 className="text-2xl font-semibold mb-3 mt-6">Target audience</h3>
              <p className="text-gray-600">Understand the needs of a promising customer base before launch.</p>
            </div>

            <div className="bg-white p-8">
              <Image
                src="/landingpage-images/likes-comment-expression.png"
                alt="Social Media Planner"
                width={400}
                height={400}
                className="w-full h-auto"
              />
              <h3 className="text-2xl font-semibold mb-3 mt-6">Social media planner</h3>
              <p className="text-gray-600">Strengthen your messaging with a consistent posting schedule.</p>
            </div>

            <div className="bg-white p-8">
              <Image
                src="/landingpage-images/flow-builder.png"
                alt="Other Templates"
                width={400}
                height={400}
                className="w-full h-auto"
              />
              <h3 className="text-2xl font-semibold mb-3 mt-6">Other templates from the community</h3>
              <p className="text-gray-600">Endeavor in new directions with business insights from all angles.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Lead Generation Section */}
      <section ref={leadGenRef} className="py-20 px-4 sm:px-6 lg:px-8 bg-background opacity-0 translate-y-4 transition-all duration-700 mt-32">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className={`font-['Brice'] font-bold text-6xl md:text-8xl sm:text-6xl mb-24 text-black tracking-tight leading-tight`}>
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
            <div ref={useScrollReveal()} className="opacity-0 translate-y-4 transition-all duration-700">
              <h2 className={`font-['Brice'] font-bold text-5xl sm:text-6xl mb-8 text-black tracking-tight leading-tight`}>
                Auctorn AI: A Smarter Way to Chat
              </h2>
              <p className="text-lg text-muted-foreground mb-8">Level up the experiences your followers already love with the new Auctorn AI. Create more engaging and personalized conversations.</p>
              <Link href="/dashboard" className="bg-[#4F46E5] text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-[#4338CA] transition-colors shadow-sm hover:shadow-md inline-block">
                Get Started
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
      <section className="relative py-20 bg-background mt-28">
        <div className="w-full">
          <div className="w-full">
            <div className="relative w-full perspective-1500">
              <Image
                src="/landingpage-images/ig-story.png"
                alt="Instagram Story Interface"
                width={800}
                height={600}
                className="w-full h-auto hover-image transition-transform duration-300 ease-out"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* Footer Section */}
      <Footer />
    </main>
  );
}