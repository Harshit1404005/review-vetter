"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, Zap, ArrowLeft, ShieldCheck, Target, BarChart3, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";

import { getCurrency, formatPrice, CurrencyConfig } from "@/lib/utils/currency";
import { useState, useEffect } from "react";

export default function PricingPage() {
  const [currency, setCurrency] = useState<CurrencyConfig | null>(null);

  useEffect(() => {
    setCurrency(getCurrency());
  }, []);
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-indigo-100">
      <Navbar />

      <main className="max-w-7xl mx-auto px-8 py-24">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black tracking-widest uppercase rounded-full mb-4">
            <Zap className="w-3 h-3 fill-current" /> Scalable Intelligence
          </div>
          <h1 className="text-5xl font-display font-black text-slate-900 mb-4 tracking-tight">Transparent Scale Pricing</h1>
          <p className="text-slate-500 font-medium max-w-sm mx-auto">Build for high-growth e-commerce brands. Cancel or upgrade anytime.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
           {/* STARTER */}
           <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm relative group hover:border-indigo-200 transition-all">
              <h3 className="text-xl font-bold mb-2">Starter</h3>
              <p className="text-xs text-slate-400 mb-8">Try free, no card required.</p>
              <div className="flex items-baseline gap-1 mb-8 text-slate-900 font-black">
                  <span className="text-4xl">{currency ? formatPrice(0, currency) : "₹0"}</span>
                 <span className="text-xs text-slate-400">/mo</span>
              </div>
              <ul className="space-y-4 mb-10">
                 <PricingFeature text="3 product analyses/mo" />
                 <PricingFeature text="Amazon + Trustpilot Only" />
                 <PricingFeature text="SWOT Analysis Matrix" />
                 <PricingFeature text="No PDF Export" disabled />
              </ul>
              <Link href="/signup" className="w-full py-4 rounded-xl font-black uppercase text-[10px] tracking-widest bg-slate-100 text-slate-900 text-center hover:bg-slate-200 transition-all">
                 Get Started
              </Link>
           </div>

           {/* PRO */}
           <div className="bg-white p-10 rounded-[2.5rem] border-2 border-indigo-600 shadow-2xl shadow-indigo-600/10 relative scale-105 z-10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Most Popular</div>
              <h3 className="text-xl font-bold mb-2">Pro</h3>
              <p className="text-xs text-slate-400 mb-8">For high-growth stores.</p>
              <div className="flex items-baseline gap-1 mb-8 text-slate-900 font-black">
                  <span className="text-4xl">{currency ? formatPrice(27, currency) : "₹2,199"}</span>
                 <span className="text-xs text-slate-400">/mo</span>
              </div>
              <ul className="space-y-4 mb-10">
                 <PricingFeature text="30 analyses/mo" />
                 <PricingFeature text="All 4 Platforms" />
                 <PricingFeature text="Full SWOT + Revenue Leakage" />
                 <PricingFeature text="Ad Hook AI + Smart Replies" />
                 <PricingFeature text="PDF Report Exports" />
                 <PricingFeature text="Saved Workspace" />
              </ul>
              <Link href="/signup" className="w-full py-4 rounded-xl font-black uppercase text-[10px] tracking-widest bg-indigo-600 text-white text-center hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/30">
                 Start Pro Trial
              </Link>
           </div>

           {/* AGENCY */}
           <div className="bg-slate-900 p-10 rounded-3xl border border-white/10 text-white shadow-sm relative group hover:border-indigo-500/50 transition-all">
              <h3 className="text-xl font-bold mb-2">Agency</h3>
              <p className="text-xs text-slate-500 mb-8">For multi-brand managers.</p>
              <div className="flex items-baseline gap-1 mb-8 font-black">
                  <span className="text-4xl">{currency ? formatPrice(89, currency) : "₹7,499"}</span>
                 <span className="text-xs text-slate-500">/mo</span>
              </div>
              <ul className="space-y-4 mb-10">
                 <PricingFeature text="Unlimited analyses" dark />
                 <PricingFeature text="White-Label PDF Reports" dark />
                 <PricingFeature text="Up to 5 team seats" dark />
                 <PricingFeature text="Priority Analysis Queue" dark />
                 <PricingFeature text="API Access" dark />
              </ul>
              <Link href="/signup" className="w-full py-4 rounded-xl font-black uppercase text-[10px] tracking-widest bg-white text-slate-900 text-center hover:bg-slate-100 transition-all">
                 Join as Agency
              </Link>
           </div>
        </div>

        {/* One-Time Audit Option */}
        <div className="max-w-4xl mx-auto bg-white rounded-[2rem] border-2 border-dashed border-slate-200 p-8 flex flex-col md:flex-row items-center justify-between gap-6 transition-colors hover:border-indigo-600/30">
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0">
                 <ShieldCheck className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                 <h4 className="font-black text-slate-900 mb-1">Single Deep-Dive Audit</h4>
                 <p className="text-sm text-slate-500">Perfect for one-off product launches. No subscription needed.</p>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <div className="text-right">
                  <div className="text-2xl font-black text-slate-900">{currency ? formatPrice(49, currency) : "₹3,999"}</div>
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fixed Price</div>
              </div>
              <Link href="/signup" className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 transition-all">
                 Order Audit
              </Link>
           </div>
        </div>
      </main>

      <footer className="py-20 bg-white border-t border-slate-200">
         <div className="max-w-7xl mx-auto px-8 text-center">
             <div className="flex items-center justify-center gap-2 mb-6">
                 <ShieldCheck className="w-6 h-6 text-indigo-600" />
                 <span className="font-display font-bold text-xl text-slate-900">ReviewVetter</span>
             </div>
             <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">© 2026 REVIEWVETTER INTELLIGENCE INC.</p>
         </div>
      </footer>
    </div>
  );
}

function PricingFeature({ text, disabled, dark }: { text: string; disabled?: boolean; dark?: boolean }) {
  return (
    <li className={cn(
      "flex items-center gap-3 text-sm font-medium",
      disabled ? "opacity-30 grayscale" : "opacity-100",
      dark ? "text-slate-300" : "text-slate-600"
    )}>
       <CheckCircle2 className={cn("w-4 h-4", disabled ? "text-slate-400" : "text-emerald-500")} />
       {text}
    </li>
  );
}
