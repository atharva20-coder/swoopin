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
        <p className="text-sm font-medium text-green-600 dark:text-green-400">Carousel template created</p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {template.elements.map((element: any, index: number) => (
            <div key={index} className="min-w-[200px] bg-white dark:bg-neutral-800 p-3 rounded-md border border-gray-200 dark:border-neutral-700 flex-shrink-0 shadow-sm">
              {element.imageUrl && (
                <div className="w-full h-24 bg-gray-100 dark:bg-neutral-700 rounded mb-2 overflow-hidden relative">
                  <Image 
                    src={element.imageUrl} 
                    alt={element.title || "Carousel element"}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <p className="font-medium text-sm truncate text-gray-900 dark:text-gray-100">{element.title}</p>
              {element.subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{element.subtitle}</p>}
              {element.buttons?.length > 0 && (
                <div className="mt-2 flex flex-col gap-1">
                  {element.buttons.map((button: any, btnIndex: number) => (
                    <div key={btnIndex} className="text-xs bg-gray-100 dark:bg-neutral-700 p-1 rounded truncate flex items-center">
                      <span className={`w-2 h-2 rounded-full mr-1 ${button.type === 'WEB_URL' ? 'bg-blue-500' : 'bg-green-500'}`}></span>
                      <span className="text-gray-700 dark:text-gray-300">{button.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">This template will be used in your automation flow.</p>
      </div>
    );
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-24 p-3 rounded-full bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors shadow-md z-40"
      >
        <Image
          src="/icons/drawer.svg"
          alt="Open Drawer"
          width={32}
          height={32}
          className="opacity-70 dark:opacity-60"
        />
      </button>

      <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-semibold text-black dark:text-white">Message Templates</h2>
          
          <div className="space-y-4">
            <div className="p-4 border dark:border-neutral-700 rounded-lg transition-colors">
              <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection('generic')}>
                <h3 className="font-medium text-black dark:text-white">Carousel Template</h3>
                {expandedSections['generic'] ? <ChevronUp size={20} className="text-black dark:text-white" /> : <ChevronDown size={20} className="text-black dark:text-white" />}
              </div>
              {expandedSections['generic'] && (
                <div className="mt-3">
                  <p className="text-sm text-black dark:text-gray-300 mb-3">Create interactive carousel messages with multiple elements</p>
                  {!isPro ? (
                    <div className="p-3 bg-gray-50 dark:bg-neutral-800 rounded-md text-sm text-gray-600 dark:text-gray-400">
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

            <div className="p-4 border dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors">
              <div className="flex justify-between items-center" onClick={() => toggleSection('button')}>
                <h3 className="font-medium text-black dark:text-white">Button Template</h3>
                {expandedSections['button'] ? <ChevronUp size={20} className="text-black dark:text-white" /> : <ChevronDown size={20} className="text-black dark:text-white" />}
              </div>
              {expandedSections['button'] && (
                <p className="text-sm text-black dark:text-gray-300 mt-1">Add interactive buttons to your messages</p>
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