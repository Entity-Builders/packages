import type {
  UsageRecoveryPolicy,
  UsageRecoverySnapshot,
  UsageSnapshot,
  UsageState,
} from './types';

export const DEFAULT_USAGE_RECOVERY_COOLDOWNS_MINUTES = [
  5,
  30,
  120,
  1440,
];

export const DEFAULT_USAGE_RECOVERY_POLICY: UsageRecoveryPolicy = {
  cooldownMinutes: DEFAULT_USAGE_RECOVERY_COOLDOWNS_MINUTES,
};

export const getMonthlyResetAt = (now = new Date()) =>
  new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
  ).toISOString();

export const getMonthStartAt = (now = new Date()) =>
  new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();

export const getRemainingUsage = (monthlyQuota: number, usedThisMonth: number) =>
  Math.max(0, monthlyQuota - usedThisMonth);

export const getUsageState = (
  usage: Pick<UsageSnapshot, 'remainingThisMonth' | 'charged' | 'recovery'>,
): UsageState => {
  if (usage.charged) return 'charged';
  if (usage.recovery?.state === 'cooldown') return 'cooldown';
  if (usage.recovery?.state === 'monthly_cap') return 'exhausted';
  return usage.remainingThisMonth <= 0 ? 'exhausted' : 'available';
};

export const canSpendEstimatedTokens = (
  monthlyQuota: number,
  usedThisMonth: number,
  estimatedTokens: number,
) => usedThisMonth + estimatedTokens <= monthlyQuota;

const isPositiveSafeInteger = (value: number) =>
  Number.isSafeInteger(value) && value > 0;

export const parseUsageRecoveryCooldowns = (
  value?: string | null,
  fallback: number[] = DEFAULT_USAGE_RECOVERY_COOLDOWNS_MINUTES,
) => {
  const normalized = value?.trim();
  if (!normalized) return [...fallback];

  const parsed = normalized
    .split(',')
    .map((part) => Number(part.trim()))
    .filter(isPositiveSafeInteger);

  return parsed.length > 0 ? parsed : [...fallback];
};

export const createUsageRecoveryPolicy = (
  cooldownsValue?: string | null,
): UsageRecoveryPolicy => ({
  cooldownMinutes: parseUsageRecoveryCooldowns(cooldownsValue),
});

export const clampUsageRecoveryStage = (
  stage: number | null | undefined,
  policy: UsageRecoveryPolicy = DEFAULT_USAGE_RECOVERY_POLICY,
) => {
  if (!Number.isSafeInteger(stage) || (stage as number) < 0) return 0;
  if (policy.cooldownMinutes.length === 0) return 0;

  return Math.min(stage as number, policy.cooldownMinutes.length - 1);
};

export const getUsageRecoveryCooldownMinutes = (
  stage: number | null | undefined,
  policy: UsageRecoveryPolicy = DEFAULT_USAGE_RECOVERY_POLICY,
) => policy.cooldownMinutes[clampUsageRecoveryStage(stage, policy)] || 0;

export const getUsageRecoveryCooldownUntil = ({
  now = new Date(),
  stage = 0,
  policy = DEFAULT_USAGE_RECOVERY_POLICY,
}: {
  now?: Date;
  stage?: number;
  policy?: UsageRecoveryPolicy;
}) =>
  new Date(
    now.getTime() + getUsageRecoveryCooldownMinutes(stage, policy) * 60_000,
  ).toISOString();

export const getUsageRecoveryCooldownBucket = (
  cooldownUntil?: string | null,
  now = new Date(),
) => {
  if (!cooldownUntil) return 'none';

  const until = new Date(cooldownUntil).getTime();
  const remainingMs = until - now.getTime();
  if (!Number.isFinite(remainingMs) || remainingMs <= 0) return 'elapsed';

  const remainingMinutes = Math.ceil(remainingMs / 60_000);
  if (remainingMinutes <= 5) return 'lte_5m';
  if (remainingMinutes <= 30) return 'lte_30m';
  if (remainingMinutes <= 120) return 'lte_2h';
  if (remainingMinutes <= 1440) return 'lte_24h';
  return 'gt_24h';
};

export const buildAvailableUsageRecovery = (
  topUpAvailable = false,
): UsageRecoverySnapshot => ({
  state: 'available',
  topUpAvailable,
});

export const buildCooldownUsageRecovery = ({
  stage,
  cooldownUntil,
  topUpAvailable = false,
}: {
  stage: number;
  cooldownUntil: string;
  topUpAvailable?: boolean;
}): UsageRecoverySnapshot => ({
  state: 'cooldown',
  stage,
  cooldownUntil,
  topUpAvailable,
});

export const buildMonthlyCapUsageRecovery = ({
  monthlyCapReachedAt,
  topUpAvailable = false,
}: {
  monthlyCapReachedAt?: string;
  topUpAvailable?: boolean;
} = {}): UsageRecoverySnapshot => ({
  state: 'monthly_cap',
  monthlyCapReachedAt,
  topUpAvailable,
});
