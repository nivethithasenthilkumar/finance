"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/app-store";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, TrendingDown, AlertTriangle, Sparkles, X, Check,
  Home, Utensils, Car, Zap, ShoppingBag, Tv, Trophy,
} from "lucide-react";

// ── Types ──
interface BudgetCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  budget: number;
  spent: number;
  status: "on-track" | "at-risk" | "over";
  statusColor: string;
  barColor: string;
}

const INITIAL_CATS: BudgetCategory[] = [
  { id:"c1", name:"Housing",       icon:<Home className="w-4 h-4"/>,       iconBg:"bg-[#00534e]/10", iconColor:"text-[#00534e]", budget:1800, spent:1225.40, status:"on-track", statusColor:"text-[#00534e]", barColor:"bg-[#00534e]" },
  { id:"c2", name:"Food",          icon:<Utensils className="w-4 h-4"/>,    iconBg:"bg-[#835400]/10", iconColor:"text-[#835400]", budget:700,  spent:574.80,  status:"at-risk",  statusColor:"text-[#835400]", barColor:"bg-[#fcab28]" },
  { id:"c3", name:"Transportation",icon:<Car className="w-4 h-4"/>,         iconBg:"bg-[#006d67]/10", iconColor:"text-[#006d67]", budget:800,  spent:430.20,  status:"on-track", statusColor:"text-[#00534e]", barColor:"bg-[#006d67]" },
  { id:"c4", name:"Utilities",     icon:<Zap className="w-4 h-4"/>,         iconBg:"bg-[#3c4c4c]/10", iconColor:"text-[#3c4c4c]", budget:500,  spent:324.30,  status:"on-track", statusColor:"text-[#00534e]", barColor:"bg-[#3c4c4c]" },
  { id:"c5", name:"Shopping",      icon:<ShoppingBag className="w-4 h-4"/>, iconBg:"bg-[#ba1a1a]/10", iconColor:"text-[#ba1a1a]", budget:400,  spent:361.00,  status:"over",     statusColor:"text-[#ba1a1a]", barColor:"bg-[#ba1a1a]" },
  { id:"c6", name:"Entertainment", icon:<Tv className="w-4 h-4"/>,          iconBg:"bg-[#00534e]/10", iconColor:"text-[#00534e]", budget:300,  spent:135.20,  status:"on-track", statusColor:"text-[#00534e]", barColor:"bg-[#00534e]" },
];

function getCategoryIcon(catName: string) {
  const name = (catName || "").toLowerCase();
  if (name.includes("hous") || name.includes("rent") || name.includes("home")) return <Home className="w-4 h-4"/>;
  if (name.includes("food") || name.includes("eat") || name.includes("grocer") || name.includes("rest")) return <Utensils className="w-4 h-4"/>;
  if (name.includes("car") || name.includes("travel") || name.includes("trans")) return <Car className="w-4 h-4"/>;
  if (name.includes("util") || name.includes("bill") || name.includes("power") || name.includes("elect")) return <Zap className="w-4 h-4"/>;
  if (name.includes("shop") || name.includes("buy") || name.includes("cloth")) return <ShoppingBag className="w-4 h-4"/>;
  if (name.includes("show") || name.includes("movi") || name.includes("play") || name.includes("tv") || name.includes("ent")) return <Tv className="w-4 h-4"/>;
  return <Sparkles className="w-4 h-4"/>;
}

