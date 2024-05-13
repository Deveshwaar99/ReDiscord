import { Hash } from 'lucide-react'
import MobileToggle from '../MobileToggle'

interface ChatHeaderProps {
  serverId: string
  name: string
  type: 'channel' | 'conversation'
  imageUrl?: string
}

function ChatHeader({ serverId, name, type, imageUrl }: ChatHeaderProps) {
  return (
    <div className="text-md flex h-12 items-center border-b-2 border-neutral-200 px-3 font-semibold dark:border-neutral-800">
      <MobileToggle serverId={serverId} />

      {type === 'channel' ? <Hash className="dark:text-zic-400 size-5 text-zinc-500" /> : null}

      <p className="text-base font-semibold text-black dark:text-white">{name}</p>
    </div>
  )
}

export default ChatHeader
