'use client'
import { useEffect, useState } from 'react'
import CreateChannelModal from '../modals/CreateChannel'
import CreateServerModal from '../modals/CreateServer'
import DeleteServerModal from '../modals/DeleteServer'
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
      <CreateChannelModal />
      <LeaveServerModal />
      <DeleteServerModal />
    </>
  )
}

export default ModalProvider
