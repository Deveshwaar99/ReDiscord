'use client'

import ChatItem from '@/components/chat/ChatItem'
import ChatWelcome from '@/components/chat/ChatWelcome'
import type { SelectMember } from '@/db/schema'
import useChatQuery from '@/hooks/useChatQuery'
import { useChatSocket } from '@/hooks/useChatSocket'
import { Loader2, ServerCrash } from 'lucide-react'
import { type ElementRef, Fragment, useRef } from 'react'
import { MemberRoles, type MessageWithMemberAndProfile } from '../../../types'
import { useChatScroll } from '@/hooks/useChatScroll'

interface ChatMessagesProps {
  name: string
  chatId: string
  type: 'channel' | 'conversation'
  member: SelectMember
  apiUrl: string
  paramKey: 'channelId' | 'conversationId'
  paramValue: string
  socketUrl: string
  socketQuery: Record<string, string>
}

function ChatMessages({
  name,
  chatId,
  member,
  type,
  apiUrl,
  paramKey,
  paramValue,
  socketUrl,
  socketQuery,
}: ChatMessagesProps) {
  const queryKey = `chat:${chatId}`
  const addKey = `chat:${chatId}:messages`
  const updateKey = `chat:${chatId}:messages:update`

  const chatRef = useRef<ElementRef<'div'>>(null)
  const bottomRef = useRef<ElementRef<'div'>>(null)

  const { data, error, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status } =
    useChatQuery({
      queryKey,
      apiUrl,
      paramKey,
      paramValue,
    })

  useChatSocket({ addKey, updateKey, queryKey })
  useChatScroll({
    chatRef,
    bottomRef,
    shouldLoadMore: !isFetchingNextPage && hasNextPage,
    loadMoreFn: fetchNextPage,
    count: data?.pages[0]?.items?.length ?? 0,
  })

  if (status === 'pending') {
    return (
      <div className="flex size-full flex-col items-center justify-center">
        <Loader2 className="size-7 animate-spin text-zinc-500" />
        <p className="text-zinc-500 dark:text-zinc-400">Loading messages...</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex size-full flex-col items-center justify-center">
        <ServerCrash className="size-7 text-zinc-500" />
        <p className="text-zinc-500 dark:text-zinc-400">Somthing went wrong!</p>
      </div>
    )
  }

  if (data) {
    return (
      <div ref={chatRef} className="flex flex-1 flex-col overflow-y-auto">
        {!hasNextPage && <div className="flex-1 bg-white" />}
        {!hasNextPage && <ChatWelcome type={type} name={name} />}
        {hasNextPage && (
          <div className="flex items-center justify-center">
            {isFetchingNextPage ? (
              <Loader2 className="my-4 size-6 animate-spin text-zinc-500" />
            ) : (
              <button
                type="button"
                onClick={() => fetchNextPage()}
                className="my-4 text-xs text-zinc-500 transition hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300"
              >
                Load previous messages
              </button>
            )}
          </div>
        )}
        <div className="mt-auto flex flex-col-reverse">
          {data?.pages.map((group, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <Fragment key={i}>
              {group.items.length > 0 &&
                group.items.map((message: MessageWithMemberAndProfile) => (
                  <ChatItem
                    key={message.messageId}
                    currentMember={member}
                    messageMember={{
                      id: message.memberId,
                      role: MemberRoles[message.memberRole],
                      name: message.profileName,
                      imageUrl: message.profileImage,
                    }}
                    messageId={message.messageId}
                    content={message.content}
                    fileUrl={message.fileUrl}
                    deleted={message.deleted}
                    timeStamp={message.createdAt}
                    isUpdated={message.createdAt !== message.updatedAt}
                    socketUrl={socketUrl}
                    socketQuery={socketQuery}
                  />
                ))}
            </Fragment>
          ))}
        </div>
        <div ref={bottomRef} />
      </div>
    )
  }
}

export default ChatMessages
