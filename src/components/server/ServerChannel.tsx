'use client'

import { SelectChannel, SelectServer } from '@/db/schema'
import { cn } from '@/lib/utils'
import { Edit, Hash, Lock, LucideIcon, Mic, Trash, Video } from 'lucide-react'
import { useParams } from 'next/navigation'
import { ChannelTypes, MemberRoles } from '../../../types'
import ActionTooltip from '../ActionTooltip'

type ServerChannelProps = {
  channel: SelectChannel
  Server: SelectServer
  role?: MemberRoles
}

const iconMap: { [key in ChannelTypes]: LucideIcon } = {
  TEXT: Hash,
  AUDIO: Mic,
  VIDEO: Video,
} as const

function ServerChannel({ channel, Server, role }: ServerChannelProps) {
  const params = useParams()

  const Icon = iconMap[channel.type]
  return (
    <button
      onClick={() => {}}
      className={cn(
        'group mb-1 flex w-full items-center gap-x-2 rounded-md px-2 py-2 transition hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50',
        params?.channelId === channel.id ? ' bg-zinc-700/20 dark:bg-zinc-700' : undefined
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0 text-zinc-500 dark:text-zinc-400" />
      <p
        className={cn(
          ' line-clamp-1 text-sm font-semibold text-zinc-500 transition group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300',
          params?.channelId === channel.id ? 'text-primary dark:text-zinc-200' : undefined
        )}
      >
        {channel.name}
      </p>
      {channel.name === 'general' && (
        <Lock className="ml-auto h-4 w-4 text-zinc-500 hover:text-zinc-600 group-hover:block dark:text-zinc-400 dark:hover:text-zinc-300" />
      )}
      {channel.name !== 'general' && role !== ('GUEST' || undefined) && (
        <div className="ml-auto flex items-center gap-x-2">
          <ActionTooltip label={'Edit'}>
            <Edit className="hidden h-4 w-4 text-zinc-500 hover:text-zinc-600 group-hover:block dark:text-zinc-400 dark:hover:text-zinc-300" />
          </ActionTooltip>
          <ActionTooltip label={'Delete'}>
            <Trash className="hidden h-4 w-4 text-zinc-500 hover:text-zinc-600 group-hover:block dark:text-zinc-400 dark:hover:text-zinc-300" />
          </ActionTooltip>
        </div>
      )}
    </button>
  )
}

export default ServerChannel
