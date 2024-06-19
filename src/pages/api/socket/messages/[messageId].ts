import { db } from '@/db/pages-index'
import { Channel, Member, Message, type SelectMessage, Server, Profile } from '@/db/schema'
import { getProfilePages } from '@/lib/getProfile-pages'
import { and, eq } from 'drizzle-orm'
import type { NextApiRequest } from 'next'
import { z } from 'zod'
import { MemberRoles, type MessageWithMemberAndProfile } from '../../../../../types'
import type { NextApiResponseServerIo } from '../io'

const schema = z.object({
  messageId: z
    .string()
    // biome-ignore lint/suspicious/noGlobalIsNan: <explanation>
    .refine((input: string) => !isNaN(Number(input)), { message: 'Invialid message id' }),
  serverId: z.string().length(12),
  channelId: z.string().length(12),
})

async function handler(req: NextApiRequest, res: NextApiResponseServerIo) {
  if (req.method !== 'PATCH' && req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const profile = await getProfilePages(req)
    if (!profile) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    const query = schema.parse({
      ...req.query,
    })

    const messageId = Number(query.messageId) // Message id is of type number in db

    //Check whether the authenticated [Profile] belongs to the [Server] and is a valid [Member] of the Server
    const serverWithMember = await db
      .select({ member: Member })
      .from(Server)
      .where(eq(Server.id, query.serverId))
      .innerJoin(Member, and(eq(Member.serverId, Server.id), eq(Member.profileId, profile.id)))
      .then(res => res[0])

    if (!serverWithMember) {
      return res.status(404).json({ error: 'Server or member not found' })
    }

    //Check whether Channel belongs to the Server & get the [Message] that belongs to the channel with [messageOwner,messageOwnerProfile]
    const channelWithMessage = await db
      .select({ message: Message, member: Member, profile: Profile })
      .from(Channel)
      .where(and(eq(Channel.id, query.channelId), eq(Channel.serverId, query.serverId)))
      .innerJoin(
        Message,
        and(
          eq(Message.id, messageId),
          eq(Message.channelId, Channel.id),
          eq(Message.deleted, false),
        ),
      )
      .innerJoin(Member, eq(Member.id, Message.memberId))
      .innerJoin(Profile, eq(Profile.id, Member.profileId))
      .then(res => res[0])

    if (!channelWithMessage) {
      return res.status(404).json({ error: 'Channel or message not found' })
    }

    const isOwner = serverWithMember.member.id === channelWithMessage.message.memberId //Owner can EDIT/DELETE the message

    const isAdminOrModerator = [MemberRoles.ADMIN, MemberRoles.MODERATOR].includes(
      serverWithMember.member.role as MemberRoles,
    ) //  Admin/Moderator can DELETE the message

    const canModify = isOwner || isAdminOrModerator
    if (!canModify) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    let modifiedMessage: SelectMessage | null = null

    //Only the owner can EDIT
    if (req.method === 'PATCH') {
      const { content } = z.object({ content: z.string().min(1) }).parse({ ...req.body })
      if (!isOwner) {
        return res.status(401).json({ error: 'Unauthorized' })
      }
      modifiedMessage = await db
        .update(Message)
        .set({ content })
        .where(eq(Message.id, messageId))
        .returning()
        .then(res => res[0])
    }

    if (req.method === 'DELETE') {
      modifiedMessage = await db
        .update(Message)
        .set({ deleted: true, content: 'This message has been deleted', fileUrl: null })
        .where(eq(Message.id, messageId))
        .returning()
        .then(res => res[0])
    }

    //  To satisfy typescript
    if (!modifiedMessage) {
      throw new Error('Modified message not found')
    }

    const messageWithMemberAndProfile: MessageWithMemberAndProfile = {
      messageId: modifiedMessage.id,
      content: modifiedMessage.content,
      fileUrl: modifiedMessage.fileUrl,
      deleted: modifiedMessage.deleted,
      createdAt: modifiedMessage.createdAt,
      updatedAt: modifiedMessage.updatedAt,
      channelId: query.channelId,
      memberId: channelWithMessage.member.id,
      memberRole: MemberRoles[channelWithMessage.member.role],
      profileName: channelWithMessage.profile.name,
      profileImage: channelWithMessage.profile.imageUrl,
    }

    const updateKey = `chat:${query.channelId}:messages:update`
    res?.socket?.server?.io?.emit(updateKey, messageWithMemberAndProfile)

    return res.status(200).send('OK')
  } catch (error) {
    console.log(error)
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.flatten().fieldErrors })
    }

    console.error('[MESSAGE_EDIT|DELETE]', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

export default handler
