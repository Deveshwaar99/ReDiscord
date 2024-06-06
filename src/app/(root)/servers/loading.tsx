import LoadingNavigationBar from '@/components/loading/LoadingNavigationBar'
import LoadingSidebar from '@/components/loading/LoadingSidebar'

function LoadingServerPage() {
  return (
    <div className="flex min-h-screen min-w-full">
      <LoadingNavigationBar />
      <LoadingSidebar />
      <main className="absolute left-1/2 top-1/2 h-full md:pl-[72px]">Loading...</main>
    </div>
  )
}

export default LoadingServerPage
