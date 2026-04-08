# Prompt Logs & Reasoning Traces

## What This File Shows
Every audit run logs 4 things:
1. System prompt sent to the AI
2. User prompt constructed from scraped metrics
3. Structured JSON input sent to the model
4. Raw model output before formatting

All 4 are also visible live in the app under **Section 04**.

---

## 1. System Prompt

You are an expert web audit analyst for a digital marketing agency.
You specialize in SEO, conversion rate optimization, content clarity, and UX.

Rules:
- SPECIFIC: every claim must cite a real number from the metrics
- GROUNDED: reference actual H1 text, CTA text, meta content
- CONCISE: 2-3 sentences per section
- ACTIONABLE: say exactly what to change and why
- Return ONLY valid JSON, no markdown fences

---

## 2. User Prompt (example for eight25media.com)

Audit this webpage and return your analysis as JSON.

STRUCTURED METRICS INPUT:
- URL: https://eight25media.com/
- Word count: 353
- Headings: H1=1, H2=5, H3=10
- H1 text: "Digital experiences for the modern enterprise"
- CTAs: 9 found ("Let's talk", "View all work", "Read More")
- Links: 49 internal, 2 external
- Images: 30 total, 28 missing alt text (93%)
- Meta title: "B2B Digital Agency for Enterprises | eight25" (44 chars)
- Meta description: 118 chars

---

## 3. Raw Model Output (example)

{
  "seoStructure": "Meta title is 44 chars (within limit) but H1 'Digital experiences for the modern enterprise' lacks keyword specificity. Zero H2 headings under the H1 weakens crawlable hierarchy.",
  "messagingClarity": "The H1 is vague with no differentiator. 353 words is well below the 1800+ benchmark for agency homepages. CTAs like 'Let's talk' lack urgency.",
  "ctaUsage": "9 CTAs compete without hierarchy causing decision paralysis. No urgency signal exists in any label. 'Submit' on the contact form is too generic.",
  "contentDepth": "353 words is 80% below top-ranking agency homepages. 49 internal links show good architecture but the page lacks depth. 28 missing alt texts hurt SEO.",
  "uxConcerns": "93% of images missing alt text violates WCAG 2.1 AA. Multiple broken video embeds show 'browser does not support HTML5 video'. High CTA count creates clutter.",
  "recommendations": [
    { "priority": 1, "title": "Fix 28 missing image alt texts", "reasoning": "93% missing alt text is a critical SEO and accessibility failure. Quick fix with compounding benefit." },
    { "priority": 2, "title": "Reduce CTAs to 2 per section", "reasoning": "9 CTAs cause analysis paralysis. One primary + one secondary CTA per section is best practice." },
    { "priority": 3, "title": "Add H2 headings under the H1", "reasoning": "Zero H2s under the H1 weakens heading hierarchy. Add 3-5 keyword-relevant H2s." },
    { "priority": 4, "title": "Expand content to 1800+ words", "reasoning": "353 words is far below competitor benchmarks. Add case studies and service details." },
    { "priority": 5, "title": "Rewrite H1 with clear value prop", "reasoning": "'Digital experiences for the modern enterprise' is vague. Use outcome-focused copy instead." }
  ]
}

---

## 4. Why Prompts Were Structured This Way

1. Metrics extracted FIRST as typed JSON — AI never sees raw HTML
2. System prompt enforces specificity — every claim must cite a number
3. JSON schema in prompt — produces consistent parseable output
4. Live logging in UI — full transparency under Section 04