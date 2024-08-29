import { db } from '@/db'
import { Channel, Member, Server } from '@/db/schema'
import { getProfile } from '@/lib/getProfile'
import { verifyServerData } from '@/lib/utils'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const requestData = await req.json()
    const validatedData = verifyServerData(requestData)
    if (!validatedData.success) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
    }

    const { name, imageUrl } = validatedData.data

    const profile = await getProfile()
    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!name || !imageUrl) {
      return NextResponse.json({ error: 'Name and imageUrl are required' }, { status: 400 })
    }

    const createServerResult = await db.transaction(async tx => {
      const newServer = await tx
        .insert(Server)
        .values({
          profileId: profile.id,
          name,
          imageUrl,
        })
        .returning()
        .then(res => res[0])

      const newMember = await tx
        .insert(Member)
        .values({
          profileId: profile.id,
          role: 'ADMIN',
          serverId: newServer.id,
        })
        .returning()
        .then(res => res[0])

      await tx.insert(Channel).values({
        name: 'general',
        memberId: newMember.id,
        serverId: newServer.id,
      })

      return newServer
    })

    return NextResponse.json({ data: createServerResult }, { status: 201 })
  } catch (error) {
    console.error('--Create Server Error--', error)
    NextResponse.json({ error: 'Failed to create server' }, { status: 500 })
  }
}
