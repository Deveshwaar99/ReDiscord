import { db } from '@/db/pages-index'
import { Profile, type SelectProfile } from '@/db/schema'
import { getAuth } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm'
import type { NextApiRequest } from 'next'

export async function getProfilePages(req: NextApiRequest): Promise<SelectProfile | null> {
  const { userId } = getAuth(req)

  if (!userId) return null

  const profile = await db
    .select()
    .from(Profile)
    .where(eq(Profile.clerkId, userId))
    .then(res => res[0])

  return profile
}
