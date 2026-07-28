export interface S04SectionA {
  lastName: string | null
  firstName: string | null
  middleName: string | null
  nisNumber: string | null
  trn: string | null
  homeAddress: string | null
  businessAddress: string | null
  telephone: string | null
  email: string | null
  residencyStatus: string | null
  dateBusinessRegistered: string | null
  tradeName: string | null
  startDateOfTrade: string | null
  occupation: string | null
  accountingPeriodBegins: string | null
  accountingPeriodEnds: string | null
  yearOfAssessment: number
  isFirstTimeFiling: boolean | null
  isGainfullyOccupied: boolean | null
  isGainfullyEmployed: boolean | null
  financialAccountsPrepared: string | null
}

export interface S04SectionB {
  line1GrossReceiptsSalesIncome: number
  line2CostOfGoodsSold: number
  line3GrossOperatingProfit: number
  line4BusinessAdminExpenses: number
  line5NetAdjustments: number
  line6TotalExpenses: number
  line7NetProfit: number
  line8ShareOfPartnershipIncome: number
  line9GrossRentalIncome: number
  line10RentalExpenses: number
  line11NetRentalIncome: number
  line12SalaryWagesBonusFees: number
  line13CashAllowances: number
  line14AnnualValuePerquisites: number
  line15AnnualValueQuarters: number
  line16IncomeOtherEmployment: number
  line17TotalIncomeEmploymentOffices: number
  line18ExpensesClaimed: number
  line19NISDeductedByEmployer: number
  line22SuperannuationEsop: number
  line23TotalDeductions: number
  line24NetTaxableIncomeEmployment: number
  line25DomesticEmploymentIncome: number
  line26EmbassyEmploymentIncome: number
  line50TotalIncomeAllSources: number
}

export interface S04SectionD {
  line1TotalCapitalAllowance: number
  line2CovenanedDonations: number
  line3NISPaidSelfEmployment: number
  line4AllowableLoss: number
  line5RetirementContributions: number
  line6OtherDonations: number
  line7TotalDeductions: number
  line8ChargeableIncome: number
}

export interface S04SectionI {
  line1IncomeTaxPayable: number
  line2NHTPayable: number
  line3aNISPayable: number
  line4EducationTaxPayable: number
  totalTaxAndContributions: number
}

export interface S04ScheduleASectionB {
  line1TotalIncomeAllSources: number
  line6TotalIncomeExcludingEmployment: number
  line9NISPaidSelfEmployment: number
  line15TotalDeductions: number
  line16StatutoryIncomeSelfEmploymentNHT: number
}

export interface S04ScheduleASectionC {
  line1StatutoryIncomeSelfEmployment: number
  nhtRate: number
  line2NHTPayable: number
  line9TotalNHTPayable: number
  line10NHTDeductedByEmployer: number
  line11NetNHTPayableRefundable: number
}

export interface S04ScheduleBSectionB {
  line1TotalIncomeAllSources: number
  line6TotalIncomeExcludingEmployment: number
  line22EarningsSelfEmploymentSubjectToNIS: number
}

export interface S04ScheduleBSectionC {
  line5StatutoryIncomeSelfEmployment: number
  nisRate: number
  line6NISPayable: number
  line7TotalNISPayable: number
  line10NetNISPayableRefundable: number
}

export interface S04Response {
  year: number
  generatedAt: string
  sectionA: S04SectionA
  sectionB: S04SectionB
  sectionD: S04SectionD
  sectionI: S04SectionI
  scheduleA: {
    nisNumber: string | null
    trn: string | null
    lastName: string | null
    firstName: string | null
    address: string | null
    sectionB: S04ScheduleASectionB
    sectionC: S04ScheduleASectionC
  }
  scheduleB: {
    nisNumber: string | null
    trn: string | null
    lastName: string | null
    firstName: string | null
    sectionB: S04ScheduleBSectionB
    sectionC: S04ScheduleBSectionC
  }
}
