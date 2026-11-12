# BackSolve AI website — project notes

## What this is

A one-page marketing site for BackSolve AI, a consultancy that audits how small private equity, venture capital and finance advisory firms work, then builds AI to remove their repeated manual work. Tagline: "Stuck in a loop? We backsolve the way out."

The design is called "Orbit": a dark page where the loop is a glowing ring of "copy, paste, repeat" and the way out is a beam of light leaving it.

## Stack

- Plain HTML, CSS and JavaScript. No framework, no build step, no package.json, no dependencies.
- Preview with `python3 -m http.server 8000` from the project root.
- Keep it dependency-free unless the owner asks otherwise.

## Files

- `index.html`: all sections and copy, in page order.
- `css/styles.css`: tokens in `:root`, then base, type, buttons, header, hero, sections, motion, responsive.
- `js/main.js`: one IIFE. `CONFIG` at the top holds the email and booking link.
- `assets/`: `favicon.svg`, `logo.svg` (placeholder mark until the logo is chosen).

## Conventions

- Class names are BEM-like: `block__element--modifier`.
- Colours and fonts come from the CSS custom properties in `:root`. Do not hard-code new colours in CSS. The inline SVGs in `index.html` repeat a few of the same hex values because SVG gradients cannot read them.
- One typeface: Geist, weights 400, 500 and 600.
- Motion hooks are data attributes: `data-reveal` (block fades up), `data-stagger` (children reveal in sequence), `data-track` (the three-step line draws and its nodes light).
- All motion must respect `prefers-reduced-motion`, and the page must stay readable with JavaScript off. Reveal styles are scoped under the `.js` class for that reason.
- Breakpoints: 1100px, 900px, 760px, 600px.

## The hero ring

- Everything in `.orbit` shares one coordinate space: ring centre `720,1480`, radius `800`, beam from `526.5,703.8` to `1302.5,510.2`.
- Three stacked layers: `.orbit__base` (glow, ring), `.orbit__spin` (words and lights, rotated by CSS so it stays on the compositor), `.orbit__top` (beam, arrow, label, bottom fade). `.orbit__spark` and `.orbit__flare` are plain elements positioned in percentages of the same space.
- The ring turns once in 96 seconds and carries 16 lights, so one passes the start of the beam every 6 seconds. The spark animation is 6 seconds long and starts at 6.9s to stay in time with them. If you change one of those numbers, change the others.
- Do not add blur filters to anything that animates. The blurred glows are static on purpose.

## Content rules

- Text in [SQUARE BRACKETS] is a placeholder for a fact only the owner knows (price, audit length, tools, data policy, links). Never replace a placeholder with an invented value. Ask the owner.
- No testimonials, client logos, statistics or results numbers unless the owner supplies real ones.
- The team line names Bain & Company and J.P. Morgan as past employers of the engineers. Do not add their logos, and do not strengthen the claim.
- Use the name as "BackSolve AI". Plain language, no jargon, British spelling in prose.

## Checks before finishing a change

- Load the page at 1440px, 1366px and 390px wide. There must be no horizontal scroll, and the beam must not cross the hero buttons.
- Scroll to the bottom and confirm every section has revealed.
- Submit the form with `CONFIG.email` empty and confirm the "not connected" message appears.
