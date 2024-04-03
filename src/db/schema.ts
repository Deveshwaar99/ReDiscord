import { relations } from 'drizzle-orm'
import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

// Enums
export const MemberRole = pgEnum('memberRole', ['ADMIN', 'MODERATOR', 'GUEST'])
export const ChannelType = pgEnum('channelType', ['TEXT', 'AUDIO', 'VIDEO'])

// Profile Table
export const Profile = pgTable('profile', {
  id: text('id').primaryKey().default('uuid_generate_v4()'),
  clerkId: text('clerkId').unique(),
  name: text('name'),
  imageUrl: text('imageUrl'),
  email: text('email').unique(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt')
    .defaultNow()
    .$onUpdate(() => new Date()),
})

// Server Table
export const Server = pgTable('server', {
  id: text('id').primaryKey().default('uuid_generate_v4()'),
  name: text('name'),
  imageUrl: text('imageUrl'),
  inviteCode: text('inviteCode').unique().notNull(),
  profileId: text('profileId')
    .notNull()
    .references(() => Profile.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt')
    .defaultNow()
    .$onUpdate(() => new Date()),
})

// Member Table
export const Member = pgTable('member', {
  id: text('id').primaryKey().default('uuid_generate_v4()'),
  role: MemberRole('role').default('GUEST'),
  profileId: text('profileId')
    .notNull()
    .references(() => Profile.id, { onDelete: 'cascade' }),
  serverId: text('serverId')
    .notNull()
    .references(() => Server.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt')
    .defaultNow()
    .$onUpdate(() => new Date()),
})

// Channel Relations
export const Channel = pgTable('channel', {
  id: text('id').primaryKey().default('uuid_generate_v4()'),
  name: text('name').notNull(),
  type: ChannelType('type').default('TEXT'),
  profileId: text('profileId')
    .notNull()
    .references(() => Profile.id, { onDelete: 'cascade' }),
  serverId: text('serverId')
    .notNull()
    .references(() => Server.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt')
    .defaultNow()
    .$onUpdate(() => new Date()),
})

// Message Table
export const Message = pgTable('message', {
  id: text('id').primaryKey().default('uuid_generate_v4()'),
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
  id: text('id').primaryKey().default('uuid_generate_v4()'),
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
  id: text('id').primaryKey().default('uuid_generate_v4()'),
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
  profile: one(Profile, {
    fields: [Server.profileId],
    references: [Profile.id],
  }),
  members: many(Member),
}))

// Member Relations
export const memberRelations = relations(Member, ({ one }) => ({
  profile: one(Profile, {
    fields: [Member.profileId],
    references: [Profile.id],
  }),
  server: one(Server, {
    fields: [Member.serverId],
    references: [Server.id],
  }),
}))

// Channel Relations
export const channelRelations = relations(Channel, ({ one, many }) => ({
  profile: one(Profile),
  server: one(Server),
  messages: many(Message),
}))

// Message Relations
export const messageRelations = relations(Message, ({ one }) => ({
  member: one(Member, {
    fields: [Message.memberId],
    references: [Member.id],
  }),
  channel: one(Channel, {
    fields: [Message.channelId],
    references: [Channel.id],
  }),
}))

// Conversation Relations
export const conversationRelations = relations(Conversation, ({ one, many }) => ({
  memberOne: one(Member, {
    fields: [Conversation.memberOneId],
    references: [Member.id],
  }),
  memberTwo: one(Member, {
    fields: [Conversation.memberTwoId],
    references: [Member.id],
  }),
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
