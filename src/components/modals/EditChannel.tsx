'use client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
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
import { useRouter } from 'next/navigation'
import { useEffect, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChannelType } from '@/db/schema'
import axios from 'axios'
import toast from 'react-hot-toast'

function EditChannelModal() {
  const [isPending, startTransition] = useTransition()
  const { isOpen, type, onClose, data } = useModalStore()
  const { server, channel } = data
  const isModalOpen = isOpen && type === 'edit-channel'

  const router = useRouter()

  const formSchema = z.object({
    name: z
      .string()
      .min(5, {
        message: 'Channel name must be between 5 to 25 characters.',
      })
      .max(25, {
        message: 'Channel name must be between 5 to 25 characters.',
      })
      .refine(name => name !== 'general', { message: " Channel Name cannot be 'general'" }),
    type: z.enum(ChannelType.enumValues),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  })

  useEffect(() => {
    if (channel) {
      form.setValue('name', channel?.name!)
      form.setValue('type', channel?.type!)
    }
  }, [form, channel])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const isSameData = channel?.name === values.name && channel.type === values.type
    if (isSameData) {
      return toast('No values changed')
    }
    startTransition(async () => {
      try {
        await axios.patch(`/api/servers/${server?.id}/channels/${channel?.id}`, values)
        toast.success('Channel Updated')
        form.reset()
        onClose()
      } catch (error) {
        toast.error('Unable to save!')
        console.error('--Edit channel Error--', error)
      } finally {
        router.refresh()
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
          <DialogTitle className="text-center text-2xl font-bold">Edit Channel</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6 px-6">
              <div className="flex items-center justify-center text-center"></div>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-zinc-500 dark:text-[#b5bac1]">
                      CHANNEL NAME
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="border-0 bg-zinc-300/50 focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-[#1e1f22] dark:text-[#dbdee1]"
                        placeholder="Enter channel name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <Select disabled={isPending} onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="border-0 bg-zinc-300/50 focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-[#1e1f22] dark:text-[#dbdee1]">
                        <SelectValue placeholder="Select a channel type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Channel Types</SelectLabel>
                          {ChannelType.enumValues.map(item => (
                            <SelectItem key={item} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-500" />
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

export default EditChannelModal
