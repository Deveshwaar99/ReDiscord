import { db } from '@/db'
import { Server } from '@/db/schema'
import { getProfile } from '@/lib/getProfile'
import { and, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export async function PATCH(req: Request, { params }: { params: { serverId: string } }) {
  try {
    const profile = await getProfile()
    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!params.serverId) {
      return NextResponse.json({ error: 'Server ID missing' }, { status: 400 })
    }

    const [server] = await db
      .update(Server)
      .set({ inviteCode: uuidv4() })
      .where(and(eq(Server.id, params.serverId), eq(Server.profileId, profile.id)))
      .returning()

    return NextResponse.json(server)
  } catch (error) {
    console.error('--ServerId--', error)
    return NextResponse.json({ error: 'Inernal Error' }, { status: 500 })
  }
}
