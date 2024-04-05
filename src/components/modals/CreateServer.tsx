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
  DialogTrigger,
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
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'

function CreateServerModal() {
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  const formSchema = z.object({
    serverName: z
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
      serverName: '',
      imageUrl: 'https://utfs.io/f/f9084c92-c855-4945-b8cb-8e9e8f663ec8-9394t8.jpg',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const { data } = await axios.post('/api/servers', values)
      if (data.error) {
        toast.error(data.error)
        return console.error(data.error)
      }
      toast.success('Server Created')
      console.log('server created successfully')
      form.reset()
      router.refresh()
      window.location.reload()
    } catch (error) {
      toast.error('Unable to create Server!')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  function handleClose() {
    form.reset()
  }

  return (
    <Dialog>
      <DialogTrigger>Open</DialogTrigger>

      <DialogOverlay className="bg-[#1e1f22]" />
      <DialogContent className="w-[440px] overflow-hidden border-none bg-[#313338] p-0 text-white">
        <DialogHeader className="px-6 pt-8">
          <DialogTitle className="text-center text-2xl font-bold">Create your Server</DialogTitle>
          <DialogDescription className="text-balance text-center text-gray-400">
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
                name="serverName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-[#b5bac1]">
                      SERVER NAME
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="border-0 bg-[#1e1f22] text-[#dbdee1] focus-visible:ring-0 focus-visible:ring-offset-0"
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
                  disabled={isLoading}
                  className="w-full bg-indigo-500 text-white hover:bg-indigo-500/90"
                >
                  Create
                </Button>
              </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateServerModal
