# portfolio-v4

## Context
Personal portfolio and blog with a self-built admin dashboard that replaces Strapi.
Single administrator (the owner). Visitors read the public site in Spanish or English.
Treated as a greenfield build: no Strapi data migration, compatibility, or SEO preservation.
Only the existing frontend/visual components are kept.

## Stack
- Next.js 16 (App Router), deployed on Vercel
- Turso (libSQL) — database
- Cloudflare R2 — media storage
- Markdown — rich text content

## Expensive decisions
- Multi-language: Spanish and English (all managed content is bilingual)
