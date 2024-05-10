import { db } from '@/db'
import { Server } from '@/db/schema'
import { getProfile } from '@/lib/getProfile'
import { verifyServerData } from '@/lib/utils'
import { and, eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest, { params }: { params: { serverId: string } }) {
  try {
    const requestData = await req.json()
    const validatedData = verifyServerData(requestData)
    if (!validatedData.success) {
      return NextResponse.json({ error: 'Name and imageUrl are required' }, { status: 400 })
    }

    const { name, imageUrl } = validatedData.data

    const profile = await getProfile()
    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [updatedServer] = await db
      .update(Server)
      .set({ name, imageUrl })
      .where(and(eq(Server.id, params.serverId), eq(Server.profileId, profile.id)))
      .returning()

    if (!updatedServer) {
      return NextResponse.json({ error: 'No server found' }, { status: 404 })
    }
    return NextResponse.json({ data: updatedServer }, { status: 200 })
  } catch (error) {
    console.error('--Server Update Error--', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}
