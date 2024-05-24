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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useModalStore } from '@/hooks/useModalStore'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useEffect, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'

function EditServerModal() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const { isOpen, type, onClose, data } = useModalStore()
  const { server } = data

  const isModalOpen = isOpen && type === 'edit-server'

  const formSchema = z.object({
    name: z
      .string()
      .min(5, {
        message: 'Server name must be between 5 to 25 characters.',
      })
      .max(25, {
        message: 'Server name must be between 5 to 25 characters.',
      }),

    imageUrl: z.string().min(1, {
      message: 'Server image is required.',
    }),
  })
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: server?.name || ' ',
      imageUrl:
        server?.imageUrl || 'https://utfs.io/f/f9084c92-c855-4945-b8cb-8e9e8f663ec8-9394t8.jpg',
    },
  })
  useEffect(() => {
    if (server) {
      form.setValue('name', server.name)
      form.setValue('imageUrl', server.imageUrl)
    }
  }, [server, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const isSameData = values.name === server?.name && values.imageUrl === server?.imageUrl
    if (isSameData) {
      return toast('No values changed')
    }

    startTransition(async () => {
      try {
        const response = await axios.patch(`/api/servers/${server?.id}`, values)
        if (response) {
          toast.success('Server details updated successfully')
        }
        form.reset()
        onClose()
        router.refresh()
      } catch (error) {
        console.error('Edit server Error--', error)
        toast.error('Somthing went wrong')
      }
    })
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
          <DialogTitle className="text-center text-2xl font-bold">Edit your Server</DialogTitle>
          <DialogDescription className="text-balance text-center text-zinc-500 dark:text-gray-400">
            Give youe new server a personality with a name and an icon.You can always change it
            later
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6 px-6">
              <div className="flex items-center justify-center text-center">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FileUpload
                          endpoint="serverImage"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-zinc-500 dark:text-[#b5bac1]">
                      SERVER NAME
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="border-0 bg-zinc-300/50 focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-[#1e1f22] dark:text-[#dbdee1]"
                        placeholder="My server"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pb-6">
                <Button
                  disabled={isPending}
                  className="w-full bg-indigo-500 text-white hover:bg-indigo-500/90"
                >
                  Save
                </Button>
              </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default EditServerModal
