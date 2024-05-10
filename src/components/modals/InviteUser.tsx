'use client'

import { useModalStore } from '@/hooks/useModalStore'
import useOrigin from '@/hooks/useOrigin'
import axios from 'axios'
import { Check, Copy, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogTitle } from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

function InviteUserModal() {
  const { type, data, isOpen, onClose, onOpen } = useModalStore()
  const isModalOpen = isOpen && type === 'invite'

  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const onCopy = () => {
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const onNew = async () => {
    try {
      setIsLoading(true)
      const response = await axios.patch(`/api/servers/${data.server?.id}/invite-code`)
      onOpen('invite', { server: response.data })
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const origin = useOrigin()
  const inviteUrl = `${origin}/invite/${data.server?.inviteCode}`

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogOverlay className="bg-transparent" />
      <DialogContent className="w-[440px] overflow-hidden border-none bg-white p-0 text-primary dark:bg-[#313338]">
        <DialogHeader className="px-6 pt-8">
          <DialogTitle className="text-center text-2xl font-bold">Invite friends</DialogTitle>
        </DialogHeader>

        <div className="p-6">
          <Label className="test-xs font-bold uppercase text-zinc-500 dark:text-primary/60">
            Server invite link
          </Label>
          <div className="mt-2 flex items-center gap-x-2">
            <Input
              disabled={isLoading}
              className="border-0 bg-zinc-300/50 text-black focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-primary"
              value={inviteUrl}
            />
            <Button disabled={isLoading} onClick={onCopy} size="icon">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <Button
            onClick={onNew}
            disabled={isLoading}
            variant="link"
            size="sm"
            className="mt-4 text-xs text-zinc-500 dark:text-primary/60"
          >
            Generate a new link
            <RefreshCw className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default InviteUserModal
