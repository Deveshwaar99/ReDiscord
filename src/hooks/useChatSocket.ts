import { useSocket } from '@/components/providers/socket-provider'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import type { MessageWithMemberAndProfile } from '../../types'

interface ChatSocketProps {
  addKey: string
  updateKey: string
  queryKey: string
}

export const useChatSocket = ({ addKey, updateKey, queryKey }: ChatSocketProps): void => {
  const { socket } = useSocket()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!socket) return

    socket.on(addKey, (message: MessageWithMemberAndProfile) => {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData || !oldData?.pages || oldData.pages.length === 0) {
          return {
            ...oldData,
            pages: [
              {
                items: [message],
              },
            ],
          }
        }

        const newData = [...oldData.pages]
        newData[0] = {
          ...newData[0],
          items: [message, ...newData[0].items],
        }

        return { ...oldData, pages: newData }
      })
    })

    socket.on(updateKey, (message: MessageWithMemberAndProfile) => {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData || !oldData?.pages || oldData.pages.length === 0) return oldData

        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const newData = oldData.pages.map((page: any) => {
          return {
            ...page,
            items: page.items.map((item: MessageWithMemberAndProfile) => {
              if (item.messageId === message.messageId) {
                return message
              }
              return item
            }),
          }
        })
        return {
          ...oldData,
          pages: newData,
        }
      })
    })

    return () => {
      socket.off(addKey)
      socket.off(updateKey)
    }
  }, [socket, queryClient, addKey, updateKey, queryKey])
}
