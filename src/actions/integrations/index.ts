'use server'

import { redirect } from 'next/navigation'
import { onCurrentUser } from '../user'
import { createIntegration, getIntegration, updateIntegration } from './queries'
import { generateTokens } from '@/lib/fetch'
import axios from 'axios'

export const onOAuthInstagram = (strategy: 'INSTAGRAM' | 'CRM') => {
  if (strategy === 'INSTAGRAM') {
    return redirect(process.env.INSTAGRAM_EMBEDDED_OAUTH_URL as string)
  }
}

export const onIntegrate = async (code: string) => {
  const user = await onCurrentUser()

  try {
    let integration = await getIntegration(user.id)

    // Generate tokens from Instagram API
    const token = await generateTokens(code)
    if (!token || !token.access_token) {
      console.log('🔴 401: Failed to generate token')
      return { status: 401 }
    }

    console.log('Access Token:', token)

    // Fetch Instagram user ID
    const insta_response = await axios.get(
      `${process.env.INSTAGRAM_BASE_URL}/me?fields=id&access_token=${token.access_token}`
    )

    console.log('Instagram User Data:', insta_response.data)
    const insta_id = insta_response.data.id

    // Correct expiration date logic
    const expire_date = new Date()
    expire_date.setDate(expire_date.getDate() + 60)

    if (!integration) {
      // No integration found → Create a new one
      console.log('🟢 Creating new integration...')
      const createdIntegration = await createIntegration(
        user.id,
        token.access_token,
        expire_date,
        insta_id
      )
      return { status: 200, data: createdIntegration }
    } else {
      // Integration exists → Update token
      console.log('🟢 Updating existing integration...')
      const updatedIntegration = await updateIntegration(
        token.access_token,
        expire_date,
        integration.integrations[0].id // Update the first matching integration
      )
      return { status: 200, data: updatedIntegration }
    }
  } catch (error) {
    console.log('🔴 500: Integration Error', error)
    return { status: 500 }
  }
}
