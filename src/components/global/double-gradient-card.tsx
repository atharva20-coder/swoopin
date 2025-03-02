'use client'

import React, { useState } from "react";
import { Montserrat } from 'next/font/google';
import { X } from 'lucide-react';

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
});

interface DoubleGradientCardProps {
  id: string;
  label: string;
  subLabel: string;
  isPopular?: boolean;
  href: string;
  video?: string;
  description?: string;
  metrics?: {
    value?: string | number;
    change?: number;
    previousValue?: string | number;
  };
}



const DoubleGradientCard = ({
  id,
  label,
  subLabel,
  isPopular = false,
  href,
  video,
  description,
  metrics,
}: DoubleGradientCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isPositive = metrics?.change ? metrics.change >= 0 : true;
  const formattedChange = metrics?.change ? Math.abs(metrics.change).toFixed(1) : '0.0';

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  return (
    <>
      <a 
        onClick={handleCardClick}
        href={href}
        className="block relative bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-all duration-200 w-full lg:w-[calc(33.33%-1rem)] cursor-pointer hover:border-blue-200"
      >
      <div className="flex flex-col h-full justify-between gap-y-4">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900" dangerouslySetInnerHTML={{ __html: label }} />
          <p className="text-gray-600 text-base">{subLabel}</p>
        </div>
        
        {metrics && (
          <div className="flex flex-col mt-2">
            <div className="flex items-baseline gap-2">
              <span className={`${montserrat.className} text-2xl font-bold text-black`}>
                {metrics.value || '0'}
              </span>
              <span className={`${montserrat.className} text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? '+' : '-'}{formattedChange}%
              </span>
            </div>
            <span className={`${montserrat.className} text-xs text-gray-500`}>
              {metrics.previousValue || '0'} from previous month
            </span>
          </div>
        )}
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-medium text-blue-600">Quick Automation</span>
          {isPopular && (
            <span className="bg-[#FFF1E2] text-[#F7A151] px-3 py-1 rounded-full text-xs font-medium">
              POPULAR
            </span>
          )}
        </div>
      </div>
    </a>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col md:flex-row relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 z-10"
            >
              <X size={24} />
            </button>

            <div className="w-full md:w-1/2 h-[300px] md:h-auto relative">
              {video && (
                <video
                  className="w-full h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
                  src={video}
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              )}
            </div>

            <div className="w-full md:w-1/2 p-6 overflow-y-auto max-h-[60vh] md:max-h-[80vh]">
              <h2 className="text-2xl font-semibold mb-4" dangerouslySetInnerHTML={{ __html: label }} />
              <p className="text-gray-600 mb-4">{subLabel}</p>
              {description && <div className="text-gray-700">{description}</div>}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DoubleGradientCard;