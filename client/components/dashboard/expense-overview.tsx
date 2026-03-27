"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ExpenseStats } from "@/lib/api/expenses";
import { useTranslation } from "@/lib/i18n/context";
import { TrendingDown, TrendingUp, Receipt } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ExpenseOverviewProps {
  data: ExpenseStats | undefined;
  isLoading: boolean;
}

const CATEGORY_COLORS = [
  "hsl(262, 83%, 58%)",
  "hsl(221, 83%, 58%)",
  "hsl(142, 76%, 36%)",
  "hsl(24, 95%, 53%)",
  "hsl(346, 77%, 49%)",
  "hsl(197, 71%, 52%)",
  "hsl(45, 93%, 47%)",
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background/95 backdrop-blur-sm px-3 py-2 shadow-xl">
      <p className="text-sm font-bold">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

export function ExpenseOverview({ data, isLoading }: ExpenseOverviewProps) {
  const { t } = useTranslation();

  const chartData = (data?.by_category ?? [])
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total)
    .map((c) => ({
      name: t(`expenses.cat_${c.category}`),
      total: Number(c.total),
    }));

  const isProfit = (data?.net_profit ?? 0) >= 0;

  return (
    <Card className="border transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg">{t("dashboard.expense_title")}</CardTitle>
        <CardDescription>{t("dashboard.expense_desc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {isLoading ? (
          <>
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-[200px] w-full rounded-lg" />
          </>
        ) : !data ? null : (
          <>
            {/* Mini stat row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-800/30 p-3">
                <p className="text-xs text-muted-foreground mb-1">{t("dashboard.expense_total")}</p>
                <p className="text-base font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(Number(data.total_expenses))}
                </p>
              </div>
              <div
                className={`rounded-lg border p-3 ${
                  isProfit
                    ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/50 dark:border-emerald-800/30"
                    : "bg-red-50 dark:bg-red-950/30 border-red-200/50 dark:border-red-800/30"
                }`}
              >
                <p className="text-xs text-muted-foreground mb-1">{t("dashboard.expense_net_profit")}</p>
                <div className="flex items-center gap-1">
                  {isProfit ? (
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5 text-red-600 dark:text-red-400 shrink-0" />
                  )}
                  <p
                    className={`text-base font-bold ${
                      isProfit
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {formatCurrency(Number(data.net_profit))}
                  </p>
                </div>
              </div>
              <div className="rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-200/50 dark:border-violet-800/30 p-3">
                <div className="flex items-center gap-1 mb-1">
                  <Receipt className="h-3 w-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{t("dashboard.expense_tax_deductible")}</p>
                </div>
                <p className="text-base font-bold text-violet-600 dark:text-violet-400">
                  {formatCurrency(Number(data.tax_deductible_total))}
                </p>
              </div>
            </div>

            {/* Category bar chart */}
            {chartData.length === 0 ? (
              <div className="h-[180px] flex items-center justify-center text-sm text-muted-foreground">
                {t("dashboard.expense_no_data")}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(180, chartData.length * 40)}>
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                >
                  <XAxis
                    type="number"
                    tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                    width={72}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
                  <Bar dataKey="total" radius={[0, 4, 4, 0]} maxBarSize={24}>
                    {chartData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
