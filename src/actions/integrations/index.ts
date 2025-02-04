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
  const user = await onCurrentUser()

  try {
    try {
      console.log('Starting token generation with code:', code)
      const token = await generateTokens(code)
      console.log('Token response:', {
        success: !!token,
        hasAccessToken: !!token?.access_token,
      })
      
      if (!token || !token.access_token) {
        return { 
          status: 401, 
          error: 'Failed to generate token',
          details: 'No token or access_token received'
        }
      }

      console.log('Fetching Instagram user data...')
      const instaResponse = await axios.get(
        `${process.env.INSTAGRAM_BASE_URL}/me?fields=user_id,username&access_token=${token.access_token}`
      )
      console.log('Instagram API response:', {
        success: !!instaResponse.data,
        userId: instaResponse.data?.user_id,
      })

      if (!instaResponse.data?.user_id) {
        return { 
          status: 401, 
          error: 'Failed to fetch Instagram user ID',
          details: 'No user_id in response'
        }
      }

      const expire_date = new Date()
      expire_date.setDate(expire_date.getDate() + 60)

      console.log('Creating integration...')
      const create = await createIntegration(
        user.id,
        token.access_token,
        expire_date,
        instaResponse.data.user_id
      )
      console.log('Integration created successfully')

      return { 
        status: 200, 
        data: create,
        details: {
          token: token.access_token.slice(0, 15) + '...',
          userId: instaResponse.data.user_id
        }
      }
    } catch (tokenError: any) {
      console.error('Integration error:', {
        message: tokenError.message,
        response: tokenError.response?.data,
      })
      return { 
        status: 401, 
        error: 'Authentication failed',
        details: tokenError.message
      }
    }
  } catch (error: any) {
    console.error('Server error:', {
      message: error.message,
      type: error.constructor.name
    })
    return { 
      status: 500, 
      error: 'Internal server error',
      details: error.message
    }
  }
}