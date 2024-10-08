'use client'
import { useModalStore } from '@/hooks/useModalStore'
import { Plus, Settings } from 'lucide-react'
import type { ChannelTypes, MemberRoles, ServerDetails } from '../../../types'
import ActionTooltip from '../ActionTooltip'

type ServerSectionProps = {
  label: string
  sectionType: 'channels' | 'members'
  channelType?: ChannelTypes
  role: MemberRoles | undefined
  server: ServerDetails
}

function ServerSection({ label, sectionType, channelType, role, server }: ServerSectionProps) {
  const { onOpen } = useModalStore()
  return (
    <div className="flex items-center justify-between py-2">
      <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">{label}</p>

      {role !== 'GUEST' && sectionType === 'channels' && (
        <ActionTooltip label="Create Channel" side="top">
          <button
            type="button"
            onClick={() => {
              onOpen('create-channel', { server, channelType: channelType })
            }}
            className="text-zinc-500 transition hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300"
          >
            <Plus className="size-4" />
          </button>
        </ActionTooltip>
      )}

      {role === 'ADMIN' && sectionType === 'members' && (
        <ActionTooltip label="Manage Members" side="top">
          <button
            type="button"
            onClick={() => {
              onOpen('manage-members', { server })
            }}
            className="text-zinc-500 transition hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300"
          >
            <Settings className="size-4" />
          </button>
        </ActionTooltip>
      )}
    </div>
  )
}

export default ServerSection
