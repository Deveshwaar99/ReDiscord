import { db } from '@/db'
import { Channel, Member, Server } from '@/db/schema'
import { getProfile } from '@/lib/getProfile'
import { verifyChannelData } from '@/lib/utils'
import { and, eq, exists, or } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest, { params }: { params: { serverId: string } }) {
  try {
    const requestData = await req.json()
    const validatedData = verifyChannelData(requestData)

    if (!validatedData.success) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
    }

    const { name, type } = validatedData.data

    const profile = await getProfile()
    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    //Verify the member in the server
    const memberSql = db
      .select()
      .from(Member)
      .where(
        and(
          eq(Member.profileId, profile.id),
          or(eq(Member.role, 'ADMIN'), eq(Member.role, 'MODERATOR'))
        )
      )
    const [foundServer] = await db
      .select()
      .from(Server)
      .where(and(eq(Server.id, params.serverId), exists(memberSql)))

    if (!foundServer) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
    }

    const [createdChannel] = await db
      .insert(Channel)
      .values({ name, type, serverId: params.serverId, profileId: profile.id })
      .returning()

    return NextResponse.json(createdChannel)
  } catch (error) {
    console.error('[--Create Channel Error--]', error)
    NextResponse.json({ error: 'Failed to create channel' }, { status: 500 })
  }
}
