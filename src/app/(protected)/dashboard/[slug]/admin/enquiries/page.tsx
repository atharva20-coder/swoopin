"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Building2, Mail, Users, Clock, DollarSign, 
  CheckCircle, XCircle, MessageSquare, RefreshCw,
  ArrowUpRight, AlertCircle, Link, Copy
} from "lucide-react";
import { toast } from "sonner";

type Enquiry = {
  id: string;
  userId: string;
  email: string;
  name: string | null;
  company: string | null;
  teamSize: string | null;
  useCase: string | null;
  expectedVolume: string | null;
  status: string;
  notes: string | null;
  customDmsLimit: number | null;
  customAutomationsLimit: number | null;
  customScheduledLimit: number | null;
  customAiLimit: number | null;
  dealAmount: number | null;
  dealClosed: boolean;
  createdAt: string;
  User: {
    subscription: {
      plan: string;
    } | null;
  };
};

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  CONTACTED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  NEGOTIATING: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  CLOSED_WON: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  CLOSED_LOST: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [customLimits, setCustomLimits] = useState({
    dms: "",
    automations: "",
    scheduled: "",
    ai: "",
    dealAmount: "",
  });
  const [generatingPaymentFor, setGeneratingPaymentFor] = useState<string | null>(null);
  const [paymentLinkUrl, setPaymentLinkUrl] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAndFetch();
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
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success(`Status updated to ${status}`);
        fetchEnquiries();
      } else {
        toast.error(data.error || "Failed to update status");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const upgradeToEnterprise = async (enquiry: Enquiry) => {
    if (!enquiry.dealClosed) {
      toast.error("Please close the deal first before upgrading");
      return;
    }

    try {
      const response = await fetch("/api/admin/upgrade-enterprise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: enquiry.email,
          customLimits: {
            dmsPerMonth: enquiry.customDmsLimit,
            automations: enquiry.customAutomationsLimit,
            scheduledPosts: enquiry.customScheduledLimit,
            aiResponsesPerMonth: enquiry.customAiLimit,
          }
        }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success(`Successfully upgraded ${enquiry.email} to Enterprise!`);
        await updateStatus(enquiry.id, "CLOSED_WON");
        fetchEnquiries();
      } else {
        toast.error(data.error || "Failed to upgrade");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const saveLimitsAndDeal = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customDmsLimit: customLimits.dms ? parseInt(customLimits.dms) : null,
          customAutomationsLimit: customLimits.automations ? parseInt(customLimits.automations) : null,
          customScheduledLimit: customLimits.scheduled ? parseInt(customLimits.scheduled) : null,
          customAiLimit: customLimits.ai ? parseInt(customLimits.ai) : null,
          dealAmount: customLimits.dealAmount ? parseFloat(customLimits.dealAmount) : null,
        }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success("Saved custom limits and deal amount");
        fetchEnquiries();
        setSelectedEnquiry(null);
      } else {
        toast.error(data.error || "Failed to save");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const markDealClosed = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealClosed: true }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success("Deal marked as closed!");
        fetchEnquiries();
      } else {
        toast.error(data.error || "Failed to mark deal");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const generatePaymentLink = async (enquiry: Enquiry) => {
    if (!enquiry.dealAmount) {
      toast.error("Please set a deal amount first");
      return;
    }

    setGeneratingPaymentFor(enquiry.id);
    try {
      const response = await fetch("/api/admin/enterprise-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enquiryId: enquiry.id,
          amount: enquiry.dealAmount,
          currency: "INR",
          description: `Enterprise plan for ${enquiry.company || enquiry.name || enquiry.email}`,
        }),
      });
      const data = await response.json();

      if (data.success) {
        setPaymentLinkUrl(data.paymentUrl);
        toast.success("Payment link generated!");
      } else {
        toast.error(data.error || "Failed to generate payment link");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setGeneratingPaymentFor(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
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

  // Count by status
  const pendingCount = enquiries.filter(e => e.status === "PENDING").length;

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Enterprise Enquiries</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {enquiries.length} total • {pendingCount} pending
          </p>
        </div>
        <Button onClick={fetchEnquiries} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {enquiries.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-12 text-center">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No enterprise enquiries yet</p>
          <p className="text-sm text-gray-500 mt-2">Enquiries from the billing page will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {enquiries.map((enquiry) => (
            <div
              key={enquiry.id}
              className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                    {(enquiry.name || enquiry.email).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{enquiry.name || "No name"}</p>
                    <p className="text-sm text-gray-500">{enquiry.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[enquiry.status as keyof typeof statusColors]}`}>
                    {enquiry.status.replace("_", " ")}
                  </span>
                  {enquiry.dealClosed && (
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                      💰 Deal Closed
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                {enquiry.company && (
                  <div>
                    <span className="text-gray-500">Company:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{enquiry.company}</p>
                  </div>
                )}
                {enquiry.teamSize && (
                  <div>
                    <span className="text-gray-500">Team Size:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{enquiry.teamSize}</p>
                  </div>
                )}
                {enquiry.expectedVolume && (
                  <div>
                    <span className="text-gray-500">Expected Volume:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{enquiry.expectedVolume}</p>
                  </div>
                )}
                {enquiry.dealAmount && (
                  <div>
                    <span className="text-gray-500">Deal Amount:</span>
                    <p className="font-medium text-green-600">₹{enquiry.dealAmount.toLocaleString()}</p>
                  </div>
                )}
              </div>

              {enquiry.useCase && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg">
                  <span className="text-xs text-gray-500">Use Case:</span>
                  <p className="text-sm text-gray-900 dark:text-white">{enquiry.useCase}</p>
                </div>
              )}

              {/* Custom Limits */}
              {(enquiry.customDmsLimit || enquiry.customAutomationsLimit) && (
                <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Custom Limits:</span>
                  <div className="flex gap-4 mt-1 text-sm">
                    {enquiry.customDmsLimit && <span>DMs: {enquiry.customDmsLimit}</span>}
                    {enquiry.customAutomationsLimit && <span>Automations: {enquiry.customAutomationsLimit}</span>}
                    {enquiry.customScheduledLimit && <span>Scheduled: {enquiry.customScheduledLimit}</span>}
                    {enquiry.customAiLimit && <span>AI: {enquiry.customAiLimit}</span>}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100 dark:border-neutral-800">
                <select
                  value={enquiry.status}
                  onChange={(e) => updateStatus(enquiry.id, e.target.value)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                >
                  <option value="PENDING">Pending</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="NEGOTIATING">Negotiating</option>
                  <option value="CLOSED_WON">Closed Won</option>
                  <option value="CLOSED_LOST">Closed Lost</option>
                </select>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedEnquiry(enquiry);
                    setCustomLimits({
                      dms: enquiry.customDmsLimit?.toString() || "",
                      automations: enquiry.customAutomationsLimit?.toString() || "",
                      scheduled: enquiry.customScheduledLimit?.toString() || "",
                      ai: enquiry.customAiLimit?.toString() || "",
                      dealAmount: enquiry.dealAmount?.toString() || "",
                    });
                  }}
                >
                  Set Custom Limits
                </Button>

                {!enquiry.dealClosed && enquiry.dealAmount && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600"
                    onClick={() => markDealClosed(enquiry.id)}
                  >
                    <DollarSign className="w-4 h-4 mr-1" />
                    Mark Deal Closed
                  </Button>
                )}

                {enquiry.dealAmount && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-blue-600"
                    onClick={() => generatePaymentLink(enquiry)}
                    disabled={generatingPaymentFor === enquiry.id}
                  >
                    <Link className="w-4 h-4 mr-1" />
                    {generatingPaymentFor === enquiry.id ? "Generating..." : "Send Payment Link"}
                  </Button>
                )}

                {enquiry.dealClosed && enquiry.User?.subscription?.plan !== "ENTERPRISE" && (
                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => upgradeToEnterprise(enquiry)}
                  >
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                    Upgrade to Enterprise
                  </Button>
                )}

                {enquiry.User?.subscription?.plan === "ENTERPRISE" && (
                  <span className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium">
                    ✓ Already Enterprise
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom Limits Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedEnquiry(null)}>
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Set Custom Limits for {selectedEnquiry.name || selectedEnquiry.email}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">DMs per month</label>
                <input
                  type="number"
                  value={customLimits.dms}
                  onChange={(e) => setCustomLimits({ ...customLimits, dms: e.target.value })}
                  placeholder="e.g. 5000"
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">Automations</label>
                <input
                  type="number"
                  value={customLimits.automations}
                  onChange={(e) => setCustomLimits({ ...customLimits, automations: e.target.value })}
                  placeholder="e.g. 50"
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">Scheduled Posts/month</label>
                <input
                  type="number"
                  value={customLimits.scheduled}
                  onChange={(e) => setCustomLimits({ ...customLimits, scheduled: e.target.value })}
                  placeholder="e.g. 100"
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">AI Responses/month</label>
                <input
                  type="number"
                  value={customLimits.ai}
                  onChange={(e) => setCustomLimits({ ...customLimits, ai: e.target.value })}
                  placeholder="e.g. 200"
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                />
              </div>
              <div className="pt-2 border-t">
                <label className="text-sm text-gray-600 dark:text-gray-400">Deal Amount (₹)</label>
                <input
                  type="number"
                  value={customLimits.dealAmount}
                  onChange={(e) => setCustomLimits({ ...customLimits, dealAmount: e.target.value })}
                  placeholder="e.g. 50000"
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setSelectedEnquiry(null)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={() => saveLimitsAndDeal(selectedEnquiry.id)} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
