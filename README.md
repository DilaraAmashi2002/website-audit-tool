# 🔍 Website Audit Tool

AI-powered webpage auditor for SEO, UX, and conversion insights.

**Live Demo**: https://website-audit-tool-i40mwv2s0-dilara-amashis-projects.vercel.app

**GitHub**: https://github.com/DilaraAmashi2002/website-audit-tool

**Project Journey** : https://github.com/DilaraAmashi2002/website-audit-tool/blob/main/assets/website-audit-tool-journey.drawio.png


## What It Does

Paste any marketing website URL and get:
- ✅ 10+ factual metrics extracted from the page
- ✅ AI-generated insights across 5 dimensions
- ✅ 3–5 prioritized recommendations
- ✅ Full prompt logs exposed in the UI

**Best tested with**: `https://eight25media.com`, `https://stripe.com`, `https://hubspot.com`

---

## Architecture Overview

**Flow:**
`URL input` → `Next.js API Route` → `Scraper` → `AI Analysis` → `Frontend`

- `lib/scraper.ts` — fetches the page using Axios + Cheerio. If the site blocks direct scraping, automatically falls back to **Jina AI Reader** (free, no key needed)
- `lib/ai.ts` — takes clean metrics JSON, builds a structured prompt, calls **Groq AI (Llama 3.3 70b)**
- `app/api/audit/route.ts` — orchestrates scraper → AI → returns combined response
- `app/page.tsx` — displays 4 sections: Metrics, AI Insights, Recommendations, Prompt Logs

**Key principle**: The AI never sees raw HTML — only clean structured JSON extracted by the scraper first.

---

## AI Design Decisions

### 1. Structured Input Not Raw HTML
Metrics are extracted as typed JSON before the AI sees anything:
```json
{
  "word_count": 353,
  "headings": { "h1": 1, "h2": 5, "h3": 10 },
  "ctas": { "count": 9, "sample_texts": ["Let's talk", "View all work"] },
  "images": { "total": 30, "missing_alt": 28, "missing_alt_percent": "93%" }
}
```
This reduces token usage and forces the model to reason about data, not extract it.

### 2. System Prompt Enforces Specificity
4 strict rules in the system prompt:
- Every claim must cite a real number
- Reference actual H1/CTA text — no generic advice
- Be concise — 2-3 sentences per section
- Return only valid JSON

### 3. JSON Schema Output
Explicit JSON schema in the prompt produces consistent, parseable output every time — no post-processing needed.

### 4. Full Prompt Logging
Every audit logs the full system prompt, user prompt, structured input, and raw model output. Visible live in the UI under Section 04.

---

## Trade-offs

| Decision | Why | Cost |
|---|---|---|
| Cheerio + Jina fallback | Free, no browser overhead | Fails on heavy JS SPAs like Spotify |
| Groq (Llama 3.3 70b) | Free tier, fast | Less accurate than GPT-4 |
| Next.js full-stack | Single codebase, easy deploy | Less separation at scale |
| JSON schema in prompt | Simple, no SDK dependency | Slightly less reliable than tool_use |

---

## What I Would Improve With More Time

1. **Puppeteer** for JS-rendered React/Vue/Spotify-type sites
2. **Lighthouse integration** for Core Web Vitals (LCP, CLS, FID)
3. **Keyword analysis** — check heading/meta alignment with target keywords
4. **PDF export** of the full audit report
5. **Batch mode** — audit and compare multiple URLs side by side
6. **Historical tracking** — store past audits and show changes over time

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- Groq API key — free at console.groq.com

### Run Locally
```bash
git clone https://github.com/DilaraAmashi2002/website-audit-tool
cd website-audit-tool
npm install
echo GROQ_API_KEY=your-key-here> .env.local
npm run dev
```
Open http://localhost:3000

---

## Prompt Logs

See `prompt-logs.md` for a real example, or toggle **Section 04** in the live app after any audit.
