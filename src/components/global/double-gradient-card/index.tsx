import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import React from 'react'

type Props = {
  label: string
  subLabel: string
  description?: string
  isPopular?: boolean
}

const DoubleGradientCard = ({ description, label, subLabel, isPopular }: Props) => {
  return (
    <div className="relative border-[1px] border-in-active/50 dark:border-gray-700 p-6 rounded-xl flex flex-col gap-y-6 overflow-hidden snap-center min-w-[85%] md:min-w-full bg-card hover:bg-card/80 dark:bg-gray-800/80 dark:hover:bg-gray-700/90 transition-colors">
      <div className="flex flex-col z-40 relative">
        {isPopular && (
          <span className="absolute -top-1 right-0 px-3 py-1 text-xs font-medium rounded-full dark:bg-orange-400/20 dark:text-orange-300" style={{ backgroundColor: '#FFF1E2', color: '#FF8A65' }}>POPULAR</span>
        )}
        <h2 className="text-2xl font-semibold text-primary dark:text-white mb-2">{label}</h2>
        <p className="text-muted-foreground dark:text-gray-400 text-sm">{subLabel}</p>
      </div>
      <div className="flex justify-between items-center z-40">
        <p className="text-muted-foreground dark:text-gray-400 text-sm max-w-[70%]">{description}</p>
        <Button variant="secondary" size="icon" className="rounded-full w-10 h-10 bg-primary/10 hover:bg-primary/20 dark:bg-blue-500/10 dark:hover:bg-blue-500/20">
          <ArrowRight className="h-5 w-5 text-primary dark:text-blue-400" />
        </Button>
      </div>
      <div className="w-6/12 h-full absolute radial--double--gradient--cards--top top-0 left-0 z-10 dark:opacity-30" />
      <div className="w-6/12 h-full absolute radial--double--gradient--cards--bottom top-0 left-1/2 right-0 z-0 dark:opacity-30" />
    </div>
  )
}

export default DoubleGradientCard
