'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { io as ClientIo } from 'socket.io-client'

type SocketContextType = {
  socket: any | null
  isConnected: boolean
}

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false })

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<any | null>(null)
  const [isConnected, setIsConnected] = useState<boolean>(false)

  useEffect(() => {
    const socketInstance = new (ClientIo as any)(process.env.NEXT_PUBLIC_SITE_URL, {
      path: '/api/socket/io',
      addTrailingSlash: false,
    })

    socketInstance.on('connect', () => {
      console.log('Connected Socket')
      setIsConnected(true)
    })
    socketInstance.on('disconnect', () => {
      console.log('Disconnected socket')

      setIsConnected(false)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [])
  return <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>
}

export function useSocket() {
  return useContext(SocketContext)
}
