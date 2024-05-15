import ChatHeader from '@/components/chat/ChatHeader'
import { db } from '@/db'
import { Member } from '@/db/schema'
import { getOrCreateConversation } from '@/lib/conversations'
import { getProfile } from '@/lib/getProfile'
import { redirectToSignIn } from '@clerk/nextjs'
import { and, eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'

async function MemberIdPage({ params }: { params: { serverId: string; memberId: string } }) {
  const profile = await getProfile()
  if (!profile) {
    return redirectToSignIn()
  }

  //Check whether its a loggedIn user is a valid member of the server
  const memberOne = await db.query.Member.findFirst({
    where: and(eq(Member.serverId, params.serverId), eq(Member.profileId, profile.id)),
    with: { profile: true },
  })
  if (!memberOne) {
    redirect('/')
  }

  //Checker whether the memberId recieved via Url is a valid member of the server
  const memberTwo = await db.query.Member.findFirst({
    where: and(eq(Member.serverId, params.serverId), eq(Member.id, params.memberId)),
    with: { profile: true },
  })
  if (!memberTwo) {
    redirect('/')
  }

  const conversation = await getOrCreateConversation(memberOne.id, memberTwo.id)
  if (!conversation) {
    return redirect(`/servers/${params.serverId}`)
  }

  return (
    <div className="flex h-full flex-col bg-white dark:bg-[#313338]">
      <ChatHeader
        serverId={params.serverId}
        name={memberTwo.profile.name}
        imageUrl={memberTwo.profile.imageUrl}
        type="conversation"
      />
    </div>
  )
}

export default MemberIdPage
