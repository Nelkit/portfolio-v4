# Portfolio v4 — Nelkit Chavez

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Strapi](https://img.shields.io/badge/Strapi_v5-4945FF?style=for-the-badge&logo=strapi&logoColor=white)
![Vercel AI SDK](https://img.shields.io/badge/Vercel_AI_SDK_v6-000000?style=for-the-badge&logo=vercel&logoColor=white)
![OpenRouter](https://img.shields.io/badge/OpenRouter-6566F1?style=for-the-badge&logo=openai&logoColor=white)
![Notion](https://img.shields.io/badge/Notion_API-000000?style=for-the-badge&logo=notion&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed_on_Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

Personal portfolio built as a full-stack application. The defining feature is an embedded AI chat agent that answers questions about me in real time, backed by a Notion knowledge base and routed through OpenRouter. All content (projects, blog, career, skills) is managed via a headless CMS (Strapi v5) with no data hardcoded in the frontend.

Live: [nelkit.dev](https://nelkit.dev)

---

## Tech Stack

| Layer              | Technology                                              |
| ------------------ | ------------------------------------------------------- |
| Framework          | Next.js 16 (App Router, React 19, TypeScript 5)         |
| CMS                | Strapi v5 (separate repo, hosted on Strapi Cloud)       |
| AI Chat            | Vercel AI SDK v6 + OpenRouter                           |
| LLM (primary)      | `openai/gpt-oss-120b` via OpenRouter                    |
| LLM (fallback)     | `openai/gpt-oss-120b:free` via OpenRouter               |
| Knowledge base     | Notion API                                              |
| Markdown rendering | `react-markdown`                                        |
| Styling            | Vanilla CSS with custom properties (no UI library)      |
| Deploy             | Vercel                                                  |

---

## Project Structure

```text
app/
├── page.tsx                         # Home page
├── layout.tsx                       # Root layout + global SEO metadata
├── globals.css                      # Full design system (custom properties, all components)
├── api/
│   └── chat/route.ts                # AI chat serverless endpoint
├── blog/
│   ├── page.tsx                     # Blog listing with pagination
│   ├── layout.tsx                   # Blog layout (topbar + footer)
│   └── [slug]/page.tsx              # Blog post detail + dynamic SEO
├── projects/
│   ├── page.tsx                     # Projects listing
│   ├── layout.tsx                   # Projects layout (topbar + footer)
│   └── [slug]/page.tsx              # Project detail + dynamic SEO
├── components/
│   ├── ClientWrapper.tsx            # Root client component — hydrates CMS data into sections
│   ├── MainNav.tsx                  # Floating nav + mobile hamburger drawer
│   ├── icons.tsx                    # All SVG icons as React components
│   └── sections/
│       ├── HeroSection.tsx          # AI chat hero (sidebar + chat panel)
│       ├── ProjectsSection.tsx      # Work grid
│       ├── SkillsSection.tsx        # Tech stack tabs
│       ├── CareerSection.tsx        # Career timeline table
│       ├── EducationSection.tsx     # Education table
│       ├── ContactSection.tsx       # Contact section
│       └── RecentWritingSection.tsx # Blog preview list
├── data/
│   └── content.ts                   # Strapi response transformers + type definitions
└── lib/
    ├── strapi.ts                    # getStrapiData() — fetch wrapper with ISR cache
    └── constant.ts                  # BASE_URL + mediaUrl() helper
```

---

## Running Locally

### Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- A running Strapi instance (see [Backend Setup](#backend-strapi-setup))
- OpenRouter account + API key
- Notion integration + page ID (optional — chat still works without it)

### 1. Clone and install

```bash
git clone https://github.com/nelkit/portfolio-v4
cd portfolio-v4
pnpm install
```

### 2. Configure environment variables

Create a `.env.local` file at the root:

```bash
# Strapi CMS
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337

# AI Chat — OpenRouter
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_MODEL=openai/gpt-oss-120b
OPENROUTER_FALLBACK_MODEL=openai/gpt-oss-120b:free

# AI Chat — Notion knowledge base
NOTION_API_KEY=secret_...
NOTION_PAGE_ID=your-notion-page-id
```

> All secrets must live in environment variables. Nothing is hardcoded.

### 3. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

The app works without Strapi running — sections simply render empty. The chat agent works independently as long as `OPENROUTER_API_KEY` is set.

---

## Backend: Strapi Setup

The CMS is a separate repository. The frontend consumes it via REST API.

### Content Types

| Type               | Kind        | Description                                                   |
| ------------------ | ----------- | ------------------------------------------------------------- |
| `home-page`        | Single type | Hero, resume, social links, all section configs               |
| `projects`         | Collection  | Title, summary, description, tech stack, screenshots, links   |
| `blog-entries`     | Collection  | Title, summary, rich text body, cover image, tags, read time  |
| `career-entries`   | Collection  | Period, title, detail, organization                           |
| `education-entries`| Collection  | Degree, institution, period, status                           |
| `skills`           | Collection  | Title, grouped into skill categories                          |

### Expected API Endpoints

The frontend calls these Strapi endpoints:

```text
GET /api/home-page?populate=...
GET /api/projects?populate=...&sort=createdAt:desc
GET /api/blog-entries?populate=...&sort=publishedDate:desc
GET /api/blog-entries?filters[slug][$eq]=<slug>&populate=...
GET /api/projects?filters[documentId][$eq]=<id>&populate=...
```

### Media URLs

Strapi Cloud returns absolute URLs for uploaded media. The local instance returns relative paths. The `mediaUrl()` helper in `app/lib/constant.ts` handles both cases — no configuration needed.

### CORS

Make sure the Strapi instance allows requests from `http://localhost:3000` (dev) and your production domain.

---

## AI Chat Agent

The chat endpoint lives at `app/api/chat/route.ts`. On each request it:

1. Receives the conversation history from the client (`UIMessage[]` — Vercel AI SDK v6 format)
2. Trims to the last 6 messages to stay within free-tier context limits
3. Fetches the Notion knowledge base (cached in-memory for 10 minutes)
4. Builds a system prompt with the knowledge base injected
5. Streams the response via OpenRouter using `openai/gpt-oss-120b`
6. Falls back to a free model automatically if the primary returns 402 or 429

### Notion Knowledge Base

Create a Notion integration at [notion.so/my-integrations](https://www.notion.so/my-integrations) and share a page with it. That page should contain your full professional profile — skills, experience, projects, contact info. The agent answers questions exclusively from this content.

The `NOTION_PAGE_ID` is the 32-character ID found in the page URL:

```text
https://notion.so/My-Profile-<NOTION_PAGE_ID>
```

---

## Caching Strategy

Content changes infrequently. The caching windows are tuned accordingly:

| Content                | Revalidate | Reason                    |
| ---------------------- | ---------- | ------------------------- |
| Home, Projects         | 24h        | Near-static               |
| Blog list, Blog posts  | 1h         | Published weekly/biweekly |

Both the page-level `revalidate` export and the underlying `fetch()` call use the same window. If Strapi is unavailable during revalidation, **Next.js serves the last cached version** instead of throwing an error — making the portfolio resilient to CMS downtime.

---

## Deployment (Vercel)

1. Connect the repo to Vercel
2. Add all environment variables from the [`.env.local` template](#2-configure-environment-variables) in Vercel → Settings → Environment Variables
3. `NEXT_PUBLIC_STRAPI_URL` must point to your Strapi Cloud URL in production

For `next/image` to load remote images from Strapi Cloud, the domains are already configured in `next.config.ts`:

```typescript
remotePatterns: [
  { protocol: 'https', hostname: '*.strapiapp.com' },
  { protocol: 'https', hostname: '*.media.strapiapp.com' },
]
```

---

## Known Limitations

- **No rate limiting on the chat endpoint** — planned with Upstash Redis (`@upstash/ratelimit` is already installed as a dependency)
- **No Strapi webhook** — new content appears after the revalidation window expires (up to 1h for blog). A webhook calling `/api/revalidate` would make it instant
- **Chat context is ephemeral** — conversation history lives only in the browser session; there is no persistence
