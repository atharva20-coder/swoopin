"use client";

import Drawer from "@/components/global/drawer";
import React, { useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";

type Props = {
  id: string;
};

const DrawerButton = ({ id }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({    'generic': false,    'button': false,    'menu': false,    'product': false,    'reply': false,    'attachment': false  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({      ...prev,      [section]: !prev[section]    }));
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
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="flex justify-between items-center" onClick={() => toggleSection('generic')}>
                <h3 className="font-medium text-black">Generic Template</h3>
                {expandedSections['generic'] ? <ChevronUp size={20} className="text-black" /> : <ChevronDown size={20} className="text-black" />}
              </div>
              {expandedSections['generic'] && (
                <p className="text-sm text-black mt-1">Create standard message templates</p>
              )}
            </div>

            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="flex justify-between items-center" onClick={() => toggleSection('button')}>
                <h3 className="font-medium text-black">Button Template</h3>
                {expandedSections['button'] ? <ChevronUp size={20} className="text-black" /> : <ChevronDown size={20} className="text-black" />}
              </div>
              {expandedSections['button'] && (
                <p className="text-sm text-black mt-1">Add interactive buttons to your messages</p>
              )}
            </div>

            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="flex justify-between items-center" onClick={() => toggleSection('menu')}>
                <h3 className="font-medium text-black">Persistent Menu</h3>
                {expandedSections['menu'] ? <ChevronUp size={20} className="text-black" /> : <ChevronDown size={20} className="text-black" />}
              </div>
              {expandedSections['menu'] && (
                <p className="text-sm text-black mt-1">Create a permanent menu for quick access</p>
              )}
            </div>

            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="flex justify-between items-center" onClick={() => toggleSection('product')}>
                <h3 className="font-medium text-black">Product Template</h3>
                {expandedSections['product'] ? <ChevronUp size={20} className="text-black" /> : <ChevronDown size={20} className="text-black" />}
              </div>
              {expandedSections['product'] && (
                <p className="text-sm text-black mt-1">Showcase products with images and details</p>
              )}
            </div>

            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="flex justify-between items-center" onClick={() => toggleSection('reply')}>
                <h3 className="font-medium text-black">Quick Reply</h3>
                {expandedSections['reply'] ? <ChevronUp size={20} className="text-black" /> : <ChevronDown size={20} className="text-black" />}
              </div>
              {expandedSections['reply'] && (
                <p className="text-sm text-black mt-1">Add quick response options for users</p>
              )}
            </div>

            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="flex justify-between items-center" onClick={() => toggleSection('attachment')}>
                <h3 className="font-medium text-black">Attachment Upload</h3>
                {expandedSections['attachment'] ? <ChevronUp size={20} className="text-black" /> : <ChevronDown size={20} className="text-black" />}
              </div>
              {expandedSections['attachment'] && (
                <p className="text-sm text-black mt-1">Allow users to upload files and attachments</p>
              )}
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default DrawerButton;