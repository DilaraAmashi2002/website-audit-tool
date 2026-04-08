"use client";

import { useState } from "react";
import { ScrapedMetrics } from "../lib/scraper";
import { AIAnalysis, PromptLog } from "../lib/ai";

interface AuditResult {
  metrics: ScrapedMetrics;
  analysis: AIAnalysis;
  promptLog: PromptLog;
  auditedAt: string;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState("");
  const [showLogs, setShowLogs] = useState(false);
  const [step, setStep] = useState("");

  async function runAudit() {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    setStep("Fetching page...");

    try {
      setTimeout(() => setStep("Extracting metrics..."), 1500);
      setTimeout(() => setStep("Running AI analysis..."), 4000);

      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Something went wrong");
      } else {
        setResult(data);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
      setStep("");
    }
  }

  const priorityColors = ["#6ee7b7", "#818cf8", "#f59e0b", "#f87171", "#94a3b8"];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#e2e8f0]">
      {/* Header */}
      <header className="border-b border-[#1e1e2e]">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#6ee7b7] flex items-center justify-center text-xs font-bold text-[#0a0a0f]">
              AU
            </div>
            <span className="font-bold text-lg tracking-tight">
              WebAudit<span className="text-[#6ee7b7]">.ai</span>
            </span>
          </div>
          <span className="font-mono text-xs text-[#64748b]">
            AI-Powered · SEO + UX + Conversion
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight">
            Audit Any Webpage
            <br />
            <span className="text-[#6ee7b7]">in Seconds</span>
          </h1>
          <p className="text-[#64748b] text-lg">
            Extracts factual metrics + AI-powered SEO, UX & conversion insights
          </p>
        </div>

