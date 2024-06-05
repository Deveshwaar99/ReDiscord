'use client'
import { useEffect, useState } from 'react'
import CreateChannelModal from '../modals/CreateChannel'
import CreateServerModal from '../modals/CreateServer'
import DeleteChannelModal from '../modals/DeleteChannel'
import DeleteServerModal from '../modals/DeleteServer'
import EditChannelModal from '../modals/EditChannel'
import EditServerModal from '../modals/EditServer'
import InviteUserModal from '../modals/InviteUser'
import LeaveServerModal from '../modals/LeaveServer'
import ManageMembersModal from '../modals/ManageMembers'
import MessageFileModal from '../modals/MessageFileModal'

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
      <DeleteChannelModal />
      <EditChannelModal />
      <MessageFileModal />
    </>
  )
}

export default ModalProvider
