"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck, LogOut, User, LayoutDashboard, Zap } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    }
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
            <ShieldCheck className="text-white w-5 h-5" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-slate-900">
            Review<span className="text-indigo-600">Vetter</span>
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-6 ml-8">
           <Link href="/#how-it-works" className="text-sm font-bold text-slate-500 hover:text-indigo-600 uppercase tracking-widest transition-colors">How it works</Link>
           <Link href="/pricing" className="text-sm font-bold text-slate-500 hover:text-indigo-600 uppercase tracking-widest transition-colors">Pricing</Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {!loading && (
          <>
            {user ? (
              <div className="flex items-center gap-4">
                 <Link href="/dashboard/workspace" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-all">
                    <LayoutDashboard className="w-4 h-4" /> My Board
                 </Link>
                 <div className="h-4 w-[1px] bg-slate-200mx-2" />
                 <div className="group relative">
                    <button className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 border border-indigo-200 overflow-hidden">
                       {user.user_metadata?.avatar_url ? (
                         <img src={user.user_metadata.avatar_url} alt="avatar" />
                       ) : (
                         <User className="w-4 h-4" />
                       )}
                    </button>
                    {/* Dropdown (Mini) */}
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl border border-slate-200 shadow-xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transition-all p-2 z-50">
                       <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{user.email}</p>
                       <div className="h-[1px] bg-slate-100 my-1" />
                       <button 
                         onClick={handleLogout}
                         className="w-full flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all"
                       >
                          <LogOut className="w-4 h-4" /> Sign Out
                       </button>
                    </div>
                 </div>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm font-black text-slate-900 uppercase tracking-widest hover:text-indigo-600 transition-all">Log In</Link>
                <Link href="/signup" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-indigo-600/20">
                   Get Started
                </Link>
              </>
            )}
          </>
        )}
      </div>
    </nav>
  );
}
