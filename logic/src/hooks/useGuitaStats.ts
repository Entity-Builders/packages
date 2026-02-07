import { useState, useMemo } from 'react';
import {
  calculateHourlyProjection,
  checkRecategorizationRisk,
  CAT_F_CAP,
  CURRENT_BASE_BILLING,
  FIXED_TAX_DEDUCTION,
} from '../finance-engine';

export interface GuitaStats {
  hourlyRate: number;
  setHourlyRate: (rate: number) => void;
  dailyHours: number;
  setDailyHours: (hours: number) => void;
  businessDays: number; // defaulted to 20 usually, but adjustable
  projectedGross: number;
  projectedNet: number;
  liquidity: number; // Net - Expenses (simplified)
  recategorizationRisk: number;
  remainingToCap: number;
  isDanger: boolean;
}

export const useGuitaStats = (initialRate: number = 10000): GuitaStats => {
  const [hourlyRate, setHourlyRate] = useState(initialRate);
  const [dailyHours, setDailyHours] = useState(8);
  const [businessDays] = useState(20); // Fixed for POC

  // Expenses could be a state list, for now hardcoded sum for "La Posta"
  const [committedExpenses] = useState(500000); // Dummy fixed expenses

  const projection = useMemo(() => {
    return calculateHourlyProjection({
      hourlyRate,
      dailyHours,
      businessDays,
    });
  }, [hourlyRate, dailyHours, businessDays]);

  const riskAnalysis = useMemo(() => {
    // We assume the projection is what we add to the annual base (simplification for POC)
    // In reality, we'd add the Month-to-Date actuals + projection for rest of month.
    // Here we treat "projectedGross" as the monthly billing contribution.
    return checkRecategorizationRisk(projection.projectedMonthlyGross);
  }, [projection.projectedMonthlyGross]);

  const liquidity = projection.projectedMonthlyNet - committedExpenses;

  return {
    hourlyRate,
    setHourlyRate,
    dailyHours,
    setDailyHours,
    businessDays,
    projectedGross: projection.projectedMonthlyGross,
    projectedNet: projection.projectedMonthlyNet,
    liquidity,
    recategorizationRisk: riskAnalysis.riskPercentage,
    remainingToCap: riskAnalysis.remainingToCap,
    isDanger: riskAnalysis.isDanger,
  };
};
