import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const LoadingIcon = ({ className }: { className?: string }) => (
  <div
    className={cn(
      'mx-3  h-[44px] w-[44px] animate-pulse rounded-[24px] bg-zinc-400/50 dark:bg-zinc-700',
      className
    )}
  />
)

function LoadingNavigationBar() {
  return (
    <div className="inset-y-0 hidden h-screen w-[72px] flex-col md:flex">
      <div className="flex h-full w-full flex-col items-center bg-[#E3E5E8] py-3 dark:bg-[#1E1F22]">
        <LoadingIcon className="mb-4" />
        <Separator className="mx-auto h-[2px] w-10 rounded-md bg-zinc-300 dark:bg-zinc-700" />
        <LoadingIcon className="mt-4" />
        <LoadingIcon className="mt-4" />
        <LoadingIcon className="mt-4" />
        <div className="mt-auto flex w-full flex-col items-center gap-y-4 pb-3">
          <LoadingIcon />
          <LoadingIcon />
        </div>
      </div>
    </div>
  )
}

export default LoadingNavigationBar
