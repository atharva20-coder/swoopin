import { v4 } from 'uuid'

type Props = {
  id: string
  label: string
  subLabel: string
  isPopular?: boolean
  href: string
}

export const DASHBOARD_CARDS: Props[] = [
  {
    id: v4(),
    label: '<strong>Auto-DM links from comments</strong>',
    subLabel: 'Send a link when people comment on a post or reel',
    isPopular: true,
    href: '/dashboard/integrations'
  },
  {
    id: v4(),
    label: '<strong>Generate leads with stories</strong>',
    subLabel: 'Use limited-time offers in your Stories to convert leads',
    href: '/dashboard/integrations'
  },
  {
    id: v4(),
    label: '<strong>Automate conversations with AI</strong>',
    subLabel: 'Get AI to collect your follower\'s info, share details or tell it how to reply',
    href: '/dashboard/integrations'
  },
]
