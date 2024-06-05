'use client'
import FileUpload from '@/components/FileUpload'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { useModalStore } from '@/hooks/useModalStore'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import qs from 'query-string'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'

function MessageFileModal() {
  const [isLoading, setIsLoading] = useState(false)

  const { isOpen, type, onClose, data } = useModalStore()
  const isModalOpen = isOpen && type === 'message-file'

  const router = useRouter()

  const { apiUrl, query } = data
  const formSchema = z.object({
    fileUrl: z.string().min(1, {
      message: 'Attachment is required.',
    }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fileUrl: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const url = qs.stringifyUrl({ url: apiUrl || '', query })
      await axios.post(url, { content: values.fileUrl })
      handleClose()
      router.refresh()
    } catch (error) {
      toast.error('Somthing went wrong!')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  function handleClose() {
    form.reset()
    onClose()
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogOverlay className="bg-transparent" />
      <DialogContent className="w-[440px] overflow-hidden border-none bg-white p-0 text-primary dark:bg-[#313338]">
        <DialogHeader className="px-6 pt-8">
          <DialogTitle className="text-center text-2xl font-bold">Add an attachment</DialogTitle>
          <DialogDescription className="text-balance text-center text-zinc-500 dark:text-gray-400">
            Send a file as a message
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6 px-6">
              <div className="flex items-center justify-center text-center">
                <FormField
                  control={form.control}
                  name="fileUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FileUpload
                          endpoint="messageFile"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="pb-6">
                <Button
                  disabled={isLoading}
                  className="w-full bg-indigo-500 text-white hover:bg-indigo-500/90"
                >
                  Send
                </Button>
              </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default MessageFileModal
