import { db } from '@/db'
import { Member, Message, Profile } from '@/db/schema'
import { getProfile } from '@/lib/getProfile'
import { and, desc, eq, lt } from 'drizzle-orm'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

const batchSize = 10

const paramsSchema = z.object({
  serverId: z.string().length(12),
  channelId: z.string().length(12),
})

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: { serverId: string; channelId: string }
  },
) {
  try {
    const profile = await getProfile()
    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const cursor = Number(searchParams.get('cursor'))
    params = paramsSchema.parse({ ...params })

    const messageWithMemberAndProfile = await db
      .select({
        messageId: Message.id,
        content: Message.content,
        fileUrl: Message.fileUrl,
        deleted: Message.deleted,
        createdAt: Message.createdAt,
        updatedAt: Message.updatedAt,
        channelId: Message.channelId,
        memberId: Message.memberId,
        memberRole: Member.role,
        profileName: Profile.name,
        profileImage: Profile.imageUrl,
      })
      .from(Message)
      .where(
        cursor
          ? and(eq(Message.channelId, params.channelId), lt(Message.id, cursor))
          : eq(Message.channelId, params.channelId),
      )
      .orderBy(desc(Message.id))
      .limit(batchSize)
      .leftJoin(Member, eq(Message.memberId, Member.id))
      .leftJoin(Profile, eq(Member.profileId, Profile.id))

    let nextCursor = null

    if (messageWithMemberAndProfile.length === batchSize) {
      nextCursor = messageWithMemberAndProfile[batchSize - 1].messageId
    }

    return NextResponse.json({ items: messageWithMemberAndProfile, nextCursor })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 })
    }
    console.error('[GET-MESSAGES]', error)
    return NextResponse.json({ error: 'Internal server Error' }, { status: 500 })
  }
}
