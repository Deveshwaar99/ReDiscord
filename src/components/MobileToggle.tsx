import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import NavigationSidebar from './navigation/NavigationSidebar'
import ServerSidebar from './server/ServerSidebar'
import { Button } from './ui/button'

interface MobileToggleProps {
  serverId: string
}

function MobileToggle({ serverId }: MobileToggleProps) {
  return (
    <div>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" className="md:hidden">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex gap-0 p-0">
          <div className="w-[72px]">
            <NavigationSidebar />
          </div>
          <ServerSidebar serverId={serverId} />
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default MobileToggle
