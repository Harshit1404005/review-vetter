"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, EyeOff, Gavel } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-indigo-100">
      <nav className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-bold uppercase tracking-widest">Back to Home</span>
        </Link>
      </nav>

      <main className="max-w-4xl mx-auto px-8 py-20">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black tracking-widest uppercase rounded-full mb-4">
             <ShieldCheck className="w-3 h-3" /> Data Protection & Privacy
          </div>
          <h1 className="text-4xl font-display font-black text-slate-900 mb-4">Privacy Policy</h1>
          <p className="text-slate-500 font-medium">Last Updated: April 14, 2026</p>
        </div>

        <div className="prose prose-slate max-w-none space-y-12 text-slate-600 leading-relaxed font-medium">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <Lock className="w-5 h-5 text-indigo-600" /> 1. Information We Collect
            </h2>
            <p>
              ReviewVetter ("we," "us," or "our") provides an AI-driven review analysis service. We do NOT collect or store personally identifiable information (PII) from your store customers. We only process <strong>publicly available review data</strong> from third-party platforms (Amazon, Walmart, Trustpilot, etc.) as requested by you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <EyeOff className="w-5 h-5 text-indigo-600" /> 2. How We Use Data
            </h2>
            <p>
              The data we retrieve is processed in real-time to generate SWOT reports, marketing hooks, and strategic roadmaps. 
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>To provide customer review synthesis and competitive benchmarking.</li>
              <li>To improve our AI models' accuracy in the e-commerce sector.</li>
              <li>To provide support and handle service communications.</li>
            </ul>
          </section>

          <section className="p-8 bg-indigo-50 rounded-3xl border border-indigo-100">
            <h2 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5" /> 3. Data Sovereignty & Security
            </h2>
            <p className="text-indigo-900/80">
              We leverage bank-grade <strong>256-bit SSL encryption</strong> for all data transmissions. Our agents operate via secure proxies provided by Apify, ensuring your analysis remains private and uncoupled from your direct store identity.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <Gavel className="w-5 h-5 text-indigo-600" /> 4. GDPR & Compliance
            </h2>
            <p>
              Under the General Data Protection Regulation (GDPR), we act as a "Data Processor." We respect the "Right to be Forgotten" and "Data Portability." Since we only scan public data, we do not store individual consumer profiles.
            </p>
          </section>

          <section className="pt-12 border-t border-slate-200">
            <h3 className="text-slate-900 font-bold mb-2">Contact ReviewVetter</h3>
            <p>
              If you have any questions about this Privacy Policy, please contact our support team at: <strong>support@reviewvetter.com</strong>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
