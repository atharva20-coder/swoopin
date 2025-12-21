"use client"

import React from 'react'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'

type Props = {}

const Loading = (props: Props) => {
  const pathname = usePathname()
  const pageName = pathname?.split('/')?.pop() || 'Dashboard'

  return (
    <div className='min-h-screen bg-background p-3'>
      {/* Sidebar Skeleton */}
      <div className='fixed left-0 top-0 bottom-0 w-[250px] bg-white dark:bg-neutral-900 p-4 border-r border-gray-200 dark:border-neutral-800 hidden lg:block'>
        <div className='space-y-4'>
          <div className='h-4 w-16 bg-gray-200 rounded animate-pulse' />
          <div className='space-y-2'>
            {[...Array(6)].map((_, i) => (
              <div key={i} className='flex items-center gap-x-6 p-2'>
                <div className='h-8 w-8 rounded bg-gray-200 dark:bg-neutral-900 animate-pulse' />
                <div className='h-4 w-24 bg-gray-200 dark:bg-neutral-900 rounded animate-pulse' />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className='lg:ml-[var(--sidebar-width,250px)] lg:pl-10 lg:py-5 flex flex-col overflow-auto pb-24 transition-all duration-300'>
        {/* Page Name */}
        <div className='mb-6'>
          <div className='h-6 w-48 bg-gray-200 rounded animate-pulse'>
            <span className='sr-only'>Loading {pageName}...</span>
          </div>
        </div>

        {/* Skeleton for InfoBar */}
        <div className='w-full flex items-center justify-between mb-8'>
          <div className='flex items-center gap-4'>
            <div className='h-12 w-12 rounded-full bg-gray-200 animate-pulse' />
            <div className='space-y-2'>
              <div className='h-4 w-32 bg-gray-200 dark:bg-gray-400 rounded animate-pulse' />
              <div className='h-3 w-24 bg-gray-200 dark:bg-gray-400 rounded animate-pulse' />
            </div>
          </div>
          <div className='flex gap-4'>
            <div className='h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-400 animate-pulse' />
            <div className='h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-400 animate-pulse' />
          </div>
        </div>

        {/* Skeleton for Dashboard Content */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {/* Analytics Cards */}
          {[...Array(3)].map((_, i) => (
            <div key={i} className='p-6 rounded-xl bg-white dark:bg-neutral-900 shadow-sm'>
              <div className='flex justify-between items-center mb-4'>
                <div className='h-4 w-24 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse' />
                <div className='h-8 w-8 rounded bg-gray-200 dark:bg-neutral-700 animate-pulse' />
              </div>
              <div className='h-8 w-32 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse mb-2' />
              <div className='h-3 w-20 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse' />
            </div>
          ))}
        </div>

        {/* Skeleton for Charts Section */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8'>
          {/* Chart Areas */}
          {[...Array(2)].map((_, i) => (
            <div key={i} className='p-6 rounded-xl bg-white dark:bg-neutral-900 shadow-sm'>
              <div className='flex justify-between items-center mb-6'>
                <div className='h-4 w-32 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse' />
                <div className='h-8 w-8 rounded bg-gray-200 dark:bg-neutral-700 animate-pulse' />
              </div>
              <div className='h-[200px] bg-gray-200 dark:bg-neutral-700 rounded-lg animate-pulse' />
            </div>
          ))}
        </div>

        {/* Skeleton for Recent Activity */}
        <div className='mt-8 p-6 rounded-xl bg-white dark:bg-neutral-900 shadow-sm'>
          <div className='flex justify-between items-center mb-6'>
            <div className='h-4 w-40 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse' />
            <div className='h-8 w-24 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse' />
          </div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className='flex items-center gap-4 py-3 border-b last:border-0'>
              <div className='h-10 w-10 rounded-full bg-gray-200 dark:bg-neutral-700 animate-pulse' />
              <div className='flex-1'>
                <div className='h-4 w-3/4 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse mb-2' />
                <div className='h-3 w-1/2 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse' />
              </div>
              <div className='h-4 w-20 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse' />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Loading