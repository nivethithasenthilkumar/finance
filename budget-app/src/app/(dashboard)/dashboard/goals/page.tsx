"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/app-store";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, ShieldCheck, Umbrella, CreditCard, TrendingUp,
  Target, Trophy, CheckCircle2, Circle, X, Check, Sparkles,
} from "lucide-react";

// ── Types ──
interface Goal {
  id: string;
  name: string;
  category: string;
  icon: React.ReactNode;
  iconBg: string;
  ringColor: string;      // stroke colour class
  ringColorHex: string;   // for inline SVG
  textColor: string;
  statusBg: string;
  statusText: string;
  statusLabel: "On Track" | "Behind";
  current: number;
  target: number;
  expected: string;
  pctOffset: number;      // stroke-dashoffset  (circumference 351.85)
  pct: number;
}

const INITIAL: Goal[] = [
  { id:"g1", name:"Emergency Fund",  category:"Financial Security", icon:<ShieldCheck className="w-5 h-5"/>, iconBg:"bg-[#9ef1e9]/30",      ringColor:"text-[#00534e]", ringColorHex:"#00534e", textColor:"text-[#00534e]", statusBg:"bg-[#00534e]/10", statusText:"text-[#00534e]", statusLabel:"On Track", current:3000,  target:5000,  expected:"Dec 2024", pctOffset:140.74, pct:60 },
  { id:"g2", name:"Vacation Trip",   category:"Travel & Experiences", icon:<Umbrella className="w-5 h-5"/>,  iconBg:"bg-[#ffddb5]/40",      ringColor:"text-[#fcab28]", ringColorHex:"#fcab28", textColor:"text-[#835400]", statusBg:"bg-[#835400]/10", statusText:"text-[#835400]", statusLabel:"On Track", current:1350,  target:3000,  expected:"Aug 2025", pctOffset:193.52, pct:45 },
  { id:"g3", name:"Debt Free",       category:"Financial Freedom",    icon:<CreditCard className="w-5 h-5"/>, iconBg:"bg-[#ffdad6]/40",     ringColor:"text-[#ba1a1a]", ringColorHex:"#ba1a1a", textColor:"text-[#ba1a1a]", statusBg:"bg-[#ba1a1a]/10", statusText:"text-[#ba1a1a]", statusLabel:"Behind",   current:2100,  target:7000,  expected:"May 2026", pctOffset:246.30, pct:30 },
  { id:"g4", name:"Investment Goal", category:"Grow Your Wealth",     icon:<TrendingUp className="w-5 h-5"/>, iconBg:"bg-[#d4e6e5]/50",    ringColor:"text-[#3c4c4c]", ringColorHex:"#3c4c4c", textColor:"text-[#3c4c4c]", statusBg:"bg-[#3c4c4c]/10", statusText:"text-[#3c4c4c]", statusLabel:"On Track", current:4000,  target:10000, expected:"Dec 2026", pctOffset:211.11, pct:40 },
];

