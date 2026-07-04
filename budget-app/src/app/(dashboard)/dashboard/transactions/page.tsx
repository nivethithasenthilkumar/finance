"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Upload, Plus, X, ChevronDown, ChevronLeft, ChevronRight,
  MoreVertical, Edit2, Trash2, Eye, FileText, TrendingUp, Mic,
  TrendingDown, ArrowUpRight, ArrowDownRight, Check,
} from "lucide-react";
import VoiceInput, { VoiceCommand } from "@/components/VoiceInput";
import { useAppStore, Transaction } from "@/lib/app-store";

// ── No seed data — transactions come from app-store ──
const SEED: Transaction[] = [];

const CATEGORIES = ["All Categories","Income","Food","Transport","Entertainment","Utilities","Health","Shopping","Education"];
const ACCOUNTS = ["All Accounts","Chase Checking","Chase Savings","Chase Credit Card"];
const PAGE_SIZE_OPTIONS = [10, 20, 50];

const CATEGORY_BADGE: Record<string, string> = {
  "Income":        "bg-[#9ef1e9]/40 text-[#00534e]",
  "Food":          "bg-[#ffdad6]/50 text-[#ba1a1a]",
  "Entertainment": "bg-[#e5e2e1] text-[#3e4947]",
  "Utilities":     "bg-[#d4e6e5] text-[#3a4a49]",
  "Transport":     "bg-[#ffddb5]/60 text-[#835400]",
  "Health":        "bg-[#d1e8d0] text-[#2e7d32]",
  "Shopping":      "bg-[#f0edec] text-[#3e4947]",
  "Education":     "bg-[#e8eaf6] text-[#3949ab]",
};

function newId() { return "t" + Date.now(); }

