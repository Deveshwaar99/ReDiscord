import 'server-only'

import { db } from '@/db'
import { Profile, type SelectProfile } from '@/db/schema'
import { auth } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm'
import { cache } from 'react'

export const getProfile = cache(async (): Promise<SelectProfile | null> => {
  const { userId } = auth()
  if (!userId) return null

  return await db
    .select()
    .from(Profile)
    .where(eq(Profile.clerkId, userId))
    .then(res => res[0])
})
