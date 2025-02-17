import React from "react";

interface DoubleGradientCardProps {
  id: string;
  label: string;
  subLabel: string;
  isPopular?: boolean;
  href: string;
}

const DoubleGradientCard = ({
  id,
  label,
  subLabel,
  isPopular = false,
  href,
}: DoubleGradientCardProps) => {
  return (
    <a 
      href={href}
      className="block relative bg-white rounded-lg p-8 border border-gray-200 hover:shadow-lg transition-all duration-200 w-full lg:w-[calc(33.33%-1rem)] cursor-pointer hover:border-blue-200"
    >
      <div className="flex flex-col h-full justify-between gap-y-6">
        <div className="space-y-3">
          <h3 className="text-2xl font-semibold text-gray-900" dangerouslySetInnerHTML={{ __html: label }} />
          <p className="text-gray-600 text-lg">{subLabel}</p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-blue-600">Quick Automation</span>
          {isPopular && (
            <span className="bg-[#FFF1E2] text-[#F7A151] px-4 py-1.5 rounded-full text-sm font-medium">
              POPULAR
            </span>
          )}
        </div>
      </div>
    </a>
  );
};

export default DoubleGradientCard;