import { db } from '@/db'
import { Channel, Member } from '@/db/schema'
import { getProfile } from '@/lib/getProfile'
import { verifyChannelData } from '@/lib/utils'
import { and, eq, or } from 'drizzle-orm'
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
    const validMember = await db
      .select()
      .from(Member)
      .where(
        and(
          eq(Member.profileId, profile.id),
          eq(Member.serverId, params.serverId),
          or(eq(Member.role, 'ADMIN'), eq(Member.role, 'MODERATOR'))
        )
      )
      .then(res => res[0])

    if (!validMember) {
      return NextResponse.json(
        { error: 'You do not have permission to create a channel in this server' },
        { status: 403 }
      )
    }

    const newChannel = await db
      .insert(Channel)
      .values({ name, type, serverId: params.serverId, memberId: validMember.id })
      .returning()
      .then(res => res[0])

    return NextResponse.json(newChannel)
  } catch (error) {
    console.error('[--Create Channel Error--]', error)
    NextResponse.json({ error: 'Failed to create channel' }, { status: 500 })
  }
}
