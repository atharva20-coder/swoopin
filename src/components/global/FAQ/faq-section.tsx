"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../ui/accordion"

export const FAQSection = () => {
  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 bg-white dark:bg-black">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-12 text-center">
          Frequently asked questions
        </h2>
        
        <Accordion type="single" collapsible className="space-y-0" defaultValue="item-1">
          <AccordionItem 
            value="item-1" 
            className="border-b border-gray-200 dark:border-neutral-800"
          >
            <AccordionTrigger className="text-lg font-medium text-gray-900 dark:text-white hover:no-underline py-6 text-left">
              Is this against Instagram&apos;s terms of service? 
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-neutral-400 pb-6">
              No, our platform works within Instagram&apos;s API guidelines. We use official Meta APIs and don&apos;t use any unauthorized methods that could put your account at risk.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="border-b border-gray-200 dark:border-neutral-800">
            <AccordionTrigger className="text-lg font-medium text-gray-900 dark:text-white hover:no-underline py-6 text-left">
              Do I need an Instagram Business account?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-neutral-400 pb-6">
              Yes, our platform requires an Instagram Business or Creator account to access the necessary API features for automation.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="border-b border-gray-200 dark:border-neutral-800">
            <AccordionTrigger className="text-lg font-medium text-gray-900 dark:text-white hover:no-underline py-6 text-left">
              Will people know the responses are automated?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-neutral-400 pb-6">
              Our AI-powered responses are designed to sound natural and human-like. You can also customize the tone and style to match your brand voice.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4" className="border-b border-gray-200 dark:border-neutral-800">
            <AccordionTrigger className="text-lg font-medium text-gray-900 dark:text-white hover:no-underline py-6 text-left">
              How much time will I save?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-neutral-400 pb-6">
              Most users report saving 15-20 hours per week on engagement tasks, allowing them to focus on creating quality content instead.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5" className="border-b border-gray-200 dark:border-neutral-800">
            <AccordionTrigger className="text-lg font-medium text-gray-900 dark:text-white hover:no-underline py-6 text-left">
              Can I customize the automated responses?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-neutral-400 pb-6">
              Absolutely! You have full control over all automated messages and can create different response templates for various scenarios.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6" className="border-b border-gray-200 dark:border-neutral-800">
            <AccordionTrigger className="text-lg font-medium text-gray-900 dark:text-white hover:no-underline py-6 text-left">
              Is the platform free to use?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-neutral-400 pb-6">
              Yes, we offer a free plan with basic features. Premium plans are available for users who need more automations and advanced features.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  )
}