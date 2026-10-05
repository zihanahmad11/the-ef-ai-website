# The EF Ai — Cloudflare Deployment.

This package contains the production website, strategy-audit form, Cloudflare Worker API, D1 migration, Turnstile integration, internal notification, Google Sheets synchronization, and visitor confirmation email.

## Architecture

- Cloudflare Workers Static Assets Serves `public/`.
- `POST /api/strategy-audit` validates and processes the form.
- Cloudflare Turnstile blocks automated submissions.
- Cloudflare D1 is the authoritative lead store.
- Cloudflare Email Service sends an internal notification only to the verified address `theefai.agent@gmail.com`.
- Google Apps Script appends the lead to Google Sheets and sends the visitor confirmation.

## Before deployment

You need:

1. A Cloudflare account on the Workers Free plan.
2. The `theefai.com` domain in that account.
3. Node.js 20 or newer on the deployment computer.
4. Access to `theefai.agent@gmail.com`.
5. A Google Sheet for lead records.

Never put the Turnstile secret, Apps Script shared secret, or IP hashing salt in HTML, Git, or `wrangler.jsonc`.

## 1. Install and authenticate

From this project directory:

```bash
npm install
npx wrangler login
```

## 2. Create D1

```bash
npx wrangler d1 create the-ef-ai-leads
```

Copy the returned database ID into `wrangler.jsonc`, replacing `REPLACE_WITH_D1_DATABASE_ID`, then apply the schema:

```bash
npm run db:migrate:remote
```

## 3. Create Turnstile

In Cloudflare, create a Turnstile widget for:

- `theefai.com`
- `www.theefai.com`

Replace `REPLACE_WITH_TURNSTILE_SITE_KEY` in `public/strategy-audit/index.html` with the public site key. Keep the secret key private; add it in step 6.

Cloudflare requires the token to be validated on the server. The included Worker checks success, the `strategy_audit` action, and the expected hostname.

## 4. Configure the Google Sheet

1. Sign in as `theefai.agent@gmail.com`.
2. Create a spreadsheet named `The EF Ai — Strategy Audit Leads`.
3. Copy its ID from the URL between `/d/` and `/edit`.
4. Open **Extensions → Apps Script**.
5. Replace the editor contents with `google-apps-script/Code.gs`.
6. In **Project Settings → Script properties**, add:
   - `SPREADSHEET_ID`: the spreadsheet ID.
   - `SHARED_SECRET`: a random value of at least 32 characters.
7. Select **Deploy → New deployment → Web app**.
8. Set **Execute as** to yourself.
9. Set access so the Cloudflare Worker can call the endpoint without customer sign-in.
10. Authorize spreadsheet and email access.
11. Copy the production URL ending in `/exec`.

Do not use the `/dev` test URL in production.

The Apps Script safely prefixes spreadsheet values beginning with formula characters to reduce spreadsheet-formula injection risk.
It also uses the lead reference and a `Confirmation sent at` column to avoid resending a visitor confirmation when the Worker repeats a successful Apps Script request whose response was lost.

## 5. Configure internal email

In Cloudflare Email Service / Email Routing:

1. Add `theefai.agent@gmail.com` as a destination.
2. Complete the verification email sent by Cloudflare.
3. Onboard `theefai.com` for Email Service.
4. Ensure `forms@theefai.com` is permitted as a sender.
5. Optionally route `hello@theefai.com` to `theefai.agent@gmail.com` for incoming enquiries.

The `NOTIFY_LEADS` binding is restricted to the single verified Gmail destination in `wrangler.jsonc`.

## 6. Add Worker secrets

Run each command and enter the requested value only at the secure prompt:

```bash
npx wrangler secret put TURNSTILE_SECRET
npx wrangler secret put APPS_SCRIPT_URL
npx wrangler secret put APPS_SCRIPT_SHARED_SECRET
npx wrangler secret put IP_HASH_SALT
```

- `TURNSTILE_SECRET`: Turnstile secret key.
- `APPS_SCRIPT_URL`: deployed Google Apps Script `/exec` URL.
- `APPS_SCRIPT_SHARED_SECRET`: exactly the same value as the Google script property `SHARED_SECRET`.
- `IP_HASH_SALT`: a different random value of at least 32 characters.

## 7. Test locally

Cloudflare provides Turnstile test keys for local development. Do not use production keys on localhost.

Create `.dev.vars` with development-only values. This file is ignored by Git:

```dotenv
TURNSTILE_SECRET=YOUR_TEST_SECRET
APPS_SCRIPT_URL=YOUR_PRODUCTION_OR_TEST_EXEC_URL
APPS_SCRIPT_SHARED_SECRET=YOUR_MATCHING_SHARED_SECRET
IP_HASH_SALT=A_RANDOM_LOCAL_VALUE
```

Add `http://localhost:8787` temporarily to `ALLOWED_ORIGINS` and `localhost` to `TURNSTILE_HOSTNAMES` while testing, then remove them before production.

```bash
npm run db:migrate:local
npm run dev
```

Open `http://localhost:8787/strategy-audit/`.

## 8. Deploy

```bash
npm run deploy
```

In the Worker settings, add the custom domain `theefai.com`. Add or redirect `www.theefai.com` according to the domain guidance shown by Cloudflare.

## 9. Production acceptance tests

Complete these tests before advertising the site:

- Homepage and audit page load on desktop and mobile.
- Root domain and `www` resolve over HTTPS.
- Required-field validation is clear and accessible.
- Invalid email addresses are rejected.
- Turnstile is validated by the Worker, not only in the browser.
- A genuine submission receives a unique reference.
- The lead appears in D1.
- The lead appears in Google Sheets.
- `theefai.agent@gmail.com` receives the internal notification.
- The visitor receives the confirmation email.
- The confirmation does not land in spam for Gmail and Outlook test addresses.
- Repeated submissions trigger the rate limit.
- Privacy links work.
- The site returns a custom 404 page.

## 10. Operating the form

- Treat D1 as the authoritative backup.
- Review the Google Sheet and internal notifications daily.
- Never delete D1 leads until a documented retention period is adopted.
- Check Worker logs when either email status is `failed`.
- Delivery attempts are counted independently for the internal and visitor channels. Failed attempts back off for 15 minutes, 30 minutes, 1 hour, then 4 hours; a fifth failure is marked `terminal_failed` for manual investigation instead of being retried forever.
- Before deploying this Worker version, apply migration `0002_bounded_delivery_retries.sql` with `npm run db:migrate:remote`, then deploy the matching Apps Script version.
- Rotate the Apps Script shared secret and IP salt if either is exposed.
- Google Apps Script mail quotas apply. With only the visitor confirmation sent through Apps Script, a consumer Google account currently supports roughly 100 confirmations per day.

## Privacy-policy note

The supplied policy identifies The EF Ai as an unincorporated early-stage business and uses `theefai.agent@gmail.com` as the privacy contact. It is a practical launch draft, not legal advice. Revisit it when the business incorporates, begins advertising in additional jurisdictions, installs analytics/advertising cookies, collects sensitive information, or changes service providers.
