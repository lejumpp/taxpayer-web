import { useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useSubscription } from '@/context/SubscriptionContext'
import { useS04 } from '@/hooks/useS04'
import PageHeader from '@/components/layout/PageHeader'
import S04Field from '@/components/s04/S04Field'

function S04Section({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-cream-border overflow-hidden mb-4">
      <div className="px-6 py-4 border-b border-gray-50">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function SkeletonRows({ count }: { count: number }) {
  return (
    <div className="px-6 py-3.5 space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex justify-between">
          <div className="h-4 w-40 bg-gray-50 rounded animate-pulse" />
          <div className="h-4 w-24 bg-gray-50 rounded animate-pulse" />
        </div>
      ))}
    </div>
  )
}

export default function S04Page() {
  const { isPremium, isLoading: subLoading } = useSubscription()
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const availableYears = [currentYear - 2, currentYear - 1, currentYear]

  const { data, isLoading } = useS04(selectedYear)

  if (subLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-brand-400" aria-hidden="true" />
      </div>
    )
  }

  if (!isPremium) return <Navigate to="/upgrade" replace />

  const isEmpty =
    !isLoading &&
    data &&
    data.sectionB.line1GrossReceiptsSalesIncome === 0 &&
    data.sectionB.line50TotalIncomeAllSources === 0

  const yearSelector = (
    <div className="flex items-center gap-px bg-white border border-cream-border rounded-[10px] overflow-hidden">
      {availableYears.map(year => (
        <button
          key={year}
          onClick={() => setSelectedYear(year)}
          className={`px-3.5 py-1.5 text-sm border-none cursor-pointer transition-colors ${
            selectedYear === year
              ? 'bg-brand-400 text-white font-medium'
              : 'bg-transparent text-gray-600 hover:bg-gray-25'
          }`}
        >
          {year}
        </button>
      ))}
    </div>
  )

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <PageHeader
        title={`S04 Annual Return — ${selectedYear}`}
        subtitle="Estimated figures for your TAJ S04 filing."
        action={yearSelector}
      />

      <div className="flex items-center gap-2 mb-5">
        <span className="inline-flex items-center gap-1 bg-brand-50 border border-brand-100 rounded-full px-2.5 py-0.5 text-xs font-medium text-brand-600">
          <i className="ti ti-calculator text-xs" aria-hidden="true" />
          Estimate
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
          <i className="ti ti-copy text-xs" aria-hidden="true" />
          Use the copy buttons to paste figures into the TAJ portal
        </span>
      </div>

      {isEmpty ? (
        <div className="bg-white rounded-2xl border border-cream-border">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <i className="ti ti-file-invoice text-4xl text-gray-100 mb-4" aria-hidden="true" />
            <p className="text-base font-medium text-gray-900 mb-1">No data for {selectedYear}</p>
            <p className="text-sm text-gray-400">
              Add transactions for {selectedYear} to generate your S04 breakdown.
            </p>
          </div>
        </div>
      ) : (
        <>
          <S04Section title="Section A — General information">
            {isLoading || !data ? (
              <SkeletonRows count={6} />
            ) : (
              <>
                <S04Field label="Last name" valueText={data.sectionA.lastName} editable={!data.sectionA.lastName} />
                <S04Field label="First name" valueText={data.sectionA.firstName} editable={!data.sectionA.firstName} />
                <S04Field
                  label="TRN"
                  valueText={data.sectionA.trn}
                  editable={!data.sectionA.trn}
                  hint="Taxpayer Registration Number"
                />
                <S04Field
                  label="NIS number"
                  valueText={data.sectionA.nisNumber}
                  editable={!data.sectionA.nisNumber}
                  hint="Enter your NIS number"
                />
                <S04Field label="Trade name" valueText={data.sectionA.tradeName} editable={!data.sectionA.tradeName} />
                <S04Field label="Accounting period begins" valueText={data.sectionA.accountingPeriodBegins} />
                <S04Field label="Accounting period ends" valueText={data.sectionA.accountingPeriodEnds} />
                <S04Field label="Year of assessment" valueText={String(data.sectionA.yearOfAssessment)} />
                <S04Field label="Financial accounts prepared" valueText={data.sectionA.financialAccountsPrepared} />
                <S04Field
                  label="Home address"
                  valueText={data.sectionA.homeAddress}
                  editable={!data.sectionA.homeAddress}
                  hint="Enter your home address"
                />
                <S04Field
                  label="Occupation"
                  valueText={data.sectionA.occupation}
                  editable={!data.sectionA.occupation}
                  hint="Enter your occupation"
                />
              </>
            )}
          </S04Section>

          <S04Section
            title="Section B — Summary of income"
            subtitle="Income from trade, business, profession and vocation"
          >
            {isLoading || !data ? (
              <SkeletonRows count={5} />
            ) : (
              <>
                <S04Field
                  lineNumber="1"
                  label="Gross receipts / sales / income"
                  valueCents={data.sectionB.line1GrossReceiptsSalesIncome}
                />
                <S04Field lineNumber="2" label="Cost of goods sold" valueCents={data.sectionB.line2CostOfGoodsSold} />
                <S04Field
                  lineNumber="3"
                  label="Gross operating profit"
                  valueCents={data.sectionB.line3GrossOperatingProfit}
                  isSubtotal
                />
                <S04Field
                  lineNumber="4"
                  label="Business / administrative expenses"
                  valueCents={data.sectionB.line4BusinessAdminExpenses}
                />
                <S04Field lineNumber="6" label="Total expenses" valueCents={data.sectionB.line6TotalExpenses} isSubtotal />
                <S04Field
                  lineNumber="7"
                  label="Net profit / (loss) from trade, business, profession and vocation"
                  valueCents={data.sectionB.line7NetProfit}
                  isSubtotal
                />
                <S04Field
                  lineNumber="50"
                  label="Total income from all sources"
                  valueCents={data.sectionB.line50TotalIncomeAllSources}
                  isTotal
                />
              </>
            )}
          </S04Section>

          <S04Section title="Section D — Deductions and statutory income">
            {isLoading || !data ? (
              <SkeletonRows count={4} />
            ) : (
              <>
                <S04Field
                  lineNumber="1"
                  label="Total capital allowances"
                  valueCents={data.sectionD.line1TotalCapitalAllowance}
                />
                <S04Field
                  lineNumber="3"
                  label="NIS paid on income from self-employment"
                  valueCents={data.sectionD.line3NISPaidSelfEmployment}
                  hint="6% of net profit, capped at NIS wage limit"
                />
                <S04Field lineNumber="7" label="Total deductions" valueCents={data.sectionD.line7TotalDeductions} isSubtotal />
                <S04Field
                  lineNumber="8"
                  label="Chargeable (taxable) income"
                  valueCents={data.sectionD.line8ChargeableIncome}
                  isTotal
                />
              </>
            )}
          </S04Section>

          <S04Section title="Section I — Summary of taxes and contributions payable">
            {isLoading || !data ? (
              <SkeletonRows count={5} />
            ) : (
              <>
                <S04Field
                  lineNumber="1a"
                  label="Income tax payable"
                  valueCents={data.sectionI.line1IncomeTaxPayable}
                  hint="25% on taxable income above the exemption threshold"
                />
                <S04Field
                  lineNumber="2"
                  label="NHT payable"
                  valueCents={data.sectionI.line2NHTPayable}
                  hint="National Housing Trust — 3%"
                />
                <S04Field
                  lineNumber="3a"
                  label="NIS payable"
                  valueCents={data.sectionI.line3aNISPayable}
                  hint="National Insurance Scheme — 6%, capped"
                />
                <S04Field
                  lineNumber="4"
                  label="Education tax payable"
                  valueCents={data.sectionI.line4EducationTaxPayable}
                  hint="Education Tax — 2.25%"
                />
                <S04Field
                  label="Total tax and contributions"
                  valueCents={data.sectionI.totalTaxAndContributions}
                  isTotal
                />
              </>
            )}
          </S04Section>

          <S04Section title="Schedule A — NHT computation" subtitle="National Housing Trust contribution">
            {isLoading || !data ? (
              <SkeletonRows count={4} />
            ) : (
              <>
                <S04Field
                  lineNumber="1"
                  label="Total income from all sources"
                  valueCents={data.scheduleA.sectionB.line1TotalIncomeAllSources}
                />
                <S04Field
                  lineNumber="6"
                  label="Total income excluding employment"
                  valueCents={data.scheduleA.sectionB.line6TotalIncomeExcludingEmployment}
                />
                <S04Field
                  lineNumber="9"
                  label="NIS paid on self-employment income"
                  valueCents={data.scheduleA.sectionB.line9NISPaidSelfEmployment}
                />
                <S04Field
                  lineNumber="15"
                  label="Total deductions"
                  valueCents={data.scheduleA.sectionB.line15TotalDeductions}
                />
                <S04Field
                  lineNumber="16"
                  label="Statutory income (self-employment, NHT)"
                  valueCents={data.scheduleA.sectionB.line16StatutoryIncomeSelfEmploymentNHT}
                  isSubtotal
                />
                <S04Field
                  lineNumber="C1"
                  label="Statutory income for self-employment"
                  valueCents={data.scheduleA.sectionC.line1StatutoryIncomeSelfEmployment}
                />
                <S04Field lineNumber="C2" label="NHT payable" valueCents={data.scheduleA.sectionC.line2NHTPayable} />
                <S04Field
                  lineNumber="C9"
                  label="Total NHT payable"
                  valueCents={data.scheduleA.sectionC.line9TotalNHTPayable}
                  isSubtotal
                />
                <S04Field
                  lineNumber="C10"
                  label="NHT deducted by employer"
                  valueCents={data.scheduleA.sectionC.line10NHTDeductedByEmployer}
                />
                <S04Field
                  lineNumber="C11"
                  label="Net NHT payable / (refundable)"
                  valueCents={data.scheduleA.sectionC.line11NetNHTPayableRefundable}
                  isTotal
                />
              </>
            )}
          </S04Section>

          <S04Section title="Schedule B — NIS computation" subtitle="National Insurance Scheme contribution">
            {isLoading || !data ? (
              <SkeletonRows count={4} />
            ) : (
              <>
                <S04Field
                  lineNumber="1"
                  label="Total income from all sources"
                  valueCents={data.scheduleB.sectionB.line1TotalIncomeAllSources}
                />
                <S04Field
                  lineNumber="6"
                  label="Total income excluding employment"
                  valueCents={data.scheduleB.sectionB.line6TotalIncomeExcludingEmployment}
                />
                <S04Field
                  lineNumber="22"
                  label="Earnings from self-employment subject to NIS"
                  valueCents={data.scheduleB.sectionB.line22EarningsSelfEmploymentSubjectToNIS}
                  isSubtotal
                />
                <S04Field
                  lineNumber="C5"
                  label="Statutory income for self-employment"
                  valueCents={data.scheduleB.sectionC.line5StatutoryIncomeSelfEmployment}
                />
                <S04Field lineNumber="C6" label="NIS payable" valueCents={data.scheduleB.sectionC.line6NISPayable} />
                <S04Field
                  lineNumber="C7"
                  label="Total NIS payable"
                  valueCents={data.scheduleB.sectionC.line7TotalNISPayable}
                  isSubtotal
                />
                <S04Field
                  lineNumber="C10"
                  label="Net NIS payable / (refundable)"
                  valueCents={data.scheduleB.sectionC.line10NetNISPayableRefundable}
                  isTotal
                />
              </>
            )}
          </S04Section>
        </>
      )}

      <div className="bg-white rounded-2xl border border-cream-border px-5 py-4 flex items-start gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-info-50 flex items-center justify-center shrink-0">
          <i className="ti ti-info-circle text-info-600 text-base" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 mb-1">Filing at TAJ</p>
          <p className="text-xs text-gray-400 leading-relaxed">
            Use these figures to complete your S04 return at{' '}
            <a
              href="https://www.jamaicatax.gov.jm"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-400 underline"
            >
              jamaicatax.gov.jm
            </a>
            . Fields marked with a copy button can be pasted directly into the TAJ portal. Verify all
            figures before submitting — these are estimates based on your logged transactions.
          </p>
        </div>
      </div>
    </div>
  )
}
