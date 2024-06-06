import { Separator } from '../ui/separator'

function LoadingSidebar() {
  return (
    <div className="h-screen">
      <div className="hidden h-full w-60 flex-col bg-[#E3E5E8] dark:bg-[#1E1F22] md:flex">
        <div className="mx-auto my-5 h-8 w-48 animate-pulse rounded bg-zinc-400/50 dark:bg-zinc-700" />
        <Separator className="mx-auto h-[2px] w-48 rounded-md bg-zinc-300 dark:bg-zinc-700" />
      </div>
    </div>
  )
}

export default LoadingSidebar
