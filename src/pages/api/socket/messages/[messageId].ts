import { db } from '@/db/pages-index'
import { Channel, Member, Message, Server } from '@/db/schema'
import { getProfilePages } from '@/lib/getProfile-pages'
import { and, eq } from 'drizzle-orm'
import type { NextApiRequest } from 'next'
import { z } from 'zod'
import { MemberRoles } from '../../../../../types'
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
    const {
      messageId: MessageIdString,
      serverId,
      channelId,
    } = schema.parse({
      ...req.query,
    })

    const messageId = Number(MessageIdString)

    const serverWithMember = await db
      .select({ member: Member })
      .from(Server)
      .where(eq(Server.id, serverId))
      .innerJoin(Member, and(eq(Member.serverId, Server.id), eq(Member.profileId, profile.id)))
      .then(res => res[0])

    if (!serverWithMember) {
      return res.status(404).json({ error: 'Server or member not found' })
    }

    const channelWithMessage = await db
      .select({ message: Message })
      .from(Channel)
      .where(and(eq(Channel.id, channelId), eq(Channel.serverId, serverId)))
      .innerJoin(
        Message,
        and(
          eq(Message.id, messageId),
          eq(Message.channelId, Channel.id),
          eq(Message.deleted, false),
        ),
      )
      .then(res => res[0])

    if (!channelWithMessage) {
      return res.status(404).json({ error: 'Channel or message not found' })
    }

    const isOwner = serverWithMember.member.id === channelWithMessage.message.memberId
    const isAdminOrModerator = [MemberRoles.ADMIN, MemberRoles.MODERATOR].includes(
      serverWithMember.member.role as MemberRoles,
    )

    const canModify = isOwner || isAdminOrModerator
    if (!canModify) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    let modifiedMessage: unknown

    if (req.method === 'DELETE') {
      modifiedMessage = await db
        .update(Message)
        .set({ deleted: true, content: 'This message has been deleted', fileUrl: null })
        .where(eq(Message.id, messageId))
        .returning()
        .then(res => res[0])
    }

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

    const updateKey = `chat:${channelId}:messages:update`
    res?.socket?.server?.io?.emit(updateKey, modifiedMessage)

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
