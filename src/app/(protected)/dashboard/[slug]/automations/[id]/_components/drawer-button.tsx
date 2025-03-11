"use client";

import Drawer from "@/components/global/drawer";
import React, { useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
import CarouselTemplateForm from "@/components/global/carouselTemplateForm";
import { useQueryUser, useQueryAutomation } from "@/hooks/user-queries";

type Props = {
  id: string;
};

const DrawerButton = ({ id }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({    'generic': false,    'button': false,    'menu': false,    'product': false,    'reply': false,    'attachment': false  });
  const [optimisticTemplate, setOptimisticTemplate] = useState<any>(null);
  const { data: userData } = useQueryUser();
  const { data: automationData } = useQueryAutomation(id);
  const isPro = userData?.data?.subscription?.plan === "PRO";
  const hasCarouselTemplate = automationData?.data?.carouselTemplates && automationData.data.carouselTemplates.length > 0;

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({      ...prev,      [section]: !prev[section]    }));
  };

  // Render carousel template preview
  const renderCarouselPreview = () => {
    const template = optimisticTemplate || automationData?.data?.carouselTemplates?.[0];
    if (!template || !template.elements || template.elements.length === 0) return null;

    return (
      <div className="mt-3 space-y-3">
        <p className="text-sm font-medium text-green-600">Carousel template created</p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {template.elements.map((element: any, index: number) => (
            <div key={index} className="min-w-[200px] bg-white p-3 rounded-md border border-gray-200 flex-shrink-0 shadow-sm">
              {element.imageUrl && (
                <div className="w-full h-24 bg-gray-100 rounded mb-2 overflow-hidden relative">
                  <Image 
                    src={element.imageUrl} 
                    alt={element.title || "Carousel element"}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <p className="font-medium text-sm truncate">{element.title}</p>
              {element.subtitle && <p className="text-xs text-gray-500 truncate">{element.subtitle}</p>}
              {element.buttons?.length > 0 && (
                <div className="mt-2 flex flex-col gap-1">
                  {element.buttons.map((button: any, btnIndex: number) => (
                    <div key={btnIndex} className="text-xs bg-gray-100 p-1 rounded truncate flex items-center">
                      <span className={`w-2 h-2 rounded-full mr-1 ${button.type === 'WEB_URL' ? 'bg-blue-500' : 'bg-green-500'}`}></span>
                      {button.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500">This template will be used in your automation flow.</p>
      </div>
    );
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-24 p-3 rounded-full bg-white hover:bg-gray-50 transition-colors shadow-md z-40"
      >
        <Image
          src="/icons/drawer.svg"
          alt="Open Drawer"
          width={32}
          height={32}
          className="opacity-70"
        />
      </button>

      <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-semibold text-black">Message Templates</h2>
          
          <div className="space-y-4">
            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection('generic')}>
                <h3 className="font-medium text-black">Carousel Template</h3>
                {expandedSections['generic'] ? <ChevronUp size={20} className="text-black" /> : <ChevronDown size={20} className="text-black" />}
              </div>
              {expandedSections['generic'] && (
                <div className="mt-3">
                  <p className="text-sm text-black mb-3">Create interactive carousel messages with multiple elements</p>
                  {!isPro ? (
                    <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-600">
                      Upgrade to PRO to use this feature
                    </div>
                  ) : hasCarouselTemplate || optimisticTemplate ? (
                    renderCarouselPreview()
                  ) : (
                    <CarouselTemplateForm automationId={id} onSuccess={(elements) => {
                      setOptimisticTemplate({
                        elements: elements
                      });
                      setIsOpen(false);
                    }} />
                  )}
                </div>
              )}
            </div>

            {/* Other template sections remain unchanged */}
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="flex justify-between items-center" onClick={() => toggleSection('button')}>
                <h3 className="font-medium text-black">Button Template</h3>
                {expandedSections['button'] ? <ChevronUp size={20} className="text-black" /> : <ChevronDown size={20} className="text-black" />}
              </div>
              {expandedSections['button'] && (
                <p className="text-sm text-black mt-1">Add interactive buttons to your messages</p>
              )}
            </div>
            
            {/* Rest of the sections remain unchanged */}
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default DrawerButton;