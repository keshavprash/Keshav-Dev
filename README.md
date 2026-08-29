# Keshav Dev

Professional freelance developer portfolio for **Keshav Prashar** — React.js & MERN Stack
Developer (Jaipur, India).

**Live website:** https://keshavprash.github.io/Keshav-Dev/

Built as a hand-written static site — no frameworks, no build step, no dependencies to install.

---

## Features

- Responsive design — verified from 360px to 1920px with no horizontal scrolling
- Dark / light theme that follows the system preference and remembers the choice
- Project case studies — the goal, key features, technical implementation and what each demonstrates
- Project galleries — 17 interface screens with thumbnails, prev/next, keyboard and touch navigation
- Freelance services with starting prices and per-service enquiry CTAs
- Contact inquiry form (name, email, project type, budget, message)
- SEO metadata — canonical URL, Open Graph, Twitter cards and JSON-LD `Person` schema
- Accessibility — skip link, focus management, visible focus rings, reduced-motion support
- GitHub Pages deployment via GitHub Actions

---

## Tech

| Layer | What's used |
| --- | --- |
| Markup | Semantic HTML5, JSON-LD `Person` schema, Open Graph + Twitter cards |
| Styling | One hand-written stylesheet (CSS custom properties, Grid, Flexbox) |
| Behaviour | ~630 lines of vanilla JavaScript — no jQuery, no Bootstrap, no plugins |
| Images | WebP with JPEG fallbacks via `<picture>`, lazy loading below the fold |
| Deployment | GitHub Pages via GitHub Actions (`.github/workflows/static.yml`) |

Nothing is loaded from a CDN except the Inter webfont from Google Fonts.

---

## Project structure

```
Keshav-Dev/
├── index.html                 # The entire site — every section lives here
├── css/
│   └── style.css              # Single stylesheet (tokens → base → components → responsive → modal)
├── js/
│   └── main.js                # Theme, nav, scroll-spy, reveals, counters, project modal, contact form
├── images/
│   ├── kp.png                 # Logo / favicon
│   ├── keshav-portrait.webp   # Hero portrait (+ .jpg fallback)
│   ├── keshav-about.webp      # About photo (+ .jpg fallback)
│   ├── og-cover.jpg           # Social share card (1200×630, baseline JPEG)
│   ├── skills/                # Tech-stack icons (React, Node, MongoDB, …)
│   └── projects/              # Project visuals — 1600×1000, WebP + JPEG fallback
│       ├── ai-interview/      # 7 screens: dashboard, ats-analysis, mock-interview,
│       │                      #   feedback-report, coding-assessment, analytics, admin
│       ├── employee-task/     # 5 screens: dashboard, employees, tasks, task-details, employee
│       ├── space-shooter/     # 3 screens: game, start-screen, leaderboard
│       └── portfolio/         # 2 screens: portfolio-preview, portfolio-work
├── .github/workflows/static.yml
├── .nojekyll
└── README.md
```

### Page sections

Navbar → Hero → Trust stats → Services ("What I can build for you", with pricing) →
Featured projects (image-led cards + case-study modal) → Why work with me →
Tech stack → Experience, education & certifications → About → How I work → Freelance CTA →
Contact → Footer.

Each project has **17 interface screens** between them, so a visitor can open any project and
step through what it actually does rather than reading a feature list.

---

## Project visuals

Every project card leads with a large 1600×1000 image, and **View Project** opens a case-study
modal: a gallery of that project's screens, then **The goal**, **Key features**,
**Technical implementation**, **What it demonstrates**, the technology stack and the links.

| Project | Screens |
| --- | --- |
| AI Interview Preparation Platform | 7 — candidate dashboard, resume ATS analysis, AI mock interview, AI feedback report, coding assessment, performance analytics, admin console |
| Employee Task Management System | 5 — admin dashboard, employee management, task management, task details & work log, employee workspace |
| Space Shooter (MERN) | 3 — gameplay, start screen & controls, leaderboard |
| This portfolio | 2 — hero & stats, featured work |

Two kinds of image are used, and the site labels them honestly:

| Badge | Meaning |
| --- | --- |
| **UI preview** | An interface mockup built from that project's own feature set and source code. Not a screenshot of a hosted deployment — those three projects run locally and are not deployed publicly. |
| **Screenshot** | An actual screenshot of this portfolio, captured at 1600×1000. |

A note under the projects grid (`.media-note` in `index.html`) says the same thing to visitors, and
each modal repeats it in `#pm-disclaimer`. Keep that wording accurate if the images ever change.

### Social preview card

`images/og-cover.jpg` is the 1200×630 card shown when the site is shared on WhatsApp, LinkedIn,
Facebook, X or Slack. It is built from the site's own dark palette, Inter type and accent, and is
referenced by `og:image` and `twitter:image` with absolute `https://keshavprash.github.io/...` URLs
(social scrapers cannot resolve relative paths). It is a baseline 4:2:0 JPEG — not WebP — because
several scrapers still do not decode WebP.

**After deploying a new cover, social platforms keep the old one cached.** Force a re-scrape at
<https://developers.facebook.com/tools/debug/> and <https://www.linkedin.com/post-inspector/>.

### Adding or replacing a project image

1. Drop a 1600×1000 image into `images/projects/<project>/` as **both** `name.webp` and `name.jpg`.
2. Add it to that project's `shots` array in `js/main.js` — `['file-basename', 'Short label', 'Caption sentence.']`
   (the file basename is used for both the `.webp` and the `.jpg`). The gallery counter, arrows and
   thumbnails all derive from that array, so nothing else needs updating.
3. If it is the card image, update the `<picture>` inside that card's `.project-media` in `index.html`
   and the `N screens` count in `.media-hint`.

---

## Run it locally

No build step and no `npm install`. Either:

**Open the file directly**

```bash
start index.html         # Windows
open index.html          # macOS
```

**Or serve it (recommended — matches how GitHub Pages serves it):**

```bash
# Python 3
python -m http.server 8000

# or Node
npx serve .
```

Then visit <http://localhost:8000>.

---

## Deploy to GitHub Pages

The repository already contains `.github/workflows/static.yml`, which publishes the repo
root on every push to `main`.

1. Push to `main`:
   ```bash
   git add .
   git commit -m "Upgrade portfolio"
   git push origin main
   ```
2. In the repository: **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. The Actions tab will show the deploy; the site goes live at
   `https://keshavprash.github.io/Keshav-Dev/`.

All asset paths are **relative** (`css/style.css`, `images/projects/...`), so the site works from a
sub-path such as `/Keshav-Dev/` as well as from a custom domain. `.nojekyll` stops
GitHub from running Jekyll over the files. There is no client-side router, so no 404 fallback or
`basename` configuration is needed.

### Using a custom domain later

Add a `CNAME` file containing the domain, point the DNS at GitHub Pages, then update the
absolute URLs in `index.html`: `link[rel=canonical]`, `og:image`, `og:url`, `twitter:image`
and the JSON-LD `url` / `image` fields.

---

## Editing the content

Everything is in `index.html`, in the order it appears on the page. The most common edits:

| To change | Look for |
| --- | --- |
| Hero headline / rotating words | `<section class="hero">`, `data-rotate` attribute |
| Trust stats | `<ul class="stats-strip">` — the numbers are in `data-count` |
| Services & pricing | `<section id="services">` — each `.service-card` has a `.price` block |
| Project cards | `<section id="work">` — one `<article class="project">` per project |
| Project modal content | `PROJECTS` object at the top of the project-modal block in `js/main.js` |
| Tech stack | `<section id="skills">` |
| Experience / education / certifications | `<section id="experience">` |
| About copy | `<section id="about">` |
| Process steps | `<section id="process">` |
| Contact details & form | `<section id="contact">` |
| CV link | the **Download CV** button in the About section |

Colours, spacing, radii and fonts are all CSS custom properties at the top of
`css/style.css` (`:root` for dark, `html[data-theme="light"]` for light).

