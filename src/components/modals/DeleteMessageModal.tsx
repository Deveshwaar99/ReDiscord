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
import queryString from 'query-string'
import { useTransition } from 'react'
import toast from 'react-hot-toast'
import { Button } from '../ui/button'

function DeleteMessageModal() {
  const [isPending, startTransition] = useTransition()
  const { isOpen, type, onClose, data } = useModalStore()
  const { apiUrl, query } = data

  const isModalOpen = isOpen && type === 'delete-message'

  const handleDeleteMessage = async () => {
    const url = queryString.stringifyUrl({ url: apiUrl ?? '', query })
    startTransition(async () => {
      try {
        await axios.delete(url, query)
        onClose()
      } catch (error) {
        toast.error('Failed to delete the message. Please try again.')
      }
    })
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={() => onClose()}>
      <DialogOverlay className="bg-transparent" />
      <DialogContent className="overflow-hidden border-none bg-white p-0 text-primary dark:bg-[#313338]">
        <DialogHeader className="px-6 pt-8">
          <DialogTitle className="text-center text-2xl font-bold">Delete Message</DialogTitle>
          <DialogDescription className="text-center">
            Are you sure you want to do this ?<br />
            The message will be permanently deleted
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
                handleDeleteMessage()
              }}
              variant="primary"
            >
              {isPending ? 'Deleting...' : 'Confirm'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteMessageModal
