import { describe, expect, it } from 'vitest';
import {
  buildEntityBuildersAuthRedirectUrl,
  detectEntityBuildersAppId,
  detectEntityBuildersAppIdOrFallback,
  getEntityBuildersApp,
  getEntityBuildersAppOrFallback,
  normalizeEntityBuildersAppId,
} from './index';

describe('Entity Builders app registry', () => {
  it('normalizes app ids and resolves known apps', () => {
    expect(normalizeEntityBuildersAppId(' Minimal Money ')).toBe(
      'minimal-money',
    );
    expect(normalizeEntityBuildersAppId('minimal_money')).toBe(
      'minimal-money',
    );
    expect(getEntityBuildersApp('PostalPeek')?.displayName).toBe('PostalPeek');
    expect(getEntityBuildersApp('missing')).toBeNull();
    expect(getEntityBuildersAppOrFallback('missing').appId).toBe(
      'entitybuilders',
    );
  });

  it('builds auth redirect URLs from registry paths', () => {
    expect(
      buildEntityBuildersAuthRedirectUrl('postalpeek', 'http://localhost:3002'),
    ).toBe('http://localhost:3002');
    expect(
      buildEntityBuildersAuthRedirectUrl('tablia', 'http://localhost:3002/'),
    ).toBe('http://localhost:3002/dashboard');
  });

  it('detects apps from production domains before stale metadata', () => {
    expect(
      detectEntityBuildersAppId({
        redirectTo: 'https://postalpeek.app/auth',
        appIdHint: 'tablia',
      }),
    ).toBe('postalpeek');
    expect(
      detectEntityBuildersAppId({
        redirectTo: 'https://tablia.io/dashboard',
        appIdHint: 'flowtranslate',
      }),
    ).toBe('tablia');
    expect(
      detectEntityBuildersAppId({
        redirectTo: 'https://zigzag.entitybuilders.ai',
        appIdHint: 'entitybuilders',
      }),
    ).toBe('zigzag');
  });

  it('uses metadata to disambiguate localhost before port fallback', () => {
    expect(
      detectEntityBuildersAppId({
        redirectTo: 'http://localhost:3002/feed',
        appIdHint: 'postalpeek',
      }),
    ).toBe('postalpeek');
    expect(
      detectEntityBuildersAppId({
        redirectTo: 'http://127.0.0.1:3001/auth',
        appIdHint: 'tablia',
      }),
    ).toBe('tablia');
  });

  it('uses local port fallbacks only when no valid app hint exists', () => {
    expect(
      detectEntityBuildersAppId({
        redirectTo: 'http://localhost:5173',
      }),
    ).toBe('flowtranslate');
    expect(
      detectEntityBuildersAppId({
        redirectTo: 'http://localhost:3002',
        appIdHint: 'missing',
      }),
    ).toBe('tablia');
    expect(
      detectEntityBuildersAppIdOrFallback({
        redirectTo: 'https://unknown.example',
      }),
    ).toBe('entitybuilders');
  });
});
