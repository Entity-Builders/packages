/**
 * @eb-packages/expo-config — Shared Expo config factory
 *
 * Standardizes app.config.js across all Expo apps in the monorepo.
 * Each app only provides its unique values; the factory handles:
 *   - Bundle identifier with consistent org prefix
 *   - Runtime version policy
 *   - OTA update URL
 *   - Env-based app naming (dev/preview/production)
 *   - Owner field
 */

const ORG_PREFIX = 'com.entitybuilders';
const OWNER = 'juanobrach';
const EXPO_UPDATES_BASE = 'https://u.expo.dev';

/**
 * Creates a standardized Expo app config.
 *
 * @param {object} options
 * @param {string} options.name          — Human-readable app name (e.g. 'zigzag')
 * @param {string} options.slug          — Expo slug (e.g. 'zigzag')
 * @param {string} options.version       — App version (e.g. '1.0.0')
 * @param {string} options.projectId     — EAS project ID
 * @param {string[]} [options.plugins]   — Expo plugins array
 * @param {object} [options.ios]         — iOS-specific overrides (merged with defaults)
 * @param {object} [options.android]     — Android-specific overrides (merged with defaults)
 * @param {object} [options.web]         — Web-specific overrides
 * @param {object} [options.extra]       — Extra config (merged with eas projectId)
 * @param {object} [options.splash]      — Splash screen config
 * @param {string} [options.icon]        — Icon path
 * @param {string} [options.orientation] — Orientation (default: 'portrait')
 * @param {object} [options.bundleIdentifier] — Override to keep legacy bundle IDs
 *   @param {string} [options.bundleIdentifier.ios]     — Custom iOS bundle ID
 *   @param {string} [options.bundleIdentifier.android]  — Custom Android package name
 *
 * @returns {object} Full Expo config object wrapped in { expo: { ... } }
 */
function createAppConfig(options) {
  const {
    name,
    slug,
    version,
    projectId,
    plugins = [],
    scheme,
    ios = {},
    android = {},
    web = {},
    extra = {},
    splash,
    icon,
    orientation = 'portrait',
    bundleIdentifier: customBundleId,
  } = options;

  // Read EXPO_PUBLIC_APP_ENV (Expo/RN standard) with fallback to APP_ENV for legacy usage
  const appEnv = process.env.EXPO_PUBLIC_APP_ENV || process.env.APP_ENV || 'development';
  const isProduction = appEnv === 'production';

  // --- Bundle Identifier ---
  // If the app provides a custom bundleIdentifier (legacy apps), use that.
  // Otherwise, generate from the standard org prefix.
  const useBaseBundleId = process.env.USE_BASE_BUNDLE_ID === 'true';
  const envSuffix = (isProduction || useBaseBundleId) ? '' : `.${appEnv}`;

  const iosBundleIdentifier = customBundleId?.ios
    ? (isProduction || useBaseBundleId)
      ? customBundleId.ios
      : `${customBundleId.ios}.${appEnv}`
    : `${ORG_PREFIX}.${slug}${envSuffix}`;

  const androidPackage = customBundleId?.android
    ? (isProduction || useBaseBundleId)
      ? customBundleId.android
      : `${customBundleId.android}.${appEnv}`
    : `${ORG_PREFIX}.${slug}${envSuffix}`;

  // --- App Name ---
  // production  → "minimal-money"
  // preview     → "minimal-money (preview)"   ← TestFlight internal
  // development → "minimal-money (dev)"        ← dev client build
  const envLabel = { production: '', preview: ' (preview)', development: ' (dev)' }[appEnv] ?? ` (${appEnv})`;
  const displayName = `${name}${envLabel}`;

  // --- Build config ---
  const config = {
    expo: {
      name: displayName,
      slug,
      version,
      orientation,
      newArchEnabled: true,
      scheme: scheme || slug,
      owner: OWNER,

      // OTA Updates
      updates: {
        url: `${EXPO_UPDATES_BASE}/${projectId}`,
      },
      runtimeVersion: {
        policy: 'appVersion',
      },

      // iOS
      ios: {
        supportsTablet: true,
        bundleIdentifier: iosBundleIdentifier,
        infoPlist: {
          ITSAppUsesNonExemptEncryption: false,
          ...(ios.infoPlist || {}),
        },
        ...Object.fromEntries(
          Object.entries(ios).filter(([key]) => key !== 'infoPlist'),
        ),
      },

      // Android
      android: {
        package: androidPackage,
        adaptiveIcon: android.adaptiveIcon || undefined,
        edgeToEdgeEnabled: true,
        ...Object.fromEntries(
          Object.entries(android).filter(
            ([key]) =>
              !['package', 'adaptiveIcon', 'edgeToEdgeEnabled'].includes(key),
          ),
        ),
      },

      // Web
      web: {
        ...web,
      },

      // Plugins
      plugins,

      // Extra
      extra: {
        eas: {
          projectId,
        },
        ...extra,
      },
    },
  };

  // Optional fields
  if (icon) config.expo.icon = icon;
  if (splash) config.expo.splash = splash;

  return config;
}

module.exports = { createAppConfig };
