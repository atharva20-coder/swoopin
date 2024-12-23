'use client'
import React from 'react'
import PaymentCard from './payment-card'
import { useQueryUser } from '@/hooks/user-queries'

type Props = {}

const Billing = (props: Props) => {
  const { data } = useQueryUser()
  return (
    <div className="container flex flex-col w-full gap-5 lg:flex-row lg:w-10/12 xl:w-8/12">
      <PaymentCard
        current={data?.data?.subscription?.plan!}
        label="FREE"
      />
      <PaymentCard
        current={data?.data?.subscription?.plan!}
        label="PRO"
      />
    </div>
  )
}

export default Billing