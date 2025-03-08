import React from 'react';
import Image from 'next/image';

interface Button {
  type: 'web_url' | 'postback';
  title: string;
  payload?: string;
}

interface TemplatePreviewCardProps {
  template: {
    title: string;
    subtitle?: string;
    imageUrl: string;
    buttons: Button[];
  };
  className?: string;
}

const TemplatePreviewCard: React.FC<TemplatePreviewCardProps> = ({ template, className = '' }) => {
  return (
    <div className={`bg-white p-0 overflow-hidden max-w-sm rounded-lg shadow-lg border border-gray-200 ${className}`}>
      <div className="flex flex-col">
        {template.imageUrl ? (
          <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
            <Image 
              src={template.imageUrl}
              alt={template.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
        ) : (
          <div className="w-full h-48 bg-gray-100 rounded-t-lg flex items-center justify-center">
            <div className="text-gray-400 text-center p-4">
              <p className="text-sm">Preview your template</p>
              <p className="text-xs mt-1">Add an image URL to see it here</p>
            </div>
          </div>
        )}
        <div className="p-6 space-y-3">
          <h3 className="font-semibold text-xl text-gray-900">
            {template.title || 'Template Title'}
          </h3>
          {template.subtitle && (
            <p className="text-gray-600 text-sm leading-relaxed">
              {template.subtitle}
            </p>
          )}
          <div className="space-y-2 pt-3">
            {template.buttons.length > 0 ? (
              template.buttons.map((button, index) => (
                <button
                  key={index}
                  className="w-full p-3 text-center border-2 rounded-lg text-[#768ADD] border-[#768ADD] hover:bg-[#768ADD]/10 transition-all duration-200 font-medium text-sm"
                >
                  {button.title || 'Button Text'}
                </button>
              ))
            ) : (
              <div className="text-center text-gray-400 text-sm">
                <p>Add buttons to see them here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreviewCard;