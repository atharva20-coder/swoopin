"use client";
import React from "react";
import PaymentCard from "./payment-card";
import { useQueryUser } from "@/hooks/user-queries";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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

type Props = {};

const Billing = (props: Props) => {
  const { data } = useQueryUser();
  const { user } = useUser();
  const [deleteConfirmation, setDeleteConfirmation] = React.useState("");
  const isDeleteConfirmed = deleteConfirmation === "Delete my Account";

  return (
    <div className="flex flex-col items-center w-full">
      <div className="text-center mb-12">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">EXPLORE OUR BEST PRICING IN ALL OTHERS</p>
        <h1 className="text-4xl font-bold mb-4">Best plans for specially curated for, {user?.firstName || 'You'}!</h1>
        <p className="text-gray-600 dark:text-gray-400">Powerful AI automation tools and social media management features to grow your business.</p>
      </div>
      <div className="flex lg:flex-row flex-col gap-5 w-full lg:w-10/12 xl:w-8/12 container">
        <PaymentCard current={data?.data?.subscription?.plan!} label="PRO" />
        <PaymentCard current={data?.data?.subscription?.plan!} label="FREE" />
      </div>
      <div className="mt-16 w-full container max-w-4xl mx-auto">
        <div className="bg-white border-2 border-gray-100 rounded-lg p-10 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Delete Account</h2>
              <p className="text-gray-600 text-sm">Permanently delete your account and all associated data</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="border border-red-600 bg-transparent hover:bg-red-50 text-red-600 px-6 py-2 rounded-md font-medium transition-colors duration-200"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white p-6 rounded-md max-w-md w-full">
                <AlertDialogHeader className="space-y-3">
                  <AlertDialogTitle className="text-2xl font-bold text-gray-900">Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-600 text-sm leading-relaxed">
                    This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                    Please type &quot;Delete my Account&quot; to confirm.
                  </AlertDialogDescription>
                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="Type 'Delete my Account'"
                    className="w-full px-4 py-2 mt-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-6 flex gap-3">
                  <AlertDialogCancel className="flex-1 px-4 py-2 border border-gray-200 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200">Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    disabled={!isDeleteConfirmed}
                    className="flex-1 bg-transparent border border-red-600 text-red-600 hover:bg-red-50 px-4 py-2 rounded-md font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;