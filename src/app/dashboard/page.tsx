"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ShieldCheck,
  Trash2,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Download,
  Share2,
  AlertTriangle,
  Zap,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Check,
  Search,
  ArrowLeft,
  ExternalLink,
  Target,
  Copy,
  Lightbulb,
  Lock,
  Star
} from "lucide-react";
import CsvUploader from "@/components/CsvUploader";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { IntelligenceService, ProductIntelligence, ComparisonReport, StrategicStep } from "@/lib/services/intelligence";
import { PDFService } from "@/lib/services/pdf";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";
import { getCurrency, formatPrice, CurrencyConfig } from "@/lib/utils/currency";

/* ─── Clipboard Hook ─── */
function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  }, []);
  return { copied, copy };
}

function DashboardContent() {
  const [intel, setIntel] = useState<ProductIntelligence | null>(null);
  const [comparison, setComparison] = useState<ComparisonReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [trend, setTrend] = useState<number | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [compInput, setCompInput] = useState("");
  const [isPro, setIsPro] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currency, setCurrency] = useState<CurrencyConfig | null>(null);
  const [userRevenue, setUserRevenue] = useState(currency?.code === 'INR' ? 200000 : 10000);
  const roadmapRef = useRef<HTMLDivElement>(null);
  const { copied, copy } = useCopy();
  const supabase = createClient();
  const searchParams = useSearchParams();
  const productUrl = searchParams.get("url") || "";
  const competitorUrl = searchParams.get("compare") || "";
  const isDemo = searchParams.get("demo") === "true";

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleCopy = (text: string, key: string, label?: string) => {
    copy(text, key);
    showToast(label || "Copied to clipboard");
  };

  useEffect(() => {
    setCurrency(getCurrency());
  }, []);

  useEffect(() => {
    async function checkPro() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('tier').eq('id', user.id).single();
        setIsPro(profile?.tier === 'pro' || profile?.tier === 'business' || searchParams.get("pro") === "true");
      } else {
        setIsPro(searchParams.get("pro") === "true");
      }
    }
    checkPro();

    async function fetchIntel() {
      if (!productUrl && !isDemo) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          body: JSON.stringify({
            url: productUrl,
            competitorUrl,
            isComparison: !!competitorUrl,
            isDemo: isDemo,
            currencySymbol: searchParams.get("currencySymbol") || "₹"
          }),
          headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();

        if (!res.ok) {
          setErrorMsg(data.error || "Analysis failed. Please try again.");
          setLoading(false);
          return;
        }

        if (data.type === "COMPARISON") {
          setComparison(data);
          setIntel(data.subject);
          const trendVal = await IntelligenceService.getGlobalScoreTrend(productUrl, data.subject.score);
          setTrend(trendVal);
        } else {
          setIntel(data);
          const trendVal = await IntelligenceService.getGlobalScoreTrend(productUrl, data.score);
          setTrend(trendVal);
        }

      } catch (e) {
        console.error("Dashboard Fetch Error:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchIntel();
  }, [productUrl]);

  const handleSave = async () => {
    if (!intel || !productUrl) return;
    setSaving(true);
    try {
      const id = await IntelligenceService.saveReport(intel, productUrl);
      setReportId(id);
      setSaved(true);
      showToast("Report saved to your board!");
    } catch (e) {
      console.error("Save Error:", e);
      showToast("Save failed — please log in first");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadBrief = () => {
    if (!intel) return;
    if (!isPro) {
      showToast("Upgrade to Pro to unlock PDF Strategic Audits");
      return;
    }
    try {
      PDFService.generateReport(intel, isPro);
      showToast("Professional PDF Report generated!");
    } catch (e) {
      console.error("PDF Error:", e);
      showToast("PDF generation failed");
    }
  };

  /**
   * Handles direct analysis from CSV upload
   */
  const handleCsvAnalysis = async (reviews: any[], productName: string) => {
    setLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch("/api/analyze-raw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviews, productName }),
      });

      if (!response.ok) {
        if (response.status === 402) {
          throw new Error("Daily intelligence limit (3 reports) reached. Upgrade to Pro for unlimited research.");
        }
        throw new Error("CSV Analysis failed. Please try again.");
      }

      const result = await response.json();
      setIntel(result);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState />;
  if (comparison) return <ComparisonView report={comparison} />;

  // Error State (Quotas / Blocks)
  if (errorMsg) {
    const isBlocked = errorMsg.toLowerCase().includes("blocked");
    return (
      <div className="min-h-screen bg-[#f5f6fa]">
        <Navbar />
        <div className="max-w-7xl mx-auto px-8 py-32 flex flex-col items-center text-center">
          <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center mb-8", isBlocked ? "bg-indigo-50" : "bg-red-50")}>
            <ShieldCheck className={cn("w-10 h-10", isBlocked ? "text-indigo-600" : "text-red-500")} />
          </div>
          <h1 className="text-4xl font-display font-black text-slate-900 mb-4">{isBlocked ? "Live Connection Busy" : "Daily Access Reached"}</h1>
          <p className="text-slate-500 font-medium max-w-sm mb-10 leading-relaxed">
            {errorMsg}
          </p>

          {isBlocked ? (
            <div className="w-full max-w-md">
              <CsvUploader onDataReady={handleCsvAnalysis} className="mb-8" />
              <Link
                href="/"
                className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
              >
                Or Try Different Link
              </Link>
            </div>
          ) : (
            <div className="flex gap-4">
              <Link
                href="/"
                className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black uppercase text-xs tracking-widest hover:border-indigo-600 transition-all"
              >
                Try Different Product
              </Link>
              <Link
                href="/pricing"
                className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-indigo-200"
              >
                Upgrade Now
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Empty State
  if (!intel) {
    return (
      <div className="min-h-screen bg-[#f5f6fa]">
        <Navbar />
        <div className="max-w-7xl mx-auto px-8 py-32 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-indigo-200">
            <ShieldCheck className="text-white w-10 h-10" />
          </div>
          <h1 className="text-4xl font-display font-black text-slate-900 mb-4">Ready to Scout?</h1>
          <p className="text-slate-500 font-medium max-w-sm mb-10 leading-relaxed">
            Enter an Amazon, Shopify, or Walmart URL on the home page to generate deep market intelligence.
          </p>
          <Link
            href="/"
            className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black uppercase tracking-widest hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm"
          >
            Go Back & Start Scan
          </Link>
        </div>
      </div>
    );
  }

  const score = intel?.score ?? 0;
  const isBullish = intel?.sentiment === "BULLISH";
  const reviews = intel?.sampleReviews || [];
  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 1);

  return (
    <div className="min-h-screen bg-[#f5f6fa]">
      <Navbar />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-sm font-medium"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-5">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black tracking-widest uppercase rounded">
                <Zap className="w-2.5 h-2.5 fill-current" /> AI Scan
              </span>
              {intel?.sourceMix && Object.entries(intel.sourceMix).map(([s, c]) => (
                <span key={s} className={cn(
                  "px-2 py-0.5 text-[10px] font-bold rounded border transition-all",
                  s === "SHOPIFY" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-white text-slate-500 border-slate-200"
                )}>
                  {s}: {c as number} reviews
                </span>
              ))}
              {productUrl && (
                <a
                  href={productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-white text-slate-400 text-[10px] font-bold rounded border border-slate-200 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                >
                  <ExternalLink className="w-2.5 h-2.5" /> Source
                </a>
              )}
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">{intel?.productName}</h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Score pill with gauge */}
            <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-2.5 border border-slate-200 shadow-sm relative group/score">
              <div>
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Vetter Score</div>
                <div className="text-xl font-black text-slate-900 leading-none tabular-nums">
                  {score}<span className="text-slate-300 text-xs font-bold">/100</span>
                </div>
              </div>
              <svg width="36" height="36" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15" fill="none"
                  stroke={score > 65 ? "#10b981" : score > 40 ? "#f59e0b" : "#ef4444"}
                  strokeWidth="3"
                  strokeDasharray={`${(score / 100) * 94.2} 94.2`}
                  strokeLinecap="round"
                  transform="rotate(-90 18 18)"
                />
              </svg>
              <div className={cn(
                "px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                score > 65 ? "bg-emerald-50 text-emerald-600" : score > 40 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
              )}>
                {score > 80 ? "Leader" : score > 65 ? "Strong" : score > 40 ? "Average" : "Critical"}
              </div>

              {/* Score Legend Tooltip */}
              <div className="absolute top-full mt-2 right-0 w-48 bg-slate-900 text-white rounded-xl shadow-2xl p-3 opacity-0 translate-y-2 pointer-events-none group-hover/score:opacity-100 group-hover/score:translate-y-0 transition-all z-50">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Vetter Scale</div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-emerald-400">81-100</span>
                    <span className="text-slate-300">Market Leader</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-emerald-500">66-80</span>
                    <span className="text-slate-300">Strong Edge</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-amber-400">41-65</span>
                    <span className="text-slate-300">Competitive</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-red-400">0-40</span>
                    <span className="text-slate-300">Critical Risk</span>
                  </div>
                </div>
              </div>

              {trend !== null && (
                <div className={cn(
                  "text-[10px] font-black flex items-center gap-0.5 whitespace-nowrap",
                  trend >= 0 ? "text-emerald-500" : "text-amber-500"
                )}>
                  {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% <span className="opacity-50 text-[8px] uppercase">Trend</span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <AnimatePresence>
                {isComparing ? (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "auto", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="flex items-center gap-2 bg-white border border-indigo-200 rounded-xl px-3 py-1.5 shadow-sm"
                  >
                    <input
                      type="text"
                      placeholder="Competitor URL..."
                      className="bg-transparent border-none focus:ring-0 text-[11px] font-medium w-32 md:w-48 outline-none"
                      value={compInput}
                      onChange={(e) => setCompInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const params = new URLSearchParams(window.location.search);
                          params.set("compare", compInput);
                          window.location.href = `/dashboard?${params.toString()}`;
                        }
                      }}
                    />
                    <button onClick={() => setIsComparing(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ) : (
                  <button
                    onClick={() => setIsComparing(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition-all shadow-sm"
                  >
                    <Target className="w-3.5 h-3.5" />
                    Compare
                  </button>
                )}
              </AnimatePresence>

              <button
                onClick={handleDownloadBrief}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs text-slate-600 bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                PDF Audit
              </button>
            </div>

            {saved && reportId && (
              <button
                onClick={() => handleCopy(`${window.location.origin}/report/${reportId}`, "share", "Share link copied!")}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-slate-900 border border-slate-900 hover:bg-slate-800 transition-all shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share
              </button>
            )}

            {user ? (
              <button
                onClick={handleSave}
                disabled={saving || saved}
                className={cn(
                  "px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-sm",
                  saved ? "bg-emerald-500 text-white cursor-default" : "bg-indigo-600 text-white hover:bg-indigo-700"
                )}
              >
                {saved ? "✓ Saved" : saving ? "Saving..." : "Save to Board"}
              </button>
            ) : (
              <Link
                href={`/login?next=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '/dashboard')}`}
                className="px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-sm"
              >
                Save Report
              </Link>
            )}
          </div>
        </div>

        {/* ── Growth Signal Banner ── */}
        {intel?.revenueImpact?.leakageReason && (
          <div className="flex items-center justify-between gap-4 p-4 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-white fill-current" />
              </div>
              <div>
                <div className="text-white font-black text-sm">Growth Opportunity Detected</div>
                <div className="text-indigo-200 text-xs mt-0.5">
                  Fixing <span className="text-white font-bold underline decoration-white/30">{intel.revenueImpact.leakageReason}</span> →{" "}
                  <span className="text-white font-bold">{intel.revenueImpact.recoveryEstimate}</span> revenue lift
                </div>
              </div>
            </div>
            <button
              onClick={() => roadmapRef.current?.scrollIntoView({ behavior: "smooth" })}
              className="shrink-0 bg-white text-indigo-600 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-indigo-50 transition-all whitespace-nowrap"
            >
              View Roadmap ↓
            </button>
          </div>
        )}

        {/* ── FREE ZONE: Score + Vectors ── */}
        <div className="grid md:grid-cols-5 gap-5">

          {/* Intelligence Vectors */}
          <div className="md:col-span-3 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Intelligence Vectors</h3>
              <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                {Object.values(intel?.sourceMix || {}).reduce((a: any, b: any) => a + b, 0)} signals analyzed
              </span>
            </div>
            <div className="space-y-5">
              {[
                { label: "Product Reliability", value: intel?.details?.quality ?? 0, color: "bg-indigo-500", track: "bg-indigo-50", desc: "Build quality & durability signals" },
                { label: "Market Favorability", value: intel?.details?.value ?? 0, color: "bg-emerald-500", track: "bg-emerald-50", desc: "Price-value perception" },
                { label: "Logistics Efficiency", value: intel?.details?.shipping ?? 0, color: "bg-blue-500", track: "bg-blue-50", desc: "Delivery & packaging" },
                { label: "Resolution Speed", value: intel?.details?.support ?? 0, color: "bg-amber-500", track: "bg-amber-50", desc: "Support & after-sale experience" },
              ].map(({ label, value, color, track, desc }) => (
                <div key={label}>
                  <div className="flex items-end justify-between mb-1.5">
                    <div>
                      <div className="text-sm font-bold text-slate-700">{label}</div>
                      <div className="text-[10px] text-slate-400">{desc}</div>
                    </div>
                    <span className={cn(
                      "text-lg font-black tabular-nums leading-none px-2 py-0.5 rounded-lg",
                      value >= 75 ? "text-emerald-600 bg-emerald-50" : value >= 50 ? "text-amber-600 bg-amber-50" : "text-red-600 bg-red-50"
                    )}>
                      {value}<span className="text-xs font-bold opacity-60">%</span>
                    </span>
                  </div>
                  <div className={cn("h-2 rounded-full overflow-hidden", track)}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
                      className={cn("h-full rounded-full", color)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right sidebar: Pros + Cons + Review */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <ThumbsUp className="w-3 h-3 text-emerald-600" />
                </div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">What Customers Love</h3>
              </div>
              <div className="space-y-2">
                {(intel?.topPros?.length ? intel.topPros : ["Analyzing signals..."]).slice(0, 3).map((pro, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    {pro}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-red-50 rounded-lg flex items-center justify-center">
                  <ThumbsDown className="w-3 h-3 text-red-600" />
                </div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Friction Points</h3>
              </div>
              <div className="space-y-2">
                {(intel?.topCons?.length ? intel.topCons : ["No friction detected"]).slice(0, 3).map((con, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                    {con}
                  </div>
                ))}
              </div>
            </div>

            {/* Sample review preview */}
            {reviews[0] && (
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Customer Signal</h3>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className={cn("w-2 h-2 rounded-full", j < reviews[0].rating ? "bg-amber-400" : "bg-slate-200")} />
                  ))}
                  <span className="ml-1 text-[10px] text-slate-400 font-bold">{reviews[0].rating}/5</span>
                </div>
                <h4 className="font-bold text-xs text-slate-800 mb-1">{reviews[0].title}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed italic line-clamp-3">"{reviews[0].body}"</p>
              </div>
            )}
          </div>
        </div>

        {/* ── SWOT Analysis (ALWAYS VISIBLE - THE "HOOK") ── */}
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { type: "Strengths", items: intel?.swot?.strengths || [], color: "emerald", Icon: ThumbsUp },
            { type: "Weaknesses", items: intel?.swot?.weaknesses || [], color: "red", Icon: ThumbsDown },
            { type: "Opportunities", items: intel?.swot?.opportunities || [], color: "indigo", Icon: Lightbulb },
            { type: "Threats", items: intel?.swot?.threats || [], color: "amber", Icon: Target },
          ].map(({ type, items, color, Icon }) => (
            <div key={type} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{type}</h4>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center bg-${color}-50`}>
                  <Icon className={`w-3 h-3 text-${color}-600`} />
                </div>
              </div>
              <ul className="space-y-2">
                {items.length > 0 ? items.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                    <div className={`w-1 h-1 rounded-full bg-${color}-400 mt-1.5 shrink-0`} />
                    {item}
                  </li>
                )) : (
                  <li className="text-[10px] text-slate-300 italic">No signals identified</li>
                )}
              </ul>
            </div>
          ))}
        </div>

        {/* ── PREMIUM GATE WRAPPER (CONDITIONAL) ── */}
        <div className="relative space-y-5">
          {(!user && !isPro) && (
            <div className="absolute -inset-x-4 -inset-y-4 bg-slate-50/40 backdrop-blur-[6px] z-40 rounded-[2rem] flex items-center justify-center p-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl text-center space-y-6"
              >
                <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-600/20">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">Unlock the Full Report</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    You're seeing the high-level SWOT. Join 500+ growth brands to unlock:
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 italic">✓ Revenue Leakage</div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 italic">✓ Ad Creative Studio</div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 italic">✓ Smart Replies</div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 italic">✓ Strategy Roadmap</div>
                </div>
                <div className="pt-2">
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-indigo-600/30 w-full justify-center"
                  >
                    <Zap className="w-4 h-4 fill-current" /> Get Full Access — Free
                  </Link>
                  <Link href="/login" className="block mt-4 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors">
                    Already have an account? Sign in
                  </Link>
                </div>
              </motion.div>
            </div>
          )}

          <div className={cn("space-y-5 transition-all duration-700", (!user && !isPro) && "opacity-20 pointer-events-none select-none")}>

            {/* Marketing Hooks */}
            <div className="bg-slate-900 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Marketing Hooks</h3>
                </div>
                <button
                  onClick={() => handleCopy(intel?.marketingHooks?.join("\n\n") || "", "hooks", "All hooks copied!")}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/10"
                >
                  {copied === "hooks" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  Copy All
                </button>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {intel?.marketingHooks?.map((hook, i) => (
                  <div key={i} className="group relative p-4 bg-white/5 rounded-xl border border-white/10 hover:border-indigo-500/40 transition-all">
                    <p className="text-xs text-indigo-100 italic leading-relaxed mb-3">"{hook}"</p>
                    <button
                      onClick={() => handleCopy(hook, `hook-${i}`, "Hook copied!")}
                      className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-white transition-colors"
                    >
                      {copied === `hook-${i}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copied === `hook-${i}` ? "Copied!" : "Copy"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {/* Revenue Leakage (Interactive) */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-50/50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-red-500 fill-red-500" />
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue Leakage Analysis</h3>
                  </div>
                  <h4 className="text-lg font-black text-slate-900 mb-2">
                    Potential <span className="text-red-500">{currency ? formatPrice(Math.floor(userRevenue * (parseFloat(intel?.revenueImpact?.recoveryEstimate || "0") / 100)), { ...currency, rate: 1 }) : `₹${Math.floor(userRevenue * (parseFloat(intel?.revenueImpact?.recoveryEstimate || "0") / 100)).toLocaleString('en-IN')}`}</span> Recovery
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-md">
                    Primary Leakage: <span className="font-bold text-slate-700">{intel?.revenueImpact?.leakageReason}</span>.
                    Solving this issue could recover an estimated <span className="text-red-600 font-bold">{intel?.revenueImpact?.recoveryEstimate}</span> of your monthly revenue.
                  </p>
                </div>

                <div className="min-w-[200px] bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Your Monthly Revenue</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">{currency?.symbol || "₹"}</span>
                    <input
                      type="number"
                      value={userRevenue}
                      onChange={(e) => setUserRevenue(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-lg pl-7 pr-3 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-600 outline-hidden"
                    />
                  </div>
                  <div className="mt-3 h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${intel?.revenueImpact?.recoveryEstimate}` }}
                      className="h-full bg-red-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Ad Creative + Crisis Response */}
            <div className="grid md:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ad Creative Studio</h3>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded">AI Generated</span>
                </div>
                <div className="space-y-3">
                  {intel?.adHooks?.map((hook, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-100 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-200 px-2 py-0.5 rounded">{hook.platform}</span>
                        <button
                          onClick={() => handleCopy(`${hook.headline}\n\n${hook.body}`, `ad-${i}`, "Ad copy copied!")}
                          className="flex items-center gap-1 text-[10px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors"
                        >
                          {copied === `ad-${i}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          {copied === `ad-${i}` ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <h4 className="font-black text-sm text-slate-800 mb-1">{hook.headline}</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{hook.body}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Smart Reply Drafts</h3>
                  <span className="px-2 py-0.5 bg-white/10 text-white text-[10px] font-bold rounded">Auto-Draft</span>
                </div>
                <div className="space-y-3">
                  {intel?.responseTemplates?.map((tpl, i) => (
                    <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-indigo-500/30 transition-all">
                      <span className="text-[10px] font-black text-indigo-400 uppercase block mb-2">Trigger: {tpl.trigger}</span>
                      <p className="text-[11px] text-slate-300 leading-relaxed italic mb-3">"{tpl.response}"</p>
                      <button
                        onClick={() => handleCopy(tpl.response, `tpl-${i}`, "Response copied!")}
                        className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-white transition-colors"
                      >
                        {copied === `tpl-${i}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copied === `tpl-${i}` ? "Copied!" : "Copy Response"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* All Reviews */}
            {reviews.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Signals ({reviews.length})</h3>
                  {reviews.length > 1 && (
                    <button
                      onClick={() => setShowAllReviews(v => !v)}
                      className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      {showAllReviews ? <><ChevronUp className="w-3.5 h-3.5" /> Show less</> : <><ChevronDown className="w-3.5 h-3.5" /> Show all {reviews.length}</>}
                    </button>
                  )}
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <AnimatePresence mode="popLayout">
                    {visibleReviews.map((review, i) => (
                      <motion.div
                        key={review.id || i}
                        layout
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, j) => (
                              <Star key={j} className={cn("w-3 h-3", j < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200")} />
                            ))}
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{review.source}</span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-800 mb-1">{review.title}</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed italic">"{review.body}"</p>
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-indigo-600">u/{review.author}</span>
                          <span className="text-[10px] text-slate-400">{review.date}</span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Roadmap */}
            <div ref={roadmapRef} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm scroll-mt-8">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="font-black text-sm text-slate-900">Product Evolution Roadmap</h2>
                    <p className="text-[11px] text-slate-400">AI-prioritized steps to maximize market share</p>
                  </div>
                </div>
                <button
                  onClick={handleDownloadBrief}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-200"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Brief
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {intel?.roadmap?.map((step, i) => (
                  <div key={i} className="flex gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group">
                    <div className="w-7 h-7 rounded-full bg-white border-2 border-slate-200 group-hover:border-indigo-300 group-hover:bg-indigo-600 flex items-center justify-center text-[10px] text-indigo-600 group-hover:text-white font-black shrink-0 transition-all">
                      0{i + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-xs text-slate-800">{step.title}</h4>
                        <span className={cn(
                          "text-[9px] px-1.5 py-0.5 rounded font-bold uppercase",
                          step.impact === "HIGH" ? "bg-emerald-50 text-emerald-600" : step.impact === "MEDIUM" ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-500"
                        )}>
                          {step.impact} impact
                        </span>
                        <span className={cn(
                          "text-[9px] px-1.5 py-0.5 rounded font-bold uppercase",
                          step.effort === "HIGH" ? "bg-red-50 text-red-500" : step.effort === "LOW" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                        )}>
                          {step.effort} effort
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}

/* ─── ComparisonView ─── */
function ComparisonView({ report }: { report: ComparisonReport }) {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <nav className="h-14 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl px-8 flex items-center gap-4 sticky top-0 z-50">
        <Link href="/" className="text-slate-500 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="h-4 w-[1px] bg-white/10" />
        <span className="font-black text-base text-white">Market<span className="text-indigo-400">Advantage</span> Analysis</span>
      </nav>
      <main className="max-w-6xl mx-auto px-8 py-10">
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <CompProductCard product={report.subject} isPrimary />
          <CompProductCard product={report.competitor} />
        </div>
        <section>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 pl-4 border-l-2 border-indigo-500">Strategic Action Plan</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {report?.battlecards?.map((card, i) => (
              <div key={i} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="text-indigo-400 font-black text-2xl mb-3">0{i + 1}</div>
                <h4 className="text-lg font-bold mb-2">{card.title}</h4>
                <p className="text-slate-400 text-sm italic mb-4">"{card.point}"</p>
                <div className="flex items-start gap-2 p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                  <Zap className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-indigo-200">{card.action}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function CompProductCard({ product, isPrimary }: { product: ProductIntelligence; isPrimary?: boolean }) {
  return (
    <div className={cn("rounded-2xl p-8 border h-full", isPrimary ? "bg-white text-slate-900 border-indigo-100 shadow-xl" : "bg-white/5 text-white border-white/10")}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className={cn("text-[10px] font-black uppercase tracking-widest block mb-1", isPrimary ? "text-indigo-600" : "text-slate-500")}>
            {isPrimary ? "Our Product" : "Competitor"}
          </span>
          <h3 className="text-xl font-black">{product.productName}</h3>
        </div>
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg", isPrimary ? "bg-indigo-600 text-white" : "bg-white/10 text-white")}>
          {product.score}
        </div>
      </div>
      <div className="space-y-4">
        {[
          { label: "Reliability", value: product.details.quality },
          { label: "Pricing", value: product.details.value },
          { label: "Shipping", value: product.details.shipping },
          { label: "Service", value: product.details.support },
        ].map(({ label, value }) => (
          <div key={label}>
            <div className="flex justify-between text-xs mb-1">
              <span className={isPrimary ? "text-slate-500" : "text-slate-400"}>{label}</span>
              <span className="font-black">{value}%</span>
            </div>
            <div className={cn("h-1.5 rounded-full overflow-hidden", isPrimary ? "bg-indigo-50" : "bg-white/5")}>
              <div className={cn("h-full rounded-full", isPrimary ? "bg-indigo-600" : "bg-white/20")} style={{ width: `${value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingState() {
  const [msgIdx, setMsgIdx] = useState(0);
  const messages = [
    "Looking for your product...",
    "Reading what customers say...",
    "Looking for things to fix...",
    "Making your growth plan...",
    "Almost ready!",
  ];
  useEffect(() => {
    const interval = setInterval(() => setMsgIdx(p => (p + 1) % messages.length), 2800);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="min-h-screen bg-[#f5f6fa] flex flex-col items-center justify-center gap-6">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          className="absolute inset-0 rounded-full border-4 border-t-indigo-600 border-transparent"
        />
      </div>
      <div className="text-center">
        <h2 className="text-xl font-black text-slate-900 mb-1">Analyzing Intelligence</h2>
        <motion.p key={msgIdx} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-slate-500">
          {messages[msgIdx]}
        </motion.p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <DashboardContent />
    </React.Suspense>
  );
}
