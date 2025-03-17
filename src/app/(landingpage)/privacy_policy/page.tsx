"use client";

import Link from "next/link";
import LandingNav from "@/components/global/landing-nav";

export default function TOCPage() {
  return (
    <main className="min-h-screen bg-background dark:bg-gray-900">
      <LandingNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-[72px]">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full lg:w-[250px] lg:sticky lg:top-[92px] lg:h-[calc(100vh-92px)] bg-[#f9fafb] dark:bg-gray-800 rounded-lg p-6">
            <nav className="space-y-2">
              <Link href="#terms" className="block text-sm text-gray-900 dark:text-white hover:text-[#4F46E5] dark:hover:text-[#4F46E5] transition-colors underline">
                Terms of Service
              </Link>
              <Link href="#data-processing" className="block text-sm text-gray-600 dark:text-gray-300 hover:text-[#4F46E5] dark:hover:text-[#4F46E5] transition-colors">
                Data Processing Addendum
              </Link>
              <Link href="#privacy" className="block text-sm text-gray-600 dark:text-gray-300 hover:text-[#4F46E5] dark:hover:text-[#4F46E5] transition-colors">
                Privacy Policy
              </Link>
              <Link href="#candidate" className="block text-sm text-gray-600 dark:text-gray-300 hover:text-[#4F46E5] dark:hover:text-[#4F46E5] transition-colors">
                Candidate Privacy Statement
              </Link>
              <Link href="#providers" className="block text-sm text-gray-600 dark:text-gray-300 hover:text-[#4F46E5] dark:hover:text-[#4F46E5] transition-colors">
                Service Providers
              </Link>
              <Link href="#cookies" className="block text-sm text-gray-600 dark:text-gray-300 hover:text-[#4F46E5] dark:hover:text-[#4F46E5] transition-colors">
                Cookies Statement
              </Link>
              <Link href="#service-level" className="block text-sm text-gray-600 dark:text-gray-300 hover:text-[#4F46E5] dark:hover:text-[#4F46E5] transition-colors">
                Service Level Agreement
              </Link>
              <Link href="#ai" className="block text-sm text-gray-600 dark:text-gray-300 hover:text-[#4F46E5] dark:hover:text-[#4F46E5] transition-colors">
                AI Supplementary Terms
              </Link>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="max-w-3xl">
              {/* Header */}
              <div className="mb-8">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">EFFECTIVE DATE: FEBRUARY 8, 2024</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">PREVIOUS VERSION</p>
                <h1 className={`font-['Brice'] text-4xl md:text-5xl font-bold mb-8 text-black dark:text-white tracking-tight leading-tight`}>
                  Auctorn, inc. - Terms of Service
                </h1>
              </div>

              {/* Content */}
              <div className="prose prose-lg dark:prose-invert">
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  These Terms of Service constitute a legally binding agreement between you and
                  Auctorn, Inc. (together with its subsidiaries and affiliates, &quot;Austorn, Inc.&quot;,
                  &quot;Auctorn&quot;, &quot;we,&quot; &quot;our&quot; or &quot;us&quot;) governing your use of our products, services,
                  information, contents and tools, mobile application (the &quot;App&quot;), and website (the
                  &quot;Site&quot; and collectively with the foregoing, the &quot;Services&quot;).
                </p>

                <p className="text-gray-900 dark:text-white font-medium mb-8">
                  YOU ACKNOWLEDGE AND AGREE THAT, BY CLICKING ON THE &quot;I AGREE&quot; OR SIMILAR
                  BUTTON, REGISTERING FOR AN ACCOUNT, DOWNLOADING THE APP OR ANY APP
                  UPGRADES, USING THE APP ON YOUR MOBILE DEVICE, VISITING THE SITE, ACCESSING
                  OR USING THE SERVICES, OR PARTICIPATING IN AN ELECTRONIC CONVERSATION
                  FACILITATED BY THE SERVICES (ANY SUCH PARTICIPANT, A &quot;CONVERSATION
                  PARTICIPANT&quot;), YOU ARE INDICATING THAT YOU HAVE READ, UNDERSTAND AND
                  AGREE TO BE BOUND BY THESE TERMS OF SERVICE, WHETHER OR NOT YOU HAVE
                  REGISTERED VIA THE SITE OR THE APP.
                </p>

                <h2 id="privacy" className="text-2xl font-bold mb-6 mt-12 text-black dark:text-white">Privacy Policy</h2>
                
                <h3 className="text-xl font-semibold mb-4 text-black dark:text-white">1. Introduction</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  At Auctorn, we respect your privacy. This Privacy Policy explains how we collect, use, and protect your personal information when you use our service. By using Auctorn, you agree to the terms described here.
                </p>

                <h3 className="text-xl font-semibold mb-4 text-black dark:text-white">2. Data We Collect</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Auctorn collects minimal data, including:</p>
                <ul className="list-disc pl-6 mb-6 text-gray-600 dark:text-gray-300">
                  <li className="mb-2">Instagram Profile Information: Username, profile picture, and public details.</li>
                  <li className="mb-2">Usage Data: Interaction data, device/browser data.</li>
                  <li className="mb-2">Third-Party Integrations: Information shared with third-party services like Instagram API.</li>
                </ul>

                <h3 className="text-xl font-semibold mb-4 text-black dark:text-white">3. How We Use Your Data</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">We use your data to:</p>
                <ul className="list-disc pl-6 mb-6 text-gray-600 dark:text-gray-300">
                  <li className="mb-2">Provide and improve Auctorn services.</li>
                  <li className="mb-2">Enhance performance and fix issues.</li>
                  <li className="mb-2">Communicate updates and support.</li>
                </ul>

                <h3 className="text-xl font-semibold mb-4 text-black dark:text-white">4. Data Sharing</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Auctorn does not sell or trade your data, but we may share data with:</p>
                <ul className="list-disc pl-6 mb-6 text-gray-600 dark:text-gray-300">
                  <li className="mb-2">Service Providers: Third-party companies that help us run Auctorn.</li>
                  <li className="mb-2">Legal Obligations: If required by law.</li>
                </ul>

                <h3 className="text-xl font-semibold mb-4 text-black dark:text-white">5. Data Security</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  We use standard security measures to protect your data, but no method is completely secure. We strive to protect your information but cannot guarantee complete security.
                </p>

                <h3 className="text-xl font-semibold mb-4 text-black dark:text-white">6. Your Rights</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">You have the right to:</p>
                <ul className="list-disc pl-6 mb-6 text-gray-600 dark:text-gray-300">
                  <li className="mb-2">Access and update your personal data.</li>
                  <li className="mb-2">Request the deletion of your data.</li>
                  <li className="mb-2">Opt-out of marketing communications.</li>
                </ul>

                <h3 className="text-xl font-semibold mb-4 text-black dark:text-white">7. Cookies and Tracking</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Auctorn uses cookies for a better user experience. You can manage cookies through your browser settings, but disabling them may affect functionality.
                </p>

                <h3 className="text-xl font-semibold mb-4 text-black dark:text-white">8. Contact Us</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">If you have questions or concerns about this Privacy Policy, contact us at:</p>
                <p className="text-gray-600 dark:text-gray-300 mb-2">Email: atharvajoshi2520@gmail.com</p>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Developer Website: devatharvajoshi.vercel.app</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}