import { onIntegrate } from '@/actions/integrations'
import { redirect } from 'next/navigation'

type Props = {
  searchParams: {
    code?: string
  }
}

const Page = async ({ searchParams: { code } }: Props) => {
  if (!code) {
    return redirect('/sign-up')
  }

  // Remove any hash fragments
  const cleanCode = code.split('#_')[0]

  try {
    const result = await onIntegrate(cleanCode)

    switch (result.status) {
      case 200:
        return redirect(
          `/dashboard/${result.data?.firstname}${result.data?.lastname}/integrations`
        )
      case 403:
        return redirect('/dashboard/integrations?error=already_integrated')
      case 500:
        return redirect('/dashboard/integrations?error=server_error')
      default:
        return redirect('/sign-up')
    }
  } catch (error) {
    console.error('Instagram Integration Error:', error)
    return redirect('/dashboard/integrations?error=unexpected')
  }
}

export default Page