"use client";

import { mockAIPredictions, mockCashFlow, mockSpendingTrend } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  Info, Brain, Lightbulb, PiggyBank, Zap, MoreVertical,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useState } from "react";

const C = {
  primary: "#006d67",
  secondary: "#fcab28",
  error: "#ba1a1a",
  surface: "#f0edec",
  outline: "#6e7978",
};

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-[#bec9c7]/30 shadow-sm relative ${className}`}>
      {children}
    </div>
  );
}

function CardMenu() {
  const [open, setOpen] = useState(false);
  return (
    <div className="absolute top-4 right-4">
      <button onClick={() => setOpen(!open)} className="text-[#6e7978] hover:text-[#006d67] transition-colors">
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-[#bec9c7]/40 rounded-xl shadow-lg z-10 py-1 min-w-[100px]" onMouseLeave={() => setOpen(false)}>
          {["Edit","Settings","Delete"].map(a => (
            <button key={a} onClick={() => setOpen(false)}
              className={`w-full text-left px-4 py-2 text-[11px] hover:bg-[#f0edec] ${a==="Delete"?"text-[#ba1a1a]":""}`}>
              {a}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white rounded-xl border border-[#bec9c7]/40 shadow-lg p-3 text-xs">
        <p className="font-bold text-[#1c1b1b] mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {formatCurrency(p.value)}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AIPredictionPage() {
  const { nextMonthExpense, expenseChange, confidence, categoryPredictions,
    riskScore, riskLevel, aiSuggestions, recommendedBudget, futureSavings } = mockAIPredictions;

  const forecastData = [
    { month: "Apr", amount: 4100 },
    { month: "May", amount: 4320 },
    { month: "Jun", amount: 4850 },
    { month: "Jul", amount: 4600 },
    { month: "Aug", amount: 5100 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── PAGE HEADER ── */}
      <div>
        <h1 className="text-[24px] font-bold text-[#1c1b1b]">AI Budget Prediction</h1>
        <p className="text-[14px] text-[#3e4947] mt-0.5">Let our AI predict your future finances with {confidence}% confidence</p>
      </div>

      {/* ── MAIN GRID: Left + Center + Right ── */}
      <div className="grid grid-cols-12 gap-5">

        {/* ── LEFT COLUMN ── */}
        <div className="col-span-12 lg:col-span-3 space-y-5">

          {/* Total Balance Card */}
          <Card className="p-6">
            <CardMenu />
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-[13px] text-[#3e4947] font-medium mb-1">Total Balance</h3>
                <div className="text-[28px] font-bold text-[#1c1b1b]">$12,850.50</div>
                <div className="flex items-center gap-1 text-[#006d67] text-[11px] font-bold mt-1">
                  <TrendingUp className="w-3.5 h-3.5" /> 12.5% vs last month
                </div>
              </div>
              <div className="relative w-16 h-16">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#f0edec" strokeWidth="3" />
                  <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#006d67"
                    strokeDasharray="70 30" strokeDashoffset="25" strokeWidth="3" />
                  <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#fcab28"
                    strokeDasharray="15 85" strokeDashoffset="-45" strokeWidth="3" />
                </svg>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {[
                { label: "Income",   val: "$8,750.00", chg: "↑ 8.2%",  chgCol: "text-[#006d67]", icon: <TrendingUp className="w-4 h-4" />, bg: "bg-[#006d67]/10 text-[#006d67]" },
                { label: "Expenses", val: "$4,320.00", chg: "↓ 3.1%",  chgCol: "text-[#ba1a1a]", icon: <TrendingDown className="w-4 h-4" />, bg: "bg-[#ba1a1a]/10 text-[#ba1a1a]" },
                { label: "Savings",  val: "$4,430.00", chg: "↑ 15.1%", chgCol: "text-[#006d67]", icon: <PiggyBank className="w-4 h-4" />, bg: "bg-[#fcab28]/10 text-[#fcab28]" },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${row.bg}`}>{row.icon}</div>
                    <span className="text-[13px] font-medium text-[#1c1b1b]">{row.label}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] font-bold text-[#1c1b1b]">{row.val}</div>
                    <div className={`text-[10px] font-bold ${row.chgCol}`}>{row.chg}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Spending Trend */}
          <Card className="p-5">
            <CardMenu />
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[14px] font-bold text-[#1c1b1b]">Spending Trend</h3>
              <select className="text-[11px] bg-[#f0edec] border-none rounded-lg py-1 px-2 focus:ring-0 text-[#3e4947]">
                <option>This Month</option>
              </select>
            </div>
            <div className="h-36 relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockSpendingTrend}>
                  <defs>
                    <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#006d67" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#006d67" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="amount" stroke="#006d67" strokeWidth={1.5} fill="url(#spendGrad)" dot={false} />
                  <Tooltip content={<CustomTooltip />} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="absolute top-2 right-6 bg-[#006d67] text-white text-[9px] font-bold px-2 py-0.5 rounded shadow">$980</div>
            </div>
            <div className="flex justify-between mt-1 text-[9px] text-[#6e7978] px-1">
              {["1","5","10","15","20","25","30"].map(d => <span key={d}>{d}</span>)}
            </div>
          </Card>

          {/* Mini AI Prediction */}
          <Card className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#f0edec] rounded-full flex items-center justify-center shrink-0">
              <Brain className="w-5 h-5 text-[#006d67]" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[12px] font-bold text-[#1c1b1b]">AI Budget Prediction</h4>
              <p className="text-[10px] text-[#3e4947]">Expenses predicted: {formatCurrency(nextMonthExpense)}</p>
            </div>
            <button className="bg-[#fcab28] text-[#694300] text-[10px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap hover:opacity-90 shrink-0">
              View Details
            </button>
          </Card>
        </div>

        {/* ── CENTER COLUMN ── */}
        <div className="col-span-12 lg:col-span-6 space-y-5">

          {/* Main AI Budget Prediction */}
          <Card className="p-8">
            <CardMenu />
            <div className="mb-7">
              <h2 className="text-[22px] font-bold text-[#1c1b1b]">AI Budget Prediction</h2>
              <p className="text-[13px] text-[#3e4947] mt-0.5">Let our AI predict your future finances</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Monthly Prediction Chart */}
              <div>
                <div className="mb-4">
                  <h4 className="text-[14px] font-bold text-[#1c1b1b]">Monthly Expense Prediction</h4>
                  <p className="text-[11px] text-[#6e7978]">Next Month (Jun)</p>
                </div>
                <div className="text-[28px] font-bold text-[#1c1b1b] mb-1">{formatCurrency(nextMonthExpense)}</div>
                <div className="text-[12px] text-[#006d67] font-bold flex items-center gap-1 mb-4">
                  <TrendingUp className="w-3.5 h-3.5" /> {expenseChange}% vs this month
                </div>
                <div className="h-24 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecastData}>
                      <Line type="monotone" dataKey="amount" stroke="#006d67" strokeWidth={2} dot={{ r: 2, fill: "#006d67" }} />
                      <Tooltip content={<CustomTooltip />} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* AI Insights */}
              <div>
                <h4 className="text-[14px] font-bold text-[#1c1b1b] mb-4">AI Insights</h4>
                <div className="space-y-4">
                  {aiSuggestions.map((s, i) => {
                    const isWarning = s.type === "warning";
                    const isAlert   = s.type === "alert";
                    return (
                      <div key={i} className="flex gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isWarning ? "bg-[#006d67]/10 text-[#006d67]" : isAlert ? "bg-[#ba1a1a]/10 text-[#ba1a1a]" : "bg-blue-50 text-blue-600"}`}>
                          {isWarning ? <TrendingUp className="w-4 h-4" /> : isAlert ? <AlertTriangle className="w-4 h-4" /> : <PiggyBank className="w-4 h-4" />}
                        </div>
                        <p className="text-[12px] text-[#1c1b1b] leading-snug pt-1">{s.text}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>

          {/* Category Prediction */}
          <Card className="p-8">
            <CardMenu />
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-[18px] font-bold text-[#1c1b1b]">Category Prediction</h4>
              <span className="text-[11px] text-[#6e7978]">Next Month</span>
            </div>
            <div className="space-y-5">
              {categoryPredictions.slice(0, 4).map((cat, i) => {
                const widths = [75, 55, 35, 25];
                return (
                  <div key={i}>
                    <div className="flex justify-between text-[13px] mb-2">
                      <span className="font-medium text-[#1c1b1b]">{cat.category}</span>
                      <span className="font-bold text-[#1c1b1b]">{formatCurrency(cat.predicted)}</span>
                    </div>
                    <div className="h-3 w-full bg-[#f0edec] rounded-full overflow-hidden">
                      <motion.div className="h-full bg-[#006d67] rounded-full"
                        initial={{ width: 0 }} animate={{ width: `${widths[i]}%` }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.1 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="col-span-12 lg:col-span-3 space-y-5">

          {/* Quick Actions */}
          <Card className="p-6">
            <CardMenu />
            <h3 className="text-[14px] font-bold text-[#1c1b1b] mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <span className="text-[#006d67] text-lg">+</span>, bg: "bg-[#006d67]/10", label: "Create Budget" },
                { icon: <TrendingDown className="w-4 h-4 text-[#fcab28]" />, bg: "bg-[#fcab28]/10", label: "Add Transaction" },
                { icon: <span className="text-[#006d67] text-lg">🚩</span>, bg: "bg-[#006d67]/10", label: "Set Savings Goal" },
                { icon: <TrendingUp className="w-4 h-4 text-[#fcab28]" />, bg: "bg-[#fcab28]/10", label: "View Reports" },
              ].map(a => (
                <button key={a.label}
                  className="flex flex-col items-center gap-2 p-3 border border-[#bec9c7]/40 rounded-xl hover:bg-[#f0edec] transition-colors">
                  <div className={`w-10 h-10 ${a.bg} rounded-full flex items-center justify-center`}>{a.icon}</div>
                  <span className="text-[10px] font-bold text-[#1c1b1b] text-center">{a.label}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Recent Transactions */}
          <Card className="p-6">
            <CardMenu />
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-[14px] font-bold text-[#1c1b1b]">Recent Transactions</h3>
              <a href="/dashboard/transactions" className="text-[#006d67] text-[11px] font-bold hover:underline">View All</a>
            </div>
            <div className="space-y-5">
              {[
                { icon: "💰", label: "Salary",          cat: "Income",     amount: "+$3,500.00", date: "May 05", pos: true },
                { icon: "🛒", label: "Groceries",        cat: "Food",       amount: "-$120.50",   date: "May 04", pos: false },
                { icon: "🎬", label: "Netflix",          cat: "Subs",       amount: "-$15.99",    date: "May 03", pos: false },
                { icon: "⚡", label: "Electricity Bill", cat: "Utilities",  amount: "-$80.00",    date: "May 02", pos: false },
                { icon: "⛽", label: "Gas Station",      cat: "Transport",  amount: "-$55.00",    date: "May 01", pos: false },
              ].map(tx => (
                <div key={tx.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#f0edec] rounded-lg flex items-center justify-center text-base shrink-0">{tx.icon}</div>
                    <div>
                      <div className="text-[13px] font-bold text-[#1c1b1b]">{tx.label}</div>
                      <div className="text-[10px] text-[#6e7978]">{tx.date} • {tx.cat}</div>
                    </div>
                  </div>
                  <div className={`text-[13px] font-bold ${tx.pos ? "text-[#006d67]" : "text-[#ba1a1a]"}`}>{tx.amount}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Risk + Savings forecast */}
          <Card className="p-5">
            <h3 className="text-[13px] font-bold text-[#1c1b1b] mb-3">Financial Risk Score</h3>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[32px] font-black text-[#2e7d32]">{riskScore}</span>
              <div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#2e7d32] text-white">{riskLevel} Risk</span>
                <p className="text-[10px] text-[#6e7978] mt-0.5">out of 100</p>
              </div>
            </div>
            <div className="h-2 rounded-full bg-[#f0edec] overflow-hidden mb-4">
              <motion.div className="h-full rounded-full bg-[#2e7d32]"
                initial={{ width: 0 }} animate={{ width: `${riskScore}%` }} transition={{ duration: 0.9 }} />
            </div>
            <div className="space-y-1.5 border-t border-[#f0edec] pt-3">
              {[
                { label: "3 months", val: futureSavings.threeMonths },
                { label: "6 months", val: futureSavings.sixMonths },
                { label: "1 year",   val: futureSavings.oneYear },
              ].map(f => (
                <div key={f.label} className="flex justify-between text-[12px]">
                  <span className="text-[#6e7978]">Savings in {f.label}</span>
                  <span className="font-bold text-[#006d67]">{formatCurrency(f.val)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
