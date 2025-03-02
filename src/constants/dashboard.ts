import { v4 } from 'uuid'

type Props = {
  id: string
  label: string
  subLabel: string
  isPopular?: boolean
  href: string
  video?: string
  description?: string
  metrics?: {
    value?: string | number
    change?: number
    previousValue?: string | number
  }
}

export const DASHBOARD_CARDS: Props[] = [
  {
    id: v4(),
    label: '<strong>Auto-DM links from comments</strong>',
    subLabel: 'Send a link when people comment on a post or reel',
    isPopular: true,
    href: '/integrations',
    video: '/landingpage-images/Google_Mio_Icons_1080x1080.mp4',
    description: 'Automatically send direct messages with links to users who comment on your posts or reels. This automation helps you convert engagement into meaningful interactions and potential leads.'
  },
  {
    id: v4(),
    label: '<strong>Generate leads with stories</strong>',
    subLabel: 'Use limited-time offers in your Stories to convert leads',
    href: '/integrations',
    video: '/landingpage-images/Google_Mio_Color_1080x1080.mp4',
    description: 'Create engaging Stories with time-sensitive offers to generate leads. This feature helps you leverage the urgency factor to increase conversion rates from your Instagram Stories.'
  },
  {
    id: v4(),
    label: '<strong>Automate conversations with AI</strong>',
    subLabel: 'Get AI to collect your follower\'s info, share details or tell it how to reply',
    href: '/integrations',
    video: '/landingpage-images/bg-vid.mp4',
    description: 'Leverage AI to automate your Instagram conversations. Collect information from followers, share details, and maintain engaging conversations automatically while maintaining a personal touch.'
  },
]
