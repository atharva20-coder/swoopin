import { onIntegrate } from '@/actions/integrations'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
  searchParams: {
    code: string
  }
}

const Page = async ({ searchParams: { code } }: Props) => {
  if (code) {
    console.log(code)
    const user = await onIntegrate(code.split('#_')[0])
    if (user.status === 200) {
      // Use name field and remove spaces for URL slug
      const slug = user.data?.name?.replace(/\s+/g, '') || 'user';
      return redirect(
        `/dashboard/${slug}/integrations`
      )
    }
  }
  return redirect('/sign-up')
}

export default Page