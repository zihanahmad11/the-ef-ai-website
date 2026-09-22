# The EF Ai Website — Design System

## Brand character

The interface should feel modern, capable, energetic, and technically credible without becoming cold or visually overwhelming. The design combines a deep-space background with restrained neon gradients, rounded panels, and direct business language.

## Core colours

| Token | Value | Use |
|---|---:|---|
| Background | `#08051b` / `#090619` | Main page backgrounds |
| Elevated panel | `#110b2b` | Cards and grouped content |
| Primary text | `#f7f4ff` | Headings and important copy |
| Muted text | `#aaa4bc` | Supporting copy |
| Border | `rgba(255,255,255,.10)` | Panels, controls, separators |
| Pink | `#d51b92` | Brand gradient and accents |
| Orange | `#ff6b27` | Brand gradient and warm emphasis |
| Purple | `#7d2cff` | Brand gradient and depth |
| Success | `#62e5a0` | Operational/status indicators |

Gradients should combine pink, orange, and purple. Avoid introducing unrelated primary colours.

## Typography

- Headings: `Space Grotesk`, 500–700 weight.
- Body and interface text: `Inter`, 400–800 weight.
- Large headings use compact line height and modest negative letter spacing.
- Body copy should normally use a `1.6–1.8` line height.
- Eyebrows/kickers use uppercase, bold weight, and increased letter spacing.

## Layout

- Main content width: approximately `1160px`.
- Desktop horizontal page gutter: `22px` or more.
- Mobile horizontal page gutter: `14px`.
- Major homepage sections: approximately `82–105px` vertical padding on larger screens and `68px` on mobile.
- Use grids for related cards; collapse to one column below `900px` where required.
- Keep readable prose widths narrower than the full container.

## Components

### Header and navigation

- Translucent dark header with blur and a subtle bottom border.
- Desktop navigation is inline.
- Mobile navigation opens from a 42px rounded hamburger control.
- The mobile panel fades and slides into place, closes after selection, outside interaction, or Escape, and exposes `aria-expanded`.

### Buttons

- Primary buttons use the pink-to-orange gradient, rounded corners, and a restrained shadow.
- Secondary buttons use a translucent dark fill and light border.
- Hover movement should be small: approximately 1–2px.

### Cards and panels

- Rounded corners: generally `17–24px`.
- Use subtle translucent fills and low-contrast borders.
- Hover effects should improve focus without causing layout shifts.
- Card groups should maintain comparable visual weight and balanced copy lengths.

### Forms

- Labels remain visible; placeholders do not replace labels.
- Required status, errors, consent, and submission feedback must be clear.
- Focus states must be visible.
- Turnstile should sit naturally within the form without being visually disguised.

### Footer

- Two-level structure: brand/social area followed by legal/credit information.
- Social icons use inline SVG, visible accessible labels, and consistent 43px controls.
- Footer stacks cleanly on narrow screens.

## Motion

- Section reveals: subtle opacity and upward movement.
- Mobile menu: approximately 220ms fade/translate/scale transition.
- Decorative hero animation must not block interaction.
- Disable non-essential motion when `prefers-reduced-motion: reduce` is active.

## Responsive breakpoints

- `900px`: switch primary navigation and multi-column content to mobile/tablet layouts.
- `600px`: reduce gutters and section spacing; stack footer content and full-width actions where helpful.
- Test at narrow phone widths (approximately 320–390px), tablet, laptop, and wide desktop.

## Accessibility

- Maintain meaningful heading order and landmark elements.
- Provide accessible names for icon-only links and buttons.
- Preserve keyboard access and visible focus.
- Do not communicate state through colour alone.
- Use descriptive link text where context is not otherwise clear.

## Active assets

- `public/assets/logo.png`
- `public/assets/logo-transparent.png`

`THE_EF_AI_logo.pdf` is retired and must never be restored or used.

