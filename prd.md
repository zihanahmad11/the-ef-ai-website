# The EF Ai Website — Product Requirements

## Document purpose

This document defines what the production website must achieve. It describes product outcomes and acceptance criteria; implementation details belong in `architecture.md`.

## Product summary

The EF Ai website presents The EF Ai as a specialist AI automation partner for service-led organisations. It explains the available services, demonstrates relevant implementation scenarios, establishes credibility, and converts qualified visitors into strategy-audit enquiries.

## Problem being solved

Service teams can lose opportunities when calls, forms, and messages are not answered or followed up quickly. Prospective clients also need a clear, credible explanation of what AI automation can do, who is behind the company, and how to begin.

## Target users

- Owners and operational leaders of service-led organisations.
- Teams where response time, qualification, appointment booking, or follow-up affects revenue.
- Initial priority markets include the United Kingdom, with international delivery and a planned operating base in Dubai.
- Example sectors include health and beauty, hospitality, home services, professional services, medical and dental, legal, and real estate.

## Primary user journey

1. A visitor understands the value proposition on the homepage.
2. The visitor explores services, process, use cases, integrations, results, and the founding team.
3. The visitor opens the strategy-audit form.
4. The form validates the visitor and submission.
5. The visitor receives a unique `AUD-...` reference and confirmation email.
6. The team receives the lead in D1, Google Sheets, and the internal notification inbox.

## Required public pages

- `/` — Homepage with services, process, client testimonials, industries, integrations, implementation examples, ROI estimator, FAQ, CTA, and social links.
- `/about/` — Company story, purpose, principles, co-founder profiles, operating footprint, and CTA.
- `/strategy-audit/` — Lead-capture form protected by Cloudflare Turnstile.
- `/privacy/` — Privacy information and contact route.
- Custom `404` page.

## Functional requirements

### Navigation and responsive behaviour

- Navigation must work on desktop and mobile.
- The mobile menu must animate subtly, close after selecting a link, close on outside interaction, and close on Escape.
- All pages must remain usable at common mobile, tablet, laptop, and desktop widths.

### Strategy-audit form

- Validate required fields, field lengths, email format, dropdown values, consent, and Turnstile.
- Reject disallowed origins and excessive request volume.
- Return a unique reference after D1 persistence succeeds.
- Preserve the D1 record if a downstream notification fails.
- Send an internal notification and visitor confirmation asynchronously.
- Retry failed notification channels without duplicating successful channels.

### Trust and communication

- Describe The EF Ai as a specialist AI automation partner or company.
- Do not claim incorporation until registration is complete.
- Keep the approved client testimonial section unchanged unless the owners request an update.
- Link each co-founder to the approved LinkedIn profile.
- Link the company LinkedIn, Facebook, and Instagram profiles in the footer.

## Non-functional requirements

- Serve over HTTPS on `theefai.com` and `www.theefai.com`.
- Keep secrets out of source control, HTML, documentation, and logs.
- Treat D1 as the authoritative lead store.
- Provide accessible labels, keyboard behaviour, clear validation messages, and reduced-motion support.
- Apply security headers to static responses.
- Avoid unnecessary client dependencies; the public interface is intentionally lightweight.

## Success criteria

- Visitors can understand the offer and reach the audit form from every major page.
- The homepage and About page work without horizontal overflow on mobile.
- A controlled production submission produces one D1 record, one Sheet row, one internal notification, and one visitor confirmation.
- Retried delivery does not create duplicate Sheet rows.
- Social, privacy, LinkedIn, internal anchor, and cross-page links resolve correctly.

## Out of scope unless separately approved

- Client portal, authentication, payments, or subscription billing.
- Public dashboard or CRM.
- Analytics or advertising cookies.
- Automated deletion of production leads before a documented retention policy exists.
- Claims of registration, certification, partnerships, or results that have not been verified.

