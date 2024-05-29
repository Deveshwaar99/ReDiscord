import { Server as IoServer } from 'socket.io'
import { Server as NetServer } from 'node:http'
import { NextApiRequest, NextApiResponse } from 'next'
import { Socket } from 'net'

export type NextApiResponseServerIo = NextApiResponse & {
  socket: Socket & { server: NetServer & { io: IoServer } }
}

export const config = {
  api: {
    bodyParser: false, // Disable body parsing for this route
  },
}

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
  if (!res.socket.server.io) {
    console.log('Socket is initializing')
    const httpServer = res.socket.server as NetServer
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
  } else {
    console.log('Socket.io server already running')
  }
  res.end()
}

export default ioHandler
