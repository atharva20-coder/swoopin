'use server'

import { redirect } from 'next/navigation'
import { onCurrentUser } from '../user'
import { createIntegration, getIntegration } from './queries'
import { generateTokens } from '@/lib/fetch'
import axios from 'axios'

// Function to handle OAuth redirection for Instagram
export const onOAuthInstagram = (strategy: "INSTAGRAM" | "CRM") => {
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

    // If no integration exists, proceed to create one
    if (integration && integration.integrations.length === 0) {
      // Generate tokens using the provided OAuth code
      const token = await generateTokens(code)
      console.log('Generated Token:', token) // Print the generated token

      if (token) {
        // Fetch the Instagram user ID using the access token
        const insta_id = await axios.get(
          `${process.env.INSTAGRAM_BASE_URL}/me?fields=user_id&access_token=${token.access_token}`
        )

        console.log('Instagram User ID:', insta_id.data.user_id) // Print the Instagram user ID

        // Calculate the token expiration date (60 days from today)
        const today = new Date()
        const expire_date = today.setDate(today.getDate() + 60)

        // Create the integration in the database
        const create = await createIntegration(
          user.id,
          token.access_token,
          new Date(expire_date),
          insta_id.data.user_id
        )

        // Return success response
        return { status: 200, data: create }
      }

      // If token generation fails, return 401 Unauthorized
      console.log('🔴 401')
      return { status: 401 }
    }

    // If integration already exists, return 404 Not Found
    console.log('🔴 404')
    return { status: 404 }
  } catch (error) {
    // Handle any errors and return 500 Internal Server Error
    console.log('🔴 500', error)
    return { status: 500 }
  }
}