import ChatHeader from '@/components/chat/ChatHeader'
import ChatInput from '@/components/chat/ChatInput'
import ChatMessages from '@/components/chat/ChatMessages'
import { db } from '@/db'
import { Channel, Member } from '@/db/schema'
import { getProfile } from '@/lib/getProfile'
import { redirectToSignIn } from '@clerk/nextjs'
import { and, eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { ChannelTypes } from '../../../../../../../types'

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

  const memberAndChannel = await db
    .select()
    .from(Member)
    .where(and(eq(Member.profileId, profile.id), eq(Member.serverId, params.serverId)))
    .innerJoin(
      Channel,
      and(eq(Channel.serverId, params.serverId), eq(Channel.id, params.channelId)),
    )
    .then(res => res[0])

  if (!memberAndChannel) {
    redirect('/')
  }
  const { member, channel } = memberAndChannel

  return (
    <div className="flex h-full flex-col bg-white dark:bg-[#313338]">
      <ChatHeader
        serverId={params.serverId}
        name={channel.name}
        type="channel"
        // imageUrl={profile.imageUrl}
      />

      {channel.type === ChannelTypes.TEXT && (
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
      )}
      {channel.type === ChannelTypes.AUDIO && <></>}
      {channel.type === ChannelTypes.VIDEO && <></>}

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
