import { describe, expect, it } from 'vitest';
import {
  buildEntityBuildersAuthRedirectUrl,
  buildEntityBuildersWhatsappUrl,
  detectEntityBuildersAppId,
  detectEntityBuildersAppIdOrFallback,
  getEntityBuildersApp,
  getEntityBuildersAppOrFallback,
  getEntityBuildersAppWhatsappOrFallback,
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
    expect(getEntityBuildersApp('baraja')?.urls.canonical).toBe(
      'https://baraja.cards',
    );
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
    expect(getEntityBuildersApp('entitybuilders')?.urls.canonical).toBe(
      'https://entitybuilders.ai',
    );
    expect(
      detectEntityBuildersAppId({
        redirectTo: 'https://entitybuilders.ai',
        appIdHint: 'flowtranslate',
      }),
    ).toBe('entitybuilders');
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
    expect(
      detectEntityBuildersAppId({
        redirectTo: 'https://anecdotia.entitybuilders.com/obrach',
        appIdHint: 'flowtranslate',
      }),
    ).toBe('anecdotia');
    expect(
      detectEntityBuildersAppId({
        redirectTo: 'https://barometro.baraja.cards',
        appIdHint: 'entitybuilders',
      }),
    ).toBe('baraja');
  });

  it('builds shared WhatsApp contact links', () => {
    const barajaWhatsapp = getEntityBuildersAppWhatsappOrFallback('baraja');

    expect(barajaWhatsapp.phoneNumberE164).toBe('+5491123946828');
    expect(barajaWhatsapp.displayNumber).toBe('+54 9 11 2394-6828');
    expect(
      buildEntityBuildersWhatsappUrl(
        barajaWhatsapp.phoneNumberE164,
        'Hola, quiero consultar por Baraja.',
      ),
    ).toBe(
      'https://wa.me/5491123946828?text=Hola%2C%20quiero%20consultar%20por%20Baraja.',
    );
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
        redirectTo: 'http://localhost:5178/obrach',
      }),
    ).toBe('anecdotia');
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
