# BackSolve AI — website

One-page marketing site for BackSolve AI, in the "Orbit" design. Plain HTML, CSS and JavaScript: no framework, no build step, no dependencies.

> Stuck in a loop? We backsolve the way out.

## Run it locally

Any static file server works. From this folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## What is in here

```
index.html          The page: all sections and copy
css/styles.css      Design tokens (colours, type), layout, components, motion
js/main.js          All animation and behaviour, the form, and CONFIG
assets/favicon.svg  Browser tab icon
assets/logo.svg     The mark on its own (a loop with a line leaving it)
CLAUDE.md           Project notes for Claude Code
```

## Before you launch

### 1. Fill in the placeholders

Everything that is not yet known is written in CAPITALS inside [SQUARE BRACKETS] in `index.html`, usually with a `TODO` comment above it. Search for `[` to find them all.

| Section | What to fill in |
|---|---|
| The Loop Audit | Audit length and price |
| Why BackSolve AI | The tools you work in, and your data promise |
| Questions | Time needed from the client's team, your data policy, your price, the tools you support |
| Footer | Email, LinkedIn and privacy page links |

### 2. Connect the "Book a call" buttons and the form

Open `js/main.js` and set the two values in `CONFIG` at the top:

- `email`: the form opens the visitor's mail app with a pre-filled message to this address. Until it is set, the form shows "This form is not connected yet."
- `bookingUrl` (optional): a Cal.com or Calendly link. If set, every "Book a call" button opens it in a new tab.

There is no server behind the form. If you would rather collect submissions without the visitor's mail app, replace the submit handler with a form service.

### 3. Check every claim

- The team section says the engineers come from Bain & Company and J.P. Morgan. Keep it only if that is true of the people who will do the work.
- There are no testimonials, client logos or results numbers on the page. Add them only when they are real.

### 4. Confirm the logo

The mark is a loop with a line leaving it, drawn as inline SVG next to the name in the header and the footer of `index.html`. The same shape is in `assets/favicon.svg` and `assets/logo.svg`. To change the logo, replace it in those four places.

### 5. Add a privacy page

The form collects a name and an email address, so link a privacy page from the footer before going live.

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
| Typeface | Geist (Google Fonts) | Everything |

All tokens live at the top of `css/styles.css` as CSS custom properties.

## Motion

**On load**
- The headline arrives word by word, the mark in the header draws itself, and a beam draws out of the ring to "the way out".

**Always running in the hero**
- Stars drift and twinkle behind the headline. On wide screens one shoots across the open sky every few seconds.
- A ring of "copy, paste, repeat" turns slowly with lights travelling round it. Each time a light passes the start of the beam, a spark leaves the ring and runs along it.

**Following the scroll**
- Scrolling away from the hero flies into the ring: the headline lifts and fades, the ring grows, the stars lag behind.
- The ring spins faster while the page is moving, then settles. The header mark spins too and comes to rest upright.
- In "How we backsolve", a light runs along the line as you scroll and each step lights as it arrives.
- The team headline lights up word by word.
- Sections fade and rise as they enter the screen, lists reveal item by item, and the ticks in the audit list draw themselves.
- A progress bar at the top fills as the page scrolls, and the header link for the section on screen is highlighted.

**Following the pointer**
- A soft light and the stars shift with the pointer across the hero.
- The main buttons lean toward the pointer. Cards tilt toward it and a highlight follows it.
- Hovering the name in the header fires the line out of the loop again.

**Small touches**
- The dot on each loop card keeps circling.
- In "After the audit", the highlight steps through Audit, Build sprints and Retainer.
- Answers in the questions section open and close smoothly.
- The horizon above the booking form brightens while someone is typing in it.

Everything that draws per frame shares one `requestAnimationFrame` loop and stops when it is off screen. All motion is switched off for visitors who have asked their device to reduce motion, and the page is fully readable with JavaScript disabled.
