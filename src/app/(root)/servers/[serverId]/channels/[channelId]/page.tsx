import ChatHeader from '@/components/chat/ChatHeader'
import ChatInput from '@/components/chat/ChatInput'
import ChatMessages from '@/components/chat/ChatMessages'
import { db } from '@/db'
import { Channel, Member } from '@/db/schema'
import { getProfile } from '@/lib/getProfile'
import { redirectToSignIn } from '@clerk/nextjs'
import { and, eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'

interface ChannelPageProps {
  params: {
    serverId: string
    channelId: string
  }
}

async function ChannelPage({ params }: ChannelPageProps) {
  const profile = await getProfile()
  if (!profile) {
    return redirectToSignIn()
  }

  const member = await db
    .select()
    .from(Member)
    .where(and(eq(Member.serverId, params.serverId), eq(Member.profileId, profile.id)))
    .then(res => res[0])

  if (!member) {
    redirect('/')
  }

  const channel = await db
    .select()
    .from(Channel)
    .where(and(eq(Channel.serverId, params.serverId), eq(Channel.id, params.channelId)))
    .then(res => res[0])

  if (!channel) {
    redirect('/')
  }

  return (
    <div className="flex h-full flex-col bg-white dark:bg-[#313338]">
      <ChatHeader
        serverId={params.serverId}
        name={channel.name}
        type="channel"
        // imageUrl={profile.imageUrl}
      />

      <ChatMessages
        apiUrl={`/api/servers/${params.serverId}/channels/${params.channelId}/messages`}
        chatId={channel.id}
        name={channel.name}
        type="channel"
        member={member}
        paramKey="channelId"
        paramValue={channel.id}
        socketUrl="/api/socket/messages"
        socketQuery={{ serverId: params.serverId, channelId: params.channelId }}
      />

      <ChatInput
        name={channel.name}
        type="channel"
        socketUrl="/api/socket/messages"
        socketQuery={{ serverId: params.serverId, channelId: params.channelId }}
      />
    </div>
  )
}

export default ChannelPage
