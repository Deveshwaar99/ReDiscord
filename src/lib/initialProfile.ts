import 'server-only'

import { db } from '@/db'
import { Profile, type SelectProfile } from '@/db/schema'

import { auth, currentUser } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm'

export async function initialProfile(): Promise<SelectProfile> {
  const user = await currentUser()
  if (!user) {
    return auth().redirectToSignIn()
  }

  const profile = await db
    .select()
    .from(Profile)
    .where(eq(Profile.clerkId, user.id))
    .then(res => res[0])

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
