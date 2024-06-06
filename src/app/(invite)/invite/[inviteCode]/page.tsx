import { db } from '@/db'
import { Member } from '@/db/schema'
import { getProfile } from '@/lib/getProfile'
import { redirectToSignIn } from '@clerk/nextjs/server'
import { and } from 'drizzle-orm'
import { notFound, redirect } from 'next/navigation'

async function InvitePage({ params }: { params: { inviteCode: string } }) {
  const { inviteCode } = params
  // const decodedInviteCode = decodeURIComponent(inviteCode)
  const profile = await getProfile()
  if (!profile) return redirectToSignIn()
  if (!inviteCode) {
    return redirect('/')
  }

  const existingServer = await db.query.Server.findFirst({
    where: (Server, { eq }) => and(eq(Server.inviteCode, inviteCode)),
    with: {
      members: {
        where: (members, { eq }) => eq(members.profileId, profile.id),
      },
    },
  })

  if (existingServer?.members.length) {
    return redirect(`/servers/${existingServer.id}`)
  }

  if (existingServer) {
    const [newMember] = await db
      .insert(Member)
      .values({ profileId: profile.id, serverId: existingServer.id })
      .returning()

    if (newMember) {
      return redirect(`/servers/${newMember.serverId}`)
    }
  }

  return notFound()
}

export default InvitePage
