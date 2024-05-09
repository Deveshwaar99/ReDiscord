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
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Button } from '../ui/button'

function DeleteChannelModal() {
  const [isLoading, setIsLoading] = useState(false)

  const { isOpen, type, onClose, data } = useModalStore()
  const { server, channel } = data
  const isModalOpen = isOpen && type === 'delete-channel'

  const router = useRouter()

  const handleDeleteChannel = async () => {
    try {
      console.log('calling delete channel')
      setIsLoading(true)
      await axios.delete(`/api/servers/${server?.id}/channels/${channel?.id}`)
      toast(`You have deleted #${channel?.name}`, { icon: '🗑️' })
      onClose()
    } catch (error) {
      toast.error('Failed to delete channel. Please try again.')
      console.error('--Delete Channel Error--')
    } finally {
      setIsLoading(false)
      router.refresh()
    }
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
            <Button disabled={isLoading} onClick={() => onClose()} variant="ghost">
              Cancel
            </Button>
            <Button
              disabled={isLoading}
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
