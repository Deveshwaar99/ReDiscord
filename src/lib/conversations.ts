import 'server-only'

import { db } from '@/db'
import { Conversation } from '@/db/schema'
import { and, eq } from 'drizzle-orm'

export async function getOrCreateConversation(memberOneId: string, memberTwoId: string) {
  let conversation = await (findConversation(memberOneId, memberTwoId) ||
    findConversation(memberTwoId, memberOneId))

  if (!conversation) {
    conversation = await createConversation(memberOneId, memberTwoId)
  }
  return conversation
}

async function findConversation(memberOneId: string, memberTwoId: string) {
  const conversation = await db.query.Conversation.findFirst({
    where: and(
      eq(Conversation.memberOneId, memberOneId),
      eq(Conversation.memberTwoId, memberTwoId)
    ),
  })

  // const MemberOne = alias(Member, 'memberOne')
  // const MemberTwo = alias(Member, 'memberTwo')
  // const ProfileOne = alias(Profile, 'profileOne')
  // const ProfileTwo = alias(Profile, 'profileTwo')

  // const conversation = await db
  //   .select({
  //     id: Conversation.id,
  //     memberOneId: Conversation.memberOneId,
  //     memberTwoId: Conversation.memberTwoId,
  //     createdAt: Conversation.createdAt,
  //     updatedAt: Conversation.updatedAt,
  //     MemberOne,
  //     MemberTwo,
  //     ProfileOne,
  //     ProfileTwo,
  //   })
  //   .from(Conversation)
  //   .leftJoin(MemberOne, eq(Conversation.memberOneId, Member.id))
  //   .leftJoin(MemberTwo, eq(Conversation.memberTwoId, Member.id))
  //   .leftJoin(ProfileOne, eq(MemberOne.id, Profile.id))
  //   .leftJoin(ProfileTwo, eq(MemberTwo.id, Profile.id))
  //   .where(
  //     and(eq(Conversation.memberOneId, memberOneId), eq(Conversation.memberTwoId, memberTwoId))
  //   )
  //   .then(res => res[0])

  return conversation
}

async function createConversation(memberOneId: string, memberTwoId: string) {
  const newConversation = await db
    .insert(Conversation)
    .values({ memberOneId, memberTwoId })
    .returning()
    .then(res => res[0])

  return newConversation
}
