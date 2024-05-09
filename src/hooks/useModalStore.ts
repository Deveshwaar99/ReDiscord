import { SelectChannel, SelectServer } from '@/db/schema'
import { create } from 'zustand'
import { ChannelTypes } from '../../types'

type ModalType =
  | 'create-server'
  | 'invite'
  | 'edit-server'
  | 'manage-members'
  | 'create-channel'
  | 'leave-server'
  | 'delete-server'
  | 'delete-channel'

interface ModalData {
  server?: SelectServer
  channel?: SelectChannel
  channelType?: ChannelTypes
}

interface ModalStore {
  type: ModalType | null
  data: ModalData
  isOpen: boolean
  onOpen: (modalType: ModalType, modalData: ModalData) => void
  onClose: () => void
}

export const useModalStore = create<ModalStore>()(set => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (modalType, modalData = {}) => {
    set(() => ({
      type: modalType,
      isOpen: true,
      data: modalData,
    }))
  },
  onClose: () => set(() => ({ type: null, isOpen: false, data: {} })),
}))
