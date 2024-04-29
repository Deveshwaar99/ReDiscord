import { db } from '@/db'
import { Member, Server } from '@/db/schema'
import { getProfile } from '@/lib/getProfile'
import { and, eq, exists, ne } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(req: NextRequest, { params }: { params: { serverId: string } }) {
  try {
    const profile = await getProfile()
    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const memberSql = db.select().from(Member).where(eq(Member.profileId, profile.id))

    //Get matching server with mamber & and confirm its not the admin
    const [matchingServer] = await db
      .select()
      .from(Server)
      .where(
        and(eq(Server.id, params.serverId), ne(Server.profileId, profile.id), exists(memberSql))
      )

    if (!matchingServer) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
    }

    //Delete the Member
    await db
      .delete(Member)
      .where(and(eq(Member.serverId, params.serverId), eq(Member.profileId, profile.id)))

    return NextResponse.json({ message: 'success' })
  } catch (error) {
    console.error(`--Error in leave Server--`, error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}
