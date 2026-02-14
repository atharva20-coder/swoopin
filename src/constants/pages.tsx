import {
  AutomationDuoToneBlue,
  ContactsDuoToneBlue,
  HomeDuoToneBlue,
  RocketDuoToneBlue,
  SettingsDuoToneWhite,
} from "@/icons";
import { BellBlue } from "@/icons/bell";

export const PAGE_BREAD_CRUMBS: string[] = [
  "contacts",
  "automations",
  "integrations",
  "settings",
  "notifications",
  "billing",
];

type Props = {
  [page in string]: React.ReactNode;
};

export const PAGE_ICON: Props = {
  NOTIFICATIONS: <BellBlue />,
  AUTOMATIONS: <AutomationDuoToneBlue />,
  CONTACTS: <ContactsDuoToneBlue />,
  INTEGRATIONS: <RocketDuoToneBlue />,
  SETTINGS: <SettingsDuoToneWhite />,
  HOME: <HomeDuoToneBlue />,
};

export const PLANS = [
  {
    name: "Starter",
    description: "Perfect for getting started",
    price: "₹0",
    features: [
      "200 DMs & Comments/month",
      "3 Automations",
      "1 edit per automation/month",
      "7 days analytics history",
      "Community support",
    ],
    cta: "Get Started",
  },
  {
    name: "Plus",
    description: "For serious creators & businesses",
    price: "₹1,499",
    features: [
      "1,000 DMs & Comments/month",
      "10 Automations",
      "10 edits per automation/month",
      "20 Scheduled Posts/month",
      "100 AI responses/month",
      "90 days analytics",
      "Priority email support",
    ],
    cta: "Upgrade Now",
  },
  {
    name: "Pro",
    description: "Scale without limits",
    price: "₹2,999",
    features: [
      "Unlimited DMs & Comments",
      "Unlimited Automations",
      "Unlimited edits per automation",
      "Unlimited Scheduled Posts",
      "Unlimited AI responses",
      "365 days analytics",
      "API access",
      "Dedicated priority support",
    ],
    cta: "Go Pro",
  },
];
