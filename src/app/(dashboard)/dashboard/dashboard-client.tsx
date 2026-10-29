"use client";

import { useApp } from "@/lib/app-context";
import { formatCurrency } from "@/lib/utils";
import {
  Users,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Wallet,
} from "lucide-react";

interface DashboardStats {
  totalStudents: number;
  totalGroups: number;
  expectedRevenue: number;
  collectedRevenue: number;
  paidCount: number;
  unpaidCount: number;
}

export function DashboardClient({
  stats,
  userName,
}: {
  stats: DashboardStats;
  userName: string;
}) {
  const { t } = useApp();

  const cards = [
    {
      label: t.dashboard.activeStudents,
      value: stats.totalStudents.toString(),
      icon: Users,
      sub: t.dashboard.acrossGroups.replace("{count}", stats.totalGroups.toString()),
    },
    {
      label: t.dashboard.expectedRevenue,
      value: formatCurrency(stats.expectedRevenue),
      icon: TrendingUp,
      sub: t.dashboard.thisMonth,
    },
    {
      label: t.dashboard.collectedRevenue,
      value: formatCurrency(stats.collectedRevenue),
      icon: DollarSign,
      sub: t.dashboard.paidCount.replace("{count}", stats.paidCount.toString()),
    },
    {
      label: t.dashboard.unpaidStudents,
      value: stats.unpaidCount.toString(),
      icon: AlertCircle,
      sub: t.dashboard.pending,
    },
  ];

  const percentage = stats.totalStudents > 0
    ? Math.round((stats.paidCount / stats.totalStudents) * 100)
    : 0;

  return (
    <div className="space-y-8 font-sans">
      {/* Base44 Display / Headline Style */}
      <div className="space-y-1.5">
        <h1 className="text-[38px] font-normal tracking-tight text-foreground base44-headline">
          {t.dashboard.title}
        </h1>
        <p className="text-[14px] font-normal text-muted-foreground font-sans">
          {t.dashboard.welcome.replace("{name}", userName)}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-border bg-card p-5 transition-all hover:border-foreground/20 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-muted-foreground">
                {card.label}
              </span>
              <card.icon className="h-4 w-4 text-muted-foreground stroke-[1.75]" />
            </div>
            <p className="mt-3 text-[32px] sm:text-[36px] font-bold text-foreground font-sans tracking-tight leading-none">
              {card.value}
            </p>
            <p className="mt-1 text-[13px] text-muted-foreground">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Progress Canvas Card */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#ff5c16]/10 text-[#ff5c16]">
              <Wallet className="h-4.5 w-4.5 stroke-[1.75]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                {t.dashboard.summaryTitle}
              </h3>
              <p className="text-[13px] text-muted-foreground">
                {t.dashboard.summaryDesc
                  .replace("{total}", stats.totalStudents.toString())
                  .replace("{paid}", stats.paidCount.toString())
                  .replace("{percent}", percentage.toString())}
              </p>
            </div>
          </div>
          <span className="text-sm font-bold text-foreground font-sans">
            {percentage}%
          </span>
        </div>

        {stats.totalStudents > 0 && (
          <div className="mt-5">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/[0.06] dark:bg-[#262626]">
              <div
                className="h-full rounded-full bg-[#ff5c16] transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
