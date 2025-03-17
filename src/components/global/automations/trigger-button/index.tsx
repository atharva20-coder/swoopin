import React from 'react'
import PopOver from '../../popover'
import { BlueAddIcon } from '@/icons'

type Props = {
  children: React.ReactNode
  label: string
}

const TriggerButton = ({ children, label }: Props) => {
  return (
    <PopOver
      className="w-[400px]"
      trigger={
        <div className="border-2 border-dashed w-full border-primary/60 dark:border-primary/40 hover:border-primary dark:hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 cursor-pointer transition-all duration-200 rounded-xl flex gap-x-2 justify-center items-center p-5 mt-4">
          <BlueAddIcon />
          <p className="text-primary dark:text-primary/90 font-semibold">{label}</p>
        </div>
      }
    >
      {children}
    </PopOver>
  )
}

export default TriggerButton
