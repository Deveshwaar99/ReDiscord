import type { SelectMember, SelectMessage, SelectProfile, selectDirectMessage } from '@/db/schema'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { z } from 'zod'
import { MemberRoles, type MessageWithMemberAndProfile } from '../../types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function verifyServerData(requestData: unknown) {
  const ServerDataSchema = z.object({
    name: z.string().min(5).max(25),
    imageUrl: z.string().min(1),
  })
  return ServerDataSchema.safeParse(requestData)
}

export function verifyChannelData(requestData: unknown) {
  const ChannelDataSchema = z.object({
    name: z
      .string()
      .min(5)
      .max(15)
      .refine(val => val !== 'general', {
        message: "The name cannot be 'general'",
      }),
    type: z.enum(['AUDIO', 'TEXT', 'VIDEO']),
  })
  return ChannelDataSchema.safeParse(requestData)
}

export function createMessageObject({
  message,
  member,
  profile,
}: {
  message: SelectMessage | selectDirectMessage
  member: SelectMember
  profile: SelectProfile
}): MessageWithMemberAndProfile {
  return {
    messageId: message.id,
    content: message.content,
    fileUrl: message.fileUrl,
    deleted: message.deleted,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    memberId: member.id,
    memberRole: MemberRoles[member.role],
    profileName: profile.name,
    profileImage: profile.imageUrl,
  }
}
