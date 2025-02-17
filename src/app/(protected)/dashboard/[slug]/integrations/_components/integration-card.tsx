'use client'

import React, { useState } from 'react'
import ReactConfetti from 'react-confetti'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

type IntegrationCardProps = {
  title: string
  description: string
  icon: React.ReactNode
  buttonText: string
  onConnect: () => Promise<void>
}

const IntegrationCard = ({
  title,
  description,
  icon,
  buttonText,
  onConnect
}: IntegrationCardProps) => {
  const [showConfetti, setShowConfetti] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    try {
      setIsConnecting(true)
      await onConnect()
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 5000) // Hide confetti after 5 seconds
    } catch (error) {
      console.error('Connection failed:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <Card className="p-6 relative overflow-hidden">
      {showConfetti && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-lg bg-primary/10">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <Button
          onClick={handleConnect}
          disabled={isConnecting}
          className="ml-4"
        >
          {isConnecting ? 'Connecting...' : buttonText}
        </Button>
      </div>
    </Card>
  )
}

export default IntegrationCard