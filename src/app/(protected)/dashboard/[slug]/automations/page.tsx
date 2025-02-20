import AutomationList from '@/components/global/automation-list'
import CreateAutomation from '@/components/global/create-automation'
import Search from '@/components/global/infobar/search'
import React from 'react'

type Props = {}

const Page = (props: Props) => {
  return (
    <div className="flex flex-col gap-y-8 w-full px-4 sm:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-4 sm:gap-0">
        <div className="w-full sm:w-auto">
          <Search slug="" />
        </div>
        <div className="w-full sm:w-auto">
          <CreateAutomation />
        </div>
      </div>
      <div className="w-full">
        <AutomationList />
      </div>
    </div>
  )
}

export default Page
