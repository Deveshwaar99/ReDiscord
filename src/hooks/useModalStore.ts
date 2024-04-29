import { SelectServer } from '@/db/schema'
import { create } from 'zustand'
type ModalType =
  | 'create-server'
  | 'invite'
  | 'edit-server'
  | 'manage-members'
  | 'create-channel'
  | 'leave-server'

interface ModalData {
  server?: SelectServer
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
