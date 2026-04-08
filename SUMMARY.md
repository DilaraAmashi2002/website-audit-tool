# Project Summary

## What I Built
An AI-powered Website Audit Tool that accepts a URL, extracts factual metrics, and uses AI to generate structured insights and recommendations — built in one session as part of the Eight25Media assessment.

---

## Tech Stack

| Layer | Tool | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | Full-stack in one codebase, easy Vercel deploy |
| Language | TypeScript | Type safety across scraper and AI layers |
| Styling | Tailwind CSS | Fast, clean UI without custom CSS |
| Scraping | Axios + Cheerio | Lightweight HTML parser, no browser needed |
| AI | Groq API (Llama 3.3 70b) | Free tier, fast, reliable JSON output |
| Fallback Scraper | Jina AI Reader | Free, no key needed, handles blocked sites |
| Deployment | Vercel | Free, instant deploy from CLI |

---

## Packages Used

| Package | Purpose |
|---|---|
| `axios` | HTTP requests to fetch web pages |
| `cheerio` | Parse and query HTML like jQuery |
| `groq-sdk` | Call Groq AI API (Llama 3.3 model) |
| `next` | App framework with API routes |
| `tailwindcss` | Utility-first CSS styling |
| `typescript` | Type safety |

---

## AI Provider Changes

| Stage | Provider | Reason Changed |
|---|---|---|
| Initially planned | Anthropic Claude | Ran out of credits — requires payment |
| Switched to | Google Gemini | Free tier quota was 0 — unusable |
| Final choice | Groq (Llama 3.3 70b) | Truly free, fast, works perfectly |

---

## Scraper Changes

| Stage | Method | Reason |
|---|---|---|
| v1 | Axios + Cheerio only | Fast but fails on blocked sites |
| v2 (final) | Axios + Cheerio with Jina AI fallback | Handles blocked/JS-heavy sites automatically |

---

## Known Limitations

- Cannot scrape heavily JS-rendered SPAs (Spotify, Reddit) — Puppeteer would fix this
- Groq free tier has rate limits on heavy usage
- Single page only — no multi-page crawling

---

## What I Would Add With More Time

- Puppeteer for JS-rendered sites
- Lighthouse for Core Web Vitals
- PDF export of audit report
- Batch URL comparison
- Historical audit tracking