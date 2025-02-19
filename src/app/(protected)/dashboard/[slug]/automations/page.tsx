import AutomationList from '@/components/global/automation-list'
import CreateAutomation from '@/components/global/create-automation'
import Search from '@/components/global/infobar/search'
import React from 'react'

type Props = {}

const Page = (props: Props) => {
  return (
    <div className="flex flex-col gap-y-8 w-full">
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col gap-y-2">
          <Search slug="" />
        </div>
        <CreateAutomation />
      </div>
      <div className="w-full">
        <AutomationList />
      </div>
    </div>
  )
}

export default Page
