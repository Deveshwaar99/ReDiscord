import { db } from '@/db/pages-index'
import { Channel, Conversation, DirectMessage, Member, Message, Server } from '@/db/schema'
import { getProfilePages } from '@/lib/getProfile-pages'
import { and, eq, exists, or } from 'drizzle-orm'
import type { NextApiRequest } from 'next'
import { z } from 'zod'
import type { NextApiResponseServerIo } from '../io'
import type { MessageWithMemberAndProfile } from '../../../../../types'
import { createMessageObject } from '@/lib/utils'

const querySchema = z.object({
  conversationId: z.string().length(12, { message: 'Invalid conversationId' }),
  memberOneId: z.string().length(12, { message: 'Invalid MemberOneId' }),
  memberTwoId: z.string().length(12, { message: 'Invalid MemberTwoId' }),
})
const messageBodySchema = z.object({
  content: z.string().min(1, { message: 'content is missing' }),
  fileUrl: z.string().optional(),
})

export default async function handler(req: NextApiRequest, res: NextApiResponseServerIo) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const profile = await getProfilePages(req)
    if (!profile) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const query = querySchema.parse(req.query)
    const body = messageBodySchema.parse(req.body)

    if (query.memberOneId === query.memberTwoId) {
      return res.status(404).json({ error: 'Invalid MemberOneId or MemberTwoId' })
    }

    //Get the initiator member
    const authenticatedMember = await db
      .select()
      .from(Member)
      .where(
        and(
          eq(Member.profileId, profile.id),
          or(eq(Member.id, query.memberOneId), eq(Member.id, query.memberTwoId)),
        ),
      )
      .then(res => res[0])

    if (!authenticatedMember) {
      return res.status(404).json({ error: 'Unauthorized' })
    }

    const conversation = await db
      .select()
      .from(Conversation)
      .where(eq(Conversation.id, query.conversationId))
      .then(res => res[0])

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' })
    }
    const conversationMembersSet = new Set([conversation.memberOneId, conversation.memberTwoId])

    if (
      !conversationMembersSet.has(query.memberOneId) &&
      !conversationMembersSet.has(query.memberTwoId)
    ) {
      return res.status(404).json({ error: 'Invalid MemberOneId or MemberTwoId' })
    }

    const directMessage = await db
      .insert(DirectMessage)
      .values({
        content: body.content,
        fileUrl: body.fileUrl,
        memberId: authenticatedMember.id,
        conversationId: conversation.id,
        deleted: false,
      })
      .returning()
      .then(res => res[0])

    const messageWithMemberAndProfile: MessageWithMemberAndProfile = createMessageObject({
      message: directMessage,
      member: authenticatedMember,
      profile,
    })
    const channelKey = `chat:${conversation.id}:messages`
    res?.socket?.server?.io?.emit(channelKey, messageWithMemberAndProfile)

    return res.status(200).send('OK')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.flatten().fieldErrors })
    }
    console.error('[MESSAGES_POST]', error)
    return res.status(500).json({ error: 'Internal Server error' })
  }
}
