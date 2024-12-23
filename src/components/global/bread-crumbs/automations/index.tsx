'use client'
import { ChevronRight, PencilIcon } from 'lucide-react'
import React from 'react'
import ActivateAutomationButton from '../../activate-automation-button'
import { useQueryAutomation } from '@/hooks/user-queries'
import { useEditAutomation } from '@/hooks/use-automations'
import { useMutationDataState } from '@/hooks/use-mutation-data'
import { Input } from '@/components/ui/input'

type Props = {
  id: string
}

const AutomationsBreadCrumb = ({ id }: Props) => {
  const { data } = useQueryAutomation(id)
  const { edit, enableEdit, inputRef, isPending } = useEditAutomation(id)

  const { latestVariable } = useMutationDataState(['update-automation'])

  return (
    <div className="rounded-full w-full p-5 bg-[#18181B1A] flex items-center">
      <div className="flex items-center min-w-0 gap-x-3">
        <p className="text-[#9B9CA0] truncate">Automations</p>
        <ChevronRight
          className="flex-shrink-0"
          color="#9B9CA0"
        />
        <span className="flex items-center min-w-0 gap-x-3">
          {edit ? (
            <Input
              ref={inputRef}
              placeholder={
                isPending ? latestVariable.variables : 'Add a new name'
              }
              className="h-auto p-0 text-base bg-transparent border-none outline-none"
            />
          ) : (
            <p className="text-[#9B9CA0] truncate">
              {latestVariable?.variables
                ? latestVariable?.variables.name
                : data?.data?.name}
            </p>
          )}
          {edit ? (
            <></>
          ) : (
            <span
              className="flex-shrink-0 mr-4 transition duration-100 cursor-pointer hover:opacity-75"
              onClick={enableEdit}
            >
              <PencilIcon size={14} />
            </span>
          )}
        </span>
      </div>

      <div className="flex items-center ml-auto gap-x-5">
        <p className="hidden min-w-0 text-sm truncate md:block text-text-secondary/60">
          All states are automatically saved
        </p>
        <div className="flex flex-shrink-0 gap-x-5">
          <p className="min-w-0 text-sm truncate text-text-secondary">
            Changes Saved
          </p>
        </div>
      </div>
      <ActivateAutomationButton id={id} />
    </div>
  )
}

export default AutomationsBreadCrumb