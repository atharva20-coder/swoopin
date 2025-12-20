'use client'
import React, { useState, useCallback } from 'react'
import { useQueryInstagramProfile } from '@/hooks/user-queries'
import { Instagram, Facebook, Twitter, Linkedin, Youtube, MessageCircle, Mail, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { cn } from '@/lib/utils'

type Platform = {
  id: string
  name: string
  icon: React.ElementType
  color: string
  bgGradient: string
  connected?: boolean
  profile?: {
    username?: string
    name?: string
    avatar?: string | null
    followers?: number
  }
}

const PLATFORMS: Platform[] = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E1306C', bgGradient: 'from-[#833AB4] via-[#E1306C] to-[#F77737]' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2', bgGradient: 'from-[#1877F2] to-[#42A5F5]' },
  { id: 'twitter', name: 'Twitter', icon: Twitter, color: '#1DA1F2', bgGradient: 'from-gray-900 to-gray-700' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0A66C2', bgGradient: 'from-[#0A66C2] to-[#0077B5]' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: '#FF0000', bgGradient: 'from-[#FF0000] to-[#CC0000]' },
  { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, color: '#25D366', bgGradient: 'from-[#25D366] to-[#128C7E]' },
  { id: 'gmail', name: 'Gmail', icon: Mail, color: '#EA4335', bgGradient: 'from-[#EA4335] via-[#FBBC05] to-[#34A853]' },
]

const formatNumber = (count: number) => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
  return count.toString()
}

const PlatformSwitcher = () => {
  const params = useParams()
  const { data: instagramProfile, isLoading } = useQueryInstagramProfile()
  const [activePlatform, setActivePlatform] = useState('instagram')
  const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null)
  
  const isInstagramConnected = instagramProfile?.status === 200 && instagramProfile.data
  const instaProfile = isInstagramConnected ? instagramProfile.data : null

  // Build platforms with connection status
  const platforms = PLATFORMS.map(p => ({
    ...p,
    connected: p.id === 'instagram' ? isInstagramConnected : false,
    profile: p.id === 'instagram' && instaProfile ? {
      username: instaProfile.username,
      name: instaProfile.name,
      avatar: instaProfile.profile_pic,
      followers: instaProfile.follower_count
    } : undefined
  }))

  const activePlatformData = platforms.find(p => p.id === activePlatform) || platforms[0]
  const connectedCount = platforms.filter(p => p.connected).length

  const handlePlatformClick = useCallback((platformId: string) => {
    setActivePlatform(platformId)
  }, [])

  return (
    <div className="relative">
      {/* Floating Dock */}
      <div className="flex items-center justify-center gap-2 p-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 mx-auto w-fit">
        {platforms.map((platform, index) => {
          const isActive = activePlatform === platform.id
          const isHovered = hoveredPlatform === platform.id
          const Icon = platform.icon
          
          return (
            <button
              key={platform.id}
              onClick={() => handlePlatformClick(platform.id)}
              onMouseEnter={() => setHoveredPlatform(platform.id)}
              onMouseLeave={() => setHoveredPlatform(null)}
              className={cn(
                "relative group transition-all duration-300 ease-out",
                isActive ? "scale-110 z-10" : isHovered ? "scale-105" : "scale-100"
              )}
            >
              {/* Tooltip */}
              <div className={cn(
                "absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg",
                (isHovered || isActive) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
              )}>
                {platform.name}
                {platform.connected && <span className="ml-1 text-green-400">●</span>}
                {!platform.connected && <span className="ml-1 opacity-50">· Coming soon</span>}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-white" />
              </div>

              {/* Icon Container */}
              <div 
                className={cn(
                  "relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                  isActive 
                    ? `bg-gradient-to-br ${platform.bgGradient} shadow-lg` 
                    : platform.connected
                      ? "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                      : "bg-gray-50 dark:bg-gray-800/50"
                )}
                style={!isActive && platform.connected ? { boxShadow: `0 0 0 2px ${platform.color}40` } : undefined}
              >
                <Icon 
                  className={cn(
                    "w-6 h-6 transition-all duration-300",
                    isActive ? "text-white" : platform.connected ? "" : "opacity-40"
                  )}
                  style={!isActive ? { color: platform.color } : undefined}
                />
                
                {/* Connection indicator dot */}
                {platform.connected && !isActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
                )}
                
                {/* Bottom reflection for active */}
                {isActive && (
                  <div 
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full blur-sm"
                    style={{ backgroundColor: platform.color }}
                  />
                )}
              </div>
            </button>
          )
        })}

        {/* Divider */}
        <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-1" />

        {/* Add Platform Button */}
        <Link
          href={`/dashboard/${params.slug}/integrations`}
          className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-all duration-200 hover:scale-105"
        >
          <Plus className="w-5 h-5 text-gray-500" />
        </Link>
      </div>

      {/* Active Platform Stats Card */}
      <div className="mt-6 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center",
              activePlatformData.bgGradient
            )}>
              <activePlatformData.icon className="w-7 h-7 text-white" />
            </div>
            
            <div>
              {activePlatformData.connected && activePlatformData.profile ? (
                <>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    @{activePlatformData.profile.username}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {activePlatformData.profile.name}
                  </p>
                </>
              ) : (
                <>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {activePlatformData.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Not connected yet
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6">
            {activePlatformData.connected && activePlatformData.profile?.followers !== undefined && (
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(activePlatformData.profile.followers)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Followers</p>
              </div>
            )}
            
            {!activePlatformData.connected && (
              <Link
                href={`/dashboard/${params.slug}/integrations`}
                className={cn(
                  "px-4 py-2 rounded-xl text-white font-medium text-sm transition-all duration-200 hover:opacity-90 bg-gradient-to-r",
                  activePlatformData.bgGradient
                )}
              >
                Connect {activePlatformData.name}
              </Link>
            )}

            <div className="text-right px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400">Connected</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{connectedCount}/7</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlatformSwitcher
