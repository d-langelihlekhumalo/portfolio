# CLAUDE.md

## Project Overview

This is the portfolio site for Andile Khumalo, a full-stack developer (React/TypeScript + .NET) based in Cape Town, employed full-time at Advania SA.

The site's job is to make the case with evidence, not adjectives: **Baby Steps Tracker** (a live app with 400+ tests, a CI gate, and a real bundle budget) and **Cart Wise** (an in-development offline-first PWA) do the talking. Positioning, services and copy are all downstream of what those two projects actually demonstrate.

The site must quickly answer:

1. Who is this?
2. What do they build?
3. Why should someone trust them?
4. How do I reach them?

---

## Honesty rules (non-negotiable)

- Never invent experience, clients, testimonials, metrics, or job titles.
- Every number on the site (test counts, coverage, bundle size, etc.) must come from a real, re-checked source — a repo's CI output, not a remembered or assumed figure. Numbers drift; re-verify before reusing one.
- If a project isn't finished, say so, and say what *is* real. Cart Wise's case study and project-row copy are the model for this: it names exactly what works today and what's still a milestone away, rather than describing the whole product as if it already exists.
- If you can't verify a claim, leave it out rather than soften it into something technically-true-but-misleading.

## Employer-overlap boundary

Andile is employed full-time; his contract requires written consent before he takes on outside work. Two things follow from this:

1. **`AVAILABILITY_MODE`** (`src/constants/portfolio.ts`) is a single switch between `'open'` (neutral — "open to a small number of projects") and `'freelance'` (explicit freelance/contract wording). It currently reads `'open'` with a `// TODO(andile): flip after written consent` comment. Every piece of availability-dependent copy (status line, `<title>`, meta description, JSON-LD, the contact subheading, the blog index description) reads from this one constant — see `AVAILABILITY_COPY` in the same file. Don't hand-write availability wording anywhere; add it to that object instead.
2. **Don't position Azure/cloud/DevOps consulting, Microsoft 365, telephony/UC, or "AI automation for businesses" as services.** These overlap with his employer's business. Mentioning the technologies themselves in experience bullets or the tech list is fine (e.g. Azure appears in Experience and in the Tooling group) — *offering* them as freelance services is not.

---

## Design direction

Specific and understated, not a template. Think Stripe / Linear / Vercel — careful, well-tested software from Cape Town, not a six-service agency page.

### Palette — "protea / fynbos"

Defined as CSS custom properties in `src/index.css` (`--paper`, `--ink`, `--muted`, `--protea`, `--fynbos`, `--line`, both light and dark, each checked against WCAG AA). Each also has an RGB-triplet twin (`--paper-rgb`, etc.) purely so Tailwind's colour-opacity modifiers (`bg-primary/10`) work — see the `withOpacity` helper in `tailwind.config.js`. The existing semantic Tailwind keys (`background`, `surface`, `text`, `text-secondary`, `primary`, `success`, `border`) repoint onto these tokens; don't rename those utility classes across the codebase, and don't introduce a colour outside this token table.

