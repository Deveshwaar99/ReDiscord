import { initialProfile } from '@/lib/initialProfile'

export default async function Home() {
  const profile = await initialProfile()

  return (
    <div className="flex h-full items-center justify-center">
      <h1 className="">Hello</h1>
    </div>
  )
}
