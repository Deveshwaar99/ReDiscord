import { db } from '@/db'
import { Member, Server } from '@/db/schema'
import { getProfile } from '@/lib/getProfile'
import { and, eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { serverId: string; memberId: string } }
) {
  try {
    const profile = await getProfile()
    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { role } = await req.json()
    if (!role) {
      return NextResponse.json({ error: 'Role is required' }, { status: 400 })
    }
    if (role !== 'GUEST' && role !== 'MODERATOR') {
      return NextResponse.json({ error: 'Invalid Role type' }, { status: 400 })
    }
    //check for valid server and member
    const server = await db.query.Server.findFirst({
      where: and(eq(Server.id, params.serverId), eq(Server.profileId, profile.id)),
      with: { members: { where: eq(Member.id, params.memberId) } },
    })

    if (!server || server.members.length === 0) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
    }

    // Admin role cannot be changed
    if (server.profileId === params.memberId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    //update the role
    const [updatedMember] = await db
      .update(Member)
      .set({ role })
      .where(eq(Member.id, server.members[0].id))
      .returning()

    // fetch updated server
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
    const errorMessage = getErrorMessage(params)
    console.error(errorMessage, error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}

function getErrorMessage(params: { serverId: string; memberId: string }) {
  return `Error in PATCH /servers/${params.serverId}/members/${params.memberId}/role`
}
