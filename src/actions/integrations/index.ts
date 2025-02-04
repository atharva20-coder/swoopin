'use server'

import { redirect } from 'next/navigation'
import { onCurrentUser } from '../user'
import { createIntegration, getIntegration } from './queries'
import { generateTokens } from '@/lib/fetch'
import axios from 'axios'

// Function to handle OAuth redirection for Instagram
export const onOAuthInstagram = (strategy: 'INSTAGRAM' | 'CRM') => {
  if (strategy === 'INSTAGRAM') {
    return redirect(process.env.INSTAGRAM_EMBEDDED_OAUTH_URL as string)
  }
}

// Function to handle integration with Instagram
export const onIntegrate = async (code: string) => {
  // Fetch the current user
  const user = await onCurrentUser()

  try {
    // Check if the user already has an integration
    const integration = await getIntegration(user.id)
    
    // Check if user doesn't have integration record or has no Instagram integration
    if (!integration || !integration.integrations.some(i => i.name === 'INSTAGRAM')) {
      try {
        const token = await generateTokens(code)
        
        if (!token || !token.access_token) {
          console.log('🔴 Failed to generate token')
          return { status: 401, error: 'Failed to generate token' }
        }

        // Fetch Instagram user ID
        const instaResponse = await axios.get(
          `${process.env.INSTAGRAM_BASE_URL}/me?fields=user_id&access_token=${token.access_token}`
        )

        if (!instaResponse.data?.user_id) {
          console.log('🔴 Failed to fetch Instagram user ID')
          return { status: 401, error: 'Failed to fetch Instagram user ID' }
        }

        // Calculate expiration (60 days from now)
        const expire_date = new Date()
        expire_date.setDate(expire_date.getDate() + 60)

        // Create the integration
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
    }

    console.log('🔴 Instagram integration already exists')
    return { status: 404, error: 'Instagram integration already exists' }
  } catch (error) {
    console.log('🔴 500', error)
    return { status: 500, error: 'Internal server error' }
  }
}