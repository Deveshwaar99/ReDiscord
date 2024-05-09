import { db } from '@/db'
import { Channel, Member, Server } from '@/db/schema'
import { getProfile } from '@/lib/getProfile'
import { and, eq, exists, ne, or } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { serverId: string; channelId: string } }
) {
  try {
    const profile = await getProfile()
    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    //Verify SERVER and MEMBER along with MEMBER ROLE
    const memberSql = db
      .select()
      .from(Member)
      .where(
        and(
          eq(Member.profileId, profile.id),
          or(eq(Member.role, 'ADMIN'), eq(Member.role, 'MODERATOR'))
        )
      )

    const channelSql = db
      .select()
      .from(Channel)
      .where(and(eq(Channel.id, params.channelId), ne(Channel.name, 'general')))

    const server = await db
      .select()
      .from(Server)
      .where(and(eq(Server.id, params.serverId), exists(memberSql), exists(channelSql)))
      .then(res => res[0])

    if (!server) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
    }

    await db.delete(Channel).where(eq(Channel.id, params.channelId))

    return NextResponse.json({ message: 'Channel deleted successfully' })
  } catch (error) {
    console.error('[--Delete Channel Error--]', error)
    NextResponse.json({ error: 'Failed to delete channel' }, { status: 500 })
  }
}
