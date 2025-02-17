"use client";
import { onOAuthInstagram } from "@/actions/integrations";
import { onUserInfo } from "@/actions/user";
import { Button } from "@/components/ui/button";
import useConfirm from "@/hooks/use-confirm";
import { useQuery } from "@tanstack/react-query";
import React from "react";

type Props = {
  title: string;
  description: string;
  icon: React.ReactNode;
  strategy: "INSTAGRAM" | "CRM" | "MESSENGER" | "WHATSAPP" | "THREADS" | "NEWSLETTER";
};

const IntegrationCard = ({ description, icon, strategy, title }: Props) => {
  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const [ConfirmDialog, confirm] = useConfirm(
    "Before you proceed!",
    `Due to our app limitations, we strongly advise you to use clone ${capitalize(
      strategy
    )} accounts to avoid unfortunate consequences`
  );
  const onInstaOAuth = async () => {
    const ok = await confirm();
    if (!ok) return;
    try {
      if (strategy === 'INSTAGRAM') {
        await onOAuthInstagram('INSTAGRAM');
      } else {
        console.error('Strategy not implemented:', strategy);
      }
    } catch (error) {
      console.error('OAuth Error:', error);
    }
  };

  const { data } = useQuery({
    queryKey: ["user-profile"],
    queryFn: onUserInfo,
  });

  const integrated = data?.data?.integrations.find(
    (integration) => integration.name === strategy
  );

  const getBackgroundColor = (strategy: string) => {
    switch (strategy) {
      case 'INSTAGRAM':
        return 'bg-gradient-to-r from-pink-50 to-purple-50';
      case 'MESSENGER':
        return 'bg-gradient-to-r from-blue-50 to-blue-100';
      case 'WHATSAPP':
        return 'bg-gradient-to-r from-green-50 to-green-100';
      case 'THREADS':
        return 'bg-gradient-to-r from-gray-50 to-gray-100';
      case 'NEWSLETTER':
        return 'bg-gradient-to-r from-amber-50 to-amber-100';
    }
  };

  return (
    <>
      <ConfirmDialog />
      <div className={`rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-200 flex items-center gap-6 ${getBackgroundColor(strategy)}`}>
        <div className="w-16 h-16 flex items-center justify-center">
          {icon}
        </div>
        <div className="flex flex-col flex-1">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <p className="text-gray-500 text-sm mt-1">{description}</p>
        </div>
        <Button
          onClick={onInstaOAuth}
          disabled={integrated?.name === strategy}
          className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
        >
          {integrated ? "Connected" : "Connect"}
        </Button>
      </div>
    </>
  );
};

export default IntegrationCard;
