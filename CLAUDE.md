# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start dev server (Turbopack)
npm run build         # production build
npm run start         # run production build
npm run types:check   # fumadocs-mdx generate + next typegen + tsc --noEmit
```

There is no test suite and no lint script configured in this repo. Use `npm run types:check` (or `npx tsc --noEmit`) as the correctness gate after changes. `postinstall` runs `fumadocs-mdx` automatically to regenerate the `.source/` collection — re-run it manually (`npx fumadocs-mdx`) if generated types under `.source/` look stale.

## Frontend work goes through the `frontend` agent

Any change touching `app/`, `components/`, or `app/global.css` (new UI, component edits, layout/styling changes, installing shadcn/shadcnblocks components) should be delegated to the **`frontend` subagent** (`.claude/agents/frontend.md`) rather than done ad hoc. That agent is scoped to this project's shadcn/Tailwind conventions and is required to consult the `frontend-design` skill before producing UI.

## Architecture

This is a [Fumadocs](https://fumadocs.dev) documentation site on Next.js (App Router), with an AI chat assistant bolted on. Three things make the structure non-obvious from file names alone:

**Content pipeline**: `content/docs/*.mdx` is the source of truth. `source.config.ts` defines the fumadocs-mdx collection schema; `fumadocs-mdx` (run via `postinstall` / `types:check`) compiles it into the generated `.source/` directory. `lib/source.ts` wraps that generated collection with `loader()` from `fumadocs-core/source`, and exposes `source` plus helpers (`getPageImage`, `getPageMarkdownUrl`, `getLLMText`) used by routes that need page metadata or raw text (OG image generation, `/llms.txt`, per-page markdown).

**Markdown-negotiation proxy**: `proxy.ts` (Next.js middleware-equivalent) intercepts requests under the docs route and rewrites them to a content route serving raw `content.md` when either the URL has a `.md` suffix or the request's `Accept` header prefers markdown (`isMarkdownPreferred` from `fumadocs-core/negotiation`). This lets the same `/docs/...` URL serve HTML to browsers and Markdown to bots/LLM clients without separate routing logic in page code.

**AI search/chat**: `app/api/chat/route.ts` builds an in-memory `flexsearch` `Document` index from all doc pages at module load (`createSearchServer`), then exposes it to an OpenRouter-backed `streamText` call (via `@ai-sdk/react` / `ai`) as a `search` tool the model can call before answering. `components/ai/search.tsx` defines the matching `ChatUIMessage` / `SearchTool` types and the client-side chat UI. Route layout: `app/(home)` is the marketing/landing route group, `app/docs/[[...slug]]` renders doc pages via `source`, `app/api/search` is the static fumadocs search endpoint (separate from the AI chat's own search tool), `app/og/docs` generates OG images, and `app/llms.txt` / `app/llms-full.txt` / `app/llms.mdx` expose machine-readable docs output.

### Styling system (Tailwind v4, no `tailwind.config.ts`)

Theme tokens live entirely in `app/global.css` (`@theme inline`, `:root`, `.dark`). Two token/component systems intentionally coexist — do not collapse them:

- **fumadocs-native**: `--fd-*` CSS variables, consumed by `components/ui/button.tsx` (the original button, `variant`/`color` props) and anything wired into fumadocs' own layout/theme (e.g. `components/ai/search.tsx`).
- **shadcn/ui**: plain tokens (`--primary`, `--background`, etc.) installed via `npx shadcn`, consumed by `components/ui/shadcn-button.tsx` (`variant`/`size` props, Base UI primitive) and shadcn/shadcnblocks-sourced components (e.g. `components/hero7.tsx`).

Correspondingly there are two `cn` helpers: `lib/utils.ts` (`clsx` + `tailwind-merge`, the shadcn-standard one — use this for new shadcn components) and `lib/cn.ts` (re-exports from `cnfast`, used by pre-existing fumadocs-oriented code).

`components.json` has two registries configured: `@shadcn` (default) and `@shadcnblocks` (`https://shadcnblocks.com/r/{name}.json`). Install shadcnblocks blocks with `npx shadcn add @shadcnblocks/<block-name>`. When a new block's registry dependencies would overwrite `components/ui/button.tsx`, redirect its import to `shadcn-button.tsx` instead — never let a block install clobber the fumadocs button.
