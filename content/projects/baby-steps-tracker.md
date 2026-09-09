---
title: "Baby Steps Tracker"
slug: "baby-steps-tracker"
summary: "A personal-finance planner that runs Dave Ramsey's 7 Baby Steps entirely in the browser — no accounts, no backend, nothing leaves the device."
tech:
  - "React 19"
  - "TypeScript"
  - "Vite 7"
  - "Tailwind CSS 4"
  - "Radix UI"
  - "Zustand"
  - "Zod"
  - "Cloudflare Workers"
  - "Vitest"
repoUrl: "https://github.com/d-langelihlekhumalo/baby-steps-tracker"
liveUrl: "https://baby-steps-tracker.d-langelihlekhumalo.workers.dev"
status: "Live"
year: "2026"
---

You enter your income, bills, debts, and goals. It works out which of the
seven Baby Steps you're on, projects your debt-free date, compresses the
month-by-month simulation into a readable payment plan, and tells you whether
your goals actually fit your budget.

It started as a rewrite of an earlier Streamlit version, but the rewrite
changed the shape of the thing rather than just the framework.

## The design decision that shaped everything: no backend

The original app had a name-only "profile" switcher — no password. Fine on
one machine; not fine on a public URL, where a stranger could type a guessed
name and land on someone else's real income and debt figures.

Rather than port that and bolt on auth, this version has no server-side
persistence at all. Every calculation runs in the browser. State autosaves to
`localStorage` so a reload doesn't wipe your form, and you can export an
encrypted JSON backup (WebCrypto, PBKDF2 + AES-GCM) before switching devices.
There is no other copy anywhere, by design. Cross-device sync would mean real
accounts — a deliberate, scoped decision, not a default to slide into.

The Cloudflare Worker exists only to serve the static build and handle
SPA-fallback routing. It's kept as a real Worker rather than an assets-only
deploy so a future server-side feature has somewhere to go without
restructuring.

## The engine

`src/lib/engine/` is pure: no React, no store, no storage, no `Date.now()`.
Time is passed in as a `now: Date`; ids come from callers. That constraint is
lint-enforced — the engine physically can't reach for a browser global — which
made it trivial to test and would make it portable to a Worker later.

A few things it gets right that a naive version wouldn't:

- **Money is integer cents.** Interest is banker's-rounded to the cent each
  month before it's posted; intermediate values inside a single calculation
  are never rounded.
- **The budget waterfall** is explicit: income → bills and debt minimums →
  goal commitments → a small monthly buffer → emergency-fund refill (only if
  it's below the Baby Step 1 target) → whatever's left goes to the debt
  attack.
- **The payoff simulation** rolls each freed-up minimum into the next target
  debt as debts clear (snowball or avalanche), and models the emergency-fund
  refill as a *paused* attack phase rather than pretending the fund never
  gets touched.
- **Domain rules are specified with worked examples.** Every rule in the
  domain doc carries at least two independently hand-computed cases, checked
  by hand rather than against the implementation's own tests.

## Structure and discipline

Zod schemas are the source of truth for every persisted type, with a
migration path for stored state. State changes go through a Zustand store with
an undo/redo command stack. Routes are lazy-loaded, each with its own error
boundary. Architecture decisions are recorded as ADRs so the *why* survives.

## Testing and CI gates

`npm run verify` runs before every deploy and on every pull request:
typecheck, lint, 400+ Vitest tests with coverage (a ~95% line floor on the
engine specifically), a production build, then five post-build gates:

- **self-host** — fails if the built client would make any third-party
  request
- **PWA** — manifest and offline service worker present and valid
- **bundle budget** — initial route ≤ 250 kB gzipped (it's ~120)
- **contrast audit** — every required colour pair in the token palette
  checked against WCAG AA, across light, OS-dark, and toggle-dark
- an **axe accessibility sweep** over every route in both seeded and empty
  states, plus a `prefers-reduced-motion` catch-all

## Charts, and imports

Four chart types — cashflow by category, goal progress, the payoff
projection, and total-debt-vs-emergency-fund over time — are hand-rolled SVG.
No charting library: fixed categorical colour order, direct value labels, a
hover crosshair on the line and area charts.

Payslip PDFs (`pdf.js`) and bank CSVs (Papa Parse) can be imported instead of
typed. Both parsers are lazy-loaded so they never touch the initial bundle.

## Stack

React 19, TypeScript, Vite 7, Tailwind CSS 4, Radix UI primitives, Zustand,
Zod. Deployed as a single Cloudflare Worker via GitHub Actions — the workflow
runs the full `verify` gate, then `wrangler deploy`.

## What's next

The Worker is deliberately left as a real (currently empty) Hono app so an
"explain my plan" feature — composing the full financial context and asking a
question — has a home without reworking the deploy. Cross-device sync stays
off the table unless it's done properly, with real accounts.
