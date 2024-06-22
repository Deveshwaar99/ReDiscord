import 'server-only'

import { db } from '@/db'
import { Conversation } from '@/db/schema'
import { and, eq, or } from 'drizzle-orm'

export async function getOrCreateConversation(memberOneId: string, memberTwoId: string) {
  let conversation = await db.query.Conversation.findFirst({
    where: or(
      and(eq(Conversation.memberOneId, memberOneId), eq(Conversation.memberTwoId, memberTwoId)),
      and(eq(Conversation.memberOneId, memberTwoId), eq(Conversation.memberTwoId, memberOneId)),
    ),
  })
  if (!conversation) {
    conversation = await createConversation(memberOneId, memberTwoId)
  }
  return conversation
}

async function findConversation(memberOneId: string, memberTwoId: string) {
  const conversation = await db.query.Conversation.findFirst({
    where: and(
      eq(Conversation.memberOneId, memberOneId),
      eq(Conversation.memberTwoId, memberTwoId),
    ),
  })

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
