# BackSolve AI — website

Marketing site for BackSolve AI, in the "Orbit" design: a home page, plus Use cases, Services, How it works and Your data pages. Plain HTML, CSS and JavaScript: no framework, no build step, no dependencies.

> Stuck in a loop? We backsolve the way out.

## Live preview

https://kritik186.github.io/BackSolve/

GitHub Pages serves the `main` branch of this repository, so every push to `main` shows up there a minute or two later. It costs nothing while the repository is public.

The page carries a `noindex` tag so search engines skip it while it still has placeholders. Remove that line from the `<head>` of `index.html` when you launch.

## Run it locally

Any static file server works. From this folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## What is in here

```
index.html          Home page
use-cases.html      Ten example use cases, with a filter by kind of firm
services.html       The Loop Audit, build sprints and next projects in detail
how-it-works.html   The three steps in detail, and what we need from the client
data.html           How client data is handled, and what this website collects
css/styles.css      Design tokens (colours, type), layout, components, motion
js/main.js          All animation and behaviour, the form, and CONFIG
assets/favicon.svg  Browser tab icon
assets/logo.svg     The mark on its own (a loop with a line leaving it)
CLAUDE.md           Project notes for Claude Code
```

## Before you launch

### 1. Fill in the placeholders

Everything that is not yet known is written in CAPITALS inside [SQUARE BRACKETS] in the `.html` files, usually with a `TODO` comment above it. Search for `[` to find them all.

| Section | What to fill in |
|---|---|
| The Loop Audit | Audit length and price |
| Why BackSolve AI | The tools you work in |
| Questions | Time needed from the client's team, your price, the tools you support |
| Services page | Audit length and price, sprint length, time needed from the client, what happens if something you built stops working, what support is included after a build |
| How it works page | Time needed from the client, audit length and price |
| Footer (every page) | Email and LinkedIn links |

### 2. Connect the "Book a call" buttons and the form

Open `js/main.js` and set the two values in `CONFIG` at the top:

- `email`: the form opens the visitor's mail app with a pre-filled message to this address. Until it is set, the form shows "This form is not connected yet."
- `bookingUrl` (optional): a Cal.com or Calendly link. If set, every "Book a call" button opens it in a new tab.

There is no server behind the form. If you would rather collect submissions without the visitor's mail app, replace the submit handler with a form service.

### 3. Check every claim

- The team section says the engineers come from companies like J.P. Morgan, Goldman Sachs and Bain & Company, and that dedicated finance professionals work with you. Prospects can check this on LinkedIn, so keep it only while it is true of the people who do the work.
- The Services page promises "Fixed price per project" and "No monthly commitment" for follow-on work. Keep them only if you mean them.
- The data commitments are promises to clients. They appear on the home page ("Your data stays yours"), in the questions, on How it works and in full on `data.html`: an NDA first, work inside the client's systems where possible, access the client controls, outside services listed before the build, AI services only on terms that do not train on client data, your copies deleted within 30 days, no naming a client without permission, and notice within 72 hours if data is exposed. Strike any you will not keep. To keep the AI one, do client work only through API or business plans whose terms rule out training, never through a personal or free account. Have a lawyer read the page before you sign your first client.
- There are no testimonials, client logos or results numbers on the site. Add them only when they are real.
- The ten use cases are examples of what you build, and the page says so. Check that each one is something you are willing to sell. When a client agrees to share a real story, add it to `use-cases.html` (there is a `TODO` comment marking the spot).

### 4. Confirm the logo

The mark is a loop with a line leaving it, drawn as inline SVG next to the name in the header and the footer of every page. The same shape is in `assets/favicon.svg` and `assets/logo.svg`. To change the logo, replace it in the header and footer of every page and in those two files.

### 5. Let search engines in

Delete the `<meta name="robots" content="noindex">` line from the `<head>` of `index.html`.

### 6. Keep the website note true

`data.html` ends with a short paragraph on what this website collects: no cookies, no analytics, a form that opens the visitor's own mail app, and fonts loaded from Google Fonts. That is true of the site as built. If you add analytics, a booking widget or a form service, rewrite that paragraph in the same change. It is a plain statement, not a legal privacy policy, so check whether the places you sell in require one.

