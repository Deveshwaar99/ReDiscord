import ServerSidebar from '@/components/server/ServerSidebar'
import { db } from '@/db'
import { Member } from '@/db/schema'
import { getProfile } from '@/lib/getProfile'
import { auth } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'

async function ServerLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { serverId: string }
}) {
  const profile = await getProfile()
  if (!profile) return auth().redirectToSignIn()

  const memberSql = db.select().from(Member).where(eq(Member.profileId, profile.id))

  //verify server and the member exists
  const matchingServer = await db.query.Server.findFirst({
    where: (Server, { eq, and, exists }) => and(eq(Server.id, params.serverId), exists(memberSql)),
  })
  if (!matchingServer) redirect('/')

  return (
    <div className="h-full">
      <div className="fixed inset-y-0 z-20 hidden h-full w-60 flex-col md:flex">
        <ServerSidebar serverId={matchingServer.id} />
      </div>
      <main className="h-full md:pl-60">{children}</main>
    </div>
  )
}

export default ServerLayout
