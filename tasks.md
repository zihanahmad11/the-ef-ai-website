# The EF Ai Website — Task Board

Update this file when a meaningful milestone changes. Do not use it as a minute-by-minute activity log.

## Current release objective

Review, version, and deploy the updated homepage and dedicated About page without regressing the live lead flow.

## Completed

- [x] Connect `theefai.com` and `www.theefai.com` to Cloudflare production hosting.
- [x] Build the static homepage, strategy-audit form, privacy page, and custom 404 page.
- [x] Validate Turnstile on the server for the expected action and hostnames.
- [x] Persist leads to the `LEADS` D1 binding before downstream delivery.
- [x] Configure internal lead email through `NOTIFY_LEADS`.
- [x] Configure Apps Script authentication, Google Sheets synchronisation, reference deduplication, and visitor confirmation email.
- [x] Add scheduled retries for failed delivery channels.
- [x] Bound notification retries with durable per-channel attempt metadata, backoff, and terminal-failure handling.
- [x] Guard visitor confirmations by reference so successful Worker retries do not resend them.
- [x] Confirm submitted form fields display correctly in the `Leads` Sheet.
- [x] Confirm visitor confirmation email works after Apps Script authorisation.
- [x] Add practical implementation examples below the integrations section.
- [x] Create a dedicated `/about/` page with company story, principles, co-founder profiles, and CTA.
- [x] Add responsive, self-closing mobile navigation to the homepage and About page.
- [x] Add LinkedIn, Facebook, and Instagram company links to the footer.
- [x] Preserve the approved testimonial section unchanged.

## Next — before deployment

- [ ] Preview the homepage and About page at mobile, tablet, laptop, and desktop widths.
- [ ] Verify the mobile menu opens, animates, follows each link, and closes correctly on both pages.
- [ ] Verify all company social links and co-founder LinkedIn links.
- [ ] Check About-page copy and titles with all three co-founders.
- [ ] Add approved professional founder photographs when supplied; keep initials until then.
- [ ] Review `git diff` and confirm only intended files are included.
- [ ] Commit the approved website and documentation changes.
- [ ] Push to the connected GitHub branch so Cloudflare can build the release.

## Production acceptance after deployment

- [ ] Check homepage, About, strategy-audit, privacy, and 404 routes on both production hostnames.
- [ ] Recheck mobile navigation on a physical phone.
- [ ] Confirm HTTPS works without certificate warnings from a UK connection.
- [ ] Run one controlled strategy-audit submission.
- [ ] Confirm the same reference exists in D1 and Google Sheets.
- [ ] Confirm the internal notification arrives.
- [ ] Confirm the visitor confirmation arrives and check spam placement.
- [ ] Confirm no duplicate Sheet row appears after the retry window.
- [ ] Record the major deployment milestone in the external project progress tracker without secret values.

## Later improvements

- [ ] Adopt and document a lead-retention policy.
- [ ] Add reliable automated checks for Worker validation and retry behaviour.
- [ ] Track Sheets synchronisation separately from visitor-email delivery if the Apps Script flow is split.
- [ ] Review legal and privacy copy after incorporation or a material provider/market change.
- [ ] Add future social profiles only when official pages exist.
