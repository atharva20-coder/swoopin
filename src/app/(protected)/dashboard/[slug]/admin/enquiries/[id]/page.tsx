"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, Mail, Phone, Building2, Users, 
  DollarSign, Check, Link, Copy, Send, Rocket,
  Clock, RefreshCw, AlertCircle, User, Calendar
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
  cashfreeOrderId: string | null;
  paymentStatus: string | null;
  transactionId: string | null;
  paymentLinkUrl: string | null;
  paymentLinkExpiresAt: string | null;
  subscriptionEndDate: string | null;
  isActive: boolean;
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

export default function EnquiryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const enquiryId = params.id as string;

  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isDowngrading, setIsDowngrading] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [generatedPaymentUrl, setGeneratedPaymentUrl] = useState<string | null>(null);
  const [linkExpiresAt, setLinkExpiresAt] = useState<Date | null>(null);

  const [formData, setFormData] = useState({
    status: "",
    dmsLimit: "",
    automationsLimit: "",
    scheduledLimit: "",
    aiLimit: "",
    dealAmount: "",
    notes: "",
    subscriptionDays: "30",
  });

  useEffect(() => {
    checkAdminAndFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enquiryId]);

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
      await fetchEnquiry();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEnquiry = async () => {
    try {
      const response = await fetch(`/api/admin/enquiries/${enquiryId}`);
      const data = await response.json();
      if (data.success && data.enquiry) {
        setEnquiry(data.enquiry);
        setFormData({
          status: data.enquiry.status,
          dmsLimit: data.enquiry.customDmsLimit?.toString() || "",
          automationsLimit: data.enquiry.customAutomationsLimit?.toString() || "",
          scheduledLimit: data.enquiry.customScheduledLimit?.toString() || "",
          aiLimit: data.enquiry.customAiLimit?.toString() || "",
          dealAmount: data.enquiry.dealAmount?.toString() || "",
          notes: data.enquiry.notes || "",
          subscriptionDays: "30",
        });
      }
    } catch (error) {
      console.error("Failed to fetch enquiry:", error);
      toast.error("Failed to load enquiry");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/enquiries/${enquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: formData.status,
          customDmsLimit: formData.dmsLimit ? parseInt(formData.dmsLimit) : null,
          customAutomationsLimit: formData.automationsLimit ? parseInt(formData.automationsLimit) : null,
          customScheduledLimit: formData.scheduledLimit ? parseInt(formData.scheduledLimit) : null,
          customAiLimit: formData.aiLimit ? parseInt(formData.aiLimit) : null,
          dealAmount: formData.dealAmount ? parseFloat(formData.dealAmount) : null,
          notes: formData.notes || null,
        }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Saved successfully!");
        await fetchEnquiry();
      } else {
        toast.error(data.error || "Failed to save");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkDealClosed = async () => {
    try {
      const response = await fetch(`/api/admin/enquiries/${enquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealClosed: true }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Deal marked as closed!");
        await fetchEnquiry();
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleSendPaymentLink = async () => {
    if (!formData.dealAmount) {
      toast.error("Please set a deal amount first");
      return;
    }

    setIsGeneratingLink(true);
    try {
      const response = await fetch("/api/admin/enterprise-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enquiryId,
          amount: parseFloat(formData.dealAmount),
          currency: "INR",
          description: `Enterprise plan for ${enquiry?.company || enquiry?.name || enquiry?.email}`,
          sendEmail: true,
        }),
      });
      const data = await response.json();

      if (data.success) {
        setGeneratedPaymentUrl(data.paymentUrl);
        setLinkExpiresAt(data.expiresAt ? new Date(data.expiresAt) : null);
        setShowPaymentModal(true);
        toast.success("Payment link sent to user's email!");
        await fetchEnquiry();
      } else {
        toast.error(data.error || "Failed to generate payment link");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleCheckPaymentStatus = async () => {
    setIsCheckingPayment(true);
    try {
      const response = await fetch(`/api/admin/enquiries/${enquiryId}/payment-status`);
      const data = await response.json();

      if (data.success) {
        if (data.paymentStatus === "PAID") {
          toast.success("Payment confirmed!");
        } else {
          toast.info(`Payment status: ${data.paymentStatus}`);
        }
        await fetchEnquiry();
      } else {
        toast.error(data.error || "Failed to check status");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsCheckingPayment(false);
    }
  };

  const handleActivateEnterprise = async () => {
    setIsActivating(true);
    try {
      const response = await fetch("/api/admin/upgrade-enterprise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: enquiry?.email,
          enquiryId: enquiryId,
          subscriptionDays: parseInt(formData.subscriptionDays) || 30,
          customLimits: {
            dmsPerMonth: enquiry?.customDmsLimit,
            automations: enquiry?.customAutomationsLimit,
            scheduledPosts: enquiry?.customScheduledLimit,
            aiResponsesPerMonth: enquiry?.customAiLimit,
          }
        }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success(`Enterprise activated for ${formData.subscriptionDays} days!`);
        // Update status to CLOSED_WON
        await fetch(`/api/admin/enquiries/${enquiryId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "CLOSED_WON" }),
        });
        await fetchEnquiry();
      } else {
        toast.error(data.error || "Failed to activate");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsActivating(false);
    }
  };

  const handleDowngrade = async () => {
    if (!confirm("Are you sure you want to downgrade this user to FREE? All automations will be paused.")) {
      return;
    }
    
    setIsDowngrading(true);
    try {
      const response = await fetch("/api/admin/upgrade-enterprise", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: enquiry?.email,
          newPlan: "FREE",
        }),
      });
      const data = await response.json();

      if (data.success) {
        // Also mark enquiry as inactive
        await fetch(`/api/admin/enquiries/${enquiryId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: false }),
        });
        
        // Pause all automations for this user
        await fetch("/api/admin/pause-automations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: enquiry?.userId }),
        });
        
        toast.success("User downgraded to FREE and automations paused");
        await fetchEnquiry();
      } else {
        toast.error(data.error || "Failed to downgrade");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsDowngrading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthorized || !enquiry) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {!isAuthorized ? "Access Denied" : "Enquiry Not Found"}
        </h1>
        <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const isEnterprise = enquiry.User?.subscription?.plan === "ENTERPRISE";

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/${slug}/admin/enquiries`)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{enquiry.name || "No name"}</h1>
          <p className="text-gray-500 dark:text-neutral-400 text-sm">{enquiry.email}</p>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[enquiry.status]}`}>
            {enquiry.status.replace("_", " ")}
          </span>
          {isEnterprise && (
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
              ✓ Enterprise
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-6">
        {/* User Info Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-500" />
            Contact Details
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-xs text-gray-400 uppercase">Email</span>
              <p className="text-gray-900 dark:text-white font-medium">{enquiry.email}</p>
            </div>
            <div>
              <span className="text-xs text-gray-400 uppercase">Phone</span>
              <p className="text-gray-900 dark:text-white font-medium">{enquiry.phone || "Not provided"}</p>
            </div>
            <div>
              <span className="text-xs text-gray-400 uppercase">Type</span>
              <p className="text-gray-900 dark:text-white font-medium">
                {enquiry.userType ? userTypeLabels[enquiry.userType] || enquiry.userType : "Not specified"}
              </p>
            </div>
            <div>
              <span className="text-xs text-gray-400 uppercase">Company</span>
              <p className="text-gray-900 dark:text-white font-medium">{enquiry.company || "Not provided"}</p>
            </div>
            {enquiry.teamSize && (
              <div>
                <span className="text-xs text-gray-400 uppercase">Team Size</span>
                <p className="text-gray-900 dark:text-white font-medium">{enquiry.teamSize}</p>
              </div>
            )}
            {enquiry.expectedVolume && (
              <div>
                <span className="text-xs text-gray-400 uppercase">Expected Volume</span>
                <p className="text-gray-900 dark:text-white font-medium">{enquiry.expectedVolume}</p>
              </div>
            )}
          </div>
          {enquiry.useCase && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-neutral-800">
              <span className="text-xs text-gray-400 uppercase">Use Case</span>
              <p className="text-gray-900 dark:text-white mt-1">{enquiry.useCase}</p>
            </div>
          )}
        </div>

        {/* Custom Limits & Deal */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-indigo-500" />
            Custom Limits & Deal
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="text-xs text-gray-400 uppercase">DMs/month</label>
              <input
                type="number"
                value={formData.dmsLimit}
                onChange={(e) => setFormData({...formData, dmsLimit: e.target.value})}
                placeholder="e.g. 5000"
                className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase">Automations</label>
              <input
                type="number"
                value={formData.automationsLimit}
                onChange={(e) => setFormData({...formData, automationsLimit: e.target.value})}
                placeholder="e.g. 50"
                className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase">Scheduled Posts</label>
              <input
                type="number"
                value={formData.scheduledLimit}
                onChange={(e) => setFormData({...formData, scheduledLimit: e.target.value})}
                placeholder="e.g. 100"
                className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase">AI Responses</label>
              <input
                type="number"
                value={formData.aiLimit}
                onChange={(e) => setFormData({...formData, aiLimit: e.target.value})}
                placeholder="e.g. 200"
                className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-end gap-4 mb-4">
            <div className="flex-1">
              <label className="text-xs text-gray-400 uppercase">Deal Amount (₹)</label>
              <input
                type="number"
                value={formData.dealAmount}
                onChange={(e) => setFormData({...formData, dealAmount: e.target.value})}
                placeholder="e.g. 50000"
                className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-lg font-semibold"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-400 uppercase">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
              >
                <option value="PENDING">Pending</option>
                <option value="CONTACTED">Contacted</option>
                <option value="NEGOTIATING">Negotiating</option>
                <option value="CLOSED_WON">Closed Won</option>
                <option value="CLOSED_LOST">Closed Lost</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs text-gray-400 uppercase">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Add internal notes..."
              rows={3}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white resize-none"
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            {!enquiry.dealClosed && formData.dealAmount && (
              <Button variant="outline" onClick={handleMarkDealClosed} className="text-green-600">
                <Check className="w-4 h-4 mr-2" />
                Mark Deal Closed
              </Button>
            )}
          </div>
        </div>

        {/* Payment Section */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Link className="w-5 h-5 text-indigo-500" />
            Payment
          </h2>

          {/* Payment Status */}
          <div className="mb-6 p-4 rounded-xl bg-gray-50 dark:bg-neutral-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-500">Payment Status</span>
                <div className="flex items-center gap-2 mt-1">
                  {enquiry.paymentStatus === "PAID" ? (
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-semibold">
                      ✓ PAID
                    </span>
                  ) : enquiry.paymentStatus === "EXPIRED" ? (
                    <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm font-semibold">
                      Expired
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-semibold">
                      Pending
                    </span>
                  )}
                  {enquiry.transactionId && (
                    <span className="text-sm text-gray-600 dark:text-neutral-400">
                      Transaction: <code className="bg-gray-100 dark:bg-neutral-700 px-2 py-0.5 rounded">{enquiry.transactionId}</code>
                    </span>
                  )}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleCheckPaymentStatus} disabled={isCheckingPayment}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isCheckingPayment ? "animate-spin" : ""}`} />
                Check Status
              </Button>
            </div>

            {enquiry.paymentLinkUrl && enquiry.paymentLinkExpiresAt && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Payment Link</span>
                  <span className="text-gray-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Expires: {new Date(enquiry.paymentLinkExpiresAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    value={enquiry.paymentLinkUrl}
                    readOnly
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-neutral-300 text-sm"
                  />
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(enquiry.paymentLinkUrl!)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleSendPaymentLink} 
              disabled={isGeneratingLink || !formData.dealAmount}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              {isGeneratingLink ? "Sending..." : "Send Payment Link"}
            </Button>
            
            {enquiry.paymentStatus === "PAID" && !isEnterprise && (
              <>
                <select
                  value={formData.subscriptionDays}
                  onChange={(e) => setFormData({...formData, subscriptionDays: e.target.value})}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                >
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                  <option value="180">180 days</option>
                  <option value="365">1 year</option>
                </select>
                <Button 
                  onClick={handleActivateEnterprise} 
                  disabled={isActivating}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  {isActivating ? "Activating..." : "🚀 Activate Enterprise"}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Subscription Status Section - Show when enterprise is active */}
        {(isEnterprise || enquiry.isActive) && (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              Subscription Status
            </h2>
            
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-neutral-800">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-xs text-gray-400 uppercase">Status</span>
                  <p className="mt-1">
                    {enquiry.isActive ? (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-sm font-medium">
                        ✓ Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-sm font-medium">
                        Inactive
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-400 uppercase">Due Date</span>
                  <p className="text-gray-900 dark:text-white font-semibold mt-1">
                    {enquiry.subscriptionEndDate 
                      ? new Date(enquiry.subscriptionEndDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })
                      : 'Not set'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-400 uppercase">Days Remaining</span>
                  <p className="text-gray-900 dark:text-white font-semibold mt-1">
                    {enquiry.subscriptionEndDate ? (
                      (() => {
                        const daysLeft = Math.ceil((new Date(enquiry.subscriptionEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                        return daysLeft > 0 
                          ? <span className="text-green-600">{daysLeft} days</span>
                          : <span className="text-red-600">Expired</span>;
                      })()
                    ) : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-400 uppercase">Plan</span>
                  <p className="text-gray-900 dark:text-white font-semibold mt-1">
                    {enquiry.User?.subscription?.plan || 'Unknown'}
                  </p>
                </div>
              </div>

              {enquiry.subscriptionEndDate && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-700">
                  <p className="text-sm text-gray-500 dark:text-neutral-400 mb-3">
                    ⏰ If payment is not received by the due date, the user will be automatically downgraded to FREE and all automations will be paused.
                  </p>
                </div>
              )}

              {/* Manual Downgrade Button */}
              {(isEnterprise || enquiry.isActive) && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-700">
                  <Button 
                    onClick={handleDowngrade} 
                    disabled={isDowngrading}
                    variant="destructive"
                    className="w-full"
                  >
                    {isDowngrading ? "Downgrading..." : "⚠️ Downgrade to FREE (Pause All Automations)"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Payment Link Modal */}
      {showPaymentModal && generatedPaymentUrl && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowPaymentModal(false)}>
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Payment Link Sent!</h3>
                <p className="text-sm text-gray-500">Email sent to {enquiry.email}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="text-xs text-gray-400 uppercase">Payment Link</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={generatedPaymentUrl}
                  readOnly
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 text-sm"
                />
                <Button variant="outline" onClick={() => copyToClipboard(generatedPaymentUrl)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {linkExpiresAt && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-center gap-2 text-yellow-700 dark:text-yellow-300 text-sm mb-4">
                <Clock className="w-4 h-4" />
                Link valid until: {linkExpiresAt.toLocaleString()}
              </div>
            )}

            <Button className="w-full" onClick={() => setShowPaymentModal(false)}>
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
