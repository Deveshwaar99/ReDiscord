'use client'
import { useEffect, useState } from 'react'
import CreateServerModal from '../modals/CreateServer'
import InviteUserModal from '../modals/InviteUser'

function ModalProvider() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return (
    <>
      <CreateServerModal />
      <InviteUserModal />
    </>
  )
}

export default ModalProvider
