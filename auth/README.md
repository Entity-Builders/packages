# @eb-packages/auth

Shared Supabase account access helpers for Entity Builders apps.

## Scope

This package owns reusable auth state and actions:

- Supabase session loading and subscription
- account kind resolution: `none`, `guest`, `permanent`
- anonymous guest sign-in
- email OTP/code request and verification
- OAuth start with guest link-first behavior when `linkIdentity` is available
- sign-out
- privacy-safe auth analytics metadata

Apps still own product copy, routing, quota UI, upgrade prompts, profile
surfaces, and app-specific analytics context.

## Usage

```ts
import { createClient } from '@supabase/supabase-js';
import {
  createEntityAuthConfig,
  createSupabaseAuthStorageKey,
  useSupabaseAccountAccess,
  type SupabaseAuthAccessClient,
} from '@eb-packages/auth';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: createSupabaseAuthStorageKey('flowtranslate'),
  },
});

const authConfig = createEntityAuthConfig({
  appId: 'flowtranslate',
  appName: 'FlowTranslate',
  redirectTo: () => window.location.origin,
  methods: [
    { type: 'email_otp' },
    { type: 'oauth', provider: 'google' },
    { type: 'guest', label: 'Iniciar prueba gratis' },
  ],
  analyticsContext: {
    app: 'flowtranslate',
  },
});

const account = useSupabaseAccountAccess({
  client: supabase as unknown as SupabaseAuthAccessClient | null,
  isConfigured: Boolean(supabase),
  authConfig,
  analytics,
  messages: {
    supabaseNotConfigured: 'Supabase no esta configurado.',
    missingEmail: 'Ingresa un email.',
  },
});
```

Apps should describe account access declaratively through `authConfig`:

- `appId` scopes auth metadata and should match the app auth storage key scope.
- `appName` is the product name shared auth UI can render.
- `methods` controls which account paths are enabled. Supported web/PWA methods
  are email OTP/code, OAuth providers such as Google, and anonymous guest trial.
- `redirectTo` centralizes OAuth and email redirect behavior for the app.
- `analyticsContext` adds privacy-safe metadata to shared auth events.

Use generic actions from the returned account contract, such as
`signInWithOAuth('google')`, `requestCode()`, `verifyCode()`,
`signInAsGuest()`, and `signOut()`. Avoid app-specific wrappers such as
`signInWithGoogle`; adding or removing providers should be a config change.

Use an app-specific `storageKey` for every persistent browser or native
Supabase client. Entity Builders shares Supabase account identity across apps,
but each product must keep its own persisted session bucket so signing in to one
app does not implicitly sign the browser into another app.

Set `appId` in `authConfig` for apps that request email OTP codes. The shared
auth hook passes it as Supabase OTP metadata (`app_name`) so the platform email
hook can choose the correct app-branded template even when URL detection is
unavailable.

The hook does not track email addresses, OTP codes, access tokens, refresh
tokens, source text, generated text, provider payloads, or payment credentials.
