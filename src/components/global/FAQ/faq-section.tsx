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
                  What are the six steps of a product launch plan?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-6">
                  1. List out the facts – Gather your team and agree upon logistics such as launch date, product type, key deliverables, and more.<br/><br/>
                  2. Understand the big picture – Jot down overall objectives on your product launch strategy template.<br/><br/>
                  3. Create internal awareness – Ensure your team is on the same page with launch details. Delegate action steps to prepare for the big day.<br/><br/>
                  4. Generate external buzz – Design an outreach plan involving partners, the press, and other sources.<br/><br/>
                  5. Build market awareness – Expand your presence in the market as your product gains momentum.<br/><br/>
                  6. Respond to feedback – Evaluate key metrics and keep iterating.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border-0 border-b border-gray-200">
                <AccordionTrigger className="text-xl font-bold text-black hover:no-underline py-6">
                  What should a product launch include?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-6">
                  <p className="mb-4">Using product launch templates can help you keep all the specifics straight during this exciting time. A product launch plan example typically includes:</p>
                  <p className="mb-4"><strong>The product itself</strong> – Understand your audience, divide tasks among your team, and ensure your production pipeline and delivery processes run smoothly before the launch date.</p>
                  <p><strong>The go-to-market strategy</strong> – Prep your sales team, design marketing activities, clarify your messaging, and hash it out with collaborators as you approach the big day.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border-0 border-b border-gray-200">
                <AccordionTrigger className="text-xl font-bold text-black hover:no-underline py-6">
                  How do you introduce a product launch?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-6">
                  Clarifying your selling point is essential in introducing your product to the market. Bring your team together and jot down ideas on a new product launch template. Work toward a consistent message that will align every department and help you achieve your shared goals.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  )
}