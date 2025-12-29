"use client"

import Image from "next/image"
import Link from "next/link"
import LandingNav from "@/components/global/landing-nav"
import Footer from "@/components/global/footer"
import { FAQSection } from "@/components/global/FAQ/faq-section"
import { cn } from '@/lib/utils'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { 
  Zap, MessageCircle, BarChart3, Calendar, Sparkles, Database,
  ArrowRight, Play, ChevronRight, 
  Instagram, Facebook, Send, Twitter, Linkedin,
  Palette, FileSpreadsheet, Bot, Inbox, Users, ShoppingBag,
  Mail, Reply, UserCheck, Clock, CheckCircle, Tag, MousePointerClick
} from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamic import for WorldMap to avoid SSR issues with react-simple-maps
const WorldMap = dynamic(() => import('@/components/landing/WorldMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-neutral-900/50 rounded-xl">
      <div className="animate-pulse text-neutral-500">Loading map...</div>
    </div>
  )
})

// Cinematic Flow Builder Animation - Exact match to actual app UI
function FlowBuilderAnimation({ isActive }: { isActive: boolean }) {
  const [phase, setPhase] = useState(0)
  const [cursorPos, setCursorPos] = useState({ x: 80, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [activeItem, setActiveItem] = useState<string | null>(null)
  const [connectorProgress, setConnectorProgress] = useState(0)
  
  // Animation timeline with node placement AND connector drawing
  useEffect(() => {
    if (!isActive) {
      setPhase(0)
      setCursorPos({ x: 80, y: 100 })
      setIsDragging(false)
      setIsConnecting(false)
      setActiveItem(null)
      setConnectorProgress(0)
      return
    }
    
    const timeline = [
      // === Select Posts ===
      { delay: 500, action: () => { setCursorPos({ x: 90, y: 220 }); setActiveItem('select-posts') }},
      { delay: 1500, action: () => { setIsDragging(true) }},
      { delay: 3000, action: () => { setCursorPos({ x: 280, y: 60 }); setPhase(1) }}, // Place Select Posts
      { delay: 4000, action: () => { setIsDragging(false); setActiveItem(null) }},
      
      // === New Comment ===
      { delay: 5000, action: () => { setCursorPos({ x: 90, y: 100 }); setActiveItem('new-comment') }},
      { delay: 6000, action: () => { setIsDragging(true) }},
      { delay: 7500, action: () => { setCursorPos({ x: 280, y: 145 }); setPhase(2) }}, // Place New Comment
      { delay: 8500, action: () => { setIsDragging(false); setActiveItem(null) }},
      
      // === Draw connector: Select Posts → New Comment ===
      { delay: 9000, action: () => { setCursorPos({ x: 280, y: 115 }); setIsConnecting(true) }}, // From Select Posts handle
      { delay: 10500, action: () => { setCursorPos({ x: 280, y: 145 }); setConnectorProgress(1) }}, // To New Comment handle
      { delay: 11000, action: () => { setIsConnecting(false) }},
      
      // === Keyword Match ===
      { delay: 12000, action: () => { setCursorPos({ x: 90, y: 180 }); setActiveItem('keyword-match') }},
      { delay: 13000, action: () => { setIsDragging(true) }},
      { delay: 14500, action: () => { setCursorPos({ x: 280, y: 260 }); setPhase(3) }}, // Place Keyword Match
      { delay: 15500, action: () => { setIsDragging(false); setActiveItem(null) }},
      
      // === Draw connector: New Comment → Keyword Match ===
      { delay: 16000, action: () => { setCursorPos({ x: 280, y: 215 }); setIsConnecting(true) }},
      { delay: 17500, action: () => { setCursorPos({ x: 280, y: 260 }); setConnectorProgress(2) }},
      { delay: 18000, action: () => { setIsConnecting(false) }},
      
      // === Reply Comment ===
      { delay: 19000, action: () => { setCursorPos({ x: 90, y: 360 }); setActiveItem('reply-comment') }},
      { delay: 20000, action: () => { setIsDragging(true) }},
      { delay: 21500, action: () => { setCursorPos({ x: 180, y: 400 }); setPhase(4) }}, // Place Reply Comment
      { delay: 22500, action: () => { setIsDragging(false); setActiveItem(null) }},
      
      // === Draw connector: Keyword Match → Reply Comment ===
      { delay: 23000, action: () => { setCursorPos({ x: 240, y: 340 }); setIsConnecting(true) }},
      { delay: 24500, action: () => { setCursorPos({ x: 180, y: 400 }); setConnectorProgress(3) }},
      { delay: 25000, action: () => { setIsConnecting(false) }},
      
      // === Smart AI ===
      { delay: 26000, action: () => { setCursorPos({ x: 90, y: 520 }); setActiveItem('smart-ai') }},
      { delay: 27000, action: () => { setIsDragging(true) }},
      { delay: 28500, action: () => { setCursorPos({ x: 380, y: 400 }); setPhase(5) }}, // Place Smart AI
      { delay: 29500, action: () => { setIsDragging(false); setActiveItem(null) }},
      
      // === Draw connector: Keyword Match → Smart AI ===
      { delay: 30000, action: () => { setCursorPos({ x: 320, y: 340 }); setIsConnecting(true) }},
      { delay: 31500, action: () => { setCursorPos({ x: 380, y: 400 }); setConnectorProgress(4) }},
      { delay: 32000, action: () => { setIsConnecting(false) }},
      
      // === Send DM ===
      { delay: 33000, action: () => { setCursorPos({ x: 90, y: 320 }); setActiveItem('send-dm') }},
      { delay: 34000, action: () => { setIsDragging(true) }},
      { delay: 35500, action: () => { setCursorPos({ x: 360, y: 490 }); setPhase(6) }}, // Place Send DM
      { delay: 36500, action: () => { setIsDragging(false); setActiveItem(null) }},
      
      // === Draw connector: Smart AI → Send DM ===
      { delay: 37000, action: () => { setCursorPos({ x: 380, y: 470 }); setIsConnecting(true) }},
      { delay: 38500, action: () => { setCursorPos({ x: 360, y: 490 }); setConnectorProgress(5) }},
      { delay: 39000, action: () => { setIsConnecting(false) }},
      
      // === Activate automation ===
      { delay: 40000, action: () => { setCursorPos({ x: 620, y: 190 }) }}, // Move to toggle
      { delay: 41500, action: () => { setPhase(7) }}, // Toggle active
      { delay: 43000, action: () => { setCursorPos({ x: 350, y: 300 }) }}, // Rest position
    ]
    
    const timeouts: NodeJS.Timeout[] = []
    timeline.forEach(({ delay, action }) => {
      timeouts.push(setTimeout(action, delay))
    })
    
    return () => timeouts.forEach(clearTimeout)
  }, [isActive])

  const triggers = [
    { id: 'new-comment', icon: MessageCircle, label: 'New Comment', desc: 'Trigger on new comment' },
    { id: 'new-dm', icon: Mail, label: 'New DM', desc: 'Trigger on direct message' },
    { id: 'keyword-match', icon: Reply, label: 'Keyword Match', desc: 'Trigger on specific keyword' },
    { id: 'select-posts', icon: Calendar, label: 'Select Posts', desc: 'Attach specific Instagram posts' },
    { id: 'story-reply', icon: MessageCircle, label: 'Story Reply', desc: 'Trigger when someone replies' },
    { id: 'button-click', icon: MousePointerClick, label: 'Button Click', desc: 'Trigger when user clicks' },
  ]

  const actions = [
    { id: 'send-dm', icon: Send, label: 'Send DM', desc: 'Send a direct message' },
    { id: 'reply-comment', icon: MessageCircle, label: 'Reply Comment', desc: 'Reply to comment' },
    { id: 'send-carousel', icon: Calendar, label: 'Send Carousel', desc: 'Send carousel template', pro: true },
    { id: 'button-template', icon: Tag, label: 'Button Template', desc: 'Send buttons with actions', pro: true },
    { id: 'ice-breakers', icon: MessageCircle, label: 'Ice Breakers', desc: 'Set FAQ quick replies', pro: true },
    { id: 'smart-ai', icon: Bot, label: 'Smart AI', desc: 'AI-powered response', pro: true },
    { id: 'log-to-sheets', icon: FileSpreadsheet, label: 'Log to Sheets', desc: 'Save data to Google Sheets' },
  ]

  return (
    <div className="relative bg-gray-100 dark:bg-[#0a0a0a] w-full h-[600px] flex overflow-hidden rounded-2xl border border-gray-200 dark:border-neutral-800">
          {/* Dotted Grid Background - Light Mode */}
          <div 
            className="absolute inset-0 pointer-events-none dark:hidden"
            style={{
              backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />
          {/* Dotted Grid Background - Dark Mode */}
          <div 
            className="absolute inset-0 pointer-events-none hidden dark:block"
            style={{
              backgroundImage: 'radial-gradient(circle, #222 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />
          
          {/* Animated Mouse Cursor */}
          <div 
            className={cn(
              "absolute z-50 pointer-events-none",
              (isDragging || isConnecting)
                ? "transition-all duration-[1500ms] ease-out" 
                : "transition-all duration-700 ease-in-out"
            )}
            style={{ 
              left: cursorPos.x, 
              top: cursorPos.y,
              transform: 'translate(-2px, -2px)'
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="drop-shadow-xl">
              <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.48 0 .72-.58.38-.92L6.35 2.86a.5.5 0 0 0-.85.35Z" fill="white" stroke="black" strokeWidth="1.5"/>
            </svg>
            {isDragging && (
              <div className="absolute top-7 left-3 w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-lg shadow-blue-500/50" />
            )}
            {isConnecting && (
              <div className="absolute top-7 left-3 w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
            )}
          </div>
          
          {/* Components Sidebar */}
          <div className="relative w-52 bg-gray-50 dark:bg-[#111] border-r border-gray-200 dark:border-neutral-800 p-4 flex-shrink-0 overflow-y-auto">
            <div className="text-gray-900 dark:text-white text-sm font-semibold mb-1">Components</div>
            <div className="text-gray-500 dark:text-neutral-500 text-xs mb-4">Drag to canvas to add</div>
            
            {/* Triggers Section */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-gray-500 dark:text-neutral-400 text-xs font-medium">Triggers</span>
                <ChevronRight className="w-3 h-3 text-gray-400 dark:text-neutral-600 rotate-90" />
              </div>
              <div className="space-y-1">
                {triggers.map((item) => (
                  <div 
                    key={item.id}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg border transition-all duration-300 cursor-pointer",
                      activeItem === item.id 
                        ? "bg-blue-500/20 border-blue-500 scale-[0.98]" 
                        : "border-transparent hover:bg-neutral-800/50"
                    )}
                  >
                    <div className="w-6 h-6 bg-gray-200 dark:bg-neutral-800 rounded flex items-center justify-center">
                      <item.icon className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                    </div>
                    <div>
                      <span className="text-xs text-gray-900 dark:text-white block">{item.label}</span>
                      <span className="text-[10px] text-gray-500 dark:text-neutral-500 block">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Actions Section */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-gray-500 dark:text-neutral-400 text-xs font-medium">Actions</span>
                <ChevronRight className="w-3 h-3 text-gray-400 dark:text-neutral-600 rotate-90" />
              </div>
              <div className="space-y-1">
                {actions.map((item) => (
                  <div 
                    key={item.id}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg border transition-all duration-300 cursor-pointer",
                      activeItem === item.id 
                        ? "bg-emerald-500/20 border-emerald-500 scale-[0.98]" 
                        : "border-transparent hover:bg-neutral-800/50"
                    )}
                  >
                    <div className="w-6 h-6 bg-gray-200 dark:bg-neutral-800 rounded flex items-center justify-center">
                      <item.icon className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-900 dark:text-white">{item.label}</span>
                        {item.pro && <span className="text-[8px] px-1.5 py-0.5 bg-purple-500 text-white rounded-sm">PRO</span>}
                      </div>
                      <span className="text-[10px] text-gray-500 dark:text-neutral-500 block">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Canvas Area */}
          <div className="relative flex-1 p-4">
            {/* SVG Connection Lines - drawn as cursor connects nodes */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
              {/* Select Posts → New Comment */}
              {connectorProgress >= 1 && (
                <path
                  d="M 210 100 L 210 140"
                  fill="none"
                  stroke="#666"
                  strokeWidth="2"
                  strokeDasharray="8 4"
                />
              )}
              {/* New Comment → Keyword Match */}
              {connectorProgress >= 2 && (
                <path
                  d="M 210 200 L 210 250"
                  fill="none"
                  stroke="#666"
                  strokeWidth="2"
                  strokeDasharray="8 4"
                />
              )}
              {/* Keyword Match → Reply Comment (left branch) */}
              {connectorProgress >= 3 && (
                <path
                  d="M 175 350 Q 140 380, 110 400"
                  fill="none"
                  stroke="#666"
                  strokeWidth="2"
                  strokeDasharray="8 4"
                />
              )}
              {/* Keyword Match → Smart AI (right branch) */}
              {connectorProgress >= 4 && (
                <path
                  d="M 245 350 Q 280 380, 310 400"
                  fill="none"
                  stroke="#666"
                  strokeWidth="2"
                  strokeDasharray="8 4"
                />
              )}
              {/* Smart AI → Send DM */}
              {connectorProgress >= 5 && (
                <path
                  d="M 340 465 L 340 490"
                  fill="none"
                  stroke="#666"
                  strokeWidth="2"
                  strokeDasharray="8 4"
                />
              )}
              
              {/* Dynamic connector being drawn by cursor */}
              {isConnecting && (
                <line
                  x1={cursorPos.x - 80}
                  y1={cursorPos.y - 20}
                  x2={cursorPos.x - 80}
                  y2={cursorPos.y}
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                  className="animate-pulse"
                />
              )}
            </svg>
            
            {/* Flow Nodes */}
            {/* Select Posts Node */}
            <div 
              className={cn(
                "absolute transition-all duration-500 z-10",
                phase >= 1 ? "opacity-100" : "opacity-0"
              )}
              style={{ left: '140px', top: '30px' }}
            >
              <div className="bg-blue-500 rounded-lg shadow-lg shadow-blue-500/30 min-w-[140px]">
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="w-5 h-5 bg-white/20 rounded flex items-center justify-center">
                    <Calendar className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-white text-xs font-semibold">Select Posts</span>
                </div>
                <div className="bg-blue-600/50 px-3 py-1.5 rounded-b-lg">
                  <p className="text-blue-100 text-[10px]">Attach specific Instagram posts</p>
                </div>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white shadow-md" />
            </div>
            
            {/* New Comment Node */}
            <div 
              className={cn(
                "absolute transition-all duration-500 z-10",
                phase >= 2 ? "opacity-100" : "opacity-0"
              )}
              style={{ left: '135px', top: '140px' }}
            >
              <div className="bg-blue-500 rounded-lg shadow-lg shadow-blue-500/30 min-w-[150px]">
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="w-5 h-5 bg-white/20 rounded flex items-center justify-center">
                    <MessageCircle className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-white text-xs font-semibold">New Comment</span>
                </div>
                <div className="bg-blue-600/50 px-3 py-1.5 rounded-b-lg">
                  <p className="text-blue-100 text-[10px]">Trigger on new comment</p>
                </div>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 -top-2 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white shadow-md" />
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white shadow-md" />
            </div>
            
            {/* Keyword Match Node */}
            <div 
              className={cn(
                "absolute transition-all duration-500 z-10",
                phase >= 3 ? "opacity-100" : "opacity-0"
              )}
              style={{ left: '120px', top: '250px' }}
            >
              <div className="bg-blue-500/20 border-2 border-blue-500 rounded-lg min-w-[180px]">
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-500 rounded-t-md">
                  <Reply className="w-3.5 h-3.5 text-white" />
                  <span className="text-white text-xs font-semibold">Keyword Match</span>
                </div>
                <div className="px-3 py-2">
                  <p className="text-neutral-400 text-[10px] mb-2">Trigger on specific keyword</p>
                  <div className="bg-neutral-800 rounded px-3 py-1.5">
                    <span className="text-white text-xs">ai</span>
                  </div>
                </div>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 -top-2 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white shadow-md" />
              <div className="absolute left-1/4 -bottom-2 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white shadow-md" />
              <div className="absolute right-1/4 -bottom-2 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white shadow-md" />
            </div>
            
            {/* Reply Comment Node */}
            <div 
              className={cn(
                "absolute transition-all duration-500 z-10",
                phase >= 4 ? "opacity-100" : "opacity-0"
              )}
              style={{ left: '30px', top: '400px' }}
            >
              <div className="bg-emerald-500 rounded-lg shadow-lg shadow-emerald-500/30 min-w-[140px]">
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="w-5 h-5 bg-white/20 rounded flex items-center justify-center">
                    <MessageCircle className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-white text-xs font-semibold">Reply Comment</span>
                </div>
                <div className="bg-emerald-600/50 px-3 py-1.5 rounded-b-lg">
                  <p className="text-emerald-100 text-[10px]">Reply to comment</p>
                  <div className="bg-white/10 rounded mt-1 h-4" />
                </div>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 -top-2 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white shadow-md" />
            </div>
            
            {/* Smart AI Node */}
            <div 
              className={cn(
                "absolute transition-all duration-500 z-10",
                phase >= 5 ? "opacity-100" : "opacity-0"
              )}
              style={{ left: '270px', top: '400px' }}
            >
              <div className="bg-emerald-500 rounded-lg shadow-lg shadow-emerald-500/30 min-w-[130px]">
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="w-5 h-5 bg-white/20 rounded flex items-center justify-center">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-white text-xs font-semibold">Smart AI</span>
                </div>
                <div className="bg-emerald-600/50 px-3 py-1.5 rounded-b-lg">
                  <p className="text-emerald-100 text-[10px]">AI-powered response</p>
                  <div className="bg-white/10 rounded mt-1 h-4" />
                </div>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 -top-2 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white shadow-md" />
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white shadow-md" />
            </div>
            
            {/* Send DM Node */}
            <div 
              className={cn(
                "absolute transition-all duration-500 z-10",
                phase >= 6 ? "opacity-100" : "opacity-0"
              )}
              style={{ left: '270px', top: '500px' }}
            >
              <div className="bg-emerald-500 rounded-lg shadow-lg shadow-emerald-500/30 min-w-[140px]">
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="w-5 h-5 bg-white/20 rounded flex items-center justify-center">
                    <Send className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-white text-xs font-semibold">Send DM</span>
                </div>
                <div className="bg-emerald-600/50 px-3 py-1.5 rounded-b-lg">
                  <p className="text-emerald-100 text-[10px]">Send a direct message</p>
                </div>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 -top-2 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white shadow-md" />
            </div>
            
            {/* Save Flow Button */}
            <div className={cn(
              "absolute bottom-4 left-1/2 -translate-x-1/2 transition-all duration-500 z-20",
              phase >= 6 ? "opacity-100" : "opacity-0"
            )}>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-200 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-lg text-gray-900 dark:text-white text-sm hover:bg-gray-300 dark:hover:bg-neutral-700 transition-colors shadow-lg">
                <Database className="w-4 h-4" />
                Save Flow
              </button>
            </div>
          </div>
          
          {/* Configuration Panel */}
          <div className="relative w-52 bg-gray-50 dark:bg-[#111] border-l border-gray-200 dark:border-neutral-800 p-4 flex-shrink-0">
            <div className="text-gray-900 dark:text-white text-sm font-semibold mb-4">Configuration</div>
            
            {/* Automation Name */}
            <div className="mb-5">
              <label className="text-gray-500 dark:text-neutral-500 text-xs block mb-2">Automation Name</label>
              <div className="bg-gray-200 dark:bg-neutral-800 rounded-lg px-3 py-2">
                <span className="text-gray-900 dark:text-white text-sm">Logical</span>
              </div>
            </div>
            
            {/* Status */}
            <div className="mb-5">
              <label className="text-gray-500 dark:text-neutral-500 text-xs block mb-2">Status</label>
              <div className="flex items-center justify-between bg-gray-100 dark:bg-neutral-800/50 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-2.5 h-2.5 rounded-full transition-all duration-500",
                    phase >= 7 ? "bg-emerald-500" : "bg-gray-400 dark:bg-neutral-600"
                  )} />
                  <span className="text-gray-500 dark:text-neutral-400 text-xs">Active</span>
                </div>
                <div className={cn(
                  "w-10 h-5 rounded-full transition-all duration-500 flex items-center px-0.5 cursor-pointer",
                  phase >= 7 ? "bg-emerald-500" : "bg-neutral-700"
                )}>
                  <div className={cn(
                    "w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-md",
                    phase >= 7 ? "translate-x-5" : "translate-x-0"
                  )} />
                </div>
                <span className={cn(
                  "text-xs font-medium transition-colors",
                  phase >= 7 ? "text-emerald-500 dark:text-emerald-400" : "text-gray-500 dark:text-neutral-500"
                )}>Active</span>
              </div>
            </div>
            
            {/* Activity */}
            <div className="mb-5">
              <label className="text-gray-500 dark:text-neutral-500 text-xs block mb-2">Activity</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-200 dark:bg-neutral-800 rounded-lg p-3 text-center">
                  <p className="text-[10px] text-gray-500 dark:text-neutral-500 mb-1">DMs Sent</p>
                  <p className={cn(
                    "text-xl font-bold transition-all duration-500",
                    phase >= 7 ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-neutral-600"
                  )}>{phase >= 7 ? "3" : "0"}</p>
                </div>
                <div className="bg-gray-200 dark:bg-neutral-800 rounded-lg p-3 text-center">
                  <p className="text-[10px] text-gray-500 dark:text-neutral-500 mb-1">Comments</p>
                  <p className={cn(
                    "text-xl font-bold transition-all duration-500",
                    phase >= 7 ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-neutral-600"
                  )}>{phase >= 7 ? "18" : "0"}</p>
                </div>
              </div>
            </div>
            
            {/* Delete Button */}
            <button className="w-full py-2.5 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors">
              Delete Automation
            </button>
          </div>
        </div>
  )
}


// Integrations Animation Component - Shows before Automations
function IntegrationsAnimation({ isActive }: { isActive: boolean }) {
  const [phase, setPhase] = useState(0)
  const [connectedIntegrations, setConnectedIntegrations] = useState<string[]>([])
  
  useEffect(() => {
    if (!isActive) {
      setPhase(0)
      setConnectedIntegrations([])
      return
    }
    
    const timeline = [
      { delay: 500, action: () => setPhase(1) }, // Show floating icons
      { delay: 2000, action: () => { setPhase(2); setConnectedIntegrations(['google-sheets']) }},
      { delay: 3500, action: () => setConnectedIntegrations(['google-sheets', 'instagram']) },
      { delay: 5000, action: () => setConnectedIntegrations(['google-sheets', 'instagram', 'canva']) },
      { delay: 6500, action: () => setPhase(3) }, // Cursor to Continue button
      { delay: 8000, action: () => setPhase(4) }, // Click Continue
    ]
    
    const timeouts: NodeJS.Timeout[] = []
    timeline.forEach(({ delay, action }) => {
      timeouts.push(setTimeout(action, delay))
    })
    
    return () => timeouts.forEach(clearTimeout)
  }, [isActive])

  const floatingIcons = [
    { id: 'instagram', icon: Instagram, color: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400', x: 30, y: 50 },
    { id: 'messenger', icon: MessageCircle, color: 'bg-gradient-to-br from-blue-500 to-purple-500', x: 100, y: 100 },
    { id: 'facebook', icon: Facebook, color: 'bg-blue-600', x: 150, y: 180 },
    { id: 'twitter', icon: Twitter, color: 'bg-neutral-800', x: 30, y: 210 },
    { id: 'linkedin', icon: Linkedin, color: 'bg-blue-700', x: 30, y: 310 },
    { id: 'mail', icon: Mail, color: 'bg-gradient-to-br from-red-500 to-orange-500', x: 140, y: 280 },
    { id: 'threads', icon: MessageCircle, color: 'bg-neutral-800', x: 170, y: 80 },
    { id: 'youtube', icon: Play, color: 'bg-red-600', x: 100, y: 380 },
  ]

  const integrations = [
    { id: 'google-sheets', icon: FileSpreadsheet, label: 'Google Sheets', desc: 'atharvajoshi2520@gmail.com', color: 'bg-green-500', connected: true },
    { id: 'canva', icon: Palette, label: 'Canva', desc: 'Connect to import designs', color: 'bg-gradient-to-br from-cyan-400 to-purple-500', connected: false },
    { id: 'instagram', icon: Instagram, label: 'Instagram', desc: 'Integrate your Instagram account to reach your audience', color: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400', connected: true },
    { id: 'facebook', icon: Facebook, label: 'Facebook', desc: 'Connect with Facebook to expand your reach', color: 'bg-blue-600', isNew: true },
    { id: 'messenger', icon: MessageCircle, label: 'Messenger', desc: 'Connect with Facebook Messenger to engage with customers', color: 'bg-gradient-to-br from-blue-500 to-purple-500', isNew: true },
    { id: 'threads', icon: MessageCircle, label: 'Threads', desc: 'Expand your reach through Threads Integration', color: 'bg-neutral-700', isNew: true },
  ]

  return (
    <div className="relative bg-gray-100 dark:bg-[#0a0a0a] w-full h-[600px] flex overflow-hidden rounded-2xl border border-gray-200 dark:border-neutral-800">
      {/* Sidebar with floating icons */}
      <div className="relative w-52 bg-gray-50 dark:bg-[#111] border-r border-gray-200 dark:border-neutral-800 p-4 overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'linear-gradient(#222 1px, transparent 1px), linear-gradient(90deg, #222 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        
        {/* Floating social icons */}
        {floatingIcons.map((item, i) => (
          <div
            key={item.id}
            className={cn(
              "absolute w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-700",
              item.color,
              phase >= 1 ? "opacity-100 scale-100" : "opacity-0 scale-50"
            )}
            style={{ 
              left: item.x, 
              top: item.y,
              transitionDelay: `${i * 100}ms`,
              animation: phase >= 1 ? `float-${i % 2 === 0 ? 'slow' : 'medium'} ${3 + i * 0.5}s ease-in-out infinite` : 'none'
            }}
          >
            <item.icon className="w-6 h-6 text-white" />
          </div>
        ))}
        
        {/* Add integrations section */}
        <div className="absolute bottom-4 left-4 right-4 space-y-3">
          <div>
            <p className="text-gray-900 dark:text-white font-semibold text-sm">Add integrations</p>
            <p className="text-gray-500 dark:text-neutral-500 text-xs">Connect your favorite tools to supercharge your workflow.</p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-gray-500 dark:text-neutral-400 text-xs hover:text-gray-900 dark:hover:text-white transition-colors">
              I'll do this later
            </button>
            <button className={cn(
              "px-4 py-1.5 bg-blue-600 rounded-lg text-white text-xs font-medium transition-all",
              phase >= 4 ? "ring-2 ring-blue-400 ring-offset-2 ring-offset-[#111]" : ""
            )}>
              Continue →
            </button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <span className="text-gray-500 dark:text-neutral-500">Dashboard</span>
          <span className="text-gray-400 dark:text-neutral-600">/</span>
          <span className="text-gray-900 dark:text-white font-medium">Integrations</span>
        </div>
        
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6">
          <button className="px-4 py-2 bg-gray-200 dark:bg-neutral-800 rounded-lg text-gray-900 dark:text-white text-xs font-medium">View all</button>
          <button className="px-4 py-2 text-gray-500 dark:text-neutral-500 text-xs hover:text-gray-900 dark:hover:text-white transition-colors">Social Media</button>
          <button className="px-4 py-2 text-gray-500 dark:text-neutral-500 text-xs hover:text-gray-900 dark:hover:text-white transition-colors">Messaging</button>
          <button className="px-4 py-2 text-gray-500 dark:text-neutral-500 text-xs hover:text-gray-900 dark:hover:text-white transition-colors">Marketing</button>
          <button className="px-4 py-2 text-gray-500 dark:text-neutral-500 text-xs hover:text-gray-900 dark:hover:text-white transition-colors">Coming Soon</button>
          <div className="flex-1" />
          <button className="flex items-center gap-1 text-neutral-500 text-xs hover:text-white transition-colors">
            <Clock className="w-3 h-3" />
            Recent
          </button>
        </div>
        
        {/* Integration cards */}
        <div className="space-y-2">
          {integrations.map((item, i) => (
            <div 
              key={item.id}
              className={cn(
                "flex items-center gap-4 p-4 bg-gray-50 dark:bg-neutral-900/50 rounded-xl border transition-all duration-500",
                connectedIntegrations.includes(item.id) ? "border-gray-300 dark:border-neutral-700" : "border-transparent"
              )}
              style={{ 
                opacity: phase >= 1 ? 1 : 0,
                transform: phase >= 1 ? 'translateX(0)' : 'translateX(20px)',
                transitionDelay: `${i * 80}ms`
              }}
            >
              {/* Icon */}
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", item.color)}>
                <item.icon className="w-5 h-5 text-white" />
              </div>
              
              {/* Label */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-gray-900 dark:text-white font-medium text-sm">{item.label}</span>
                  {item.connected && !item.isNew && (
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  )}
                  {item.isNew && (
                    <span className="px-1.5 py-0.5 bg-orange-500/20 text-orange-400 text-[10px] rounded font-medium">NEW</span>
                  )}
                </div>
                <p className="text-gray-500 dark:text-neutral-500 text-xs">{item.desc}</p>
              </div>
              
              {/* Toggle or chevron */}
              {item.connected || connectedIntegrations.includes(item.id) ? (
                <div className={cn(
                  "w-10 h-5 rounded-full flex items-center px-0.5 transition-all duration-500",
                  connectedIntegrations.includes(item.id) ? "bg-blue-500" : "bg-neutral-700"
                )}>
                  <div className={cn(
                    "w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-md",
                    connectedIntegrations.includes(item.id) ? "translate-x-5" : "translate-x-0"
                  )} />
                </div>
              ) : (
                <ChevronRight className="w-4 h-4 text-neutral-600" />
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* CSS for floating animation */}
      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </div>
  )
}


function InboxAnimation({ isActive }: { isActive: boolean }) {
  const [messages, setMessages] = useState<number[]>([])
  const [typing, setTyping] = useState(false)

  useEffect(() => {
    if (!isActive) {
      setMessages([])
      setTyping(false)
      return
    }

    const showMessages = async () => {
      for (let i = 0; i < 4; i++) {
        await new Promise(r => setTimeout(r, 600))
        setMessages(prev => [...prev, i])
      }
      setTyping(true)
      await new Promise(r => setTimeout(r, 1500))
      setTyping(false)
    }

    showMessages()
  }, [isActive])

  const chats = [
    { name: 'Sarah Johnson', msg: 'Hey! Love your content 💕 Can I get the link?', time: '2m', avatar: 'S', unread: true },
    { name: 'Mike Roberts', msg: 'Just saw your story, amazing work!', time: '15m', avatar: 'M', unread: true },
    { name: 'Lisa Chen', msg: 'Thanks for the quick reply! 🙏', time: '1h', avatar: 'L', unread: false },
    { name: 'Alex Kim', msg: 'Interested in the collab opportunity', time: '2h', avatar: 'A', unread: false },
  ]

  return (
    <div className="relative w-full h-full min-h-[400px] bg-neutral-950 rounded-xl overflow-hidden p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Inbox</h3>
        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-xs">4 new</span>
      </div>
      
      <div className="space-y-2">
        {chats.map((chat, i) => (
          <div 
            key={i}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl transition-all duration-500",
              messages.includes(i) ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4",
              chat.unread ? "bg-neutral-800/80" : "bg-neutral-900/50"
            )}
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm",
              i % 2 === 0 
                ? "bg-gradient-to-br from-purple-500 to-pink-500" 
                : "bg-gradient-to-br from-blue-500 to-cyan-500"
            )}>
              {chat.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-white text-sm font-medium">{chat.name}</p>
                <p className="text-neutral-600 text-xs">{chat.time}</p>
              </div>
              <p className="text-neutral-500 text-sm truncate">{chat.msg}</p>
            </div>
            {chat.unread && (
              <div className="w-2 h-2 bg-purple-500 rounded-full shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Typing Indicator */}
      <div className={cn(
        "absolute bottom-4 left-4 right-4 bg-neutral-800 rounded-xl p-3 flex items-center gap-3 transition-all duration-300",
        typing ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-neutral-400 text-sm">AI is composing a reply...</span>
      </div>
    </div>
  )
}

// Analytics Animation Component
function AnalyticsAnimation({ isActive }: { isActive: boolean }) {
  const [counters, setCounters] = useState({ reach: 0, engagement: 0, followers: 0 })
  const [chartHeights, setChartHeights] = useState<number[]>(Array(12).fill(0))

  useEffect(() => {
    if (!isActive) {
      setCounters({ reach: 0, engagement: 0, followers: 0 })
      setChartHeights(Array(12).fill(0))
      return
    }

    // Animate counters
    const targetCounters = { reach: 124500, engagement: 8200, followers: 2100 }
    const duration = 2000
    const steps = 60
    const increment = duration / steps

    let currentStep = 0
    const counterInterval = setInterval(() => {
      currentStep++
      const progress = currentStep / steps
      setCounters({
        reach: Math.floor(targetCounters.reach * progress),
        engagement: Math.floor(targetCounters.engagement * progress),
        followers: Math.floor(targetCounters.followers * progress),
      })
      if (currentStep >= steps) clearInterval(counterInterval)
    }, increment)

    // Animate chart
    const targetHeights = [30, 45, 35, 60, 50, 75, 55, 80, 70, 95, 85, 90]
    targetHeights.forEach((height, i) => {
      setTimeout(() => {
        setChartHeights(prev => {
          const newHeights = [...prev]
          newHeights[i] = height
          return newHeights
        })
      }, i * 100)
    })

    return () => clearInterval(counterInterval)
  }, [isActive])

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  return (
    <div className="relative w-full h-full min-h-[400px] bg-neutral-950 rounded-xl overflow-hidden p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Reach', value: counters.reach, prefix: '' },
          { label: 'Engagement', value: counters.engagement, prefix: '' },
          { label: 'New Followers', value: counters.followers, prefix: '+' },
        ].map((stat, i) => (
          <div key={i} className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 text-center">
            <p className="text-neutral-500 text-xs mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-white">
              {stat.prefix}{formatNumber(stat.value)}
            </p>
            <p className="text-emerald-500 text-xs mt-1">↑ 12%</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-neutral-400 text-sm">Engagement over time</p>
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-neutral-800 text-neutral-400 rounded text-xs">7 days</span>
            <span className="px-2 py-1 bg-white/10 text-white rounded text-xs">30 days</span>
          </div>
        </div>
        <div className="flex items-end gap-2 h-40">
          {chartHeights.map((height, i) => (
            <div 
              key={i}
              className="flex-1 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t transition-all duration-500 ease-out"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Scheduler Animation Component
function SchedulerAnimation({ isActive }: { isActive: boolean }) {
  const [phase, setPhase] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [scheduledDays, setScheduledDays] = useState<number[]>([])
  
  useEffect(() => {
    if (!isActive) {
      setPhase(0)
      setShowModal(false)
      setScheduledDays([])
      return
    }
    
    const timeline = [
      { delay: 500, action: () => setPhase(1) }, // Show sidebar content
      { delay: 1500, action: () => setScheduledDays([17]) }, // Show scheduled post
      { delay: 3000, action: () => setShowModal(true) }, // Show iPhone modal
      { delay: 4500, action: () => setPhase(2) }, // Fill form
      { delay: 6000, action: () => setPhase(3) }, // Click schedule
      { delay: 7500, action: () => { setShowModal(false); setScheduledDays([16, 17]) }}, // Close modal, add new scheduled day
    ]
    
    const timeouts: NodeJS.Timeout[] = []
    timeline.forEach(({ delay, action }) => {
      timeouts.push(setTimeout(action, delay))
    })
    
    return () => timeouts.forEach(clearTimeout)
  }, [isActive])

  const calendarDays = [
    { day: 30, isOtherMonth: true }, { day: 1 }, { day: 2 }, { day: 3 }, { day: 4 }, { day: 5 }, { day: 6 },
    { day: 7 }, { day: 8 }, { day: 9 }, { day: 10 }, { day: 11 }, { day: 12 }, { day: 13 },
    { day: 14 }, { day: 15 }, { day: 16 }, { day: 17 }, { day: 18 }, { day: 19 }, { day: 20 },
    { day: 21 }, { day: 22 }, { day: 23 }, { day: 24, isToday: true }, { day: 25 }, { day: 26 }, { day: 27 },
    { day: 28 }, { day: 29 }, { day: 30 }, { day: 31 }, { day: 1, isOtherMonth: true }, { day: 2, isOtherMonth: true }, { day: 3, isOtherMonth: true },
  ]

  return (
    <div className="relative bg-gray-100 dark:bg-[#0a0a0a] w-full h-[600px] flex overflow-hidden rounded-2xl border border-gray-200 dark:border-neutral-800">
      {/* Content Library Sidebar */}
      <div className="w-56 bg-gray-50 dark:bg-[#111] border-r border-gray-200 dark:border-neutral-800 p-4 flex flex-col">
        <h3 className="text-gray-900 dark:text-white font-semibold mb-4">Content Library</h3>
        
        {/* Design Tools */}
        <div className={cn(
          "mb-4 transition-all duration-500",
          phase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        )}>
          <p className="text-gray-500 dark:text-neutral-500 text-xs mb-2">Design Tools</p>
          <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-800 transition-colors">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-gray-900 dark:text-white text-sm font-medium">Connect Canva</p>
              <p className="text-gray-500 dark:text-neutral-500 text-xs">Import your designs</p>
            </div>
          </button>
        </div>
        
        {/* Automations */}
        <div className={cn(
          "mb-4 transition-all duration-500",
          phase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        )} style={{ transitionDelay: '100ms' }}>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-3.5 h-3.5 text-yellow-500" />
            <p className="text-gray-500 dark:text-neutral-500 text-xs">Automations</p>
            <span className="ml-auto w-4 h-4 bg-blue-500 rounded-full text-[10px] text-white flex items-center justify-center">1</span>
          </div>
          <p className="text-gray-400 dark:text-neutral-600 text-[10px] mb-2">Drag to calendar to schedule</p>
          <div className="flex items-center gap-2 p-2 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <div className="w-6 h-6 bg-purple-500 rounded flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="text-gray-900 dark:text-white text-sm">Logical</span>
            <div className="ml-auto w-2 h-2 bg-green-500 rounded-full" />
          </div>
        </div>
        
        {/* Drafts */}
        <div className={cn(
          "mb-4 transition-all duration-500",
          phase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        )} style={{ transitionDelay: '200ms' }}>
          <div className="flex items-center gap-2 mb-2">
            <FileSpreadsheet className="w-3.5 h-3.5 text-gray-500 dark:text-neutral-500" />
            <p className="text-gray-500 dark:text-neutral-500 text-xs">Drafts</p>
          </div>
          <p className="text-gray-400 dark:text-neutral-600 text-xs text-center py-4">No drafts yet</p>
        </div>
        
        {/* Create Post Button */}
        <button className={cn(
          "mt-auto flex items-center justify-center gap-2 w-full py-3 bg-blue-600 rounded-xl text-white text-sm font-medium transition-all hover:bg-blue-500",
          phase >= 1 ? "opacity-100" : "opacity-0"
        )}>
          <span className="text-lg">+</span> Create Post
        </button>
      </div>
      
      {/* Calendar Area */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-gray-900 dark:text-white text-xl font-semibold">December 2025</h2>
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-200 dark:bg-neutral-800 rounded-lg overflow-hidden">
              <button className="px-3 py-1.5 bg-gray-300 dark:bg-neutral-700 text-gray-900 dark:text-white text-xs">Month</button>
              <button className="px-3 py-1.5 text-gray-500 dark:text-neutral-500 text-xs hover:text-gray-900 dark:hover:text-white transition-colors">Week</button>
              <button className="px-3 py-1.5 text-gray-500 dark:text-neutral-500 text-xs hover:text-gray-900 dark:hover:text-white transition-colors">Day</button>
            </div>
            <div className="flex items-center gap-1 ml-2">
              <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded"><ChevronRight className="w-4 h-4 text-gray-500 dark:text-neutral-500 rotate-180" /></button>
              <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded"><ChevronRight className="w-4 h-4 text-gray-500 dark:text-neutral-500" /></button>
            </div>
            <button className="px-3 py-1.5 bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-neutral-700 rounded-lg text-gray-900 dark:text-white text-xs transition-colors">Today</button>
          </div>
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-neutral-800 rounded-xl overflow-hidden">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="bg-gray-50 dark:bg-neutral-900 py-3 text-center text-gray-500 dark:text-neutral-500 text-xs font-medium">{d}</div>
          ))}
          {/* Calendar days */}
          {calendarDays.map((day, i) => (
            <div 
              key={i} 
              className={cn(
                "bg-white dark:bg-neutral-900 min-h-[70px] p-2 relative transition-all duration-300",
                day.isToday && "bg-blue-50 dark:bg-blue-500/10",
                day.isOtherMonth && "opacity-40"
              )}
            >
              <span className={cn(
                "text-xs",
                day.isToday ? "w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white" : "text-gray-600 dark:text-neutral-400"
              )}>{day.day}</span>
              
              {/* Scheduled post indicator */}
              {scheduledDays.includes(day.day) && !day.isOtherMonth && (
                <div className="absolute top-8 left-1 right-1 bg-blue-500/20 border border-blue-500/40 rounded-md p-1 transition-all duration-500">
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="px-1 py-0.5 bg-blue-500 rounded text-[8px] text-white">Post</span>
                  </div>
                  <p className="text-[9px] text-gray-500 dark:text-neutral-400">Automation:</p>
                  <p className="text-[9px] text-gray-900 dark:text-white">Logical</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-2.5 h-2.5 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-full" />
                    <span className="text-[8px] text-gray-500 dark:text-neutral-500">9:00 AM</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* iPhone Modal Overlay */}
      {showModal && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
          {/* iPhone Frame */}
          <div className="relative w-[280px] h-[520px] bg-[#1a1a1a] rounded-[40px] border-4 border-neutral-700 shadow-2xl overflow-hidden">
            {/* Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-full" />
            
            {/* Status bar */}
            <div className="flex items-center justify-between px-6 pt-3 pb-2">
              <span className="text-white text-xs font-medium">2:20 PM</span>
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 bg-white rounded-full" />
                <div className="w-1 h-1 bg-white rounded-full" />
                <div className="flex items-center gap-0.5 ml-1">
                  <div className="w-4 h-2 border border-white rounded-sm">
                    <div className="w-2.5 h-1 bg-white m-0.5 rounded-[1px]" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Content Type Tabs */}
            <div className="flex justify-center gap-1 px-4 mb-3">
              <button className="flex items-center gap-1 px-4 py-1.5 bg-blue-500 rounded-lg text-white text-[10px]">
                <Calendar className="w-3 h-3" /> Post
              </button>
              <button className="flex items-center gap-1 px-4 py-1.5 bg-neutral-800 rounded-lg text-neutral-400 text-[10px]">
                <Play className="w-3 h-3" /> Reel
              </button>
              <button className="flex items-center gap-1 px-4 py-1.5 bg-neutral-800 rounded-lg text-neutral-400 text-[10px]">
                <MessageCircle className="w-3 h-3" /> Story
              </button>
            </div>
            
            {/* Account */}
            <div className="flex items-center gap-2 px-4 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
                <span className="text-white text-xs">Y</span>
              </div>
              <div>
                <p className="text-white text-xs font-medium">your_account</p>
                <p className="text-neutral-500 text-[10px]">Add location...</p>
              </div>
            </div>
            
            {/* Media Area */}
            <div className="mx-4 h-32 bg-neutral-900 rounded-xl flex flex-col items-center justify-center mb-3">
              <div className="w-10 h-10 border-2 border-dashed border-neutral-600 rounded-xl flex items-center justify-center mb-2">
                <Palette className="w-5 h-5 text-neutral-600" />
              </div>
              <p className="text-neutral-500 text-xs">Add Media</p>
            </div>
            
            {/* Add button */}
            <div className="px-4 mb-3">
              <button className="w-8 h-8 bg-neutral-800 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">+</span>
              </button>
            </div>
            
            {/* Caption area */}
            <div className="mx-4 bg-neutral-900 rounded-xl p-3 mb-3">
              <p className="text-blue-400 text-xs">#tag</p>
              <p className="text-blue-400 text-xs mt-1">@user</p>
            </div>
            
            {/* Home indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full" />
          </div>
          
          {/* Schedule Form */}
          <div className={cn(
            "w-[220px] bg-neutral-900 rounded-2xl p-4 ml-4 transition-all duration-500",
            phase >= 2 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
          )}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-medium">Schedule Post</h4>
              <button className="text-neutral-500 hover:text-white">×</button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-neutral-500 text-[10px] flex items-center gap-1 mb-1">
                  <Calendar className="w-3 h-3" /> Date
                </label>
                <div className="bg-neutral-800 rounded-lg px-3 py-2">
                  <span className="text-white text-xs">16/12/2025</span>
                </div>
              </div>
              
              <div>
                <label className="text-neutral-500 text-[10px] flex items-center gap-1 mb-1">
                  <Clock className="w-3 h-3" /> Time
                </label>
                <div className="bg-neutral-800 rounded-lg px-3 py-2">
                  <span className="text-white text-xs">09:00 AM</span>
                </div>
              </div>
              
              <div>
                <label className="text-neutral-500 text-[10px] flex items-center gap-1 mb-1">
                  <Zap className="w-3 h-3" /> Automation
                </label>
                <div className="bg-neutral-800 rounded-lg px-3 py-2 flex items-center justify-between">
                  <span className="text-white text-xs">Logical</span>
                  <ChevronRight className="w-3 h-3 text-neutral-500 rotate-90" />
                </div>
              </div>
              
              <label className="flex items-center gap-2 text-neutral-400 text-xs">
                <input type="checkbox" className="rounded border-neutral-600" />
                <Users className="w-3 h-3" /> Paid Partnership
              </label>
              
              <button className={cn(
                "w-full py-2.5 rounded-lg text-white text-sm font-medium transition-all flex items-center justify-center gap-2",
                phase >= 3 ? "bg-green-500" : "bg-blue-500"
              )}>
                <Calendar className="w-4 h-4" />
                {phase >= 3 ? "Scheduled!" : "Schedule"}
              </button>
              
              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-neutral-800 rounded-lg text-neutral-400 text-xs flex items-center justify-center gap-1">
                  <Send className="w-3 h-3" /> Post Now
                </button>
                <button className="flex-1 py-2 bg-neutral-800 rounded-lg text-neutral-400 text-xs flex items-center justify-center gap-1">
                  <FileSpreadsheet className="w-3 h-3" /> Draft
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Data Hub Animation Component - Shows data export and lead management
function DataHubAnimation({ isActive }: { isActive: boolean }) {
  const [rows, setRows] = useState<number[]>([])
  const [syncing, setSyncing] = useState(false)
  const [exported, setExported] = useState(false)
  
  useEffect(() => {
    if (!isActive) {
      setRows([])
      setSyncing(false)
      setExported(false)
      return
    }
    
    const timeline = async () => {
      // Add rows one by one
      for (let i = 0; i < 6; i++) {
        await new Promise(r => setTimeout(r, 400))
        setRows(prev => [...prev, i])
      }
      // Show syncing
      await new Promise(r => setTimeout(r, 800))
      setSyncing(true)
      await new Promise(r => setTimeout(r, 2000))
      setSyncing(false)
      setExported(true)
    }
    
    timeline()
  }, [isActive])

  const leads = [
    { name: 'Sarah Johnson', handle: '@sarahj', email: 'sarah@email.com', source: 'DM', date: 'Today' },
    { name: 'Mike Roberts', handle: '@mikeroberts', email: 'mike@email.com', source: 'Comment', date: 'Today' },
    { name: 'Lisa Chen', handle: '@lisachen', email: 'lisa@email.com', source: 'Story Reply', date: 'Yesterday' },
    { name: 'Alex Kim', handle: '@alexkim', email: 'alex@email.com', source: 'DM', date: 'Yesterday' },
    { name: 'Emma Wilson', handle: '@emmaw', email: 'emma@email.com', source: 'Comment', date: '2 days ago' },
    { name: 'James Brown', handle: '@jamesb', email: 'james@email.com', source: 'DM', date: '3 days ago' },
  ]

  return (
    <div className="relative w-full h-full min-h-[500px] bg-gray-100 dark:bg-neutral-950 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-neutral-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold text-lg">Data Hub</h3>
            <p className="text-gray-500 dark:text-neutral-500 text-sm">Connected to Google Sheets</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            syncing 
              ? "bg-blue-500/20 text-blue-500 dark:text-blue-400" 
              : exported 
                ? "bg-green-500/20 text-green-500 dark:text-green-400"
                : "bg-gray-200 dark:bg-neutral-800 text-gray-900 dark:text-white"
          )}>
            {syncing ? (
              <>
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                Syncing...
              </>
            ) : exported ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Exported
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4" />
                Export to Sheets
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-6 p-6 border-b border-gray-200 dark:border-neutral-800">
        <div className="text-center">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{rows.length}</p>
          <p className="text-gray-500 dark:text-neutral-500 text-sm">New Leads</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-purple-500 dark:text-purple-400">24</p>
          <p className="text-gray-500 dark:text-neutral-500 text-sm">Total This Week</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-blue-500 dark:text-blue-400">89%</p>
          <p className="text-gray-500 dark:text-neutral-500 text-sm">Response Rate</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-green-500 dark:text-green-400">156</p>
          <p className="text-gray-500 dark:text-neutral-500 text-sm">All Time</p>
        </div>
      </div>
      
      {/* Table Header */}
      <div className="grid grid-cols-5 gap-4 px-6 py-4 bg-gray-50 dark:bg-neutral-900/50 text-sm text-gray-500 dark:text-neutral-500 font-medium">
        <span>Name</span>
        <span>Handle</span>
        <span>Email</span>
        <span>Source</span>
        <span>Date</span>
      </div>
      
      {/* Table Rows */}
      <div className="divide-y divide-gray-200 dark:divide-neutral-800/50">
        {leads.map((lead, i) => (
          <div 
            key={i}
            className={cn(
              "grid grid-cols-5 gap-4 px-6 py-4 transition-all duration-500",
              rows.includes(i) ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
            )}
            style={{ transitionDelay: `${i * 80}ms` }}
          >
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-medium",
                i % 2 === 0 
                  ? "bg-gradient-to-br from-purple-500 to-pink-500" 
                  : "bg-gradient-to-br from-blue-500 to-cyan-500"
              )}>
                {lead.name.charAt(0)}
              </div>
              <span className="text-gray-900 dark:text-white text-base">{lead.name}</span>
            </div>
            <span className="text-gray-500 dark:text-neutral-400 text-base">{lead.handle}</span>
            <span className="text-gray-500 dark:text-neutral-400 text-base">{lead.email}</span>
            <span className={cn(
              "text-xs px-2 py-1 rounded w-fit",
              lead.source === 'DM' ? "bg-blue-500/20 text-blue-500 dark:text-blue-400" :
              lead.source === 'Comment' ? "bg-purple-500/20 text-purple-500 dark:text-purple-400" :
              "bg-orange-500/20 text-orange-500 dark:text-orange-400"
            )}>{lead.source}</span>
            <span className="text-gray-500 dark:text-neutral-500 text-base">{lead.date}</span>
          </div>
        ))}
      </div>
      
      {/* Sync indicator */}
      {syncing && (
        <div className="absolute inset-0 bg-white/80 dark:bg-neutral-950/80 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-900 dark:text-white font-medium">Syncing to Google Sheets...</p>
            <p className="text-gray-500 dark:text-neutral-500 text-sm">Exporting {rows.length} new leads</p>
          </div>
        </div>
      )}
    </div>
  )
}


export default function LandingPage() {
  const [activeFeature, setActiveFeature] = useState(0)
  const [isInView, setIsInView] = useState(false)
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([])
  const featuresContainerRef = useRef<HTMLDivElement>(null)

  const features = [
    {
      id: 'integrations',
      label: 'Integrations',
      title: 'Connect Your Platforms',
      description: 'Link your Instagram, Facebook, and other social accounts. Add Google Sheets, Canva, and more to supercharge your workflow.',
      icon: Users,
      component: IntegrationsAnimation,
    },
    {
      id: 'automations',
      label: 'Automations',
      title: 'Visual Flow Builder',
      description: 'Create powerful automation workflows with our drag-and-drop builder. Triggers, conditions, and actions—no code required.',
      icon: Zap,
      component: FlowBuilderAnimation,
    },
    {
      id: 'scheduler',
      label: 'Scheduler',
      title: 'Smart Scheduling',
      description: 'Plan and schedule content with Canva integration and AI-generated captions.',
      icon: Calendar,
      component: SchedulerAnimation,
    },
    {
      id: 'datahub',
      label: 'Data Hub',
      title: 'Centralized Data Management',
      description: 'Export leads to Google Sheets, track conversations, and manage all your audience data in one place.',
      icon: Database,
      component: DataHubAnimation,
    },
  ]

  const capabilities = [
    { icon: Bot, title: 'AI Responses', description: 'Smart replies that match your voice' },
    { icon: Zap, title: 'Flow Builder', description: '20+ automation nodes' },
    { icon: BarChart3, title: 'Analytics', description: 'Real-time engagement tracking' },
    { icon: Calendar, title: 'Scheduler', description: 'Canva integration built-in' },
    { icon: Sparkles, title: 'AI Captions', description: 'Generate converting copy' },
    { icon: Database, title: 'Data Hub', description: 'Export leads to Sheets' },
    { icon: MessageCircle, title: 'Unified Inbox', description: 'All messages, one place' },
    { icon: Users, title: 'Collabs', description: 'Manage influencer partnerships' },
  ]

  const platforms = [
    { name: 'Instagram', icon: Instagram, active: true },
    { name: 'Facebook', icon: Facebook, coming: true },
    { name: 'WhatsApp', icon: Send, coming: true },
    { name: 'X', icon: Twitter, coming: true },
    { name: 'LinkedIn', icon: Linkedin, coming: true },
  ]

  const integrations = [
    { name: 'Google Sheets', icon: FileSpreadsheet },
    { name: 'Canva', icon: Palette },
    { name: 'OpenAI', icon: Bot },
  ]

  // Scroll-based feature detection
  useEffect(() => {
    const handleScroll = () => {
      if (!featuresContainerRef.current) return
      
      const container = featuresContainerRef.current
      const rect = container.getBoundingClientRect()
      const containerHeight = container.offsetHeight
      const viewportHeight = window.innerHeight
      
      // Check if section is in view
      if (rect.top < viewportHeight * 0.5 && rect.bottom > viewportHeight * 0.5) {
        setIsInView(true)
        
        // Calculate which feature should be active based on scroll position
        const scrollProgress = Math.max(0, Math.min(1, 
          (viewportHeight * 0.5 - rect.top) / (containerHeight - viewportHeight * 0.5)
        ))
        const featureIndex = Math.min(
          features.length - 1,
          Math.floor(scrollProgress * features.length)
        )
        setActiveFeature(featureIndex)
      } else {
        setIsInView(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [features.length])

  return (
    <main className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
      <LandingNav />
      
      {/* Hero Section - Text */}
      <section className="relative min-h-[120vh] w-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-32 overflow-hidden">
        {/* Full viewport stepped gradient background - light mode */}
        <div 
          className="absolute inset-0 dark:hidden" 
          style={{ 
            background: 'linear-gradient(135deg, #ffffff 0%, #ffffff 30%, #f3f4f6 30.1%, #f3f4f6 60%, #e5e7eb 60.1%, #e5e7eb 85%, #d1d5db 85.1%, #d1d5db 100%)'
          }} 
        />
        {/* Full viewport stepped gradient background - dark mode */}
        <div 
          className="absolute inset-0 hidden dark:block" 
          style={{ 
            background: 'linear-gradient(135deg, #0a0a0a 0%, #0a0a0a 30%, #111111 30.1%, #111111 60%, #1a1a1a 60.1%, #1a1a1a 85%, #222222 85.1%, #222222 100%)'
          }} 
        />
        
        {/* 100vh/100vw blurry effect overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[100vw] h-[100vh] bg-purple-500/[0.03] dark:bg-purple-500/[0.02] blur-[120px] rounded-full scale-150" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 leading-[1.1]">
            Automate your
            <br />
            <span className="text-gray-400 dark:text-neutral-400">social growth</span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-gray-500 dark:text-neutral-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            The all-in-one platform for DMs, comments, scheduling, and lead generation.
            Built for creators and businesses who want to grow on autopilot.
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="group flex items-center gap-2 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black text-base font-semibold rounded-full hover:bg-gray-800 dark:hover:bg-neutral-200 transition-all"
            >
              Start for free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            
            <Link
              href="#features"
              className="flex items-center gap-2 px-8 py-4 text-base font-medium text-gray-600 dark:text-neutral-400 border border-gray-300 dark:border-neutral-800 rounded-full hover:border-gray-400 dark:hover:border-neutral-600 hover:text-gray-900 dark:hover:text-white transition-all"
            >
              <Play className="w-4 h-4" />
              See how it works
            </Link>
          </div>
        </div>
        
        {/* Bottom fade gradient for smooth transition */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none dark:hidden"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, #e9ebf0 50%, #e5e7ec 100%)'
          }}
        />
        <div 
          className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none hidden dark:block"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 50%, #000 100%)'
          }}
        />
      </section>

      {/* Hero Visual - Dashboard Preview */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gray-100 dark:bg-black">
        <div className="w-full max-w-7xl mx-auto">
          <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-2xl" style={{ aspectRatio: '16/9' }}>
            {/* Dashboard Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-neutral-800">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-neutral-500">Auctorn</span>
                <ChevronRight className="w-3 h-3 text-neutral-600" />
                <span className="text-gray-900 dark:text-white font-medium">Dashboard</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 dark:bg-neutral-800 rounded-lg">
                  <div className="w-5 h-5 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-full" />
                  <span className="text-gray-900 dark:text-white text-xs">All</span>
                  <div className="w-5 h-5 bg-gradient-to-br from-red-500 to-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-[8px] text-gray-900 dark:text-white">2</span>
                  </div>
                </div>
                <div className="relative">
                  <div className="w-8 h-8 bg-neutral-700 rounded-full" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full text-[8px] text-gray-900 dark:text-white flex items-center justify-center">10</div>
                </div>
              </div>
            </div>
            
            <div className="flex">
              {/* Sidebar */}
              <div className="w-14 bg-gray-50 dark:bg-[#0f0f0f] border-r border-gray-200 dark:border-neutral-800 py-4 flex flex-col items-center gap-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-white text-xs font-bold">A</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 dark:text-neutral-600 rotate-180" />
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                </div>
                <MessageCircle className="w-5 h-5 text-gray-400 dark:text-neutral-600" />
                <Zap className="w-5 h-5 text-gray-400 dark:text-neutral-600" />
                <Calendar className="w-5 h-5 text-gray-400 dark:text-neutral-600" />
                <FileSpreadsheet className="w-5 h-5 text-gray-400 dark:text-neutral-600" />
                <Users className="w-5 h-5 text-gray-400 dark:text-neutral-600" />
                <ShoppingBag className="w-5 h-5 text-gray-400 dark:text-neutral-600" />
              </div>
              
              {/* Main Content */}
              <div className="flex-1 p-6">
                {/* Stats Cards Row */}
                <div className="grid grid-cols-6 gap-3 mb-6">
                  {[
                    { icon: Users, color: 'bg-blue-500', label: 'Followers', value: '12', sub: 'Total' },
                    { icon: Users, color: 'bg-pink-500', label: 'Reach', value: '21', sub: 'Last 28 days' },
                    { icon: BarChart3, color: 'bg-orange-500', label: 'Interactions', value: '21', sub: 'Last 28 days' },
                    { icon: Sparkles, color: 'bg-emerald-500', label: 'Profile Views', value: '—', sub: 'Last 28 days' },
                    { icon: ArrowRight, color: 'bg-purple-500', label: 'Website Clicks', value: '—', sub: 'Last 28 days' },
                    { icon: Zap, color: 'bg-yellow-500', label: 'Accounts Engaged', value: '—', sub: 'Last 28 days' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-gray-100 dark:bg-neutral-900/50 border border-gray-200 dark:border-neutral-800 rounded-xl p-4">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", stat.color)}>
                        <stat.icon className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-gray-900 dark:text-white text-2xl font-bold">{stat.value}</p>
                      <p className="text-gray-700 dark:text-white text-sm">{stat.label}</p>
                      <p className="text-gray-500 dark:text-neutral-500 text-xs">{stat.sub}</p>
                    </div>
                  ))}
                </div>
                
                {/* Activity & Performance Row */}
                <div className="grid grid-cols-2 gap-4 flex-1">
                  {/* Activity Overview */}
                  <div className="bg-gray-100 dark:bg-neutral-900/50 border border-gray-200 dark:border-neutral-800 rounded-xl p-4 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-gray-900 dark:text-white font-medium">Activity Overview</h3>
                        <p className="text-gray-500 dark:text-neutral-500 text-xs">Cross-platform analytics</p>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-neutral-500">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" /> All Platforms
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <span className="flex items-center gap-1 text-xs text-gray-700 dark:text-white">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" /> Messages (3)
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-700 dark:text-white">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" /> Responses (18)
                      </span>
                    </div>
                    {/* Area Chart */}
                    <div className="flex-1 min-h-[160px] bg-gray-200 dark:bg-neutral-900 rounded-lg relative overflow-hidden">
                      <div className="absolute inset-x-4 bottom-4 h-px bg-gray-300 dark:bg-neutral-700" />
                      <div className="absolute left-4 bottom-4 text-[10px] text-gray-500 dark:text-neutral-600">22 Dec</div>
                      <div className="absolute right-4 bottom-4 text-[10px] text-gray-500 dark:text-neutral-600">26 Dec</div>
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 128" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.4)" />
                            <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
                          </linearGradient>
                          <linearGradient id="areaGradientGreen" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgba(16, 185, 129, 0.3)" />
                            <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" />
                          </linearGradient>
                        </defs>
                        {/* Green area (Responses) */}
                        <path d="M0 110 L60 90 L120 95 L180 75 L240 85 L300 65 L360 80 L400 70 L400 128 L0 128 Z" 
                          fill="url(#areaGradientGreen)" />
                        <path d="M0 110 L60 90 L120 95 L180 75 L240 85 L300 65 L360 80 L400 70" 
                          fill="none" stroke="rgba(16, 185, 129, 0.8)" strokeWidth="2" />
                        {/* Blue area (Messages) */}
                        <path d="M0 100 L60 105 L120 98 L180 102 L240 95 L300 100 L360 92 L400 98 L400 128 L0 128 Z" 
                          fill="url(#areaGradient)" />
                        <path d="M0 100 L60 105 L120 98 L180 102 L240 95 L300 100 L360 92 L400 98" 
                          fill="none" stroke="rgba(59, 130, 246, 0.8)" strokeWidth="2" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Performance Analytics */}
                  <div className="bg-gray-100 dark:bg-neutral-900/50 border border-gray-200 dark:border-neutral-800 rounded-xl p-4 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-gray-900 dark:text-white font-medium">Performance Analytics</h3>
                        <p className="text-gray-500 dark:text-neutral-500 text-xs">Click an automation to filter stats</p>
                      </div>
                      <span className="flex items-center gap-1 px-2 py-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live
                      </span>
                    </div>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {[
                        { icon: ArrowRight, label: 'Link Requests', value: '3' },
                        { icon: MessageCircle, label: 'DMs Generated', value: '3' },
                        { icon: MessageCircle, label: 'Comments', value: '18' },
                        { icon: Sparkles, label: 'Engagement', value: '175.00%' },
                      ].map((item, i) => (
                        <div key={i} className="bg-gray-200 dark:bg-neutral-800/50 rounded-lg p-3">
                          <div className="flex items-center gap-1 text-gray-500 dark:text-neutral-500 text-[10px] mb-1">
                            <item.icon className="w-3 h-3" /> {item.label}
                          </div>
                          <p className="text-gray-900 dark:text-white text-lg font-semibold">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Top Performers */}
                    <div className="mt-4">
                      <p className="text-gray-500 dark:text-neutral-400 text-xs mb-2">Top Performers (by engagement)</p>
                      <div className="flex items-center justify-between bg-gray-200 dark:bg-neutral-800/30 rounded-lg p-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 bg-blue-500 rounded text-white text-[10px] flex items-center justify-center">1</span>
                          <div>
                            <p className="text-gray-900 dark:text-white text-sm font-medium">Logical</p>
                            <p className="text-blue-500 text-[10px]">ai</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-900 dark:text-white text-sm font-semibold">21</p>
                          <p className="text-gray-500 dark:text-neutral-500 text-[10px]">engagement</p>
                        </div>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section className="min-h-screen flex flex-col justify-center py-32 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-neutral-900">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-gray-500 dark:text-neutral-500 text-sm mb-8">Connect your platforms</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {platforms.map((platform) => (
              <div 
                key={platform.name}
                className={cn(
                  "flex items-center gap-2 px-5 py-3 rounded-full border transition-all",
                  platform.active 
                    ? "border-gray-400 dark:border-neutral-600 bg-gray-100 dark:bg-neutral-900/50 text-gray-900 dark:text-white" 
                    : "border-gray-200 dark:border-neutral-800 text-gray-500 dark:text-neutral-600"
                )}
              >
                <platform.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{platform.name}</span>
                {platform.coming && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-gray-200 dark:bg-neutral-800 rounded text-gray-500 dark:text-neutral-500">Soon</span>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className="text-gray-500 dark:text-neutral-600 text-sm">Integrates with</span>
            {integrations.map((int) => (
              <div key={int.name} className="flex items-center gap-1.5 text-gray-500 dark:text-neutral-500">
                <int.icon className="w-4 h-4" />
                <span className="text-sm">{int.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Scroll-Triggered Storytelling */}
      <section 
        id="features" 
        ref={featuresContainerRef}
        className="relative border-t border-gray-200 dark:border-neutral-900"
        style={{ minHeight: `${(features.length + 1) * 100}vh` }}
      >
        <div className="sticky top-0 h-screen flex items-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-screen-2xl mx-auto w-full">
            <div className="grid lg:grid-cols-12 gap-6 items-center">
              {/* Feature tabs - Left side (sticky) */}
              <div className="lg:col-span-3">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-8">
                  Everything you need
                </h2>
                
                <div className="border-t border-gray-200 dark:border-neutral-800">
                  {features.map((feature, i) => (
                    <button
                      key={feature.id}
                      onClick={() => setActiveFeature(i)}
                      className={cn(
                        "w-full text-left py-2 border-b border-gray-200 dark:border-neutral-800 transition-all duration-300",
                        activeFeature === i 
                          ? "bg-gray-100 dark:bg-neutral-900/50" 
                          : "hover:bg-neutral-900/30 opacity-60 hover:opacity-100"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <feature.icon className={cn(
                          "w-4 h-4 transition-colors",
                          activeFeature === i ? "text-white" : "text-neutral-600"
                        )} />
                        <span className={cn(
                          "text-sm font-medium transition-colors",
                          activeFeature === i ? "text-white" : "text-gray-500 dark:text-neutral-500"
                        )}>
                          {feature.label}
                        </span>
                      </div>
                      <div className={cn(
                        "overflow-hidden transition-all duration-300",
                        activeFeature === i ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                      )}>
                        <div className="pl-8">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
                          <p className="text-sm text-gray-500 dark:text-neutral-500">{feature.description}</p>
                          <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-900 dark:text-white mt-2 hover:gap-2 transition-all">
                            Learn more <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Feature visual - Right side */}
              <div className="lg:col-span-9">
                <div className="bg-gray-50 dark:bg-neutral-900/30 border border-gray-200 dark:border-neutral-800 rounded-2xl overflow-hidden" style={{ aspectRatio: '16/9', minHeight: '600px' }}>
                  {features.map((feature, i) => (
                    <div 
                      key={feature.id}
                      className={cn(
                        "transition-all duration-500",
                        activeFeature === i ? "block" : "hidden"
                      )}
                    >
                      <feature.component isActive={activeFeature === i && isInView} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Grid */}
      <section id="solutions" className="min-h-screen flex flex-col justify-center py-32 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-neutral-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Built for growth
            </h2>
            <p className="text-lg text-gray-500 dark:text-neutral-500">
              Every feature designed to help you scale
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {capabilities.map((cap, i) => (
              <div 
                key={i}
                className="group p-6 bg-gray-50 dark:bg-neutral-900/30 border border-gray-200 dark:border-neutral-800 rounded-2xl hover:border-gray-300 dark:hover:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-900/50 transition-all"
              >
                <cap.icon className="w-8 h-8 text-neutral-600 group-hover:text-gray-900 dark:text-white transition-colors mb-4" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{cap.title}</h3>
                <p className="text-sm text-gray-500 dark:text-neutral-500">{cap.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works / Pricing Placeholder */}
      <section id="pricing" className="min-h-screen flex flex-col justify-center py-32 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-neutral-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Get started in minutes
            </h2>
          </div>

          <div className="space-y-0">
            {[
              { step: 1, title: 'Connect your accounts', description: 'Link Instagram and other platforms with secure OAuth' },
              { step: 2, title: 'Build your automations', description: 'Use the visual flow builder to create workflows' },
              { step: 3, title: 'Grow on autopilot', description: 'Watch your engagement and leads increase automatically' },
            ].map((item, i) => (
              <div key={i} className="flex gap-6 py-8 border-b border-gray-200 dark:border-neutral-800 last:border-0">
                <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-gray-500 dark:text-neutral-500">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demographics Section */}
      <section id="agencies" className="min-h-screen flex flex-col justify-center py-32 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-neutral-900">
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Know your audience
            </h2>
            <p className="text-gray-500 dark:text-neutral-500 text-lg max-w-2xl mx-auto">
              Deep insights into who's engaging with your content across the globe
            </p>
          </div>
          
          {/* Demographics Preview Card */}
          <div className="bg-white dark:bg-[#0f0f0f] rounded-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-500" />
                <span className="text-gray-900 dark:text-white font-semibold">Audience Demographics</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-lg">Sample Data</span>
                <div className="flex bg-gray-200 dark:bg-neutral-800 rounded-lg overflow-hidden">
                  <button className="px-3 py-1.5 bg-gray-300 dark:bg-neutral-700 text-gray-900 dark:text-white text-xs">All</button>
                  <button className="px-3 py-1.5 text-gray-500 dark:text-neutral-500 text-xs">Cities</button>
                  <button className="px-3 py-1.5 text-gray-500 dark:text-neutral-500 text-xs">Countries</button>
                </div>
              </div>
            </div>
            
            <div className="p-6 flex gap-6">
              {/* World Map Visualization - Using react-simple-maps */}
              <div className="flex-1 bg-gray-100 dark:bg-neutral-900/50 rounded-xl relative min-h-[350px] overflow-hidden">
                <WorldMap />
              </div>
              
              {/* Stats Panels */}
              <div className="w-72 space-y-4">
                {/* Age Distribution */}
                <div className="bg-gray-100 dark:bg-neutral-900/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-4 h-4 text-purple-500" />
                    <span className="text-gray-900 dark:text-white font-medium text-sm">Age Distribution</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { age: '13-17', pct: 8.2, color: 'bg-purple-400' },
                      { age: '18-24', pct: 28.4, color: 'bg-purple-500' },
                      { age: '25-34', pct: 38.6, color: 'bg-purple-600' },
                      { age: '35-44', pct: 14.2, color: 'bg-purple-500' },
                      { age: '45-54', pct: 9, color: 'bg-purple-400' },
                      { age: '55-64', pct: 1.5, color: 'bg-purple-300' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-gray-500 dark:text-neutral-500 text-xs w-10">{item.age}</span>
                        <div className="flex-1 h-4 bg-gray-200 dark:bg-neutral-800 rounded overflow-hidden">
                          <div className={cn("h-full rounded", item.color)} style={{ width: `${item.pct}%` }} />
                        </div>
                        <span className="text-gray-900 dark:text-white text-xs w-12 text-right">{item.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Gender Split */}
                <div className="bg-gray-100 dark:bg-neutral-900/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span className="text-gray-900 dark:text-white font-medium text-sm">Gender Split</span>
                  </div>
                  <div className="h-6 flex rounded-lg overflow-hidden mb-3">
                    <div className="bg-blue-500 flex items-center justify-center" style={{ width: '52%' }}>
                      <span className="text-gray-900 dark:text-white text-xs font-medium">52%</span>
                    </div>
                    <div className="bg-pink-500 flex items-center justify-center" style={{ width: '46%' }}>
                      <span className="text-gray-900 dark:text-white text-xs font-medium">46%</span>
                    </div>
                    <div className="bg-purple-400 flex items-center justify-center" style={{ width: '2%' }} />
                  </div>
                  <div className="flex justify-center gap-6 text-xs">
                    <span className="flex items-center gap-1 text-gray-500 dark:text-neutral-400"><div className="w-2 h-2 bg-blue-500 rounded-full" /> Male</span>
                    <span className="flex items-center gap-1 text-gray-500 dark:text-neutral-400"><div className="w-2 h-2 bg-pink-500 rounded-full" /> Female</span>
                    <span className="flex items-center gap-1 text-gray-500 dark:text-neutral-400"><div className="w-2 h-2 bg-purple-400 rounded-full" /> Other</span>
                  </div>
                </div>
                
                {/* Top Locations */}
                <div className="bg-gray-100 dark:bg-neutral-900/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Database className="w-4 h-4 text-purple-500" />
                    <span className="text-gray-900 dark:text-white font-medium text-sm">Top Locations</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { rank: 1, city: 'Mumbai', pct: '12.5%' },
                      { rank: 2, city: 'Delhi', pct: '9.8%' },
                      { rank: 3, city: 'Bangalore', pct: '8.2%' },
                      { rank: 4, city: 'New York', pct: '6.4%' },
                      { rank: 5, city: 'Los Angeles', pct: '4.1%' },
                    ].map((loc, i) => (
                      <div key={i} className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 bg-gray-200 dark:bg-neutral-800 rounded text-gray-600 dark:text-neutral-500 text-xs flex items-center justify-center">{loc.rank}</span>
                          <span className="text-gray-900 dark:text-white text-sm">{loc.city}</span>
                        </div>
                        <span className="text-purple-400 text-sm font-medium">{loc.pct}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="min-h-screen flex flex-col justify-center py-32 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-neutral-900">
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Loved by creators worldwide
            </h2>
            <p className="text-gray-500 dark:text-neutral-500 text-lg max-w-2xl mx-auto">
              See what our users are saying about transforming their social media growth
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "This tool completely changed how I manage my Instagram. I went from spending 4 hours daily on DMs to just 30 minutes reviewing automation results.",
                name: "Priya Sharma",
                role: "Fashion Influencer",
                followers: "1.2M followers",
                avatar: "P"
              },
              {
                quote: "The flow builder is incredibly intuitive. I created my first automation in under 10 minutes, and it's already generated 500+ leads for my business.",
                name: "Rahul Mehta",
                role: "E-commerce Founder",
                followers: "200K followers",
                avatar: "R"
              },
              {
                quote: "Finally, a platform that understands Indian creators! The Google Sheets integration is perfect for my team to track all our influencer campaigns.",
                name: "Ananya Patel",
                role: "Marketing Agency",
                followers: "500K+ managed",
                avatar: "A"
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-gray-100 dark:bg-neutral-900/50 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6 hover:border-neutral-700 transition-colors">
                <div className="flex mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <Sparkles key={star} className="w-4 h-4 text-yellow-500" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-neutral-300 mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-gray-900 dark:text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">{testimonial.name}</p>
                    <p className="text-gray-500 dark:text-neutral-500 text-sm">{testimonial.role}</p>
                    <p className="text-purple-400 text-xs">{testimonial.followers}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted Brands Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-neutral-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-gray-500 dark:text-neutral-500 text-sm uppercase tracking-wider mb-4">Trusted by leading brands</p>
            <h2 className="text-3xl font-bold tracking-tight">
              Powering growth for top companies
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center">
            {/* Nykaa - Pink with distinctive font */}
            <div className="h-16 rounded-xl flex items-center justify-center bg-pink-100 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-900/30 hover:bg-pink-200 dark:hover:bg-pink-900/30 transition-colors">
              <span className="text-pink-600 dark:text-pink-400 font-bold text-xl tracking-tight" style={{ fontFamily: 'serif' }}>nykaa</span>
            </div>
            {/* Myntra - Orange M logo style */}
            <div className="h-16 rounded-xl flex items-center justify-center bg-orange-100 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/30 transition-colors">
              <span className="text-orange-600 dark:text-orange-400 font-black text-2xl">M</span>
              <span className="text-orange-600 dark:text-orange-400 font-medium text-lg ml-0.5">yntra</span>
            </div>
            {/* boAt - Red with bold lowercase */}
            <div className="h-16 rounded-xl flex items-center justify-center bg-red-100 dark:bg-red-950/30 border border-red-200 dark:border-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors">
              <span className="text-red-600 dark:text-red-400 font-black text-xl">boAt</span>
            </div>
            {/* Mamaearth - Green with leaf motif */}
            <div className="h-16 rounded-xl flex items-center justify-center bg-green-100 dark:bg-green-950/30 border border-green-200 dark:border-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors">
              <span className="text-green-600 dark:text-green-400 font-semibold text-lg">🌿 Mamaearth</span>
            </div>
            {/* Sugar Cosmetics - Purple/Pink */}
            <div className="h-16 rounded-xl flex items-center justify-center bg-purple-100 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/30 transition-colors">
              <span className="text-purple-600 dark:text-purple-400 font-bold text-xl tracking-widest">SUGAR</span>
            </div>
            {/* Plum - Teal/Emerald */}
            <div className="h-16 rounded-xl flex items-center justify-center bg-emerald-100 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/30 transition-colors">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xl">plum</span>
              <span className="text-emerald-500 dark:text-emerald-300 text-xs ml-1">●</span>
            </div>
          </div>
        </div>
      </section>

      {/* Famous Creators Section - Instagram-style Profile Cards */}
      <section className="min-h-screen flex flex-col justify-center py-32 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-neutral-900">
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Join top creators
            </h2>
            <p className="text-neutral-500 text-lg max-w-2xl mx-auto">
              The fastest-growing influencers and creators use our platform to scale their engagement
            </p>
          </div>
          
          {/* Authentic Instagram Profile Embeds - Dark Theme */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Komal Pandey', handle: 'komalpandeyofficial', followers: '2.1M', posts: '1,245', following: '892' },
              { name: 'Ranveer Allahbadia', handle: 'beerbiceps', followers: '5.8M', posts: '3,421', following: '456' },
              { name: 'Kusha Kapila', handle: 'kushakapila', followers: '3.2M', posts: '2,156', following: '1,023' },
              { name: 'Prajakta Koli', handle: 'mostlysane', followers: '7.2M', posts: '4,567', following: '234' },
            ].map((creator, i) => (
              <a 
                key={i} 
                href={`https://instagram.com/${creator.handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-neutral-800 rounded-lg overflow-hidden hover:border-gray-300 dark:hover:border-neutral-600 transition-all"
              >
                {/* Instagram Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                      <linearGradient id={`ig-gradient-${i}`} x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FFDC80" />
                        <stop offset="25%" stopColor="#F77737" />
                        <stop offset="50%" stopColor="#F56040" />
                        <stop offset="75%" stopColor="#C13584" />
                        <stop offset="100%" stopColor="#833AB4" />
                      </linearGradient>
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z" fill={`url(#ig-gradient-${i})`}/>
                      <path d="M12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8z" fill={`url(#ig-gradient-${i})`}/>
                      <circle cx="18.406" cy="5.594" r="1.44" fill={`url(#ig-gradient-${i})`}/>
                    </svg>
                    <span className="text-white text-sm font-medium">Instagram</span>
                  </div>
                  <span className="text-xs text-neutral-500">View profile</span>
                </div>
                
                {/* Profile Section */}
                <div className="p-4">
                  {/* Avatar and stats */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 p-0.5 flex-shrink-0">
                      <div className="w-full h-full bg-white dark:bg-[#121212] rounded-full flex items-center justify-center">
                        <span className="text-gray-900 dark:text-white text-xl font-bold">{creator.name.charAt(0)}</span>
                      </div>
                    </div>
                    <div className="flex-1 grid grid-cols-3 text-center">
                      <div>
                        <p className="text-gray-900 dark:text-white font-semibold text-sm">{creator.posts}</p>
                        <p className="text-gray-500 dark:text-neutral-500 text-xs">posts</p>
                      </div>
                      <div>
                        <p className="text-gray-900 dark:text-white font-semibold text-sm">{creator.followers}</p>
                        <p className="text-gray-500 dark:text-neutral-500 text-xs">followers</p>
                      </div>
                      <div>
                        <p className="text-gray-900 dark:text-white font-semibold text-sm">{creator.following}</p>
                        <p className="text-gray-500 dark:text-neutral-500 text-xs">following</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Name and handle */}
                  <div className="mb-3">
                    <h3 className="text-gray-900 dark:text-white font-semibold text-sm flex items-center gap-1">
                      {creator.name}
                      <svg className="w-4 h-4 text-[#3897f0]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </h3>
                    <p className="text-gray-500 dark:text-neutral-500 text-xs">@{creator.handle}</p>
                  </div>
                  
                  {/* Follow Button */}
                  <button className="w-full py-1.5 bg-[#0095f6] text-white text-sm font-semibold rounded-lg hover:bg-[#1877f2] transition-colors">
                    Follow
                  </button>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Blog / Success Stories Section */}
      <section id="resources" className="py-32 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-neutral-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Success Stories
            </h2>
            <p className="text-gray-500 dark:text-neutral-500 text-lg max-w-2xl mx-auto">
              Read how our users are growing their audience and generating leads
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'How Priya grew her fashion brand to 1M followers',
                excerpt: 'Learn how she automated her comment replies and increased engagement by 300% in just 3 months.',
                category: 'Case Study',
                readTime: '5 min read',
                gradient: 'linear-gradient(135deg, #534e20 0.000%, #534e20 7.692%, #554f2e calc(7.692% + 1px), #554f2e 15.385%, #555040 calc(15.385% + 1px), #555040 23.077%, #555154 calc(23.077% + 1px), #555154 30.769%, #54536b calc(30.769% + 1px), #54536b 38.462%, #515482 calc(38.462% + 1px), #515482 46.154%, #4e5599 calc(46.154% + 1px), #4e5599 53.846%, #4a57af calc(53.846% + 1px), #4a57af 61.538%, #4558c3 calc(61.538% + 1px), #4558c3 69.231%, #4159d4 calc(69.231% + 1px), #4159d4 76.923%, #3c5be2 calc(76.923% + 1px), #3c5be2 84.615%, #375dea calc(84.615% + 1px), #375dea 92.308%, #335eee calc(92.308% + 1px) 100.000%)'
              },
              {
                title: 'E-commerce: 500 leads from Instagram DMs',
                excerpt: 'Rahul shares his automation workflow that generated 500+ qualified leads for his online store.',
                category: 'Tutorial',
                readTime: '8 min read',
                gradient: 'conic-gradient(from 285deg, #dac5b3 0.000deg, #acb6a4 90.000deg, #799d8d 180.000deg, #567f70 270.000deg, #515f4f 360.000deg)'
              },
              {
                title: 'Agency secrets: Managing 50 creator accounts',
                excerpt: 'How one marketing agency scaled their influencer management with our automation tools.',
                category: 'Agency',
                readTime: '6 min read',
                gradient: 'conic-gradient(from 45deg, #a5c8e4 0.000deg, #e4ad47 30.000deg, #e590dc 60.000deg, #a67451 90.000deg, #655cd0 120.000deg, #604b5e 150.000deg, #9c44c2 180.000deg, #df466d 210.000deg, #e852b2 240.000deg, #af667e 270.000deg, #6a80a1 300.000deg, #5d9d90 330.000deg, #93b98f 360.000deg)'
              }
            ].map((post, i) => (
              <article key={i} className="group bg-white dark:bg-neutral-900/30 border border-gray-200 dark:border-neutral-800 rounded-2xl overflow-hidden hover:border-gray-300 dark:hover:border-neutral-700 transition-all">
                {/* Image placeholder */}
                <div className="h-48 relative" style={{ background: post.gradient }}>
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full">{post.category}</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-purple-400 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-neutral-500 text-sm mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600 text-xs">{post.readTime}</span>
                    <Link 
                      href="#" 
                      className="text-purple-400 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      Read more <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-gray-200 dark:border-neutral-900">
        <FAQSection />
      </section>

      {/* Final CTA */}
      <section className="min-h-screen flex flex-col justify-center py-32 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-neutral-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Ready to automate
            <br />
            <span className="text-gray-400 dark:text-neutral-500">your growth?</span>
          </h2>
          <p className="text-lg text-gray-500 dark:text-neutral-500 mb-10">
            Start building your automations today. No credit card required.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black text-base font-semibold rounded-full hover:bg-gray-800 dark:hover:bg-neutral-200 transition-all"
          >
            Start for free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  )
}
