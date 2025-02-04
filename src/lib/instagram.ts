import axios from 'axios'
import { client } from './prisma'

export class InstagramAPI {
  private static instance: InstagramAPI
  private constructor() {}

  public static getInstance(): InstagramAPI {
    if (!InstagramAPI.instance) {
      InstagramAPI.instance = new InstagramAPI()
    }
    return InstagramAPI.instance
  }

  async getUserProfile(accessToken: string) {
    try {
      const response = await axios.get(
        `${process.env.INSTAGRAM_BASE_URL}/me?fields=id,username,account_type&access_token=${accessToken}`
      )
      return response.data
    } catch (error) {
      console.error('Error fetching user profile:', error)
      throw error
    }
  }

  async getMediaInsights(mediaId: string, accessToken: string) {
    try {
      const response = await axios.get(
        `${process.env.INSTAGRAM_BASE_URL}/${mediaId}/insights?metric=engagement,impressions,reach&access_token=${accessToken}`
      )
      return response.data
    } catch (error) {
      console.error('Error fetching media insights:', error)
      throw error
    }
  }

  async getUserMedia(userId: string, accessToken: string) {
    try {
      const response = await axios.get(
        `${process.env.INSTAGRAM_BASE_URL}/${userId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink&access_token=${accessToken}`
      )
      return response.data
    } catch (error) {
      console.error('Error fetching user media:', error)
      throw error
    }
  }

  async refreshAccessToken(accessToken: string) {
    try {
      const response = await axios.get(
        `${process.env.INSTAGRAM_BASE_URL}/refresh_access_token?grant_type=ig_refresh_token&access_token=${accessToken}`
      )
      return response.data
    } catch (error) {
      console.error('Error refreshing access token:', error)
      throw error
    }
  }

  async checkTokenValidity(accessToken: string) {
    try {
      const response = await axios.get(
        `${process.env.INSTAGRAM_BASE_URL}/debug_token?input_token=${accessToken}&access_token=${accessToken}`
      )
      return response.data.data
    } catch (error) {
      console.error('Error checking token validity:', error)
      throw error
    }
  }

  async updateUserToken(userId: string, newToken: string, expiresAt: Date) {
    try {
      await client.integrations.updateMany({
        where: {
          userId,
          name: 'INSTAGRAM'
        },
        data: {
          token: newToken,
          expiresAt
        }
      })
    } catch (error) {
      console.error('Error updating user token:', error)
      throw error
    }
  }
}