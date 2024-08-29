import { db } from '@/db'
import {
  type SelectMember,
  type SelectProfile,
  type SelectServer,
  Member,
  Server,
} from '@/db/schema'
import { asc, eq } from 'drizzle-orm'
import { cache } from 'react'
import 'server-only'

type MembersWithServers = {
  member: SelectMember
  server: SelectServer
}
const getMembersWithServers = async (profile: SelectProfile): Promise<MembersWithServers[]> => {
  return await db
    .select()
    .from(Member)
    .where(eq(Member.profileId, profile.id))
    .innerJoin(Server, eq(Server.id, Member.serverId))
    .orderBy(asc(Server.createdAt))
}

export const cachedGetMembersWithServers = cache(getMembersWithServers)
