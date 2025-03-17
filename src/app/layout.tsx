import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs' 
import { ThemeProvider } from '@/contexts/theme-context';
import { Toaster } from "sonner";
import ReactQueryProvider from "@/providers/react-query-provider";
import ReduxProvider from "@/providers/redux-provider";
import CookieConsent from '@/components/global/cookie-consent';

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://auctorn.com'),
  title: "Auctorn - AI-Powered Social Media Automation for Creators & Influencers",
  description: "Automate your social media marketing with AI-powered conversations, smart replies, and promotional automation. Perfect for creators, influencers, and businesses looking to scale their social media presence.",
  keywords: "social media automation, Instagram automation, WhatsApp marketing, Messenger bot, AI chatbot, influencer marketing tools, content creator tools, social media management, automated DM responses, ChatGPT integration, Gemini AI integration, conversation automation, smart replies, promotional automation, lead generation automation, social media engagement, AI marketing tools, influencer automation, customer support automation, social media ROI, automated messaging, social media scheduling, AI-powered marketing, social media analytics, Instagram DM automation, WhatsApp business automation, social media CRM, social media lead generation, automated customer service, social media conversion, digital marketing automation, social media optimization, content automation, social commerce automation, automated engagement, social media workflow automation, AI conversation bot, social media sales automation, influencer campaign automation, automated follow-up messages, social media growth tools",
  authors: [{ name: "Auctorn" }],
  creator: "Auctorn",
  publisher: "Auctorn",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://auctorn.com",
    siteName: "Auctorn",
    title: "Auctorn - AI-Powered Social Media & Influencer Marketing Automation",
    description: "Transform your social media presence with AI-powered automation. Leverage ChatGPT and Gemini AI for smart conversations, automated promotions, and intelligent customer engagement across Instagram, WhatsApp, and Messenger.",
    images: [{
      url: "/header/robot avatar.svg",
      width: 1200,
      height: 630,
      alt: "Auctorn AI-Powered Social Media Automation Platform"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Auctorn - Smart Social Media Automation for Creators",
    description: "AI-powered social media automation platform featuring ChatGPT & Gemini integration for intelligent conversations, promotional automation, and enhanced customer engagement.",
    images: ["/header/robot avatar.svg"],
    creator: "@auctorn"
  },
  alternates: {
    canonical: "https://auctorn.com"
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4F46E5"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={jakarta.className}>
        <ClerkProvider>
          <ReactQueryProvider>
            <ReduxProvider>
              <ThemeProvider>
                {children}
                <Toaster />
                <CookieConsent />
              </ThemeProvider>
            </ReduxProvider>
          </ReactQueryProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}