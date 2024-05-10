import ServerSidebar from '@/components/server/ServerSidebar'
import { db } from '@/db'
import { Member } from '@/db/schema'
import { getProfile } from '@/lib/getProfile'
import { redirectToSignIn } from '@clerk/nextjs'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { MemberRoles } from '../../../../../../types'

async function ServerLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { serverId: string }
}) {
  const profile = await getProfile()
  if (!profile) return redirectToSignIn()

  const memberSql = db.select().from(Member).where(eq(Member.profileId, profile.id))

  const server = await db.query.Server.findFirst({
    where: (Server, { eq, and, exists }) => and(eq(Server.id, params.serverId), exists(memberSql)),
    with: {
      channels: {
        orderBy: (channels, { asc }) => [asc(channels.createdAt)],
      },
      members: {
        with: {
          profile: true,
        },
        orderBy: (members, { asc }) => [asc(members.role)],
      },
    },
  })

  if (!server) redirect('/')

  const role = server.members.find(member => member.profileId === profile.id)?.role
  return (
    <div className="h-full">
      <div className="fixed inset-y-0 z-20 hidden h-full w-60 flex-col md:flex">
        <ServerSidebar server={server} role={MemberRoles[role!]} />
      </div>
      <main className="h-full md:pl-60">{children}</main>
    </div>
  )
}

export default ServerLayout
