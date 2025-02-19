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
    <div className="w-full container max-w-4xl mx-auto">
      <div className="bg-white border-2 border-gray-100 rounded-lg p-10 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Delete Account</h2>
            <p className="text-gray-600 text-sm">Permanently delete your account and all associated data</p>
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