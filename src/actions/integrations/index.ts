'use server'

import { redirect } from 'next/navigation'
import { onCurrentUser } from '../user'
import { createIntegration, getIntegration } from './queries'
import { generateTokens } from '@/lib/fetch'
import axios from 'axios'

// Function to handle OAuth redirection for Instagram
export const onOAuthInstagram = (strategy: 'INSTAGRAM' | 'CRM') => {
  if (strategy === 'INSTAGRAM') {
    // Add force_reauthorize parameter to ensure fresh authentication
    const authUrl = `${process.env.INSTAGRAM_EMBEDDED_OAUTH_URL}&force_reauthorize=true`
    return redirect(authUrl)
  }
}

export const onIntegrate = async (code: string) => {
  const user = await onCurrentUser()

  try {
    const integration = await getIntegration(user.id)
    
    try {
      const token = await generateTokens(code)
      
      if (!token || !token.access_token) {
        console.log('🔴 Failed to generate token')
        return { status: 401, error: 'Failed to generate token' }
      }

      const instaResponse = await axios.get(
        `${process.env.INSTAGRAM_BASE_URL}/me?fields=user_id,username&access_token=${token.access_token}`
      )

      if (!instaResponse.data?.user_id) {
        console.log('🔴 Failed to fetch Instagram user ID')
        return { status: 401, error: 'Failed to fetch Instagram user ID' }
      }

      const expire_date = new Date()
      expire_date.setDate(expire_date.getDate() + 60)

      const create = await createIntegration(
        user.id,
        token.access_token,
        expire_date,
        instaResponse.data.user_id
      )

      return { status: 200, data: create }
    } catch (tokenError) {
      console.log('🔴 Token generation or Instagram API error:', tokenError)
      return { status: 401, error: 'Authentication failed' }
    }

  } catch (error) {
    console.log('🔴 500', error)
    return { status: 500, error: 'Internal server error' }
  }
}