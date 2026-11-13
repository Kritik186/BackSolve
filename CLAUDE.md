# BackSolve AI website — project notes

## What this is

A five-page marketing site (home, use cases, services, how it works, your data) for BackSolve AI, a consultancy that audits how small private equity, venture capital and finance advisory firms work, then builds AI to remove their repeated manual work. Tagline: "Stuck in a loop? We backsolve the way out."

The design is called "Orbit": a dark site where the loop is a glowing ring of "copy, paste, repeat" and the way out is a beam of light leaving it. The owner tried other words and no words on the ring, and chose to keep these.

## Stack

- Plain HTML, CSS and JavaScript. No framework, no build step, no package.json, no dependencies.
- Preview with `python3 -m http.server 8000` from the project root.
- Keep it dependency-free unless the owner asks otherwise.

## Files

- `index.html`: the home page. `use-cases.html`: ten example use cases with a filter. `services.html`: the three services in detail. `how-it-works.html`: the three steps in detail and what we need from the client. `data.html`: how client data is handled (eight commitments), plus a short note on what this website itself collects.
- There is no templating. The `<head>`, the header, the footer and the horizon SVG are repeated in every page, so a change to any of them must be made in all five. Inner pages link back with `index.html#team` and `index.html#book`, and mark their own menu link with `aria-current="page"`.
- Inner pages are built from two blocks: `.pagehead` (which reuses the hero's `hero__copy` and `hero__title` classes) and `.inside` (the horizon, then the page body in `.inside__body`).
- `css/styles.css`: tokens in `:root`, then base, type, buttons, header, hero, sections, motion, responsive.
- `js/main.js`: one IIFE. `CONFIG` at the top holds the email and booking link. Below it: one shared frame loop (`startTask` / `stopTask`), one shared scroll reader (`watchScroll`), then a block per animation.
- `assets/`: `favicon.svg`, `logo.svg`. The mark (a loop with a line leaving it) is also inline in the header and footer of `index.html`.

## Conventions

- Class names are BEM-like: `block__element--modifier`.
- Colours and fonts come from the CSS custom properties in `:root`. Do not hard-code new colours in CSS. The inline SVGs in `index.html` repeat a few of the same hex values because SVG gradients cannot read them.
- Two typefaces: Newsreader 500 for headlines (`--font-display`, with `--display-weight` and `--display-tracking`), Geist 400, 500 and 600 for everything else (`--font`). Headline classes are `.hero__title`, `.h2`, `.h3` and `.case__title`.
- Motion hooks are data attributes: `data-reveal` (block fades up), `data-stagger` (children reveal in sequence), `data-track` (the three-step line: it follows the scroll on the home page, and with `data-track="timed"` it runs once on its own, which suits a list at the top of a page).
- The script hands numbers to CSS through custom properties and CSS does the drawing: `--p` on `.hero` (0 at the top of the page, 1 once the hero has scrolled away), `--t` on `.track` (how far the steps line has run), `--mx` `--my` on every box the pointer can light (cards, panels, services, use cases, the form, and the rows of the reasons and questions lists), `--rx` `--ry` on each card (tilt), `--px` `--py` on `.team` (its glow), `--bx` `--by` on buttons (lean), `--px` `--py` on the hero light, `--share` on `.calc` (the lit part of the calculator ring, 0 to 1) and `--fill` on each of its sliders.
- Anything that needs a frame-by-frame update registers with `startTask` and must stop itself with `stopTask` when it is off screen or finished. Do not add a second `requestAnimationFrame` loop or a second scroll listener.
- All motion must respect `prefers-reduced-motion`, and the page must stay readable with JavaScript off. Reveal styles are scoped under the `.js` class for that reason.
- Breakpoints: 1100px, 900px, 860px (header links collapse into the menu button), 760px, 600px.
- The horizon SVG draws only the top arc of the ring. A full circle would show its far side further down long pages. The lights that travel along it are not in the markup: the script adds a `.horizon__lights` layer to every `.horizon`, on the same circle as the rim (centre `720,1480`, radius `800`), clipped to the horizon so only the top arc shows.
- The script splits every `.h2` that holds plain text into `.glow-word` spans so it can light up word by word. A headline that needs a link or other markup inside it is left alone, so keep `.h2` text plain where you want the effect.
- The loop icons and the horizon lights are CSS animations whose speed the script raises while the page scrolls (one shared rate, in the "Everything that turns" block). Anything new that should whirl with the scroll joins that list instead of getting its own loop.

## The hero ring

- Everything in `.orbit` shares one coordinate space: ring centre `720,1480`, radius `800`, beam from `526.5,703.8` to `1302.5,510.2`.
- Three stacked layers: `.orbit__base` (glow, ring), `.orbit__spin` (words and lights, rotated by CSS so it stays on the compositor), `.orbit__top` (beam, arrow, label, bottom fade). `.orbit__spark` and `.orbit__flare` are plain elements positioned in percentages of the same space.
- The ring turns once in 96 seconds and carries 16 lights, so at rest one passes the start of the beam every 6 seconds. `makeRing` in `js/main.js` reads the spin animation's clock and fires a spark each time a light passes, so the two stay in time even while scrolling speeds the ring up. Its `TURN`, `STEP` and `OFFSET` constants must match the CSS duration and the lights in `index.html`.
- With JavaScript off, a timed CSS fallback fires the spark every 6 seconds (the `spark` keyframes, starting at 6.9s). The script switches it off by adding `orbit--live`.
- Below the top of each page there is a second, quieter sky: one fixed canvas (`.backdrop`, made by `makeBackdrop`) that the script puts first in `<body>` at `z-index: -1`. It has fewer, dimmer stars, moves them by depth as the page scrolls, links stars near the pointer, lights a patch of grid under it, and on wide screens sends an occasional spark across the empty margin beside the text. It draws only while something below the hero is on screen.
- Because that canvas sits behind the page, a section must stay see-through. A section that needs its own colour (`.loops`, `.cost`, `.how`, `.book`, `.inside`) paints it from a `::before` layer at `z-index: -2`. Do not give a section an opaque `background`, and do not let a section create a stacking context (no `z-index`, `transform`, `opacity` or `isolation` on the section itself), or the sky disappears behind it. The planet glow in the horizon SVG fades to transparent at its edge for the same reason.
- The stars are a canvas the script inserts as the first child of `.hero` (or `.pagehead` on inner pages). `makeStars` draws three depths, halos and glints, links stars near the pointer into a constellation, and stretches them while the page scrolls. Shooting stars are confined to open sky so they never cross the text, and phones get none.
- Do not add blur filters to anything that animates. The blurred glows are static on purpose.

## Content rules

- Text in [SQUARE BRACKETS] is a placeholder for a fact only the owner knows. Two are left, both about the tools he works in. Never replace a placeholder with an invented value. Ask the owner.
- The owner's terms, in his words, are on the site and must stay consistent wherever they appear: the audit takes one to two weeks depending on the work; the fee is fixed and agreed on the first call, with no figure shown; the audit needs about two hours a week from the client's team; sprint length depends on the task; fixes and support are included for 60 days after each build. Do not add a price, a set sprint length or a longer support period.
- Contact is `loop@backsolveai.com`, in the footer of every page and in `CONFIG.email`. There is no LinkedIn link and no booking link because the owner asked for neither: do not add placeholders for them, and leave `CONFIG.bookingUrl` empty unless he supplies a link.
- No testimonials, client logos, statistics or results numbers unless the owner supplies real ones.
- The use cases are examples of what BackSolve AI builds, not client stories. Keep the line that says so until real case studies replace it, and never add invented results to them.
- The team lines name J.P. Morgan, Goldman Sachs and Bain & Company ("among others") as past employers of the engineers, and say dedicated finance professionals work with the team. The owner supplied this wording. Do not add those firms' logos, and do not strengthen the claim further.
- The data commitments ("Your data stays yours" on the home page, the data answer in the questions, "Access, on your terms" on How it works, and all of `data.html`) are a standard set the owner asked for because he had no policy of his own. Each one is a promise: an NDA first, the client's systems first, access the client controls, outside services listed up front, AI services only on terms that do not train on client data, copies deleted within 30 days, no naming a client without permission, and notice within 72 hours if data is exposed. Do not add to them, strengthen them, or claim a certification or compliance badge (SOC 2, ISO 27001, GDPR and so on) unless the owner supplies it. Keep the wording in step across those four places.
- The "And this website" paragraph on `data.html` describes the site as built: no cookies, no analytics, a form that opens the visitor's mail app, fonts from Google Fonts. Rewrite it in the same change if any of that stops being true.
- The loop calculator on the home page works only from the visitor's own numbers: people x hours x times a year. Its one assumption, a working year of 48 weeks of 40 hours, is printed under the result. Do not add benchmark figures, a default hourly rate or a savings estimate to it.
- The third step is called "Next projects", not a retainer. The owner does not want the site to push a monthly commitment: a monthly plan may be mentioned as an option, never as a requirement.
- Use the name as "BackSolve AI". Plain language, no jargon, British spelling in prose.

## Checks before finishing a change

- Load all five pages at 1440px and 390px wide, and the home page at 1366px too. There must be no horizontal scroll, and the beam must not cross the hero buttons.
- On a phone width, open the menu and follow a link. On Use cases, press each filter and check the count.
- Scroll to the bottom and confirm every section has revealed and all three steps in "How we backsolve" are lit.
- Load the page once with reduced motion switched on: everything must be visible and nothing may move.
- Scroll each page to the bottom and confirm no headline is left dim: every word of every `.h2` must end at full brightness.
- Check the stars behind the page show in every section below the hero, including "Sound familiar?", the booking section and the body of each inner page, and that text over them is still easy to read.
- Submit the form and confirm it opens a message addressed to `CONFIG.email`. With that value emptied, the "not connected" message must appear instead.
- On the home page, move both calculator sliders and press each "How often" choice: the figure must equal people x hours x times a year (240, 48, 12 or 4), and "Bring this loop to the call" must fill the form's last box without overwriting anything already typed there.
