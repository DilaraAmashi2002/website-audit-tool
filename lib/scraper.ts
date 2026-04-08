import * as cheerio from "cheerio";
import axios from "axios";

export interface ScrapedMetrics {
  url: string;
  wordCount: number;
  headings: { h1: number; h2: number; h3: number };
  ctaCount: number;
  ctaTexts: string[];
  internalLinks: number;
  externalLinks: number;
  imageCount: number;
  imagesMissingAlt: number;
  imagesMissingAltPercent: number;
  metaTitle: string;
  metaDescription: string;
  h1Texts: string[];
  pageContent: string;
  scrapedVia: string;
}

// ── Regular scraper ───────────────────────────────────────
async function scrapeRegular(url: string): Promise<ScrapedMetrics> {
  const response = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    },
    timeout: 20000,
    maxRedirects: 5,
  });

  const $ = cheerio.load(response.data);
  const hostname = new URL(url).hostname;

  $("script, style, noscript").remove();

  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const wordCount = bodyText.split(" ").filter((w) => w.trim().length > 0).length;

  const h1 = $("h1").length;
  const h2 = $("h2").length;
  const h3 = $("h3").length;
  const h1Texts = $("h1").map((_, el) => $(el).text().trim()).get().filter(Boolean);

  const ctaKeywords = /contact|demo|start|sign.?up|get.?started|book|free|try|buy|shop|learn.?more|request|schedule|download|subscribe/i;
  const seen = new Set<string>();
  const ctaTexts: string[] = [];

  $("button, a.btn, a.button, [class*='cta'], [class*='btn'], [class*='button']").each((_, el) => {
    const text = $(el).text().trim();
    if (text && !seen.has(text.toLowerCase())) {
      seen.add(text.toLowerCase());
      ctaTexts.push(text);
    }
  });

  $("a[href]").each((_, el) => {
    const text = $(el).text().trim();
    if (text && ctaKeywords.test(text) && !seen.has(text.toLowerCase())) {
      seen.add(text.toLowerCase());
      ctaTexts.push(text);
    }
  });

  let internalLinks = 0;
  let externalLinks = 0;
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    if (href.startsWith("http") && !href.toLowerCase().includes(hostname.toLowerCase())) {
      externalLinks++;
    } else if (href && !href.startsWith("#") && !href.startsWith("mailto:") && !href.startsWith("tel:")) {
      internalLinks++;
    }
  });

  const images = $("img");
  const imageCount = images.length;
  let imagesMissingAlt = 0;
  images.each((_, el) => {
    const alt = $(el).attr("alt");
    if (alt === undefined || alt.trim() === "") imagesMissingAlt++;
  });
  const imagesMissingAltPercent = imageCount > 0 ? Math.round((imagesMissingAlt / imageCount) * 100) : 0;

  const metaTitle = $("title").first().text().trim() || $('meta[property="og:title"]').attr("content") || "";
  const metaDescription = $('meta[name="description"]').attr("content") || $('meta[property="og:description"]').attr("content") || "";

  return {
    url,
    wordCount,
    headings: { h1, h2, h3 },
    ctaCount: ctaTexts.length,
    ctaTexts: ctaTexts.slice(0, 10),
    internalLinks,
    externalLinks,
    imageCount,
    imagesMissingAlt,
    imagesMissingAltPercent,
    metaTitle,
    metaDescription,
    h1Texts,
    pageContent: bodyText.slice(0, 6000),
    scrapedVia: "direct",
  };
}

// ── Jina AI fallback (works for JS sites + blocked sites) ─
async function scrapeViaJina(url: string): Promise<ScrapedMetrics> {
  const jinaUrl = `https://r.jina.ai/${url}`;
  const response = await axios.get(jinaUrl, {
    headers: {
      Accept: "text/plain",
      "X-Return-Format": "markdown",
    },
    timeout: 30000,
  });

  const markdown: string = response.data;

  // Parse markdown for metrics
  const lines = markdown.split("\n");

  const h1Lines = lines.filter((l) => /^# /.test(l));
  const h2Lines = lines.filter((l) => /^## /.test(l));
  const h3Lines = lines.filter((l) => /^### /.test(l));
  const h1Texts = h1Lines.map((l) => l.replace(/^# /, "").trim());

  const wordCount = markdown.replace(/[#*\[\]()]/g, "").split(/\s+/).filter(Boolean).length;

  // Extract links
  const linkMatches = markdown.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
  let internalLinks = 0;
  let externalLinks = 0;
  const hostname = new URL(url).hostname;
  const ctaKeywords = /contact|demo|start|sign.?up|get.?started|book|free|try|buy|shop|learn.?more|request|schedule|download|subscribe/i;
  const ctaTexts: string[] = [];

  linkMatches.forEach((match) => {
    const hrefMatch = match.match(/\(([^)]+)\)/);
    const textMatch = match.match(/\[([^\]]+)\]/);
    const href = hrefMatch ? hrefMatch[1] : "";
    const text = textMatch ? textMatch[1].trim() : "";

    if (href.startsWith("http") && !href.includes(hostname)) {
      externalLinks++;
    } else {
      internalLinks++;
    }

    if (text && ctaKeywords.test(text) && !ctaTexts.includes(text)) {
      ctaTexts.push(text);
    }
  });

  // Extract images
  const imageMatches = markdown.match(/!\[([^\]]*)\]\([^)]+\)/g) || [];
  const imageCount = imageMatches.length;
  const imagesMissingAlt = imageMatches.filter((m) => /!\[\]/.test(m)).length;
  const imagesMissingAltPercent = imageCount > 0 ? Math.round((imagesMissingAlt / imageCount) * 100) : 0;

  // Extract meta from Jina header
  const titleMatch = markdown.match(/Title:\s*(.+)/);
  const descMatch = markdown.match(/Description:\s*(.+)/);
  const metaTitle = titleMatch ? titleMatch[1].trim() : "";
  const metaDescription = descMatch ? descMatch[1].trim() : "";

  return {
    url,
    wordCount,
    headings: { h1: h1Lines.length, h2: h2Lines.length, h3: h3Lines.length },
    ctaCount: ctaTexts.length,
    ctaTexts: ctaTexts.slice(0, 10),
    internalLinks,
    externalLinks,
    imageCount,
    imagesMissingAlt,
    imagesMissingAltPercent,
    metaTitle,
    metaDescription,
    h1Texts,
    pageContent: markdown.slice(0, 6000),
    scrapedVia: "jina-reader",
  };
}

// ── Main export: tries regular first, falls back to Jina ──
export async function scrapeUrl(url: string): Promise<ScrapedMetrics> {
  try {
    return await scrapeRegular(url);
  } catch (err) {
    console.log("Regular scrape failed, trying Jina AI Reader...", err);
    return await scrapeViaJina(url);
  }
}