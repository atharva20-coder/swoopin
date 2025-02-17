import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Swoopin - AI-Powered Social Media Marketing Automation Platform",
  description: "Transform your social media presence with Swoopin's AI automation. Boost engagement, generate leads, and provide 24/7 customer support across Instagram, WhatsApp, and Messenger.",
  keywords: "social media automation, Instagram automation, WhatsApp marketing, Messenger bot, AI chatbot, lead generation, customer support automation, social media marketing tools",
  openGraph: {
    title: "Swoopin - Revolutionize Your Social Media Marketing",
    description: "Automate your social media interactions, boost engagement, and drive sales with AI-powered responses across Instagram, WhatsApp, and Messenger.",
    type: "website",
    url: "https://swoopin.com",
    images: [{
      url: "/public/header/robot avatar.svg",
      width: 1200,
      height: 630,
      alt: "Swoopin AI Social Media Automation"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Swoopin - Smart Social Media Automation",
    description: "Leverage AI to automate your social media marketing. Generate leads, increase engagement, and provide instant customer support.",
    images: ["/public/header/robot avatar.svg"]
  }
};