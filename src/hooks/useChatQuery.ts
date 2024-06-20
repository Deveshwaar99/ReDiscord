import { useSocket } from '@/components/providers/socket-provider'
import { useInfiniteQuery } from '@tanstack/react-query'
import queryString from 'query-string'

interface ChatQueryProps {
  queryKey: string
  apiUrl: string
  paramKey: 'channelId' | 'conversationId'
  paramValue: string
}

export default function useChatQuery({ queryKey, apiUrl, paramKey, paramValue }: ChatQueryProps) {
  const { isConnected } = useSocket()

  const fetchMessages = async ({ pageParam = undefined }) => {
    const url = queryString.stringifyUrl(
      {
        url: apiUrl,
        query: {
          [paramKey]: paramValue,
          cursor: pageParam,
        },
      },
      { skipNull: true },
    )
    const response = await fetch(url)
    return response.json()
  }

  const { data, error, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: [queryKey],
      queryFn: fetchMessages,
      initialPageParam: undefined,
      getNextPageParam: lastPage => lastPage?.nextCursor,
      refetchInterval: isConnected ? false : 1000,
    })

  return {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  }
}
