"use client";

import LandingNav from "@/components/global/landing-nav";
import Footer from "@/components/global/footer";

export default function RefundPage() {
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
            Refund Policy
          </h1>
          <p className="text-lg text-gray-600 dark:text-neutral-400">
            We want you to be satisfied with our service. Here's our refund policy.
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              1. Subscription Refunds
            </h2>
            <p className="text-gray-600 dark:text-neutral-400 mb-4">
              We offer a 7-day money-back guarantee for new subscribers. If you're not satisfied 
              with our service within the first 7 days of your subscription, you can request a 
              full refund.
            </p>
            <p className="text-gray-600 dark:text-neutral-400">
              After the 7-day period, we do not offer refunds for the remaining subscription period. 
              You may cancel your subscription at any time, and you will continue to have access 
              until the end of your billing period.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              2. How to Request a Refund
            </h2>
            <p className="text-gray-600 dark:text-neutral-400 mb-4">
              To request a refund:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-neutral-400 space-y-2">
              <li>Email us at <a href="mailto:billing@ninthnode.com" className="text-blue-600 dark:text-blue-400 hover:underline">billing@ninthnode.com</a></li>
              <li>Include your account email and reason for the refund</li>
              <li>Submit your request within 7 days of your purchase</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              3. Processing Time
            </h2>
            <p className="text-gray-600 dark:text-neutral-400">
              Refunds are typically processed within 5-10 business days. The refund will be issued 
              to the original payment method. Depending on your bank or payment provider, it may 
              take additional time for the refund to appear in your account.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              4. Exceptions
            </h2>
            <p className="text-gray-600 dark:text-neutral-400 mb-4">
              Refunds may not be available in the following cases:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-neutral-400 space-y-2">
              <li>Violation of our Terms of Service</li>
              <li>Abuse of the refund policy (multiple refund requests)</li>
              <li>Requests made after the 7-day refund period</li>
              <li>Promotional or discounted subscriptions (unless stated otherwise)</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              5. Free Trial
            </h2>
            <p className="text-gray-600 dark:text-neutral-400">
              If we offer a free trial, you will not be charged during the trial period. 
              You can cancel at any time during the trial without being charged. If you don't 
              cancel before the trial ends, your payment method will be charged for the subscription.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              6. Contact Us
            </h2>
            <p className="text-gray-600 dark:text-neutral-400">
              Have questions about refunds? Contact our billing team at{" "}
              <a href="mailto:billing@ninthnode.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                billing@ninthnode.com
              </a>
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
