"use client";

import React, { useState } from "react";
import {
   ShieldCheck,
   Search,
   Zap,
   TrendingUp,
   MessageSquare,
   ArrowRight,
   ArrowLeft,
   ShoppingCart,
   CheckCircle2,
   Target,
   BarChart3,
   Users,
   Package,
   Copy,
   FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getCurrency, formatPrice, CurrencyConfig } from "@/lib/utils/currency";
import { useEffect } from "react";

export default function LandingPage() {
   const [url, setUrl] = useState("");
   const [compUrl, setCompUrl] = useState("");
   const [isCompare, setIsCompare] = useState(false);
   const [currency, setCurrency] = useState<CurrencyConfig | null>(null);
   const router = useRouter();

   useEffect(() => {
      setCurrency(getCurrency());
   }, []);

   const handleAnalyze = () => {
      if (!url.trim()) return;
      const params = new URLSearchParams({ 
        url,
        currencySymbol: currency?.symbol || "$" 
      });
      if (isCompare && compUrl.trim()) {
         params.append("compare", compUrl.trim());
      }
      router.push(`/dashboard?${params.toString()}`);
   };

   return (
      <div className="min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
         <Navbar />

         <main className="pt-24 md:pt-32 pb-20">

            {/* ─── HERO SECTION: PH OPTIMIZED ─── */}
            <section className="max-w-7xl mx-auto px-6 text-center">
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
               >
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black tracking-[0.2em] uppercase mb-8 shadow-2xl">
                     <Zap className="w-3.5 h-3.5 text-indigo-400 fill-current" />
                     Monday Launch Edition • Open Beta
                  </div>

                  <h1 className="text-6xl md:text-8xl font-display font-black text-slate-900 leading-[0.9] mb-8 tracking-tighter">
                     Know what they <span className="text-indigo-600 italic">want.</span> <br />
                     Before they <span className="text-indigo-600">do.</span>
                  </h1>

                  <p className="max-w-2xl mx-auto text-xl text-slate-500 font-medium leading-relaxed mb-12">
                     ReviewVetter transforms thousands of raw reviews into <span className="text-slate-900 font-bold underline decoration-indigo-500/30">Vetter Scores</span>,
                     ad-ready hooks, and strategic roadmaps in 60 seconds.
                  </p>

                  <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-20">
                     <div className="group relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition"></div>
                        <Link href="/dashboard?demo=true" className="relative w-full md:w-auto px-10 py-5 bg-white text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest border border-slate-200 hover:border-indigo-500 transition-all flex items-center justify-center gap-2">
                           <BarChart3 className="w-4 h-4" /> Start 3 Free Insights Today
                        </Link>
                     </div>
                     <Link href="#pricing" className="w-full md:w-auto px-10 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all shadow-xl">
                        Get Pro Access
                     </Link>
                  </div>
               </motion.div>

               {/* SEARCH BAR WIDGET */}
               <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="max-w-4xl mx-auto mb-32"
               >
                  <div className="flex justify-center mb-8">
                     <div className="inline-flex bg-slate-200/50 p-1.5 rounded-2xl border border-slate-200 backdrop-blur-sm">
                        <button
                           onClick={() => setIsCompare(false)}
                           className={cn(
                              "px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                              !isCompare ? "bg-white text-indigo-600 shadow-xl" : "text-slate-500 hover:text-slate-800"
                           )}
                        >
                           Single Scan
                        </button>
                        <button
                           onClick={() => setIsCompare(true)}
                           className={cn(
                              "px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                              isCompare ? "bg-white text-indigo-600 shadow-xl" : "text-slate-500 hover:text-slate-800"
                           )}
                        >
                           Market Battlecard
                        </button>
                     </div>
                  </div>

                  <div className={cn(
                     "bg-white border-4 p-3 rounded-[2.5rem] flex flex-col md:flex-row items-stretch gap-3 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] transition-all",
                     isCompare ? "border-indigo-500/10 ring-8 ring-indigo-500/5" : "border-white"
                  )}>
                     <div className="flex-1 flex items-center min-w-0">
                        <div className="pl-6 pr-4 text-slate-400">
                           <Package className="w-5 h-5" />
                        </div>
                        <input
                           type="text"
                           placeholder={isCompare ? "Your Product URL (Amazon/Walmart/Shopify)..." : "Paste Amazon, Shopify, or Trustpilot product URL..."}
                           className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 text-lg py-5 outline-hidden placeholder:text-slate-300 font-medium"
                           value={url}
                           onChange={(e) => setUrl(e.target.value)}
                           onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                        />
                     </div>

                     <AnimatePresence>
                        {isCompare && (
                           <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              className="flex-1 flex items-center border-t md:border-t-0 md:border-l border-slate-100 min-w-0"
                           >
                              <div className="pl-6 pr-4 text-indigo-400">
                                 <Target className="w-5 h-5" />
                              </div>
                              <input
                                 type="text"
                                 placeholder="Competitor URL..."
                                 className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 text-lg py-5 outline-hidden placeholder:text-slate-300 font-medium"
                                 value={compUrl}
                                 onChange={(e) => setCompUrl(e.target.value)}
                                 onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                              />
                           </motion.div>
                        )}
                     </AnimatePresence>

                     <button
                        onClick={handleAnalyze}
                        className="bg-indigo-600 hover:bg-slate-900 text-white px-10 py-5 rounded-[1.8rem] font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2 shrink-0 shadow-2xl shadow-indigo-500/20"
                     >
                        {isCompare ? "Generate SWOT" : "Analyze Signals"} <ArrowRight className="w-4 h-4" />
                     </button>
                  </div>

                  <div className="mt-8 flex items-center justify-center gap-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                     <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Market Intelligence</div>
                     <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> SWOT Matrix</div>
                     <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Ad Creator</div>
                  </div>
               </motion.div>
            </section>

            {/* ─── DEMO / PRODUCT SHOWCASE ─── */}
            <section className="bg-slate-900 py-32 relative overflow-hidden">
               <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-slate-50 to-transparent"></div>
               <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
                  <div>
                     <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-8 tracking-tighter leading-tight">
                        From 500 reviews to <br />
                        <span className="text-indigo-400 underline decoration-indigo-400/30">1 Strategic Roadmap.</span>
                     </h2>
                     <div className="space-y-8">
                        <DemoStep num="1" title="Market Scout" desc="Identify sentiment shifts and core flaws in 60 seconds." />
                        <DemoStep num="2" title="Vetter Analysis" desc="AI scores your product (0-100) vs the market average." />
                        <DemoStep num="3" title="Executive Export" desc="Generate Pro PDFs with formatted roadmaps for your team." />
                     </div>
                  </div>

                  {/* VIDEO/GIF PLACEHOLDER */}
                  <div className="relative group">
                     <div className="absolute -inset-4 bg-indigo-500/20 rounded-[3rem] blur-3xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>
                     <div className="relative bg-slate-800 rounded-[2.5rem] p-4 border border-slate-700 shadow-2xl aspect-video flex items-center justify-center overflow-hidden">
                        <div className="flex flex-col items-center gap-4">
                           <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center animate-pulse">
                              <Zap className="w-8 h-8 text-indigo-400 fill-current" />
                           </div>
                           <span className="text-xs font-black uppercase tracking-widest text-slate-500">Demo Video Loading...</span>
                        </div>
                        {/* Placeholder for actual product screenshot/gif */}
                     </div>
                  </div>
               </div>
            </section>

            {/* ─── ROI CALCULATOR ─── */}
            <section className="py-32 bg-white border-y border-slate-100">
               <div className="max-w-4xl mx-auto px-6 text-center mb-20">
                  <h2 className="text-4xl font-display font-black text-slate-900 mb-6 tracking-tight">The Price of Bad Reviews</h2>
                  <p className="text-slate-500 font-medium italic">Every 0.5★ drop below 4.5 costs you an average of 4.2% in conversion rate.</p>
               </div>
               <RoiCalculator currency={currency} />
            </section>

            {/* ─── PRICING: CONVERSION FOCUSED ─── */}
            <section id="pricing" className="py-32 max-w-7xl mx-auto px-6">
               <div className="text-center mb-20">
                  <h2 className="text-5xl font-display font-black text-slate-900 mb-4 tracking-tighter">Scalable Intelligence</h2>
                  <p className="text-slate-500 font-medium uppercase text-xs tracking-[0.2em] font-black">Join 400+ data-driven brands</p>
               </div>

               <div className="grid md:grid-cols-3 gap-8 items-stretch">
                  {/* STARTER */}
                  <div className="p-10 rounded-[2.5rem] bg-white border border-slate-200 flex flex-col">
                     <h3 className="text-xl font-black mb-1">Starter</h3>
                     <p className="text-slate-400 text-xs mb-8 uppercase font-bold tracking-widest">Beta Launch Period</p>
                     <div className="flex items-baseline gap-1 mb-10">
                        <span className="text-4xl font-black text-slate-900">{currency ? formatPrice(0, currency) : "$0"}</span>
                        <span className="text-sm font-black text-slate-400">/mo</span>
                     </div>
                     <ul className="space-y-4 mb-12 flex-1">
                        <PricingFeature label="3 Market Signals / day" />
                        <PricingFeature label="Amazon + Trustpilot" />
                        <PricingFeature label="Vetter Roadmap (AI)" />
                        <PricingFeature label="CSV Fallback Access" />
                     </ul>
                     <Link href="/signup" className="w-full py-4 bg-slate-100 text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all text-center">
                        Get Started
                     </Link>
                  </div>

                  {/* PRO */}
                  <div className="p-10 rounded-[2.5rem] bg-slate-900 text-white flex flex-col relative transform scale-105 shadow-[0_48px_80px_-24px_rgba(0,0,0,0.2)]">
                     <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-indigo-600 rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl">Most Popular</div>
                     <h3 className="text-xl font-black mb-1">Pro Scout</h3>
                     <p className="text-indigo-300 text-xs mb-8 uppercase font-bold tracking-widest italic">Growth & Scale Tier</p>
                     <div className="flex items-baseline gap-1 mb-10">
                        <span className="text-5xl font-black text-white">{currency ? formatPrice(27, currency) : "$27"}</span>
                        <span className="text-sm font-black text-slate-400">/mo</span>
                     </div>
                     <ul className="space-y-4 mb-12 flex-1">
                        <PricingFeature label="50 High-Volume Reports / day" spotlight />
                        <PricingFeature label="Walmart + Shopify Support" spotlight />
                        <PricingFeature label="Pro PDF Audits (Unbranded)" spotlight />
                        <PricingFeature label="Ad Hook Studio Access" spotlight />
                        <PricingFeature label="Market Battlecards" spotlight />
                     </ul>
                     <Link href="/signup" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-700 transition-all text-center shadow-xl shadow-indigo-600/20">
                        Scale Now
                     </Link>
                  </div>

                  {/* BUSINESS */}
                  <div className="p-10 rounded-[2.5rem] bg-white border border-slate-200 flex flex-col">
                     <h3 className="text-xl font-black mb-1">Business</h3>
                     <p className="text-slate-400 text-xs mb-8 uppercase font-bold tracking-widest">Agencies & Large Volume</p>
                     <div className="flex items-baseline gap-1 mb-10">
                        <span className="text-4xl font-black text-slate-900">{currency ? formatPrice(89, currency) : "$89"}</span>
                        <span className="text-sm font-black text-slate-400">/mo</span>
                     </div>
                     <ul className="space-y-4 mb-12 flex-1">
                        <PricingFeature label="Unlimited Portfolio Analysis" />
                        <PricingFeature label="Team Access (5 Seats)" />
                        <PricingFeature label="External Report Sharing" />
                        <PricingFeature label="API Intelligence Integration" />
                        <PricingFeature label="Priority AI Queue" />
                     </ul>
                     <Link href="/signup" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all text-center">
                        Talk to Sales
                     </Link>
                  </div>
               </div>
            </section>

            {/* ─── FOOTER ─── */}
            <footer className="bg-slate-900 pt-32 pb-20 text-white overflow-hidden relative">
               <div className="max-w-7xl mx-auto px-6 relative z-10">
                  <div className="grid md:grid-cols-4 gap-20 mb-20">
                     <div className="md:col-span-2">
                        <div className="flex items-center gap-3 mb-8">
                           <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                              <ShieldCheck className="w-6 h-6" />
                           </div>
                           <span className="text-2xl font-display font-black tracking-tighter">ReviewVetter</span>
                        </div>
                        <p className="text-slate-400 max-w-sm font-medium mb-10">Built in India for high-growth e-commerce founders worldwide. Data-driven strategy, automated for scale.</p>
                        <div className="flex gap-4">
                           <div className="px-4 py-1.5 bg-white/5 rounded-lg border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500">Made in India</div>
                        </div>
                     </div>

                     <div>
                        <h5 className="font-black text-xs uppercase tracking-[0.3em] mb-8 text-indigo-400">Platform</h5>
                        <ul className="space-y-4 text-slate-400 font-bold uppercase text-[11px] tracking-widest">
                           <li><Link href="#pricing" className="hover:text-white transition">Pricing</Link></li>
                           <li><Link href="/dashboard" className="hover:text-white transition">Dashboard</Link></li>
                           <li><Link href="/terms" className="hover:text-white transition">Terms</Link></li>
                        </ul>
                     </div>

                     <div>
                        <h5 className="font-black text-xs uppercase tracking-[0.3em] mb-8 text-indigo-400">Company</h5>
                        <ul className="space-y-4 text-slate-400 font-bold uppercase text-[11px] tracking-widest">
                           <li><a href="mailto:beta@reviewvetter.com" className="hover:text-white transition">Contact Beta</a></li>
                           <li><Link href="/privacy" className="hover:text-white transition">Privacy</Link></li>
                           <li><a href="https://producthunt.com" className="hover:text-white transition">Product Hunt</a></li>
                        </ul>
                     </div>
                  </div>

                  <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[11px] font-black uppercase tracking-widest text-slate-600">
                     <p>© 2026 REVIEWVETTER INTELLIGENCE INC. ALL RIGHTS RESERVED.</p>
                     <p>Marketed by GrowthFoundry</p>
                  </div>
               </div>
            </footer>
         </main>
      </div>
   );
}

