import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import React, { useState } from "react";

const useConfirm = (
  title: string,
  message: string
): [() => React.JSX.Element, () => Promise<unknown>] => {
  const [promise, setPromise] = useState<{
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = () =>
    new Promise((resolve) => {
      setPromise({ resolve });
    });

  const handleClose = () => {
    setPromise(null);
  };
  const handleCancel = () => {
    promise?.resolve(false);
    handleClose();
  };
  const handleConfirm = () => {
    promise?.resolve(true);
    handleClose();
  };

  const ConfirmDialog = () => (
    <Dialog open={promise !== null} onOpenChange={handleCancel}>
      <DialogContent className="bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-800 shadow-lg p-4 max-w-sm !pr-4 [&>button]:hidden">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-lg font-semibold text-black dark:text-white">{title}</DialogTitle>
          <DialogDescription className="text-sm text-black dark:text-slate-300">{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-between pt-3">
          <Button 
            onClick={handleConfirm}
            className="bg-white dark:bg-slate-800 border-red-500 dark:border-red-400 border text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-700 transition-colors duration-200 px-4 py-1.5 text-sm"
          >
            Proceed
          </Button>
          <Button 
            onClick={handleCancel} 
            variant={"outline"}
            className="border-gray-200 dark:border-slate-700 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600 transition-colors duration-200 px-4 py-1.5 text-sm"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
  return [ConfirmDialog, confirm];
};

export default useConfirm;
