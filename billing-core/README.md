# `@eb-packages/billing-core`

Shared billing state helpers for Entity Builders apps.

This package is the canonical browser/package contract for provider-agnostic
paid state. Product apps should consume it directly or through an app-specific
adapter package that maps generic paid states into product vocabulary.

## Owns

- Generic account billing state: guest, free, paid pending, paid active, paid
  failed, and paid cancelled.
- Verified entitlement shape checks and active-window checks.
- Conservative provider lookup mapping for Mercado Pago return/status states.
- Checkout return URL parsing that exposes only safe state and boolean reference
  hints.

## Does Not Own

- Product copy, pricing copy, upgrade surfaces, routes, or plan positioning.
- Product-specific labels such as FlowTranslate Pro.
- Supabase Edge Function persistence or provider webhook database writes.
- Payment credentials, raw provider payloads, card data, or checkout secrets.

## Runtime Boundary

Supabase Edge Functions currently use a Deno compatibility bridge at
`eb-infra/supabase/functions/_shared/entity-billing-state.ts`. That bridge must
stay semantically equivalent to this package until Edge Functions can safely
import the package source directly.

Any change to entitlement checks, paid access flags, retry flags, wait/support
flags, or fail-closed behavior must update the bridge or replace it, and must
keep parity tests passing.

## App Adapter Pattern

Apps should keep product semantics in their own package or app layer:

```ts
import { resolveEntityBillingState } from '@eb-packages/billing-core';

const state = resolveEntityBillingState({
  accountKind: 'permanent',
  entitlement,
});
```

FlowTranslate adapts this generic state in
`packages/flowtranslate-core/src/billing-state.ts`, mapping `paid_active` to
`pro_active` and `hasPaidAccess` to `hasProAccess`.
