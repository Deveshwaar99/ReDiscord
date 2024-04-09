import { db } from '@/db'
import { Channel, Member, Server } from '@/db/schema'
import { getProfile } from '@/lib/getProfile'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { name, imageUrl } = await req.json()

    const profile = await getProfile()
    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!name || !imageUrl) {
      return NextResponse.json({ error: 'Name and imageUrl are required' }, { status: 400 })
    }

    const createServerResult = await db.transaction(async tx => {
      // Assuming 'serverInsertResult' is the result of the first insert operation
      const [serverInsertResult] = await tx
        .insert(Server)
        .values({
          profileId: profile.id,
          name,
          imageUrl,
        })
        .returning()

      const serverId = serverInsertResult.id

      // Insert related records in 'channels' and 'members' tables using the transaction object 'tx'
      await tx.insert(Channel).values({
        name: 'general',
        profileId: profile.id,
        serverId: serverId,
      })

      await tx.insert(Member).values({
        profileId: profile.id,
        role: 'ADMIN',
        serverId: serverId,
      })

      return serverInsertResult
    })

    return NextResponse.json({ data: createServerResult }, { status: 201 })
  } catch (error) {
    console.error('--Create Server Error--', error)
    NextResponse.json({ error: 'Failed to create server' }, { status: 500 })
  }
}
