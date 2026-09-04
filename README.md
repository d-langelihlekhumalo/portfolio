# Andile Khumalo — Portfolio

A modern, professional personal portfolio website for a full-stack developer specializing in .NET and React.

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Deployment**: Cloudflare Pages

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Starts the dev server at `http://localhost:5173`

### Build

```bash
npm run build
```

Builds for production to the `dist` folder.

### Preview

```bash
npm run preview
```

Preview the production build locally.

## Configuration

The public site origin (used for `canonical` / Open Graph URLs and structured data) is
read from `VITE_SITE_URL` at build time.

- Default: committed `.env` → `https://andilekhumalo.pages.dev` (used by `dev` and `build`)
- Production override: set `VITE_SITE_URL` in the Cloudflare Pages project
  (Settings → Environment variables) — Vite gives real env vars precedence over `.env`
- Local override: `.env.local` (git-ignored)

When a custom domain goes live, update `.env` **and** the domain strings in
`public/robots.txt` and `public/sitemap.xml`.

## Deployment (Cloudflare Pages)

Build output: `dist/` · Build command: `npm run build` · Node: 20+

`public/_headers` (security + asset caching), `public/_redirects` (SPA fallback) and
`wrangler.jsonc` (project name → `*.pages.dev` subdomain) are committed and picked up
automatically.

### Option A — Git integration (recommended)

1. Push this repo to GitHub.
2. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Framework preset: **Vite**. Build command `npm run build`, output directory `dist`.
4. Add environment variable `VITE_SITE_URL`.
5. Every push to the default branch deploys; pull requests get preview URLs.

### Option B — Wrangler CLI (fastest first deploy)

```bash
npm run deploy        # runs the build, then: wrangler pages deploy dist
```

First run opens a browser to authorize Wrangler with your Cloudflare account and
creates the Pages project named in `wrangler.jsonc`.

### Custom domain

Cloudflare dashboard → the Pages project → **Custom domains** → add the domain.
Registering it through **Cloudflare Registrar** wires DNS and SSL automatically.

## Project Structure

```
src/
├── components/        # Reusable components
├── sections/         # Page sections (Hero, About, etc.)
├── App.tsx          # Main application component
├── main.tsx         # React entry point
└── index.css        # Global styles with Tailwind
```

## Design Principles

- Minimal and elegant
- Fast and performant
- Accessible and responsive
- Professional and trustworthy
- No unnecessary animations or effects

## License

The code in this repository is licensed under the [MIT License](LICENSE) —
feel free to learn from it, fork it, or reuse the components.

This does **not** extend to the personal content it renders (name, bio,
work history, project write-ups, and other identifying details in
`src/constants/portfolio.ts` and elsewhere) — that stays all rights reserved.
