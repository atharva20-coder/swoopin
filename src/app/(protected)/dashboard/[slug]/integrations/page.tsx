'use client'

import { INTEGRATION_CARDS } from '@/constants/integrations'
import React from 'react'
import IntegrationCard from './_components/integration-card'
import { Sigmar } from 'next/font/google'

const sigmar = Sigmar({ weight: '400', subsets: ['latin'] })

type Props = {}

const Page = (props: Props) => {
  return (
    <>
      <div className="text-left mb-6 py-8 pl-8">
        <h1 className={`${sigmar.className} text-4xl font-bold text-gray-900 mb-2`}>Where would you like to start?</h1>
        <p className="text-lg text-gray-600">Don&apos;t worry, you can connect other channels later.</p>
      </div>
      <div className="flex justify-center">
        <div className="flex flex-col w-full lg:w-8/12 gap-y-5">
          {INTEGRATION_CARDS.map((card, key) => (
            <IntegrationCard
              key={key}
              {...card}
            />
          ))}
        </div>
      </div>
    </>
  )
}

export default Page