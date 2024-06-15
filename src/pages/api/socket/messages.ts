import { db } from '@/db'
import { Channel, Member, Message, Server } from '@/db/schema'
import { getProfilePages } from '@/lib/getProfile-pages'
import { and, eq, exists } from 'drizzle-orm'
import type { NextApiRequest } from 'next'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import type { NextApiResponseServerIo } from './io'

const querySchema = z.object({ serverId: z.string().length(12), channelId: z.string().length(12) })
const messageBodySchema = z.object({
  content: z.string().min(1),
  fileUrl: z.string().optional(),
})

export async function handler(req: NextApiRequest, res: NextApiResponseServerIo) {
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

    // [CHECK]: channel belongs to the server
    const channelExistsInServer = db
      .select()
      .from(Channel)
      .where(and(eq(Channel.id, query.channelId), eq(Channel.serverId, query.serverId)))

    const serverWithMember = await db
      .select()
      .from(Server)
      .where(and(eq(Server.id, query.serverId), exists(channelExistsInServer)))
      .innerJoin(Member, and(eq(Member.profileId, profile.id), eq(Member.serverId, Server.id))) //Verify member belongs to the  server
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

    const channelKey = `chat:${query.channelId}:messages`
    res?.socket?.server?.io?.emit(channelKey, message)

    return res.status(200).send('OK')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.flatten().fieldErrors })
    }
    console.error('[MESSAGES_POST]', error)
    return NextResponse.json({ error: 'Internal Server error' }, { status: 500 })
  }
}
