# @entity-builders packages

Shared TypeScript packages consumed across the Entity Builders apps, published to
[GitHub Packages](https://github.com/orgs/Entity-Builders/packages) under the
`@entity-builders` scope. Each top-level folder is one package.

Extracted from the original `entity-builders` monorepo (`packages/*`), history
preserved via `git filter-repo`.

## Packages

- `@entity-builders/ai-services`
- `@entity-builders/analytics`
- `@entity-builders/app-registry`
- `@entity-builders/argum-engine`
- `@entity-builders/auth`
- `@entity-builders/auth-ui-web` (depends on `auth`, `ui-web`)
- `@entity-builders/billing-core`
- `@entity-builders/compas-core`
- `@entity-builders/deck-engine`
- `@entity-builders/expo-config`
- `@entity-builders/flowtranslate-core` (depends on `billing-core`)
- `@entity-builders/garden`
- `@entity-builders/logic`
- `@entity-builders/spotify-service`
- `@entity-builders/ui` (depends on `logic`)
- `@entity-builders/ui-web`
- `@entity-builders/zigzag-logic`

## Publishing a new version

```bash
cd <package>
yarn version <patch|minor|major>
GITHUB_PACKAGES_TOKEN=<token with write:packages> yarn npm publish
```

`GITHUB_PACKAGES_TOKEN` needs `read:packages` to install and `write:packages` to
publish. Consuming apps read the same scope config (see `.yarnrc.yml`) to install
from this registry instead of a workspace link.
