import {
  AutomationDuoToneWhite,
  HomeDuoToneWhite,
  RocketDuoToneWhite,
  SettingsDuoToneWhite,
  Bell,
  CalendarDuoToneWhite,
} from '@/icons'
import { Users, BarChart3, Building2, CreditCard, MessageCircle } from 'lucide-react'
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
    icon: <MessageCircle className="w-5 h-5 text-gray-100" />,
    name: 'Inbox',
  },
  {
    id: uuid(),
    label: 'scheduler',
    icon: <CalendarDuoToneWhite />,
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
