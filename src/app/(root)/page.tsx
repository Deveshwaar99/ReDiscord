import CreateServerModal from '@/components/modals/CreateServer'
import { cachedGetMembersWithServers } from '@/lib/cachedGetMembersWithServers'
import { getProfile } from '@/lib/getProfile'
import { auth } from '@clerk/nextjs/server'
import { Loader } from 'lucide-react'

export default async function Home() {
  const profile = await getProfile()
  if (!profile) {
    return auth().redirectToSignIn()
  }
  const membersWithServers = await cachedGetMembersWithServers(profile)

  if (membersWithServers.length === 0) {
    return <CreateServerModal forceOpen />
  }
  return (
    <div className="flex h-full flex-col items-center justify-center space-y-4">
      <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex flex-col items-center justify-center">
        <p>
          I'm working on something exciting !<br />
        </p>
        <p>Click on a server to explore.</p>
      </h1>
      <Loader className="animate-spin text-gray-600 dark:text-gray-400 h-8 w-8" />
    </div>
  )
}
