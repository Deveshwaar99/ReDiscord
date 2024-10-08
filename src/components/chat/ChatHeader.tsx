import { Hash } from 'lucide-react'
import MobileToggle from '../MobileToggle'
import SocketIndicator from '../SocketIndicator'
import UserAvatar from '../UserAvatar'
import ChatVideoButton from './ChatVideoButton'

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
      {type === 'conversation' ? <UserAvatar src={imageUrl} className="mr-2 size-8" /> : null}

      <p className="text-base font-semibold text-black dark:text-white">{name}</p>
      <div className="ml-auto flex items-center justify-center">
        {type === 'conversation' && <ChatVideoButton />}
        <SocketIndicator />
      </div>
    </div>
  )
}

export default ChatHeader
