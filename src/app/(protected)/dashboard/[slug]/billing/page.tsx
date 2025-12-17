"use client";
import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Check, CreditCard, Zap, Crown, Rocket, X, AlertCircle,
  ChevronDown, ChevronUp, Smartphone, Calendar, BarChart3,
  MessageSquare, Bot, Users, Shield, Sparkles, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Plan = "FREE" | "PRO" | "ENTERPRISE";
type BillingCycle = "monthly" | "annual";

const PLANS = {
  FREE: {
    name: "Starter",
    icon: Zap,
    description: "Perfect for getting started",
    monthlyPrice: 0,
    annualPrice: 0,
    color: "from-gray-500 to-gray-600",
    popular: false,
    features: [
      { text: "200 DMs & Comments/month", included: true },
      { text: "3 Automations", included: true },
      { text: "1 Scheduled Post", included: true },
      { text: "Basic analytics", included: true },
      { text: "Email support", included: true },
      { text: "AI-powered responses", included: false },
      { text: "Priority support", included: false },
    ],
  },
  PRO: {
    name: "Pro",
    icon: Crown,
    description: "For creators & growing businesses",
    monthlyPrice: 799,
    annualPrice: 7990,
    color: "from-blue-500 to-indigo-600",
    popular: true,
    features: [
      { text: "Unlimited DMs & Comments", included: true },
      { text: "Unlimited Automations", included: true },
      { text: "Unlimited Post Scheduling", included: true },
      { text: "Detailed Analytics & Tracking", included: true },
      { text: "AI-powered responses", included: true },
      { text: "Priority support", included: true },
      { text: "Early access to features", included: false },
    ],
  },
  ENTERPRISE: {
    name: "Enterprise",
    icon: Rocket,
    description: "For agencies & large teams",
    monthlyPrice: 2499,
    annualPrice: 24990,
    color: "from-purple-500 to-pink-600",
    popular: false,
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Custom AI training", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "API access", included: true },
      { text: "Early access to features", included: true },
      { text: "White-label options", included: true },
      { text: "Custom integrations", included: true },
    ],
  },
};

const FAQ = [
  {
    q: "Can I cancel my subscription anytime?",
    a: "Yes! You can cancel anytime. You'll continue to have access until the end of your billing period.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit/debit cards and UPI payments for Indian customers.",
  },
  {
    q: "Can I change my plan later?",
    a: "Absolutely! You can upgrade or downgrade your plan at any time from your billing settings.",
  },
  {
    q: "Is there a free trial?",
    a: "Our Starter plan is free forever. You can try all basic features without any payment.",
  },
];

