import { db } from '@/db'
import { Member, Server } from '@/db/schema'
import { getProfile } from '@/lib/getProfile'
import { and, eq, exists } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { serverId: string; memberId: string } }
) {
  try {
    const profile = await getProfile()
    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const memberSql = db.select().from(Member).where(eq(Member.id, params.memberId))
    const [server] = await db
      .select()
      .from(Server)
      .where(
        and(eq(Server.id, params.serverId), eq(Server.profileId, profile.id), exists(memberSql))
      )

    if (!server) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
    }

    // Admin cannot be removed
    if (server.profileId === params.memberId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    //Delete the Member
    await db
      .delete(Member)
      .where(and(eq(Member.id, params.memberId), eq(Member.serverId, params.serverId)))

    //Return updated Server
    const updatedServer = await db.query.Server.findFirst({
      where: (Server, { eq }) => eq(Server.id, server.id),
      with: {
        channels: {
          orderBy: (channels, { asc }) => [asc(channels.createdAt)],
        },
        members: {
          with: {
            profile: true,
          },
          orderBy: (members, { asc }) => [asc(members.role)],
        },
      },
    })

    return NextResponse.json({ server: updatedServer })
  } catch (error) {
    console.error(`Error in DELETE /servers/${params.serverId}/members/${params.memberId}`, error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}
