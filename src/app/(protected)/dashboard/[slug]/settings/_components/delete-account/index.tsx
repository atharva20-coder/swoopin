"use client";
import React from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Checkmark } from "@/icons";
import DeleteModal from "./delete-modal";

type Props = {};

const DeleteAccount = (props: Props) => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [deleteConfirmation, setDeleteConfirmation] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);
  const isDeleteConfirmed = deleteConfirmation === "Delete My Account";

  /** Handle account deletion with email verification and cleanup */
  const handleDeleteAccount = async () => {
    if (!user?.emailAddresses?.[0]?.emailAddress) {
      toast.error("Unable to verify user email");
      return;
    }
  
    try {
      setIsDeleting(true);
      
      // First delete user from database
      const response = await fetch("/api/user/delete", {
        method: "DELETE",        
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.emailAddresses[0].emailAddress,
        }),
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete account");
      }
      
      // Then sign out the user after successful database deletion
      await signOut();
      
      // Redirect to landing page after successful deletion
      router.push("/");
      
      // Show success toast with checkmark
      toast.success("Account successfully deleted", {
        icon: <div className="bg-green-500 rounded-full p-1"><Checkmark/></div>
      });
    } catch (error) {
      console.error("Delete account error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 sm:p-8 border-2 border-red-200 dark:border-red-800 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-6">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Delete Account</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Permanently delete your account and all associated data</p>
          </div>
          <DeleteModal
            deleteConfirmation={deleteConfirmation}
            isDeleting={isDeleting}
            isDeleteConfirmed={isDeleteConfirmed}
            onDeleteConfirmationChange={setDeleteConfirmation}
            onDelete={handleDeleteAccount}
          />
        </div>
      </div>
    </div>
  );
};

export default DeleteAccount;