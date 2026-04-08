# 🔍 Website Audit Tool

AI-powered webpage auditor for SEO, UX, and conversion insights.

**Live Demo**: https://website-audit-tool-d88vq5v0u-dilara-amashis-projects.vercel.app

---

## What It Does

Paste any URL → get instant analysis:
- ✅ 10+ factual metrics extracted from the page
- ✅ AI-generated insights across 5 dimensions
- ✅ 3–5 prioritized recommendations
- ✅ Full prompt logs exposed in the UI

---


## Architecture Overview

**Flow:** `URL input` → `Next.js API Route` → `Scraper (Axios + Cheerio)` → `AI Analysis (Groq)` → `Frontend`

- `lib/scraper.ts` — fetches the page and extracts all factual metrics as typed JSON
- `lib/ai.ts` — takes the metrics JSON, builds a structured prompt, calls Groq AI
- `app/api/audit/route.ts` — orchestrates scraper → AI → returns combined response
- `app/page.tsx` — displays metrics, insights, recommendations, and prompt logs


**Key principle**: Scraper runs first and returns clean typed data. The AI never sees raw HTML — only structured JSON metrics. This makes the AI focus on analysis, not extraction.

---

## AI Design Decisions

### 1. Structured Input Not Raw HTML
Instead of sending raw HTML to the AI, metrics are extracted as a typed JSON object first:
```json
{
  "word_count": 353,
  "headings": { "h1": 1, "h2": 5, "h3": 10 },
  "ctas": { "count": 9, "sample_texts": ["Let's talk", "View all work"] },
  "images": { "total": 30, "missing_alt": 28, "missing_alt_percent": "93%" }
}
```
This reduces token usage and forces the model to reason about data.

### 2. System Prompt Enforces Specificity
The system prompt has 4 strict rules:
- Every claim must cite a real number
- Reference actual H1/CTA text, not generic patterns
- Be concise — 2-3 sentences per section
- Return only valid JSON — no prose wrapping

### 3. JSON Schema in Prompt
The system prompt includes an explicit JSON schema. This produces consistent, parseable output every time.

### 4. Full Prompt Logging
Every API call logs the system prompt, user prompt, structured input, and raw model output. This is exposed live in the UI under Section 04.

---

## Trade-offs

| Decision | Why | Cost |
|---|---|---|
| Cheerio over Puppeteer | Fast, easy to deploy | Fails on JS-heavy SPAs |
| Next.js full-stack | Single codebase, easy deploy | Less separation at scale |
| Groq (Llama 3.3) | Free tier, fast | Less accurate than GPT-4 |
| JSON schema in prompt | Simple, no SDK dependency | Slightly less reliable than tool_use |

---

## What I Would Improve With More Time

1. **Puppeteer fallback** for JS-rendered React/Vue sites
2. **Lighthouse integration** for Core Web Vitals (LCP, CLS, FID)
3. **Keyword analysis** — check heading/meta alignment with target keywords
4. **PDF export** of the full audit report
5. **Batch mode** — audit multiple URLs and compare results
6. **Historical tracking** — store past audits and diff changes over time

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- Groq API key (free at console.groq.com)

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

See `prompt-logs.md` for a real example audit log, or toggle **Section 04** in the live tool to see live logs for any audit.

