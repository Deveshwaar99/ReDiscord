import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { z } from 'zod'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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
export function verifyChannelData(requestData: any) {
  const result = ChannelDataSchema.safeParse(requestData)
  return result
}
