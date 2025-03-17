import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import React from 'react'

type Props = {
  trigger: JSX.Element
  children: React.ReactNode
  className?: string
}

const PopOver = ({ children, trigger, className }: Props) => {
  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        className={cn('bg-white dark:bg-gray-900 border-white dark:border-gray-700 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.2)] dark:shadow-[0_4px_20px_-2px_rgba(255,255,255,0.1)] rounded-xl mt-5 w-[450px]', className)}
        align="end"
        side="bottom"
      >
        {children}
      </PopoverContent>
    </Popover>
  )
}

export default PopOver