`--protea` is the only accent: links, the primary button, focus rings. `--fynbos` is reserved for pass/success state (the build receipt's "CI passed", the "Live" project status) — don't reach for it decoratively.

### Typography

Schibsted Grotesk (variable, self-hosted via `@fontsource-variable/schibsted-grotesk`) for everything. JetBrains Mono (`@fontsource-variable/jetbrains-mono`) appears in exactly two places: the hero's build receipt and blog/case-study code blocks. Nowhere else — don't reach for monospace as a stylistic accent.

Section headings are one consistent size (`text-3xl md:text-4xl` via `SectionWrapper`'s `heading` prop) — don't give an individual section a bespoke heading size.

### Layout

One container everywhere — `max-w-[1120px]`, `px-4 sm:px-6` — defined once in `SectionWrapper` and mirrored by hand in `Navigation.tsx` and `Footer.tsx` (they render outside `SectionWrapper`, so keep those three in sync if the container ever changes). Left-aligned throughout, including the hero on mobile. Prefer whitespace and a `border-border` rule over a card; `Projects.tsx`, `Services.tsx` and `Writing.tsx` all separate rows with `divide-y divide-border` rather than wrapping each item in a `Card`. The build receipt and project screenshots are the only framed/bordered elements.

### Motion

No scroll-triggered reveal anywhere — `SectionWrapper` has no animation logic, and none of the section components use `IntersectionObserver` for a fade-in (the only remaining uses are legitimate non-reveal logic: `ScrollToTop`'s scroll-position toggle and `BlogListPage`'s pagination sentinel — leave both alone). The hero has the one deliberate animated moment: the text fades in, then the build receipt's bundle-budget bar fills once (`index.css`, `.budget-bar`), respecting `prefers-reduced-motion`. Hover states are a colour/opacity change only — no lift, scale, or shadow.

---

## Technology stack

- React 18 + TypeScript + Vite 5, Tailwind CSS 3, React Router 7
- Deployed as a static build + Pages Functions to Cloudflare Pages (`andilekhumalo.pages.dev`)
- Static prerendering via Playwright (`scripts/prerender.mjs`) after `vite build`, so crawlers that don't execute JS still get real content — see the script's own comments before changing the route list or the `js-animations` CSS escape hatch it depends on
- A markdown blog pipeline (`src/blog/`, `scripts/generate-blog-index.mjs`, `content/blog/`) and project case studies (`content/projects/*.md`, loaded by `src/content/projectCaseStudy.ts`)
- A Cloudflare-Access-gated admin panel (`src/pages/admin/`, `functions/api/admin/`) for reviewing AI-drafted blog posts — separate from the rest of the site; don't restyle it as part of a public-site redesign without a specific reason to

## Keep working as-is

Don't touch without a specific reason: the prerender step, the `js-animations` no-JS fallback in `index.css`, `usePageMeta` (per-route meta on client-side navigation), `llms.txt`, `robots.txt`, the admin panel and its gating, and the hidden Testimonials section (kept hidden — no fabricated quotes; see `src/sections/Testimonials.tsx` and the honesty rules above).

---

## Page structure

Nav → Hero → Work → Services → How I work → About (+ Experience + Education) → Tech → Writing → Contact → Footer. Testimonials exists but stays commented out in `HomePage.tsx` until there are real quotes.

### Navigation

Work · Services · How I work · About · Blog, plus a "Start a project" button (desktop header and mobile menu) that scrolls to Contact. Tech, About's Experience/Education and other sub-sections are reachable by scrolling, not by nav item — don't add a nav entry per section.

### Hero

The headline *is* the positioning statement (`POSITIONING.headline` in `src/constants/portfolio.ts`) — there's no separate "name, title" line; the name only appears in the nav logo. The right column (below the text on mobile) is `BuildReceipt.tsx`: a CI-run summary styled like a terminal, using Baby Steps Tracker's real `npm run verify` numbers. **Re-verify those numbers against that repo before changing them** — don't copy a number from here into anywhere else, or vice versa, without re-checking it first.

### Work (`Projects.tsx`)

Each project is a row, not a card: screenshot (real — never a mock-up or generated image) alternating sides on desktop, always first on mobile; plain-text stack line; "Case study / Live / Code" as plain links, no arrow glyph. Project data lives in `PROJECTS` in `src/constants/portfolio.ts`, including a `repos` array (most projects have one GitHub link; Real-Time Task Manager has two — frontend and backend) and an optional `screenshot`.

### Services → "What I can help with"

Three concrete offers, not a service-menu grid: build a first version, make a web app work offline, fix/speed up an existing React app. Each gets a one-sentence description and 2–3 concrete "what you get" bullets. No icons, no "Learn more" links back to #contact.

### How I work

A genuine four-step sequence (scope → weekly staging link → tests/CI from day one → handover), so it's numbered rather than laid out as unordered cards.

### About + Experience + Education (`AboutExperience.tsx`)

One section, two columns on desktop: a single first-person paragraph on the left (no stat tiles, no "core values" list), a compact experience list on the right (role · company · dates, 2–3 bullets, no timeline component), with education collapsed to one line per entry underneath.

### Tech (`TechStack.tsx`)

Plain grouped text — Frontend / Backend / Data / Tooling / AI (`SKILLS` in `src/constants/portfolio.ts`) — no emoji icons, no pill badges.

### Writing

The latest posts from the existing blog index (`src/generated/blog-index.json`), as plain rows linking to `/blog/:slug`, with a link to the full archive at `/blog`. Hides itself if there are no posts yet.

### Contact

The email address is the hero of this section (large type, a copy-to-clipboard button) rather than one item in an icon grid. "Start a project" is a `mailto:` prefilled with a subject and a short body template. States the real response-time expectation. An Upwork link renders only when `PORTFOLIO.social.upwork` is set — don't add a placeholder link.

---

## Content guidelines

Plain, specific, first person. No buzzwords ("passionate", "cutting-edge", "seamless", "robust", "leverage", "comprehensive solutions"). Buttons say what happens ("See the work", "Email me", "Start a project", "Copy") — never append an arrow to button text.

---

## Accessibility & performance

- Visible keyboard focus everywhere (2px protea outline with offset); a skip link is already in place.
- All images have explicit width/height so there's no layout shift; real screenshots only, optimised as AVIF/WebP, lazy-loaded below the fold.
- Must work at 360px wide with no horizontal scroll.
- Both themes must keep passing the contrast pairs in `index.css`'s token comment — don't introduce a colour outside the token table without checking contrast.
- `js-yaml` and the blog/markdown rendering stack must not load on the home route — they're used only by the blog pages and should stay in their own chunk. Verify with a built preview + a network trace if you touch anything that might pull them in.

## Housekeeping scripts

- `npm run og-image` regenerates `public/og-image.png` from `scripts/og-image.html`, pulling copy from `src/constants/portfolio.ts` — rerun it whenever the positioning or `AVAILABILITY_MODE` changes.
- `npm run check-links` requests every external link in the built `dist/` and fails on anything outside 2xx/3xx. Run it after `npm run build` before treating a project-data or content change as done.

---

## AI collaboration

- Explain non-obvious architectural choices rather than just making them.
- Challenge a request that would reintroduce something this document argues against (a new accent colour, a scroll-reveal animation, an unverifiable metric) — don't silently comply.
- Ask before assuming a fact about Andile's experience, employment, or availability that isn't already recorded here or in `src/constants/portfolio.ts`.
- Prioritise maintainability over cleverness; prefer the existing patterns (CSS-var tokens, `SectionWrapper`, the `repos`/`screenshot` shape on `Project`) over inventing a parallel one.

---

## Where this could go next

Real candidates, not commitments: a resume download, project filtering/search on `/blog`, speaking engagements once there are any, real client testimonials (un-hiding `Testimonials.tsx` the day there's a genuine quote to put in it), and a CMS if hand-editing markdown ever becomes the bottleneck. Nothing here should be built speculatively — build it when there's a real instance of it to show.
