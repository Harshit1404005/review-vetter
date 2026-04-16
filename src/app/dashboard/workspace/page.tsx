"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, Search, Trash2, ArrowRight, Calendar, ExternalLink } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { IntelligenceService } from "@/lib/services/intelligence";
import Navbar from "@/components/Navbar";

export default function WorkspacePage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchReports() {
      try {
        const data = await IntelligenceService.getUserReports();
        setReports(data || []);
      } catch (e) {
        console.error("Fetch Reports Error:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to remove this intelligence from your board?")) return;
    
    try {
      await IntelligenceService.deleteReport(id);
      setReports(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error("Delete Error:", err);
      alert("Failed to delete report. Please try again.");
    }
  };

  const filteredReports = reports.filter(r => 
    r.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-8 py-12">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-display font-black text-slate-900 mb-2 tracking-tight">Intelligence Board</h1>
            <p className="text-slate-500 font-medium">Your curated reservoir of strategic market scans.</p>
          </div>
          
          <div className="relative group w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search your intel..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium shadow-sm"
            />
          </div>
        </header>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
             {[1,2,3].map(i => (
                <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-3xl" />
             ))}
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
             <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="text-slate-300 w-8 h-8" />
             </div>
             <h3 className="text-xl font-bold text-slate-900 mb-2">The reservoir is dry.</h3>
             <p className="text-slate-500 mb-8 max-w-sm mx-auto">Start by performing a product scan and pinning it to your board.</p>
             <Link href="/" className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-indigo-600/20">
                New Intelligence Scan
             </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
             <AnimatePresence mode="popLayout">
               {filteredReports.map((report, i) => (
                 <motion.div 
                   key={report.id}
                   layout
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   transition={{ delay: i * 0.05 }}
                   className="bg-white rounded-3xl p-8 border border-slate-200 relative group flex flex-col hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all"
                 >
                    <div className="flex items-start justify-between mb-6">
                       <div className={cn(
                         "w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black",
                         report.score > 80 ? "bg-emerald-50 text-emerald-600" : report.score > 50 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
                        )}>
                          {report.score}
                       </div>
                       <button 
                         onClick={(e) => handleDelete(report.id, e)}
                         className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>

                    <h3 className="text-xl font-display font-black text-slate-900 mb-2 line-clamp-1">{report.product_name}</h3>
                    <div className="flex items-center gap-2 mb-8">
                       <span className={cn(
                         "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                         report.sentiment === "BULLISH" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                       )}>
                          {report.sentiment || "NEUTRAL"}
                       </span>
                       <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase">
                          <Calendar className="w-3 h-3" /> {new Date(report.created_at).toLocaleDateString()}
                       </span>
                    </div>

                    <div className="mt-auto flex items-center gap-3">
                       <Link 
                         href={`/dashboard?id=${report.id}`}
                         className="flex-1 bg-slate-900 text-white py-3 rounded-xl text-center text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 group/btn"
                       >
                          Open Intelligence <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                       </Link>
                       <a 
                         href={report.product_url} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-400 hover:text-indigo-600"
                       >
                          <ExternalLink className="w-4 h-4" />
                       </a>
                    </div>
                 </motion.div>
               ))}
             </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
