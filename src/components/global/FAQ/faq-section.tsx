"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../ui/accordion"

export const FAQSection = () => {
  return (
    <section className="min-h-screen px-4 sm:px-6 lg:px-8 bg-[#F2FFE2] flex items-center snap-start snap-always">
      <div className="max-w-7xl mx-auto w-full py-16">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-['Brice'] font-bold tracking-tight text-black mb-8">FAQs</h2>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          {/* Right Column - Accordion */}
          <div className="lg:col-span-12">
          <Accordion type="single" collapsible className="space-y-8" defaultValue="item-1">
            <AccordionItem 
              value="item-1" 
              className="border-0 border-b border-gray-200 [&[data-state=open]]:border-b-0"
            >
                <AccordionTrigger className="text-xl font-bold text-black hover:no-underline py-6">
                  Is this against Instagram&apos;s terms of service? 
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-6 text-lg">
                  No, our platform works within Instagram&apos;s API guidelines. We don&apos;t use any unauthorized methods of automation that could put your account at risk.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border-0 border-b border-gray-200">
                <AccordionTrigger className="text-xl font-bold text-black hover:no-underline py-6">
                  Do I need an Instagram Business accont?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-6 text-lg">
                  Yes, our platform requires an Instagram Business or Creator account to access the necessary API features for automation.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border-0 border-b border-gray-200">
                <AccordionTrigger className="text-xl font-bold text-black hover:no-underline py-6">
                  Will people know the response are automated?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-6 text-lg">
                  Our AI powered responses are designed to mimic human-like responses, making it seem as if the responses are coming from a human.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border-0 border-b border-gray-200">
                <AccordionTrigger className="text-xl font-bold text-black hover:no-underline py-6">
                  How much time will I save?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-6 text-lg">
                  Most users report saving 15-20 hours per week on engagement tasks, allowing them to focus on creating quality content instead
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border-0 border-b border-gray-200">
                <AccordionTrigger className="text-xl font-bold text-black hover:no-underline py-6">
                  Can I customize the automated responses?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-6 text-lg">
                  Absolutely! You have full control ovet all automated messages and can create different response templates for various scenerios.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border-0 border-b border-gray-200">
                <AccordionTrigger className="text-xl font-bold text-black hover:no-underline py-6">
                  Is there any limits on the number of automated responses?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-6 text-lg">
                  Different plans have different limits. Please check your plan details for more information. 
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  )
}