import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { z } from 'zod'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function verifyServerData(requestData: unknown) {
  const ServerDataSchema = z.object({
    name: z.string().min(5).max(25),
    imageUrl: z.string().min(1),
  })
  return ServerDataSchema.safeParse(requestData)
}

export function verifyChannelData(requestData: unknown) {
  const ChannelDataSchema = z.object({
    name: z
      .string()
      .min(5)
      .max(15)
      .refine(val => val !== 'general', {
        message: "The name cannot be 'general'",
      }),
    type: z.enum(['AUDIO', 'TEXT', 'VIDEO']),
  })
  return ChannelDataSchema.safeParse(requestData)
}
