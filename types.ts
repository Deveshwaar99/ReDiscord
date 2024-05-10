import { SelectChannel, SelectMember, SelectProfile, SelectServer } from '@/db/schema'

export type ServerWithMemberAndProfile = SelectServer & {
  members: (SelectMember & { profile: SelectProfile })[]
  channels: SelectChannel[]
}

export type ChannelTypes = 'TEXT' | 'AUDIO' | 'VIDEO'

export type MemberRoles = 'ADMIN' | 'MODERATOR' | 'GUEST'
