'use client'

import { INTEGRATION_CARDS } from '@/constants/integrations'
import React, { useState } from 'react'
import IntegrationCard from './_components/integration-card'
import GoogleIntegrationCard from './_components/google-integration-card'
import CanvaIntegrationCard from '@/components/global/canva-integration-card'
import { cn } from '@/lib/utils'
import { ChevronRight, SlidersHorizontal, Instagram, MessageCircle, AtSign, Mail, Facebook, Twitter, Linkedin, Youtube } from 'lucide-react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

type Category = 'all' | 'social' | 'messaging' | 'marketing' | 'coming-soon';

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'all', label: 'View all' },
  { value: 'social', label: 'Social Media' },
  { value: 'messaging', label: 'Messaging' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'coming-soon', label: 'Coming Soon' },
];

const CELL_SIZE = 70;

// Grid icons using Lucide
const GRID_ICONS = [
  { Icon: Instagram, color: '#E1306C', row: 0, col: 0 },
  { Icon: AtSign, color: '#000', row: 0, col: 3 },
  { Icon: MessageCircle, color: '#0084FF', row: 1, col: 1 },
  { Icon: Facebook, color: '#1877F2', row: 2, col: 3 },
  { Icon: Twitter, color: '#1DA1F2', row: 3, col: 0 },
  { Icon: Mail, color: '#EA4335', row: 4, col: 2 },
  { Icon: Linkedin, color: '#0A66C2', row: 5, col: 0 },
  { Icon: Youtube, color: '#FF0000', row: 6, col: 3 },
];

export default function IntegrationsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [activeCategory, setActiveCategory] = useState<Category>('all');

  const filteredCards = INTEGRATION_CARDS.filter(card => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'coming-soon') return card.comingSoon;
    if (activeCategory === 'social') return card.strategy === 'INSTAGRAM' || card.title.includes('Facebook') || card.title.includes('Twitter') || card.title.includes('LinkedIn') || card.title.includes('YouTube');
    if (activeCategory === 'messaging') return card.title.toLowerCase().includes('messenger') || card.title.toLowerCase().includes('threads');
    if (activeCategory === 'marketing') return card.title.toLowerCase().includes('newsletter');
    return true;
  });

  return (
    <div className="flex h-[calc(100vh-4rem)] p-2 sm:p-4 gap-4">
      {/* Left Card - Grid with Icons (Desktop only) */}
      <div className="hidden lg:flex w-[320px] shrink-0 bg-gray-100 dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-neutral-700/50 overflow-hidden flex-col relative">
        {/* Grid Background Pattern */}
        <div 
          className="absolute inset-0 grid-pattern"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0,0,0,0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0,0,0,0.08) 1px, transparent 1px)
            `,
            backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
          }}
        />
        {/* Dark mode grid overlay */}
        <div 
          className="absolute inset-0 hidden dark:block"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)
            `,
            backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
          }}
        />
        
        {/* Scattered Icons */}
        <div className="flex-1 relative p-2">
          {GRID_ICONS.map((item, i) => {
            const IconComponent = item.Icon;
            return (
              <div
                key={i}
                className="absolute w-[56px] h-[56px] rounded-xl bg-white dark:bg-[#2a2a2a] shadow-sm border border-gray-200 dark:border-gray-600/50 flex items-center justify-center transition-transform hover:scale-110 hover:shadow-md"
                style={{
                  top: item.row * CELL_SIZE + 7,
                  left: item.col * CELL_SIZE + 7,
                }}
              >
                <IconComponent 
                  className="w-7 h-7" 
                  style={{ color: item.color }}
                />
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="relative p-5 border-t border-gray-200 dark:border-neutral-700/50 bg-gray-100/95 dark:bg-[#1a1a1a]/95 backdrop-blur-sm">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">Add integrations</h2>
          <p className="text-gray-500 dark:text-gray-400 text-xs mb-3">
            Connect your favorite tools to supercharge your workflow.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs h-8 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-neutral-700">
              I&apos;ll do this later
            </Button>
            <Button size="sm" className="gap-1 text-xs h-8 bg-blue-600 hover:bg-blue-700">
              Continue <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Card - Integrations List */}
      {/* Transparent bg on mobile/tablet, card styling only on lg: */}
      <div className="flex-1 lg:bg-white lg:dark:bg-[#1e1e1e] lg:rounded-2xl lg:border lg:border-gray-200 lg:dark:border-neutral-700/50 flex flex-col overflow-hidden">
        {/* Breadcrumbs + Filter Tabs */}
        <div className="px-2 sm:px-4 lg:px-6 py-3 lg:py-4 shrink-0">
          {/* Filter Tabs */}
          <div className="flex items-center justify-between pb-3 lg:pb-4 border-b border-gray-200 dark:border-neutral-800">
            <div className="flex gap-1 overflow-x-auto scrollbar-hide -mx-2 px-2 sm:mx-0 sm:px-0">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={cn(
                    "px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 transition",
                    activeCategory === cat.value
                      ? "bg-gray-900 dark:bg-neutral-700 text-white"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <button className="hidden sm:flex items-center gap-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white text-sm ml-2 shrink-0">
              <SlidersHorizontal className="w-4 h-4" />
              Recent
            </button>
          </div>
        </div>

        {/* Scrollable Integration List */}
        <div className="flex-1 overflow-y-auto px-2 sm:px-4 lg:px-6 pb-4 lg:pb-6">
          <div className="space-y-1 sm:space-y-1">
            {/* Google Sheets Integration */}
            <GoogleIntegrationCard />
            
            {/* Canva Integration */}
            <CanvaIntegrationCard />
            
            {/* Divider */}
            <div className="py-2">
              <div className="border-t border-gray-100 dark:border-neutral-800" />
            </div>
            
            {filteredCards.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No integrations found
              </div>
            ) : (
              filteredCards.map((card, key) => (
                <IntegrationCard key={key} {...card} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}