        {/* URL Input */}
        <div className="rounded-2xl p-1 mb-10 bg-[#13131a] border border-[#1e1e2e]">
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runAudit()}
              placeholder="https://example.com"
              disabled={loading}
              className="flex-1 bg-transparent px-5 py-4 outline-none text-base font-mono text-[#e2e8f0] placeholder-[#64748b]"
            />
            <button
              onClick={runAudit}
              disabled={loading || !url.trim()}
              className="px-7 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-[#6ee7b7] text-[#0a0a0f] hover:opacity-90"
            >
              {loading ? step || "Analyzing..." : "Run Audit →"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl p-4 mb-8 text-sm font-mono bg-red-500/10 border border-red-500/30 text-red-400">
            ✕ {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl animate-pulse bg-[#13131a]" />
            ))}
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-8">

            {/* Audited URL */}
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl font-mono text-sm bg-[#13131a] border border-[#1e1e2e]">
              <span className="w-2 h-2 rounded-full bg-[#6ee7b7]" />
              <span className="text-[#64748b]">Audited:</span>
              <a href={result.metrics.url} target="_blank" rel="noreferrer" className="truncate text-[#6ee7b7]">
                {result.metrics.url}
              </a>
              <span className="ml-auto text-[#64748b]">
                {new Date(result.auditedAt).toLocaleTimeString()}
              </span>
            </div>

            {/* SECTION 1: FACTUAL METRICS */}
            <section>
              <div className="font-mono text-xs font-bold mb-4 tracking-widest uppercase text-[#818cf8]">
                01 — Factual Metrics
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Word Count", value: result.metrics.wordCount.toLocaleString() },
                  { label: "H1 / H2 / H3", value: `${result.metrics.headings.h1} / ${result.metrics.headings.h2} / ${result.metrics.headings.h3}` },
                  { label: "CTAs Found", value: result.metrics.ctaCount },
                  { label: "Images Missing Alt", value: `${result.metrics.imagesMissingAlt}/${result.metrics.imageCount}`, warn: result.metrics.imagesMissingAltPercent > 30 },
                  { label: "Internal Links", value: result.metrics.internalLinks },
                  { label: "External Links", value: result.metrics.externalLinks },
                  { label: "Meta Title Len", value: result.metrics.metaTitle.length, warn: result.metrics.metaTitle.length > 60 || result.metrics.metaTitle.length === 0 },
                  { label: "Meta Desc Len", value: result.metrics.metaDescription.length, warn: result.metrics.metaDescription.length > 160 || result.metrics.metaDescription.length === 0 },
                ].map((m, i) => (
                  <div key={i} className={`rounded-xl p-4 bg-[#13131a] border ${m.warn ? "border-red-500/40" : "border-[#1e1e2e]"}`}>
                    <div className={`font-mono text-xs mb-1 uppercase tracking-wide ${m.warn ? "text-red-400" : "text-[#64748b]"}`}>{m.label}</div>
                    <div className="text-2xl font-extrabold font-mono">{m.value}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                {[
                  { label: "Meta Title", value: result.metrics.metaTitle || "— none —" },
                  { label: "Meta Description", value: result.metrics.metaDescription || "— none —" },
                  ...(result.metrics.h1Texts.length > 0 ? [{ label: "H1 Text(s)", value: result.metrics.h1Texts.join(" | ") }] : []),
                  ...(result.metrics.ctaTexts.length > 0 ? [{ label: "CTA Labels", value: result.metrics.ctaTexts.slice(0, 6).join(" · ") }] : []),
                ].map((row, i) => (
                  <div key={i} className="rounded-xl px-4 py-3 flex gap-3 items-start bg-[#13131a] border border-[#1e1e2e]">
                    <span className="font-mono text-xs font-bold w-28 flex-shrink-0 pt-0.5 uppercase text-[#64748b]">{row.label}</span>
                    <span className="text-sm font-mono">{row.value}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 2: AI INSIGHTS */}
            <section>
              <div className="font-mono text-xs font-bold mb-4 tracking-widest uppercase text-[#818cf8]">
                02 — AI Insights
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { title: "SEO Structure", icon: "🔍", body: result.analysis.seoStructure },
                  { title: "Messaging Clarity", icon: "💬", body: result.analysis.messagingClarity },
                  { title: "CTA Usage", icon: "🎯", body: result.analysis.ctaUsage },
                  { title: "Content Depth", icon: "📄", body: result.analysis.contentDepth },
                ].map((card, i) => (
                  <div key={i} className="rounded-xl p-5 bg-[#13131a] border border-[#1e1e2e]">
                    <div className="flex items-center gap-2 mb-3">
                      <span>{card.icon}</span>
                      <span className="font-bold text-sm">{card.title}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-[#64748b]">{card.body}</p>
                  </div>
                ))}
                <div className="rounded-xl p-5 bg-[#13131a] border border-[#1e1e2e] md:col-span-2">
                  <div className="flex items-center gap-2 mb-3">
                    <span>⚠️</span>
                    <span className="font-bold text-sm">UX / Structural Concerns</span>
                  </div>
                  <p className="text-sm leading-relaxed text-[#64748b]">{result.analysis.uxConcerns}</p>
                </div>
              </div>
            </section>

            {/* SECTION 3: RECOMMENDATIONS */}
            <section>
              <div className="font-mono text-xs font-bold mb-4 tracking-widest uppercase text-[#818cf8]">
                03 — Prioritized Recommendations
              </div>
              <div className="space-y-3">
                {result.analysis.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="rounded-xl p-5 flex gap-4 bg-[#13131a] border border-[#1e1e2e]"
                    style={{ borderLeft: `3px solid ${priorityColors[i] || "#94a3b8"}` }}
                  >
                    <div
                      className="font-mono text-xs font-bold px-2 py-1 rounded h-fit flex-shrink-0"
                      style={{ background: `${priorityColors[i]}22`, color: priorityColors[i] }}
                    >
                      P{rec.priority}
                    </div>
                    <div>
                      <div className="font-bold mb-1">{rec.title}</div>
                      <div className="text-sm leading-relaxed text-[#64748b]">{rec.reasoning}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 4: PROMPT LOGS */}
            <section>
              <button
                onClick={() => setShowLogs(!showLogs)}
                className="flex items-center gap-2 text-sm font-mono mb-3 text-[#64748b] hover:opacity-80 transition-opacity"
              >
                <span>{showLogs ? "▼" : "▶"}</span>
                04 — Prompt Logs & Reasoning Traces
              </button>
              {showLogs && (
                <div className="space-y-4">
                  {[
                    { label: "System Prompt", content: result.promptLog.systemPrompt },
                    { label: "User Prompt (constructed)", content: result.promptLog.userPrompt },
                    { label: "Structured Input Sent to Model", content: JSON.stringify(result.promptLog.structuredInput, null, 2) },
                    { label: "Raw Model Output", content: result.promptLog.rawModelOutput },
                  ].map((log, i) => (
                    <div key={i} className="rounded-xl overflow-hidden border border-[#1e1e2e]">
                      <div className="px-4 py-2 font-mono text-xs font-bold bg-[#1e1e2e] text-[#64748b]">{log.label}</div>
                      <pre className="p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap bg-[#13131a] text-[#94a3b8] max-h-80 overflow-y-auto">
                        {log.content}
                      </pre>
                    </div>
                  ))}
                  <div className="font-mono text-xs px-4 py-2 rounded-lg bg-[#13131a] text-[#64748b]">
                    Model: {result.promptLog.model} · {result.promptLog.timestamp}
                  </div>
                </div>
              )}
            </section>

          </div>
        )}
      </main>
    </div>
  );
}