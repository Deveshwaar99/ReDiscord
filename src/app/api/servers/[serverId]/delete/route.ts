import { db } from '@/db'
import { Server } from '@/db/schema'
import { getProfile } from '@/lib/getProfile'
import { and, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function DELETE(req: Request, { params }: { params: { serverId: string } }) {
  try {
    const profile = await getProfile()
    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!params.serverId) {
      return NextResponse.json({ error: 'Server Id is missing' }, { status: 400 })
    }

    const [deletedServer] = await db
      .delete(Server)
      .where(and(eq(Server.id, params.serverId), eq(Server.profileId, profile.id)))
      .returning()

    if (!deletedServer) {
      return NextResponse.json({ error: 'No server found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Server deleted successfully' })
  } catch (error) {
    console.error('--Delete Server Error--', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}
