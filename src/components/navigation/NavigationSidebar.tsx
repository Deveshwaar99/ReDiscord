import React from 'react'
import NavigiationAction from '@/components/navigation/NavigiationAction'

function NavigationSidebar() {
  return (
    <div className="flex h-full w-full flex-col items-center space-y-4 bg-[#E3E5E8] py-3 text-primary dark:bg-[#1E1F22]">
      <NavigiationAction />
    </div>
  )
}

export default NavigationSidebar
