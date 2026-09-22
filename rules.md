# The EF Ai Website — Engineering Rules

## How to use this file

Read `prd.md`, `architecture.md`, `design.md`, `tasks.md`, and `memory.md` before making a material change. This file is the implementation rulebook. Documentation is useful context, but the current code and verified production state must still be inspected before acting.

## Safety and privacy

- Never request, print, commit, or document secret values, tokens, passwords, salts, private keys, or customer records.
- Secret names may be documented; values belong only in Cloudflare secrets or Apps Script properties.
- Never restore, reference as an active asset, or use the retired `THE_EF_AI_logo.pdf` file.
- Never store raw IP addresses. Preserve the salted-hash design.
- Treat form submissions as personal data and escape all user-controlled content before placing it in email HTML.
- Do not weaken Turnstile, origin checks, validation, consent, rate limiting, or security headers to simplify development.

## Source-of-truth rules

- D1 is the authoritative lead store; Google Sheets is an operational view.
- Insert into D1 before attempting email or Sheets delivery.
- Track internal notification and visitor/Sheet delivery independently.
- Preserve reference-based Apps Script deduplication.
- Do not mark the complete flow verified based only on a successful browser message or Apps Script execution.

## Implementation constraints

- Use the existing HTML, CSS, and vanilla JavaScript approach unless a framework migration is explicitly approved.
- Avoid adding dependencies for functionality that can be implemented clearly with the existing stack.
- Keep public routes and asset paths compatible with Cloudflare Static Assets.
- Use `apply_patch` for focused source edits.
- Create a new numbered D1 migration for schema changes.
- Preserve existing user changes and avoid unrelated rewrites.
- Keep changes responsive and keyboard-accessible.
- Honour `prefers-reduced-motion` for non-essential animation.

## Content rules

- Describe The EF Ai as a specialist AI automation partner or company.
- Do not claim that the company is incorporated until registration is complete.
- Use “preparing to establish in Dubai” where operating status needs clarification.
- Preserve the approved client testimonials unless the owners explicitly request a change.
- Do not invent client names, results, credentials, certifications, partnerships, addresses, awards, or team experience.
- Keep co-founder roles and profile links consistent across pages.
- Use British English on public-facing pages where practical.

## Design rules

- Follow `design.md`; reuse existing components before creating variants.
- Maintain the dark purple/pink/orange visual identity and current typography.
- Do not introduce a different visual language on a new page.
- Verify desktop and mobile layouts, especially navigation, forms, cards, and footer.
- Social links must include accessible names, open safely in a new tab, and use `rel="noopener noreferrer"`.

## Form and error-handling rules

- Return clear public errors without leaking stack traces, secrets, or provider responses.
- Log operational failures with the public reference when available, not sensitive submission content.
- Do not lose a persisted lead because a downstream notification fails.
- Retry only failed delivery channels.
- Keep field-length and request-size limits aligned between client and server where applicable.

## Verification before handoff

- Run `git diff --check`.
- Review `git status` and the complete diff; do not include unrelated files.
- Confirm internal links, cross-page links, privacy links, LinkedIn profiles, and social URLs.
- For UI changes, check narrow mobile and desktop widths.
- For form changes, perform controlled end-to-end verification of D1, Sheets, internal email, and visitor email.
- Do not commit, push, deploy, delete data, rotate secrets, or submit the live form unless the user requests that action.