## Deploy

The site is a folder of static files, so any static host will serve it as is: Vercel, Netlify, Cloudflare Pages or GitHub Pages. Point the host at this folder; there is no build command and the output directory is the folder itself.

## Design reference

| Token | Value | Used for |
|---|---|---|
| `--bg` | `#04050A` | Page background (open space) |
| `--bg-deep` | `#060914` | Inside the ring: the loops and booking sections, footer |
| `--text` | `#F4F6FB` | Headings |
| `--body` | `#B4BDD4` | Body text |
| `--muted` | `#8A95B2` | Small labels, footer |
| `--dim` | `#7C89A8` | The question half of the headline |
| `--blue` | `#4D7CFF` | The ring, lines, glows |
| `--sky` | `#9CC2FF` | Focus rings, status text |
| `--ice` | `#DCEBFF` | Highlights, lit nodes, arrows |
| `--font-display` | Newsreader 500 (Google Fonts) | Headlines |
| `--font` | Geist 400, 500, 600 (Google Fonts) | Everything else |

All tokens live at the top of `css/styles.css` as CSS custom properties.

## Motion

**On load**
- The headline arrives word by word, the mark in the header draws itself, and a beam draws out of the ring to "the way out".

**Always running in the hero**
- Stars sit at three depths and twinkle behind the headline; the brightest have a soft halo and a glint. On wide screens one shoots across the open sky every few seconds.
- A ring of "copy, paste, repeat" turns slowly with lights travelling round it. Each time a light passes the start of the beam, a spark leaves the ring and runs along it.

**Following the scroll**
- Scrolling away from the hero flies into the ring: the headline lifts and fades, the ring grows, the stars lag behind.
- Fast scrolling stretches the stars into short streaks.
- The ring spins faster while the page is moving, then settles. The header mark spins too and comes to rest upright. Further down, the loop icons and the lights on each horizon speed up in the same way.
- In "How we backsolve", a light runs along the line as you scroll and each step lights as it arrives.
- Every section headline lights up word by word as it rises up the screen, then stays lit.
- Sections fade and rise as they enter the screen, lists reveal item by item, and the ticks in the audit list draw themselves.
- A progress bar at the top fills as the page scrolls, and the header link for the section on screen is highlighted.

**Following the pointer**
- A soft light and the stars shift with the pointer across the hero, nearer stars more than far ones. Stars near the pointer link up into a small constellation.
- The main buttons lean toward the pointer. Cards tilt toward it and a highlight follows it.
- A light follows the pointer round the edge of each panel, service, use case and the booking form, and along the rule above each row in the reasons and the questions.
- The glow behind the team words leans toward the pointer.
- Hovering the name in the header fires the line out of the loop again.

**Inner pages**
- Each page opens with the same stars and word-by-word headline.
- On Use cases, the filter brings the matching examples in one after another, and the arrow from "The loop today" to "The way out" draws as each row arrives.
- On Services, the summary of each service stays in view while its details scroll past.
- On How it works, the line across the three steps runs once on its own when the page opens.
- On small screens the menu button opens and closes the links panel.

**The loop calculator**
- On the home page, the visitor sets how many people do a task, how long it takes and how often. A ring fills to show how much of one person's working year that is, the hours count up to the new figure, and a button carries the numbers into the booking form.

**Always running further down the page**
- Lights travel along the horizon above the booking form, and along the same horizon at the top of every inner page.
- Once the three steps in "How we backsolve" are lit, a light runs along the line again every few seconds.
- The bright line on top of each panel drifts along its edge.

**Small touches**
- The light on each loop card keeps circling, with a short tail behind it.
- In "After the audit", the highlight steps through Audit, Build sprints and Next projects. As each box takes it, a light crosses its top edge and the arrow to the next box redraws.
- Answers in the questions section open and close smoothly.
- The horizon above the booking form brightens while someone is typing in it.

Everything that draws per frame shares one `requestAnimationFrame` loop and stops when it is off screen. All motion is switched off for visitors who have asked their device to reduce motion, and the page is fully readable with JavaScript disabled.
