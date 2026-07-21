import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import InfoTooltip from '../../components/ui/InfoTooltip'
import { useTaxSummary } from '../../hooks/useDashboard'
import { formatJMD } from '../../lib/currency'

const isPremium = false

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="text-xs font-medium text-gray-200 uppercase tracking-[0.07em] px-6 pt-3.5 pb-2">
      {label}
    </p>
  )
}

function StandardRow({
  label,
  value,
  tooltip,
  deduction,
}: {
  label: string
  value: string
  tooltip?: string
  deduction?: boolean
}) {
  return (
    <div className="flex items-center justify-between px-6 py-3.5 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-2 text-sm text-[#5F5E5A]">
        {label}
        {tooltip && <InfoTooltip content={tooltip} />}
      </div>
      {deduction ? (
        <span className="text-sm font-medium text-[#888780] tabular-nums">−{value}</span>
      ) : (
        <span className="text-sm font-medium text-[#2C2C2A] tabular-nums">{value}</span>
      )}
    </div>
  )
}

function SubtotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-6 py-3.5 bg-gray-25">
      <span className="text-sm font-medium text-[#2C2C2A]">{label}</span>
      <span className="text-base font-medium text-[#2C2C2A] tabular-nums">{value}</span>
    </div>
  )
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-6 py-3.5 bg-brand-50 border-t border-brand-100">
      <span className="text-base font-medium text-[#2C2C2A]">{label}</span>
      <span className="text-base font-semibold text-[#993C1D] tabular-nums">{value}</span>
    </div>
  )
}

function SkeletonRows({ count }: { count: number }) {
  return (
    <div className="px-6 py-3.5 space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex justify-between">
          <div className="h-4 w-32 bg-gray-50 rounded animate-pulse" />
          <div className="h-4 w-24 bg-gray-50 rounded animate-pulse" />
        </div>
      ))}
    </div>
  )
}

