import { Hash } from 'lucide-react'

interface ChatWelcomeProps {
  type: 'channel' | 'conversation'
  name: string
}

function ChatWelcome({ type, name }: ChatWelcomeProps) {
  return (
    <div className="mb-4 space-y-2 px-4">
      {type === 'channel' && (
        <div className="flex size-[75px] items-center justify-center rounded-full bg-zinc-500 dark:bg-zinc-700">
          <Hash className="size-12 text-white" />
        </div>
      )}
      <p className="text-xl font-bold md:text-3xl">
        {type === 'channel' && 'Welcome to #'}
        {name}
      </p>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {type === 'channel'
          ? `This is the start of the #${name} channel`
          : `This is the start of the conversation with ${name}`}
      </p>
    </div>
  )
}

export default ChatWelcome
