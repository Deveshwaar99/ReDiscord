import { db } from '@/db'
import { Channel } from '@/db/schema'
import { getProfile } from '@/lib/getProfile'
import { auth } from '@clerk/nextjs/server'
import { and, eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'

interface ServerIdPageProps {
  params: { serverId: string }
}

async function ServerIdPage({ params }: ServerIdPageProps) {
  const profile = await getProfile()
  if (!profile) return auth().redirectToSignIn()

  const generalChannel = await db
    .select()
    .from(Channel)
    .where(and(eq(Channel.serverId, params.serverId), eq(Channel.name, 'general')))
    .then(res => res[0])

  if (!generalChannel) {
    return null
  }

  return redirect(`/servers/${params.serverId}/channels/${generalChannel.id}`)
}

export default ServerIdPage
