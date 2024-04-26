import { db } from '@/db'
import { Channel, Member, Server } from '@/db/schema'
import { getProfile } from '@/lib/getProfile'
import { and, eq, exists, or } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const validateChannelData = z.object({
  name: z
    .string()
    .min(5)
    .max(15)
    .refine(val => val !== 'general', {
      message: "The name cannot be 'general'",
    }),
  type: z.enum(['AUDIO', 'TEXT', 'VIDEO']),
})

export async function POST(req: NextRequest, { params }: { params: { serverId: string } }) {
  try {
    const requestData = await req.json()
    const validatedData = validateChannelData.parse(requestData)

    // Access the validated data
    const { name, type } = validatedData

    const profile = await getProfile()
    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    //Verify the member in the server
    const memberSql = db
      .select()
      .from(Member)
      .where(
        and(
          eq(Member.profileId, profile.id),
          or(eq(Member.role, 'ADMIN'), eq(Member.role, 'MODERATOR'))
        )
      )
    const [foundServer] = await db
      .select()
      .from(Server)
      .where(and(eq(Server.id, params.serverId), exists(memberSql)))

    if (!foundServer) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
    }

    const [createdChannel] = await db
      .insert(Channel)
      .values({ name, type, serverId: params.serverId, profileId: profile.id })
      .returning()

    return NextResponse.json(createdChannel)
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Handle validation errors
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('--Create Channel Error--', error)
    NextResponse.json({ error: 'Failed to create channel' }, { status: 500 })
  }
}
