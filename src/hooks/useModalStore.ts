import { create } from 'zustand'
type ModalType = 'create-server'
interface ModalStore {
  type: ModalType | null
  isOpen: boolean
  onOpen: (modalType: ModalType) => void
  onClose: () => void
}

export const useModalStore = create<ModalStore>()(set => ({
  type: null,
  isOpen: false,
  onOpen: modalType =>
    set(() => ({
      type: modalType,
      isOpen: true,
    })),
  onClose: () => set(() => ({ type: null, isOpen: false })),
}))
