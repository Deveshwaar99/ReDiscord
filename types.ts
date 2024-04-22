import { SelectChannel, SelectMember, SelectProfile, SelectServer } from '@/db/schema'

export type ServerWithMemberAndProfile = SelectServer & {
  members: (SelectMember & { profile: SelectProfile })[]
  channels: SelectChannel[]
}
