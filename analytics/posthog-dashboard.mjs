import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const DEFAULT_DATE_FROM = '-30d';

export function loadEnvFiles(paths, options = {}) {
  const root = options.root || process.cwd();

  for (const path of paths) {
    const resolvedPath = resolve(root, path);
    if (!existsSync(resolvedPath)) continue;

    for (const rawLine of readFileSync(resolvedPath, 'utf8').split('\n')) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#') || !line.includes('=')) continue;

      const [rawKey, ...valueParts] = line.split('=');
      const key = rawKey.trim();
      if (process.env[key] !== undefined) continue;

      let value = valueParts.join('=').trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
}

export function normalizeApiHost(value) {
  const host = (value || 'https://us.posthog.com').trim().replace(/\/$/, '');
  if (host === 'https://app.posthog.com') return 'https://us.posthog.com';
  return host
    .replace('://us.i.posthog.com', '://us.posthog.com')
    .replace('://eu.i.posthog.com', '://eu.posthog.com');
}

export function readDashboardConfig() {
  return {
    apiHost: normalizeApiHost(
      process.env.POSTHOG_API_HOST ||
        process.env.POSTHOG_HOST ||
        process.env.ENTITY_BUILDERS_CORE_POSTHOG_HOST,
    ),
    environmentId:
      process.env.POSTHOG_ENVIRONMENT_ID ||
      process.env.POSTHOG_PROJECT_ID ||
      process.env.ENTITY_BUILDERS_CORE_POSTHOG_PROJECT_ID,
    projectId:
      process.env.POSTHOG_PROJECT_ID ||
      process.env.POSTHOG_ENVIRONMENT_ID ||
      process.env.ENTITY_BUILDERS_CORE_POSTHOG_PROJECT_ID,
    personalApiKey: process.env.POSTHOG_PERSONAL_API_KEY,
    ingestKey:
      process.env.POSTHOG_PROJECT_API_KEY ||
      process.env.ENTITY_BUILDERS_CORE_POSTHOG_KEY ||
      process.env.VITE_POSTHOG_KEY ||
      process.env.PUBLIC_POSTHOG_KEY,
  };
}

export function propertyFilter(key, value, options = {}) {
  return {
    key,
    operator: options.operator || 'exact',
    type: options.type || 'event',
    value,
  };
}

export function appFilter(app) {
  return propertyFilter('app', app);
}

export function eventNode(event, customName, options = {}) {
  return {
    kind: 'EventsNode',
    event,
    name: event,
    custom_name: customName,
    math: options.math || 'total',
    properties: options.properties || undefined,
  };
}

export function uniqueUserEventNode(event, customName, options = {}) {
  return eventNode(event, customName, { ...options, math: 'dau' });
}

export function trendsQuery({
  app,
  series,
  breakdown,
  interval = 'day',
  dateFrom = DEFAULT_DATE_FROM,
  properties = [],
}) {
  return {
    kind: 'InsightVizNode',
    source: {
      kind: 'TrendsQuery',
      dateRange: { date_from: dateFrom },
      filterTestAccounts: true,
      interval,
      properties: [appFilter(app), ...properties],
      series,
      ...(breakdown
        ? {
            breakdownFilter: {
              breakdown,
              breakdown_type: 'event',
            },
          }
        : {}),
    },
  };
}

export function funnelQuery({
  app,
  series,
  dateFrom = DEFAULT_DATE_FROM,
  properties = [],
}) {
  return {
    kind: 'InsightVizNode',
    source: {
      kind: 'FunnelsQuery',
      dateRange: { date_from: dateFrom },
      filterTestAccounts: true,
      properties: [appFilter(app), ...properties],
      series,
    },
  };
}

function apiPath(config, scope, path) {
  const id = scope === 'projects' ? config.projectId : config.environmentId;
  return `/api/${scope}/${encodeURIComponent(id)}${path}`;
}

function parseJsonResponse(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function createClient(config) {
  return async function requestJson(path, options = {}) {
    const response = await fetch(`${config.apiHost}${path}`, {
      method: options.method || 'GET',
      headers: {
        Authorization: `Bearer ${config.personalApiKey}`,
        'Content-Type': 'application/json',
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const data = parseJsonResponse(await response.text());

    if (!response.ok) {
      const detail =
        data?.detail ||
        data?.error ||
        data?.message ||
        `${response.status} ${response.statusText}`;
      throw new Error(`${options.method || 'GET'} ${path} failed: ${detail}`);
    }

    return data;
  };
}

async function findByExactName(requestJson, path, name) {
  const separator = path.includes('?') ? '&' : '?';
  const data = await requestJson(
    `${path}${separator}search=${encodeURIComponent(name)}&limit=100`,
  );
  const results = Array.isArray(data) ? data : data?.results || [];
  return results.find((item) => item.name === name) || null;
}

async function upsertDashboard(config, requestJson, dashboard, tags) {
  const path = apiPath(config, 'projects', '/dashboards/');
  const existing = await findByExactName(requestJson, path, dashboard.name);
  const body = {
    ...dashboard,
    tags: dashboard.tags || tags,
  };

  if (!existing) {
    const created = await requestJson(path, {
      method: 'POST',
      body,
    });
    return { dashboard: created, created: true };
  }

  const updated = await requestJson(`${path}${existing.id}/`, {
    method: 'PATCH',
    body,
  });
  return { dashboard: updated, created: false };
}

async function createSectionTiles(
  config,
  requestJson,
  dashboardId,
  sectionTiles,
  options,
) {
  if (options.skipTextTiles || !options.shouldCreateTextTiles) return;

  for (const tile of sectionTiles) {
    try {
      await requestJson(
        apiPath(config, 'environments', `/dashboards/${dashboardId}/create_text_tile/`),
        {
          method: 'POST',
          body: tile,
        },
      );
    } catch (error) {
      console.warn(`Text tile skipped: ${error.message}`);
    }
  }
}

async function upsertInsight(config, requestJson, definition, dashboardId, order, tags) {
  const path = apiPath(config, 'environments', '/insights/');
  const existing = await findByExactName(requestJson, path, definition.name);
  const body = {
    name: definition.name,
    description: definition.description,
    query: definition.query,
    dashboards: [dashboardId],
    tags: definition.tags || tags,
    order,
  };

  if (!existing) {
    return requestJson(path, {
      method: 'POST',
      body,
    });
  }

  return requestJson(`${path}${existing.id}/`, {
    method: 'PATCH',
    body,
  });
}

export function printDashboardPlan({ dashboard, insights }, log = console) {
  log.log(`Dashboard: ${dashboard.name}`);
  log.log(`Insights: ${insights.length}`);
  for (const [index, insight] of insights.entries()) {
    log.log(`${String(index + 1).padStart(2, '0')}. ${insight.name}`);
  }
}

export function assertDashboardConfig(config) {
  if (!config.projectId || !config.environmentId) {
    throw new Error(
      'Missing POSTHOG_PROJECT_ID/POSTHOG_ENVIRONMENT_ID. ENTITY_BUILDERS_CORE_POSTHOG_PROJECT_ID can be used as fallback.',
    );
  }

  if (!config.personalApiKey) {
    const ingestHint = config.ingestKey
      ? ' A project ingest key is present, but private dashboard writes require a personal API key.'
      : '';
    throw new Error(
      `Missing POSTHOG_PERSONAL_API_KEY with dashboard:write and insight:write scopes.${ingestHint}`,
    );
  }
}

export async function runPostHogDashboardCli(options) {
  const args = new Set(options.args || process.argv.slice(2));
  const isDryRun = args.has('--dry-run');
  const skipTextTiles = args.has('--skip-text-tiles');
  const forceTextTiles = args.has('--force-text-tiles');
  const root = options.root || process.cwd();
  const tags = options.tags || options.dashboard.tags || [];
  const sectionTiles = options.sectionTiles || [];

  loadEnvFiles(
    [
      '.env',
      '.env.local',
      '.env.production',
      ...(options.envPaths || []),
    ],
    { root },
  );

  const config = readDashboardConfig();
  printDashboardPlan(options);

  if (isDryRun) {
    console.log('Dry run only. No PostHog requests were made.');
    return;
  }

  assertDashboardConfig(config);

  const requestJson = createClient(config);
  const { dashboard: savedDashboard, created: dashboardWasCreated } =
    await upsertDashboard(config, requestJson, options.dashboard, tags);
  console.log(`Dashboard ready: ${savedDashboard.name} (#${savedDashboard.id})`);

  await createSectionTiles(
    config,
    requestJson,
    savedDashboard.id,
    sectionTiles,
    {
      shouldCreateTextTiles: dashboardWasCreated || forceTextTiles,
      skipTextTiles,
    },
  );

  for (const [index, insight] of options.insights.entries()) {
    const saved = await upsertInsight(
      config,
      requestJson,
      insight,
      savedDashboard.id,
      index,
      tags,
    );
    console.log(`Insight ready: ${saved.name} (#${saved.id})`);
  }

  console.log(
    `Done: ${config.apiHost}/project/${config.projectId}/dashboard/${savedDashboard.id}`,
  );
}
