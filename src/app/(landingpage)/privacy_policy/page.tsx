"use client";

import LandingNav from "@/components/global/landing-nav";
import Footer from "@/components/global/footer";
import NinthNodeLogo from "@/components/global/ninth-node-logo";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-black">
      <LandingNav />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-32">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <NinthNodeLogo className="w-12 h-12" showText={false} />
            <p className="text-sm text-gray-500 dark:text-neutral-500 font-medium">
              Last updated: January 1, 2025
            </p>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600 dark:text-neutral-400">
            At NinthNode, we respect your privacy and are committed to protecting it.
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              1. Introduction
            </h2>
            <p className="text-gray-600 dark:text-neutral-400 mb-4">
              This Privacy Policy explains how NinthNode ("we", "our", or "us") collects, uses, and protects your personal information when you use our service. By using NinthNode, you agree to the terms described in this policy.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              2. Data We Collect
            </h2>
            <p className="text-gray-600 dark:text-neutral-400 mb-4">
              NinthNode collects minimal data necessary to provide our services, including:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-neutral-400 space-y-2">
              <li><strong>Profile Information:</strong> Username, profile picture, and public details from connected platforms (e.g., Instagram).</li>
              <li><strong>Usage Data:</strong> Interaction data, features used, and device/browser information.</li>
              <li><strong>Integration Data:</strong> Information shared with third-party services required for automation functionality.</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              3. How We Use Your Data
            </h2>
            <p className="text-gray-600 dark:text-neutral-400 mb-4">
              We use your data strictly to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-neutral-400 space-y-2">
              <li>Provide, maintain, and improve NinthNode services.</li>
              <li>Execute the automations and responses you configure.</li>
              <li>Communicate with you regarding updates, security alerts, and support.</li>
              <li>Monitor and prevent unauthorized use or abuse of the service.</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              4. Data Sharing
            </h2>
            <p className="text-gray-600 dark:text-neutral-400 mb-4">
              NinthNode does not sell your personal data. We may share data only with:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-neutral-400 space-y-2">
              <li><strong>Service Providers:</strong> Trusted third-party vendors who assist in operating our platform (e.g., hosting, analytics).</li>
              <li><strong>Legal Requirements:</strong> If required by law, regulation, or legal process.</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              5. Data Security
            </h2>
            <p className="text-gray-600 dark:text-neutral-400 mb-4">
              We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure. We strive to protect your information but cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              6. Your Rights
            </h2>
            <p className="text-gray-600 dark:text-neutral-400 mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-neutral-400 space-y-2">
              <li>Access and update your personal information.</li>
              <li>Request the deletion of your account and associated data.</li>
              <li>Opt-out of non-essential communications.</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              7. Cookies
            </h2>
            <p className="text-gray-600 dark:text-neutral-400 mb-4">
              We use cookies to enhance your experience, analyze usage, and store preferences. You can manage cookie settings in your browser, though disabling them may affect some features of NinthNode.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              8. Contact Us
            </h2>
            <p className="text-gray-600 dark:text-neutral-400">
              If you have questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:support@ninthnode.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                support@ninthnode.com
              </a>
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}