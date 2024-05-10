import { SelectChannel, SelectMember, SelectProfile, SelectServer } from '@/db/schema'

export type MembersWithProfile = SelectMember & { profile: SelectProfile }

export type ServerDetails = SelectServer & {
  members: MembersWithProfile[]
  channels: SelectChannel[]
}

export enum ChannelTypes {
  TEXT = 'TEXT',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
}

export enum MemberRoles {
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  GUEST = 'GUEST',
}
