"use client";

import { useState } from "react";
import { mockNotifications } from "@/lib/mock-data";
import { Bell, AlertTriangle, CheckCircle, Trash2, CheckSquare } from "lucide-react";

export default function NotificationsPage() {
  const [list, setList] = useState(mockNotifications);

  const markAllRead = () => {
    setList((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setList([]);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
          <p className="text-muted-foreground text-sm mt-1">Stay updated with your budgets and AI suggestions</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={markAllRead}
            disabled={list.every((n) => n.read)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50 transition-colors"
          >
            <CheckSquare className="w-4 h-4" /> Mark all read
          </button>
          <button
            onClick={clearAll}
            disabled={list.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 text-xs font-semibold text-red-600 hover:bg-red-100 dark:hover:bg-red-950/40 disabled:opacity-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Clear all
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {list.length === 0 ? (
          <div className="premium-card p-12 text-center text-muted-foreground space-y-3">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-3xl mx-auto">🔔</div>
            <h3 className="font-bold text-foreground">All caught up!</h3>
            <p className="text-sm">You have no new notifications.</p>
          </div>
        ) : (
          list.map((n) => {
            const iconBg = n.type === "warning" ? "bg-amber-50 dark:bg-amber-900/20 text-amber-500" : n.type === "success" ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500" : "bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-emerald-400";
            const cardBg = n.read ? "bg-card" : "bg-teal-500/5 dark:bg-emerald-400/5 border-l-4 border-l-teal-500 dark:border-l-emerald-400";
            return (
              <div key={n.id} className={`premium-card p-4 flex items-start gap-4 transition-all hover:bg-muted/30 ${cardBg}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg ${iconBg}`}>
                  {n.type === "warning" ? <AlertTriangle className="w-5 h-5" /> : n.type === "success" ? <CheckCircle className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-sm text-foreground truncate">{n.title}</h4>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">{n.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.message}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
