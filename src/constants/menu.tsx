import {
  AutomationDuoToneWhite,
  HomeDuoToneWhite,
  RocketDuoToneWhite,
  SettingsDuoToneWhite,
  Bell,
  CalendarDuoToneWhite,
} from '@/icons'
import { Users, BarChart3, Building2, CreditCard, MessageCircle, Calendar, CalendarCheck } from 'lucide-react'
import { v4 as uuid } from 'uuid'

export type FieldProps = {
  label: string
  id: string
}

type SideBarProps = {
  icon: React.ReactNode;
  name?: string;
} & FieldProps

export const SIDEBAR_MENU: SideBarProps[] = [
  {
    id: uuid(),
    label: 'home',
    icon: <HomeDuoToneWhite />,
  },
  {
    id: uuid(),
    label: 'inbox',
    icon: <MessageCircle className="w-5 h-5 text-[#9B9CA0]" />,
    name: 'Inbox',
  },
  {
    id: uuid(),
    label: 'scheduler',
    icon: <Calendar className="w-5 h-5 text-[#9B9CA0]" />,
  },
  {
    id: uuid(),
    label: 'events',
    icon: <CalendarCheck className="w-5 h-5 text-[#9B9CA0]" />,
    name: 'Events',
  },
  {
    id: uuid(),
    label: 'collabs',
    icon: <Users className="w-5 h-5 text-[#9B9CA0]" />,
    name: 'Collabs',
  },
  {
    id: uuid(),
    label: 'automations',
    icon: <AutomationDuoToneWhite />,
  },
  {
    id: uuid(),
    label: 'integrations',
    icon: <RocketDuoToneWhite />,
  },
  {
    id: uuid(),
    label: 'notifications',
    icon: <Bell color="#fff" />,
  },
  {
    id: uuid(),
    label: 'settings',
    icon: <SettingsDuoToneWhite />,
  },
]

// Admin-specific sidebar menu
export const ADMIN_SIDEBAR_MENU: SideBarProps[] = [
  {
    id: uuid(),
    label: 'admin',
    icon: <BarChart3 className="w-5 h-5 text-gray-600 dark:text-gray-300" />,
    name: 'Dashboard',
  },
  {
    id: uuid(),
    label: 'admin/enquiries',
    icon: <Building2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />,
    name: 'Enterprise Enquiries',
  },
  {
    id: uuid(),
    label: 'admin/settings',
    icon: <SettingsDuoToneWhite />,
    name: 'Settings',
  },
]
