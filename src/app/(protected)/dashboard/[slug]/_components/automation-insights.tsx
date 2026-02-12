"use client";
import React from "react";
import { useTelemetry } from "@/hooks/use-telemetry";
import {
  Zap,
  Activity,
  Gauge,
  Trophy,
  Hash,
  CheckCircle2,
  Clock,
  XCircle,
  Ban,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

/**
 * ============================================
 * AUTOMATION INSIGHTS COMPONENT
 * Replaces AudienceDemographics. Displays:
 *   A. Automation Health Cards
 *   B. Top Keywords (horizontal bar chart)
 *   C. Scheduler Overview (donut chart)
 * ============================================
 */

// ── Scheduler donut colors ──
const SCHEDULER_COLORS = {
  posted: "#10b981",
  scheduled: "#6366f1",
  failed: "#ef4444",
  cancelled: "#94a3b8",
};

// ── Types ──
type HealthCardProps = {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
  sublabel?: string;
};

// ── Health Card ──
const HealthCard = ({
  label,
  value,
  icon,
  gradient,
  sublabel,
}: HealthCardProps) => (
  <div className="group p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 hover:shadow-lg hover:shadow-neutral-200/50 dark:hover:shadow-neutral-900/50 transition-all duration-300">
    <div
      className={`w-9 h-9 rounded-xl ${gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
    >
      {icon}
    </div>
    <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
    {sublabel && (
      <p className="text-xs text-gray-400 dark:text-gray-500">{sublabel}</p>
    )}
  </div>
);

// ── Loading skeleton ──
const SkeletonCard = () => (
  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 animate-pulse">
    <div className="w-9 h-9 rounded-xl bg-neutral-200 dark:bg-neutral-700 mb-3" />
    <div className="h-6 w-12 bg-neutral-200 dark:bg-neutral-700 rounded mb-2" />
    <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-700 rounded" />
  </div>
);

// ── Format large numbers ──
const fmt = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
};

// ── Custom tooltip for charts ──
const ChartTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 px-3 py-2 shadow-lg">
      <p className="text-sm font-medium text-gray-900 dark:text-white">
        {label}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {fmt(payload[0].value)} hits
      </p>
    </div>
  );
};

// ── Scheduler legend item ──
const LegendItem = ({
  color,
  label,
  count,
  icon,
}: {
  color: string;
  label: string;
  count: number;
  icon: React.ReactNode;
}) => (
  <div className="flex items-center gap-2">
    <span
      className="w-3 h-3 rounded-full flex-shrink-0"
      style={{ backgroundColor: color }}
    />
    <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
      {icon}
      {label}
    </span>
    <span className="ml-auto text-sm font-semibold text-gray-900 dark:text-white">
      {count}
    </span>
  </div>
);

/**
 * ============================================
 * MAIN COMPONENT
 * ============================================
 */
const AutomationInsights = () => {
  const { data: telemetry, isLoading } = useTelemetry();
  const dashboard = telemetry?.data;

  // ── Health Card metrics ──
  const healthCards = React.useMemo(() => {
    if (!dashboard) return [];
    const s = dashboard.summary;
    return [
      {
        label: "Active Automations",
        value: `${s.activeAutomations}/${s.totalAutomations}`,
        icon: <Zap className="w-4 h-4 text-white" />,
        gradient: "bg-gradient-to-br from-amber-500 to-orange-600",
        sublabel: "Active / Total",
      },
      {
        label: "Automated Actions",
        value: fmt(s.totalAutomatedActions),
        icon: <Activity className="w-4 h-4 text-white" />,
        gradient: "bg-gradient-to-br from-purple-500 to-purple-600",
        sublabel: "Lifetime total",
      },
      {
        label: "Response Rate",
        value: `${s.responseRate.toFixed(1)}%`,
        icon: <Gauge className="w-4 h-4 text-white" />,
        gradient: "bg-gradient-to-br from-cyan-500 to-blue-600",
        sublabel: "Last 30 days",
      },
      {
        label: "Top Performer",
        value: s.topPerformerName ?? "—",
        icon: <Trophy className="w-4 h-4 text-white" />,
        gradient: "bg-gradient-to-br from-emerald-500 to-emerald-600",
        sublabel:
          s.topPerformerHits > 0
            ? `${fmt(s.topPerformerHits)} hits`
            : "No data",
      },
    ];
  }, [dashboard]);

  // ── Keyword chart data ──
  const keywordChartData = React.useMemo(() => {
    if (!dashboard?.keywordStats?.length) return [];
    return dashboard.keywordStats.slice(0, 8).map((k) => ({
      name: k.word.length > 12 ? `${k.word.slice(0, 12)}…` : k.word,
      hits: k.totalHits,
    }));
  }, [dashboard]);

  // ── Scheduler data ──
  const schedulerData = React.useMemo(() => {
    if (!dashboard?.schedulerStats) return [];
    const s = dashboard.schedulerStats;
    return [
      { name: "Posted", value: s.posted, color: SCHEDULER_COLORS.posted },
      {
        name: "Scheduled",
        value: s.scheduled,
        color: SCHEDULER_COLORS.scheduled,
      },
      { name: "Failed", value: s.failed, color: SCHEDULER_COLORS.failed },
      {
        name: "Cancelled",
        value: s.cancelled,
        color: SCHEDULER_COLORS.cancelled,
      },
    ].filter((d) => d.value > 0);
  }, [dashboard]);

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 animate-pulse" />
          <div className="h-64 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 animate-pulse" />
        </div>
      </div>
    );
  }

  // ── Empty state ──
  if (!dashboard) {
    return (
      <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 p-12 text-center">
        <Activity className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          No Telemetry Data
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto">
          Create automations and schedule posts to see performance insights
          here.
        </p>
      </div>
    );
  }

  const hasSchedulerData = schedulerData.length > 0;
  const stats = dashboard.schedulerStats;

  return (
    <div className="space-y-6">
      {/* ── Section Header ── */}
      <div className="flex items-center gap-2">
        <Activity className="w-5 h-5 text-indigo-500" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Automation Insights
        </h2>
      </div>

      {/* ── A: Health Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {healthCards.map((card, i) => (
          <HealthCard key={i} {...card} />
        ))}
      </div>

      {/* ── B + C: Keywords + Scheduler ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ── B: Top Keywords ── */}
        <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Hash className="w-4 h-4 text-purple-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Top Keywords
            </h3>
          </div>

          {keywordChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={keywordChartData}
                layout="vertical"
                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={90}
                  tick={{
                    fontSize: 12,
                    fill: "currentColor",
                  }}
                  className="text-gray-500 dark:text-gray-400"
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ fill: "transparent" }}
                />
                <Bar
                  dataKey="hits"
                  fill="#8b5cf6"
                  radius={[0, 6, 6, 0]}
                  barSize={16}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center">
              <p className="text-sm text-gray-400 dark:text-gray-500">
                No keywords configured yet
              </p>
            </div>
          )}
        </div>

        {/* ── C: Scheduler Overview ── */}
        <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Scheduler Overview
            </h3>
          </div>

          {hasSchedulerData ? (
            <div className="flex items-center gap-6">
              {/* Donut */}
              <div className="relative w-36 h-36 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={schedulerData}
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {schedulerData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {stats.successRate.toFixed(0)}%
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">
                    success
                  </span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex-1 space-y-3">
                <LegendItem
                  color={SCHEDULER_COLORS.posted}
                  label="Posted"
                  count={stats.posted}
                  icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                />
                <LegendItem
                  color={SCHEDULER_COLORS.scheduled}
                  label="Scheduled"
                  count={stats.scheduled}
                  icon={<Clock className="w-3.5 h-3.5" />}
                />
                <LegendItem
                  color={SCHEDULER_COLORS.failed}
                  label="Failed"
                  count={stats.failed}
                  icon={<XCircle className="w-3.5 h-3.5" />}
                />
                <LegendItem
                  color={SCHEDULER_COLORS.cancelled}
                  label="Cancelled"
                  count={stats.cancelled}
                  icon={<Ban className="w-3.5 h-3.5" />}
                />
              </div>
            </div>
          ) : (
            <div className="h-[180px] flex items-center justify-center">
              <p className="text-sm text-gray-400 dark:text-gray-500">
                No scheduled posts yet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutomationInsights;
