import Image from 'next/image'
import type React from 'react'

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full">
      <div className="relative w-7/12">
        <Image src="/auth.svg" alt="Auth" fill className="absolute inset-0 object-cover" priority />
      </div>
      <div className="flex w-5/12 items-center justify-center p-8">{children}</div>
    </div>
  )
}

export default AuthLayout
