"use client";

import { Button } from "@/components/ui/button";
import React, { useMemo } from "react";
import Loader from "../loader";
import { useCreateAutomation } from "@/hooks/use-automations";
import { v4 } from "uuid";
import { Plus, Sparkles } from "lucide-react";

type Props = {};

const CreateAutomation = (props: Props) => {
  const mutationId = useMemo(() => v4(), []);

  const { isPending, mutate } = useCreateAutomation(mutationId);

  return (
    <Button
      className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02]"
      onClick={() =>
        mutate({
          name: "Untitled",
          id: mutationId,
          createdAt: new Date(),
          keywords: [],
        })
      }
    >
      <Loader state={isPending}>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
            <Plus className="w-3.5 h-3.5" />
          </div>
          <span className="font-medium">New Automation</span>
        </div>
      </Loader>
    </Button>
  );
};

export default CreateAutomation;
