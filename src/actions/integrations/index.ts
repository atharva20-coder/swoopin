'use server'

import { redirect } from 'next/navigation'
import { onCurrentUser } from '../user'
import { createIntegration, getIntegration } from './queries'
import { generateTokens } from '@/lib/fetch'
import axios from 'axios'

// Temporary debug function
const showDebugInfo = (token: string, userId: string) => {
  if (typeof window !== 'undefined') {
    const debugDiv = document.createElement('div')
    debugDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #333;
      color: white;
      padding: 20px;
      border-radius: 8px;
      z-index: 9999;
      max-width: 400px;
      word-break: break-all;
    `
    debugDiv.innerHTML = `
      <h3>Integration Debug Info</h3>
      <p>Token: ${token.slice(0, 15)}...</p>
      <p>User ID: ${userId}</p>
      <button onclick="this.parentElement.remove()" style="margin-top: 10px; padding: 5px 10px; background: #666; border: none; color: white; border-radius: 4px;">Close</button>
    `
    document.body.appendChild(debugDiv)
  }
}

export const onIntegrate = async (code: string) => {
  const user = await onCurrentUser()

  try {
    try {
      const token = await generateTokens(code)
      console.log('Debug - Token:', token)
      
      if (!token || !token.access_token) {
        console.log('🔴 Failed to generate token')
        return { status: 401, error: 'Failed to generate token' }
      }

      const instaResponse = await axios.get(
        `${process.env.INSTAGRAM_BASE_URL}/me?fields=user_id,username&access_token=${token.access_token}`
      )
      console.log('Debug - Instagram Response:', instaResponse.data)

      if (!instaResponse.data?.user_id) {
        console.log('🔴 Failed to fetch Instagram user ID')
        return { status: 401, error: 'Failed to fetch Instagram user ID' }
      }

      // Show debug info
      showDebugInfo(token.access_token, instaResponse.data.user_id)

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

// Function to handle OAuth redirection for Instagram
export const onOAuthInstagram = (strategy: 'INSTAGRAM' | 'CRM') => {
  if (strategy === 'INSTAGRAM') {
    // Add force_reauthorize parameter to ensure fresh authentication
    const authUrl = `${process.env.INSTAGRAM_EMBEDDED_OAUTH_URL}&force_reauthorize=true`
    return redirect(authUrl)
  }
}