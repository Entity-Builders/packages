export type EntityCheckoutReturnState =
  | 'success'
  | 'pending'
  | 'cancelled'
  | 'failed'
  | 'unknown';

export type EntityCheckoutReturnInfo = {
  state: EntityCheckoutReturnState;
  rawStatus: string | null;
  hasExternalReference: boolean;
  hasProviderReference: boolean;
};

type LocationLike = {
  pathname: string;
  search?: string;
  hash?: string;
  origin?: string;
};

type ReadEntityCheckoutReturnOptions = {
  returnPath: string;
  fallbackOrigin?: string;
};

const STATUS_PARAM_KEYS = [
  'status',
  'collection_status',
  'payment_status',
  'preapproval_status',
  'checkout_status',
  'status_detail',
];

const PROVIDER_REFERENCE_KEYS = [
  'payment_id',
  'collection_id',
  'merchant_order_id',
  'preapproval_id',
  'preference_id',
];

const SUCCESS_STATUSES = new Set([
  'approved',
  'accredited',
  'success',
  'authorized',
  'active',
]);

const PENDING_STATUSES = new Set([
  'pending',
  'in_process',
  'processing',
  'scheduled',
  'waiting_for_gateway',
  'waiting for gateway',
]);

const FAILED_STATUSES = new Set([
  'rejected',
  'failed',
  'failure',
  'error',
]);

const CANCELLED_STATUSES = new Set([
  'cancelled',
  'canceled',
  'cancel',
  'user_cancelled',
  'user_canceled',
]);

const normalizePathname = (pathname: string) => {
  const withoutTrailingSlash = pathname.replace(/\/+$/, '');
  return withoutTrailingSlash || '/';
};

const normalizeStatus = (value: string | null) =>
  value?.trim().toLowerCase().replace(/\s+/g, '_') || null;

const toUrl = (
  input: string | URL | LocationLike,
  fallbackOrigin: string,
) => {
  if (typeof input === 'string') return new URL(input, fallbackOrigin);
  if (input instanceof URL) return input;

  return new URL(
    `${input.pathname}${input.search || ''}${input.hash || ''}`,
    input.origin || fallbackOrigin,
  );
};

const appendHashParams = (target: URLSearchParams, hash: string) => {
  const cleanHash = hash.replace(/^#/, '');
  if (!cleanHash) return;

  const queryLike = cleanHash.includes('?')
    ? cleanHash.slice(cleanHash.indexOf('?') + 1)
    : cleanHash;
  const hashParams = new URLSearchParams(queryLike);
  hashParams.forEach((value, key) => target.append(key, value));
};

const firstParam = (params: URLSearchParams, keys: string[]) => {
  for (const key of keys) {
    const value = params.get(key);
    if (value?.trim()) return value.trim();
  }
  return null;
};

const hasAnyParam = (params: URLSearchParams, keys: string[]) =>
  keys.some((key) => Boolean(params.get(key)?.trim()));

const mapStatusToState = (
  status: string | null,
): EntityCheckoutReturnState => {
  if (!status) return 'unknown';
  if (SUCCESS_STATUSES.has(status)) return 'success';
  if (PENDING_STATUSES.has(status)) return 'pending';
  if (FAILED_STATUSES.has(status)) return 'failed';
  if (CANCELLED_STATUSES.has(status)) return 'cancelled';
  return 'unknown';
};

export const readEntityCheckoutReturnFromUrl = (
  input: string | URL | LocationLike,
  options: ReadEntityCheckoutReturnOptions,
): EntityCheckoutReturnInfo | null => {
  const returnPath = normalizePathname(options.returnPath);
  const fallbackOrigin = options.fallbackOrigin || 'https://entitybuilders.ai';
  const url = toUrl(input, fallbackOrigin);
  if (normalizePathname(url.pathname) !== returnPath) return null;

  const params = new URLSearchParams(url.search);
  appendHashParams(params, url.hash);

  const rawStatus = firstParam(params, STATUS_PARAM_KEYS);
  const normalizedStatus = normalizeStatus(rawStatus);

  return {
    state: mapStatusToState(normalizedStatus),
    rawStatus: normalizedStatus,
    hasExternalReference: Boolean(params.get('external_reference')?.trim()),
    hasProviderReference: hasAnyParam(params, PROVIDER_REFERENCE_KEYS),
  };
};
