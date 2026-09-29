# The EF Ai Website — Project Memory.

## Purpose

This is a durable decision log for future maintainers and AI tools. It records verified project context and important choices—not secrets, customer records, chat transcripts, or speculative plans. Add dated entries only when a decision, incident, or milestone will matter later.

## Stable project context

- Repository: `zihanahmad11/the-ef-ai-website`.
- Production hosts: `theefai.com` and `www.theefai.com`.
- Hosting/runtime: Cloudflare Workers Static Assets and a Cloudflare Worker.
- Lead database: Cloudflare D1 binding `LEADS`; D1 is authoritative.
- Operational lead view: Google Sheet `The EF AI — Strategy Audit Leads`, tab `Leads`.
- Sheets and visitor email: standalone Apps Script project `The EF AI — Lead Intake`.
- Internal notification: Cloudflare Email Service binding `NOTIFY_LEADS`.
- Public company positioning: specialist AI automation partner.
- Planned operating base: Dubai; international delivery with a focus on UK opportunities.
- Co-founders: Moin Uddin Mahmud, Rashed Mahmud, and Yusuf Ahmad Zihan.

## Non-negotiable decisions

- Never store secret values in Git, Markdown, HTML, Google Sheets, customer records, or chat.
- Never restore or use the retired `THE_EF_AI_logo.pdf`.
- Insert the lead into D1 before notification delivery.
- Keep D1 as the recovery source if Sheets or email fails.
- Preserve reference-based Sheet deduplication.
- Verify D1, Sheets, internal email, and visitor email separately.
- Do not claim the company is incorporated before registration is complete.
- Preserve approved client testimonials unless the owners explicitly request a change.

## Decision log

### 2026-09 — Production lead flow established

- Turnstile was configured for both production hostnames.
- The Worker validates the secret, action, and hostname.
- D1 persistence, internal notification, Apps Script/Sheets delivery, and visitor confirmation were connected.
- A 15-minute Cloudflare cron retries only due failed notification channels. D1 stores per-channel attempts and retry timestamps; backoff is 15 minutes, 30 minutes, 1 hour, then 4 hours, and the fifth failed attempt becomes `terminal_failed`.
- The Apps Script uses a shared secret, deduplicates Sheet rows by public reference, and records `Confirmation sent at` so a repeated successful request does not resend the visitor email.
- After correcting Apps Script properties and authorising email permission, Sheet updates and visitor confirmation were reported working.

### 2026-09 — Company credibility and content structure

- About content was moved from the homepage to a dedicated `/about/` page to keep the homepage focused.
- The company is described as a specialist AI automation partner.
- The About page uses collective founding language and introduces all three co-founders.
- Founder photographs remain pending; styled initials are temporary placeholders.
- Practical implementation scenarios were placed below the integrations section.
- The approved testimonial section was restored unchanged.

### 2026-09 — Mobile navigation and social presence

- The homepage and About page use an animated mobile menu.
- The menu closes after link selection, outside interaction, Escape, or returning to desktop width.
- Official LinkedIn, Facebook, and Instagram company links were added to the footer with accessible SVG icons.

## Known operational cautions

- A successful page message proves only that D1 accepted the lead and returned a reference; downstream delivery must be checked separately.
- Apps Script executions can complete while a specific mail or data action still fails; verify the actual destination.
- Google Apps Script mail quotas apply.
- Current retries have no attempt counter, backoff, or terminal-failure state.
- Sheets synchronisation and visitor confirmation currently share one Apps Script delivery status.

## How to update this file

- Add a short dated entry after a major verified milestone or durable decision.
- State what changed, why it matters, and any remaining limitation.
- Do not paste logs, form submissions, email addresses beyond established public operational contacts, IDs, tokens, or secret values.
- If this document conflicts with current code or production evidence, investigate and update the stale record rather than assuming this file is correct.