### Adding a project

Copy an existing `<article class="project">` block, then replace the title, summary,
`.project-points`, `.tags`, the `.project-media` image and the GitHub link. Give the card a new
`data-open-project="my-project"` value on both the media button and the **View Project** button,
then add a matching entry to the `PROJECTS` object in `js/main.js`.

A project that is actually deployed gets a `live:` URL in its `PROJECTS` entry — the modal then
renders a **Visit Live Site** button above **View Source**. Leave `live` out when there is no
public deployment.

---

## The project modal

`js/main.js` holds a `PROJECTS` object keyed by the `data-open-project` value on each card. Each
entry supplies the kicker, title, lead, the `goal` / `features` / `implementation` / `demonstrates`
case-study blocks, technology tags, the GitHub link, an optional live URL, the image disclaimer and
the gallery `shots`.

The modal itself:

- opens from the card image or the **View Project** button, and returns focus to whatever opened it;
- traps <kbd>Tab</kbd> inside the dialog and closes on <kbd>Esc</kbd> or a backdrop click;
- moves between gallery screens with the on-image previous/next arrows, <kbd>←</kbd> / <kbd>→</kbd>,
  a horizontal swipe on touch, or the thumbnail strip — with a `3 / 7` counter on the image;
- scrolls the active thumbnail into view inside the strip only, never the page;
- locks background scrolling via `body.pm-open` while it is open.

All of its content is written with `textContent` / `createElement`, so nothing is injected as HTML.

---

## The contact form

The form has no backend. On submit it builds a pre-filled `mailto:` message
(name, email, project type, budget, details) and opens the visitor's mail app. The
WhatsApp button next to it is usually the faster route for clients.

To switch to a hosted form service instead (so submissions arrive without the visitor
having a mail client set up):

1. Sign up at [Formspree](https://formspree.io) or [Web3Forms](https://web3forms.com) and get an endpoint.
2. In `index.html`, add `action="https://formspree.io/f/YOUR_ID" method="POST"` to `<form id="quote-form">`.
3. In `js/main.js`, delete the `form.addEventListener('submit', …)` block so the browser posts the form normally.

---

## Accessibility & performance notes

- Skip link into a focusable `<main tabindex="-1">`, semantic landmarks and a single `<h1>`.
- All interactive elements are real `<a>` / `<button>` elements and are keyboard reachable; focus rings are visible.
- Decorative SVGs and images are `aria-hidden` / have empty `alt`; project images carry descriptive alt text.
- The project modal is a labelled `role="dialog"` with focus trapping, focus restore and `Esc` to close.
- Gallery thumbnails are plain buttons in a labelled `role="group"`, marking the shown screen with
  `aria-current` — deliberately not the tab pattern, since there is no tabpanel to control.
- The theme toggle carries a changing action label and no `aria-pressed`, so state and label cannot disagree.
- `prefers-reduced-motion` disables reveal animations, the typing effect, smooth scrolling and the modal transitions.
- `prefers-color-scheme` picks the initial theme; the toggle stores the choice in `localStorage`.
- Scroll-spy and reveal animations use `IntersectionObserver` rather than scroll handlers.
- Project images are `loading="lazy"` with explicit `width`/`height`, so nothing shifts as they load.

Printing and Save-as-PDF force the scroll-reveal blocks visible, so no section prints blank.

Verified in headless Chrome over a local HTTP server (the way GitHub Pages serves it) at 360, 390,
768, 1280, 1440 and 1920 px wide: no horizontal scrolling, no broken images, no dangling links and no
console errors. Every project modal is opened and its gallery stepped with the arrows, the keyboard
and the thumbnails; the counter, `Esc`, backdrop close and focus restore are asserted; all 34 gallery
assets are checked to decode at 1600×1000; the mobile gallery is checked to scroll inside itself while
the page does not; and the theme toggle and contact-form wiring are asserted.

---

© Keshav Prashar. Content and photographs are personal; the code is free to learn from.
