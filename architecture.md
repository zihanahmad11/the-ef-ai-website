# The EF Ai Website — Architecture

## System overview

The project is a Cloudflare Worker application with static assets and one server-side lead-intake endpoint.

```text
Visitor browser
  ├─ Static pages from public/
  └─ POST /api/strategy-audit
       ├─ Origin, size, field, consent, rate-limit, and Turnstile checks
       ├─ D1 insert (authoritative record)
       └─ Asynchronous delivery
            ├─ Cloudflare Email Service → internal notification
            └─ Google Apps Script
                 ├─ deduplicated Google Sheets row
                 └─ visitor confirmation email via MailApp

Cloudflare cron (every 15 minutes)
  └─ retries only notification channels whose D1 status is failed
```

## Technology stack

- HTML, CSS, and vanilla JavaScript for the public interface.
- Cloudflare Workers Static Assets for hosting.
- Cloudflare Worker JavaScript for `/api/strategy-audit`.
- Cloudflare Turnstile for bot verification.
- Cloudflare D1 for authoritative lead persistence and delivery status.
- Cloudflare Email Service for the internal lead notification.
- Google Apps Script for Sheets synchronisation and visitor email.
- Google Sheets as the operational lead view.
- Wrangler 4 for development, migrations, configuration, and deployment.

## Repository layout

```text
public/
  index.html                 Homepage
  about/index.html           About page
  strategy-audit/index.html  Audit form
  privacy/index.html         Privacy page
  404.html                   Custom not-found page
  assets/                    Active raster logo assets
src/
  worker.js                  Request routing, validation, persistence, delivery, retries
migrations/
  0001_leads.sql             D1 schema and indexes
  0002_bounded_delivery_retries.sql
                             Per-channel retry metadata and indexes
google-apps-script/
  Code.gs                    Sheets deduplication and visitor confirmation
wrangler.jsonc               Worker, assets, D1, email, variables, cron, observability
package.json                 Development and deployment commands
README.md                    Operator setup and acceptance checks
```

## Request routing

- Requests to `/api/*` run through `src/worker.js` first.
- `POST /api/strategy-audit` is the only application API route.
- `OPTIONS /api/strategy-audit` supports preflight.
- Other methods on that route return `405`.
- All other paths are served from `public/` through the `ASSETS` binding.
- Missing static files use the custom 404 page.

## Lead-processing sequence

1. Check the request origin against `ALLOWED_ORIGINS`.
2. Enforce request-size limits and parse JSON.
3. Silently accept honeypot submissions without storing a lead.
4. Validate required fields, dropdown values, email, phone, and consent.
5. Hash the visitor IP with `IP_HASH_SALT`; never store the raw IP.
6. Enforce the hourly per-hash rate limit.
7. Verify Turnstile success, action, and allowed hostname.
8. Generate the lead ID and public reference.
9. Insert the complete lead into D1 with pending delivery statuses.
10. Return `201` with the reference while delivery continues asynchronously.
11. Update internal and customer delivery statuses independently.

## Persistence and retry model

- D1 is authoritative; Google Sheets is an operational copy.
- `reference` is unique in D1.
- Apps Script checks column A for the reference before appending, preventing duplicate rows during retries.
- Apps Script records `Confirmation sent at` on the reference's row and sends the visitor confirmation only while that cell is empty. The script lock covers the check, send, and marker update so concurrent Worker calls cannot both send it.
- Internal and customer delivery statuses are tracked separately.
- Each channel stores its attempt count, last-attempt time, and next-retry time in D1. An atomic `sending` claim prevents overlapping cron runs from attempting the same channel concurrently; a claim left behind by an interrupted invocation is recovered after 30 minutes and still counts toward the limit.
- The first failure is retried after 15 minutes, then after 30 minutes, 1 hour, and 4 hours. The fifth failed attempt becomes `terminal_failed` and is no longer selected automatically.
- The scheduled handler queries only due `failed` channels every 15 minutes, up to 20 records per run.
- A channel already marked `sent` is not sent again.

## Configuration

### Non-secret Wrangler variables

- `ALLOWED_ORIGINS`
- `TURNSTILE_HOSTNAMES`

### Cloudflare bindings

- `ASSETS`
- `LEADS`
- `NOTIFY_LEADS`

### Required Cloudflare secrets

- `TURNSTILE_SECRET`
- `APPS_SCRIPT_URL`
- `APPS_SCRIPT_SHARED_SECRET`
- `IP_HASH_SALT`

### Required Apps Script properties

- `SPREADSHEET_ID`
- `SHARED_SECRET`

Only names and purposes belong in documentation. Values must remain in the relevant secure service configuration.

## Deployment

- Cloudflare builds from the GitHub repository and deploys the Worker/static assets.
- Local commands are documented in `README.md`.
- Schema changes require a new numbered migration; never rewrite a migration already applied to production.
- Production acceptance requires separate checks for the browser result, D1, Sheets, internal email, and visitor email.
