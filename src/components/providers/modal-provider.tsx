'use client'
import { useEffect, useState } from 'react'
import CreateServerModal from '../modals/CreateServer'
import EditServerModal from '../modals/EditServer'
import InviteUserModal from '../modals/InviteUser'
import ManageMembersModal from '../modals/ManageMembers'

function ModalProvider() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return (
    <>
      <CreateServerModal />
      <EditServerModal />
      <InviteUserModal />
      <ManageMembersModal />
    </>
  )
}

export default ModalProvider
