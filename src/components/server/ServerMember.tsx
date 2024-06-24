'use client'

import type { SelectMember, SelectProfile, SelectServer } from '@/db/schema'
import { cn } from '@/lib/utils'
import { type LucideIcon, ShieldAlert, ShieldCheck } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import type { MemberRoles } from '../../../types'
import UserAvatar from '../UserAvatar'

type ServerMemberProps = {
  member: SelectMember & { profile: SelectProfile }
  server: SelectServer
  role: MemberRoles
}

const roleIconMap: { [key in MemberRoles]: LucideIcon | null } = {
  GUEST: null,
  MODERATOR: ShieldCheck,
  ADMIN: ShieldAlert,
} as const

function ServerMember({ member, server, role }: ServerMemberProps) {
  const router = useRouter()
  const params = useParams()

  const Icon = roleIconMap[member.role]

  const onClick = () => {
    router.push(`/servers/${server.id}/conversation/${member.id}`)
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group mb-1 flex w-full items-center gap-x-2 rounded-md px-2 py-2 transition hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50',
        params?.memberId === member.id ? 'bg-zinc-700/20 dark:bg-zinc-700' : null,
      )}
    >
      <UserAvatar src={member.profile.imageUrl} className="h-8 w-8" />

      <p
        className={cn(
          'text-sm font-semibold text-zinc-500 transition group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300',
          params?.memberId === member.id
            ? 'text-primary dark:text-zinc-200 dark:group-hover:text-white'
            : null,
        )}
      >
        {member.profile.name}
      </p>

      {Icon && (
        <Icon
          className={cn(
            'ml-auto h-4 w-4',
            member.role === 'MODERATOR' ? 'text-indigo-500' : null,
            member.role === 'ADMIN' ? 'text-rose-500' : null,
          )}
        />
      )}
    </button>
  )
}

export default ServerMember
