# @eb-packages/ui-web

React-first shared web UI primitives for Entity Builders web/PWA apps.

This package owns reusable visual behavior: buttons, notices, form fields,
modal shells, status banners, WhatsApp contact buttons, shared CSS variables,
accessibility defaults, and local gallery examples.

Apps still own:

- product copy
- routing
- domain data fetching
- entitlement rules
- app-specific analytics context
- upgrade prompts and product-specific actions

## Usage

Import the shared CSS once near the app entrypoint:

```css
@import '@eb-packages/ui-web/styles.css';
```

Then import React primitives:

```tsx
import { EbButton, EbNotice } from '@eb-packages/ui-web';
```

For shared WhatsApp contact CTAs, build the `href` from app-owned or
registry-owned contact metadata and pass it to the shared button:

```tsx
import { EbWhatsAppButton } from '@eb-packages/ui-web';

<EbWhatsAppButton href="https://wa.me/5491123946828?text=Hola">
  Hablar por WhatsApp
</EbWhatsAppButton>
```

## Token Contract

The source of truth for shared web UI tokens is code:

- CSS runtime values live in `src/styles.css`.
- Machine-readable token metadata lives in `src/tokens.ts`.
- Consumers and tooling may import token metadata without importing React:

```ts
import { ebWebTokenList, ebWebTokens } from '@eb-packages/ui-web/tokens';
```

Figma may mirror these values as variables or swatches, but Figma is not the
source of truth for shipped tokens in this first slice. If a visual exploration
suggests a token change, update `src/tokens.ts`, `src/styles.css`, and the
relevant OpenSpec notes before relying on it in an app.

## Visual Inventory

Run the package gallery:

```bash
yarn workspace @eb-packages/ui-web gallery:dev
```

Build the gallery:

```bash
yarn workspace @eb-packages/ui-web gallery:build
```

The gallery is intentionally lightweight for this first slice. It can graduate
to Storybook later if the component inventory grows.

## Web Components

The first optional Web Component is `<eb-status-banner>`. It is a vanilla custom
element that uses the same `eb-*` CSS classes and does not require React.

```html
<script type="module">
  import { defineEbStatusBannerElement } from '@eb-packages/ui-web/elements';

  defineEbStatusBannerElement();
</script>

<eb-status-banner
  tone="success"
  title="Embeddable status banner"
  body="Rendered by a custom element in a plain HTML host."
  action-label="Continue"
  action-value="continue"
  dismissible
></eb-status-banner>
```

Events:

- `eb-action`: fired when the optional action button is clicked.
- `eb-dismiss`: fired when the optional dismiss button is clicked.

Run the non-React fixture through the gallery dev server:

```bash
yarn workspace @eb-packages/ui-web gallery:dev
```

Then open `/status-banner-element.html`.

## Ownership Rules

- Use this package for reusable web/PWA interface patterns with at least one
  additional plausible consumer.
- Keep product-specific UI local when the surface is experimental or unlikely
  to be reused.
- Prefer React components for Entity Builders apps.
- Defer Web Components until there is a concrete non-React host or sales use
  case.
- Figma AI can inspire or critique UI, but accepted decisions must become
  code-owned tokens, components, or OpenSpec notes before shipping.
