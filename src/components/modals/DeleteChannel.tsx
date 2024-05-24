'use client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from '@/components/ui/dialog'
import { useModalStore } from '@/hooks/useModalStore'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import toast from 'react-hot-toast'
import { Button } from '../ui/button'

function DeleteChannelModal() {
  const [isPending, startTransition] = useTransition()

  const { isOpen, type, onClose, data } = useModalStore()
  const { server, channel } = data
  const isModalOpen = isOpen && type === 'delete-channel'

  const router = useRouter()

  const handleDeleteChannel = async () => {
    startTransition(async () => {
      try {
        await axios.delete(`/api/servers/${server?.id}/channels/${channel?.id}`)
        router.refresh()
        toast(`You have deleted #${channel?.name}`, { icon: '🗑️' })
        onClose()
      } catch (error) {
        toast.error('Failed to delete channel. Please try again.')
        console.error('--Delete Channel Error--')
      }
    })
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={() => onClose()}>
      <DialogOverlay className="bg-transparent" />
      <DialogContent className="overflow-hidden border-none bg-white p-0 text-primary dark:bg-[#313338]">
        <DialogHeader className="px-6 pt-8">
          <DialogTitle className="text-center text-2xl font-bold">Delete Channel</DialogTitle>
          <DialogDescription className="text-center text-base">
            Are you sure you want to do this ?<br />
            <span className="font-bold text-indigo-500"> #{channel?.name}</span> will be permanently
            deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-2 bg-gray-100 px-6 py-4 dark:bg-inherit">
          <div className="flex w-full items-center justify-between">
            <Button disabled={isPending} onClick={() => onClose()} variant="ghost">
              Cancel
            </Button>
            <Button
              disabled={isPending}
              onClick={() => {
                handleDeleteChannel()
              }}
              variant="primary"
            >
              Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteChannelModal
