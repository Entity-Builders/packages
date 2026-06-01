import type { UsageSnapshot, UsageState } from './types';

export const getMonthlyResetAt = (now = new Date()) =>
  new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
  ).toISOString();

export const getMonthStartAt = (now = new Date()) =>
  new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();

export const getRemainingUsage = (monthlyQuota: number, usedThisMonth: number) =>
  Math.max(0, monthlyQuota - usedThisMonth);

export const getUsageState = (
  usage: Pick<UsageSnapshot, 'remainingThisMonth' | 'charged'>,
): UsageState => {
  if (usage.charged) return 'charged';
  return usage.remainingThisMonth <= 0 ? 'exhausted' : 'available';
};

export const canSpendEstimatedTokens = (
  monthlyQuota: number,
  usedThisMonth: number,
  estimatedTokens: number,
) => usedThisMonth + estimatedTokens <= monthlyQuota;
