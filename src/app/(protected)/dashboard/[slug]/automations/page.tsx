import AutomationList from '@/components/global/automation-list'
import CreateAutomation from '@/components/global/create-automation'
import Search from '@/components/global/infobar/search'
import { Zap } from 'lucide-react'
import React from 'react'

type Props = {}

const Page = (props: Props) => {
  return (
    <div className="flex flex-col gap-6 w-full px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Automations</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Create and manage your automated workflows</p>
            </div>
          </div>
        </div>
        <CreateAutomation />
      </div>

      {/* Search Bar */}
      <div className="w-full">
        <Search slug="" />
      </div>

      {/* Automations List */}
      <AutomationList />
    </div>
  )
}

export default Page
