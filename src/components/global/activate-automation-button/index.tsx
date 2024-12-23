import { Button } from '@/components/ui/button'
import React from 'react'
import { ActiveAutomation } from '@/icons/active-automation'
import { useQueryAutomation } from '@/hooks/user-queries'
import { useMutationData } from '@/hooks/use-mutation-data'
import { activateAutomation } from '@/actions/automations'
import { Loader2 } from 'lucide-react'

type Props = {
  id: string
}

const ActivateAutomationButton = ({id}: Props) => {
  //Fetch some automation data
  const {data} = useQueryAutomation(id)
  const {mutate, isPending} = useMutationData(['activate'], (data: {state: boolean}) => activateAutomation(id, data.state),
'automation-info')

    //Setup Optimistic UI
    
  return (
    <Button
    disabled={isPending}
    onClick={() => mutate({state: !data?.data?.active})}
    className='lg:px-10 bg-gradient-to-br hover:opacity-80 text-white rounded-full from-[#3352CC] font-medium to-[#1C2D70] ml-4'>
            {isPending ? <Loader2 className='animate-spin' /> : <ActiveAutomation />}
            <p className='hidden lg:inline'>{data?.data?.active ? 'Disable' : 'Activate'}</p>
    </Button>
  )
}

export default ActivateAutomationButton