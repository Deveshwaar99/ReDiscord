import { db } from '@/db/index'
import { Profile, Server } from '@/db/schema'
import { auth } from '@clerk/nextjs'
import { eq } from 'drizzle-orm'

export async function getProfile() {
  const { userId } = auth()

  if (!userId) return null

  const [profile] = await db.select().from(Profile).where(eq(Profile.clerkId, userId))
  return profile
}
