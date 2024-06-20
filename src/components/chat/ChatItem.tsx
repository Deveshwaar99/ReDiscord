import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import type { SelectMember } from '@/db/schema'
import { useModalStore } from '@/hooks/useModalStore'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { Edit, FileIcon, FileText, ShieldAlert, ShieldCheck, Trash } from 'lucide-react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import queryString from 'query-string'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { MemberRoles } from '../../../types'
import ActionTooltip from '../ActionTooltip'
import UserAvatar from '../UserAvatar'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

const formatDate = (timeStamp: Date): string => {
  const date = new Date(timeStamp)
  const hours = date.getHours()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const formattedHours = hours >= 13 ? hours - 12 : hours
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return ` ${date.toLocaleString('default', {
    month: 'long',
  })} ${date.getFullYear()} ${formattedHours}:${minutes} ${ampm}`
}

interface ChatItemProps {
  currentMember: SelectMember
  messageMember: {
    id: string
    role: MemberRoles
    name: string
    imageUrl: string
  }
  messageId: string | number
  content: string
  fileUrl: string | null
  deleted: boolean
  isUpdated: boolean
  timeStamp: Date
  socketUrl: string
  socketQuery: Record<string, string>
}

const roleIconMap = {
  GUEST: null,
  MODERATOR: <ShieldCheck className="ml-2 h-4 w-4 text-indigo-500" />,
  ADMIN: <ShieldAlert className="ml-2 h-4 w-4 text-rose-500" />,
}

const formSchema = z.object({
  content: z.string().min(1),
})

function ChatItem({
  messageId,
  content,
  fileUrl,
  deleted,
  isUpdated,
  timeStamp,
  messageMember,
  currentMember,
  socketUrl,
  socketQuery,
}: ChatItemProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false)

  const params = useParams()
  const router = useRouter()

  const { onOpen } = useModalStore()

  const fileType = fileUrl?.split('.').at(-1)
  const isAdmin = currentMember.role === MemberRoles.ADMIN
  const isModerator = currentMember.role === MemberRoles.MODERATOR
  const isOwner = currentMember.id === messageMember.id
  const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner)
  const canEditMessage = !deleted && !fileUrl && isOwner
  const isPDF = fileUrl && fileType === 'pdf'
  const isDocument = fileType === 'txt' && fileUrl
  const isImage = fileUrl && !(isPDF || isDocument)

  const formattedDate = formatDate(timeStamp)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: content,
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const url = queryString.stringifyUrl({
        url: `${socketUrl}/${messageId}`,
        query: socketQuery,
      })
      await axios.patch(url, values)
      form.reset()
      setIsEditing(false)
    } catch (error) {
      console.error("Couldn't edit the message", error)
      toast.error('Somthing went wrong! Try again')
    }
  }

  const onMemberClick = () => {
    if (messageMember.id === currentMember.id) return
    router.push(`/servers/${params?.serverId}/conversations/${messageMember.id}`)
  }

  useEffect(() => {
    const handleEscapePress = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Esc') {
        setIsEditing(false)
      }
      window.addEventListener('keydown', handleEscapePress)

      return () => {
        window.removeEventListener('keydown', handleEscapePress)
      }
    }
  }, [])

  return (
    <div className="group relative flex w-full items-center p-4 transition hover:bg-black/5">
      <div className="group flex w-full items-start gap-x-2">
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
        <div
          onClick={() => onMemberClick()}
          className="cursor-pointer transition hover:drop-shadow-md"
        >
          <UserAvatar src={messageMember.imageUrl} />
        </div>
        <div className="flex w-full flex-col">
          <div className="flex items-center gap-x-2">
            <div className="flex items-center">
              {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
              <p
                onClick={() => onMemberClick()}
                className="cursor-pointer text-sm font-semibold hover:underline"
              >
                {messageMember.name}
              </p>
              <ActionTooltip label={messageMember.role}>
                {roleIconMap[messageMember.role]}
              </ActionTooltip>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">{formattedDate}</span>
          </div>

          {isImage && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative mt-2 flex aspect-square size-48 items-center overflow-hidden rounded-md border bg-secondary"
            >
              <Image src={fileUrl} alt={content} fill className="object-cover" />
            </a>
          )}

          {(isPDF || isDocument) && (
            <div className="relative mt-2 flex items-center rounded-md bg-background/10 p-2">
              {isPDF && <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />}
              {isDocument && <FileText className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />}

              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-sm text-indigo-500 hover:underline dark:text-indigo-400"
              >
                {isPDF ? 'PDF ' : 'TEXT '}FILE
              </a>
            </div>
          )}

          {!fileUrl && !isEditing && (
            <p
              className={cn(
                'text-sm text-zinc-600 dark:text-zinc-300',
                deleted && 'mt-1 text-xs italic text-zinc-500 dark:text-zinc-400',
              )}
            >
              {content}
              {isUpdated && !deleted && (
                <span className="mx-2 text-[10px] text-zinc-500 dark:text-zinc-400">(edited)</span>
              )}
            </p>
          )}

          {!fileUrl && isEditing && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex w-full items-center gap-x-2 pt-2"
              >
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <div className="relative w-full">
                          <Input
                            className="border-0 border-none bg-zinc-200/90 p-2 text-zinc-600 focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-zinc-700/75 dark:text-zinc-200"
                            placeholder="Edited message"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                <Button size="sm" variant="primary">
                  Save
                </Button>
              </form>
              <span className="mt-1 text-[10px] text-zinc-400">
                Press <kbd> Esc </kbd>to cancel,<kbd> Enter </kbd> to save
              </span>
            </Form>
          )}
        </div>
      </div>

      {canDeleteMessage && (
        <div className="absolute -top-2 right-5 hidden items-center gap-x-2 rounded-sm border bg-white p-1 group-hover:flex dark:bg-zinc-800">
          {canEditMessage && (
            <ActionTooltip label="Edit">
              <Edit
                onMouseDown={() => setIsEditing(true)}
                className="ml-auto size-4 cursor-pointer text-zinc-500 transition hover:text-zinc-600 dark:hover:text-zinc-300"
              />
            </ActionTooltip>
          )}

          <ActionTooltip label="Delete">
            <Trash
              onMouseDown={() =>
                onOpen('delete-message', {
                  apiUrl: `${socketUrl}/${messageId}`,
                  query: socketQuery,
                })
              }
              className="ml-auto size-4 cursor-pointer text-zinc-500 transition hover:text-zinc-600 dark:hover:text-zinc-300"
            />
          </ActionTooltip>
        </div>
      )}
    </div>
  )
}

export default ChatItem
