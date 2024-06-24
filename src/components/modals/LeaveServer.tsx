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

function LeaveServerModal() {
  const [isPending, startTransition] = useTransition()

  const { isOpen, type, onClose, data } = useModalStore()
  const { server } = data
  const isModalOpen = isOpen && type === 'leave-server'

  const router = useRouter()

  const handleLeaveServer = async () => {
    startTransition(async () => {
      try {
        await axios.delete(`/api/servers/${server?.id}/leave`)
        toast(`You have left ${server?.name}`, {
          icon: '📤',
        })
        onClose()
        router.push('/')
        router.refresh()
      } catch (error) {
        toast.error('Failed to leave the server. Please try again.')
        console.error('--Leave Server Error--')
      }
    })
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={() => onClose()}>
      <DialogOverlay className="bg-transparent" />
      <DialogContent className="overflow-hidden border-none bg-white p-0 text-primary dark:bg-[#313338]">
        <DialogHeader className="px-6 pt-8">
          <DialogTitle className="text-center text-2xl font-bold">Leave Server</DialogTitle>
          <DialogDescription className="text-center">
            Are you sure you want to leave{' '}
            <span className="font-semibold text-indigo-500">{server?.name}</span>
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
                handleLeaveServer()
              }}
              variant="primary"
            >
              {isPending ? 'Leaving...' : 'Confirm'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default LeaveServerModal
