"use client"

import React, { useState } from 'react';
import Image from 'next/image';
import LandingNav from '@/components/global/landing-nav';
import Footer from '@/components/global/footer';

const InstagramPage = () => {
  const [activeSection, setActiveSection] = useState<string>('stories');

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? '' : section);
  };

  return (
    <div className="bg-white min-h-screen">
      <LandingNav />
      {/**Hero Section */}
      <section className="mt-16 relative w-full min-h-screen overflow-hidden bg-[#0a0a1a]">
        {/* Abstract flowing background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-[#ff7e5f]/30 via-[#feb47b]/20 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-tr from-[#4361ee]/30 via-[#7209b7]/20 to-transparent"></div>

          {/* Light streaks */}
          <div className="absolute top-1/4 right-0 w-full h-32 bg-gradient-to-l from-[#f72585]/20 via-[#b5179e]/10 to-transparent transform -rotate-6"></div>
          <div className="absolute top-1/3 left-0 w-full h-24 bg-gradient-to-r from-[#4cc9f0]/20 via-[#4895ef]/10 to-transparent transform rotate-3"></div>
          <div className="absolute bottom-1/3 right-0 w-full h-28 bg-gradient-to-l from-[#f8961e]/20 via-[#f9c74f]/10 to-transparent transform -rotate-3"></div>

          {/* Stars/particles */}
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white animate-pulse"
              style={{
                width: Math.random() * 3 + 1 + 'px',
                height: Math.random() * 3 + 1 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                opacity: Math.random() * 0.7 + 0.3,
                animationDuration: Math.random() * 3 + 2 + 's'
              }}
            />
          ))}
        </div>
        {/* Content container */}
        <div className="relative z-10 container mx-auto px-6 pt-20 pb-24 flex flex-col md:flex-row items-center md:items-start justify-between gap-12">
          {/* Left column - Article info */}
          <div className="w-full md:w-1/2 max-w-2xl text-white space-y-8">
            <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-4">
              <p className="text-sm font-medium text-[#4cc9f0]">Wed Mar 12 2025 • 5 min read</p>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Automating your Game on<br />
              <span className="bg-gradient-to-r from-[#4cc9f0] via-[#f72585] to-[#ffd166] text-transparent bg-clip-text">
                Instagram
              </span>
            </h1>

            <h2 className="text-4xl font-bold text-white/90">
              Features, How to and Guide
            </h2>

            <p className="text-xl text-white/70 leading-relaxed">
              Discover how Instagram Automation can transform your social media strategy in 2025.
              Learn about its capabilities, pricing, advantages, challenges, and more.
            </p>

            {/* Author info */}
            <div className="flex items-center gap-4 pt-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4361ee] to-[#3a0ca3]"></div>
              <div>
                <p className="font-semibold">Atharva Joshi</p>
                <p className="text-sm text-white/60">Founder & Developer</p>
              </div>
            </div>
          </div>

          {/* Right column - Decorative elements */}
          <div className="w-full md:w-1/2 max-w-xl">
            <div className="relative w-full aspect-square md:aspect-auto md:h-[500px] rounded-2xl overflow-hidden backdrop-blur-md bg-white/5 border border-white/10 p-1">
              <div className="absolute inset-0 bg-gradient-to-br from-[#4cc9f0]/20 via-[#f72585]/10 to-[#ffd166]/5 rounded-2xl"></div>

              {/* Decorative UI elements */}
              <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-[#480ca8]/30 to-[#4361ee]/20 rounded-full blur-2xl"></div>
              <div className="absolute bottom-1/3 right-1/4 w-1/3 h-1/3 bg-gradient-to-tl from-[#f72585]/30 to-[#b5179e]/20 rounded-full blur-xl"></div>

              {/* Abstract flowing line */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M10,50 Q25,25 50,50 T90,50"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="0.5"
                  className="animate-pulse"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4cc9f0" />
                    <stop offset="50%" stopColor="#f72585" />
                    <stop offset="100%" stopColor="#ffd166" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        {/* Wave decoration at bottom */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" fill="none" preserveAspectRatio="none">
            <path
              fill="#0a0a1a"
              fillOpacity="0.8"
              d="M0,32L60,37.3C120,43,240,53,360,69.3C480,85,600,107,720,101.3C840,96,960,64,1080,58.7C1200,53,1320,75,1380,85.3L1440,96L1440,100L1380,100C1320,100,1200,100,1080,100C960,100,840,100,720,100C600,100,480,100,360,100C240,100,120,100,60,100L0,100Z"
            />
          </svg>
        </div>
      </section>

      {/**Automate in 3 easy steps */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="font-['Brice'] text-black text-5xl font-black text-center mb-12 pb-11">Automate in 3 easy steps</h1>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-gray-50 rounded-2xl p-6 relative">
            <div className="absolute -top-10 left-6">
              <div className="relative w-20 h-20">
                <Image
                  src="/landingpage-images/bg-green.svg"
                  width={100}
                  height={100}
                  alt="Influencer"
                  className="rounded-lg"
                />
                <div className="absolute -right-4 -bottom-2 bg-black text-white px-3 py-1 rounded-full">
                  PRICE
                </div>
              </div>
            </div>
            <div className="mt-12">
              <h2 className="text-black text-2xl font-bold flex items-center">
                <span className="bg-black text-white rounded-full w-8 h-8 inline-flex items-center justify-center mr-2">1</span>
                Choose your trigger
              </h2>
              <p className="text-black text-xl mt-4">Select which comments or keywords activate your automated DMs</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="mb-6">
              <div className="bg-black text-white px-4 py-2 rounded-lg ">
                Enjoy! 💛
              </div>
              <div className="bg-white border text-center text-black rounded-lg px-4 py-2 mt-1">
                your-link.c|
              </div>
            </div>
            <h2 className="text-black text-2xl font-bold flex items-center">
              <span className="bg-black text-white rounded-full w-8 h-8 inline-flex items-center justify-center mr-2">2</span>
              Customize your response
            </h2>
            <p className="text-black text-xl mt-4">Set up personalized messages, links, or offers to share</p>
          </div>

          {/* Step 3 */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="bg-orange-500 text-white px-3 py-1 rounded-lg inline-flex items-center mb-4">
              <span className="mr-2">💬 2K</span>
              <span className="mr-2">❤️ 9K</span>
              <span>👤 680</span>
            </div>
            <h2 className="text-black text-2xl font-bold flex items-center">
              <span className="bg-black text-white rounded-full w-8 h-8 inline-flex items-center justify-center mr-2">3</span>
              Watch it work
            </h2>
            <p className="text-black text-xl mt-4">Let automation handle the rest while you focus on creating</p>
          </div>
        </div>
      </section>

      {/* Feature Benefits */}
      <section className="max-w-6xl mx-auto px-4 py-12">
      <h2 className="font-['Brice'] font-bold text-5xl text-black text-center mb-12">Because it works.</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Benefit 1 */}
          <div className="bg-blue-100 p-6 rounded-2xl">
            <h3 className="text-black text-xl font-bold mb-2 flex items-center">
              <span className="text-black mr-2">💬</span>
              Answer every FAQ
            </h3>
            <p className="text-black text-center text-sm mb-4">
              Deliver fast responses 24/7 using Instagram DM Marketing. It costs less than a virtual assistant and never forgets to respond
            </p>
            <div className="bg-black rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-blue-300"></div>
                  <p className="ml-2 text-sm">fletchergoods</p>
                </div>
                <div className="flex space-x-2">
                  <span>⧉</span>
                  <span>⚑</span>
                  <span>ⓘ</span>
                </div>
              </div>
              <div className="bg-slate-800 text-white rounded-lg p-3 mb-2 text-sm">
                <p>Hi Max! As a first-time customer, would you like 10% off our newest collection?</p>
                <div className="bg-gray-700 text-white rounded-md p-2 mt-2 text-center">
                  <p>Yes! I&apos;ll take it 🚀</p>
                </div>
                <div className="bg-gray-700 text-white rounded-md p-2 mt-2 text-center">
                  <p>Speak to a human</p>
                </div>
              </div>
              <div className="bg-purple-500 text-white rounded-lg p-3 mb-2 text-sm text-center">
                <p>Yes! I&apos;ll take it 🚀</p>
              </div>
              <div className="bg-slate-800 text-white rounded-lg p-3 mb-2 text-sm">
                <p>Great! Please confirm your email address below so I can send you the coupon code 🔥</p>
              </div>
              <div className="bg-purple-500 text-white rounded-lg p-3 mb-2 text-sm text-center">
                <p>max@auctorn.com</p>
              </div>
              <div className="bg-slate-800 text-white rounded-lg p-3 mb-2 text-sm">
                <p>Thanks! Please confirm your phone number 👇</p>
              </div>
            </div>
          </div>

          {/* Benefit 2 */}
          <div className="bg-yellow-100 p-6 rounded-2xl">
            <h3 className="text-black text-xl font-bold mb-2 flex items-center">
              <span className="mr-2">📋</span>
              Convert more followers
            </h3>
            <p className="text-black text-center text-sm mb-4">
              Build a contact list, generate and collect leads, and re-engage prospects, so you only speak with those who are interested
            </p>
            <div className="bg-black rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-yellow-600"></div>
                  <p className="ml-2 text-sm">heavenpizza</p>
                </div>
                <div className="flex space-x-2">
                  <span>⧉</span>
                  <span>⚑</span>
                  <span>ⓘ</span>
                </div>
              </div>
              <div className="bg-gray-200 rounded-lg overflow-hidden mb-3">
                <div className="h-24 bg-orange-200"></div>
              </div>
              <div className="bg-slate-800 text-white rounded-lg p-3 mb-2 text-sm">
                <p>Welcome to Heaven Pizza, Janise!</p>
              </div>
              <div className="bg-slate-800 text-white rounded-lg p-3 mb-2 text-sm">
                <p>How can I help you?</p>
              </div>
              <div className="bg-yellow-500 text-white rounded-lg p-3 mb-2 text-sm text-center">
                <p>See our locations</p>
              </div>
              <div className="bg-gray-700 text-white rounded-md p-2 mt-2 text-sm text-center">
                <p>Make a reservation</p>
              </div>
              <div className="bg-gray-700 text-white rounded-md p-2 mt-2 text-sm text-center">
                <p>Contact us</p>
              </div>
              <div className="bg-yellow-500 text-white rounded-lg p-3 mt-3 text-sm text-center">
                <p>See our locations</p>
              </div>
            </div>
          </div>

          {/* Benefit 3 */}
          <div className="bg-purple-100 p-6 rounded-2xl">
            <h3 className="text-black text-xl font-bold mb-2 flex items-center">
              <span className="mr-2">🗡️</span>
              Automate your IG funnel
            </h3>
            <p className="text-black text-center text-sm mb-4">
              Shave down the time it takes to get a prospect on a call, launch new collections, gather reviews, and share partner products!
            </p>
            <div className="bg-black rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-orange-400"></div>
                  <p className="ml-2 text-sm">pettyshop</p>
                </div>
                <div className="flex space-x-2">
                  <span>⧉</span>
                  <span>⚑</span>
                  <span>ⓘ</span>
                </div>
              </div>
              <div className="bg-purple-500 text-white rounded-lg p-3 mb-2 text-sm text-center">
                <p>Shop cat supplies</p>
              </div>
              <div className="bg-slate-800 text-white rounded-lg p-3 mb-4 text-sm">
                <p>Here at Petty Shop you will find finest selection of cat supplies found anywhere in the world.</p>
              </div>
              <div className="bg-gray-100 rounded-lg h-20 mb-4 flex justify-center items-center">
                <p className="text-black font-bold">Pretty</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-800 text-white rounded-lg p-2 text-sm text-center">
                  <p>Petty Dry Cat Food</p>
                </div>
                <div className="bg-slate-800 text-white rounded-lg p-2 text-sm text-center">
                  <p>Petty Toys</p>
                </div>
              </div>
              <div className="bg-purple-200 text-purple-600 rounded-lg p-3 mt-3 text-sm text-center font-medium">
                <p>Purchase now</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trigger Examples */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="font-['Brice'] font-bold text-5xl text-black text-center mb-12">Seen this lately?</h2>
        <div className="flex justify-center">
          <div className="bg-gray-50 rounded-2xl p-6 max-w-md">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-500 shrink-0 flex items-center justify-center">👨</div>
              <div>
                <p className="text-black font-medium">creator</p>
                <p className="text-black">Comment PRICE to get the link in your DMs!</p>
              </div>
            </div>
            <div className="border-t my-4"></div>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-pink-500 shrink-0 flex items-center justify-center">🙋‍♀️</div>
              <div>
                <p className="text-black font-medium">follower now</p>
                <p className='text-black'>PRICE</p>
                <p className="text-gray-500">Reply</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 shrink-0 flex items-center justify-center">👨</div>
              <div>
                <p className="text-black font-medium">creator now</p>
                <p className='text-black'>Thanks! 💛 Please check your DMs!</p>
                <p className="text-gray-500">Reply</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="font-['Brice'] font-bold text-5xl text-black text-center mb-6">Yeah. That&apos;s us.</h2>
        <div className="flex justify-center mb-12">
          <div className="bg-gray-50 rounded-2xl p-6 max-w-md">
            <div className="bg-white rounded-lg p-4 mb-4">
              <p className="text-black font-medium">Hey! Are you ready to get that link? ✌️</p>
              <div className="text-black bg-gray-100 rounded-lg p-3 mt-2">
                <p>Yeah, send it over!</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-300 shrink-0"></div>
              <div className="bg-purple-500 text-white rounded-full py-2 px-4">
                <p>Yeah, send it over!</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 mt-4">
              <p className="text-black font-medium">Here&apos;s the link you asked for. Enjoy!</p>
              <div className="text-black bg-gray-100 rounded-lg p-3 mt-2 text-center">
                <p>Open</p>
              </div>
            </div>
          </div>
        </div>
        
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 vh100">
        <h2 className="text-black text-3xl font-bold text-center mb-12">Powerful Instagram Features</h2>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Accordions Container */}
          <div className="w-full md:w-1/2 space-y-6">
            {/* Story Replies Accordion Item */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                className={`w-full p-6 flex items-center justify-between text-left ${activeSection === 'stories' ? 'bg-gray-50' : 'bg-white'}`}
                onClick={() => toggleSection('stories')}
              >
                <div className="flex items-center">
                  <span className="text-black mr-3 text-2xl">⊕</span>
                  <h3 className="text-black text-xl font-bold">Story reply, reaction, mention</h3>
                </div>
                <span className="text-2xl">{activeSection === 'stories' ? '−' : '+'}</span>
              </button>
              {activeSection === 'stories' && (
                <div className="pt-6">
                  <p className="text-black mb-6">
                    Use Auctorn as your personal assistant that sounds exactly like you! Automatically answer every reaction, story reply, and story mention, and keep your viewers begging for more.
                  </p>
                </div>
              )}
            </div>

            {/* Feed Posts Accordion Item */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                className={`w-full p-6 flex items-center justify-between text-left ${activeSection === 'feed' ? 'bg-gray-50' : 'bg-white'}`}
                onClick={() => toggleSection('feed')}
              >
                <div className="flex items-center">
                  <span className="text-black mr-3 text-2xl">❤️</span>
                  <h3 className="text-black text-xl font-bold">Feed posts</h3>
                </div>
                <span className="text-2xl">{activeSection === 'feed' ? '−' : '+'}</span>
              </button>
              {activeSection === 'feed' && (
                <div className="pt-6">
                  <p className="text-black mb-6">
                  This is your secret weapon to ignite engagement — automatically like and respond to every comment, and send more information to your followers&apos; DMs, including links to products they can purchase!
                  </p>
                </div>
              )}
            </div>

            {/* Instagram Live Accordion Item */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                className={`w-full p-6 flex items-center justify-between text-left ${activeSection === 'live' ? 'bg-gray-50' : 'bg-white'}`}
                onClick={() => toggleSection('live')}
              >
                <div className="flex items-center">
                  <span className="text-purple-500 mr-3 text-2xl">⦿</span>
                  <h3 className="text-black text-xl font-bold">Instagram Live</h3>
                </div>
                <span className="text-2xl">{activeSection === 'live' ? '−' : '+'}</span>
              </button>
              {activeSection === 'live' && (
                <div className="pt-6">
                  <p className="text-black mb-6">
                  Auctorn delivers hot deals, coupon codes and more directly to your audience&apos;s DMs — all while you&apos;re live! Best of all, you don&apos;t have to do a thing, just go live and tell your viewers to type a word in the chat to get instant access to the info.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Interfaces Container */}
          <div className="w-full md:w-1/2">
            {/* Stories Chat Interface */}
            {activeSection === 'stories' && (
              <div className="sticky top-24">
                <div className="relative w-full max-w-xs ml-auto">
                  <div className="bg-black rounded-2xl p-4 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 mb-3 rounded-full bg-gradient-to-r from-[#4cc9f0] via-[#f72585] to-[#ffd166]"></div>
                      <p className='mb-3'>fletchergoods</p>
                    </div>
                    <div className="flex mt-3 mb-3">
                      <div className="relative w-32 h-40 rounded-xl"
                        style={{
                          backgroundImage: 'linear-gradient(293.5deg, rgba(181,149,208,1) 3.2%, rgba(251,148,207,1) 9.9%, rgba(181,149,208,1) 22.9%, rgba(251,148,207,1) 36.4%, rgba(181,149,208,1) 50.1%, rgba(251,148,207,1) 61.1%, rgba(181,149,208,1) 71.2%, rgba(251,148,207,1) 84.2%, rgba(181,149,208,1) 92.2%)'
                        }}>
                        <div className="absolute bottom-0 left-0 bg-red-500 text-white text-xs p-1 rounded-b-xl">
                          Just bought this jacket from @fletchergoods I love it!
                        </div>
                      </div>
                    </div>
                    <div className="bg-pink-500 rounded-xl p-2 mb-3">
                      <p className="text-sm">You mentioned fletchergoods in your story</p>
                    </div>
                    <div className="bg-slate-800 text-white rounded-xl p-3 mb-2">
                      <p>Thanks for the mention!</p>
                    </div>
                    <div className="bg-slate-800 text-white rounded-xl p-3 mb-2">
                      <p>Here&apos;s a 10% off coupon for the next purchase! 👇</p>
                    </div>
                    <div className="bg-slate-800 text-white rounded-xl p-3 mb-2">
                      <p>FLETCHERFLASH10</p>
                    </div>
                    <div className="bg-pink-500 text-white rounded-xl p-3 mb-2 text-right">
                      <p>Thank you!</p>
                      </div>
                      <div className="bg-pink-500 text-white rounded-xl p-3 mb-2 text-right">
                      <p>Just remembered I wanted to buy some socks too!</p></div>
                      <div className="bg-slate-800 text-white rounded-xl p-3">
                        <p>Great! Tap below to start shopping</p>
                        <div className="bg-pink-100 mt-3 rounded-xl p-3 text-center text-pink-600 font-medium">
                          <p>Shop now</p>
                        </div>
                      </div>
                  </div>
                </div>
              </div>
            )}

            {/* Feed Posts Chat Interface */}
            {activeSection === 'feed' && (
              <div className="sticky top-24">
                <div className="relative w-full max-w-xs ml-auto">
                <div className="bg-black p-4 mb-3 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 mb-3 rounded-full bg-yellow-300"></div>
                        <p className="text-white mb-3">fletchergoods</p>
                      </div>
                      <div className="h-48 rounded-xl mb-3"
                      style={{
                        backgroundImage: 'linear-gradient( 65.9deg,  rgba(85,228,224,1) 5.5%, rgba(75,68,224,0.74) 54.2%, rgba(64,198,238,1) 55.2%, rgba(177,36,224,1) 98.4% )'
                      }}
                      ></div>
                      <div className="bg-yellow-500 rounded-xl p-3 mb-3">
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-300"></div>
                          <div>
                          <p>Check this out! @ponyolecorgi @ponyos_surprise</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-slate-800 text-white rounded-xl p-3 mb-2">
                        <p>Hey, @nathanos! You&apos;ve successfully entered the Mega June Giveaway 🎉</p>
                      </div>
                      <div className="bg-slate-800 text-white rounded-xl p-3 mb-2">
                      <p>And huge thanks for tagging your friends! ✅</p>
                      </div>
                      <div className="bg-slate-800 text-white rounded-xl p-3 mb-2">
                        <p>In case you&apos;re our lucky winner, we&apos;d like to notify you via email. Please confirm your email address below 👇</p>
                      </div>
                      <div className="bg-yellow-500 text-white rounded-xl p-3 mb-2 text-center">
                        <p>nathan@Auctorn.com</p>
                      </div>
                      <div className="bg-slate-800 text-white rounded-xl p-3 mb-2">
                        <p>Thank you so much! We&apos;ll be back soon with the results</p>
                      </div>
                      <div className="bg-slate-800 text-white rounded-xl p-3 mb-2">
                        <p>Before you go, what&apos;s your favorite genre of music?</p>
                      </div>
                    </div>
                </div>
              </div>
            )}

            {/* Instagram Live Chat Interface */}
            {activeSection === 'live' && (
              <div className="sticky top-24">
                <div className="relative w-full max-w-xs ml-auto">
                <div className="bg-black rounded-2xl p-4 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-300"></div>
                        <p>cody_blake</p>
                      </div>
                      <div className="absolute top-0 right-0 bg-purple-600 text-white px-2 py-1 text-sm rounded rounded-tr-2xl">
                        LIVE 1.5K
                      </div>
                      <div className="bg-slate-800 text-white rounded-xl p-3 mb-2">
                        <p>Hi, Alexander! Thank you for your interest in my &ldquo;Creator Economy &amp; AI&rdquo; eBook 🚀</p>
                      </div>
                      <div className="bg-slate-800 text-white rounded-xl p-3 mb-2">
                        <p>Please enter your email address (I&apos;ll also leave a link here, but this is your back-up copy.) 👇</p>
                      </div>
                      <div className="bg-purple-500 text-white rounded-xl p-3 mb-2 text-center">
                        <p>alex@Auctorn.com</p>
                      </div>
                      <div className="bg-slate-800 text-white rounded-xl p-3 mb-2">
                        <p>Thanks for that! ❤️ I&apos;ll send it right away. Hope you like it!</p>
                      </div>
                      <div className="bg-slate-800 text-white rounded-xl p-3 mb-2">
                        <p>Here&apos;s your back-up copy 👇</p>
                      </div>
                      <div className="bg-blue-200 text-blue-600 rounded-xl p-3 mb-2 text-center font-medium">
                        <p>Read eBook</p>
                      </div>
                      <div className="bg-slate-800 text-white rounded-xl p-3 mb-2">
                        <p>Before you leave, I also want to tell you that I&apos;ll be hosting a session on Friday 8PM about AI for content creators. You in?</p>
                      </div>
                      <div className="bg-purple-500 text-white rounded-xl p-3 mb-2 text-center">
                        <p>Count me in! 🚀</p>
                      </div>
                    </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Instagram Automation That Converts */}
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <h1 className="font-['Brice'] text-black text-5xl md:text-6xl font-black leading-tight">
              Instagram Automation
              <span className="text-purple-600"> That Converts</span>
            </h1>
            <p className="text-xl text-gray-600">
              Turn passive followers into paying customers with automated DMs that feel 100% human.
              Capture leads, share links, and boost sales - automatically.
            </p>
            <button className="bg-black text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-800 transition-colors">
              Requirements →
            </button>
          </div>

          {/* Right Content - Chat Example */}
          <div className="relative">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              {/* User Message */}
              <div className="flex items-start gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-yellow-300 flex items-center justify-center">
                  👩
                </div>
                <div className="flex-1">
                  <p className="text-black font-medium">lisa_makeup</p>
                  <div className="text-black bg-gray-100 rounded-2xl p-4 mt-2">
                    <p>Comment PRICE below for secret discount! 💄</p>
                  </div>
                </div>
              </div>

              {/* Automated Response */}
              <div className="space-y-4">
                <div className="bg-black text-white rounded-2xl p-4">
                  <p>Thanks Lisa! 🔥 Your VIP discount is:</p>
                  <div className="bg-purple-500 text-white rounded-md p-3 mt-2 text-center font-bold">
                    LISA30
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Image
                      src="/bot-icon.svg"
                      width={24}
                      height={24}
                      alt="Automation Bot"
                    />
                  </div>
                  <div className="text-black bg-gray-100 rounded-2xl p-4">
                    <p>Sent via AutoDM • 98% satisfaction rate</p>
                    <div className="flex items-center mt-2 text-yellow-400">
                      ★★★★★ <span className="text-gray-600 ml-2">2.4k uses</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-6 -right-6">
              <div className="relative w-32 h-32">
                <Image
                  src="/sparkles.svg"
                  width={128}
                  height={128}
                  alt="Sparkles"
                  className="animate-pulse"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* FOOTER Section */}
      <Footer />
    </div>
  );
};

export default InstagramPage;