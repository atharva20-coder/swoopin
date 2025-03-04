import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type DeleteModalProps = {
  deleteConfirmation: string;
  isDeleting: boolean;
  isDeleteConfirmed: boolean;
  onDeleteConfirmationChange: (value: string) => void;
  onDelete: () => void;
};

const DeleteModal = ({
  deleteConfirmation,
  isDeleting,
  isDeleteConfirmed,
  onDeleteConfirmationChange,
  onDelete,
}: DeleteModalProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline" 
          className="border border-red-600 bg-transparent hover:bg-red-50 text-red-600 px-6 py-2 rounded-md font-medium transition-colors duration-200"
          disabled={isDeleting}
        >
          {isDeleting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="w-5 h-5 mr-2" />
              Delete
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white p-4 sm:p-6 rounded-md max-w-md w-[95%] sm:w-full mx-auto">
        <AlertDialogHeader className="space-y-2 sm:space-y-3">
          <AlertDialogTitle className="text-xl sm:text-2xl font-bold text-gray-900">Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 text-sm leading-relaxed">
            This action cannot be undone. This will permanently delete your account and remove your data from our servers.
            Please type &quot;Delete My Account&quot; to confirm.
          </AlertDialogDescription>
          <input
            type="text"
            value={deleteConfirmation}
            onChange={(e) => onDeleteConfirmationChange(e.target.value)}
            placeholder="Type 'Delete My Account'"
            className="w-full px-3 sm:px-4 py-2 mt-2 border bg-white text-black border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
          />
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <AlertDialogCancel className="w-full sm:flex-1 px-3 sm:px-4 py-2 border border-gray-200 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 text-sm sm:text-base">Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onDelete}
            disabled={!isDeleteConfirmed || isDeleting}
            className="w-full sm:flex-1 bg-transparent border border-red-600 text-red-600 hover:bg-red-50 px-3 sm:px-4 py-2 rounded-md font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent text-sm sm:text-base"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Confirm"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteModal;