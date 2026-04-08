import Anthropic from "@anthropic-ai/sdk";
import { ScrapedMetrics } from "./scraper";

const apiKey = process.env.ANTHROPIC_API_KEY;
console.log("API KEY FOUND:", !!apiKey);
const client = new Anthropic({ apiKey });

export interface Recommendation {
  priority: number;
  title: string;
  reasoning: string;
}

export interface AIAnalysis {
  seoStructure: string;
  messagingClarity: string;
  ctaUsage: string;
  contentDepth: string;
  uxConcerns: string;
  recommendations: Recommendation[];
}

export interface PromptLog {
  systemPrompt: string;
  userPrompt: string;
  structuredInput: Record<string, unknown>;
  rawModelOutput: string;
  model: string;
  timestamp: string;
}

export async function analyzeWithAI(
  metrics: ScrapedMetrics
): Promise<{ analysis: AIAnalysis; promptLog: PromptLog }> {

  const systemPrompt = `You are an expert web audit analyst for a digital marketing agency.
You specialize in SEO, conversion rate optimization, content clarity, and UX for marketing websites.

Your analysis must be:
- SPECIFIC: every claim must cite a real number from the metrics
- GROUNDED: no generic advice — reference the actual H1 text, CTA text, meta content
- CONCISE: 2-3 sentences per section, dense with insight
- ACTIONABLE: recommendations must say exactly what to change and why

RESPONSE FORMAT: Respond with ONLY valid JSON — no markdown fences, no preamble.

JSON schema:
{
  "seoStructure": "string",
  "messagingClarity": "string",
  "ctaUsage": "string",
  "contentDepth": "string",
  "uxConcerns": "string",
  "recommendations": [
    {
      "priority": 1,
      "title": "Short action title",
      "reasoning": "Specific reasoning tied to a metric"
    }
  ]
}

Provide 3-5 recommendations ordered by priority (1 = most impactful).`;

  const structuredInput = {
    url: metrics.url,
    factual_metrics: {
      word_count: metrics.wordCount,
      headings: {
        h1: metrics.headings.h1,
        h1_texts: metrics.h1Texts,
        h2: metrics.headings.h2,
        h3: metrics.headings.h3,
      },
      ctas: {
        count: metrics.ctaCount,
        sample_texts: metrics.ctaTexts.slice(0, 6),
      },
      links: {
        internal: metrics.internalLinks,
        external: metrics.externalLinks,
      },
      images: {
        total: metrics.imageCount,
        missing_alt: metrics.imagesMissingAlt,
        missing_alt_percent: `${metrics.imagesMissingAltPercent}%`,
      },
      meta: {
        title: metrics.metaTitle,
        title_length: metrics.metaTitle.length,
        description: metrics.metaDescription,
        description_length: metrics.metaDescription.length,
      },
    },
    page_content_sample: metrics.pageContent,
  };

  const userPrompt = `Audit this webpage and return your analysis as JSON.

STRUCTURED METRICS INPUT:
${JSON.stringify(structuredInput, null, 2)}

Generate specific, metric-grounded insights for all 5 sections and 3-5 prioritized recommendations.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const rawModelOutput =
    response.content[0].type === "text" ? response.content[0].text : "";

  const cleaned = rawModelOutput
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  const analysis: AIAnalysis = JSON.parse(cleaned);

  const promptLog: PromptLog = {
    systemPrompt,
    userPrompt,
    structuredInput,
    rawModelOutput,
    model: "claude-sonnet-4-20250514",
    timestamp: new Date().toISOString(),
  };

  return { analysis, promptLog };
}