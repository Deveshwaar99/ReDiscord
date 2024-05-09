import { db } from '@/db'
import 'server-only'

export async function getServerWithMembersAndChannels(serverId: string) {
  const server = await db.query.Server.findFirst({
    where: (Server, { eq }) => eq(Server.id, serverId),
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

  return server
}
