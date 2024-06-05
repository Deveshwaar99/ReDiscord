import { db } from '@/db'
import { Channel, Member, Message, Server } from '@/db/schema'
import { getProfile } from '@/lib/getProfile'
import { and, eq, exists } from 'drizzle-orm'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

const messageBodySchema = z.object({
  content: z.string().min(1),
  fileUrl: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const profile = await getProfile()
    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const searchParams = req.nextUrl.searchParams
    const query = {
      serverId: searchParams.get('serverId'),
      channelId: searchParams.get('channelId'),
    }

    if (!query.serverId || !query.channelId) {
      return NextResponse.json({ error: 'Missing required params' }, { status: 400 })
    }

    const validatedData = messageBodySchema.safeParse(await req.json())
    if (!validatedData.success) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
    }

    const body = validatedData.data

    // [CHECK]: channel belongs to the server
    const channelExistsInServer = db
      .select()
      .from(Channel)
      .where(and(eq(Channel.id, query.channelId), eq(Channel.serverId, Server.id)))

    const serverWithMember = await db
      .select()
      .from(Server)
      .where(and(eq(Server.id, query.serverId), exists(channelExistsInServer)))
      .innerJoin(Member, and(eq(Member.serverId, Server.id), eq(Member.profileId, profile.id))) //Verify member belongs to the  server
      .then(res => res[0])

    if (!serverWithMember || !serverWithMember.server || !serverWithMember.member) {
      return NextResponse.json({ error: 'Server, member, or channel not found' }, { status: 404 })
    }

    const message = await db
      .insert(Message)
      .values({
        content: body.content,
        fileUrl: body.fileUrl,
        channelId: query.channelId,
        memberId: serverWithMember.member.id,
      })
      .returning()
      .then(res => res[0])

    return NextResponse.json({ message }, { status: 200 })
  } catch (error) {
    console.error('[MESSAGES_POST]', error)
    return NextResponse.json({ error: 'Internal Server error' }, { status: 500 })
  }
}
