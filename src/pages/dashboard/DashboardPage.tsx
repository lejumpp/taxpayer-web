import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  FileText,
  TrendingUp,
  Receipt,
  Wallet,
  ArrowRight,
  Inbox,
  Plus,
  PieChart as PieChartIcon,
  BarChart3,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useDashboardTransactions, useTaxSummary, useCashflowTransactions } from "@/hooks/useDashboard";
import {
  formatJMD,
  formatJMDParts,
  formatJMDCompact,
  formatJMDWhole,
} from "@/lib/currency";
import TransactionModal from "@/components/transactions/TransactionModal";
import TransactionCard from "@/components/transactions/TransactionCard";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

// ─── Constants ────────────────────────────────────────────────────────────────

const CARD = "bg-white rounded-2xl border border-cream-border shadow-none ring-0 py-0 gap-0";

const TAX_ITEMS = [
  {
    label: "Income tax",
    key: "incomeTaxDueCents",
    dot: "bg-brand-400",
    chartColor: "var(--color-brand-400)",
  },
  {
    label: "NIS",
    key: "nisDueCents",
    dot: "bg-success-400",
    chartColor: "var(--color-success-400)",
  },
  {
    label: "NHT",
    key: "nhtDueCents",
    dot: "bg-info-600",
    chartColor: "var(--color-info-600)",
  },
  {
    label: "Education tax",
    key: "educationTaxDueCents",
    dot: "bg-gold-400",
    chartColor: "var(--color-gold-400)",
  },
] as const;

const EXPENSE_BAR_COLORS = ["bg-brand-400", "bg-gold-400", "bg-success-400", "bg-info-600", "bg-gray-400"];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

// ─── Money — large figures with de-emphasized decimals ────────────────────────

function Money({ cents, className = "" }: { cents: number; className?: string }) {
  const { whole, decimal } = formatJMDParts(cents);
  return (
    <span className={className}>
      {whole}
      <span className="font-normal text-sm opacity-45">{decimal}</span>
    </span>
  );
}

// ─── Filing deadline ──────────────────────────────────────────────────────────

function getFilingDeadline(taxYear: number): Date {
  return new Date(taxYear + 1, 2, 15); // March 15 next year
}

function getDaysRemaining(deadline: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // local midnight, not UTC
  return Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function SkeletonHeroCell() {
  return (
    <div className="rounded-2xl border border-cream-border bg-white p-3.5 min-h-27.5">
      <div className="h-full rounded-xl bg-gray-50 animate-pulse" />
    </div>
  );
}

function SkeletonTaxRow() {
  return (
    <div className="flex items-center justify-between animate-pulse">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-xs bg-cream-border" />
        <div className="h-3 w-24 bg-cream-border rounded" />
      </div>
      <div className="h-3 w-20 bg-cream-border rounded" />
    </div>
  );
}

function SkeletonTxnRow() {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5 animate-pulse">
      <div className="w-9 h-9 rounded-[10px] bg-gray-50 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-40 bg-gray-50 rounded" />
        <div className="h-2.5 w-24 bg-gray-50 rounded" />
      </div>
      <div className="space-y-2 flex flex-col items-end">
        <div className="h-3 w-20 bg-gray-50 rounded" />
        <div className="h-2.5 w-16 bg-gray-50 rounded" />
      </div>
    </div>
  );
}

