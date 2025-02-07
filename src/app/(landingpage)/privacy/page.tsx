import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function PrivacyPolicy() {
  return (
    <main className="bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-sm rounded-xl p-8 text-white">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-blue-100">
              At Swoopin, we respect your privacy. This Privacy Policy explains how we collect, use, and protect your personal information when you use our service. By using Swoopin, you agree to the terms described here.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Data We Collect</h2>
            <p className="text-blue-100 mb-4">Swoopin collects minimal data, including:</p>
            <ul className="list-disc list-inside text-blue-100 space-y-2">
              <li>Instagram Profile Information: Username, profile picture, and public details.</li>
              <li>Usage Data: Interaction data, device/browser data.</li>
              <li>Third-Party Integrations: Information shared with third-party services like Instagram API.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Data</h2>
            <p className="text-blue-100 mb-4">We use your data to:</p>
            <ul className="list-disc list-inside text-blue-100 space-y-2">
              <li>Provide and improve Swoopin services.</li>
              <li>Enhance performance and fix issues.</li>
              <li>Communicate updates and support.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Data Sharing</h2>
            <p className="text-blue-100 mb-4">Swoopin does not sell or trade your data, but we may share data with:</p>
            <ul className="list-disc list-inside text-blue-100 space-y-2">
              <li>Service Providers: Third-party companies that help us run Swoopin.</li>
              <li>Legal Obligations: If required by law.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p className="text-blue-100">
              We use standard security measures to protect your data, but no method is completely secure. We strive to protect your information but cannot guarantee complete security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
            <p className="text-blue-100 mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-blue-100 space-y-2">
              <li>Access and update your personal data.</li>
              <li>Request the deletion of your data.</li>
              <li>Opt-out of marketing communications.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Cookies and Tracking</h2>
            <p className="text-blue-100">
              Swoopin uses cookies for a better user experience. You can manage cookies through your browser settings, but disabling them may affect functionality.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
            <p className="text-blue-100 mb-4">If you have questions or concerns about this Privacy Policy, contact us at:</p>
            <div className="text-blue-100">
              <p>Email: atharvajoshi2520@gmail.com</p>
              <p>Developer Website: devatharvajoshi.vercel.app</p>
            </div>
          </section>

          <section className="bg-white/5 rounded-xl p-8">
            <h2 className="text-2xl font-semibold mb-6">We&apos;d Love to Hear Your Feedback!</h2>
            <form className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Your Name"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Your Email"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
              <div>
                <Textarea
                  placeholder="Your Feedback"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[100px]"
                />
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Submit
              </Button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}