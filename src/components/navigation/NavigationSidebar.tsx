import { Separator } from '@/components//ui/separator'
import { ThemeSwitch } from '@/components/ThemeSwitch'
import NavigationItem from '@/components/navigation/NavigationItem'
import NavigiationAction from '@/components/navigation/NavigiationAction'
import { ScrollArea } from '@/components/ui/scroll-area'
import { db } from '@/db'
import { getProfile } from '@/lib/getProfile'
import { UserButton, redirectToSignIn } from '@clerk/nextjs'

async function NavigationSidebar() {
  const profile = await getProfile()
  if (!profile) {
    return redirectToSignIn()
  }
  const servers = await db.query.Server.findMany({
    with: {
      members: {
        where: (members, { eq }) => eq(members.profileId, profile.id),
      },
    },
  })
  console.log(servers)

  return (
    <div className="flex h-full w-full flex-col items-center space-y-4 bg-[#E3E5E8] py-3 text-primary dark:bg-[#1E1F22]">
      <NavigiationAction />
      <Separator className="mx-auto h-[2px] w-10 rounded-md bg-zinc-300 dark:bg-zinc-700" />
      <ScrollArea className="w-full flex-1">
        {servers.map(server => (
          <div key={server.id} className="mb-4">
            <NavigationItem id={server.id} name={server.name} imageUrl={server.imageUrl} />
          </div>
        ))}
      </ScrollArea>
      <div className="mt-auto flex flex-col items-center gap-y-4 pb-3">
        <ThemeSwitch />
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: 'w-[44px] h-[44px]',
            },
          }}
        />
      </div>
    </div>
  )
}

export default NavigationSidebar
