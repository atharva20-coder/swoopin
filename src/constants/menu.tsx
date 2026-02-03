import {
  Home,
  MessageCircle,
  Zap,
  Calendar,
  Users,
  ShoppingBag,
  Megaphone,
  Database,
  Rocket,
  Settings,
  BarChart3,
  Building2,
} from "lucide-react";
import { v4 as uuid } from "uuid";

export type FieldProps = {
  label: string;
  id: string;
};

type SideBarProps = {
  icon: React.ReactNode;
  name?: string;
  isBeta?: boolean;
} & FieldProps;

export type MenuCategory = {
  id: string;
  title: string;
  items: SideBarProps[];
};

// Grouped sidebar menu for cleaner organization
export const SIDEBAR_MENU_GROUPED: MenuCategory[] = [
  {
    id: uuid(),
    title: "Core",
    items: [
      {
        id: uuid(),
        label: "home",
        icon: <Home className="w-5 h-5" />,
        name: "Dashboard",
      },
      {
        id: uuid(),
        label: "inbox",
        icon: <MessageCircle className="w-5 h-5" />,
        name: "Inbox",
      },
      {
        id: uuid(),
        label: "automations",
        icon: <Zap className="w-5 h-5" />,
        name: "Automations",
      },
    ],
  },
  {
    id: uuid(),
    title: "Content",
    items: [
      {
        id: uuid(),
        label: "scheduler",
        icon: <Calendar className="w-5 h-5" />,
        name: "Scheduler",
      },
    ],
  },
  {
    id: uuid(),
    title: "Growth",
    items: [
      {
        id: uuid(),
        label: "collabs",
        icon: <Users className="w-5 h-5" />,
        name: "Collabs",
        isBeta: true,
      },
      {
        id: uuid(),
        label: "commerce",
        icon: <ShoppingBag className="w-5 h-5" />,
        name: "Commerce",
        isBeta: true,
      },
      {
        id: uuid(),
        label: "ads",
        icon: <Megaphone className="w-5 h-5" />,
        name: "Ads",
        isBeta: true,
      },
      {
        id: uuid(),
        label: "data-hub",
        icon: <Database className="w-5 h-5" />,
        name: "Data Hub",
        isBeta: true,
      },
    ],
  },
];

// Bottom section items (always visible, not grouped)
export const SIDEBAR_BOTTOM_ITEMS: SideBarProps[] = [
  {
    id: uuid(),
    label: "integrations",
    icon: <Rocket className="w-5 h-5" />,
    name: "Integrations",
  },
  {
    id: uuid(),
    label: "settings",
    icon: <Settings className="w-5 h-5" />,
    name: "Settings",
  },
];

// Legacy flat menu (for backwards compatibility)
export const SIDEBAR_MENU: SideBarProps[] = [
  ...SIDEBAR_MENU_GROUPED.flatMap((cat) => cat.items),
  ...SIDEBAR_BOTTOM_ITEMS,
];

// Admin-specific sidebar menu
export const ADMIN_SIDEBAR_MENU: SideBarProps[] = [
  {
    id: uuid(),
    label: "admin",
    icon: <BarChart3 className="w-5 h-5" />,
    name: "Dashboard",
  },
  {
    id: uuid(),
    label: "admin/enquiries",
    icon: <Building2 className="w-5 h-5" />,
    name: "Enterprise Enquiries",
  },
  {
    id: uuid(),
    label: "admin/settings",
    icon: <Settings className="w-5 h-5" />,
    name: "Settings",
  },
];
