'use client'
import React from 'react'
import ActionTooltip from '@/components/ActionTooltip'
import { Plus } from 'lucide-react'
import { useModalStore } from '@/hooks/useModalStore'

function NavigiationAction() {
  const { onOpen } = useModalStore()
  return (
    <div>
      <ActionTooltip side="right" align="center" label="Add a server">
        <button
          onClick={() => {
            onOpen('create-server')
          }}
          className="group flex items-center"
        >
          <div className="mx-3 flex h-[44px] w-[44px] items-center justify-center overflow-hidden rounded-[24px] bg-white transition-all group-hover:rounded-[16px] group-hover:bg-emerald-500 dark:bg-neutral-700">
            <Plus className="text-emerald-500 transition group-hover:text-white" size={25} />
          </div>
        </button>
      </ActionTooltip>
    </div>
  )
}

export default NavigiationAction
