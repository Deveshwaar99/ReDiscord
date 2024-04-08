import { db } from '@/db'
import { getProfile } from '@/lib/getProfile'
import { redirect } from 'next/navigation'
import ServerSidebarHeader from './ServerSidebarHeader'

interface ServerSidebarProps {
  serverId: string
}

async function ServerSidebar({ serverId }: ServerSidebarProps) {
  const profile = await getProfile()

  if (!profile) {
    return redirect('/')
  }

  const server = await db.query.Server.findFirst({
    where: (Server, { eq }) => eq(Server.id, serverId),
    with: {
      channels: {
        orderBy: (channels, { asc }) => [asc(channels.createdAt)],
      },
      members: {
        with: {
          profile: true,
        },
        orderBy: (members, { asc }) => [asc(members.role)],
      },
    },
  })

  if (!server) {
    return redirect('/')
  }

  const textChannels = server.channels.filter(channel => channel.type === 'TEXT')
  const audioChannels = server.channels.filter(channel => channel.type === 'AUDIO')
  const videoChannels = server.channels.filter(channel => channel.type === 'VIDEO')
  const members = server.members.filter(member => member.profileId !== profile.id)

  const role = server.members.find(member => member.profileId === profile.id)?.role
  return (
    <div className="flex h-full w-full flex-col bg-[#F2F3F5] text-primary dark:bg-[#2B2D31]">
      <ServerSidebarHeader server={server} role={role} />
    </div>
  )
}

export default ServerSidebar
