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

`public/_headers` (security + asset caching) and `public/_redirects` (SPA fallback)
are committed and picked up automatically. `wrangler.jsonc` names the Pages project
(`andilekhumalo`) so CLI and CI deploys always target the same project.

The build's prerender step (`scripts/prerender.mjs`) needs a real browser (Playwright's
managed Chromium — `npx playwright install chromium`), so **deploys run through GitHub
Actions** ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)) rather than
Cloudflare's own Git-integration builds, which can't guarantee a browser is available in
their build image.

### Continuous deployment — GitHub Actions (this repo's setup)

Push to `main` → deploys to production. Push any other branch or open a PR → its own
Cloudflare Pages preview URL, commented on the PR automatically.

One-time setup, in the Cloudflare dashboard:

1. **My Profile → API Tokens → Create Token** → use the "Edit Cloudflare Workers"
   template (covers Pages) or a custom token with **Account → Cloudflare Pages → Edit**.
2. Copy your **Account ID** (right sidebar of any Workers & Pages page).
3. In the GitHub repo → **Settings → Secrets and variables → Actions**, add:
   - `CLOUDFLARE_API_TOKEN` — the token from step 1
   - `CLOUDFLARE_ACCOUNT_ID` — the ID from step 2
4. The Pages project (`andilekhumalo`) is created automatically on the first successful
   run — no need to create it by hand.

> If a Pages project was previously connected via **Connect to Git** in the dashboard,
> disable its automatic deployments (Settings → Builds & deployments) or the same push
> will trigger two competing deploys. The Action should be the only thing deploying.

### Manual deploy (Wrangler CLI)

```bash
npm run deploy        # runs the build, then: wrangler pages deploy dist
```

Useful for a one-off deploy from your machine; first run opens a browser to authorize
Wrangler with your Cloudflare account.

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
