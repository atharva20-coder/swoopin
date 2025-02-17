import Loader from '@/components/global/loader'
import React from 'react'

type Props = {}

const Loading = (props: Props) => {
  return (
    <div className='min-h-screen bg-background flex justify-center items-center'>
      <div className='flex flex-col items-center gap-4'>
        <Loader state>
          <span></span>
        </Loader>
        <p className='text-text-secondary animate-pulse'>Loading your dashboard...</p>
      </div>
    </div>
  )
}

export default Loading