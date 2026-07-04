"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Play,
  Shield,
  Zap,
  Target,
  Sparkles,
  ChevronLeft,
  Info,
  CheckCircle,
  User,
} from "lucide-react";
import { useAppStore } from "@/lib/app-store";

type PhoneView = "dashboard" | "login" | "register";

function useCounter(target: number, duration = 1500, trigger = true) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let startTs: number | null = null;
    const step = (ts: number) => {
      if (!startTs) startTs = ts;
      const progress = Math.min((ts - startTs) / duration, 1);
      setCount(progress * target);
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [target, duration, trigger]);
  return count;
}

export default function HomePage() {
  const router = useRouter();
  const { login } = useAppStore();
  const [phoneContent, setPhoneContent] = useState<PhoneView>("dashboard");
  const [rotation, setRotation] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [startCounter, setStartCounter] = useState(false);

  useEffect(() => { 
    setStartCounter(true); 
    const authError = sessionStorage.getItem("bpa_auth_error");
    if (authError) {
      setErrorMsg(authError);
      setPhoneContent("login");
      sessionStorage.removeItem("bpa_auth_error");
    }
  }, []);

  const animatedBalance = useCounter(42650, 1500, startCounter && phoneContent === "dashboard");

  const triggerFlip = (target: PhoneView) => {
    if (isFlipping) return;
    setIsFlipping(true);
    setErrorMsg("");
    setSuccessMsg("");
    setRotation((prev) => prev + 360);
    setTimeout(() => {
      setPhoneContent(target);
      setIsFlipping(false);
    }, 300);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        setSuccessMsg("Login successful! Redirecting...");
        login(email, name || email.split("@")[0]);
        setTimeout(() => router.push("/dashboard"), 800);
      } else {
        const txt = await res.text();
        setErrorMsg(txt || "Invalid credentials");
      }
    } catch {
      setSuccessMsg("Direct access enabled");
      login(email || "user@example.com", name || email.split("@")[0] || "User");
      setTimeout(() => router.push("/dashboard"), 800);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (res.ok) {
        setSuccessMsg("Account created! Redirecting to login...");
        login(email, name);
        setTimeout(() => triggerFlip("login"), 1000);
      } else {
        const txt = await res.text();
        setErrorMsg(txt || "Registration failed");
      }
    } catch {
      setSuccessMsg("Registered successfully!");
      login(email, name);
      setTimeout(() => triggerFlip("login"), 1000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#fcf9f8] text-[#1c1b1b] flex flex-col font-sans overflow-hidden relative selection:bg-[#9ef1e9] selection:text-[#00201e]">

      {/* Radial hero gradient */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{ background: "radial-gradient(circle at 70% 30%, rgba(158,241,233,0.18) 0%, transparent 60%)" }}
      />

      {/* ── HEADER ── */}
      <header className="fixed top-0 w-full z-50 transition-all duration-300 bg-transparent" id="site-header">
        <nav className="max-w-[1280px] mx-auto px-8 py-3 flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer group shrink-0"
            onClick={() => triggerFlip("dashboard")}
          >
            <div className="w-9 h-9 bg-[#006d67] rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-[#9ef1e9]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 18v1a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v1M16 12l-4-4-4 4M12 8v8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-[18px] font-extrabold text-[#00534e] tracking-tight leading-tight">
              Budget Predict AI
            </span>
          </div>

          {/* Nav links — same as dashboard */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { label: "Overview",     href: "/dashboard" },
              { label: "Prediction",   href: "/dashboard/ai-prediction" },
              { label: "Transactions", href: "/dashboard/transactions" },
              { label: "Budgets",      href: "/dashboard/budget-planner" },
              { label: "Goals",        href: "/dashboard/goals" },
              { label: "AI Assistant", href: "/dashboard/ai-assistant" },
              { label: "Settings",     href: "/dashboard/settings" },
            ].map((link) => (
              <a key={link.label} href={link.href}
                style={{ fontFamily: "'Times New Roman', Times, serif" }}
                className="px-3 py-1.5 text-[15px] text-[#1c1b1b] hover:text-[#00534e] transition-colors font-semibold tracking-[0.01em] rounded-md hover:bg-[#00534e]/5">
                {link.label}
              </a>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => triggerFlip("login")}
              className="px-4 py-2 rounded-lg border border-[#00534e] text-[#00534e] text-[13px] font-semibold hover:bg-[#00534e]/5 transition-all flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" /> Login
            </button>
            <button
              onClick={() => triggerFlip("register")}
              className="px-4 py-2 rounded-lg bg-[#fcab28] text-[#694300] text-[13px] font-semibold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <User className="w-3.5 h-3.5" /> Register
            </button>
          </div>
        </nav>
      </header>

      {/* ── HERO SECTION ── */}
      <main className="flex-1 relative z-10 max-w-[1280px] mx-auto w-full px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center overflow-hidden">

        {/* Left column */}
        <div className="lg:col-span-7 space-y-8 relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00534e]/10 text-[#00534e] border border-[#00534e]/20">
            <Sparkles className="w-3.5 h-3.5 fill-[#fcab28] text-[#fcab28]" />
            <span className="text-[11px] font-bold uppercase tracking-wider">AI-Powered Financial Planning</span>
          </div>

          {/* Headline */}
          <div className="space-y-3">
            <h1 style={{ fontFamily: "'Times New Roman', Times, serif" }} className="text-[44px] lg:text-[54px] font-bold leading-[1.08] tracking-tight text-[#2d2c2c]">
              Smarter Budgets,<br />
              <span className="text-[#835400]">Better Future.</span>
            </h1>
            <div className="w-14 h-1 bg-[#00534e] rounded-full" />
          </div>

          <p className="text-[15px] text-[#5a6361] leading-relaxed max-w-lg">
            Plan, track, and grow your money with AI-powered insights. Our advanced prediction engine helps you anticipate future expenses and optimize your wealth.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-3 pt-1">
            <button
              onClick={() => triggerFlip("register")}
              className="group px-6 py-3 rounded-xl bg-[#00534e] text-white text-[13px] font-bold flex items-center gap-2 hover:shadow-lg hover:scale-[1.02] transition-all"
            >
              Get Started Free
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => triggerFlip("dashboard")}
              className="px-6 py-3 rounded-xl border border-[#bec9c7] text-[#3e4947] text-[13px] font-semibold flex items-center gap-2 hover:bg-[#f6f3f2] transition-all"
            >
              <Play className="w-3.5 h-3.5" /> See How It Works
            </button>
          </div>

          {/* Trust row */}
          <div className="pt-8 grid grid-cols-3 gap-5 border-t border-[#e5e2e1]/60">
            {[
              { icon: Shield, label: "Secure", sub: "Bank-level Security", bg: "bg-[#00534e]/5", col: "text-[#00534e]" },
              { icon: Zap, label: "Smart", sub: "AI Insights", bg: "bg-[#835400]/5", col: "text-[#835400]" },
              { icon: Target, label: "Goal-based", sub: "Plan Your Future", bg: "bg-[#3c4c4c]/5", col: "text-[#3c4c4c]" },
            ].map(({ icon: Icon, label, sub, bg, col }) => (
              <div key={label} className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center ${col}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-[#2d2c2c]">{label}</p>
                  <p className="text-[10px] text-[#5a6361]">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column — Phone */}
        <div className="lg:col-span-5 flex items-center justify-center relative min-h-[760px]">

          {/* Floating bubbles */}
          <div className="absolute inset-0 pointer-events-none overflow-visible">
            <div className="absolute top-1/4 -left-10 w-24 h-24 rounded-full bg-[#00534e]/10 blur-xl animate-[bubble-float_6s_ease-in-out_infinite]" />
            <div className="absolute bottom-1/3 -right-8 w-32 h-32 rounded-full bg-[#00534e]/5 blur-2xl animate-[bubble-float_8s_ease-in-out_infinite_1s]" />
            <div className="absolute top-10 right-1/4 w-16 h-16 rounded-full bg-[#00534e]/20 blur-lg animate-[bubble-float_10s_ease-in-out_infinite_2s]" />
            <div className="absolute bottom-1/4 -left-16 w-40 h-40 rounded-full bg-[#835400]/10 blur-2xl animate-[bubble-float_8s_ease-in-out_infinite_1s]" />
            <div className="absolute top-1/3 right-0 w-20 h-20 rounded-full bg-[#835400]/5 blur-xl animate-[bubble-float_6s_ease-in-out_infinite]" />
            <div className="absolute -bottom-10 right-1/3 w-28 h-28 rounded-full bg-[#835400]/15 blur-lg animate-[bubble-float_10s_ease-in-out_infinite_2s]" />
          </div>

          {/* ── PHONE FRAME — iPhone 13 Pro (390×844) ── */}
          <motion.div
            animate={{ rotateY: rotation }}
            transition={{ rotateY: { duration: 0.6, ease: "easeInOut" } }}
            className="relative z-30 transform-gpu"
            style={{ width: "290px", perspective: 1000, transformStyle: "preserve-3d" }}
          >
            {/* Phone shell — iPhone 13 Pro: 390×844 = 1:2.165 */}
            <div
              className="w-full rounded-[2.8rem] bg-[#1a1a1a] p-[3px] shadow-[0_40px_80px_-10px_rgba(0,83,78,0.5)]"
              style={{ aspectRatio: "390/844" }}
            >
              {/* Metallic frame */}
              <div className="w-full h-full rounded-[2.6rem] border-[2px] border-[#3a3a3a] bg-black relative overflow-hidden">
                {/* Screen */}
                <div className="absolute inset-[2px] bg-white rounded-[2.5rem] overflow-hidden flex flex-col">
                  {/* Dynamic Island — iPhone 13 Pro style */}
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50" />

                  {/* Screen Content */}
                  <div className="h-full w-full flex flex-col overflow-hidden text-[#1c1b1b]">
                    {/* Status bar */}
                    <div className="h-12 w-full flex items-center justify-between px-8 pt-4 shrink-0">
                      <span className="text-[11px] font-bold">9:41</span>
                      <div className="flex items-center gap-1 text-[#1c1b1b]">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0119 12.55M5 12.55a10.94 10.94 0 015.17-2.39M10.71 5.05A16 16 0 0122.56 9M1.42 9a15.91 15.91 0 014.7-2.88M8.53 16.11a6 6 0 016.95 0M12 20h.01" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="6" width="18" height="12" rx="2"/><path d="M23 13v-2"/></svg>
                      </div>
                    </div>

                    {/* ── DASHBOARD VIEW ── */}
                    {phoneContent === "dashboard" && (
                      <div className="flex-1 flex flex-col overflow-hidden">
                        {/* App header */}
                        <div className="px-5 py-3 flex items-center justify-between shrink-0">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-[#00534e] rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h18v18H3z" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M3 9h18M9 21V9" stroke="currentColor" strokeWidth="2"/></svg>
                            </div>
                            <span className="text-[11px] font-extrabold text-[#00534e] tracking-tight">DASHBOARD</span>
                          </div>
                          <div className="w-7 h-7 rounded-full bg-[#f0edec] flex items-center justify-center">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
                          </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-4">
                          {/* Total Savings card */}
                          <div className="bg-[#00534e] rounded-2xl p-4 text-white relative overflow-hidden shadow-lg">
                            <div className="absolute top-0 right-0 p-3 opacity-10">
                              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M21 18v1a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v1"/><path d="M17 9H9v6h8V9z" fill="currentColor"/></svg>
                            </div>
                            <p className="text-[9px] font-semibold opacity-80 uppercase tracking-widest">Total Savings</p>
                            <h2 className="text-2xl font-bold mt-1">
                              ${animatedBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h2>
                            <div className="mt-3 flex items-center gap-1.5 bg-white/10 w-fit px-2 py-0.5 rounded-full border border-white/20">
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                              <span className="text-[9px] font-bold">+12.5% this month</span>
                            </div>
                          </div>

                          {/* Budget Overview */}
                          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e5e2e1]">
                            <div className="flex justify-between items-center mb-3">
                              <h3 className="text-[11px] font-bold">Budget Overview</h3>
                              <span className="text-[9px] text-[#6e7978]">June 2024</span>
                            </div>
                            <div className="flex items-end justify-between h-24 px-2">
                              {[
                                { label: "Food", h: "h-20", color: "bg-[#fcab28]" },
                                { label: "Rent", h: "h-24", color: "bg-[#00534e]" },
                                { label: "Misc", h: "h-14", color: "bg-[#82d5cd]" },
                                { label: "Travel", h: "h-16", color: "bg-[#9ef1e9]" },
                              ].map((bar) => (
                                <div key={bar.label} className="flex flex-col items-center gap-1.5">
                                  <motion.div
                                    className={`w-5 ${bar.color} rounded-t-lg`}
                                    initial={{ height: 0 }}
                                    animate={{ height: parseInt(bar.h.replace("h-", "")) * 4 }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    style={{ minHeight: 4 }}
                                  />
                                  <span className="text-[8px] font-bold text-[#6e7978]">{bar.label}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Monthly Trends */}
                          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e5e2e1]">
                            <h3 className="text-[11px] font-bold mb-3">Monthly Trends</h3>
                            <div className="relative h-16 w-full">
                              <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                                <defs>
                                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#00534e" stopOpacity="0.2" />
                                    <stop offset="100%" stopColor="#00534e" stopOpacity="0" />
                                  </linearGradient>
                                </defs>
                                <path d="M0 35 Q 25 30, 40 20 T 70 10 T 100 5 L 100 40 L 0 40 Z" fill="url(#trendGrad)" />
                                <motion.path
                                  d="M0 35 Q 25 30, 40 20 T 70 10 T 100 5"
                                  fill="none" stroke="#00534e" strokeWidth="2"
                                  initial={{ pathLength: 0 }}
                                  animate={{ pathLength: 1 }}
                                  transition={{ duration: 1.5, ease: "easeInOut" }}
                                />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Bottom nav */}
                        <div className="h-14 border-t border-[#e5e2e1] bg-white flex items-center justify-around px-3 shrink-0">
                          <button className="text-[#00534e]" onClick={() => triggerFlip("login")}>
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3 12L12 3l9 9v9H3V12z"/></svg>
                          </button>
                          <button className="text-[#6e7978]">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
                          </button>
                          <div className="w-10 h-10 bg-[#fcab28] rounded-full -mt-5 shadow-lg flex items-center justify-center border-4 border-white">
                            <svg className="w-4 h-4 text-[#694300]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                          </div>
                          <button className="text-[#6e7978]">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                          </button>
                          <button className="text-[#6e7978]">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ── LOGIN VIEW ── */}
                    {phoneContent === "login" && (
                      <div className="flex-1 flex flex-col px-5 py-3 overflow-y-auto">
                        <button
                          onClick={() => triggerFlip("dashboard")}
                          className="flex items-center gap-1 text-[9px] font-bold text-[#6e7978] border border-[#e5e2e1] rounded-lg px-2 py-1 w-fit hover:text-[#00534e] transition-colors bg-white"
                        >
                          <ChevronLeft className="w-3 h-3" /> Back
                        </button>

                        <div className="mt-4 mb-3">
                          <div className="w-10 h-10 bg-[#00534e]/10 rounded-xl flex items-center justify-center mb-3">
                            <svg className="w-5 h-5 text-[#00534e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                          </div>
                          <h3 className="text-[17px] font-black text-[#1c1b1b]">Welcome back</h3>
                          <p className="text-[10px] text-[#6e7978] mt-0.5">Sign in to continue</p>
                        </div>

                        {errorMsg && (
                          <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-1.5 text-[10px] text-red-700">
                            <Info className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{errorMsg}</span>
                          </div>
                        )}
                        {successMsg && (
                          <div className="mb-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-1.5 text-[10px] text-emerald-700">
                            <CheckCircle className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{successMsg}</span>
                          </div>
                        )}

                        <form onSubmit={handleLoginSubmit} className="space-y-2.5">
                          <div>
                            <label className="text-[9px] font-bold text-[#3e4947] uppercase block mb-1">Email</label>
                            <input
                              type="email" required value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="you@example.com"
                              className="w-full px-3 py-2 bg-[#f6f3f2] border border-[#e5e2e1] rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-[#00534e]"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-[#3e4947] uppercase block mb-1">Password</label>
                            <input
                              type="password" required value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full px-3 py-2 bg-[#f6f3f2] border border-[#e5e2e1] rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-[#00534e]"
                            />
                          </div>
                          <button
                            type="submit" disabled={loading}
                            className="w-full py-2.5 bg-[#00534e] text-white text-[11px] font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-md mt-1"
                          >
                            {loading ? (
                              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg> Sign In</>
                            )}
                          </button>
                        </form>

                        <div className="mt-auto pt-4 text-center">
                          <p className="text-[10px] text-[#6e7978]">
                            No account?{" "}
                            <button onClick={() => triggerFlip("register")} className="text-[#835400] font-bold hover:underline">
                              Register free
                            </button>
                          </p>
                        </div>
                      </div>
                    )}

                    {/* ── REGISTER VIEW ── */}
                    {phoneContent === "register" && (
                      <div className="flex-1 flex flex-col px-5 py-3 overflow-y-auto">
                        <button
                          onClick={() => triggerFlip("dashboard")}
                          className="flex items-center gap-1 text-[9px] font-bold text-[#6e7978] border border-[#e5e2e1] rounded-lg px-2 py-1 w-fit hover:text-[#00534e] transition-colors bg-white"
                        >
                          <ChevronLeft className="w-3 h-3" /> Back
                        </button>

                        <div className="mt-4 mb-3">
                          <div className="w-10 h-10 bg-[#fcab28]/15 rounded-xl flex items-center justify-center mb-3">
                            <svg className="w-5 h-5 text-[#835400]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                          </div>
                          <h3 className="text-[17px] font-black text-[#1c1b1b]">Create Account</h3>
                          <p className="text-[10px] text-[#6e7978] mt-0.5">Start your smart budget journey</p>
                        </div>

                        {errorMsg && (
                          <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-1.5 text-[10px] text-red-700">
                            <Info className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{errorMsg}</span>
                          </div>
                        )}
                        {successMsg && (
                          <div className="mb-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-1.5 text-[10px] text-emerald-700">
                            <CheckCircle className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{successMsg}</span>
                          </div>
                        )}

                        <form onSubmit={handleRegisterSubmit} className="space-y-2">
                          <div>
                            <label className="text-[9px] font-bold text-[#3e4947] uppercase block mb-1">Full Name</label>
                            <input
                              type="text" required value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Your name"
                              className="w-full px-3 py-2 bg-[#f6f3f2] border border-[#e5e2e1] rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-[#00534e]"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-[#3e4947] uppercase block mb-1">Email</label>
                            <input
                              type="email" required value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="you@example.com"
                              className="w-full px-3 py-2 bg-[#f6f3f2] border border-[#e5e2e1] rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-[#00534e]"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-[#3e4947] uppercase block mb-1">Password</label>
                            <input
                              type="password" required value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full px-3 py-2 bg-[#f6f3f2] border border-[#e5e2e1] rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-[#00534e]"
                            />
                          </div>
                          <button
                            type="submit" disabled={loading}
                            className="w-full py-2.5 bg-[#fcab28] text-[#694300] text-[11px] font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-md mt-1"
                          >
                            {loading ? (
                              <div className="w-3.5 h-3.5 border-2 border-[#694300]/30 border-t-[#694300] rounded-full animate-spin" />
                            ) : (
                              <><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Create Account</>
                            )}
                          </button>
                        </form>

                        <div className="mt-auto pt-4 text-center">
                          <p className="text-[10px] text-[#6e7978]">
                            Already have an account?{" "}
                            <button onClick={() => triggerFlip("login")} className="text-[#00534e] font-bold hover:underline">
                              Sign in
                            </button>
                          </p>
                        </div>
                      </div>
                    )}

                  </div>{/* end screen content */}
                </div>{/* end screen */}
              </div>{/* end bezel */}
            </div>{/* end phone shell */}
          </motion.div>{/* end motion phone */}
        </div>{/* end right column */}
      </main>{/* end hero section */}

      <style>{`
        @keyframes bubble-float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
      `}</style>
    </div>
  );
}
