import { NextRequest, NextResponse } from "next/server";
import { scrapeUrl } from "@/lib/scraper";
import { analyzeWithAI } from "@/lib/ai";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL. Please include https://" },
        { status: 400 }
      );
    }

    let metrics;
    try {
      metrics = await scrapeUrl(parsedUrl.href);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return NextResponse.json(
        { error: `Failed to fetch page: ${msg}` },
        { status: 422 }
      );
    }

    let analysis, promptLog;
    try {
      ({ analysis, promptLog } = await analyzeWithAI(metrics));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return NextResponse.json(
        { error: `AI analysis failed: ${msg}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      metrics,
      analysis,
      promptLog,
      auditedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}