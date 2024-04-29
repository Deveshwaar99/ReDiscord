'use client'
import { useEffect, useState } from 'react'
import CreateChannel from '../modals/CreateChannel'
import CreateServerModal from '../modals/CreateServer'
import EditServerModal from '../modals/EditServer'
import InviteUserModal from '../modals/InviteUser'
import LeaveServerModal from '../modals/LeaveServer'
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
      <CreateChannel />
      <LeaveServerModal />
    </>
  )
}

export default ModalProvider
