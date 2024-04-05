import React from 'react'

import { UploadDropzone } from '@/lib/uploadthing'
import Image from 'next/image'
import { FileIcon, X } from 'lucide-react'
type FileUploadProps = {
  endpoint: 'serverImage' | 'messageFile'
  value: string
  onChange: (url?: string) => void
}

function FileUpload({ endpoint, value, onChange }: FileUploadProps) {
  const fileType = value?.split('.').pop()

  if (value && fileType !== 'pdf') {
    return (
      <div className="relative h-20 w-20">
        <Image fill src={value} alt="Upload" className="rounded-full" />
        <button
          onClick={() => onChange('')}
          className="absolute right-0 top-0 rounded-full bg-rose-500 p-1 text-white shadow-sm"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  if (value && fileType === 'pdf') {
    return (
      <div className="relative mt-2 flex items-center rounded-md bg-background/10 p-2">
        <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 text-sm text-indigo-500 hover:underline dark:text-indigo-400"
        >
          {value}
        </a>
        <button
          onClick={() => onChange('')}
          className="absolute -right-2 -top-2 rounded-full bg-rose-500 p-1 text-white shadow-sm"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <UploadDropzone
      endpoint={endpoint}
      onClientUploadComplete={res => {
        onChange(res[0].url)
      }}
      onUploadError={(error: Error) => {
        console.error(error)
      }}
      className={
        'ut-button:bg-indigo-500 ut-allowed-content:text-[#b5bac1] ut-label:text-[#b5bac1] ut-button:ut-readying:bg-indigo-300 ut-ready:border-neutral-400 ut-uploading:border-neutral-400 ut-uploading:ut-button:bg-indigo-300 ut-uploading:ut-button:after:bg-indigo-500'
      }
    />
  )
}

export default FileUpload
