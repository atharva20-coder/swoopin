import { InstagramBlue, PlaneBlue } from "@/icons";
import React from "react";
import KeywordItemActive from "./keyword-item-active";
import { LightbulbIcon } from "lucide-react";

type Props = {
  type: "DM" | "COMMENT" | "KEYWORDS";
  keywords?: {
    id: string;
    word: string;
    automationId: string | null;
  }[];
  automationId: string;
};

const ActiveTrigger = ({ keywords, type, automationId }: Props) => {
  console.log(type);

  return (
    <div className="bg-[#ededef] dark:bg-gray-800 hover:bg-[#dfdfdf] transition-colors duration-200 p-3 rounded-xl w-full">
      <div className="flex gap-x-2 items-center">
        {type === "COMMENT" ? (
          <InstagramBlue />
        ) : type === "KEYWORDS" ? (
          <LightbulbIcon size={16} className="text-[#768BDD] dark:text-blue-400" />
        ) : (
          <PlaneBlue />
        )}
        <p className="text-lg text-black dark:text-white">
          {type === "COMMENT"
            ? "User comments on my post."
            : type === "KEYWORDS"
            ? "If these keywords match"
            : "User sends me a direct message."}
        </p>
      </div>
      <p className="text-gray-600 dark:text-gray-300">
        {type === "COMMENT"
          ? "Setup to listen for comments"
          : type === "KEYWORDS"
          ? "If the user send you a message/comment that contains a keyword, this automation will fire"
          : "Setup to listen for inbox"}
      </p>
      <div className="flex  gap-2 mt-5 flex-wrap">
        {type == "KEYWORDS" && keywords?.length == 0 ? (
          <span className="text-xs text-red-400 dark:text-red-300">
            no key words found, please remove this automation and recreate one.
          </span>
        ) : (
          keywords?.map((word) => (
            <KeywordItemActive
              automationId={automationId}
              word={word}
              key={word.id}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ActiveTrigger;
