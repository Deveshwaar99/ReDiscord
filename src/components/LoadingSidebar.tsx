import { Separator } from './ui/separator'

function LoadingSidebar() {
  return (
    <div className="h-screen">
      <div className="hidden h-full w-60 flex-col bg-[#E3E5E8] dark:bg-[#1E1F22] md:flex">
        <div className="mx-auto my-5 h-8 w-48 animate-pulse rounded bg-zinc-600" />
        <Separator className="mx-auto h-[2px] w-48 rounded-md bg-zinc-300 dark:bg-zinc-700" />
        <div className="flex-1">
          <div className="mx-auto mb-36 mt-5 h-8 w-48 animate-pulse rounded bg-zinc-600" />
          <div className="mx-auto mb-36 h-8 w-48 animate-pulse rounded bg-zinc-600" />
          <div className="mx-auto h-8 w-48 animate-pulse rounded bg-zinc-600" />
        </div>
      </div>
    </div>
  )
}

export default LoadingSidebar
