import type { Server as NetServer } from 'node:http'
import type { Socket } from 'node:net'
import type { NextApiRequest, NextApiResponse } from 'next'
import { Server as IoServer } from 'socket.io'

export type NextApiResponseServerIo = NextApiResponse & {
  socket: Socket & { server: NetServer & { io: IoServer } }
}

export const config = {
  api: {
    bodyParser: false, // Disable body parsing for this route
  },
}

const ioHandler = (_req: NextApiRequest, res: NextApiResponseServerIo) => {
  if (res?.socket?.server?.io) {
    console.log('Socket.io server already running')
  } else {
    console.log('Socket is initializing')

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const httpServer: NetServer = res.socket.server as any

    const io = new IoServer(httpServer, {
      path: '/api/socket/io',
      addTrailingSlash: false,
    })

    io.on('connection', socket => {
      console.log('New client connected')

      // Handle custom events
      socket.on('message', data => {
        console.log('Message received:', data)
      })

      socket.on('disconnect', () => {
        console.log('Client disconnected')
      })
    })

    res.socket.server.io = io // Attach io to the server instance
  }

  res.end()
}

export default ioHandler
