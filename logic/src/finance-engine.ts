export const CAT_F_CAP = 38642048.36;
export const CURRENT_BASE_BILLING = 31232768.0; // Hardcoded L12M base
export const FIXED_TAX_DEDUCTION = 225650.32; // Monthly tax deduction

export interface ProjectionInput {
  hourlyRate: number; // In ARS
  dailyHours: number;
  businessDays: number;
}

export interface ProjectionResult {
  projectedMonthlyGross: number;
  projectedMonthlyNet: number; // After tax deduction
}

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  currency: 'ARS' | 'USD';
  isBanked: boolean; // bancarizado
}

export interface ExpenseSummary {
  totalBanked: number;
  totalUnbanked: number;
  total: number;
}

export const calculateHourlyProjection = (
  input: ProjectionInput,
): ProjectionResult => {
  const { hourlyRate, dailyHours, businessDays } = input;
  const projectedMonthlyGross = hourlyRate * dailyHours * businessDays;
  const projectedMonthlyNet = projectedMonthlyGross - FIXED_TAX_DEDUCTION;

  return {
    projectedMonthlyGross,
    projectedMonthlyNet,
  };
};

export const checkRecategorizationRisk = (
  projectedAdditionalBilling: number,
): {
  riskPercentage: number;
  remainingToCap: number;
  isDanger: boolean;
} => {
  const projectedAnnualTotal =
    CURRENT_BASE_BILLING + projectedAdditionalBilling;
  const remainingToCap = CAT_F_CAP - projectedAnnualTotal;

  // Calculate percentage of the cap used
  const usedPercentage = (projectedAnnualTotal / CAT_F_CAP) * 100;

  return {
    riskPercentage: usedPercentage,
    remainingToCap,
    isDanger: remainingToCap < 0,
  };
};

export const convertArsToUsd = (
  amountArs: number,
  dolarMepRate: number,
): number => {
  if (!dolarMepRate || dolarMepRate === 0) return 0;
  return amountArs / dolarMepRate;
};
