'use client'

import { SelectMember, SelectProfile, SelectServer } from '@/db/schema'
import { cn } from '@/lib/utils'
import { LucideIcon, ShieldAlert, ShieldCheck } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { MemberRoles } from '../../../types'
import UserAvatar from '../UserAvatar'

type ServerMemberProps = {
  member: SelectMember & { profile: SelectProfile }
  server: SelectServer
  role: MemberRoles | undefined
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

  return (
    <button
      className={cn(
        'group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1',
        params?.memberId === member.id ? 'bg-zinc-700/20 dark:bg-zinc-700' : null
      )}
    >
      <UserAvatar src={member.profile.imageUrl!} className="h-8 w-8" />

      <p
        className={cn(
          'text-sm font-semibold text-zinc-500 transition group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300',
          params,
          params?.memberId === member.id
            ? 'text-primary dark:text-zinc-200 dark:group-hover:text-white'
            : null
        )}
      >
        {member.profile.name}
      </p>

      {Icon && (
        <Icon
          className={cn(
            ' h-4 w-4 ml-auto',
            member.role === 'MODERATOR' ? ' text-indigo-500' : null,
            member.role === 'ADMIN' ? ' text-rose-500' : null
          )}
        />
      )}
    </button>
  )
}

export default ServerMember
