"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Building2, Mail, Phone, User, RefreshCw, 
  ChevronRight, DollarSign
} from "lucide-react";
import { toast } from "sonner";

type Enquiry = {
  id: string;
  userId: string;
  email: string;
  name: string | null;
  phone: string | null;
  userType: string | null;
  company: string | null;
  status: string;
  dealAmount: number | null;
  dealClosed: boolean;
  paymentStatus: string | null;
  createdAt: string;
  User: {
    subscription: {
      plan: string;
    } | null;
  };
};

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  CONTACTED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  NEGOTIATING: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  CLOSED_WON: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  CLOSED_LOST: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

const userTypeLabels: Record<string, string> = {
  influencer: "Influencer",
  creator: "Creator",
  agency: "Agency",
  brand: "Brand",
  other: "Other",
};

export default function AdminEnquiriesPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    checkAdminAndFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAdminAndFetch = async () => {
    try {
      const checkRes = await fetch("/api/admin/check");
      const checkData = await checkRes.json();
      
      if (!checkData.isAdmin) {
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }
      
      setIsAuthorized(true);
      await fetchEnquiries();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEnquiries = async () => {
    try {
      const response = await fetch("/api/admin/enquiries");
      const data = await response.json();
      if (data.success) {
        setEnquiries(data.enquiries);
      }
    } catch (error) {
      console.error("Failed to fetch enquiries:", error);
      toast.error("Failed to load enquiries");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h1>
        <p className="text-gray-600 dark:text-gray-400">Admin access required.</p>
      </div>
    );
  }

  const pendingCount = enquiries.filter(e => e.status === "PENDING").length;
  const paidCount = enquiries.filter(e => e.paymentStatus === "PAID").length;

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Enterprise Enquiries</h1>
          <p className="text-gray-500 dark:text-neutral-400 text-sm mt-1">
            {enquiries.length} total • {pendingCount} pending • {paidCount} paid
          </p>
        </div>
        <Button onClick={fetchEnquiries} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {enquiries.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-12 text-center">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No enterprise enquiries yet</p>
          <p className="text-sm text-gray-500 mt-2">Enquiries from the billing page will appear here</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {enquiries.map((enquiry) => (
            <div
              key={enquiry.id}
              onClick={() => router.push(`/dashboard/${slug}/admin/enquiries/${enquiry.id}`)}
              className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-5 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                    {(enquiry.name || enquiry.email).charAt(0).toUpperCase()}
                  </div>
                  
                  {/* Info */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {enquiry.name || "No name"}
                      </span>
                      {enquiry.userType && (
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 text-xs rounded-full">
                          {userTypeLabels[enquiry.userType] || enquiry.userType}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[enquiry.status]}`}>
                        {enquiry.status.replace("_", " ")}
                      </span>
                      {enquiry.paymentStatus === "PAID" && (
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full font-medium">
                          ✓ Paid
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {enquiry.email}
                      </span>
                      {enquiry.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {enquiry.phone}
                        </span>
                      )}
                      {enquiry.company && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {enquiry.company}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-4">
                  {enquiry.dealAmount && (
                    <div className="text-right">
                      <span className="text-xs text-gray-400">Deal</span>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        ₹{enquiry.dealAmount.toLocaleString()}
                      </p>
                    </div>
                  )}
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
