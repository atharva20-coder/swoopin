import React from 'react'
import { OpenAISettings } from '@/app/(protected)/dashboard/[slug]/settings/_components/openai-settings'
import DeleteAccount from '@/app/(protected)/dashboard/[slug]/settings/_components/delete-account'
import { Button } from '@/components/ui/button'
import { CreditCard } from 'lucide-react'
import Link from 'next/link'

type Props = {}

const Page = (props: Props) => {
  return (
    <div className="w-full mx-auto px-4 py-8">
      <div className="bg-white dark:bg-background-80 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-6 space-y-8">
          <div className="pb-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Settings</h2>
          </div>
          <div className="space-y-6 md:space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4 md:gap-0">
              <div className="space-y-2 text-center md:text-left w-full md:w-auto">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Subscription</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage your account settings and preferences.</p>
              </div>
              <Link href="./billing" className="w-full md:w-auto">
                <Button variant="outline" className="w-full md:w-auto flex items-center gap-2 justify-center py-4 md:py-6 px-6 md:px-8 bg-white dark:bg-background-80 text-gray-900 dark:text-white border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-background-90">
                  <CreditCard className="h-5 w-5" />
                  Manage Subscription
                </Button>
              </Link>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-800 pt-6 md:pt-8">
              <div className="flex flex-col space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">OpenAI Integration</h3>
                <div className="bg-gray-50 dark:bg-background-90 rounded-lg p-4 md:p-6">
                  <OpenAISettings/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-16">
        <h2 className="text-xl font-bold text-red-600 dark:text-red-500 mb-4">Danger Zone</h2>
        <DeleteAccount/>
      </div>
    </div>
  )
}

export default Page