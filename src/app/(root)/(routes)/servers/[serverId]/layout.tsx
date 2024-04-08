import ServerSidebar from '@/components/server/ServerSidebar'
import { db } from '@/db'
import { getProfile } from '@/lib/getProfile'
import { redirectToSignIn } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

async function ServerLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { serverId: string }
}) {
  const profile = await getProfile()
  if (!profile) return redirectToSignIn()

  const server = await db.query.Server.findFirst({
    where: (Server, { eq }) => eq(Server.id, params.serverId),
    with: {
      members: {
        where: (members, { eq }) => eq(members.profileId, profile.id),
      },
    },
  })
  if (!server) redirect('/')

  return (
    <div className="h-full">
      <div className="fixed inset-y-0 z-20 hidden h-full w-60 flex-col md:flex">
        <ServerSidebar serverId={server.id} />
      </div>
      <main className="h-full md:pl-60">{children}</main>
    </div>
  )
}

export default ServerLayout