// ── Modal ──────────────────────────────────────────────────
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.div
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10"
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.18 }}
        >
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-[18px] font-bold text-[#1c1b1b]">{title}</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#f0edec] text-[#6e7978]">
              <X className="w-4 h-4" />
            </button>
          </div>
          {children}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ── Transaction Form ───────────────────────────────────────
interface TxFormProps {
  initial?: Partial<Transaction>;
  onSave: (tx: Omit<Transaction, "id">) => void;
  onClose: () => void;
}
function TxForm({ initial, onSave, onClose }: TxFormProps) {
  const [desc, setDesc]       = useState(initial?.description ?? "");
  const [subtitle, setSub]    = useState(initial?.subtitle ?? "");
  const [amount, setAmount]   = useState(String(initial?.amount ?? ""));
  const [date, setDate]       = useState(initial?.date ?? new Date().toISOString().slice(0,10));
  const [type, setType]       = useState<Transaction["type"]>(initial?.type ?? "expense");
  const [cat, setCat]         = useState(initial?.category ?? "Food");
  const [account, setAccount] = useState(initial?.account ?? "Chase Checking");
  const [accountNum, setNum]  = useState(initial?.accountNum ?? "•••• 1234");
  const [recurring, setRec]   = useState(initial?.recurring ?? false);
  const [status, setSt]       = useState<Transaction["status"]>(initial?.status ?? "Completed");
  const [err, setErr]         = useState("");

  const CATS = ["Income","Food","Transport","Entertainment","Utilities","Health","Shopping","Education"];
  const ICON_MAP: Record<string,string> = { Income:"💰", Food:"🍽️", Transport:"🚗", Entertainment:"🎬", Utilities:"⚡", Health:"💪", Shopping:"🛍️", Education:"📚" };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim()) return setErr("Description is required.");
    const n = parseFloat(amount);
    if (isNaN(n) || n <= 0) return setErr("Enter a valid positive amount.");
    setErr("");
    onSave({
      description: desc.trim(), subtitle: subtitle.trim(), amount: n, date, type, category: cat,
      account, accountNum, icon: ICON_MAP[cat] ?? "💳", recurring, status,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {err && <p className="text-[12px] text-[#ba1a1a] bg-[#ffdad6]/50 rounded-lg px-3 py-2">{err}</p>}

      {/* Type toggle */}
      <div className="flex rounded-xl overflow-hidden border border-[#bec9c7]/40">
        {(["expense","income"] as Transaction["type"][]).map(t => (
          <button key={t} type="button" onClick={() => setType(t)}
            className={`flex-1 py-2.5 text-[13px] font-bold capitalize transition-colors ${type===t ? (t==="income"?"bg-[#00534e] text-white":"bg-[#ba1a1a] text-white") : "bg-[#f6f3f2] text-[#3e4947]"}`}>
            {t}
          </button>
        ))}
      </div>

      <div>
        <label className="text-[11px] font-bold text-[#3e4947] uppercase block mb-1">Description *</label>
        <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="e.g. Salary, Groceries…"
          className="w-full px-3 py-2.5 border border-[#bec9c7]/60 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#00534e]/30 bg-[#fcf9f8]" />
      </div>

      <div>
        <label className="text-[11px] font-bold text-[#3e4947] uppercase block mb-1">Note / Subtitle</label>
        <input value={subtitle} onChange={e=>setSub(e.target.value)} placeholder="Optional note"
          className="w-full px-3 py-2.5 border border-[#bec9c7]/60 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#00534e]/30 bg-[#fcf9f8]" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-bold text-[#3e4947] uppercase block mb-1">Amount *</label>
          <input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00" type="number" min="0" step="0.01"
            className="w-full px-3 py-2.5 border border-[#bec9c7]/60 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#00534e]/30 bg-[#fcf9f8]" />
        </div>
        <div>
          <label className="text-[11px] font-bold text-[#3e4947] uppercase block mb-1">Date *</label>
          <input value={date} onChange={e=>setDate(e.target.value)} type="date"
            className="w-full px-3 py-2.5 border border-[#bec9c7]/60 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#00534e]/30 bg-[#fcf9f8]" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-bold text-[#3e4947] uppercase block mb-1">Category</label>
          <select value={cat} onChange={e=>setCat(e.target.value)}
            className="w-full px-3 py-2.5 border border-[#bec9c7]/60 rounded-xl text-[14px] focus:outline-none bg-[#fcf9f8]">
            {CATS.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[11px] font-bold text-[#3e4947] uppercase block mb-1">Status</label>
          <select value={status} onChange={e=>setSt(e.target.value as Transaction["status"])}
            className="w-full px-3 py-2.5 border border-[#bec9c7]/60 rounded-xl text-[14px] focus:outline-none bg-[#fcf9f8]">
            <option>Completed</option><option>Pending</option><option>Failed</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button type="button" onClick={()=>setRec(!recurring)}
          className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${recurring?"bg-[#00534e] border-[#00534e]":"border-[#bec9c7]"}`}>
          {recurring && <Check className="w-3 h-3 text-white" />}
        </button>
        <label className="text-[13px] text-[#3e4947] cursor-pointer" onClick={()=>setRec(!recurring)}>Recurring transaction</label>
      </div>

      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onClose}
          className="flex-1 py-2.5 border border-[#bec9c7]/60 rounded-xl text-[13px] font-semibold text-[#3e4947] hover:bg-[#f6f3f2]">
          Cancel
        </button>
        <button type="submit"
          className="flex-[2] py-2.5 bg-[#00534e] text-white rounded-xl text-[13px] font-bold hover:opacity-90 shadow-sm">
          Save Transaction
        </button>
      </div>
    </form>
  );
}

// ── Main Page ──────────────────────────────────────────────
export default function TransactionsPage() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useAppStore();
  const rows = transactions;

  // Wrappers that delegate to the global store
  const addTx = (data: Omit<Transaction,"id">) => {
    addTransaction(data);
    setAddOpen(false);
  };

  const updateTx = (data: Omit<Transaction,"id">) => {
    if (!editRow) return;
    updateTransaction(editRow.id, data);
    setEditRow(null);
  };

  const deleteTx = (id: string) => {
    deleteTransaction(id);
    setDeleteId(null);
    setSelected(prev => { const s = new Set(prev); s.delete(id); return s; });
  };

  const deleteSelected = () => {
    selected.forEach(id => deleteTransaction(id));
    setSelected(new Set());
    setSelectAll(false);
  };

  const [search, setSearch]         = useState("");
  const [typeFilter, setTypeFilter] = useState<"All"|"Income"|"Expenses"|"Transfer">("All");
  const [catFilter, setCatFilter]   = useState("All Categories");
  const [accFilter, setAccFilter]   = useState("All Accounts");
  const [minAmt, setMin]            = useState("");
  const [maxAmt, setMax]            = useState("");
  const [sortDir, setSortDir]       = useState<"desc"|"asc">("desc");
  const [page, setPage]             = useState(1);
  const [pageSize, setPageSize]     = useState(10);
  const [addOpen, setAddOpen]       = useState(false);
  const [editRow, setEditRow]       = useState<Transaction | null>(null);
  const [viewRow, setViewRow]       = useState<Transaction | null>(null);
  const [deleteId, setDeleteId]     = useState<string | null>(null);
  const [openMenu, setOpenMenu]     = useState<string | null>(null);
  const [selectAll, setSelectAll]   = useState(false);
  const [selected, setSelected]     = useState<Set<string>>(new Set());
  const [toast, setToast]           = useState("");

  const showSuccess = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  // ── Voice command handler ──
  const handleVoiceCommand = (cmd: VoiceCommand) => {
    const now = new Date().toISOString().slice(0, 10);
    const ICONS: Record<string, string> = {
      Food:"🍽️", Income:"💰", Transport:"🚗", Entertainment:"🎬",
      Utilities:"⚡", Health:"💪", Shopping:"🛍️", Education:"📚", Other:"💳",
    };
    if (cmd.type === "ADD_TRANSACTION") {
      addTransaction({
        date: now, description: cmd.description.charAt(0).toUpperCase() + cmd.description.slice(1),
        subtitle: "Added via voice", category: cmd.category, account: "Default Account",
        accountNum: "—", amount: cmd.amount, type: cmd.txType,
        icon: ICONS[cmd.category] ?? "💳", recurring: false, status: "Completed",
      });
      showSuccess(`Added ${cmd.txType} $${cmd.amount} — ${cmd.description}`);
    } else if (cmd.type === "DELETE_LAST") {
      if (transactions.length > 0) {
        deleteTransaction(transactions[0].id);
        showSuccess(`Deleted "${transactions[0].description}"`);
      }
    } else if (cmd.type === "DELETE_BY_DESC") {
      const match = transactions.find(r => r.description.toLowerCase().includes(cmd.description.toLowerCase()));
      if (match) { deleteTransaction(match.id); showSuccess(`Deleted "${match.description}"`); }
      else showSuccess(`No match for "${cmd.description}"`);
    }
  };

  // ── Derived stats ──
  const totalIncome  = rows.filter(r=>r.type==="income").reduce((a,r)=>a+r.amount,0);
  const totalExpense = rows.filter(r=>r.type==="expense").reduce((a,r)=>a+r.amount,0);
  const totalCount   = rows.length;

  const filtered = useMemo(() => {
    return rows
      .filter(r => {
        const q = search.toLowerCase();
        const matchSearch = !q || r.description.toLowerCase().includes(q) || r.category.toLowerCase().includes(q) || r.subtitle.toLowerCase().includes(q);
        const matchType = typeFilter === "All" || (typeFilter === "Income" && r.type === "income") || (typeFilter === "Expenses" && r.type === "expense");
        const matchCat = catFilter === "All Categories" || r.category === catFilter;
        const matchAcc = accFilter === "All Accounts" || r.account === accFilter;
        const n = r.amount;
        const matchMin = !minAmt || n >= parseFloat(minAmt);
        const matchMax = !maxAmt || n <= parseFloat(maxAmt);
        return matchSearch && matchType && matchCat && matchAcc && matchMin && matchMax;
      })
      .sort((a,b) => sortDir === "desc"
        ? new Date(b.date).getTime() - new Date(a.date).getTime()
        : new Date(a.date).getTime() - new Date(b.date).getTime()
      );
  }, [rows, search, typeFilter, catFilter, accFilter, minAmt, maxAmt, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page-1)*pageSize, page*pageSize);


  const resetFilters = () => {
    setSearch(""); setTypeFilter("All"); setCatFilter("All Categories");
    setAccFilter("All Accounts"); setMin(""); setMax(""); setPage(1);
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style:"currency", currency:"USD" }).format(n);
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month:"short", day:"2-digit", year:"numeric" });

  return (
    <div className="animate-fade-in" onClick={() => setOpenMenu(null)}>

      {/* ── PAGE HEADER ── */}
      <div className="flex justify-between items-end mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-[#1c1b1b]">Transactions</h1>
          <p className="text-[14px] text-[#3e4947] mt-0.5">Track, review, and manage all your financial transactions.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#6e7978] text-[#00534e] text-[13px] font-semibold hover:bg-[#f6f3f2] transition-colors">
            <Upload className="w-4 h-4" /> Upload Statement
          </button>
          <button onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#00534e] text-white text-[13px] font-bold hover:opacity-90 transition-all shadow-sm">
            <Plus className="w-4 h-4" /> Add Transaction
          </button>
          <button className="w-11 h-11 flex items-center justify-center rounded-lg bg-[#fcab28] text-[#694300] hover:opacity-90 transition-all" title="Voice Command">
            <Mic className="w-4 h-4" />
          </button>
          {selected.size > 0 && (
            <button onClick={deleteSelected}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#ba1a1a] text-white text-[13px] font-bold hover:opacity-90">
              <Trash2 className="w-4 h-4" /> Delete ({selected.size})
            </button>
          )}
        </div>
      </div>

      {/* ── LAYOUT: sidebar + main ── */}
      <div className="flex flex-col lg:flex-row gap-5">

        {/* ── SIDEBAR FILTERS ── */}
        <aside className="w-full lg:w-60 shrink-0">
          <div className="bg-white border border-[#bec9c7]/30 rounded-xl p-4 space-y-4 shadow-sm">
            <h2 className="text-[15px] font-bold text-[#1c1b1b]">Filters</h2>

            <div>
              <label className="text-[12px] font-semibold text-[#3e4947] mb-1.5 block">Date Range</label>
              <div className="relative">
                <input type="text" defaultValue="This Month" readOnly
                  className="w-full bg-[#fcf9f8] border border-[#bec9c7]/60 rounded-lg px-3 py-2 text-[13px] cursor-pointer focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="text-[12px] font-semibold text-[#3e4947] mb-1.5 block">Type</label>
              <div className="space-y-1">
                {["All","Income","Expenses","Transfer"].map(t => (
                  <button key={t} onClick={() => { setTypeFilter(t as any); setPage(1); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-[13px] flex items-center gap-2 transition-colors ${typeFilter===t ? "bg-[#9ef1e9]/40 text-[#00534e] font-semibold" : "hover:bg-[#f0edec] text-[#3e4947]"}`}>
                    {t !== "All" && <span className={`w-2.5 h-2.5 rounded-full ${t==="Income"?"bg-[#00534e]":t==="Expenses"?"bg-[#ba1a1a]":"bg-[#006a64]"}`} />}
                    {t === "All" ? "All Transactions" : t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[12px] font-semibold text-[#3e4947] mb-1.5 block">Category</label>
              <select value={catFilter} onChange={e=>{setCatFilter(e.target.value);setPage(1);}}
                className="w-full bg-[#fcf9f8] border border-[#bec9c7]/60 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#00534e]">
                {CATEGORIES.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[12px] font-semibold text-[#3e4947] mb-1.5 block">Account</label>
              <select value={accFilter} onChange={e=>{setAccFilter(e.target.value);setPage(1);}}
                className="w-full bg-[#fcf9f8] border border-[#bec9c7]/60 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#00534e]">
                {ACCOUNTS.map(a=><option key={a}>{a}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[12px] font-semibold text-[#3e4947] mb-1.5 block">Amount Range</label>
              <div className="flex items-center gap-2">
                <input value={minAmt} onChange={e=>{setMin(e.target.value);setPage(1);}} placeholder="Min" type="number"
                  className="w-full bg-[#fcf9f8] border border-[#bec9c7]/60 rounded-lg px-2 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#00534e]" />
                <span className="text-[#6e7978] text-[12px]">to</span>
                <input value={maxAmt} onChange={e=>{setMax(e.target.value);setPage(1);}} placeholder="Max" type="number"
                  className="w-full bg-[#fcf9f8] border border-[#bec9c7]/60 rounded-lg px-2 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#00534e]" />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={resetFilters}
                className="flex-1 py-2 rounded-lg border border-[#6e7978] text-[#1c1b1b] text-[12px] font-semibold hover:bg-[#f0edec]">Reset</button>
              <button className="flex-[2] py-2 rounded-lg bg-[#006d67] text-white text-[12px] font-bold hover:opacity-90">Apply Filters</button>
            </div>
          </div>
        </aside>

        {/* ── MAIN AREA ── */}
        <div className="flex-1 space-y-4 min-w-0">

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label:"Total Transactions", val: String(totalCount), icon:<FileText className="w-5 h-5 text-[#006d67]"/>, bg:"bg-[#f0edec]", change:"+12.5% vs last month", chCol:"text-[#00534e]" },
              { label:"Total Income",  val: fmt(totalIncome),  icon:<TrendingUp className="w-5 h-5 text-[#00534e]"/>,  bg:"bg-[#9ef1e9]/30", change:"+8.2% vs last month",  chCol:"text-[#00534e]" },
              { label:"Total Expenses",val: fmt(totalExpense), icon:<TrendingDown className="w-5 h-5 text-[#ba1a1a]"/>, bg:"bg-[#ffdad6]/40", change:"+3.1% vs last month",  chCol:"text-[#ba1a1a]" },
            ].map(s => (
              <div key={s.label} className="bg-white border border-[#bec9c7]/30 rounded-xl p-4 shadow-sm flex justify-between items-start">
                <div>
                  <p className="text-[12px] text-[#3e4947] font-medium mb-1">{s.label}</p>
                  <h3 className="text-[22px] font-bold text-[#1c1b1b]">{s.val}</h3>
                  <p className={`text-[11px] mt-1 flex items-center gap-0.5 font-semibold ${s.chCol}`}>
                    <ArrowUpRight className="w-3 h-3" /> {s.change}
                  </p>
                </div>
                <div className={`p-2.5 ${s.bg} rounded-full`}>{s.icon}</div>
              </div>
            ))}
          </div>

          {/* Search + sort bar */}
          <div className="bg-white border border-[#bec9c7]/30 rounded-xl overflow-hidden shadow-sm">
            <div className="p-3 border-b border-[#f0edec] flex flex-wrap gap-3 items-center justify-between">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#6e7978]" />
                <input
                  type="text" placeholder="Search transactions..."
                  value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}
                  className="w-full pl-9 pr-9 py-2 bg-[#f0edec] border-none rounded-lg text-[13px] text-[#1c1b1b] placeholder:text-[#6e7978] focus:outline-none focus:ring-2 focus:ring-[#00534e]/20"
                />
                {search && (
                  <button onClick={()=>{setSearch("");setPage(1);}} className="absolute right-3 top-2.5 text-[#6e7978] hover:text-[#1c1b1b]">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 text-[13px] text-[#3e4947] font-medium">
                Sort:
                <button onClick={()=>setSortDir(d=>d==="desc"?"asc":"desc")}
                  className="flex items-center gap-1 font-bold text-[#1c1b1b] hover:text-[#00534e] transition-colors">
                  {sortDir==="desc"?"Latest":"Oldest"} <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f6f3f2] text-[#3e4947] text-[12px] font-semibold tracking-[0.02em]">
                    <th className="p-3 w-10">
                      <input type="checkbox" checked={selectAll}
                        onChange={e=>{setSelectAll(e.target.checked); setSelected(e.target.checked ? new Set(paged.map(r=>r.id)) : new Set());}}
                        className="rounded text-[#00534e] focus:ring-[#00534e]" />
                    </th>
                    <th className="p-3 cursor-pointer whitespace-nowrap" onClick={()=>setSortDir(d=>d==="desc"?"asc":"desc")}>
                      Date <ChevronDown className={`inline w-3 h-3 transition-transform ${sortDir==="asc"?"rotate-180":""}`} />
                    </th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 hidden md:table-cell">Account</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3 hidden lg:table-cell">Status</th>
                    <th className="p-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0edec]">
                  {paged.length === 0 ? (
                    <tr><td colSpan={8} className="py-16 text-center text-[#6e7978] text-[13px]">No transactions found</td></tr>
                  ) : paged.map(tx => (
                    <tr key={tx.id} className="hover:bg-[#fcf9f8] transition-colors group">
                      <td className="p-3">
                        <input type="checkbox" checked={selected.has(tx.id)} onChange={()=>toggleSelect(tx.id)}
                          className="rounded text-[#00534e] focus:ring-[#00534e]" />
                      </td>
                      <td className="p-3 text-[13px] font-medium text-[#1c1b1b] whitespace-nowrap">{fmtDate(tx.date)}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-[#f0edec] rounded-lg flex items-center justify-center text-[16px] shrink-0">{tx.icon}</div>
                          <div>
                            <p className="text-[13px] font-bold text-[#1c1b1b]">{tx.description}</p>
                            <p className="text-[11px] text-[#3e4947]">{tx.subtitle}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${CATEGORY_BADGE[tx.category] ?? "bg-[#f0edec] text-[#3e4947]"}`}>
                          {tx.category}
                        </span>
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        <p className="text-[12px] font-semibold text-[#3e4947]">{tx.account}</p>
                        <p className="text-[10px] text-[#6e7978]">{tx.accountNum}</p>
                      </td>
                      <td className="p-3">
                        <span className={`text-[13px] font-bold ${tx.type==="income"?"text-[#2e7d32]":"text-[#ba1a1a]"}`}>
                          {tx.type==="income"?"+":"-"}{fmt(tx.amount)}
                        </span>
                      </td>
                      <td className="p-3 hidden lg:table-cell">
                        <span className="flex items-center gap-1.5 text-[11px] font-medium text-[#3e4947]">
                          <span className={`w-2 h-2 rounded-full ${tx.status==="Completed"?"bg-[#4caf50]":tx.status==="Pending"?"bg-[#fcab28]":"bg-[#ba1a1a]"}`} />
                          {tx.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="relative" onClick={e=>e.stopPropagation()}>
                          <button onClick={()=>setOpenMenu(openMenu===tx.id?null:tx.id)}
                            className="p-1.5 rounded-full hover:bg-[#f0edec] text-[#6e7978] hover:text-[#1c1b1b] transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          <AnimatePresence>
                            {openMenu === tx.id && (
                              <motion.div
                                initial={{opacity:0, scale:0.95, y:-4}} animate={{opacity:1, scale:1, y:0}} exit={{opacity:0, scale:0.95, y:-4}}
                                transition={{duration:0.12}}
                                className="absolute right-0 mt-1 w-36 bg-white border border-[#bec9c7]/40 rounded-xl shadow-lg z-20 p-1"
                              >
                                <button onClick={()=>{setViewRow(tx);setOpenMenu(null);}}
                                  className="w-full text-left px-3 py-2 text-[12px] hover:bg-[#f0edec] rounded-lg flex items-center gap-2 text-[#3e4947]">
                                  <Eye className="w-3.5 h-3.5" /> View
                                </button>
                                <button onClick={()=>{setEditRow(tx);setOpenMenu(null);}}
                                  className="w-full text-left px-3 py-2 text-[12px] hover:bg-[#f0edec] rounded-lg flex items-center gap-2 text-[#3e4947]">
                                  <Edit2 className="w-3.5 h-3.5" /> Edit
                                </button>
                                <button onClick={()=>{setDeleteId(tx.id);setOpenMenu(null);}}
                                  className="w-full text-left px-3 py-2 text-[12px] hover:bg-[#ffdad6]/40 rounded-lg flex items-center gap-2 text-[#ba1a1a]">
                                  <Trash2 className="w-3.5 h-3.5" /> Delete
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-3 border-t border-[#f0edec] flex justify-between items-center bg-white flex-wrap gap-3">
              <span className="text-[12px] text-[#3e4947]">
                Showing {filtered.length === 0 ? 0 : (page-1)*pageSize+1}–{Math.min(page*pageSize, filtered.length)} of {filtered.length} transactions
              </span>
              <div className="flex items-center gap-1.5">
                <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#bec9c7]/60 text-[#3e4947] hover:bg-[#f0edec] disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({length: Math.min(5, totalPages)}, (_,i) => {
                  const p = totalPages <= 5 ? i+1 : page <= 3 ? i+1 : page >= totalPages-2 ? totalPages-4+i : page-2+i;
                  return (
                    <button key={p} onClick={()=>setPage(p)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-[12px] font-semibold transition-colors ${page===p?"bg-[#00534e] text-white":"hover:bg-[#f0edec] text-[#3e4947]"}`}>
                      {p}
                    </button>
                  );
                })}
                <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#bec9c7]/60 text-[#3e4947] hover:bg-[#f0edec] disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronRight className="w-4 h-4" />
                </button>
                <select value={pageSize} onChange={e=>{setPageSize(Number(e.target.value));setPage(1);}}
                  className="ml-2 bg-[#fcf9f8] border border-[#bec9c7]/60 rounded-lg px-2 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-[#00534e]">
                  {PAGE_SIZE_OPTIONS.map(s=><option key={s}>{s} / page</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <aside className="w-full lg:w-72 shrink-0 space-y-4">
          {/* Spending by Category */}
          <div className="bg-white border border-[#bec9c7]/30 rounded-xl p-4 shadow-sm">
            <h3 className="text-[14px] font-bold text-[#1c1b1b] mb-4">Spending by Category</h3>
            <div className="space-y-3">
              {[
                { cat:"Housing", pct:32, amt:1382.40, color:"bg-[#00534e]" },
                { cat:"Food",    pct:23, amt:993.60,  color:"bg-[#ba1a1a]" },
                { cat:"Transport", pct:15, amt:648,   color:"bg-[#fcab28]" },
                { cat:"Utilities", pct:10, amt:432,   color:"bg-[#006a64]" },
              ].map(c => (
                <div key={c.cat}>
                  <div className="flex justify-between text-[12px] mb-1">
                    <div className="flex items-center gap-1.5"><span className={`w-2.5 h-2.5 rounded-full ${c.color}`} /><span className="text-[#3e4947]">{c.cat}</span></div>
                    <div className="flex items-center gap-3"><span className="text-[#6e7978]">{c.pct}%</span><span className="font-bold text-[#1c1b1b]">{fmt(c.amt)}</span></div>
                  </div>
                  <div className="h-1.5 bg-[#f0edec] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${c.color}`} style={{width:`${c.pct*2}%`}} />
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 border border-[#bec9c7]/60 rounded-lg text-[12px] font-bold text-[#00534e] hover:bg-[#f0edec] transition-colors">View Full Report</button>
          </div>

          {/* Accounts Overview */}
          <div className="bg-white border border-[#bec9c7]/30 rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[14px] font-bold text-[#1c1b1b]">Accounts Overview</h3>
              <a href="#" className="text-[#00534e] text-[11px] font-bold hover:underline">View All</a>
            </div>
            <div className="space-y-3">
              {[
                { name:"Chase Checking", num:"•••• 1234", bal:"$5,430.50", pos:true, bg:"bg-[#9ef1e9]/30" },
                { name:"Chase Savings",  num:"•••• 5678", bal:"$12,850.50",pos:true, bg:"bg-[#ffddb5]/40" },
                { name:"Chase Credit",   num:"•••• 9101", bal:"-$2,430.50",pos:false,bg:"bg-[#f0edec]" },
              ].map(a => (
                <div key={a.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 ${a.bg} rounded-lg flex items-center justify-center`}>
                      <svg className="w-4 h-4 text-[#00534e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-[#1c1b1b]">{a.name}</p>
                      <p className="text-[10px] text-[#6e7978]">{a.num}</p>
                    </div>
                  </div>
                  <p className={`text-[13px] font-bold ${a.pos?"text-[#1c1b1b]":"text-[#ba1a1a]"}`}>{a.bal}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Uploads */}
          <div className="bg-white border border-[#bec9c7]/30 rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[14px] font-bold text-[#1c1b1b]">Recent Uploads</h3>
              <a href="#" className="text-[#00534e] text-[11px] font-bold hover:underline">View All</a>
            </div>
            {[
              { name:"Chase Statement",       date:"Apr 30, 2024 • PDF" },
              { name:"Wells Fargo Statement", date:"Apr 15, 2024 • PDF" },
            ].map(u => (
              <div key={u.name} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-[#9ef1e9]/30 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-[#00534e]" />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-[#1c1b1b]">{u.name}</p>
                    <p className="text-[10px] text-[#6e7978]">{u.date}</p>
                  </div>
                </div>
                <span className="text-[#00534e] font-bold text-[11px]">Downloaded</span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* ── MODALS ── */}
      <Modal open={addOpen} onClose={()=>setAddOpen(false)} title="Add Transaction">
        <TxForm onSave={addTx} onClose={()=>setAddOpen(false)} />
      </Modal>

      <Modal open={!!editRow} onClose={()=>setEditRow(null)} title="Edit Transaction">
        <TxForm initial={editRow ?? undefined} onSave={updateTx} onClose={()=>setEditRow(null)} />
      </Modal>

      {/* View modal */}
      <Modal open={!!viewRow} onClose={()=>setViewRow(null)} title="Transaction Details">
        {viewRow && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#f0edec] flex items-center justify-center text-4xl mx-auto mb-3">{viewRow.icon}</div>
              <p className={`text-[28px] font-black ${viewRow.type==="income"?"text-[#2e7d32]":"text-[#ba1a1a]"}`}>
                {viewRow.type==="income"?"+":"-"}{fmt(viewRow.amount)}
              </p>
              <p className="text-[#3e4947] text-[13px] mt-1">{viewRow.description}</p>
              <p className="text-[#6e7978] text-[11px]">{viewRow.subtitle}</p>
            </div>
            <div className="space-y-2 bg-[#f6f3f2] rounded-xl p-4">
              {[
                ["Date", fmtDate(viewRow.date)],
                ["Category", viewRow.category],
                ["Account", `${viewRow.account} ${viewRow.accountNum}`],
                ["Status", viewRow.status],
                ["Recurring", viewRow.recurring ? "Yes" : "No"],
              ].map(([k,v]) => (
                <div key={k} className="flex justify-between text-[13px]">
                  <span className="text-[#6e7978]">{k}</span>
                  <span className="font-semibold text-[#1c1b1b]">{v}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={()=>{setEditRow(viewRow);setViewRow(null);}}
                className="flex-1 py-2.5 bg-[#00534e] text-white rounded-xl text-[13px] font-bold hover:opacity-90">
                Edit
              </button>
              <button onClick={()=>setViewRow(null)}
                className="flex-1 py-2.5 border border-[#bec9c7]/60 rounded-xl text-[13px] font-semibold text-[#3e4947] hover:bg-[#f0edec]">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleteId} onClose={()=>setDeleteId(null)} title="Delete Transaction">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 bg-[#ffdad6]/50 rounded-full flex items-center justify-center mx-auto">
            <Trash2 className="w-6 h-6 text-[#ba1a1a]" />
          </div>
          <p className="text-[14px] text-[#3e4947]">Are you sure you want to delete this transaction? This action cannot be undone.</p>
          <div className="flex gap-2">
            <button onClick={()=>setDeleteId(null)}
              className="flex-1 py-2.5 border border-[#bec9c7]/60 rounded-xl text-[13px] font-semibold text-[#3e4947] hover:bg-[#f0edec]">Cancel</button>
            <button onClick={()=>deleteId && deleteTx(deleteId)}
              className="flex-1 py-2.5 bg-[#ba1a1a] text-white rounded-xl text-[13px] font-bold hover:opacity-90">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
