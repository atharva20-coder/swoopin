import { Instagram, MessageCircle, AtSign, Mail, Facebook, Twitter, Linkedin, Youtube } from "lucide-react";

type Props = {
  title: string;
  icon: React.ReactNode;
  description: string;
  strategy: "INSTAGRAM" | "CRM";
  buttonText: string;
  onConnect: () => Promise<void>;
  comingSoon?: boolean;
};

export const INTEGRATION_CARDS: Props[] = [
  {
    title: "Connect Instagram",
    description: "Integrate your Instagram account to reach your audience",
    icon: <Instagram className="w-6 h-6 text-[#E1306C]" />,
    strategy: "INSTAGRAM",
    buttonText: "Connect Instagram",
    onConnect: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
  },
  {
    title: "Connect Facebook",
    description: "Connect with Facebook to expand your reach",
    icon: <Facebook className="w-6 h-6 text-[#1877F2]" />,
    strategy: "CRM",
    buttonText: "Connect Facebook",
    onConnect: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
    comingSoon: true,
  },
  {
    title: "Connect Messenger",
    description: "Connect with Facebook Messenger to engage with customers",
    icon: <MessageCircle className="w-6 h-6 text-[#0084FF]" />,
    strategy: "CRM",
    buttonText: "Connect Messenger",
    onConnect: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
    comingSoon: true,
  },
  {
    title: "Connect Threads",
    description: "Expand your reach through Threads integration",
    icon: <AtSign className="w-6 h-6 text-gray-900 dark:text-white" />,
    strategy: "CRM",
    buttonText: "Connect Threads",
    onConnect: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
    comingSoon: true,
  },
  {
    title: "Connect Twitter",
    description: "Engage with your audience on Twitter/X",
    icon: <Twitter className="w-6 h-6 text-gray-900 dark:text-white" />,
    strategy: "CRM",
    buttonText: "Connect Twitter",
    onConnect: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
    comingSoon: true,
  },
  {
    title: "Connect LinkedIn",
    description: "Build professional connections on LinkedIn",
    icon: <Linkedin className="w-6 h-6 text-[#0A66C2]" />,
    strategy: "CRM",
    buttonText: "Connect LinkedIn",
    onConnect: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
    comingSoon: true,
  },
  {
    title: "Connect YouTube",
    description: "Manage your YouTube channel and engage viewers",
    icon: <Youtube className="w-6 h-6 text-[#FF0000]" />,
    strategy: "CRM",
    buttonText: "Connect YouTube",
    onConnect: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
    comingSoon: true,
  },
  {
    title: "Connect Newsletter",
    description: "Engage your audience through email newsletters",
    icon: <Mail className="w-6 h-6 text-[#EA4335]" />,
    strategy: "CRM",
    buttonText: "Connect Newsletter",
    onConnect: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
    comingSoon: true,
  },
];