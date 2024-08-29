import NavigationSidebar from '@/components/navigation/NavigationSidebar'
import { initialProfile } from '@/lib/initialProfile'

import type { PropsWithChildren } from 'react'

async function MainLayout({ children }: PropsWithChildren) {
  const profile = await initialProfile()
  return (
    <div className="h-full">
      <div className="fixed inset-y-0 z-30 hidden h-full w-[72px] flex-col md:flex">
        <NavigationSidebar />
      </div>
      <main className="h-full md:pl-[72px]">{children}</main>
    </div>
  )
}

export default MainLayout