function getGoalIcon(category: string) {
  const cat = (category || "").toLowerCase();
  if (cat.includes("secur") || cat.includes("emerg") || cat.includes("protect")) return <ShieldCheck className="w-5 h-5"/>;
  if (cat.includes("trav") || cat.includes("trip") || cat.includes("vacation") || cat.includes("exper")) return <Umbrella className="w-5 h-5"/>;
  if (cat.includes("debt") || cat.includes("loan") || cat.includes("card") || cat.includes("pay")) return <CreditCard className="w-5 h-5"/>;
  if (cat.includes("grow") || cat.includes("invest") || cat.includes("stock") || cat.includes("wealth")) return <TrendingUp className="w-5 h-5"/>;
  return <Target className="w-5 h-5"/>;
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-xl border border-[#e5e2e1] shadow-sm ${className}`}>{children}</div>;
}

// ── Ring progress ──
function Ring({ pct, offset, colorHex, label, textColor }: {
  pct: number; offset: number; colorHex: string; label: string; textColor: string;
}) {
  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full" style={{ transform: "rotate(-90deg)" }} viewBox="0 0 128 128">
        <circle cx="64" cy="64" r="56" fill="transparent" stroke="#e5e2e1" strokeWidth="8" />
        <motion.circle cx="64" cy="64" r="56" fill="transparent" stroke={colorHex} strokeWidth="8"
          strokeLinecap="round" strokeDasharray="351.85"
          initial={{ strokeDashoffset: 351.85 }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className={`absolute inset-0 flex items-center justify-center text-[22px] font-bold ${textColor}`}>
        {pct}%
      </div>
    </div>
  );
}

// ── Create Goal Modal ──
function GoalModal({ open, onClose, onSave }: {
  open: boolean; onClose: () => void;
  onSave: (name: string, target: number, category: string, expected: string) => void;
}) {
  const [gname, setGname] = useState("");
  const [category, setCategory] = useState("Financial Security");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [err, setErr] = useState("");
  if (!open) return null;
  const submit = () => {
    if (!gname.trim()) return setErr("Goal name is required.");
    const n = parseFloat(amount);
    if (isNaN(n) || n <= 0) return setErr("Enter a valid target amount.");
    setErr("");
    
    // Convert date "YYYY-MM-DD" to user-friendly "MMM YYYY"
    let formattedDate = "Dec 2025";
    if (date) {
      const d = new Date(date);
      formattedDate = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    }
    
    onSave(gname.trim(), n, category, formattedDate);
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-[18px] font-bold text-[#1c1b1b]">Create New Goal</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#f0edec] text-[#6e7978]"><X className="w-4 h-4" /></button>
        </div>
        {err && <p className="text-[12px] text-[#ba1a1a] bg-[#ffdad6]/50 rounded-lg px-3 py-2 mb-3">{err}</p>}
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-bold text-[#3e4947] uppercase block mb-1">Goal Name</label>
            <input value={gname} onChange={e => setGname(e.target.value)} placeholder="e.g. Emergency Fund"
              className="w-full px-3 py-2.5 border border-[#bec9c7]/60 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#00534e]/30 bg-[#fcf9f8]" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-[#3e4947] uppercase block mb-1">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 border border-[#bec9c7]/60 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#00534e]/30 bg-[#fcf9f8] text-[#1c1b1b]">
              <option value="Financial Security">Financial Security</option>
              <option value="Travel & Experiences">Travel & Experiences</option>
              <option value="Financial Freedom">Financial Freedom</option>
              <option value="Grow Your Wealth">Grow Your Wealth</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-[#3e4947] uppercase block mb-1">Target ($)</label>
              <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="5000" type="number" min="0"
                className="w-full px-3 py-2.5 border border-[#bec9c7]/60 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#00534e]/30 bg-[#fcf9f8]" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[#3e4947] uppercase block mb-1">Target Date</label>
              <input value={date} onChange={e => setDate(e.target.value)} type="date"
                className="w-full px-3 py-2.5 border border-[#bec9c7]/60 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#00534e]/30 bg-[#fcf9f8]" />
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[#bec9c7] rounded-xl text-[13px] font-semibold text-[#3e4947] hover:bg-[#f0edec]">Cancel</button>
          <button onClick={submit} className="flex-[2] py-2.5 bg-[#00534e] text-white rounded-xl text-[13px] font-bold hover:opacity-90 shadow-sm">Create Goal</button>
        </div>
      </motion.div>
    </div>
  );
}

function AddMoneyModal({ open, onClose, goals, onAdd }: {
  open: boolean;
  onClose: () => void;
  goals: any[];
  onAdd: (goalId: string, amount: number) => void;
}) {
  const [selectedId, setSelectedId] = useState(goals[0]?.id || "");
  const [amount, setAmount] = useState("");
  const [err, setErr] = useState("");

  if (!open) return null;

  const submit = () => {
    if (!selectedId) return setErr("Please select a goal.");
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return setErr("Enter a valid amount.");
    onAdd(selectedId, val);
    setAmount("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-[18px] font-bold text-[#1c1b1b]">Add Money to Goal</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#f0edec] text-[#6e7978]"><X className="w-4 h-4" /></button>
        </div>
        {err && <p className="text-[12px] text-[#ba1a1a] bg-[#ffdad6]/50 rounded-lg px-3 py-2 mb-3">{err}</p>}
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-bold text-[#3e4947] uppercase block mb-1">Select Goal</label>
            <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
              className="w-full px-3 py-2.5 border border-[#bec9c7]/60 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#00534e]/30 bg-[#fcf9f8] text-[#1c1b1b]">
              <option value="">-- Choose a Goal --</option>
              {goals.map(g => (
                <option key={g.id} value={g.id}>{g.name} (${g.current} / ${g.target})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold text-[#3e4947] uppercase block mb-1">Contribution Amount ($)</label>
            <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" type="number" min="0" step="0.01"
              className="w-full px-3 py-2.5 border border-[#bec9c7]/60 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#00534e]/30 bg-[#fcf9f8]" />
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[#bec9c7] rounded-xl text-[13px] font-semibold text-[#3e4947] hover:bg-[#f0edec]">Cancel</button>
          <button onClick={submit} className="flex-[2] py-2.5 bg-[#fcab28] text-[#694300] rounded-xl text-[13px] font-bold hover:opacity-90 shadow-sm">
            Add Money
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function GoalsPage() {
  const { goals, addGoal, contributeToGoal, deleteGoal } = useAppStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [fundingOpen, setFundingOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [confetti, setConfetti] = useState(false);
  const [celebOpen, setCelebOpen] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const triggerCelebration = () => {
    setConfetti(true);
    setCelebOpen(true);
    setTimeout(() => setConfetti(false), 3000);
  };

  const handleCreateGoal = (name: string, target: number, category: string, expected: string) => {
    const ringColorHexs = ["#00534e", "#fcab28", "#ba1a1a", "#3c4c4c"];
    const textColors = ["text-[#00534e]", "text-[#835400]", "text-[#ba1a1a]", "text-[#3c4c4c]"];
    const statusBgs = ["bg-[#00534e]/10", "bg-[#835400]/10", "bg-[#ba1a1a]/10", "bg-[#3c4c4c]/10"];
    const statusTexts = ["text-[#00534e]", "text-[#835400]", "text-[#ba1a1a]", "text-[#3c4c4c]"];
    
    const idx = goals.length % 4;

    addGoal({
      name,
      category,
      ringColorHex: ringColorHexs[idx],
      textColor: textColors[idx],
      statusBg: statusBgs[idx],
      statusText: statusTexts[idx],
      statusLabel: "On Track",
      current: 0,
      target,
      expected,
    });
    showToast(`Goal "${name}" created!`);
  };

  const handleAddContribution = (goalId: string, amount: number) => {
    contributeToGoal(goalId, amount);
    showToast("Contribution added successfully!");
    const g = goals.find(x => x.id === goalId);
    if (g && g.current + amount >= g.target) {
      triggerCelebration();
    }
  };

  const totalGoals = goals.length;
  const onTrack = goals.filter(g => g.statusLabel === "On Track").length;
  const overallPct = goals.length > 0 
    ? Math.round(goals.reduce((sum, g) => {
        const pct = g.target > 0 ? Math.min(Math.round((g.current / g.target) * 100), 100) : 0;
        return sum + pct;
      }, 0) / goals.length) 
    : 0;

  return (
    <div className="animate-fade-in space-y-5">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-[100] bg-[#00534e] text-white px-5 py-3 rounded-xl shadow-xl text-[13px] font-semibold flex items-center gap-2">
            <Check className="w-4 h-4" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confetti */}
      {confetti && (
        <div className="fixed inset-0 pointer-events-none z-[99] overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div key={i} className="absolute w-2 h-2 rounded-sm"
              style={{ left: `${Math.random() * 100}%`, backgroundColor: ["#006d67","#fcab28","#82d5cd","#ffddb5","#00534e"][i % 5] }}
              initial={{ top: "-2%", rotate: 0, opacity: 1 }}
              animate={{ top: "110%", rotate: Math.random() * 720, opacity: 0 }}
              transition={{ duration: 2 + Math.random() * 1.5, delay: Math.random() * 0.5 }}
            />
          ))}
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-[#006d67] p-5 rounded-xl flex items-center justify-between border border-[#00534e]/20 shadow-sm overflow-hidden relative">
        <div className="z-10">
          <h2 className="text-[18px] font-bold text-white mb-0.5">Welcome! Start your journey to financial freedom.</h2>
          <p className="text-[13px] text-white/80">Setting a goal is the first step toward achieving your dreams. We&apos;re here to help you predict and succeed.</p>
        </div>
        <div className="hidden md:block text-white/15 shrink-0">
          <Sparkles className="w-24 h-24" />
        </div>
      </div>

      {/* Header + CTA */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-[28px] font-bold text-[#1c1b1b]">Goals</h1>
          <p className="text-[14px] text-[#3e4947]">Plan your financial future and achieve your dreams.</p>
        </div>
        <button onClick={() => setCreateOpen(true)}
          className="bg-[#00534e] hover:opacity-90 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 text-[13px] font-bold transition-all active:scale-95">
          <Plus className="w-4 h-4" /> Create New Goal
        </button>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* ── LEFT: 8 cols ── */}
        <div className="lg:col-span-8 space-y-5">

          {/* Summary banner */}
          <Card className="p-6 flex flex-col md:flex-row gap-5">
            <div className="flex-1 space-y-4">
              <h3 className="text-[22px] font-bold text-[#00534e] leading-tight">Bullseye! You&apos;re hitting your targets with precision.</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: <Target className="w-5 h-5 text-[#00534e]" />, bg: "bg-[#00534e]/10", val: String(totalGoals), label: "Total Goals" },
                  { icon: <Trophy className="w-5 h-5 text-[#835400]" />, bg: "bg-[#ffddb5]/40",  val: String(onTrack),    label: "On Track" },
                  { icon: <CheckCircle2 className="w-5 h-5 text-[#3c4c4c]" />, bg: "bg-[#d4e6e5]/50", val: `${overallPct}%`, label: "Overall Progress" },
                ].map(s => (
                  <div key={s.label} className="bg-[#f6f3f2] p-3 rounded-xl border border-[#e5e2e1]/60 flex flex-col gap-2">
                    <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center`}>{s.icon}</div>
                    <div className="text-[20px] font-bold text-[#1c1b1b]">{s.val}</div>
                    <div className="text-[11px] text-[#6e7978]">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Target visual */}
            <div className="flex items-center justify-center shrink-0 self-center">
              <div className="relative">
                <div className="w-28 h-28 bg-[#00534e]/10 rounded-full border-4 border-[#00534e]/20 flex items-center justify-center shadow-xl">
                  <Target className="w-14 h-14 text-[#00534e]" />
                </div>
                <div className="absolute -top-3 -right-3 bg-[#fcab28] text-[#694300] px-2 py-0.5 rounded-lg shadow text-[11px] font-bold rotate-12">Goal Hit!</div>
              </div>
            </div>
          </Card>

          {/* Goals grid */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[18px] font-bold text-[#1c1b1b]">Your Goals</h3>
              <select className="text-[12px] border border-[#bec9c7]/60 rounded-lg px-3 py-1.5 bg-[#fcf9f8] text-[#3e4947] focus:outline-none">
                <option>All Goals</option><option>On Track</option><option>Behind</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.length === 0 ? (
                <div className="col-span-2 bg-white border border-[#e5e2e1] rounded-2xl p-10 text-center flex flex-col items-center justify-center">
                  <div className="text-[40px] mb-3">🎯</div>
                  <h4 className="font-bold text-[16px] text-[#1c1b1b] mb-1">No Goals Set</h4>
                  <p className="text-[13px] text-[#6e7978] mb-4">Set your first savings goal to track your progress.</p>
                  <button onClick={() => setCreateOpen(true)} className="px-5 py-2.5 bg-[#00534e] text-white text-[13px] font-bold rounded-xl hover:opacity-90 shadow-sm">
                    + Create First Goal
                  </button>
                </div>
              ) : (
                goals.map((g, idx) => {
                  const pctVal = g.target > 0 ? Math.min(Math.round((g.current / g.target) * 100), 100) : 0;
                  const pctOffset = 351.85 - (pctVal / 100) * 351.85;
                  const iconBgs = ["bg-[#9ef1e9]/30", "bg-[#ffddb5]/40", "bg-[#ffdad6]/40", "bg-[#d4e6e5]/50"];
                  const iconBg = iconBgs[idx % 4];
                  return (
                    <motion.div key={g.id} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                      <Card className="p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-5">
                          <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center ${g.textColor || "text-[#00534e]"}`}>
                            {getGoalIcon(g.category)}
                          </div>
                          <div>
                            <h4 className="text-[13px] font-bold text-[#1c1b1b]">{g.name}</h4>
                            <p className="text-[11px] text-[#6e7978]">{g.category}</p>
                          </div>
                        </div>
                        <div className="flex justify-center mb-5">
                          <Ring pct={pctVal} offset={pctOffset} colorHex={g.ringColorHex || "#00534e"} label={g.name} textColor={g.textColor || "text-[#00534e]"} />
                        </div>
                        <div className="text-center space-y-1">
                          <div className={`text-[20px] font-bold ${g.textColor || "text-[#00534e]"}`}>
                            {fmt(g.current)} <span className="text-[14px] text-[#6e7978] font-normal">/ {fmt(g.target)}</span>
                          </div>
                          <p className="text-[11px] text-[#6e7978]">Expected: {g.expected}</p>
                          <div className={`inline-block mt-3 px-3 py-0.5 ${g.statusBg || "bg-[#00534e]/10"} ${g.statusText || "text-[#00534e]"} rounded-full text-[11px] font-bold`}>
                            {g.statusLabel}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </div>
            {goals.length > 0 && (
              <button onClick={() => setCreateOpen(true)}
                className="w-full mt-4 py-3.5 border border-[#bec9c7] rounded-xl text-[13px] font-semibold text-[#00534e] flex items-center justify-center gap-2 hover:bg-[#f6f3f2] transition-colors group">
                Create Another Goal
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            )}
          </div>
        </div>

        {/* ── RIGHT: 4 cols ── */}
        <aside className="lg:col-span-4 space-y-4">

          {/* Goal Summary */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-[#00534e]" />
              <h3 className="text-[14px] font-bold text-[#1c1b1b]">Goal Summary</h3>
            </div>
            <div className="space-y-3">
              {goals.map(g => {
                const pctVal = g.target > 0 ? Math.min(Math.round((g.current / g.target) * 100), 100) : 0;
                return (
                  <div key={g.id}>
                    <div className="flex justify-between text-[12px] mb-1">
                      <span className="font-semibold text-[#1c1b1b]">{g.name}</span>
                      <span className={`font-bold ${g.textColor || "text-[#00534e]"}`}>{pctVal}%</span>
                    </div>
                    <div className="h-1.5 bg-[#e5e2e1] rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full" style={{ backgroundColor: g.ringColorHex || "#00534e" }}
                        initial={{ width: 0 }} animate={{ width: `${pctVal}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* AI Recommendations */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[#00534e]" />
              <h3 className="text-[14px] font-bold text-[#1c1b1b]">AI Recommendations</h3>
            </div>
            <p className="text-[13px] text-[#3e4947] mb-4">
              Based on your spending, we recommend increasing your monthly savings by{" "}
              <span className="font-bold text-[#00534e]">$150</span> to reach your goals faster.
            </p>
            <button onClick={() => showToast("Opening AI recommendations…")}
              className="w-full py-2.5 bg-[#00534e]/10 hover:bg-[#00534e]/15 text-[#00534e] text-[12px] font-bold rounded-lg transition-colors">
              View Recommendations
            </button>
          </Card>

          {/* Recent Achievements */}
          <Card className="p-5 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-4 h-4 text-[#835400]" />
              <h3 className="text-[14px] font-bold text-[#1c1b1b]">Recent Achievements</h3>
            </div>
            <div className="space-y-3">
              {[
                { icon: "🛡️", text: "Emergency Fund reached $3,000!", time: "Today", col: "text-[#00534e]" },
                { icon: "✈️", text: "Vacation savings goal at 45%", time: "Yesterday", col: "text-[#835400]" },
                { icon: "📈", text: "Investment goal updated", time: "3 days ago", col: "text-[#3c4c4c]" },
              ].map((a, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 bg-[#f6f3f2] rounded-xl">
                  <span className="text-[18px] shrink-0">{a.icon}</span>
                  <div>
                    <p className={`text-[12px] font-bold ${a.col}`}>{a.text}</p>
                    <p className="text-[10px] text-[#6e7978]">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* decorative */}
            <div className="absolute -top-2 -right-2 opacity-20"><Sparkles className="w-10 h-10 text-[#835400]" /></div>
          </Card>
        </aside>
      </div>

      {/* Bottom action bar */}
      <div className="bg-[#006d67] p-5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-5 border border-[#00534e]/20">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="text-[16px] font-bold text-white">Stay Consistent, See Results</h4>
            <p className="text-[13px] text-white/80">Small steps today lead to big achievements tomorrow. Keep going! 💪</p>
          </div>
        </div>
        <button onClick={() => setFundingOpen(true)}
          className="bg-[#fcab28] hover:opacity-90 text-[#694300] px-7 py-2.5 rounded-lg text-[13px] font-bold shadow-lg transition-all active:scale-95 whitespace-nowrap">
          Add Money to Goal
        </button>
      </div>

      {/* Celebration Modal */}
      <AnimatePresence>
        {celebOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setCelebOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-white/90 backdrop-blur-md w-full max-w-lg rounded-3xl p-8 z-10 shadow-2xl border border-white/30 text-center">
              <button onClick={() => setCelebOpen(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full hover:bg-black/5 flex items-center justify-center">
                <X className="w-4 h-4 text-[#3e4947]" />
              </button>
              <div className="text-[56px] mb-4">🎯</div>
              <h2 className="text-[28px] font-black text-[#00534e] mb-3">Incredible Progress!</h2>
              <p className="text-[15px] text-[#3e4947] mb-6 max-w-md mx-auto">
                You&apos;re moving closer to your financial freedom. Every dollar saved is a step toward your dreams.
              </p>
              {/* Target rings decoration */}
              <div className="flex justify-center mb-6">
                <div className="relative w-32 h-32">
                  {[56,44,32,20,8].map((r, i) => (
                    <div key={r} className="absolute inset-0 rounded-full border-4"
                      style={{ borderColor: ["#006d67","#ffffff","#006d67","#ffffff","#ba1a1a"][i], margin: `${i * 8}px` }} />
                  ))}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 bg-[#ba1a1a] rounded-full" />
                  </div>
                </div>
              </div>
              <button onClick={() => setCelebOpen(false)}
                className="bg-[#00534e] hover:opacity-90 text-white px-10 py-3 rounded-xl text-[14px] font-bold shadow-lg transition-all hover:-translate-y-0.5">
                Continue Your Journey
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Goal Modal */}
      <GoalModal open={createOpen} onClose={() => setCreateOpen(false)} onSave={handleCreateGoal} />

      {/* Add Money Modal */}
      <AddMoneyModal open={fundingOpen} onClose={() => setFundingOpen(false)} goals={goals} onAdd={handleAddContribution} />
    </div>
  );
}
