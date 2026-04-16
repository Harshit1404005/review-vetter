"use client";

import React, { useState } from "react";
import { Zap, ArrowLeft, Mail, Lock, BarChart3 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
       setError(error.message);
       setLoading(false);
    } else {
       router.push("/dashboard");
       router.refresh();
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden">
      {/* ─── Left Side: Brand Visual ─── */}
      <div className="hidden md:flex md:w-1/2 bg-slate-900 p-20 flex-col justify-between relative overflow-hidden">
         <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
            <BarChart3 className="w-full h-full text-indigo-500 -rotate-12 translate-x-1/2 translate-y-1/2" />
         </div>

         <div className="relative z-10">
            <Link href="/" className="flex items-center gap-2 mb-12 group">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-500 transition-all">
                <Zap className="text-white w-6 h-6 fill-current" />
              </div>
              <span className="text-2xl font-display font-black tracking-tight text-white uppercase">ReviewVetter</span>
            </Link>
            
            <h2 className="text-5xl font-display font-black text-white leading-tight mb-8">
               Intelligence that <br />
               <span className="text-indigo-500 underline decoration-white/20 underline-offset-8">wins customers.</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-sm leading-relaxed">
               Welcome back. Unlock full competitive roadmaps and marketing hooks for your D2C brand.
            </p>
         </div>

         <div className="relative z-10">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Trusted by 500+ D2C Founders</p>
            <div className="flex gap-4 opacity-30 grayscale">
               <span className="text-white font-black italic">Shopify Plus</span>
               <span className="text-white font-black">Amazon Brand</span>
            </div>
         </div>
      </div>

      {/* ─── Right Side: Login Form ─── */}
      <div className="flex-1 bg-white p-8 md:p-24 flex items-center justify-center relative">
         <Link href="/" className="absolute top-8 left-8 text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Back
         </Link>

         <motion.div 
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           className="w-full max-w-sm"
         >
            <div className="mb-10">
               <h1 className="text-3xl font-display font-black text-slate-900 mb-2">Welcome Back</h1>
               <p className="text-slate-500 font-medium text-sm">Sign in to your e-commerce workspace.</p>
            </div>

            <button 
              onClick={handleGoogleLogin}
              className="w-full py-3 px-6 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-3 font-bold text-sm text-slate-700 mb-8"
            >
               <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
               </svg>
               Continue with Google
            </button>

            <div className="relative mb-8">
               <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
               <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-bold tracking-widest">Or Email</span></div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
               <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1.5">Email Address</label>
                  <div className="relative">
                     <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                     <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="founder@brand.com"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
                     />
                  </div>
               </div>

               <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1.5">Password</label>
                  <div className="relative">
                     <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                     <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
                     />
                  </div>
               </div>

               {error && (
                 <div className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-lg border border-red-100 mb-4">
                    {error}
                 </div>
               )}

               <button 
                 type="submit"
                 disabled={loading}
                 className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50"
               >
                  {loading ? 'Authenticating...' : 'Sign In'}
               </button>
            </form>

            <p className="mt-8 text-center text-sm font-medium text-slate-500">
               New to ReviewVetter? <Link href="/signup" className="text-indigo-600 font-bold hover:underline">Create Account</Link>
            </p>
         </motion.div>
      </div>
    </div>
  );
}