function DemoStep({ num, title, desc }: any) {
   return (
      <div className="flex gap-6 group">
         <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-indigo-400 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
            0{num}
         </div>
         <div>
            <h4 className="text-lg font-black text-white mb-1">{title}</h4>
            <p className="text-sm text-slate-400 font-medium leading-relaxed">{desc}</p>
         </div>
      </div>
   );
}

function PricingFeature({ label, spotlight }: any) {
   return (
      <li className="flex items-center gap-3 text-sm font-bold">
         <CheckCircle2 className={cn("w-4 h-4", spotlight ? "text-indigo-400" : "text-emerald-500")} />
         <span className={spotlight ? "text-slate-100" : "text-slate-600"}>{label}</span>
      </li>
   );
}

function RoiCalculator({ currency }: { currency: CurrencyConfig | null }) {
   const [rev, setRev] = useState(200000);
   const [rate, setRate] = useState(3.8);

   const lost = Math.max(0, rev * (4.5 - rate) * 0.084);

   return (
      <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-[0_64px_128px_-32px_rgba(0,0,0,0.5)] relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-110" />
         <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
               <BarChart3 className="text-indigo-400 w-6 h-6" />
               <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em]">Find your lost money</h3>
            </div>

            <div className="space-y-10">
               <div className="grid grid-cols-2 gap-8">
                  <div>
                     <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 text-left">Monthly Revenue</label>
                     <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">{currency?.symbol || "$"}</span>
                        <input
                           type="number"
                           value={rev}
                           onChange={(e) => setRev(Number(e.target.value))}
                           className="w-full bg-slate-800 border border-slate-700 rounded-2xl pl-8 pr-4 py-4 text-white font-black text-xl focus:ring-4 focus:ring-indigo-500/20 outline-hidden transition-all"
                        />
                     </div>
                  </div>
                  <div>
                     <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 text-left">Star Rating</label>
                     <div className="relative">
                        <input
                           type="number"
                           step="0.1" min="1" max="5"
                           value={rate}
                           onChange={(e) => setRate(Number(e.target.value))}
                           className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-4 text-white font-black text-xl focus:ring-4 focus:ring-indigo-500/20 outline-hidden transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-yellow-400 font-black italic">★</span>
                     </div>
                  </div>
               </div>

               <div className="pt-10 border-t border-slate-800">
                  <div className="flex justify-between items-end">
                     <div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 leading-none">Money you're losing</div>
                        <div className="text-6xl font-black text-white tabular-nums tracking-tighter">
                           {currency?.symbol || "$"}{lost.toLocaleString(currency?.locale || 'en-US', { maximumFractionDigits: 0 })}
                        </div>
                     </div>
                     <div className="text-right pb-2">
                        <div className="text-[11px] text-red-400 font-black uppercase tracking-widest animate-pulse">Critical Severity</div>
                     </div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-6 font-medium italic border-l-2 border-indigo-500 pl-4 py-1">
                     Based on e-commerce benchmarks showing 8-12% sales lift per 1★ improvement between 3.5 and 4.5.
                  </p>
               </div>
            </div>
         </div>
      </div>
   );
}
