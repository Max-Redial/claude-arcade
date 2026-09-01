# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Arcade Vault ("Es una plataforma para jugar online y competir por la mayor cantidad de puntos") — a Spanish-language retro arcade portal where users play games and compete on score leaderboards. The app is a fresh Next.js scaffold (App Router) — real screens/routes have not been built yet; see "Design reference" below for what to build toward.

## Commands

```bash
npm run dev      # start dev server (next dev)
npm run build    # production build
npm run start    # run production build
npm run lint      # eslint (flat config, eslint.config.mjs)
```

No test framework is configured in this repo.

## Architecture

- Next.js 16 App Router, React 19, TypeScript (strict), Tailwind CSS v4 (via `@tailwindcss/postcss`, no `tailwind.config`).
- `app/` holds the App Router tree — currently just the default scaffold (`layout.tsx`, `page.tsx`, `globals.css`).
- Path alias `@/*` maps to the repo root (see `tsconfig.json`).
- Per `AGENTS.md`, this Next.js version may have breaking changes vs. training data — check `node_modules/next/dist/docs/` before relying on remembered Next.js APIs/conventions.

## Design reference (`resources/`)

`resources/resources/templates/` is a **standalone static prototype** (plain HTML + React loaded from a CDN + in-browser Babel — not part of the Next.js app, not wired into the build) that defines the intended product design and data model. Open `resources/resources/templates/Arcade Vault.html` directly in a browser to view it. Treat it as the spec for the real App Router implementation:

- `app.jsx` — hash-based router/root component with routes: `biblioteca` (library/home), `detalle` (game detail), `player` (game player), `auth` (login), `salon` (hall of fame / leaderboard). Auth session and saved scores are persisted to `localStorage` (`av_user`, `av_scores`).
- `nav.jsx`, `biblioteca.jsx`, `detalle.jsx`, `reproductor.jsx`, `auth.jsx`, `salon.jsx` — one component per screen/route above.
- `data.jsx` — mock domain data: `GAMES` (id, title, short/long description, category, cover, color, best score, play count), `CATS` (category filters), `PLAYERS`, and `seededScores()` (deterministic fake leaderboard generator).
- `styles.css` — the neon/CRT visual language (colors, fonts: Press Start 2P, Courier Prime, JetBrains Mono) to carry over into the real app's Tailwind styling.
- `resources/__MACOSX/` is an artifact of unzipping on macOS — noise, not a real part of the design.

## Spec-driven workflow

Per `README.md`, this project follows spec-driven development using `/spec` and `/spec-impl` commands from the `Klerith/fernando-skills` skills package (not yet installed in this repo — install with `npx skills@latest add Klerith/fernando-skills` if those commands are needed).
