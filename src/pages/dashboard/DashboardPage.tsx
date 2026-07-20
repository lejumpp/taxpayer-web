import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Sector,
  type SectorProps,
} from "recharts";

import { useAuth } from "@/context/AuthContext";
import { useDashboardTransactions, useTaxSummary } from "@/hooks/useDashboard";
import { formatJMD } from "@/lib/currency";
import TransactionModal from "@/components/transactions/TransactionModal";
import TransactionCard from "@/components/transactions/TransactionCard";

// ─── Constants ────────────────────────────────────────────────────────────────

const PIE_COLORS = ["#F5C9B2", "#C04828", "#1D9E75", "#185FA5", "#888780"];

const TAX_ITEMS = [
  { label: "Income tax", color: "#C04828", key: "incomeTaxDueCents" },
  { label: "NIS", color: "#1D9E75", key: "nisDueCents" },
  { label: "NHT", color: "#185FA5", key: "nhtDueCents" },
  { label: "Education tax", color: "#F5C9B2", key: "educationTaxDueCents" },
] as const;

function renderPieLabel(props: {
  cx: number;
  cy: number;
  midAngle: number;
  outerRadius: number;
  index: number;
  name: string;
  percentage: number;
}) {
  const { cx, cy, midAngle, outerRadius, index, name, percentage } = props;
  if (percentage < 10) return null;
  const RADIAN = Math.PI / 180;
  const r = outerRadius * 0.62;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  // #F5C9B2 (index 0) is light — use dark text; all others use white
  const fill = index === 0 ? "#5F5E5A" : "white";
  const short = name.length > 9 ? name.slice(0, 8) + "…" : name;
  return (
    <g>
      <text x={x} y={y - 7} textAnchor="middle" fontSize={11} fill={fill} opacity={0.85}>
        {short}
      </text>
      <text x={x} y={y + 8} textAnchor="middle" fontSize={14} fontWeight={700} fill={fill}>
        {percentage}%
      </text>
    </g>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function SkeletonHeroCell() {
  return <div className="rounded-xl min-h-27.5 bg-gray-50 animate-pulse" />;
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

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const taxYear = new Date().getFullYear();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"Income" | "Expense">("Income");

  const { data: transactionData, isLoading: txnsLoading } =
    useDashboardTransactions();
  const { data: taxSummary, isLoading: taxLoading } = useTaxSummary(taxYear);

  const summary = transactionData?.summary;

  function handleAddIncome() {
    setModalType("Income");
    setModalOpen(true);
  }

  function handleAddExpense() {
    setModalType("Expense");
    setModalOpen(true);
  }

  const expenseData = (() => {
    if (!transactionData?.items) return [];
    const grouped = transactionData.items
      .filter((t) => t.type === "Expense")
      .reduce<{ category: string; name: string; amountCents: number }[]>(
        (acc, t) => {
          const existing = acc.find((e) => e.category === t.category);
          if (existing) {
            existing.amountCents += t.amountCents;
          } else {
            acc.push({
              category: t.category,
              name: t.categoryDisplayName,
              amountCents: t.amountCents,
            });
          }
          return acc;
        },
        [],
      );
    const total = grouped.reduce((sum, e) => sum + e.amountCents, 0);
    if (total === 0) return [];
    return grouped
      .map((e) => ({
        ...e,
        percentage: Math.round((e.amountCents / total) * 100),
      }))
      .sort((a, b) => b.amountCents - a.amountCents)
      .slice(0, 5);
  })();

  return (
    <div className="p-6">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-[22px] font-medium text-[#2C2C2A]">
          {getGreeting()}, {user?.firstName} 👋
        </h1>
        <p className="text-[13px] text-[#888780] mt-0.5">
          Tax year {taxYear} · Here's your financial overview
        </p>
      </div>

      {/* Row 1 — Hero, Tax breakdown, Add transaction */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        {/* Widget 1 — Hero card */}
        <div className="grid grid-cols-2 grid-rows-2 gap-2.5 p-5 bg-white rounded-2xl border border-cream-border">
          {txnsLoading || taxLoading ? (
            <>
              <SkeletonHeroCell />
              <SkeletonHeroCell />
              <SkeletonHeroCell />
              <SkeletonHeroCell />
            </>
          ) : (
            <>
              {/* Top-left — terracotta featured */}
              <div className="rounded-xl p-3.5 bg-brand-400 flex flex-col justify-between min-h-27.5">
                <div className="flex items-start justify-between">
                  <p className="text-[12px] text-white/70">
                    Estimated tax owed
                  </p>
                  <div className="w-7.5 h-7.5 rounded-lg bg-white/15 flex items-center justify-center">
                    <i
                      className="ti ti-file-invoice text-white text-[15px]"
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-[19px] font-medium text-white tabular-nums break-words">
                    {formatJMD(
                      taxSummary?.breakdown.totalStatutoryLiabilityCents ?? 0,
                    )}
                  </p>
                  <p className="text-[11px] text-white/60 mt-1">
                    Due Mar 15, {taxYear + 1}
                  </p>
                </div>
              </div>

              {/* Top-right — Gross income */}
              <div className="rounded-xl p-3.5 bg-[#F0FAF6] flex flex-col justify-between min-h-27.5">
                <div className="flex items-start justify-between">
                  <p className="text-[12px] text-[#888780]">Gross income</p>
                  <div className="w-7.5 h-7.5 rounded-lg bg-[#D1F2E6] flex items-center justify-center">
                    <i
                      className="ti ti-trending-up text-[#0F6E56] text-[15px]"
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <p className="text-[19px] font-medium text-[#0F6E56] tabular-nums break-words">
                  {formatJMD(summary?.totalIncomeCents ?? 0)}
                </p>
              </div>

              {/* Bottom-left — Total expenses */}
              <div className="rounded-xl p-3.5 bg-[#F9F8F5] flex flex-col justify-between min-h-27.5">
                <div className="flex items-start justify-between">
                  <p className="text-[12px] text-[#888780]">Total expenses</p>
                  <div className="w-7.5 h-7.5 rounded-lg bg-[#EDEBE4] flex items-center justify-center">
                    <i
                      className="ti ti-receipt text-[#888780] text-[15px]"
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <p className="text-[19px] font-medium text-[#2C2C2A] tabular-nums break-words">
                  {formatJMD(summary?.totalExpensesCents ?? 0)}
                </p>
              </div>

              {/* Bottom-right — Net profit */}
              <div className="rounded-xl p-3.5 bg-[#F9F8F5] flex flex-col justify-between min-h-27.5">
                <div className="flex items-start justify-between">
                  <p className="text-[12px] text-[#888780]">Net profit</p>
                  <div className="w-7.5 h-7.5 rounded-lg bg-[#EDEBE4] flex items-center justify-center">
                    <i
                      className="ti ti-wallet text-[#888780] text-[15px]"
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <p className="text-[19px] font-medium text-[#2C2C2A] tabular-nums break-words">
                  {formatJMD(summary?.netProfitCents ?? 0)}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Widget 2 — Tax breakdown */}
        <div className="bg-white rounded-2xl border border-cream-border p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[13px] font-medium text-[#2C2C2A]">
              Tax breakdown
            </p>
            <span className="text-[12px] text-[#888780]">{taxYear}</span>
          </div>

          {taxLoading ? (
            <div className="flex flex-col gap-2.5 flex-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonTaxRow key={i} />
              ))}
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2.5 flex-1">
                {TAX_ITEMS.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 text-[13px] text-[#5F5E5A]">
                      <div
                        className="w-2 h-2 rounded-xs"
                        style={{ background: item.color }}
                      />
                      {item.label}
                    </div>
                    <span className="text-[13px] font-medium text-[#2C2C2A] tabular-nums">
                      {formatJMD(taxSummary?.breakdown[item.key] ?? 0)}
                    </span>
                  </div>
                ))}
              </div>
              <hr className="border-t border-gray-50 my-2.5" />
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-[#2C2C2A]">
                  Total owed
                </span>
                <span className="text-[16px] font-medium text-[#993C1D] tabular-nums">
                  {formatJMD(
                    taxSummary?.breakdown.totalStatutoryLiabilityCents ?? 0,
                  )}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Widget 3 — Add transaction */}
        <div className="bg-white rounded-2xl border border-cream-border p-5">
          <p className="text-[13px] font-medium text-[#2C2C2A] mb-1">
            Add transaction
          </p>
          <p className="text-[12px] text-[#888780] mb-4">
            Record a new income or expense
          </p>

          <div className="flex flex-col gap-2.5">
            <button
              onClick={handleAddIncome}
              className="flex items-center gap-2.5 p-3 rounded-xl border border-success-100 bg-success-50 hover:bg-[#D0F0E4] transition-colors w-full"
            >
              <div className="w-8.5 h-8.5 rounded-lg bg-success-400 flex items-center justify-center shrink-0">
                <i
                  className="ti ti-trending-up text-white text-[16px]"
                  aria-hidden="true"
                />
              </div>
              <div className="text-left">
                <p className="text-[13px] font-medium text-[#0F6E56]">
                  Add income
                </p>
                <p className="text-[11px] text-success-400">
                  Sales, fees, revenue
                </p>
              </div>
              <i
                className="ti ti-chevron-right text-gray-200 text-[15px] ml-auto"
                aria-hidden="true"
              />
            </button>

            <button
              onClick={handleAddExpense}
              className="flex items-center gap-2.5 p-3 rounded-xl border border-brand-100 bg-brand-50 hover:bg-[#FAE4D4] transition-colors w-full"
            >
              <div className="w-8.5 h-8.5 rounded-lg bg-brand-400 flex items-center justify-center shrink-0">
                <i
                  className="ti ti-trending-down text-white text-[16px]"
                  aria-hidden="true"
                />
              </div>
              <div className="text-left">
                <p className="text-[13px] font-medium text-[#993C1D]">
                  Add expense
                </p>
                <p className="text-[11px] text-brand-400">
                  Rent, utilities, vehicle
                </p>
              </div>
              <i
                className="ti ti-chevron-right text-gray-200 text-[15px] ml-auto"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Row 2 — Recent transactions, Expense pie */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Widget 4 — Recent transactions */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-cream-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <p className="text-[13px] font-medium text-[#2C2C2A]">
              Recent transactions
            </p>
            <Link
              to="/transactions"
              className="flex items-center gap-1 text-[12px] text-brand-400 hover:underline"
            >
              View all
              <i className="ti ti-arrow-right text-[13px]" aria-hidden="true" />
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
              <i
                className="ti ti-receipt-off text-[32px] text-[#D3D1C7] mb-3"
                aria-hidden="true"
              />
              <p className="text-[13px] text-[#888780]">No transactions yet.</p>
              <p className="text-[12px] text-gray-200 mt-1">
                Add income or expenses to see them here.
              </p>
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
        </div>

        {/* Widget 5 — Expense breakdown pie */}
        <div className="bg-white rounded-2xl border border-cream-border p-5">
          <p className="text-[13px] font-medium text-[#2C2C2A] mb-4">
            Expense breakdown
          </p>

          {txnsLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="w-35 h-35 rounded-full bg-gray-50 animate-pulse" />
            </div>
          ) : expenseData.length < 2 ? (
            <div className="flex flex-col items-center justify-center h-50 text-center">
              <i
                className="ti ti-chart-pie text-[32px] text-[#D3D1C7] mb-3"
                aria-hidden="true"
              />
              <p className="text-[13px] text-[#888780]">Not enough data yet.</p>
              <p className="text-[12px] text-gray-200 mt-1">
                Add more expenses to see your breakdown.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  dataKey="amountCents"
                  paddingAngle={4}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  label={renderPieLabel as any}
                  labelLine={false}
                  activeShape={(props: SectorProps) => (
                    <Sector
                      {...props}
                      outerRadius={(props.outerRadius ?? 95) + 10}
                    />
                  )}
                >
                  {expenseData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                      stroke="white"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [formatJMD(Number(value)), "Amount"]}
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid #E8D9C0",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <TransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultType={modalType}
      />
    </div>
  );
}
