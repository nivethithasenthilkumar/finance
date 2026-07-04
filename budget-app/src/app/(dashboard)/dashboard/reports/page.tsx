"use client";

import { useState } from "react";
import { mockReports } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { Download, Calendar, BarChart3, TrendingUp, TrendingDown, RefreshCw, FileText } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="premium-card p-3 !rounded-xl text-sm">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="text-xs">{p.name}: {formatCurrency(p.value)}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ReportsPage() {
  const [range, setRange] = useState("Monthly");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Reports & Forecasts</h2>
          <p className="text-muted-foreground text-sm mt-1">Detailed analysis and future predictions of cash flow</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-muted p-1 rounded-xl border border-border">
            {["Monthly", "Annual"].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  range === r ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-teal text-white text-sm font-semibold shadow-teal-sm hover:shadow-teal-md transition-all hover:opacity-90">
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="premium-card p-6 flex flex-col justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Total Income ({range})</p>
            <p className="text-3xl font-black text-emerald-500">{formatCurrency(mockReports.monthly.totalIncome)}</p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-500 font-semibold bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1 rounded-full w-max">
            <TrendingUp className="w-4 h-4" /> +12.4% vs last period
          </div>
        </div>

        <div className="premium-card p-6 flex flex-col justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Total Expenses ({range})</p>
            <p className="text-3xl font-black text-red-500">{formatCurrency(mockReports.monthly.totalExpenses)}</p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-500 font-semibold bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1 rounded-full w-max">
            <TrendingDown className="w-4 h-4" /> -3.1% lower spending
          </div>
        </div>

        <div className="premium-card p-6 flex flex-col justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Net Savings ({range})</p>
            <p className="text-3xl font-black text-teal-600 dark:text-emerald-400">{formatCurrency(mockReports.monthly.netSavings)}</p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-teal-600 dark:text-emerald-400 font-semibold bg-teal-50 dark:bg-teal-950/20 px-2.5 py-1 rounded-full w-max">
            <TrendingUp className="w-4 h-4" /> +18.9% savings rate
          </div>
        </div>
      </div>

      {/* Forecast Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="premium-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">6-Month Forecast</h3>
              <p className="text-xs text-muted-foreground">Income vs Expense trends projected forward</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mockReports.sixMonthForecast} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar dataKey="income" name="Income" fill="#0F4C5C" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Expense" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* AI Forecast card */}
        <div className="premium-card p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600 dark:text-emerald-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">AI Forecast & Insight</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Based on your spending pattern, you will save around <strong>$5,200</strong> in the next 6 months. Keep controlling food and entertainment expenses.
            </p>
          </div>
          <div className="pt-4 border-t border-border mt-4">
            <button className="w-full py-2.5 bg-muted hover:bg-secondary rounded-xl text-xs font-semibold text-foreground transition-all flex items-center justify-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> Re-generate Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="premium-card overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="font-semibold text-foreground">Category Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Category</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Amount Spent</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockReports.monthly.topCategories.map((cat, i) => (
                <tr key={i} className="hover:bg-muted/40 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{cat.category}</td>
                  <td className="px-6 py-4 text-right text-sm text-foreground">{formatCurrency(cat.amount)}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
                      {cat.percentage}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
