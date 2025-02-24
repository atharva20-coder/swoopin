import Billing from '@/components/global/billing'
import DeleteAccount from '@/components/global/delete-account'
import { OpenAISettings } from '@/components/global/openai-settings'
import React from 'react'

type Props = {}

const Page = (props: Props) => {
  return (
    <div className="flex flex-col gap-10">
      <Billing />
      <OpenAISettings />
      <DeleteAccount />
    </div>
  )
}

export default Page