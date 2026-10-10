---
title: "Cart Wise"
slug: "cart-wise"
summary: "A grocery price tracker and shopping-list planner for South Africa — offline-first lists and a real price catalogue today, with pamphlet scanning and a cheapest-store recommendation next."
tech:
  - "React"
  - "TypeScript"
  - "Vite"
  - "Hono"
  - "Cloudflare Workers"
  - "D1 + Drizzle"
  - "R2"
  - "Queues"
  - "Durable Objects"
  - "Dexie (IndexedDB)"
repoUrl: "https://github.com/d-langelihlekhumalo/cart-wise"
status: "In development"
year: "2026"
---

The idea: build a shopping list, and find out where it's cheapest — one store,
or a two-store split, once loyalty-card prices and regional pamphlets are
accounted for. South African grocery pricing has enough quirks (member
pricing, bulk staples priced by the kilogram, pamphlets that vary by
franchise) that doing this by hand isn't worth it for a weekly shop.

That's the eventual product. **It isn't built yet, and this case study says so
plainly** — the project is a few milestones in, not finished. What's real
today is the foundation the recommendation engine will sit on: accounts, a
real shopping-list app that works with no signal, and a seeded South African
grocery catalogue.

## What works right now

- **Offline-first shopping lists**, synced across devices. List data lives in
  IndexedDB first; edits queue in an outbox and sync when the connection
  comes back. The checklist groups items by aisle as they're linked to real
  products.
- **A seeded South African grocery catalogue** — chains (including informal
  ones: spaza shops, butcheries), categories in aisle order, product types and
  products, searchable through SQLite FTS5.
- **Store, loyalty-card and manual price setup**, scoped by region, so prices
  can be logged and browsed per store today, ahead of the automated pipeline.
- **An installable PWA** — the app shell and shopping checklist are usable
  offline from a fresh install.

## What's next

- **Pamphlet scanning (M4):** upload a pamphlet photo or PDF, extract prices
  with a vision model, review and publish.
- **The actual recommendation (M5):** cheapest single store vs. a two-store
  split, respecting loyalty cards and a budget. Until this ships, Cart Wise is
  a shopping-list app with a price catalogue, not yet a price comparison tool
  — the app itself says as much in the "Where is this cheapest?" panel.

## The interesting engineering problem: sync that can't disagree with itself

Shared, offline-first state has one hard requirement: two devices editing the
same list, one of them offline, must converge to the same result however the
edits interleave. The sync protocol sends whole rows with per-field
timestamps rather than an operation log — merging is then idempotent, so a
retried push can't double-apply. Conflicts resolve last-write-wins per field,
with deterministic tie-breaks and tombstones for deletes.

The protocol runs in two places: once in JavaScript on the client (so the
offline-first UI can merge locally), and once in SQL inside a single D1 batch
on the server (so a push is one atomic write). A test compares the two
implementations against the same inputs and asserts they produce the same
result — the properties that matter (commutativity, associativity,
idempotence) are checked with randomised property-based tests, not just a
handful of hand-picked cases.

## Stack

React, TypeScript and Vite on a PWA shell (TanStack Query, Dexie for offline
storage), talking to a single Cloudflare Worker: Hono for the API, D1 +
Drizzle for data, R2 for pamphlet images, Queues for the extraction pipeline,
and a Durable Object per shared list for realtime sync. A vision LLM (via AI
Gateway) will do the pamphlet extraction once M4 lands.

## Why it's structured this way

The repo is a pnpm workspace (`apps/web`, `apps/api`, `packages/shared`,
`packages/db`) with the recommendation engine and pricing maths isolated in
`packages/shared`, independent of the API and the UI — the same shape that
made Baby Steps Tracker's engine straightforward to test in isolation.
