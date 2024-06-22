import { db } from '@/db/pages-index'
import { DirectMessage, Member, type selectDirectMessage } from '@/db/schema'
import { getProfilePages } from '@/lib/getProfile-pages'
import { createMessageObject } from '@/lib/utils'
import { and, eq, or } from 'drizzle-orm'
import type { NextApiRequest } from 'next'
import { z } from 'zod'
import type { MessageWithMemberAndProfile } from '../../../../../types'
import type { NextApiResponseServerIo } from '../io'

const paramsSchema = z.object({
  directMessageId: z
    .string()
    // biome-ignore lint/suspicious/noGlobalIsNan: <explanation>
    .refine((input: string) => !isNaN(Number(input)), { message: 'Invialid message id' })
    .transform(input => Number.parseInt(input, 10)),
  conversationId: z.string().length(12, { message: 'Invalid conversationId' }),
  memberOneId: z.string().length(12, { message: 'Invalid MemberOneId' }),
  memberTwoId: z.string().length(12, { message: 'Invalid MemberTwoId' }),
})
const contentSchema = z.object({ content: z.string().min(1, { message: 'content is missing' }) })

async function handler(req: NextApiRequest, res: NextApiResponseServerIo) {
  if (req.method !== 'PATCH' && req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const profile = await getProfilePages(req)
    if (!profile) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    const query = paramsSchema.parse({
      ...req.query,
    })

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

    const directMessage = await db
      .select()
      .from(DirectMessage)
      .where(eq(DirectMessage.id, query.directMessageId))
      .then(res => res[0])

    if (!directMessage) {
      return res.status(404).json({ error: 'Message not found' })
    }

    const isOwner = directMessage.memberId === authenticatedMember.id //Owner can EDIT/DELETE the message

    if (!isOwner) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    let modifiedMessage: selectDirectMessage | null = null

    //Only the owner can EDIT
    if (req.method === 'PATCH') {
      const { content } = contentSchema.parse({ ...req.body })

      modifiedMessage = await db
        .update(DirectMessage)
        .set({ content })
        .where(eq(DirectMessage.id, query.directMessageId))
        .returning()
        .then(res => res[0])
    }

    if (req.method === 'DELETE') {
      modifiedMessage = await db
        .update(DirectMessage)
        .set({ deleted: true, content: 'This message has been deleted', fileUrl: null })
        .where(eq(DirectMessage.id, query.directMessageId))
        .returning()
        .then(res => res[0])
    }

    //  To satisfy typescript
    if (!modifiedMessage) {
      throw new Error('Modified message not found')
    }

    const messageWithMemberAndProfile: MessageWithMemberAndProfile = createMessageObject({
      message: modifiedMessage,
      member: authenticatedMember,
      profile,
    })

    const updateKey = `chat:${query.conversationId}:messages:update`
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
