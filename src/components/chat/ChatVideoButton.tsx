'use client'

import { Video, VideoOff } from 'lucide-react'
import ActionTooltip from '../ActionTooltip'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import queryString from 'query-string'

function ChatVideoButton() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathName = usePathname()

  const isVideo = searchParams?.get('video')
  const Icon = isVideo ? VideoOff : Video
  const label = isVideo ? 'End video call' : 'Start video'

  const onClick = () => {
    const url = queryString.stringifyUrl(
      {
        url: pathName || '',
        query: {
          video: isVideo ? undefined : true,
        },
      },
      { skipNull: true },
    )

    router.push(url)
  }
  return (
    <ActionTooltip side="bottom" label={label}>
      <button type="button" onClick={onClick} className="mr-4 transition hover:opacity-75">
        <Icon className="size-6 text-zinc-500 dark:text-zinc-400" />{' '}
      </button>
    </ActionTooltip>
  )
}

export default ChatVideoButton
