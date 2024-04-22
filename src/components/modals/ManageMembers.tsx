import { ScrollArea } from '@/components/ui/scroll-area'
import { SelectMember } from '@/db/schema'
import { useModalStore } from '@/hooks/useModalStore'
import axios from 'axios'
import {
  Check,
  Gavel,
  Loader2,
  MoreVertical,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { ServerWithMemberAndProfile } from '../../../types'
import UserAvatar from '../UserAvatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'

const roleIconMap = {
  GUEST: null,
  MODERATOR: <ShieldCheck className="ml-2 h-4 w-4 text-indigo-500" />,
  ADMIN: <ShieldAlert className="h-4 w-4 text-rose-500" />,
}

export const revalidate = 0

function ManageMembersModal() {
  const router = useRouter()

  const [loadingId, setLoadingId] = useState('')

  const { isOpen, onClose, data, type, onOpen } = useModalStore()
  const isModalOpen = isOpen && type === 'manage-members'
  const { server } = data as { server: ServerWithMemberAndProfile }

  const onRoleChange = async (member: SelectMember, newRole: 'MODERATOR' | 'GUEST') => {
    if (member.role === newRole) return

    try {
      setLoadingId(member.id)
      const { data } = await axios.patch(`/api/servers/${server.id}/members/${member.id}/role`, {
        role: newRole,
      })
      if (!data.server) throw new Error('Unable to change role')

      router.refresh()

      onOpen('manage-members', { server: data.server })

      toast.success('Role change success')
    } catch (error) {
      toast.error('Unable to change role')
      console.error('--Role change Error--', error)
    } finally {
      setLoadingId('')
    }
  }

  const onKick = async (memberId: string) => {
    try {
      setLoadingId(memberId)

      const { data } = await axios.delete(`/api/servers/${server.id}/members/${memberId}`)

      router.refresh()

      onOpen('manage-members', { server: data.server })

      toast.success('Success')
    } catch (error) {
      toast.error('Unable to kick user')
      console.error('--Delete user Error--', error)
    } finally {
      setLoadingId('')
    }
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="overflow-hidden bg-white text-black">
        {/* show members count */}
        <DialogHeader className="px-6 pt-8">
          <DialogTitle className="text-center text-2xl font-bold">Manage Members</DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            {server?.members?.length} Members
          </DialogDescription>
        </DialogHeader>
        {/* List members */}
        <ScrollArea className="mt-8 max-h-[420px] pr-6">
          {server?.members?.map(member => (
            <div key={member.id} className="mb-6 flex items-center gap-x-2">
              <UserAvatar src={member.profile.imageUrl!} />
              <div className="flex flex-col gap-y-1">
                <div className="flex items-center gap-x-1 text-xs font-semibold">
                  {member.profile.name}
                  {roleIconMap[member.role]}
                </div>
                <p className="text-xs text-zinc-500">{member.profile.email}</p>
              </div>
              {/* Member options */}
              {server.profileId !== member.profileId && loadingId !== member.id && (
                <div className="ml-auto">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <MoreVertical className="h-4 w-4 text-zinc-500" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent side="left">
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="flex items-center">
                          <ShieldQuestion className="mr-2 h-4 w-4" />
                          <span>Role</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem
                              onClick={() => {
                                onRoleChange(member, 'GUEST')
                              }}
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              Guest
                              {member.role === 'GUEST' && <Check className="ml-auto h-4 w-4" />}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                onRoleChange(member, 'MODERATOR')
                              }}
                            >
                              <ShieldCheck className="mr-2 h-4 w-4" />
                              Moderator
                              {member.role === 'MODERATOR' && <Check className="ml-auto h-4 w-4" />}
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onKick(member.id)}>
                        <Gavel className="mr-2 h-4 w-4" />
                        Kick
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}

              {loadingId === member.id && (
                <Loader2 className="ml-auto h-4 w-4 animate-spin text-zinc-500" />
              )}
            </div>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default ManageMembersModal
