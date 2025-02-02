'use server'

import { redirect } from 'next/navigation'
import { onCurrentUser } from '../user'
import { createIntegration, getIntegration } from './queries'
import { generateTokens } from '@/lib/fetch'
import axios from 'axios'

export const onOAuthInstagram = (strategy: 'INSTAGRAM' | 'CRM') => {
  if (strategy === 'INSTAGRAM') {
    return redirect(process.env.INSTAGRAM_EMBEDDED_OAUTH_URL as string)
  }
}

export const onIntegrate = async (code: string) => {
  const user = await onCurrentUser()
  if (!user) {
    console.log('🔴 No authenticated user found')
    return { status: 401, error: 'User not authenticated' }
  }

  try {
    const integration = await getIntegration(user.id)

    // If integration exists but is empty, process further
    if (!integration || integration.integrations.length === 0) {
      console.log('🟢 Fetching Instagram tokens...')
      const token = await generateTokens(code)

      if (!token || !token.access_token) {
        console.log('🔴 Failed to get access token')
        return { status: 401, error: 'Failed to get Instagram access token' }
      }

      console.log('🟢 Access token received:', token.access_token)

      try {
        console.log('🟢 Fetching Instagram user ID...')
        const instaResponse = await axios.get(
          `https://graph.instagram.com/me?fields=id,username&access_token=${token.access_token}`
        )

        const instagramId = instaResponse.data.id
        console.log('🟢 Instagram User ID:', instagramId)

        // Calculate expiration date (60 days from now)
        const expireDate = new Date()
        expireDate.setDate(expireDate.getDate() + 60)

        console.log('🟢 Creating integration in DB...')
        const createdIntegration = await createIntegration(
          user.id,
          token.access_token,
          expireDate,
          instagramId
        )

        console.log('🟢 Integration created successfully:', createdIntegration)
        return { status: 200, data: createdIntegration }
      } catch (error) {
        console.log('🔴 Error fetching Instagram user ID:', error.response?.data || error.message)
        return { status: 500, error: 'Failed to fetch Instagram user ID' }
      }
    }

    console.log('🔴 Integration already exists for this user')
    return { status: 409, error: 'Integration already exists' }
  } catch (error) {
    console.log('🔴 Unexpected error:', error)
    return { status: 500, error: 'Internal server error' }
  }
}
