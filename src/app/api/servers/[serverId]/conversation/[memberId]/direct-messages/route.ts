import { db } from '@/db'
import { DirectMessage, Member, Profile } from '@/db/schema'
import { getProfile } from '@/lib/getProfile'
import { and, desc, eq, lt } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'
import { Dir } from 'node:fs'
import { z } from 'zod'

const batchSize = 10

const paramsSchema = z.object({
  serverId: z.string().length(12, { message: 'Not a valid serverId' }),
  memberId: z.string().length(12, { message: 'Not a valid memberId' }),
  conversationId: z.string().length(12, { message: 'Not a vaild conversationId' }),
  cursor: z
    .union([
      z.number(),
      z.string().transform(val => {
        const parsed = Number.parseInt(val, 10)
        // biome-ignore lint/suspicious/noGlobalIsNan: <explanation>
        return isNaN(parsed) ? undefined : parsed
      }),
    ])
    .optional()
    .catch(undefined),
})

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: { serverId: string; memberId: string }
  },
) {
  try {
    const profile = await getProfile()
    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const urlParams = paramsSchema.parse({
      ...params,
      conversationId: searchParams.get('conversationId'),
      cursor: searchParams.get('cursor'),
    })
    //[TODO]--Do a chack to validate whether the profile is a valid member of the server and the conversation exists in the server
    const messagesWithMemberAndProfile = await db
      .select({
        messageId: DirectMessage.id,
        content: DirectMessage.content,
        fileUrl: DirectMessage.fileUrl,
        deleted: DirectMessage.deleted,
        createdAt: DirectMessage.createdAt,
        updatedAt: DirectMessage.updatedAt,
        conversationId: DirectMessage.conversationId,
        memberId: DirectMessage.memberId,
        memberRole: Member.role,
        profileName: Profile.name,
        profileImage: Profile.imageUrl,
      })
      .from(DirectMessage)
      .where(
        urlParams?.cursor
          ? and(
              eq(DirectMessage.conversationId, urlParams.conversationId),
              lt(DirectMessage.id, urlParams.cursor),
            )
          : eq(DirectMessage.conversationId, urlParams.conversationId),
      )
      .orderBy(desc(DirectMessage.id))
      .limit(batchSize)
      .innerJoin(Member, eq(Member.id, DirectMessage.memberId))
      .innerJoin(Profile, eq(Profile.id, Member.profileId))
    let nextCursor = null

    if (messagesWithMemberAndProfile.length === batchSize) {
      nextCursor = messagesWithMemberAndProfile[batchSize - 1].messageId
    }

    return NextResponse.json({ items: messagesWithMemberAndProfile, nextCursor })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 })
    }
    console.error('[GET-DIRECT_MESSAGES]', error)
    return NextResponse.json({ error: 'Internal server Error' }, { status: 500 })
  }
}
