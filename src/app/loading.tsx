import LoadingNavigationBar from '@/components/loading/LoadingNavigationBar'

function HomeLoadingPage() {
  return (
    <div className="flex min-h-screen min-w-full">
      <LoadingNavigationBar />
      <main className="absolute left-1/2 top-1/2 h-full md:pl-[72px]">Loading...</main>
    </div>
  )
}
export default HomeLoadingPage
