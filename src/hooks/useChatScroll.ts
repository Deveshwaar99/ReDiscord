import { type RefObject, useEffect, useState } from 'react'

interface chatScrollProps {
  chatRef: RefObject<HTMLDivElement>
  bottomRef: RefObject<HTMLDivElement>
  shouldLoadMore: boolean
  loadMoreFn: () => void
  count: number
}

export function useChatScroll({
  chatRef,
  bottomRef,
  shouldLoadMore,
  loadMoreFn,
  count,
}: chatScrollProps) {
  const [firstRenderCompleted, setFirstRenderCompleted] = useState(false)

  //To load message on scroll to the top
  useEffect(() => {
    const topDiv = chatRef?.current

    const handleScroll = () => {
      const currentTopScroll = topDiv?.scrollTop
      if (currentTopScroll === 0 && shouldLoadMore) {
        loadMoreFn()
      }
    }

    topDiv?.addEventListener('scroll', handleScroll)

    return () => {
      topDiv?.removeEventListener('scroll', handleScroll)
    }
  }, [chatRef, loadMoreFn, shouldLoadMore])

  //To focus to the input in initial render and when view is <=100px
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const bottomDiv = bottomRef?.current
    const topDiv = chatRef?.current

    const shouldAutoScroll = (): boolean => {
      //Focus to the bottom in the initial render
      if (!firstRenderCompleted && bottomDiv) {
        setFirstRenderCompleted(true)
        return true
      }

      //Do a scroll if clientView is less than 100px from the bottom
      if (!topDiv) return false
      const distanceFromBottom = topDiv.scrollHeight - (topDiv.scrollTop + topDiv.clientHeight)
      return distanceFromBottom <= 100
    }

    if (shouldAutoScroll()) {
      setTimeout(() => {
        bottomDiv?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [bottomRef, chatRef, firstRenderCompleted, count])
}
