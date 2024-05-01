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

function LeaveServerModal() {
  const [isLoading, setIsLoading] = useState(false)

  const { isOpen, type, onClose, data } = useModalStore()
  const { server } = data
  const isModalOpen = isOpen && type === 'leave-server'

  const router = useRouter()

  const handleLeaveServer = async () => {
    try {
      setIsLoading(true)
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
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={() => onClose()}>
      <DialogOverlay className="bg-transparent" />
      <DialogContent className="w-[440px] overflow-hidden border-none bg-white p-0 text-primary dark:bg-[#313338]">
        <DialogHeader className="px-6 pt-8">
          <DialogTitle className="text-center text-2xl font-bold">Leave Server</DialogTitle>
          <DialogDescription className="text-center">
            Are you sure you want to leave{' '}
            <span className="font-semibold text-indigo-500">{server?.name}</span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div className="mx-4 my-3 flex w-full items-center justify-between">
            <Button disabled={isLoading} onClick={() => onClose()} variant="ghost">
              Cancel
            </Button>
            <Button
              disabled={isLoading}
              onClick={() => {
                handleLeaveServer()
              }}
              variant="default"
            >
              Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default LeaveServerModal