function SkeletonBarRow() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center justify-between mb-1.5">
        <div className="h-3 w-16 bg-gray-50 rounded" />
        <div className="h-3 w-14 bg-gray-50 rounded" />
      </div>
      <div className="h-2 w-full bg-gray-50 rounded-full" />
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const taxYear = new Date().getFullYear();

  const [modalOpen, setModalOpen] = useState(false);

  const { data: transactionData, isLoading: txnsLoading } = useDashboardTransactions();
  const { data: taxSummary, isLoading: taxLoading } = useTaxSummary(taxYear);
  const { data: cashflowData, isLoading: cashflowLoading } = useCashflowTransactions();

  const summary = transactionData?.summary;

  const filingDeadline = getFilingDeadline(taxYear);
  const daysRemaining = getDaysRemaining(filingDeadline);
  const isUrgent = daysRemaining <= 30;

  const totalOwedCents = taxSummary?.breakdown.totalStatutoryLiabilityCents ?? 0;
  const grossIncomeCents = summary?.totalIncomeCents ?? 0;
  const totalExpensesCents = summary?.totalExpensesCents ?? 0;
  const netProfitCents = summary?.netProfitCents ?? 0;
  const marginPct = grossIncomeCents > 0 ? Math.round((netProfitCents / grossIncomeCents) * 100) : 0;

  const taxPieData =
    totalOwedCents > 0
      ? TAX_ITEMS.map((item) => ({
          name: item.label,
          value: taxSummary?.breakdown[item.key] ?? 0,
          color: item.chartColor,
        }))
      : [{ name: "None", value: 1, color: "var(--color-gray-50)" }];

  const expenseData = (() => {
    if (!transactionData?.items) return [];
    const grouped = transactionData.items
      .filter((t) => t.type === "Expense")
      .reduce<{ category: string; name: string; amountCents: number }[]>((acc, t) => {
        const existing = acc.find((e) => e.category === t.category);
        if (existing) {
          existing.amountCents += t.amountCents;
        } else {
          acc.push({ category: t.category, name: t.categoryDisplayName, amountCents: t.amountCents });
        }
        return acc;
      }, []);
    const max = Math.max(...grouped.map((e) => e.amountCents), 0);
    if (max === 0) return [];
    return grouped
      .map((e) => ({ ...e, widthPct: Math.round((e.amountCents / max) * 100) }))
      .sort((a, b) => b.amountCents - a.amountCents)
      .slice(0, 5);
  })();

  const monthlyCashflow = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - (5 - i));
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = new Intl.DateTimeFormat("en-JM", { month: "short" }).format(d);
    const monthTxns = cashflowData?.items.filter((t) => t.transactionDate.startsWith(key)) ?? [];
    const income = monthTxns.filter((t) => t.type === "Income").reduce((sum, t) => sum + t.amountCents, 0);
    const expenses = monthTxns.filter((t) => t.type === "Expense").reduce((sum, t) => sum + t.amountCents, 0);
    return { month: label, income, expenses };
  });
  const hasCashflowData = monthlyCashflow.some((m) => m.income > 0 || m.expenses > 0);

  return (
    <div className="p-6">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl leading-tight text-gray-900">
            {getGreeting()}, {user?.firstName}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Tax year {taxYear} · Here's your financial overview
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-brand-400 text-white text-sm font-medium w-full sm:w-auto shrink-0"
        >
          <Plus size={16} aria-hidden="true" />
          Add transaction
        </button>
      </div>

      {/* Row 1 — Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
        {txnsLoading || taxLoading ? (
          <>
            <SkeletonHeroCell />
            <SkeletonHeroCell />
            <SkeletonHeroCell />
            <SkeletonHeroCell />
          </>
        ) : (
          <>
            {/* Estimated tax owed — terracotta featured */}
            <Card className={`${CARD} p-3.5 bg-brand-400 border-transparent justify-between min-h-27.5`}>
              <div className="flex items-start justify-between">
                <p className="text-xs text-white/70">Estimated tax owed</p>
                <div className="w-7.5 h-7.5 rounded-lg bg-white/15 flex items-center justify-center">
                  <FileText size={15} className="text-white" aria-hidden="true" />
                </div>
              </div>
              <div>
                <Money
                  cents={totalOwedCents}
                  className="text-2xl font-bold text-white tabular-nums wrap-break-word"
                />
                <p className="text-xs text-white/60 mt-1">Due Mar 15, {taxYear + 1}</p>
              </div>
            </Card>

            {/* Gross income */}
            <Card className={`${CARD} p-3.5 justify-between min-h-27.5`}>
              <div className="flex items-start justify-between">
                <p className="text-xs text-gray-400">Gross income</p>
                <div className="w-7.5 h-7.5 rounded-lg bg-success-100 flex items-center justify-center">
                  <TrendingUp size={15} className="text-success-600" aria-hidden="true" />
                </div>
              </div>
              <div>
                <Money
                  cents={grossIncomeCents}
                  className="text-2xl font-bold text-success-600 tabular-nums wrap-break-word"
                />
                <p className="text-xs text-success-600 mt-1 flex items-center gap-1">
                  <span aria-hidden="true">▲</span> Full year
                </p>
              </div>
            </Card>

            {/* Total expenses */}
            <Card className={`${CARD} p-3.5 justify-between min-h-27.5`}>
              <div className="flex items-start justify-between">
                <p className="text-xs text-gray-400">Total expenses</p>
                <div className="w-7.5 h-7.5 rounded-lg bg-gray-50 flex items-center justify-center">
                  <Receipt size={15} className="text-gray-400" aria-hidden="true" />
                </div>
              </div>
              <div>
                <Money
                  cents={totalExpensesCents}
                  className="text-2xl font-bold text-gray-900 tabular-nums wrap-break-word"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {totalExpensesCents === 0
                    ? "No expenses logged"
                    : `${summary?.expenseCount ?? 0} transaction${summary?.expenseCount === 1 ? "" : "s"} logged`}
                </p>
              </div>
            </Card>

            {/* Net profit */}
            <Card className={`${CARD} p-3.5 justify-between min-h-27.5`}>
              <div className="flex items-start justify-between">
                <p className="text-xs text-gray-400">Net profit</p>
                <div className="w-7.5 h-7.5 rounded-lg bg-gray-50 flex items-center justify-center">
                  <Wallet size={15} className="text-gray-400" aria-hidden="true" />
                </div>
              </div>
              <div>
                <Money
                  cents={netProfitCents}
                  className="text-2xl font-bold text-gray-900 tabular-nums wrap-break-word"
                />
                <p className="text-xs text-gray-400 mt-1">{marginPct}% margin</p>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Row 2 — Tax breakdown, Filing deadline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        {/* Widget 2 — Tax breakdown / Cashflow */}
        <Card className={`${CARD} md:col-span-2 p-5`}>
          <Tabs defaultValue="tax" className="flex-1 flex flex-col gap-0">
            <div className="flex items-center justify-between mb-4">
              <TabsList variant="line" className="p-0 h-auto gap-4 bg-transparent justify-start">
                <TabsTrigger
                  value="tax"
                  className="px-0 py-0 h-auto text-sm font-medium text-gray-400 data-active:bg-transparent data-active:text-gray-900 data-active:after:bg-brand-400"
                >
                  Tax breakdown
                </TabsTrigger>
                <TabsTrigger
                  value="cashflow"
                  className="px-0 py-0 h-auto text-sm font-medium text-gray-400 data-active:bg-transparent data-active:text-gray-900 data-active:after:bg-brand-400"
                >
                  Cashflow
                </TabsTrigger>
              </TabsList>
              <span className="text-xs text-gray-400">{taxYear}</span>
            </div>

            <TabsContent value="tax" className="flex-1 flex flex-col gap-0 min-h-45">
              {taxLoading ? (
                <div className="flex flex-col gap-2.5 flex-1">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonTaxRow key={i} />
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative w-40 h-40 shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={taxPieData}
                            dataKey="value"
                            innerRadius={55}
                            outerRadius={78}
                            startAngle={90}
                            endAngle={-270}
                            paddingAngle={totalOwedCents > 0 ? 3 : 0}
                            stroke="none"
                          >
                            {taxPieData.map((d, i) => (
                              <Cell key={i} fill={d.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
                        <span className="text-xs text-gray-400">Total owed</span>
                        <span className="text-base font-semibold text-gray-900 tabular-nums">
                          {formatJMDCompact(totalOwedCents)}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-2.5 min-w-0">
                      {TAX_ITEMS.map((item) => (
                        <div key={item.label} className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600 min-w-0">
                            <span className={`w-2 h-2 rounded-xs shrink-0 ${item.dot}`} />
                            <span className="truncate">{item.label}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900 tabular-nums shrink-0">
                            {formatJMD(taxSummary?.breakdown[item.key] ?? 0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <hr className="border-t border-gray-50 my-3" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Total owed</span>
                    <Money
                      cents={totalOwedCents}
                      className="text-base font-medium text-brand-600 tabular-nums"
                    />
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="cashflow" className="flex-1 flex flex-col min-h-45">
              {cashflowLoading ? (
                <div className="flex-1 flex items-end gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 h-24 bg-gray-50 rounded-t-md animate-pulse"
                      style={{ opacity: 0.5 + (i % 3) * 0.15 }}
                    />
                  ))}
                </div>
              ) : !hasCashflowData ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <BarChart3 size={32} className="text-gray-100 mb-3" aria-hidden="true" />
                  <p className="text-sm text-gray-400">Not enough data yet.</p>
                  <p className="text-xs text-gray-200 mt-1">
                    Add income and expenses to see monthly cashflow.
                  </p>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={monthlyCashflow} barGap={4} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "var(--color-gray-400)", fontSize: 12 }}
                        dy={6}
                      />
                      <Tooltip
                        cursor={{ fill: "var(--color-gray-25)" }}
                        formatter={(value, name) => [
                          formatJMD(Number(value)),
                          name === "income" ? "Income" : "Expenses",
                        ]}
                        contentStyle={{
                          fontSize: 12,
                          borderRadius: 8,
                          border: "1px solid var(--color-cream-border)",
                        }}
                      />
                      <Bar dataKey="income" fill="var(--color-chart-income)" radius={[6, 6, 0, 0]} barSize={28} />
                      <Bar
                        dataKey="expenses"
                        fill="var(--color-chart-expense)"
                        radius={[6, 6, 0, 0]}
                        barSize={20}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1.5 text-xs text-gray-600">
                      <span className="w-2.5 h-2.5 rounded-xs bg-chart-income" />
                      Income
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-600">
                      <span className="w-2.5 h-2.5 rounded-xs bg-chart-expense" />
                      Expenses
                    </span>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </Card>

        {/* Widget 3 — Filing deadline */}
        <Card className={`${CARD} p-6 justify-between`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-base font-bold text-gray-900">Next filing due</p>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  isUrgent ? "bg-brand-400 text-white" : "bg-brand-100 text-brand-600"
                }`}
              >
                {daysRemaining <= 0 ? "Due today" : `${daysRemaining} days`}
              </span>
            </div>
            <p
              className={`text-4xl font-bold tabular-nums ${
                isUrgent ? "text-brand-600" : "text-gray-900"
              }`}
            >
              {filingDeadline.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <p className="text-sm text-gray-400 mt-2">Estimated income-tax return, TY{taxYear}</p>
          </div>

          <Link
            to="/tax"
            className={`mt-6 flex items-center justify-center text-sm font-bold rounded-full py-3 border transition-colors ${
              isUrgent
                ? "border-transparent bg-brand-50 text-brand-600 hover:bg-brand-100"
                : "border-cream-border text-brand-600 hover:bg-gray-25"
            }`}
          >
            Review filing
          </Link>
        </Card>
      </div>

      {/* Row 3 — Recent transactions, Expense breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Widget 4 — Recent transactions */}
        <Card className={`${CARD} md:col-span-2 overflow-hidden`}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <p className="text-sm font-medium text-gray-900">Recent transactions</p>
            <Link
              to="/transactions"
              className="flex items-center gap-1 text-xs text-brand-600 hover:underline"
            >
              View all
              <ArrowRight size={13} aria-hidden="true" />
            </Link>
          </div>

          {txnsLoading ? (
            <div className="divide-y divide-gray-50">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonTxnRow key={i} />
              ))}
            </div>
          ) : !transactionData?.items.length ? (
            <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
              <Inbox size={32} className="text-gray-100 mb-3" aria-hidden="true" />
              <p className="text-sm text-gray-400">No transactions yet.</p>
              <p className="text-xs text-gray-200 mt-1">Add income or expenses to see them here.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {transactionData.items.map((txn) => (
                <TransactionCard
                  key={txn.id}
                  transaction={txn}
                  onClick={() => navigate(`/transactions/${txn.id}`)}
                />
              ))}
            </div>
          )}
        </Card>

        {/* Widget 5 — Expense breakdown */}
        <Card className={`${CARD} p-5`}>
          <p className="text-sm font-medium text-gray-900 mb-4">Expense breakdown</p>

          {txnsLoading ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonBarRow key={i} />
              ))}
            </div>
          ) : expenseData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-50 text-center">
              <PieChartIcon size={32} className="text-gray-100 mb-3" aria-hidden="true" />
              <p className="text-sm text-gray-400">Not enough data yet.</p>
              <p className="text-xs text-gray-200 mt-1">Add more expenses to see your breakdown.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {expenseData.map((item, i) => (
                <div key={item.category}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-gray-600">{item.name}</span>
                    <span className="text-sm font-medium text-gray-900 tabular-nums">
                      {formatJMDWhole(item.amountCents)}
                    </span>
                  </div>
                  <Progress
                    value={item.widthPct}
                    className="h-2 bg-gray-50"
                    indicatorClassName={EXPENSE_BAR_COLORS[i % EXPENSE_BAR_COLORS.length]}
                  />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <TransactionModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
