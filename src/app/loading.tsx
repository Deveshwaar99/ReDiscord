import { Separator } from '@/components/ui/separator'

function HomeLoadingPage() {
  return (
    <div className="min-w-screen min-h-screen">
      <div className="fixed inset-y-0 z-30 hidden h-full w-[72px] flex-col md:flex">
        <div className="flex h-full w-full flex-col items-center bg-[#E3E5E8] py-3 dark:bg-[#1E1F22]">
          <LoadingIcon />
          <Separator className="mx-auto h-[2px] w-10 rounded-md bg-zinc-300 dark:bg-zinc-700" />
          <LoadingIcon />
          <LoadingIcon />
          <div className="mt-auto flex w-full flex-col items-center gap-y-4 pb-3">
            <LoadingIcon />
            <LoadingIcon />
          </div>
        </div>
      </div>
      <main className="h-full animate-pulse md:pl-[72px]" />
    </div>
  )
}

const LoadingIcon = () => (
  <div className="m-3 h-[44px] w-[44px] animate-pulse rounded-[24px] bg-slate-400" />
)

export default HomeLoadingPage
