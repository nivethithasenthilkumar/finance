"use client";

import { useAppStore } from "@/lib/app-store";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Wallet, TrendingUp, TrendingDown, PiggyBank, Plus,
  CreditCard, Flag, Bot, ShoppingBag, ArrowUpRight, ArrowDownRight,
} from "lucide-react";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-xl border border-[#bec9c7]/30 shadow-sm ${className}`}>{children}</div>;
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export default function DashboardPage() {
  const {
    profile, transactions, budgets, goals,
    totalBalance, totalIncome, totalExpenses, totalSavings,
  } = useAppStore();

  const firstName = profile.name ? profile.name.split(" ")[0] : "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const recentTx = transactions.slice(0, 5);
  const recentGoals = goals.slice(0, 3);
  const recentBudgets = budgets.slice(0, 3);

  const hasTransactions = transactions.length > 0;
  const hasBudgets = budgets.length > 0;
  const hasGoals = goals.length > 0;

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Greeting row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[24px] font-bold text-[#1c1b1b]">{greeting}, {firstName} 👋</h1>
          <p className="text-[13px] text-[#3e4947] mt-0.5">Here's your live financial overview.</p>
        </div>
        <div className="w-11 h-11 rounded-full border-2 border-[#9ef1e9] bg-[#006d67] flex items-center justify-center text-white font-bold overflow-hidden shadow-sm">
          {profile.avatar
            ? <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
            : profile.initials || "?"}
        </div>
      </div>

      {/* ── STAT CARDS — live from transactions ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Balance",    val: totalBalance,    icon: <Wallet className="w-5 h-5"/>,       bg: "bg-[#9ef1e9]/30",  col: "text-[#00534e]",  chg: totalBalance >= 0, link: "/dashboard/transactions" },
          { label: "Monthly Income",   val: totalIncome,     icon: <TrendingUp className="w-5 h-5"/>,   bg: "bg-[#9ef1e9]/30",  col: "text-[#00534e]",  chg: true,              link: "/dashboard/transactions" },
          { label: "Monthly Expenses", val: totalExpenses,   icon: <TrendingDown className="w-5 h-5"/>, bg: "bg-[#ffdad6]/40",  col: "text-[#ba1a1a]",  chg: false,             link: "/dashboard/transactions" },
          { label: "Savings",          val: totalSavings,    icon: <PiggyBank className="w-5 h-5"/>,    bg: "bg-[#ffddb5]/40",  col: "text-[#835400]",  chg: totalSavings >= 0, link: "/dashboard/budget-planner" },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center ${s.col} mb-3`}>{s.icon}</div>
            <p className="text-[11px] text-[#6e7978] mb-0.5">{s.label}</p>
            <p className={`text-[18px] font-bold ${s.col}`}>{fmt(s.val)}</p>
            <div className={`flex items-center gap-0.5 mt-1 text-[10px] font-semibold ${s.chg ? "text-[#2e7d32]" : "text-[#ba1a1a]"}`}>
              {s.chg ? <ArrowUpRight className="w-3 h-3"/> : <ArrowDownRight className="w-3 h-3"/>}
              <span>live</span>
            </div>
          </Card>
        ))}
      </div>

      {/* ── QUICK ACTIONS ── */}
      <Card className="p-4">
        <h3 className="text-[13px] font-bold text-[#1c1b1b] mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: <Plus className="w-4 h-4 text-[#00534e]"/>,      label: "Add Transaction", href: "/dashboard/transactions" },
            { icon: <Flag className="w-4 h-4 text-[#00534e]"/>,      label: "New Goal",        href: "/dashboard/goals" },
            { icon: <ShoppingBag className="w-4 h-4 text-[#835400]"/>,label:"New Budget",      href: "/dashboard/budget-planner" },
            { icon: <Bot className="w-4 h-4 text-[#00534e]"/>,       label: "Ask AI",          href: "/dashboard/ai-assistant" },
          ].map(a => (
            <Link key={a.label} href={a.href}
              className="flex items-center gap-2 p-2.5 bg-[#f6f3f2] hover:bg-[#9ef1e9]/20 rounded-xl transition-all group">
              {a.icon}
              <span className="text-[12px] text-[#3e4947] group-hover:text-[#00534e] font-semibold">{a.label}</span>
            </Link>
          ))}
        </div>
      </Card>

      {/* ── MAIN GRID: Transactions + Goals ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Recent Transactions */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[14px] font-bold text-[#1c1b1b]">Recent Transactions</h3>
            <Link href="/dashboard/transactions" className="text-[#00534e] text-[11px] font-bold hover:underline">View All</Link>
          </div>
          {!hasTransactions ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 bg-[#f0edec] rounded-2xl flex items-center justify-center mb-3">
                <CreditCard className="w-6 h-6 text-[#6e7978]" />
              </div>
              <p className="text-[13px] font-semibold text-[#1c1b1b] mb-1">No transactions yet</p>
              <Link href="/dashboard/transactions"
                className="mt-2 px-4 py-1.5 bg-[#00534e] text-white text-[12px] font-bold rounded-lg hover:opacity-90">
                + Add Transaction
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTx.map(tx => (
                <div key={tx.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#f0edec] rounded-lg flex items-center justify-center text-base">{tx.icon}</div>
                    <div>
                      <p className="text-[13px] font-bold text-[#1c1b1b]">{tx.description}</p>
                      <p className="text-[10px] text-[#6e7978]">{tx.date} · {tx.category}</p>
                    </div>
                  </div>
                  <span className={`text-[13px] font-bold ${tx.type === "income" ? "text-[#2e7d32]" : "text-[#ba1a1a]"}`}>
                    {tx.type === "income" ? "+" : "-"}{fmt(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Goals Summary */}
        <Card className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[14px] font-bold text-[#1c1b1b]">Goals</h3>
            <Link href="/dashboard/goals" className="text-[#00534e] text-[11px] font-bold hover:underline">View All</Link>
          </div>
          {!hasGoals ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 bg-[#f0edec] rounded-2xl flex items-center justify-center mb-3">
                <Flag className="w-6 h-6 text-[#6e7978]" />
              </div>
              <p className="text-[13px] font-semibold text-[#1c1b1b] mb-1">No goals set</p>
              <Link href="/dashboard/goals"
                className="mt-2 px-4 py-1.5 bg-[#fcab28] text-[#694300] text-[12px] font-bold rounded-lg hover:opacity-90">
                + Create Goal
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentGoals.map(g => {
                const pct = g.target > 0 ? Math.min(Math.round((g.current / g.target) * 100), 100) : 0;
                return (
                  <div key={g.id}>
                    <div className="flex justify-between text-[12px] mb-1">
                      <span className="font-semibold text-[#1c1b1b] truncate max-w-[120px]">{g.name}</span>
                      <span className="font-bold" style={{ color: g.ringColorHex }}>{pct}%</span>
                    </div>
                    <div className="h-2 bg-[#f0edec] rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full"
                        style={{ backgroundColor: g.ringColorHex }}
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                      />
                    </div>
                    <p className="text-[10px] text-[#6e7978] mt-0.5">{fmt(g.current)} / {fmt(g.target)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* ── Budgets ── */}
      <Card className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[14px] font-bold text-[#1c1b1b]">Budgets</h3>
          <Link href="/dashboard/budget-planner" className="text-[#00534e] text-[11px] font-bold hover:underline">Manage</Link>
        </div>
        {!hasBudgets ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 bg-[#f0edec] rounded-2xl flex items-center justify-center mb-3">
              <Wallet className="w-6 h-6 text-[#6e7978]" />
            </div>
            <p className="text-[13px] font-semibold text-[#1c1b1b] mb-1">No budgets created</p>
            <Link href="/dashboard/budget-planner"
              className="mt-2 px-4 py-1.5 bg-[#00534e] text-white text-[12px] font-bold rounded-lg hover:opacity-90">
              + Create Budget
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentBudgets.map(b => {
              const pct = b.budget > 0 ? Math.min(Math.round((b.spent / b.budget) * 100), 100) : 0;
              const remaining = b.budget - b.spent;
              return (
                <div key={b.id} className="bg-[#f6f3f2] rounded-xl p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[13px] font-bold text-[#1c1b1b]">{b.name}</span>
                    <span className="text-[12px] font-bold" style={{ color: pct > 90 ? "#ba1a1a" : pct > 75 ? "#835400" : "#00534e" }}>{pct}%</span>
                  </div>
                  <div className="h-2 bg-[#e5e2e1] rounded-full overflow-hidden mb-2">
                    <motion.div className={b.barColor + " h-full rounded-full"}
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7 }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#6e7978]">
                    <span>Spent: {fmt(b.spent)}</span>
                    <span>Left: {fmt(Math.max(0, remaining))}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
