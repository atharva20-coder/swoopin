"use client";

import LandingNav from "@/components/global/landing-nav";
import Footer from "@/components/global/footer";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-black">
      <LandingNav />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-32">
        {/* Header */}
        <div className="mb-12">
          <p className="text-sm text-gray-500 dark:text-neutral-500 mb-4">
            Last updated: January 1, 2025
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Terms & Conditions
          </h1>
          <p className="text-lg text-gray-600 dark:text-neutral-400">
            Please read these terms carefully before using NinthNode.
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-600 dark:text-neutral-400 mb-4">
              By accessing or using NinthNode ("Service"), you agree to be bound by these Terms & Conditions. 
              If you do not agree to these terms, please do not use our Service.
            </p>
            <p className="text-gray-600 dark:text-neutral-400">
              These terms apply to all visitors, users, and others who access or use the Service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              2. Description of Service
            </h2>
            <p className="text-gray-600 dark:text-neutral-400 mb-4">
              NinthNode provides social media automation tools including:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-neutral-400 space-y-2">
              <li>Automated DM responses and management</li>
              <li>Comment automation and filtering</li>
              <li>Content scheduling and publishing</li>
              <li>Lead generation and data collection</li>
              <li>Analytics and reporting</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              3. User Accounts
            </h2>
            <p className="text-gray-600 dark:text-neutral-400 mb-4">
              When you create an account with us, you must provide accurate, complete, and current information. 
              Failure to do so constitutes a breach of the Terms.
            </p>
            <p className="text-gray-600 dark:text-neutral-400 mb-4">
              You are responsible for safeguarding the password that you use to access the Service and for any 
              activities or actions under your password.
            </p>
            <p className="text-gray-600 dark:text-neutral-400">
              You agree not to disclose your password to any third party. You must notify us immediately upon 
              becoming aware of any breach of security or unauthorized use of your account.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              4. Acceptable Use
            </h2>
            <p className="text-gray-600 dark:text-neutral-400 mb-4">
              You agree not to use the Service:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-neutral-400 space-y-2">
              <li>In any way that violates any applicable law or regulation</li>
              <li>To send spam or unsolicited messages</li>
              <li>To impersonate or attempt to impersonate another person</li>
              <li>To engage in any conduct that restricts or inhibits anyone's use of the Service</li>
              <li>To violate any third-party platform's terms of service (including Instagram, Facebook, etc.)</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              5. Intellectual Property
            </h2>
            <p className="text-gray-600 dark:text-neutral-400 mb-4">
              The Service and its original content, features, and functionality are and will remain the 
              exclusive property of NinthNode and its licensors.
            </p>
            <p className="text-gray-600 dark:text-neutral-400">
              Our trademarks and trade dress may not be used in connection with any product or service 
              without the prior written consent of NinthNode.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              6. Termination
            </h2>
            <p className="text-gray-600 dark:text-neutral-400 mb-4">
              We may terminate or suspend your account immediately, without prior notice or liability, 
              for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
            <p className="text-gray-600 dark:text-neutral-400">
              Upon termination, your right to use the Service will cease immediately. If you wish to 
              terminate your account, you may simply discontinue using the Service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              7. Limitation of Liability
            </h2>
            <p className="text-gray-600 dark:text-neutral-400">
              In no event shall NinthNode, nor its directors, employees, partners, agents, suppliers, or 
              affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, 
              including without limitation, loss of profits, data, use, goodwill, or other intangible losses, 
              resulting from your access to or use of or inability to access or use the Service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              8. Changes to Terms
            </h2>
            <p className="text-gray-600 dark:text-neutral-400 mb-4">
              We reserve the right to modify or replace these Terms at any time. If a revision is material, 
              we will try to provide at least 30 days notice prior to any new terms taking effect.
            </p>
            <p className="text-gray-600 dark:text-neutral-400">
              By continuing to access or use our Service after those revisions become effective, you agree 
              to be bound by the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              9. Contact Us
            </h2>
            <p className="text-gray-600 dark:text-neutral-400">
              If you have any questions about these Terms, please contact us at{" "}
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
