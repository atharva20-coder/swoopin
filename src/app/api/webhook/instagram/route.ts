import { NextResponse } from 'next/server'
import { client } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    
    // Verify webhook signature if provided by Instagram
    // const signature = request.headers.get('x-hub-signature')
    
    // Handle different webhook events
    switch (payload.object) {
      case 'instagram':
        switch (payload.entry[0]?.changes[0]?.field) {
          case 'comments':
            // Handle new comments
            const comment = payload.entry[0].changes[0].value
            // Process comment data
            break
          case 'mentions':
            // Handle mentions
            const mention = payload.entry[0].changes[0].value
            // Process mention data
            break
          case 'messages':
            // Handle direct messages
            const message = payload.entry[0].changes[0].value
            // Process message data
            break
        }
        break
    }

    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle webhook verification from Instagram
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  // Verify against your token
  const verify_token = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN

  if (mode === 'subscribe' && token === verify_token) {
    return new Response(challenge)
  }

  return new Response('Forbidden', { status: 403 })
}