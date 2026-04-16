"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Gavel, Scale, AlertTriangle, ShieldAlert } from "lucide-react";

export default function TermsPage() {
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
             <Gavel className="w-3 h-3" /> Legal Terms of Service
          </div>
          <h1 className="text-4xl font-display font-black text-slate-900 mb-4">Terms & Conditions</h1>
          <p className="text-slate-500 font-medium">Last Updated: April 14, 2026</p>
        </div>

        <div className="prose prose-slate max-w-none space-y-12 text-slate-600 leading-relaxed font-medium">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <Scale className="w-5 h-5 text-indigo-600" /> 1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using ReviewVetter ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to all of the terms and conditions, you may not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <Gavel className="w-5 h-5 text-indigo-600" /> 2. Description of Service
            </h2>
            <p>
               ReviewVetter provides an AI scouting tool that aggregates public e-commerce reviews. You agree that the Service is provided "as is" and intended for market research and competitive intelligence purposes only.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
               <ShieldAlert className="w-5 h-5 text-indigo-600" /> 3. Prohibited Uses
            </h2>
            <p>
              You may not use the Service to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Engage in any activity that violates any local, state, or federal law.</li>
              <li>Attempt to reverse engineer or scrape the Service itself.</li>
              <li>Use the generated AI reports to defame or harass third-party competitors.</li>
            </ul>
          </section>

          <section className="p-8 bg-slate-900 rounded-3xl text-white">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> 4. Limitation of Liability
            </h2>
            <p className="text-slate-400">
              In no event shall ReviewVetter be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, or market share resulting from the use of our scout reports.
            </p>
          </section>

          <section className="pt-12 border-t border-slate-200">
            <h3 className="text-slate-900 font-bold mb-2">Governing Law</h3>
            <p>
              These Terms shall be governed and construed in accordance with the laws of [PLACEHOLDER_JURISDICTION], without regard to its conflict of law provisions.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
