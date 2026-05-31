import { LIFE_AREAS } from './seeds';
import type {
  ActivationEnergy,
  ActivationHistoryEntry,
  CompasTask,
  LifeArea,
  ScoredTask,
  SuggestionOptions,
  SuggestionResult,
} from './types';

const ENERGY_RANK: Record<ActivationEnergy, number> = {
  low: 0,
  medium: 1,
  high: 2,
};

const DEFAULT_LIMIT = 4;
const DEFAULT_INACTIVITY_THRESHOLD_MINUTES = 180;

export class Suggester {
  suggest(
    tasks: CompasTask[],
    history: ActivationHistoryEntry[] = [],
    options: SuggestionOptions = {},
  ): SuggestionResult {
    const now = options.now ?? new Date();
    const limit = options.limit ?? DEFAULT_LIMIT;
    const random = options.random ?? Math.random;
    const inactivityThresholdMinutes =
      options.inactivityThresholdMinutes ?? DEFAULT_INACTIVITY_THRESHOLD_MINUTES;

    const sortedHistory = sortHistory(history);
    const resetToLow = shouldResetToLow(sortedHistory);
    const maxEnergy = resetToLow
      ? 'low'
      : getMaxEnergy(sortedHistory, now, inactivityThresholdMinutes);
    const balance = getRecentCompletionBalance(sortedHistory);

    const allowedTasks = tasks.filter(
      (task) => ENERGY_RANK[task.activationEnergy] <= ENERGY_RANK[maxEnergy],
    );

    const scored = allowedTasks
      .map((task) => scoreTask(task, sortedHistory, balance, random))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return {
      suggestions: scored.map(({ task }) => task),
      scored,
      maxEnergy,
      resetToLow,
      balance,
    };
  }
}

export function shouldResetToLow(history: ActivationHistoryEntry[]): boolean {
  const latestAction = sortHistory(history).find((entry) =>
    ['completed', 'skipped', 'abandoned'].includes(entry.status),
  );

  return Boolean(
    latestAction &&
      ['skipped', 'abandoned'].includes(latestAction.status) &&
      latestAction.activationEnergy !== 'low',
  );
}

export function isInertiaBroken(
  entry: ActivationHistoryEntry,
  previousHistory: ActivationHistoryEntry[],
  inactivityThresholdMinutes = DEFAULT_INACTIVITY_THRESHOLD_MINUTES,
): boolean {
  if (entry.status !== 'completed') return false;
  if (!['low', 'medium'].includes(entry.activationEnergy)) return false;

  const startAt = toDate(entry.startedAt ?? entry.startAt);
  const previousCompleted = sortHistory(previousHistory).find(
    (previous) =>
      previous.status === 'completed' &&
      toDate(previous.completedAt ?? previous.startAt).getTime() <
        startAt.getTime(),
  );

  if (!previousCompleted) return true;

  const previousTime = toDate(
    previousCompleted.completedAt ?? previousCompleted.startAt,
  );
  return minutesBetween(previousTime, startAt) >= inactivityThresholdMinutes;
}

function getMaxEnergy(
  history: ActivationHistoryEntry[],
  now: Date,
  inactivityThresholdMinutes: number,
): ActivationEnergy {
  const completedToday = history.some(
    (entry) =>
      entry.status === 'completed' &&
      isSameLocalDay(toDate(entry.completedAt ?? entry.startAt), now),
  );

  const latestCompleted = history.find((entry) => entry.status === 'completed');

  if (!completedToday || !latestCompleted) {
    return 'low';
  }

  const latestCompletedAt = toDate(
    latestCompleted.completedAt ?? latestCompleted.startAt,
  );

  if (minutesBetween(latestCompletedAt, now) > inactivityThresholdMinutes) {
    return 'low';
  }

  if (latestCompleted.activationEnergy === 'low') {
    return 'medium';
  }

  return 'high';
}

function scoreTask(
  task: CompasTask,
  history: ActivationHistoryEntry[],
  balance: Partial<Record<LifeArea, number>>,
  random: () => number,
): ScoredTask {
  const reasons: string[] = [];
  let score = 100 - ENERGY_RANK[task.activationEnergy] * 8;

  if (task.psychologicalReward === 'immediate') {
    score += 8;
    reasons.push('immediate-reward');
  }

  const balanceScore = balance[task.lifeArea];
  if (typeof balanceScore === 'number') {
    if (balanceScore > 0.5) {
      score -= 60;
      reasons.push('downrank-overrepresented-life-area');
    } else if (balanceScore === 0) {
      score += 30;
      reasons.push('boost-unrepresented-life-area');
    } else if (balanceScore < 0.2) {
      score += 18;
      reasons.push('boost-underrepresented-life-area');
    }
  }

  const recentSameTaskIndex = history
    .slice(0, 5)
    .findIndex((entry) => entry.taskName === task.name || entry.taskId === task.id);

  if (recentSameTaskIndex >= 0) {
    score -= 35 - recentSameTaskIndex * 5;
    reasons.push('avoid-recent-repeat');
  }

  score += (task.sortOrder ? Math.max(0, 20 - task.sortOrder / 10) : 0);
  score += random();

  return { task, score, reasons };
}

function getRecentCompletionBalance(
  history: ActivationHistoryEntry[],
): Partial<Record<LifeArea, number>> {
  const recentCompleted = history
    .filter((entry) => entry.status === 'completed')
    .slice(0, 10);

  if (recentCompleted.length < 5) return {};

  const counts = new Map<LifeArea, number>();
  for (const area of LIFE_AREAS) counts.set(area, 0);
  for (const entry of recentCompleted) {
    counts.set(entry.lifeArea, (counts.get(entry.lifeArea) ?? 0) + 1);
  }

  return Object.fromEntries(
    LIFE_AREAS.map((area) => [area, (counts.get(area) ?? 0) / recentCompleted.length]),
  ) as Partial<Record<LifeArea, number>>;
}

function sortHistory(
  history: ActivationHistoryEntry[],
): ActivationHistoryEntry[] {
  return [...history].sort(
    (a, b) => getHistoryTime(b).getTime() - getHistoryTime(a).getTime(),
  );
}

function getHistoryTime(entry: ActivationHistoryEntry): Date {
  return toDate(entry.completedAt ?? entry.startedAt ?? entry.startAt);
}

function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

function minutesBetween(start: Date, end: Date): number {
  return (end.getTime() - start.getTime()) / 60000;
}

function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
