'use client'

import { useUser } from '@clerk/nextjs'
import { AudioConference, LiveKitRoom, VideoConference } from '@livekit/components-react'
import '@livekit/components-styles'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
interface MediaRoomProps {
  chatId: string
  audio: boolean
  video: boolean
}
function MediaRoom({ chatId, audio, video }: MediaRoomProps) {
  const { user } = useUser()
  const [token, setToken] = useState('')

  useEffect(() => {
    if (!user?.fullName) return
    const name = user.fullName
    const room = chatId

    const getToken = async () => {
      try {
        const resp = await fetch(`/api/liveKit?room=${room}&username=${name}`)
        const data = await resp.json()
        setToken(data.token)
      } catch (e) {
        console.error(e)
      }
    }

    getToken()
  }, [chatId, user?.fullName])

  if (token === '') {
    return (
      <div className="flex size-full flex-1 flex-col items-center justify-center">
        <Loader2 className="my-4 size-7 animate-spin text-zinc-500" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Loading messages...</p>
      </div>
    )
  }

  return (
    <LiveKitRoom
      video={video}
      audio={audio}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      connect={true}
      // Use the default LiveKit theme for nice styles.
      data-lk-theme="default"
    >
      {video ? <VideoConference /> : <AudioConference />}
    </LiveKitRoom>
  )
}

export default MediaRoom
