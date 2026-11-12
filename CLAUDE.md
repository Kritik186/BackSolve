# BackSolve AI website — project notes

## What this is

A three-page marketing site (home, use cases, services) for BackSolve AI, a consultancy that audits how small private equity, venture capital and finance advisory firms work, then builds AI to remove their repeated manual work. Tagline: "Stuck in a loop? We backsolve the way out."

The design is called "Orbit": a dark site where the loop is a glowing ring of "copy, paste, repeat" and the way out is a beam of light leaving it. The owner tried other words and no words on the ring, and chose to keep these.

## Stack

- Plain HTML, CSS and JavaScript. No framework, no build step, no package.json, no dependencies.
- Preview with `python3 -m http.server 8000` from the project root.
- Keep it dependency-free unless the owner asks otherwise.

## Files

- `index.html`: the home page. `use-cases.html`: ten example use cases with a filter. `services.html`: the three services in detail.
- There is no templating. The `<head>`, the header, the footer and the horizon SVG are repeated in all three pages, so a change to any of them must be made three times. Inner pages link back with `index.html#how`, `index.html#team` and `index.html#book`, and mark their own menu link with `aria-current="page"`.
- Inner pages are built from two blocks: `.pagehead` (which reuses the hero's `hero__copy` and `hero__title` classes) and `.inside` (the horizon, then the page body in `.inside__body`).
- `css/styles.css`: tokens in `:root`, then base, type, buttons, header, hero, sections, motion, responsive.
- `js/main.js`: one IIFE. `CONFIG` at the top holds the email and booking link. Below it: one shared frame loop (`startTask` / `stopTask`), one shared scroll reader (`watchScroll`), then a block per animation.
- `assets/`: `favicon.svg`, `logo.svg`. The mark (a loop with a line leaving it) is also inline in the header and footer of `index.html`.

## Conventions

- Class names are BEM-like: `block__element--modifier`.
- Colours and fonts come from the CSS custom properties in `:root`. Do not hard-code new colours in CSS. The inline SVGs in `index.html` repeat a few of the same hex values because SVG gradients cannot read them.
- Two typefaces: Newsreader 500 for headlines (`--font-display`, with `--display-weight` and `--display-tracking`), Geist 400, 500 and 600 for everything else (`--font`). Headline classes are `.hero__title`, `.h2`, `.h3` and `.case__title`.
- Motion hooks are data attributes: `data-reveal` (block fades up), `data-stagger` (children reveal in sequence), `data-track` (the three-step line that follows the scroll).
- The script hands numbers to CSS through custom properties and CSS does the drawing: `--p` on `.hero` (0 at the top of the page, 1 once the hero has scrolled away), `--t` on `.track` (how far the steps line has run), `--mx` `--my` `--rx` `--ry` on each card (highlight and tilt), `--bx` `--by` on buttons (lean), `--px` `--py` on the hero light.
- Anything that needs a frame-by-frame update registers with `startTask` and must stop itself with `stopTask` when it is off screen or finished. Do not add a second `requestAnimationFrame` loop or a second scroll listener.
- All motion must respect `prefers-reduced-motion`, and the page must stay readable with JavaScript off. Reveal styles are scoped under the `.js` class for that reason.
- Breakpoints: 1100px, 900px, 860px (header links collapse into the menu button), 760px, 600px.
- The horizon SVG draws only the top arc of the ring. A full circle would show its far side further down long pages.

## The hero ring

- Everything in `.orbit` shares one coordinate space: ring centre `720,1480`, radius `800`, beam from `526.5,703.8` to `1302.5,510.2`.
- Three stacked layers: `.orbit__base` (glow, ring), `.orbit__spin` (words and lights, rotated by CSS so it stays on the compositor), `.orbit__top` (beam, arrow, label, bottom fade). `.orbit__spark` and `.orbit__flare` are plain elements positioned in percentages of the same space.
- The ring turns once in 96 seconds and carries 16 lights, so at rest one passes the start of the beam every 6 seconds. `makeRing` in `js/main.js` reads the spin animation's clock and fires a spark each time a light passes, so the two stay in time even while scrolling speeds the ring up. Its `TURN`, `STEP` and `OFFSET` constants must match the CSS duration and the lights in `index.html`.
- With JavaScript off, a timed CSS fallback fires the spark every 6 seconds (the `spark` keyframes, starting at 6.9s). The script switches it off by adding `orbit--live`.
- The stars are a canvas the script inserts as the first child of `.hero`. Shooting stars are confined to open sky so they never cross the text, and phones get none.
- Do not add blur filters to anything that animates. The blurred glows are static on purpose.

## Content rules

- Text in [SQUARE BRACKETS] is a placeholder for a fact only the owner knows (price, audit length, tools, data policy, links). Never replace a placeholder with an invented value. Ask the owner.
- No testimonials, client logos, statistics or results numbers unless the owner supplies real ones.
- The use cases are examples of what BackSolve AI builds, not client stories. Keep the line that says so until real case studies replace it, and never add invented results to them.
- The team line names Bain & Company and J.P. Morgan as past employers of the engineers. Do not add their logos, and do not strengthen the claim.
- Use the name as "BackSolve AI". Plain language, no jargon, British spelling in prose.

## Checks before finishing a change

- Load all three pages at 1440px and 390px wide, and the home page at 1366px too. There must be no horizontal scroll, and the beam must not cross the hero buttons.
- On a phone width, open the menu and follow a link. On Use cases, press each filter and check the count.
- Scroll to the bottom and confirm every section has revealed and all three steps in "How we backsolve" are lit.
- Load the page once with reduced motion switched on: everything must be visible and nothing may move.
- Submit the form with `CONFIG.email` empty and confirm the "not connected" message appears.
