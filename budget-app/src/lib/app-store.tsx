"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

// ─────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────

export interface UserProfile {
  name: string; email: string; phone: string; avatar: string | null;
  currency: string; language: string; plan: string;
  joinDate: string; initials: string; cameraAccess: boolean;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  subtitle: string;
  category: string;
  account: string;
  accountNum: string;
  amount: number;
  type: "income" | "expense";
  icon: string;
  recurring: boolean;
  status: "Completed" | "Pending" | "Failed";
}

export interface Budget {
  id: string;
  name: string;
  category: string;
  budget: number;
  spent: number;           // auto-calculated from transactions
  barColor: string;
  iconBg: string;
  iconColor: string;
}

export interface AiChat {
  id?: number;
  sessionId?: string;
  userMessage: string;
  aiResponse: string;
  timestamp?: string;
}

export interface Goal {
  id: string;
  name: string;
  category: string;
  ringColorHex: string;
  textColor: string;
  statusBg: string;
  statusText: string;
  statusLabel: "On Track" | "Behind";
  current: number;
  target: number;
  expected: string;
}

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────

const BLANK_PROFILE: UserProfile = {
  name: "", email: "", phone: "", avatar: null,
  currency: "USD", language: "English", plan: "Free",
  joinDate: new Date().toISOString().slice(0, 10),
  initials: "?", cameraAccess: false,
};

function makeInitials(name: string): string {
  return name.trim().split(" ").filter(Boolean).map(w => w[0].toUpperCase()).join("").slice(0, 2) || "?";
}

function recalcBudgetSpent(budgets: Budget[], transactions: Transaction[]): Budget[] {
  return budgets.map(b => ({
    ...b,
    spent: transactions
      .filter(t => t.type === "expense" && t.category.toLowerCase() === b.category.toLowerCase())
      .reduce((sum, t) => sum + t.amount, 0),
  }));
}

function recalcGoalPct(g: Goal): Goal & { pct: number; pctOffset: number } {
  const pct = g.target > 0 ? Math.min(Math.round((g.current / g.target) * 100), 100) : 0;
  const circumference = 351.85;
  const pctOffset = circumference - (pct / 100) * circumference;
  const statusLabel: "On Track" | "Behind" = pct >= 30 ? "On Track" : "Behind";
  return { ...g, pct, pctOffset, statusLabel };
}

// ─────────────────────────────────────────────────────────
// CONTEXT
// ─────────────────────────────────────────────────────────

interface AppStoreContextType {
  // Auth + profile
  profile: UserProfile;
  isLoggedIn: boolean;
  profileComplete: boolean;
  login: (email: string, name?: string) => void;
  logout: () => void;
  saveProfile: (data: Partial<UserProfile>) => void;
  setCameraAccess: (enabled: boolean) => Promise<void>;

  // Transactions
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, tx: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;

  // Budgets
  budgets: Budget[];
  addBudget: (b: Omit<Budget, "id" | "spent">) => void;
  updateBudget: (id: string, b: Omit<Budget, "id" | "spent">) => void;
  deleteBudget: (id: string) => void;

