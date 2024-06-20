'use client'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Search } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type ServerSearchProps = {
  data: {
    label: 'Text Channels' | 'Audio channels' | 'Video Channels' | 'Members'
    type: 'channel' | 'member'
    data: { id: string; name: string; icon: React.ReactNode }[]
  }[]
}

function ServerSearch({ data }: ServerSearchProps) {
  const [isOpen, setIsOpen] = useState(false)

  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen(open => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const onClick = ({ id, type }: { id: string; type: 'channel' | 'member' }) => {
    setIsOpen(false)

    if (!id || !type) return

    if (type === 'channel') {
      return router.push(`/servers/${params?.serverId}/channels/${id}`)
    }
    if (type === 'member') {
      return router.push(`/servers/${params?.serverId}/conversations/${id}`)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(isOpen => !isOpen)}
        className="group flex w-full items-center gap-x-2 rounded-md px-2 py-2 hover:bg-zinc-700/10 dark:hover:bg-zinc-500/50"
      >
        <Search className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
        <p className="text-sm font-semibold text-zinc-500 transition group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300">
          Search
        </p>
        <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">CTRL</span>+ K
        </kbd>
      </button>

      <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
        <CommandInput placeholder="Search all channels and members" />
        <CommandList>
          <CommandEmpty>No Results found</CommandEmpty>
          {data.map(item => {
            if (item.data.length === 0) return null
            return (
              <CommandGroup heading={item.label} key={item.label}>
                {item.data.map(subItem => (
                  <CommandItem
                    key={subItem.id}
                    onSelect={() => onClick({ type: item.type, id: subItem.id })}
                  >
                    {subItem.icon}
                    <span>{subItem.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )
          })}
        </CommandList>
      </CommandDialog>
    </>
  )
}

export default ServerSearch
