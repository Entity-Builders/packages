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
  createSupabaseAuthStorageKey,
  useSupabaseAccountAccess,
  type SupabaseAuthAccessClient,
} from '@eb-packages/auth';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: createSupabaseAuthStorageKey('flowtranslate'),
  },
});

const account = useSupabaseAccountAccess({
  client: supabase as unknown as SupabaseAuthAccessClient | null,
  isConfigured: Boolean(supabase),
  analytics,
  messages: {
    supabaseNotConfigured: 'Supabase no esta configurado.',
    missingEmail: 'Ingresa un email.',
  },
});
```

Use an app-specific `storageKey` for every persistent browser or native
Supabase client. Entity Builders shares Supabase account identity across apps,
but each product must keep its own persisted session bucket so signing in to one
app does not implicitly sign the browser into another app.

The hook does not track email addresses, OTP codes, access tokens, refresh
tokens, source text, generated text, provider payloads, or payment credentials.
