'use client'

import { cn } from '@/lib/utils'
import React from 'react'
import { useSocket } from './providers/socket-provider'
import { Badge } from './ui/badge'

function SocketIndicator() {
  const { isConnected } = useSocket()

  return (
    <Badge
      variant="outline"
      className={cn('border-none  text-white', isConnected ? 'bg-emerald-600' : 'bg-yellow-600')}
    >
      {isConnected ? 'Live: Realtime updates' : 'Fallback: Polling every 1s'}
    </Badge>
  )
}

export default SocketIndicator