export default function BillingPage() {
  const { user } = useUser();
  const params = useParams();
  const slug = params.slug as string;
  
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [currentPlan, setCurrentPlan] = useState<Plan>("FREE");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isLoading, setIsLoading] = useState<Plan | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isLoadingUsage, setIsLoadingUsage] = useState(true);
  
  // Usage stats from API
  const [usage, setUsage] = useState({
    dmsUsed: 0,
    dmsLimit: 200,
    automations: 0,
    automationsLimit: 3,
    scheduledPosts: 0,
    scheduledPostsLimit: 1,
  });

  // Fetch usage and plan data on mount
  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const response = await fetch("/api/user/usage");
        const data = await response.json();
        if (data.status === 200) {
          setCurrentPlan(data.data.plan);
          setUsage({
            dmsUsed: data.data.usage.dms.used,
            dmsLimit: data.data.usage.dms.unlimited ? -1 : data.data.usage.dms.limit,
            automations: data.data.usage.automations.used,
            automationsLimit: data.data.usage.automations.unlimited ? -1 : data.data.usage.automations.limit,
            scheduledPosts: data.data.usage.scheduledPosts.used,
            scheduledPostsLimit: data.data.usage.scheduledPosts.unlimited ? -1 : data.data.usage.scheduledPosts.limit,
          });
        }
      } catch (error) {
        console.error("Failed to fetch usage:", error);
      } finally {
        setIsLoadingUsage(false);
      }
    };
    fetchUsage();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPrice = (plan: Plan) => {
    const planData = PLANS[plan];
    return billingCycle === "monthly" ? planData.monthlyPrice : planData.annualPrice;
  };

  const getSavings = (plan: Plan) => {
    const planData = PLANS[plan];
    const monthlyTotal = planData.monthlyPrice * 12;
    const annualTotal = planData.annualPrice;
    return monthlyTotal - annualTotal;
  };

  const handleSubscribe = async (plan: Plan) => {
    if (plan === currentPlan) return;
    if (plan === "FREE") {
      setShowCancelModal(true);
      return;
    }
    
    setIsLoading(plan);
    try {
      const response = await fetch(`/api/payment?plan=${plan}&cycle=${billingCycle}`);
      const data = await response.json();
      if (data.session_url) {
        window.location.href = data.session_url;
      } else {
        toast.error("Failed to start checkout");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(null);
    }
  };

  const handleCancel = async () => {
    setIsLoading("FREE");
    try {
      const response = await fetch("/api/payment/cancel", { method: "POST" });
      if (response.ok) {
        toast.success("Subscription cancelled");
        setCurrentPlan("FREE");
        setShowCancelModal(false);
      } else {
        toast.error("Failed to cancel subscription");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(null);
    }
  };

  const usagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Plans & Billing
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Choose the perfect plan to grow your Instagram presence. All plans include our core automation features.
          </p>
        </div>

        {/* Usage Stats Card - Only show for paid users or when limits exist */}
        {currentPlan === "FREE" && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-8 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Your Usage This Month
              </h3>
              <span className="text-sm text-gray-500">Resets monthly</span>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">DMs & Comments</span>
                  <span className="font-medium text-gray-900 dark:text-white">{usage.dmsUsed}/{usage.dmsLimit}</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all",
                      usagePercentage(usage.dmsUsed, usage.dmsLimit) > 80 ? "bg-red-500" : "bg-blue-500"
                    )}
                    style={{ width: `${usagePercentage(usage.dmsUsed, usage.dmsLimit)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Automations</span>
                  <span className="font-medium text-gray-900 dark:text-white">{usage.automations}/{usage.automationsLimit}</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all",
                      usagePercentage(usage.automations, usage.automationsLimit) > 80 ? "bg-red-500" : "bg-green-500"
                    )}
                    style={{ width: `${usagePercentage(usage.automations, usage.automationsLimit)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Scheduled Posts</span>
                  <span className="font-medium text-gray-900 dark:text-white">{usage.scheduledPosts}/{usage.scheduledPostsLimit}</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full transition-all"
                    style={{ width: `${usagePercentage(usage.scheduledPosts, usage.scheduledPostsLimit)}%` }}
                  />
                </div>
              </div>
            </div>
            {usagePercentage(usage.dmsUsed, usage.dmsLimit) > 80 && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="text-sm">You&apos;re running low on DMs. Upgrade to Pro for unlimited messages!</span>
              </div>
            )}
          </div>
        )}

        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-gray-800 inline-flex items-center">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-medium transition-all",
                billingCycle === "monthly"
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                billingCycle === "annual"
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              Annual
              <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {(Object.keys(PLANS) as Plan[]).map((planKey) => {
            const plan = PLANS[planKey];
            const Icon = plan.icon;
            const isCurrentPlan = currentPlan === planKey;
            const price = getPrice(planKey);
            
            return (
              <div
                key={planKey}
                className={cn(
                  "relative bg-white dark:bg-gray-900 rounded-2xl border-2 transition-all hover:shadow-lg",
                  isCurrentPlan
                    ? "border-blue-500 dark:border-blue-400 shadow-lg"
                    : "border-gray-200 dark:border-gray-800",
                  plan.popular && "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-950"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                
                {isCurrentPlan && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center", plan.color)}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{plan.description}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        {formatPrice(price)}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        /{billingCycle === "monthly" ? "month" : "year"}
                      </span>
                    </div>
                    {billingCycle === "annual" && planKey !== "FREE" && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        Save {formatPrice(getSavings(planKey))} per year
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleSubscribe(planKey)}
                    disabled={isLoading !== null}
                    className={cn(
                      "w-full mb-6",
                      isCurrentPlan
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100"
                        : planKey === "PRO"
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : planKey === "ENTERPRISE"
                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                        : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"
                    )}
                  >
                    {isLoading === planKey ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : isCurrentPlan ? (
                      "Current Plan"
                    ) : currentPlan === "FREE" ? (
                      "Get Started"
                    ) : (
                      "Switch Plan"
                    )}
                  </Button>

                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 dark:text-gray-600 shrink-0 mt-0.5" />
                        )}
                        <span className={cn(
                          "text-sm",
                          feature.included
                            ? "text-gray-700 dark:text-gray-300"
                            : "text-gray-400 dark:text-gray-600"
                        )}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Payment Methods */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-8 border border-gray-200 dark:border-gray-800 text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Accepted Payment Methods
          </h3>
          <div className="flex justify-center items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <CreditCard className="w-5 h-5" />
              <span>Credit/Debit Cards</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Smartphone className="w-5 h-5" />
              <span>UPI</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Shield className="w-5 h-5" />
              <span>Secure Payments via Stripe</span>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-8 border border-gray-200 dark:border-gray-800">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
            Frequently Asked Questions
          </h3>
          <div className="max-w-2xl mx-auto space-y-3">
            {FAQ.map((item, i) => (
              <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="font-medium text-gray-900 dark:text-white">{item.q}</span>
                  {expandedFaq === i ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                {expandedFaq === i && (
                  <div className="px-4 pb-4 text-gray-600 dark:text-gray-400">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Cancel Subscription - Only show if on paid plan */}
        {currentPlan !== "FREE" && (
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => setShowCancelModal(true)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
            >
              Cancel Subscription
            </Button>
          </div>
        )}

        {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Cancel Subscription?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You&apos;ll be downgraded to the Starter plan at the end of your billing period. Your automations beyond the free limit will be paused.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowCancelModal(false)}
              >
                Keep Plan
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleCancel}
                disabled={isLoading !== null}
              >
                {isLoading ? "Cancelling..." : "Confirm Cancel"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}