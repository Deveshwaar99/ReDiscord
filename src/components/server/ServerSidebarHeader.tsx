'use client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useModalStore } from '@/hooks/useModalStore'
import { ChevronDown, LogOut, PlusCircle, Settings, Trash, UserPlus, Users } from 'lucide-react'
import type { ServerDetails } from '../../../types'

interface ServerSidebarHeaderProps {
  server: ServerDetails
  role: 'ADMIN' | 'MODERATOR' | 'GUEST'
}

function ServerSidebarHeader({ server, role }: ServerSidebarHeaderProps) {
  const isAdmin = role === 'ADMIN'
  const isModerator = role === ('ADMIN' || 'MODERATOR')

  const { onOpen } = useModalStore()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none" asChild>
        <button
          type="button"
          className="text-md flex h-12 w-full items-center border-b-2 border-neutral-200 px-3 font-semibold transition hover:bg-zinc-700/10 dark:border-neutral-800 dark:hover:bg-zinc-700/50"
        >
          {server.name}
          <ChevronDown className="ml-auto h-5 w-5" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56 space-y-[2px] text-xs font-medium text-black dark:text-neutral-400">
        {isModerator && (
          <DropdownMenuItem
            onClick={() => {
              onOpen('invite', { server })
            }}
            className="cursor-pointer px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400"
          >
            Invite People
            <UserPlus className="ml-auto h-4 w-4" />
          </DropdownMenuItem>
        )}

        {isAdmin && (
          <DropdownMenuItem
            onClick={() => {
              onOpen('edit-server', { server })
            }}
            className="cursor-pointer px-3 py-2 text-sm"
          >
            Server Settings
            <Settings className="ml-auto h-4 w-4" />
          </DropdownMenuItem>
        )}
        {isAdmin && (
          <DropdownMenuItem
            onClick={() => {
              onOpen('manage-members', { server })
            }}
            className="cursor-pointer px-3 py-2 text-sm"
          >
            Manage Members
            <Users className="ml-auto h-4 w-4" />
          </DropdownMenuItem>
        )}

        {isModerator && (
          <DropdownMenuItem
            onClick={() => {
              onOpen('create-channel', { server })
            }}
            className="cursor-pointer px-3 py-2 text-sm"
          >
            Create Channel
            <PlusCircle className="ml-auto h-4 w-4" />
          </DropdownMenuItem>
        )}

        {isModerator && <DropdownMenuSeparator />}

        {isAdmin && (
          <DropdownMenuItem
            onClick={() => {
              onOpen('delete-server', { server })
            }}
            className="cursor-pointer px-3 py-2 text-sm text-rose-500"
          >
            Delete Server
            <Trash className="ml-auto h-4 w-4" />
          </DropdownMenuItem>
        )}

        {!isAdmin && (
          <DropdownMenuItem
            onClick={() => {
              onOpen('leave-server', { server })
            }}
            className="cursor-pointer px-3 py-2 text-sm text-rose-500"
          >
            Leave Server
            <LogOut className="ml-auto h-4 w-4" />
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ServerSidebarHeader
