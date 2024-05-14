import { generatePublicId } from '@/lib/generatePublicId'
import { relations } from 'drizzle-orm'
import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core'

// Enums
export const MemberRole = pgEnum('memberRole', ['ADMIN', 'MODERATOR', 'GUEST'])
export const ChannelType = pgEnum('channelType', ['TEXT', 'AUDIO', 'VIDEO'])

// Profile Table
export const Profile = pgTable(
  'profile',
  {
    id: varchar('id', { length: 12 })
      .primaryKey()
      .$defaultFn(() => generatePublicId()),
    clerkId: text('clerkId').unique().notNull(),
    name: text('name').notNull(),
    imageUrl: text('imageUrl'),
    email: text('email').unique().notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  table => {
    return {
      clerkIdx: uniqueIndex('clerk_idx').on(table.clerkId),
    }
  }
)

// Server Table
export const Server = pgTable(
  'server',
  {
    id: varchar('id', { length: 12 })
      .primaryKey()
      .$defaultFn(() => generatePublicId()),
    name: text('name').notNull(),
    imageUrl: text('imageUrl').notNull(),
    inviteCode: text('inviteCode')
      .unique()
      .notNull()
      .$defaultFn(() => generatePublicId()),
    profileId: varchar('profileId', { length: 12 })
      .notNull()
      .references(() => Profile.id, { onDelete: 'cascade' }),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  table => {
    return {
      profileIdx: index('server_profile_idx').on(table.profileId),
    }
  }
)

// Member Table
export const Member = pgTable(
  'member',
  {
    id: varchar('id', { length: 12 })
      .primaryKey()
      .$defaultFn(() => generatePublicId()),
    role: MemberRole('role').default('GUEST').notNull(),
    profileId: varchar('profileId', { length: 12 })
      .notNull()
      .references(() => Profile.id, { onDelete: 'cascade' }),
    serverId: varchar('serverId', { length: 12 })
      .notNull()
      .references(() => Server.id, { onDelete: 'cascade' }),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  table => ({
    profileIdIndex: index('member_profileId_idx').on(table.profileId),
    serverIdIndex: index('member_serverId_idx').on(table.serverId),
  })
)

// Channel Relations
export const Channel = pgTable(
  'channel',
  {
    id: varchar('id', { length: 12 })
      .primaryKey()
      .$defaultFn(() => generatePublicId()),
    name: text('name').notNull(),
    type: ChannelType('type').default('TEXT').notNull(),
    serverId: varchar('serverId', { length: 12 })
      .notNull()
      .references(() => Server.id, { onDelete: 'cascade' }),

    memberId: varchar('memberId', { length: 12 })
      .notNull()
      .references(() => Member.id, { onDelete: 'cascade' }),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt')
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  table => ({
    serverIdIndex: index('channel_serverId_idx').on(table.serverId),
    memberIdIndex: index('channel_memberId_idx').on(table.memberId),
  })
)

// Message Table
export const Message = pgTable('message', {
  id: varchar('id', { length: 12 })
    .primaryKey()
    .$defaultFn(() => generatePublicId()),
  content: text('content').notNull(),
  fileUrl: text('fileUrl'),
  memberId: text('memberId')
    .notNull()
    .references(() => Member.id, { onDelete: 'cascade' }),
  channelId: text('channelId')
    .notNull()
    .references(() => Channel.id, { onDelete: 'cascade' }),
  deleted: text('deleted').default('false'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt')
    .defaultNow()
    .$onUpdate(() => new Date()),
})

// Conversation Table
export const Conversation = pgTable('conversation', {
  id: varchar('id', { length: 12 })
    .primaryKey()
    .$defaultFn(() => generatePublicId()),
  memberOneId: text('memberOneId')
    .notNull()
    .references(() => Member.id, { onDelete: 'cascade' }),
  memberTwoId: text('memberTwoId')
    .notNull()
    .references(() => Member.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt')
    .defaultNow()
    .$onUpdate(() => new Date()),
})

// DirectMessage Table
export const DirectMessage = pgTable('directMessage', {
  id: varchar('id', { length: 12 })
    .primaryKey()
    .$defaultFn(() => generatePublicId()),
  content: text('content').notNull(),
  fileUrl: text('fileUrl'),
  memberId: text('memberId')
    .notNull()
    .references(() => Member.id, { onDelete: 'cascade' }),
  conversationId: text('conversationId')
    .notNull()
    .references(() => Conversation.id, { onDelete: 'cascade' }),
  deleted: text('deleted').default('false'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt')
    .defaultNow()
    .$onUpdate(() => new Date()),
})

// Profile Relations
export const profileRelations = relations(Profile, ({ many }) => ({
  servers: many(Server),
  members: many(Member),
}))

// Server Relations
export const serverRelations = relations(Server, ({ one, many }) => ({
  profile: one(Profile, { fields: [Server.profileId], references: [Profile.id] }),
  members: many(Member),
  channels: many(Channel),
}))

// Member Relations
export const memberRelations = relations(Member, ({ one }) => ({
  profile: one(Profile, { fields: [Member.profileId], references: [Profile.id] }),
  server: one(Server, { fields: [Member.serverId], references: [Server.id] }),
}))

// Channel Relations
export const channelRelations = relations(Channel, ({ one, many }) => ({
  profile: one(Profile, { fields: [Channel.profileId], references: [Profile.id] }),
  server: one(Server, { fields: [Channel.serverId], references: [Server.id] }),
  messages: many(Message),
}))

// Message Relations
export const messageRelations = relations(Message, ({ one }) => ({
  member: one(Member, { fields: [Message.memberId], references: [Member.id] }),
  channel: one(Channel, { fields: [Message.channelId], references: [Channel.id] }),
}))

// Conversation Relations
export const conversationRelations = relations(Conversation, ({ one, many }) => ({
  memberOne: one(Member, { fields: [Conversation.memberOneId], references: [Member.id] }),
  memberTwo: one(Member, { fields: [Conversation.memberTwoId], references: [Member.id] }),
  directMessages: many(DirectMessage),
}))

// DirectMessage Relations
export const directMessageRelations = relations(DirectMessage, ({ one }) => ({
  member: one(Member, { fields: [DirectMessage.memberId], references: [Member.id] }),
  conversation: one(Conversation, {
    fields: [DirectMessage.conversationId],
    references: [Conversation.id],
  }),
}))

export type SelectProfile = typeof Profile.$inferSelect
export type SelectServer = typeof Server.$inferSelect
export type SelectMember = typeof Member.$inferSelect
export type SelectChannel = typeof Channel.$inferSelect

export type channelEnum = typeof ChannelType.enumValues