  // Goals
  goals: Goal[];
  addGoal: (g: Omit<Goal, "id">) => void;
  updateGoal: (id: string, g: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  contributeToGoal: (id: string, amount: number) => void;

  // AI Chats
  aiChats: AiChat[];
  addAiChat: (chat: AiChat) => void;
  loadAiChats: () => void;

  // Derived totals (computed from transactions)
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
}

const AppStoreContext = createContext<AppStoreContextType>({} as AppStoreContextType);

// ─────────────────────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────────────────────

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [profile,      setProfile]      = useState<UserProfile>(BLANK_PROFILE);
  const [isLoggedIn,   setIsLoggedIn]   = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgetsRaw,   setBudgetsRaw]   = useState<Budget[]>([]);
  const [goals,        setGoals]        = useState<Goal[]>([]);
  const [aiChats,      setAiChats]      = useState<AiChat[]>([]);

  // Budgets with spent auto-calculated from transactions
  const budgets = recalcBudgetSpent(budgetsRaw, transactions);

  // ── Derived totals ──
  const totalIncome   = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const totalSavings  = totalIncome - totalExpenses;
  const totalBalance  = totalSavings;

  // ── Rehydrate from localStorage ──
  useEffect(() => {
    try {
      const p  = localStorage.getItem("bpa_profile");
      const li = localStorage.getItem("bpa_logged_in") === "true";
      const tx = localStorage.getItem("bpa_transactions");
      const bg = localStorage.getItem("bpa_budgets");
      const gl = localStorage.getItem("bpa_goals");
      if (p)  setProfile({ ...BLANK_PROFILE, ...JSON.parse(p) });
      if (tx) setTransactions(JSON.parse(tx));
      if (bg) setBudgetsRaw(JSON.parse(bg));
      if (gl) setGoals(JSON.parse(gl));
      setIsLoggedIn(li);
    } catch {}
  }, []);

  const profileComplete = !!(profile.name && profile.email);

  const persistProfile = (updated: UserProfile) => {
    setProfile(updated);
    localStorage.setItem("bpa_profile", JSON.stringify(updated));
  };

  // ── Auth ──
  const login = (email: string, name = "") => {
    const updated: UserProfile = {
      ...BLANK_PROFILE, email, name,
      initials: makeInitials(name || email),
      joinDate: new Date().toISOString().slice(0, 10),
    };
    persistProfile(updated);
    setIsLoggedIn(true);
    localStorage.setItem("bpa_logged_in", "true");
  };

  const logout = () => {
    setIsLoggedIn(false);
    setProfile(BLANK_PROFILE);
    setTransactions([]);
    setBudgetsRaw([]);
    setGoals([]);
    localStorage.clear();
  };

  const saveProfile = (data: Partial<UserProfile>) => {
    const updated: UserProfile = {
      ...profile, ...data, initials: makeInitials(data.name ?? profile.name),
    };
    persistProfile(updated);
    if (profile.email) {
      fetch("http://localhost:8080/api/user/profile", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      }).catch(() => {});
    }
  };

  const setCameraAccess = async (enabled: boolean) => {
    persistProfile({ ...profile, cameraAccess: enabled });
    try {
      await fetch("http://localhost:8080/api/user/camera-access", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: profile.email, cameraAccess: enabled }),
      });
    } catch {}
  };

  // ── Transactions ──
  const saveTx = (list: Transaction[]) => {
    setTransactions(list);
    localStorage.setItem("bpa_transactions", JSON.stringify(list));
    // Sync to backend (fire-and-forget)
    if (list.length > 0) {
      fetch("http://localhost:8080/api/transactions/bulk", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: profile.email, transactions: list }),
      }).catch(() => {});
    }
  };

  const addTransaction = (tx: Omit<Transaction, "id">) => {
    const newTx: Transaction = { ...tx, id: "t" + Date.now() };
    saveTx([newTx, ...transactions]);
  };

  const updateTransaction = (id: string, tx: Omit<Transaction, "id">) => {
    saveTx(transactions.map(t => t.id === id ? { ...tx, id } : t));
  };

  const deleteTransaction = (id: string) => {
    saveTx(transactions.filter(t => t.id !== id));
  };

  // ── Budgets ──
  const saveBudgets = (list: Budget[]) => {
    setBudgetsRaw(list);
    localStorage.setItem("bpa_budgets", JSON.stringify(list));
    fetch("http://localhost:8080/api/budgets/bulk", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: profile.email, budgets: list }),
    }).catch(() => {});
  };

  const addBudget = (b: Omit<Budget, "id" | "spent">) => {
    saveBudgets([...budgetsRaw, { ...b, id: "b" + Date.now(), spent: 0 }]);
  };

  const updateBudget = (id: string, b: Omit<Budget, "id" | "spent">) => {
    saveBudgets(budgetsRaw.map(x => x.id === id ? { ...x, ...b } : x));
  };

  const deleteBudget = (id: string) => {
    saveBudgets(budgetsRaw.filter(x => x.id !== id));
  };

  // ── Goals ──
  const saveGoals = (list: Goal[]) => {
    setGoals(list);
    localStorage.setItem("bpa_goals", JSON.stringify(list));
    fetch("http://localhost:8080/api/goals/bulk", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: profile.email, goals: list }),
    }).catch(() => {});
  };

  const addGoal = (g: Omit<Goal, "id">) => {
    saveGoals([...goals, { ...g, id: "g" + Date.now() }]);
  };

  const updateGoal = (id: string, g: Partial<Goal>) => {
    saveGoals(goals.map(x => x.id === id ? { ...x, ...g } : x));
  };

  const deleteGoal = (id: string) => {
    saveGoals(goals.filter(x => x.id !== id));
  };

  const contributeToGoal = (id: string, amount: number) => {
    saveGoals(goals.map(x => x.id === id ? { ...x, current: Math.max(0, x.current + amount) } : x));
  };

  // ── AI Chats ──
  const loadAiChats = useCallback(() => {
    // Optimistically load from localStorage first
    try {
      const stored = localStorage.getItem("bpa_aichats");
      if (stored) {
        setAiChats(JSON.parse(stored));
      }
    } catch (e) {}

    if (profile.email) {
      fetch(`http://localhost:8080/api/chats?email=${encodeURIComponent(profile.email)}`)
        .then(res => res.json())
        .then(data => {
          setAiChats(data);
          localStorage.setItem("bpa_aichats", JSON.stringify(data));
        })
        .catch(() => {});
    }
  }, [profile.email]);

  useEffect(() => {
    loadAiChats(); // Load immediately even if not logged in (to allow anonymous testing)
  }, [loadAiChats]);

  const addAiChat = (chat: AiChat) => {
    // Optimistic UI update
    setAiChats(prev => {
      const newChats = [...prev, chat];
      localStorage.setItem("bpa_aichats", JSON.stringify(newChats));
      return newChats;
    });

    fetch(`http://localhost:8080/api/chats?email=${encodeURIComponent(profile.email || "")}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(chat),
    }).catch(() => {});
  };

  return (
    <AppStoreContext.Provider value={{
      profile, isLoggedIn, profileComplete, login, logout, saveProfile, setCameraAccess,
      transactions, addTransaction, updateTransaction, deleteTransaction,
      budgets, addBudget, updateBudget, deleteBudget,
      goals, addGoal, updateGoal, deleteGoal, contributeToGoal,
      aiChats, addAiChat, loadAiChats,
      totalBalance, totalIncome, totalExpenses, totalSavings,
    }}>
      {children}
    </AppStoreContext.Provider>
  );
}

export const useAppStore = () => useContext(AppStoreContext);
