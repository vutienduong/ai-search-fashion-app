# Chromatique

<img width="698" height="662" alt="Chromatique UI screenshot" src="https://github.com/user-attachments/assets/ffa17f0b-473a-45ff-bc83-fefddd3512c6" />

Chromatique is a fashion discovery MVP focused on one hard problem: helping users find clothing in the exact color and style they want without getting buried under generic marketplace results.

This repository turns the original product PRD into a working Next.js prototype with:

- color-first search using hex input and a color picker
- product ranking based on Lab color distance (Delta-E style matching)
- style, category, and keyword filters
- mock image upload analysis flow
- curated niche-brand product cards with affiliate preview links
- a responsive editorial-style UI for desktop and mobile

## Why this exists

The product direction comes from 3 user problems:

- users struggle to find clothes in the exact shade they want
- users want help matching an aesthetic like `old_money`, `streetwear`, or `minimalist`
- smaller and niche brands are often hidden behind big marketplaces

Chromatique explores a practical MVP approach where AI enriches data, but the search experience stays fast by relying on deterministic color math and filters at runtime.

## Current MVP scope

Implemented in this repo:

- search by hex code or color picker
- Lab conversion and distance-based ranking
- predefined style filters: `old_money`, `streetwear`, `minimalist`, `sporty`
- category filters and keyword search
- mock upload flow that simulates palette/style/category extraction
- mock product catalog with niche-brand scoring
- affiliate preview links on result cards

Not implemented yet:

- Supabase database
- real product ingestion pipeline
- Gemini-powered image analysis
- AWIN integration
- crawler workers for brand discovery
- authenticated user flows

## Tech stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React

## Getting started

### Requirements

- Node.js 20+ recommended
- npm 10+

### Install

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production build

```bash
npm run build
npm run start
```

### Lint

```bash
npm run lint
```

## Project structure

```text
app/
  globals.css          Global styles and visual theme
  icon.svg             App icon
  layout.tsx           Root layout and metadata
  page.tsx             Home page entry

components/
  FashionDiscoveryApp.tsx   Main interactive discovery experience

data/
  products.ts          Mock product catalog

lib/
  color.ts             Hex normalization, RGB -> Lab, Delta-E style ranking
  types.ts             Product and ranking types
  utils.ts             UI helpers

PRD.md                 Original product requirements document
```

## How matching works today

The current ranking model is intentionally simple and fast:

1. Normalize the user hex color.
2. Convert both query and product colors from RGB to Lab.
3. Compute Euclidean distance in Lab space.
4. Turn that distance into a UI-friendly match score.
5. Sort by match score, then by niche-brand score.

This keeps runtime logic cheap and predictable while leaving room for AI enrichment later.

## Image upload behavior

The upload flow in the current prototype is a seam for future AI integration.

Right now it:

- previews a local image immediately
- simulates extracted palette data
- assigns a mock style/category hint
- updates the active search color from the simulated palette

Later this can be replaced with:

- upload to Supabase Storage
- Gemini analysis for dominant colors, garment type, and style
- query against a real product database

## Next steps / future work

### Backend and data

1. Replace mock `data/products.ts` with Supabase-backed product queries.
2. Add a production-ready schema for `products`, `brands`, and optional image metadata.
3. Store normalized color values as Lab vectors in Postgres or `pgvector`.
4. Add ingestion scripts for curated brands before building a full crawler.

### Search and AI enrichment

1. Add `/api` routes or server actions for color search and image analysis.
2. Integrate Gemini for dominant-color extraction, garment detection, and style tagging.
3. Keep AI as an enrichment layer, not a runtime dependency for ranking.
4. Add offline product auto-tagging so search stays cheap and fast.

### Affiliate and discovery pipeline

1. Replace placeholder affiliate URLs with AWIN tracking links.
2. Add click tracking and outbound attribution events.
3. Build a first-pass crawler pipeline for niche Shopify brands and curated directories.
4. Add a quality/niche scoring workflow so smaller brands surface more consistently.

### Product UX

1. Add a dedicated results route and product detail pages.
2. Introduce price filtering, sorting controls, and saved palettes.
3. Add upload history or recent searches for repeat discovery sessions.
4. Improve empty states, loading states, and analytics instrumentation.

## Notes

- The current UI is intentionally mobile-friendly and designed as a polished prototype rather than a full production system.
- Remote imagery currently comes from Unsplash.
- Product data and affiliate links in this repo are mock/demo content.

## Source product doc

See [`PRD.md`](./PRD.md) for the original product requirements and roadmap.