export default function TaxSummaryPage() {
  const navigate = useNavigate()
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const availableYears = [currentYear - 2, currentYear - 1, currentYear]

  const { data: taxSummary, isLoading } = useTaxSummary(selectedYear)

  const threshold = (taxSummary?.netProfitCents ?? 0) - (taxSummary?.taxableIncomeCents ?? 0)

  const tooltips = {
    grossIncome: 'Total income from all sources before any deductions.',
    allowableExpenses: 'Tax deductible expenses only — non-deductible expenses are excluded from this figure.',
    threshold: `Personal income tax exemption threshold for ${selectedYear}. Figures below this amount are not taxed.`,
    nis: 'National Insurance Scheme — 6% of net profit, capped at J$5,000,000 in earnings.',
    nht: 'National Housing Trust — 3% of net profit.',
    educationTax: 'Education Tax — 2.25% of net profit after NIS deduction.',
  }

  const isEmpty =
    !isLoading &&
    taxSummary &&
    taxSummary.grossIncomeCents === 0 &&
    taxSummary.breakdown.totalStatutoryLiabilityCents === 0

  const yearSelector = (
    <div className="flex items-center gap-px bg-white border border-cream-border rounded-[10px] overflow-hidden">
      {availableYears.map((year) => (
        <button
          key={year}
          onClick={() => setSelectedYear(year)}
          className={`px-3.5 py-1.5 text-sm font-['Inter'] border-none cursor-pointer transition-colors ${
            selectedYear === year
              ? 'bg-brand-400 text-white font-medium'
              : 'bg-transparent text-[#5F5E5A] hover:bg-gray-25'
          }`}
        >
          {year}
        </button>
      ))}
    </div>
  )

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-medium text-[#2C2C2A]">
            {selectedYear} tax summary
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1 bg-brand-50 border border-brand-100 rounded-full px-2.5 py-0.5 text-xs font-medium text-[#993C1D]">
              <i className="ti ti-calculator text-xs" aria-hidden="true" />
              Estimate
            </span>
          </div>
        </div>
        {yearSelector}
      </div>

      {/* Hero banner */}
      <div className="bg-[#2C2C2A] rounded-2xl px-8 py-7 mb-5">
        <p className="text-xs font-medium text-white/40 uppercase tracking-[0.07em] mb-2.5">
          Estimated total tax & contributions
        </p>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-11 w-48 bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-64 bg-white/10 rounded animate-pulse" />
          </div>
        ) : (
          <>
            <p className="text-5xl font-semibold text-white tabular-nums tracking-[-0.02em] mb-2">
              {formatJMD(taxSummary?.breakdown.totalStatutoryLiabilityCents ?? 0)}
            </p>
            <p className="text-sm text-white/50">
              On net profit of{' '}
              <span className="text-white/80">
                {formatJMD(taxSummary?.netProfitCents ?? 0)}
              </span>{' '}
              for the {selectedYear} tax year.
            </p>
          </>
        )}
      </div>

      {isEmpty ? (
        <div className="bg-white rounded-2xl border border-cream-border mb-4">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <i className="ti ti-file-invoice text-4xl text-[#D3D1C7] mb-4" aria-hidden="true" />
            <p className="text-base font-medium text-[#2C2C2A] mb-1">No data for {selectedYear}</p>
            <p className="text-sm text-[#888780]">
              Add transactions for {selectedYear} to see your tax estimate.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Income card */}
          <div className="bg-white rounded-2xl border border-cream-border mb-4 overflow-hidden">
            <SectionLabel label="Income" />
            {isLoading ? (
              <SkeletonRows count={3} />
            ) : (
              <>
                <StandardRow
                  label="Gross income"
                  value={formatJMD(taxSummary?.grossIncomeCents ?? 0)}
                  tooltip={tooltips.grossIncome}
                />
                <StandardRow
                  label="Allowable expenses"
                  value={formatJMD(taxSummary?.allowableExpensesCents ?? 0)}
                  tooltip={tooltips.allowableExpenses}
                  deduction
                />
                <SubtotalRow
                  label="Statutory income"
                  value={formatJMD(taxSummary?.netProfitCents ?? 0)}
                />
              </>
            )}
          </div>

          {/* Tax calculation card */}
          <div className="bg-white rounded-2xl border border-cream-border mb-4 overflow-hidden">
            <SectionLabel label="Tax calculation" />
            {isLoading ? (
              <SkeletonRows count={3} />
            ) : (
              <>
                <StandardRow
                  label="Income tax threshold"
                  value={formatJMD(threshold)}
                  tooltip={tooltips.threshold}
                  deduction
                />
                <SubtotalRow
                  label="Chargeable income"
                  value={formatJMD(taxSummary?.taxableIncomeCents ?? 0)}
                />
                <StandardRow
                  label="Income tax @ 25%"
                  value={formatJMD(taxSummary?.breakdown.incomeTaxDueCents ?? 0)}
                />
              </>
            )}
          </div>

          {/* Statutory contributions card */}
          <div className="bg-white rounded-2xl border border-cream-border mb-4 overflow-hidden">
            <SectionLabel label="Statutory contributions" />
            {isLoading ? (
              <SkeletonRows count={4} />
            ) : (
              <>
                <StandardRow
                  label="NIS (est.)"
                  value={formatJMD(taxSummary?.breakdown.nisDueCents ?? 0)}
                  tooltip={tooltips.nis}
                />
                <StandardRow
                  label="NHT (est.)"
                  value={formatJMD(taxSummary?.breakdown.nhtDueCents ?? 0)}
                  tooltip={tooltips.nht}
                />
                <StandardRow
                  label="Education tax (est.)"
                  value={formatJMD(taxSummary?.breakdown.educationTaxDueCents ?? 0)}
                  tooltip={tooltips.educationTax}
                />
                <TotalRow
                  label="Total tax & contributions"
                  value={formatJMD(taxSummary?.breakdown.totalStatutoryLiabilityCents ?? 0)}
                />
              </>
            )}
          </div>
        </>
      )}

      {/* Estimates note */}
      <div className="bg-white rounded-2xl border border-cream-border px-5 py-4 flex items-start gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-info-50 flex items-center justify-center shrink-0">
          <i className="ti ti-info-circle text-info-600 text-base" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-medium text-[#2C2C2A] mb-1">These are estimates</p>
          <p className="text-xs text-[#888780] leading-relaxed">
            Figures are calculated based on transactions you've logged. NIS, NHT, and Education tax
            rates are confirmed for {selectedYear}. Verify your final figures directly with TAJ before filing.
          </p>
        </div>
      </div>

      {/* S04 upsell card */}
      {!isPremium && (
        <div className="bg-[#2C2C2A] rounded-2xl px-6 py-5 flex items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-brand-400 rounded-full px-2.5 py-1 mb-2">
              <i className="ti ti-star text-white text-xs" aria-hidden="true" />
              <span className="text-xs font-medium text-white">Pro</span>
            </div>
            <p className="text-base font-medium text-white mb-1">
              Get your S04 line-by-line breakdown
            </p>
            <p className="text-sm text-white/50">
              Copy each field directly to the TAJ portal. No accountant needed.
            </p>
          </div>
          <button
            onClick={() => navigate('/upgrade')}
            className="shrink-0 bg-brand-400 hover:bg-[#993C1D] text-white border-none rounded-[10px] px-5 py-2.5 text-sm font-medium font-['Inter'] cursor-pointer transition-colors whitespace-nowrap"
          >
            Upgrade to Pro
          </button>
        </div>
      )}
    </div>
  )
}