const STATUS_LABELS: Record<string, string> = {
  "on-track": "On Track",
  "at-risk":  "At Risk",
  "over":     "Over Budget",
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function pct(spent: number, budget: number) {
  return Math.min(Math.round((spent / budget) * 100), 100);
}

// ── Card / Modal helpers ──
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-xl border border-[#e5e2e1] shadow-sm ${className}`}>{children}</div>;
}

function BudgetModal({ open, onClose, onSave, onDelete, initial }: {
  open: boolean; onClose: () => void;
  onSave: (name: string, budget: number) => void;
  onDelete?: () => void;
  initial?: { name: string; budget: number };
}) {
  const [bname, setBname] = useState(initial?.name ?? "");
  const [amount, setAmount] = useState(initial?.budget ? String(initial.budget) : "");
  const [err, setErr] = useState("");
  if (!open) return null;
  const submit = () => {
    if (!bname.trim()) return setErr("Name is required.");
    const n = parseFloat(amount);
    if (isNaN(n) || n <= 0) return setErr("Enter a valid amount.");
    setErr(""); onSave(bname.trim(), n); onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-[18px] font-bold text-[#1c1b1b]">{initial ? "Edit Budget" : "Create New Budget"}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#f0edec] text-[#6e7978]"><X className="w-4 h-4" /></button>
        </div>
        {err && <p className="text-[12px] text-[#ba1a1a] bg-[#ffdad6]/50 rounded-lg px-3 py-2 mb-3">{err}</p>}
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-bold text-[#3e4947] uppercase block mb-1">Budget Name / Category</label>
            <input value={bname} onChange={e => setBname(e.target.value)} placeholder="e.g. Housing, Food, Shopping..."
              className="w-full px-3 py-2.5 border border-[#bec9c7]/60 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#00534e]/30 bg-[#fcf9f8]" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-[#3e4947] uppercase block mb-1">Total Amount ($)</label>
            <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" type="number" min="0" step="0.01"
              className="w-full px-3 py-2.5 border border-[#bec9c7]/60 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#00534e]/30 bg-[#fcf9f8]" />
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          {initial && onDelete && (
            <button onClick={() => { onDelete(); onClose(); }} className="px-3 py-2.5 border border-[#ba1a1a] text-[#ba1a1a] rounded-xl text-[13px] font-semibold hover:bg-[#ba1a1a]/5">
              Delete
            </button>
          )}
          <button onClick={onClose} className="flex-1 py-2.5 border border-[#bec9c7] rounded-xl text-[13px] font-semibold text-[#3e4947] hover:bg-[#f0edec]">Cancel</button>
          <button onClick={submit} className="flex-[2] py-2.5 bg-[#00534e] text-white rounded-xl text-[13px] font-bold hover:opacity-90 shadow-sm">
            {initial ? "Save Changes" : "Create Budget"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function BudgetPlannerPage() {
  const { budgets, addBudget, updateBudget, deleteBudget } = useAppStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [editCat, setEditCat] = useState<any | null>(null);
  const [toast, setToast] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  const totalBudget  = budgets.reduce((a, c) => a + c.budget, 0);
  const totalSpent   = budgets.reduce((a, c) => a + c.spent, 0);
  const totalRemain  = totalBudget - totalSpent;
  const spentPct     = totalBudget > 0 ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100) : 0;

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const handleCreateSave = (name: string, budget: number) => {
    const barColors = ["bg-[#00534e]", "bg-[#fcab28]", "bg-[#006d67]", "bg-[#3c4c4c]", "bg-[#ba1a1a]"];
    const textColors = ["text-[#00534e]", "text-[#835400]", "text-[#006d67]", "text-[#3c4c4c]", "text-[#ba1a1a]"];
    const bgColors = ["bg-[#00534e]/10", "bg-[#ffddb5]/40", "bg-[#006d67]/10", "bg-[#3c4c4c]/10", "bg-[#ba1a1a]/10"];
    
    const idx = budgets.length % 5;

    addBudget({
      name,
      category: name,
      budget,
      barColor: barColors[idx],
      iconBg: bgColors[idx],
      iconColor: textColors[idx],
    });
    showToast(`Budget "${name}" created!`);
  };

  const handleEditSave = (name: string, budget: number) => {
    if (!editCat) return;
    updateBudget(editCat.id, {
      name,
      category: name,
      budget,
      barColor: editCat.barColor,
      iconBg: editCat.iconBg,
      iconColor: editCat.iconColor,
    });
    showToast("Budget updated!");
  };

  const handleDeleteBudget = () => {
    if (!editCat) return;
    deleteBudget(editCat.id);
    showToast("Budget deleted!");
  };

  const triggerCelebration = () => {
    setShowConfetti(true);
    showToast("🎉 Goal Achieved! Monthly savings target hit!");
    setTimeout(() => setShowConfetti(false), 4000);
  };

  return (
    <div className="animate-fade-in">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-[100] bg-[#00534e] text-white px-5 py-3 rounded-xl shadow-xl text-[13px] font-semibold flex items-center gap-2">
            <Check className="w-4 h-4" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confetti dots */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[99] overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.div key={i}
              className="absolute w-2 h-2 rounded-sm"
              style={{ left: `${Math.random() * 100}%`, backgroundColor: ["#006d67","#fcab28","#82d5cd","#ffddb5"][i % 4] }}
              initial={{ top: "-2%", rotate: 0, opacity: 1 }}
              animate={{ top: "110%", rotate: Math.random() * 720 - 360, opacity: 0 }}
              transition={{ duration: 2 + Math.random() * 1.5, delay: Math.random() * 0.8, ease: "easeIn" }}
            />
          ))}
        </div>
      )}

      {/* Page header */}
      <div className="flex justify-between items-end mb-7 flex-wrap gap-4">
        <div>
          <h1 className="text-[32px] font-bold text-[#00534e] mb-1">Budgets</h1>
          <p className="text-[14px] text-[#3e4947]">Plan, track, and manage your budgets with AI.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#6e7978] text-[#00534e] text-[13px] font-semibold hover:bg-[#f6f3f2] transition-all">
            <Plus className="w-4 h-4" /> Create Budget
          </button>
          <button onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#006d67] text-white text-[13px] font-bold hover:opacity-90 transition-all shadow-sm">
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-12 gap-5">

        {/* LEFT: main content */}
        <div className="col-span-12 lg:col-span-9 space-y-6">

          {/* Monthly Summary */}
          <section>
            <h2 className="text-[20px] font-bold text-[#1c1b1b] mb-4">Monthly Budget Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Total Budgeted", val: fmt(totalBudget), sub: "100% of income",        pct: "100%", col: "text-[#00534e]", icon: "💼", bgIcon: "bg-[#00534e]/10" },
                { label: "Total Spent",    val: fmt(totalSpent),  sub: `${spentPct}% of budget`, pct: `${spentPct}%`, col: "text-[#835400]", icon: "📈", bgIcon: "bg-[#835400]/10" },
                { label: "Total Remaining",val: fmt(totalRemain), sub: `${100-spentPct}% remaining`, pct: `${100-spentPct}%`, col: "text-[#3c4c4c]", icon: "🥧", bgIcon: "bg-[#3c4c4c]/10" },
              ].map(s => (
                <Card key={s.label} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`${s.bgIcon} p-2.5 rounded-lg text-[20px]`}>{s.icon}</div>
                    <div className="h-8 w-20 opacity-30">
                      <svg className="w-full h-full" viewBox="0 0 100 30">
                        <path d="M0 25 Q 25 15, 50 20 T 100 10" fill="none" stroke="currentColor" strokeWidth="2" className={s.col} />
                      </svg>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#6e7978] uppercase tracking-wider mb-1">{s.label}</p>
                  <h3 className={`text-[22px] font-bold ${s.col}`}>{s.val}</h3>
                  <p className="text-[11px] text-[#6e7978] mt-1">
                    <span className={`font-bold ${s.col}`}>{s.pct}</span> {s.sub.split(s.pct)[1] ?? ""}
                  </p>
                </Card>
              ))}
            </div>
          </section>

          {/* Category Cards */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[20px] font-bold text-[#1c1b1b]">Budget Categories</h2>
              <div className="flex items-center gap-2">
                <select className="bg-[#fcf9f8] border border-[#bec9c7]/60 rounded-lg text-[12px] px-3 py-1.5 focus:outline-none text-[#3e4947]">
                  <option>This Month</option><option>Last Month</option>
                </select>
              </div>
            </div>
            {budgets.length === 0 ? (
              <div className="bg-white border border-[#e5e2e1] rounded-2xl p-10 text-center flex flex-col items-center justify-center">
                <div className="text-[40px] mb-3">📊</div>
                <h4 className="font-bold text-[16px] text-[#1c1b1b] mb-1">No Budgets Created</h4>
                <p className="text-[13px] text-[#6e7978] mb-4">You haven't set up any budget category limits yet.</p>
                <button onClick={() => setCreateOpen(true)} className="px-5 py-2.5 bg-[#00534e] text-white text-[13px] font-bold rounded-xl hover:opacity-90 shadow-sm">
                  + Create Budget Limit
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {budgets.map(cat => {
                  const p = pct(cat.spent, cat.budget);
                  const status = p > 90 ? "over" : p > 75 ? "at-risk" : "on-track";
                  const statusColor = p > 90 ? "text-[#ba1a1a]" : p > 75 ? "text-[#835400]" : "text-[#00534e]";
                  return (
                    <Card key={cat.id} className="p-6 hover:shadow-[0_10px_30px_rgba(0,109,103,0.08)] transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`${cat.iconBg} ${cat.iconColor} p-2 rounded-lg`}>{getCategoryIcon(cat.category)}</div>
                          <span className="font-bold text-[14px] text-[#1c1b1b]">{cat.name}</span>
                        </div>
                        <span className={`font-bold text-[14px] ${cat.iconColor}`}>{p}%</span>
                      </div>
                      <div className="w-full bg-[#e5e2e1] h-2 rounded-full mb-5">
                        <motion.div className={`${cat.barColor} h-full rounded-full`}
                          initial={{ width: 0 }} animate={{ width: `${p}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center mb-5">
                        <div>
                          <p className={`font-bold text-[13px] ${cat.iconColor}`}>{fmt(cat.budget)}</p>
                          <p className="text-[11px] text-[#6e7978]">Budget</p>
                        </div>
                        <div>
                          <p className="font-bold text-[13px] text-[#1c1b1b]">{fmt(cat.spent)}</p>
                          <p className="text-[11px] text-[#6e7978]">Spent</p>
                        </div>
                        <div>
                          <p className="font-bold text-[13px] text-[#1c1b1b]">{fmt(cat.budget - cat.spent)}</p>
                          <p className="text-[11px] text-[#6e7978]">Remaining</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-[#e5e2e1]/60">
                        <div className={`flex items-center gap-1.5 text-[13px] font-semibold ${statusColor}`}>
                          <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: "currentColor" }} />
                          {STATUS_LABELS[status]}
                        </div>
                        <button onClick={() => setEditCat(cat)}
                          className="text-[12px] text-[#3e4947] hover:text-[#00534e] border border-[#bec9c7]/60 px-3 py-1 rounded-lg transition-colors">
                          Edit Budget
                        </button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>

          {/* Budget Performance Chart */}
          <section>
            <h2 className="text-[20px] font-bold text-[#1c1b1b] mb-4">Budget Performance</h2>
            <Card className="p-8 overflow-hidden">
              <div className="h-56 w-full mb-6">
                <svg className="w-full h-full" viewBox="0 0 1000 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#006d67" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="#006d67" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,150 C50,160 100,120 150,130 C200,140 250,90 300,110 C350,130 400,100 450,115 C500,130 550,80 600,100 C650,120 700,90 750,105 C800,120 850,70 900,90 L1000,80"
                    fill="none" stroke="#006d67" strokeWidth="3" />
                  <path d="M0,150 C50,160 100,120 150,130 C200,140 250,90 300,110 C350,130 400,100 450,115 C500,130 550,80 600,100 C650,120 700,90 750,105 C800,120 850,70 900,90 L1000,80 V200 H0 Z"
                    fill="url(#chartGrad)" />
                  {[[150,130],[300,110],[450,115],[600,100],[750,105],[900,90]].map(([cx,cy],i) => (
                    <circle key={i} cx={cx} cy={cy} r="4" fill="#006d67" />
                  ))}
                </svg>
                <div className="flex justify-between text-[11px] text-[#6e7978] mt-2">
                  {["May 1","May 8","May 15","May 22","May 29"].map(d => <span key={d}>{d}</span>)}
                </div>
              </div>
              {/* Celebration Banner */}
              <button onClick={triggerCelebration}
                className="w-full bg-[#00534e]/5 border border-[#00534e]/20 rounded-xl p-4 flex items-center justify-between hover:bg-[#00534e]/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-2 rounded-lg">
                    <Trophy className="w-5 h-5 text-[#fcab28]" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-[14px] text-[#1c1b1b]">You&apos;re doing great! 👏</h4>
                    <p className="text-[12px] text-[#3e4947]">You&apos;ve stayed on track with 4 of 6 budgets this month.</p>
                  </div>
                </div>
                <div className="text-[28px]">🌱</div>
              </button>
            </Card>
          </section>
        </div>

        {/* RIGHT: sidebar */}
        <aside className="col-span-12 lg:col-span-3 space-y-5">

          {/* AI Suggestions */}
          <Card className="p-5 shadow-[0_10px_30px_rgba(0,109,103,0.08)]">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00534e]" />
                <h3 className="font-bold text-[14px] text-[#1c1b1b]">AI Budget Suggestions</h3>
              </div>
              <a href="#" className="text-[#00534e] text-[11px] font-bold hover:underline">View All</a>
            </div>
            <div className="space-y-5">
              {[
                { bg:"bg-[#00534e]/10", col:"text-[#00534e]", icon:<TrendingDown className="w-4 h-4"/>, title:"Reduce Shopping Budget", val:"$120", sub:"You can save $120 by reducing shopping expenses.", tag:"Potential Save" },
                { bg:"bg-[#835400]/10", col:"text-[#835400]", icon:<AlertTriangle className="w-4 h-4"/>, title:"Food Budget Almost Reached", val:"82%", sub:"You have used 82% of your food budget.", tag:"Used" },
                { bg:"bg-[#3c4c4c]/10", col:"text-[#3c4c4c]", icon:<Sparkles className="w-4 h-4"/>, title:"Increase Savings", val:"$200", sub:"Great job! You can increase your savings goal by $200.", tag:"Suggested" },
              ].map((s, i) => (
                <div key={i} className="flex gap-3">
                  <div className={`${s.bg} ${s.col} p-2 rounded-lg h-fit`}>{s.icon}</div>
                  <div>
                    <div className="flex justify-between">
                      <p className="font-bold text-[13px] text-[#1c1b1b]">{s.title}</p>
                      <p className={`font-bold text-[13px] ${s.col}`}>{s.val}</p>
                    </div>
                    <p className="text-[11px] text-[#3e4947] mb-1">{s.sub}</p>
                    <p className="text-[9px] text-[#6e7978] font-bold uppercase">{s.tag}</p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => showToast("AI suggestions applied!")}
              className="w-full mt-5 py-2 border border-[#00534e] text-[#00534e] rounded-lg text-[12px] font-bold hover:bg-[#00534e] hover:text-white transition-all">
              Apply All Suggestions
            </button>
          </Card>

          {/* Upcoming Renewals */}
          <Card className="p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-[14px] text-[#1c1b1b]">Upcoming Budget Renewals</h3>
              <a href="#" className="text-[#00534e] text-[11px] font-bold hover:underline">View All</a>
            </div>
            <div className="space-y-4">
              {[
                { label:"N", bg:"bg-[#ba1a1a] text-white", name:"Netflix",        date:"May 10, 2024", amt:"$15.99",  days:"5 Days" },
                { label:"🏋️", bg:"bg-[#f0edec]",          name:"Gym Membership", date:"May 12, 2024", amt:"$45.00",  days:"7 Days" },
                { label:"🛡️", bg:"bg-[#f0edec]",          name:"Car Insurance",  date:"May 15, 2024", amt:"$120.00", days:"10 Days" },
              ].map(r => (
                <div key={r.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border border-[#bec9c7]/30 font-bold text-[13px] ${r.bg}`}>{r.label}</div>
                    <div>
                      <p className="font-bold text-[13px] text-[#1c1b1b]">{r.name}</p>
                      <p className="text-[11px] text-[#6e7978]">{r.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[13px] text-[#1c1b1b]">{r.amt}</p>
                    <p className="text-[#00534e] font-bold text-[10px]">{r.days}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Create CTA */}
          <div className="bg-[#f6f3f2] p-5 rounded-xl border border-dashed border-[#bec9c7] text-center">
            <div className="text-[48px] mb-3">📊</div>
            <h3 className="font-bold text-[14px] text-[#1c1b1b] mb-2">Create Your Budget</h3>
            <p className="text-[12px] text-[#3e4947] mb-4 px-2">Create a new budget to start managing your expenses better.</p>
            <button onClick={() => setCreateOpen(true)}
              className="bg-[#00534e] text-white w-full py-2 rounded-lg text-[12px] font-bold hover:opacity-90 transition-all">
              Create Budget
            </button>
          </div>
        </aside>
      </div>

      {/* Modals */}
      <BudgetModal open={createOpen} onClose={() => setCreateOpen(false)} onSave={handleCreateSave} />
      {editCat && (
        <BudgetModal open={!!editCat} onClose={() => setEditCat(null)} onSave={handleEditSave} onDelete={handleDeleteBudget}
          initial={{ name: editCat.name, budget: editCat.budget }} />
      )}
    </div>
  );
}
