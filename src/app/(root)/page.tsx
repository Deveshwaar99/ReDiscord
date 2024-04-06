import { ThemeSwitch } from '@/components/ThemeSwitch'
import CreateServerModal from '@/components/modals/CreateServer'
import { initialProfile } from '@/lib/initialProfile'

export default async function Home() {
  const profile = await initialProfile()
  console.log(profile)
  return (
    <div className="flex h-full items-center justify-center">
      <h1 className="">Hello</h1>
      <CreateServerModal />
    </div>
  )
}
