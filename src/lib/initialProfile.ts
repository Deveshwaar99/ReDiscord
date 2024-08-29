import 'server-only'

import { db } from '@/db'
import { Profile, type SelectProfile } from '@/db/schema'
import { currentUser, redirectToSignIn } from '@clerk/nextjs'
import { eq } from 'drizzle-orm'

export async function initialProfile(): Promise<SelectProfile> {
  const user = await currentUser()
  if (!user) {
    return redirectToSignIn()
  }

  const [profile] = await db.select().from(Profile).where(eq(Profile.clerkId, user.id))
  if (profile) {
    return profile
  }

  const [newProfile] = await db
    .insert(Profile)
    .values({
      clerkId: user.id,
      name: `${user.firstName} ${user.lastName}`,
      imageUrl: user.imageUrl,
      email: user.emailAddresses[0].emailAddress,
    })
    .returning()

  return newProfile
}
