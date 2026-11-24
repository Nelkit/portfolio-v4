# Nelkit Chavez — Portfolio & Blog

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=flat&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Turso](https://img.shields.io/badge/Turso_%28libSQL%29-4FF8D2?style=flat&logo=turso&logoColor=black)
![Drizzle](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=flat&logo=drizzle&logoColor=black)
![Cloudflare R2](https://img.shields.io/badge/Cloudflare_R2-F38020?style=flat&logo=cloudflare&logoColor=white)
![Vercel AI SDK](https://img.shields.io/badge/Vercel_AI_SDK_v6-000000?style=flat&logo=vercel&logoColor=white)
![OpenRouter](https://img.shields.io/badge/OpenRouter-6566F1?style=flat&logo=openai&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=flat&logo=vitest&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed_on_Vercel-000000?style=flat&logo=vercel&logoColor=white)

Bilingual (English / Spanish) personal portfolio and blog with a **self-built admin dashboard** that replaced Strapi. Every piece of content — hero, profile, projects, skills, career, education and blog posts — is stored in Turso (libSQL), edited from `/admin` in both languages, and served from a cache that is invalidated on save. Media lives in Cloudflare R2. The home page opens with an **AI chat agent** that answers questions about me in real time, grounded in a Notion knowledge base and routed through OpenRouter.

---

## Table of Contents

- [Overview](#-overview)
- [System Architecture](#️-system-architecture)
- [Local Setup](#-local-setup)
- [Environment Variables](#-environment-variables)
- [Testing](#-testing)
- [AI Chat Agent](#-ai-chat-agent)
- [Scripts](#-scripts)
- [Deployment](#️-deployment)
- [Known Limitations](#️-known-limitations)

---

## 🧭 Overview

- **Scope:** public portfolio + blog (`/en`, `/es`) and a single-admin CMS (`/admin`) in one Next.js app.
- **Live demo:** [nelkit.dev](https://nelkit.dev)

A visitor lands on `/` and is redirected to `/en` or `/es` (their saved choice, then their browser language, then English). The home page shows the AI chat hero, projects filterable by expertise area, the tech stack, career and education timelines, and recent posts; `/projects` and `/blog` list the full collections, and the blog can be filtered by tag. The owner signs in at `/admin/login` with a password, edits any section in both languages, uploads images to R2, and saves blog posts as drafts until they are ready. Each save invalidates only the affected cache tag, so the public site updates without a redeploy.

---

## 🏗️ System Architecture

```text
                    ┌──────────────────────── Next.js 16 on Vercel ────────────────────────┐
 Visitor ──────────►│ proxy.ts ── locale redirect ──► app/[locale]/…  (home, projects, blog)│
                    │                                         │                            │
                    │                                         ▼  cachedRead() + cache tags │
                    │                                  ┌──────────────┐                    │
 Admin ────────────►│ proxy.ts ── session check ──►    │ app/lib/     │                    │
   /admin/login     │ app/admin/* (Server Actions) ───►│  content/*   │  service           │
                    │        │  updateTag() on save    │  ├ repository│  (port)            │
                    │        │                         │  └ turso-*   │  (adapter)         │
                    │        ▼                         └──────┬───────┘                    │
                    │  app/lib/storage ──┐                    │ Drizzle ORM                │
                    │                    │                    ▼                            │
                    │  /api/chat ──┐     │             ┌─────────────┐                     │
                    │              │     │             │ Turso       │◄── /api/cron/daily  │
                    │  /api/cron/daily ──┼────────────►│ (libSQL)    │    keep-alive +     │
                    └──────────────┼─────┼─────────────└─────────────┘    JSON backup ─────┘
                                   │     │
                     ┌─────────────┘     └──────────────┐
                     ▼                                  ▼
           ┌──────────────────┐               ┌───────────────────────────┐
           │ OpenRouter (LLM) │               │ Cloudflare R2             │
           │ Notion (KB)      │               │  public media bucket      │
           └──────────────────┘               │  private backup bucket    │
                                              └───────────────────────────┘
```

| Layer | Where | Notes |
| --- | --- | --- |
| Routing & auth guard | `proxy.ts` | Redirects locale-less URLs; blocks `/admin/*` without a valid session (pages and actions re-check with `requireAdmin()`). |
| Public site | `app/[locale]/` | Server Components, `revalidate` of one week as a safety net; real freshness comes from cache tags. |
| Admin | `app/admin/` | Hero, profile, projects, areas, skills, career, education, blog, tags. Mutations are Server Actions. |
| Content modules | `app/lib/content/<entity>/` | Each entity has a domain model, a repository port, a Turso adapter and a service with cached reads. |
| Database | `app/lib/db/schema.ts`, `drizzle/` | Drizzle schema + SQL migrations. Translatable fields live in `*_translations` tables. |
| Storage | `app/lib/storage/` | R2 via `aws4fetch` when configured; local `public/uploads/` in development. |
| i18n | `app/lib/i18n/` | Locales `en` (default) and `es`; static UI text in `dictionaries/`. |

---

## 🚀 Local Setup

### Before you start

| Requirement | Why |
| --- | --- |
| Node.js **22** (`.nvmrc`) | `engines.node` is `22.x`; Vitest 5 does not run on Node 20. |
| pnpm **10.14.0** via Corepack | `packageManager` is pinned; an older global pnpm fails with `ERR_PNPM_BAD_PM_VERSION`. |
| OpenRouter API key | Only for the AI chat. The rest of the site works without it. |

### Clone the repository

```bash
# SSH
git clone git@github.com:Nelkit/portfolio-v4.git
# HTTPS
git clone https://github.com/Nelkit/portfolio-v4.git

cd portfolio-v4
```

### Step 1 — Select Node and pnpm *(required)*

```bash
nvm use
corepack enable
```

Reads `.nvmrc` and makes `pnpm` resolve to the pinned version.

### Step 2 — Install dependencies *(required)*

```bash
pnpm install
```

### Step 3 — Create `.env.local` *(required)*

```bash
cp .env.example .env.local                 # bash / zsh
Copy-Item .env.example .env.local          # PowerShell
```

The minimum for a local run is the three *Required* values. `TURSO_DATABASE_URL` already defaults to `file:local.db` in the template; generate the other two:

```bash
pnpm admin:hash-password        # prompts for a password (12+ chars), prints ADMIN_PASSWORD_HASH=…
openssl rand -base64 32         # use the output as AUTH_SECRET
```

`file:local.db` is a local SQLite file, so no Turso account is needed for development. See [Environment Variables](#-environment-variables) for everything else.

### Step 4 — Apply the database migrations *(required)*

```bash
pnpm db:migrate
```

Runs the SQL files in `drizzle/` against `TURSO_DATABASE_URL`. After changing `app/lib/db/schema.ts`, generate a new migration with `pnpm db:generate`.

### Step 5 — Start the dev server

```bash
pnpm dev
```

- Public site: [http://localhost:3000](http://localhost:3000) (redirects to `/en` or `/es`)
- Admin: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

The new database starts empty: the public sections render their fallback texts until you add content from the admin. In development, reads are not cached and uploads go to `public/uploads/` unless the `R2_*` variables are set.

---

## 🔐 Environment Variables

All variables are listed in `.env.example`. Copy it to `.env.local` (git-ignored) and fill in what you need:

```bash
cp .env.example .env.local                 # bash / zsh
Copy-Item .env.example .env.local          # PowerShell
```

### Required

| Variable | Used by | Description |
| --- | --- | --- |
| `TURSO_DATABASE_URL` | `app/lib/db/client.ts` | `libsql://…` for Turso, or `file:local.db` locally. |
| `AUTH_SECRET` | `app/lib/auth/session.ts`, `proxy.ts` | HS256 key that signs the 7-day `admin_session` cookie. |
| `ADMIN_PASSWORD_HASH` | `app/admin/actions.ts` | `scrypt:<salt>:<hash>`, generated with `pnpm admin:hash-password`. |

### Required in production

| Variable | Used by | Description |
| --- | --- | --- |
| `TURSO_AUTH_TOKEN` | `app/lib/db/client.ts` | Turso database token (leave empty for a local file). |
| `R2_ACCOUNT_ID` | `app/lib/storage/storage.ts` | Cloudflare account id. |
| `R2_ACCESS_KEY_ID` | `app/lib/storage/storage.ts` | R2 API token key id. |
| `R2_SECRET_ACCESS_KEY` | `app/lib/storage/storage.ts` | R2 API token secret. |
| `R2_BUCKET` | `app/lib/storage/storage.ts` | Public media bucket. |
| `R2_PUBLIC_URL` | `app/lib/storage/storage.ts` | Public domain of the media bucket. |
| `CRON_SECRET` | `app/api/cron/daily/route.ts` | Bearer token Vercel Cron sends; without it the endpoint rejects every call. |

All five `R2_*` values must be set together; in production, uploads fail loudly if they are missing.

### Optional (with defaults)

| Variable | Default | Description |
| --- | --- | --- |
| `R2_JURISDICTION` | default endpoint | `us`, `eu` or `fedramp`. Required if the bucket was created with an explicit jurisdiction. |
| `R2_BACKUP_BUCKET` | backup skipped | **Private** bucket for the daily JSON dump. Must differ from `R2_BUCKET` (backups include drafts). |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | in-memory limiter | Shared login rate limit (5 attempts / 15 min per IP). `KV_REST_API_URL` / `KV_REST_API_TOKEN` from the Vercel integration also work. |
| `OPENROUTER_API_KEY` | empty | Needed for the AI chat. |
| `OPENROUTER_MODEL` | `openai/gpt-oss-120b` | Primary chat model. |
| `OPENROUTER_FALLBACK_MODEL` | `openai/gpt-oss-120b:free` | Used when the primary returns 402 or 429. |
| `NOTION_API_KEY` | — | Notion integration token for the chat knowledge base. |
| `NOTION_PAGE_ID` | — | Page the agent reads. Without it, the chat answers that the knowledge base is unavailable. |
| `NEXT_PUBLIC_GA_ID` | GA disabled | Google Analytics 4 measurement id. |

### Not needed at runtime

| Variable | Description |
| --- | --- |
| `STRAPI_URL` | Only for the one-off Strapi import script (default `http://localhost:1337`). |
| `VERCEL_DEPLOYMENT_ID`, `VERCEL_GIT_COMMIT_SHA` | Set by Vercel; used to isolate the data cache per deployment. |

---

## 🧪 Testing

Unit and repository tests use Vitest in a Node environment (`**/*.test.ts`). Run them with Node 22.

```bash
pnpm test            # single run
pnpm test:watch      # watch mode
pnpm lint            # ESLint
```

Tests sit next to the code they cover: domain validation (`<entity>.test.ts`), Turso repositories (`turso-<entity>-repository.test.ts`), auth (password, session, rate limit), storage, backups, cache and i18n routing.

---

## 🤖 AI Chat Agent

The endpoint is `app/api/chat/route.ts` (`POST`, 30 s max duration). On each request it:

1. Takes the conversation from the client (Vercel AI SDK v6 `UIMessage[]`) and keeps the **last 6 messages**.
2. Reads the Notion page `NOTION_PAGE_ID` (text blocks only), cached in memory for **10 minutes**.
3. Injects it into a system prompt that restricts answers to the knowledge base and to the user's language.
4. Streams the reply from OpenRouter (`maxOutputTokens: 400`) and attaches the model name as message metadata.
5. Retries with `OPENROUTER_FALLBACK_MODEL` if the primary model returns **402** or **429**.

To set up the knowledge base, create an integration at [notion.so/my-integrations](https://www.notion.so/my-integrations), share your profile page with it, and copy the 32-character id from the page URL into `NOTION_PAGE_ID`.

---

## 🔄 Scripts

### Admin password

```bash
pnpm admin:hash-password
```

Prompts for a password (minimum 12 characters) and prints the `ADMIN_PASSWORD_HASH` line. The format mirrors `app/lib/auth/password.ts`.

### Database migrations

```bash
pnpm db:generate     # schema.ts → new SQL file in drizzle/
pnpm db:migrate      # apply pending migrations to TURSO_DATABASE_URL
```

Migrations are manual: run them against production **before** deploying code that needs them.

### One-off Strapi import (`scripts/import-strapi/`)

Used once to move the old Strapi content into Turso and R2. Kept for reference; it needs a running Strapi instance and runs with `tsx` (a dev dependency).

```bash
# Strapi → scripts/import-strapi/data/strapi.json + content-en.json (read-only on Strapi)
pnpm tsx scripts/import-strapi/extract.ts http://localhost:1337
# translate content-en.json into content-es.json, then:
pnpm tsx scripts/import-strapi/import.ts            # dry run: prints the plan
pnpm tsx scripts/import-strapi/import.ts --confirm  # WIPES the content tables and imports
```

`scripts/import-strapi/data/` is git-ignored (it holds personal data).

---

## ☁️ Deployment

The app is deployed on **Vercel**.

1. Set the [required and production variables](#-environment-variables) in Vercel → Settings → Environment Variables (`R2_JURISDICTION` too, if the bucket has one).
2. Run `pnpm db:migrate` against the production `TURSO_DATABASE_URL` when a release adds migrations.
3. Vercel Cron (`vercel.json`) calls `GET /api/cron/daily` at **04:00 UTC**. The job reads every table, which keeps the Turso Free database from being archived for inactivity, and writes `backups/YYYY-MM-DD.json` to `R2_BACKUP_BUCKET` when configured.

Server Action bodies are capped at **4 MB** (`next.config.ts`) to stay under Vercel's 4.5 MB request limit; each image is uploaded in its own request.

---

## ⚠️ Known Limitations

- **Manual migrations.** `pnpm db:migrate` is not part of the deploy; forgetting it breaks the new code.
- **No rate limit on the chat.** Only the admin login is rate-limited; `/api/chat` is open.
- **Chat does not know the page language.** It answers in the language the visitor writes in, not the one the page is shown in.
- **Ephemeral chat history.** Conversations live only in the browser tab.
- **Soft 404s.** Unknown project or post slugs return HTTP 200 and render the 404 on the client, because the route's `loading.tsx` streams first.
- **No redirects on slug changes.** Renaming a project or post breaks its previous URL.
- **Drafts are per post, not per language.** Both translations are published together.
- **No in-site draft preview.** Drafts are reviewed in the editor's live preview.
