import LoadingNavigationBar from '@/components/LoadingNavigationBar'

function HomeLoadingPage() {
  return (
    <div className="flex min-h-screen min-w-full items-center justify-center">
      <LoadingNavigationBar />
      <main className="absolute left-1/2 top-1/2 h-full md:pl-[72px]">Loading...</main>
    </div>
  )
}
export default HomeLoadingPage
