import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import React from 'react'

type Props = {
  children: React.ReactNode
  type: 'BUTTON' | 'LINK'
  href?: string
  className?: string
}

const GradientButton = ({ children, type, className, href }: Props) => {
  const buttonStyles = 'bg-gray-100 hover:bg-gray-200 transition-colors duration-200 rounded-xl p-[2px]'

  switch (type) {
    case 'BUTTON':
      return (
        <div className={buttonStyles}>
          <Button className={cn(className, 'rounded-xl')}>{children}</Button>
        </div>
      )

    case 'LINK':
      return (
        <div className={buttonStyles}>
          <Link
            href={href!}
            className={cn(className, 'rounded-xl')}
          >
            {children}
          </Link>
        </div>
      )

    default:
      return null
  }
}

export default GradientButton
