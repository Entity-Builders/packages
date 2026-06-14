# @eb-packages/app-registry

Canonical Entity Builders app identity registry.

Use this package when shared code needs app ids, display names, canonical URLs,
production domains, localhost port fallbacks, auth redirect paths, analytics
ids, or auth email template metadata.

## Add An App

1. Add the app id to `ENTITY_BUILDERS_APP_IDS`.
2. Add a matching entry in `ENTITY_BUILDERS_APP_REGISTRY`.
3. Include at least:
   - `appId`
   - `displayName`
   - `analyticsAppId`
   - `urls.canonical`
   - `urls.productionDomains`
   - `email.templateDir`
   - `email.fromName`
4. Add local dev ports only as fallbacks. Current safe app metadata should
   disambiguate localhost when a dev server moves ports.
5. Update app auth config to import identity and redirect helpers from this
   package.
6. If the app needs a branded auth email, add or update the matching template
   under `eb-infra/supabase/functions/_shared/email-templates/`.
