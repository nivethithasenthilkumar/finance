"use client";

import { useState } from "react";
import { useTheme } from "@/lib/theme-provider";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Shield, Settings2, Bell, Link2, Lock, Brain, CreditCard,
  CloudUpload, HelpCircle, ChevronRight, Edit2, Check, Download,
  Trash2, X, Eye, EyeOff, Plus, Zap, Calendar, TrendingUp,
  Target, Bot, History, Smartphone, MessageSquare, Phone, Mail,
} from "lucide-react";

type Section =
  | "profile" | "security" | "preferences" | "notifications"
  | "connected" | "privacy" | "ai" | "subscription" | "backup" | "help";

// ── Reusable Toggle ──
function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange}
      className={`relative inline-flex w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none shrink-0 ${checked ? "bg-[#006d67]" : "bg-[#bec9c7]"}`}>
      <span className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] bg-white rounded-full shadow transition-transform duration-300 ${checked ? "translate-x-5" : ""}`} />
    </button>
  );
}

// ── Card ──
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-[#f0f0f0] rounded-2xl transition-shadow hover:shadow-[0_10px_30px_rgba(0,109,103,0.08)] ${className}`}>
      {children}
    </div>
  );
}

// ── Section heading ──
function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-[22px] font-bold text-[#1c1b1b]">{title}</h2>
      {sub && <p className="text-[14px] text-[#3e4947] mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Confirm Modal ──
function ConfirmModal({ open, title, message, onConfirm, onClose, danger = false }:
  { open: boolean; title: string; message: string; onConfirm: () => void; onClose: () => void; danger?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[18px] font-bold text-[#1c1b1b]">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#f0edec] text-[#6e7978]"><X className="w-4 h-4" /></button>
        </div>
        <p className="text-[14px] text-[#3e4947] mb-6">{message}</p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[#bec9c7] rounded-xl text-[13px] font-semibold text-[#3e4947] hover:bg-[#f0edec]">Cancel</button>
          <button onClick={() => { onConfirm(); onClose(); }}
            className={`flex-[2] py-2.5 rounded-xl text-[13px] font-bold text-white hover:opacity-90 ${danger ? "bg-[#ba1a1a]" : "bg-[#00534e]"}`}>
            {danger ? "Yes, Delete" : "Confirm"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Password Change Modal ──
function PasswordModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: () => void }) {
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [err, setErr] = useState("");
  if (!open) return null;
  const submit = () => {
    if (!oldPw || !newPw || !confirmPw) return setErr("All fields are required.");
    if (newPw !== confirmPw) return setErr("New passwords do not match.");
    if (newPw.length < 8) return setErr("Password must be at least 8 characters.");
    setErr(""); onSave(); onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-[18px] font-bold text-[#1c1b1b]">Change Password</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#f0edec] text-[#6e7978]"><X className="w-4 h-4" /></button>
        </div>
        {err && <p className="text-[12px] text-[#ba1a1a] bg-[#ffdad6]/50 rounded-lg px-3 py-2 mb-4">{err}</p>}
        <div className="space-y-3">
          {[
            { label: "Current Password", val: oldPw, set: setOldPw, show: showOld, toggle: () => setShowOld(!showOld) },
            { label: "New Password",     val: newPw, set: setNewPw, show: showNew, toggle: () => setShowNew(!showNew) },
            { label: "Confirm New Password", val: confirmPw, set: setConfirmPw, show: showNew, toggle: () => {} },
          ].map((f, i) => (
            <div key={i}>
              <label className="text-[11px] font-bold text-[#3e4947] uppercase block mb-1">{f.label}</label>
              <div className="relative">
                <input type={f.show ? "text" : "password"} value={f.val} onChange={e => f.set(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#bec9c7]/60 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#00534e]/30 bg-[#fcf9f8]" />
                <button type="button" onClick={f.toggle} className="absolute right-3 top-2.5 text-[#6e7978]">
                  {f.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={submit} className="w-full mt-5 py-2.5 bg-[#00534e] text-white rounded-xl text-[13px] font-bold hover:opacity-90">Update Password</button>
      </motion.div>
    </div>
  );
}

const NAV_ITEMS: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: "profile",       label: "Profile",             icon: <User className="w-4 h-4" /> },
  { id: "security",      label: "Account & Security",  icon: <Shield className="w-4 h-4" /> },
  { id: "preferences",   label: "Preferences",         icon: <Settings2 className="w-4 h-4" /> },
  { id: "notifications", label: "Notifications",       icon: <Bell className="w-4 h-4" /> },
  { id: "connected",     label: "Connected Accounts",  icon: <Link2 className="w-4 h-4" /> },
  { id: "privacy",       label: "Data & Privacy",      icon: <Lock className="w-4 h-4" /> },
  { id: "ai",            label: "AI Assistant",        icon: <Brain className="w-4 h-4" /> },
  { id: "subscription",  label: "Subscription",        icon: <CreditCard className="w-4 h-4" /> },
  { id: "backup",        label: "Backup & Export",     icon: <CloudUpload className="w-4 h-4" /> },
  { id: "help",          label: "Help & Support",      icon: <HelpCircle className="w-4 h-4" /> },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [active, setActive] = useState<Section>("profile");

  // Profile
  const [editing, setEditing]       = useState(false);
  const [name, setName]             = useState("Sarah Johnson");
  const [email, setEmail]           = useState("sarah.johnson@email.com");
  const [phone, setPhone]           = useState("+1 (555) 123-4567");
  const [tz, setTz]                 = useState("(UTC-05:00) Eastern Time");

  // Security
  const [twoFa, setTwoFa]           = useState(true);
  const [pwOpen, setPwOpen]         = useState(false);

  // Preferences
  const [currency, setCurrency]     = useState("USD - US Dollar");
  const [dateFormat, setDateFmt]    = useState("MM/DD/YYYY");
  const [language, setLanguage]     = useState("English");

  // Notifications
  const [notifs, setNotifs] = useState({
    budget: true, spending: true, bills: true,
    marketing: false, goals: true, ai: true,
  });
  const toggleNotif = (k: keyof typeof notifs) => setNotifs(p => ({ ...p, [k]: !p[k] }));

  // AI
  const [aiPersonalized, setAiPersonalized] = useState(true);
  const [aiVoice, setAiVoice]               = useState(false);
  const [aiDataShare, setAiDataShare]       = useState(true);

  // Modals
  const [deleteOpen, setDeleteOpen]     = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState("");
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const nav = (s: Section) => setActive(s);

  return (
    <div className="animate-fade-in">
      {/* ── TOAST ── */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-[100] bg-[#00534e] text-white px-5 py-3 rounded-xl shadow-xl text-[13px] font-semibold flex items-center gap-2">
            <Check className="w-4 h-4" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row gap-6">

        {/* ══════════ SIDEBAR ══════════ */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col gap-5">
          <div>
            <h1 className="text-[24px] font-bold text-[#00534e]">Settings</h1>
            <p className="text-[12px] text-[#3e4947] mt-0.5">Manage your account and preferences.</p>
          </div>

          <nav className="flex flex-col gap-0.5">
            {NAV_ITEMS.map(item => (
              <button key={item.id} onClick={() => nav(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 text-left w-full ${
                  active === item.id
                    ? "bg-[#006d67] text-white shadow-sm"
                    : "text-[#3e4947] hover:bg-[#e5e2e1]"
                }`}>
                {item.icon} {item.label}
              </button>
            ))}
          </nav>

          {/* Help card */}
          <div className="p-4 bg-[#f0edec] rounded-xl flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#006d67] flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-[#1c1b1b]">Need Help?</p>
                <p className="text-[11px] text-[#3e4947]">Our team is here to assist.</p>
              </div>
            </div>
            <button onClick={() => { nav("help"); showToast("Opening support…"); }}
              className="w-full py-2 border border-[#00534e] text-[#00534e] text-[12px] font-bold rounded-lg hover:bg-[#00534e] hover:text-white transition-all">
              Contact Support
            </button>
          </div>
        </aside>

        {/* ══════════ MAIN CONTENT ══════════ */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={active}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}>

              {/* ══ PROFILE ══ */}
              {active === "profile" && (
                <Card className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <SectionTitle title="Profile Information" sub="Update your personal information and profile details." />
                    <button onClick={() => editing ? undefined : setEditing(true)}
                      className="flex items-center gap-1.5 px-4 py-2 border border-[#00534e] text-[#00534e] text-[13px] font-semibold rounded-lg hover:bg-[#f6f3f2] transition-all shrink-0">
                      <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                    </button>
                  </div>
                  <div className="flex flex-col md:flex-row items-start gap-8">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-28 h-28 rounded-full border-4 border-[#9ef1e9] bg-[#006d67] flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                        SJ
                      </div>
                      <button onClick={() => showToast("Photo upload coming soon!")}
                        className="absolute bottom-0 right-0 p-2 bg-[#00534e] text-white rounded-full border-4 border-white shadow-md hover:scale-110 transition-transform">
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                    {/* Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5 flex-1">
                      {[
                        { label: "Full Name",      val: name,  set: setName },
                        { label: "Phone Number",   val: phone, set: setPhone },
                        { label: "Email Address",  val: email, set: setEmail },
                        { label: "Time Zone",      val: tz,    set: setTz },
                      ].map(f => (
                        <div key={f.label} className="flex flex-col gap-1">
                          <span className="text-[11px] text-[#6e7978] font-semibold uppercase">{f.label}</span>
                          {editing ? (
                            <input value={f.val} onChange={e => f.set(e.target.value)}
                              className="px-3 py-2 border border-[#bec9c7]/60 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#00534e]/30 bg-[#fcf9f8]" />
                          ) : (
                            <span className="text-[16px] font-semibold text-[#1c1b1b]">{f.val}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  {editing && (
                    <div className="flex gap-2 mt-6 justify-end">
                      <button onClick={() => setEditing(false)}
                        className="px-5 py-2.5 border border-[#bec9c7] rounded-xl text-[13px] font-semibold text-[#3e4947] hover:bg-[#f0edec]">Cancel</button>
                      <button onClick={() => { setEditing(false); showToast("Profile updated successfully!"); }}
                        className="px-5 py-2.5 bg-[#00534e] text-white rounded-xl text-[13px] font-bold hover:opacity-90 shadow-sm">Save Changes</button>
                    </div>
                  )}
                </Card>
              )}

              {/* ══ ACCOUNT & SECURITY ══ */}
              {active === "security" && (
                <div className="space-y-4">
                  <Card className="p-6">
                    <SectionTitle title="Account & Security" sub="Manage your password and security settings." />
                    <div className="divide-y divide-[#f0edec]">
                      {[
                        { icon: <Lock className="w-5 h-5 text-[#3e4947]" />, title: "Change Password", sub: "Last changed 30 days ago", action: () => setPwOpen(true) },
                        { icon: <Shield className="w-5 h-5 text-[#3e4947]" />, title: "Two-Factor Auth", sub: twoFa ? "Currently enabled" : "Currently disabled",
                          action: () => { setTwoFa(!twoFa); showToast(`2FA ${!twoFa ? "enabled" : "disabled"}`); } },
                        { icon: <History className="w-5 h-5 text-[#3e4947]" />, title: "Login Activity", sub: "Manage active sessions", action: () => showToast("Viewing login activity…") },
                        { icon: <Smartphone className="w-5 h-5 text-[#3e4947]" />, title: "Device Management", sub: "3 trusted devices", action: () => showToast("Managing devices…") },
                      ].map((row, i) => (
                        <button key={i} onClick={row.action}
                          className="w-full flex items-center justify-between py-4 group hover:bg-[#f6f3f2] px-3 rounded-xl transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#f0edec] flex items-center justify-center">{row.icon}</div>
                            <div className="text-left">
                              <p className="text-[14px] font-semibold text-[#1c1b1b]">{row.title}</p>
                              <p className="text-[12px] text-[#6e7978]">{row.sub}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#bec9c7] group-hover:translate-x-1 transition-transform" />
                        </button>
                      ))}
                    </div>
                  </Card>
                  {/* 2FA toggle card */}
                  <Card className="p-5 flex items-center justify-between">
                    <div>
                      <p className="text-[14px] font-bold text-[#1c1b1b]">Two-Factor Authentication</p>
                      <p className="text-[12px] text-[#6e7978] mt-0.5">Add an extra layer of security to your account</p>
                    </div>
                    <Toggle checked={twoFa} onChange={() => { setTwoFa(!twoFa); showToast(`2FA ${!twoFa ? "enabled" : "disabled"}`); }} />
                  </Card>
                </div>
              )}

              {/* ══ PREFERENCES ══ */}
              {active === "preferences" && (
                <Card className="p-6">
                  <SectionTitle title="Preferences" sub="Customize your app experience." />
                  <div className="divide-y divide-[#f0edec]">
                    {/* Currency */}
                    <div className="py-4 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                          <span className="text-[16px] font-bold">$</span>
                        </div>
                        <div>
                          <p className="text-[14px] font-semibold text-[#1c1b1b]">Currency</p>
                          <p className="text-[12px] text-[#6e7978]">Choose your default currency.</p>
                        </div>
                      </div>
                      <select value={currency} onChange={e => { setCurrency(e.target.value); showToast("Currency updated!"); }}
                        className="w-44 bg-[#f0edec] border-none rounded-lg text-[13px] py-2 px-3 focus:ring-2 focus:ring-[#00534e] focus:outline-none">
                        <option>USD - US Dollar</option><option>EUR - Euro</option><option>GBP - British Pound</option><option>INR - Indian Rupee</option>
                      </select>
                    </div>
                    {/* Date Format */}
                    <div className="py-4 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-700">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[14px] font-semibold text-[#1c1b1b]">Date Format</p>
                          <p className="text-[12px] text-[#6e7978]">Select your preferred date format.</p>
                        </div>
                      </div>
                      <select value={dateFormat} onChange={e => { setDateFmt(e.target.value); showToast("Date format updated!"); }}
                        className="w-44 bg-[#f0edec] border-none rounded-lg text-[13px] py-2 px-3 focus:ring-2 focus:ring-[#00534e] focus:outline-none">
                        <option>MM/DD/YYYY</option><option>DD/MM/YYYY</option><option>YYYY-MM-DD</option>
                      </select>
                    </div>
                    {/* Theme */}
                    <div className="py-4 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700">
                          <span className="text-[16px]">🌙</span>
                        </div>
                        <div>
                          <p className="text-[14px] font-semibold text-[#1c1b1b]">Theme</p>
                          <p className="text-[12px] text-[#6e7978]">Choose your preferred theme.</p>
                        </div>
                      </div>
                      <div className="flex bg-[#f0edec] rounded-lg p-1 gap-0.5">
                        {["light","dark","system"].map(t => (
                          <button key={t} onClick={() => { setTheme(t as "light"|"dark"|"system"); showToast(`Theme set to ${t}`); }}
                            className={`px-3 py-1.5 rounded-md text-[13px] font-semibold capitalize transition-all ${theme===t ? "bg-white shadow text-[#00534e]" : "text-[#6e7978] hover:text-[#1c1b1b]"}`}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Language */}
                    <div className="py-4 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                          <span className="text-[16px]">🌐</span>
                        </div>
                        <div>
                          <p className="text-[14px] font-semibold text-[#1c1b1b]">Language</p>
                          <p className="text-[12px] text-[#6e7978]">Select your preferred language.</p>
                        </div>
                      </div>
                      <select value={language} onChange={e => { setLanguage(e.target.value); showToast("Language updated!"); }}
                        className="w-44 bg-[#f0edec] border-none rounded-lg text-[13px] py-2 px-3 focus:ring-2 focus:ring-[#00534e] focus:outline-none">
                        <option>English</option><option>Spanish</option><option>French</option><option>German</option>
                      </select>
                    </div>
                  </div>
                </Card>
              )}

              {/* ══ NOTIFICATIONS ══ */}
              {active === "notifications" && (
                <Card className="p-6">
                  <SectionTitle title="Notification Preferences" sub="Choose what you want to be notified about." />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                    {([
                      { key: "budget",    label: "Budget Alerts",       sub: "Alerts when you exceed budget",   icon: <Bell className="w-4 h-4" />, bg: "bg-orange-50 text-orange-600" },
                      { key: "spending",  label: "Spending Insights",   sub: "Weekly spending tips",            icon: <TrendingUp className="w-4 h-4" />, bg: "bg-green-50 text-green-600" },
                      { key: "bills",     label: "Bill Reminders",      sub: "Reminders for upcoming bills",    icon: <Calendar className="w-4 h-4" />, bg: "bg-blue-50 text-blue-600" },
                      { key: "marketing", label: "Marketing & Tips",    sub: "News and helpful updates",        icon: <Mail className="w-4 h-4" />, bg: "bg-purple-50 text-purple-600" },
                      { key: "goals",     label: "Goal Updates",        sub: "Updates on your goal progress",   icon: <Target className="w-4 h-4" />, bg: "bg-teal-50 text-teal-600" },
                      { key: "ai",        label: "AI Recommendations",  sub: "Personalized AI advice",          icon: <Bot className="w-4 h-4" />, bg: "bg-indigo-50 text-indigo-600" },
                    ] as const).map(n => (
                      <div key={n.key} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${n.bg} flex items-center justify-center`}>{n.icon}</div>
                          <div>
                            <p className="text-[13px] font-semibold text-[#1c1b1b]">{n.label}</p>
                            <p className="text-[11px] text-[#6e7978]">{n.sub}</p>
                          </div>
                        </div>
                        <Toggle checked={notifs[n.key]} onChange={() => { toggleNotif(n.key); showToast(`${n.label} ${!notifs[n.key] ? "enabled" : "disabled"}`); }} />
                      </div>
                    ))}
                  </div>
                  <button onClick={() => showToast("Notification preferences saved!")}
                    className="mt-8 px-6 py-2.5 bg-[#00534e] text-white rounded-xl text-[13px] font-bold hover:opacity-90 shadow-sm">
                    Save Preferences
                  </button>
                </Card>
              )}

              {/* ══ CONNECTED ACCOUNTS ══ */}
              {active === "connected" && (
                <Card className="p-6">
                  <SectionTitle title="Connected Accounts" sub="Manage your linked financial accounts." />
                  <div className="space-y-3">
                    {[
                      { abbr: "CHASE", bg: "bg-blue-600",  name: "Chase Checking",    sub: "•••• 1234", connected: true },
                      { abbr: "WELLS", bg: "bg-red-600",   name: "Wells Fargo Credit", sub: "•••• 5678", connected: true },
                      { abbr: "PP",    bg: "bg-blue-400",  name: "PayPal Account",    sub: "sarah.j@email.com", connected: true },
                      { abbr: "AMEX",  bg: "bg-gray-700",  name: "Amex Platinum",     sub: "•••• 9999", connected: false },
                    ].map(acc => (
                      <div key={acc.name} className="flex items-center justify-between p-3 bg-[#f6f3f2] rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full ${acc.bg} flex items-center justify-center text-white font-bold text-[10px]`}>{acc.abbr}</div>
                          <div>
                            <p className="text-[13px] font-bold text-[#1c1b1b]">{acc.name}</p>
                            <p className="text-[11px] text-[#6e7978]">{acc.sub}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${acc.connected ? "text-green-700 bg-green-100" : "text-[#6e7978] bg-[#e5e2e1]"}`}>
                            {acc.connected ? "CONNECTED" : "DISCONNECTED"}
                          </span>
                          <button onClick={() => showToast(acc.connected ? `${acc.name} disconnected` : `${acc.name} connected`)}
                            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors ${acc.connected ? "border border-[#ba1a1a] text-[#ba1a1a] hover:bg-[#ffdad6]/40" : "bg-[#00534e] text-white hover:opacity-90"}`}>
                            {acc.connected ? "Disconnect" : "Connect"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => showToast("Opening account linking…")}
                    className="mt-5 flex items-center gap-2 text-[#00534e] text-[13px] font-bold hover:underline">
                    <Plus className="w-4 h-4" /> Add New Account
                  </button>
                </Card>
              )}

              {/* ══ DATA & PRIVACY ══ */}
              {active === "privacy" && (
                <div className="space-y-4">
                  <Card className="p-6">
                    <SectionTitle title="Data & Privacy" sub="Manage your data and privacy settings." />
                    <div className="space-y-2">
                      <button onClick={() => setDownloadOpen(true)}
                        className="w-full flex items-center justify-between p-4 hover:bg-[#f6f3f2] rounded-xl transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#9ef1e9]/30 flex items-center justify-center">
                            <Download className="w-4 h-4 text-[#00534e]" />
                          </div>
                          <div className="text-left">
                            <p className="text-[14px] font-semibold text-[#1c1b1b]">Download My Data</p>
                            <p className="text-[12px] text-[#6e7978]">Export all your data as a ZIP file</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#bec9c7] group-hover:translate-x-1 transition-transform" />
                      </button>
                      <button onClick={() => setDeleteOpen(true)}
                        className="w-full flex items-center justify-between p-4 hover:bg-[#ffdad6]/30 rounded-xl transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#ffdad6]/50 flex items-center justify-center">
                            <Trash2 className="w-4 h-4 text-[#ba1a1a]" />
                          </div>
                          <div className="text-left">
                            <p className="text-[14px] font-semibold text-[#ba1a1a]">Delete Account</p>
                            <p className="text-[12px] text-[#6e7978]">Permanently delete all your data</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#fca5a5] group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </Card>
                  <Card className="p-6">
                    <h3 className="text-[15px] font-bold text-[#1c1b1b] mb-4">Privacy Toggles</h3>
                    {[
                      { label: "Share usage analytics", sub: "Help improve the app with anonymous data", val: true },
                      { label: "Personalised ads", sub: "Allow data for targeted experiences", val: false },
                      { label: "Third-party integrations", sub: "Share data with connected services", val: true },
                    ].map((p, i) => {
                      const [on, setOn] = useState(p.val);
                      return (
                        <div key={i} className="flex items-center justify-between py-3 border-b border-[#f0edec] last:border-0">
                          <div>
                            <p className="text-[13px] font-semibold text-[#1c1b1b]">{p.label}</p>
                            <p className="text-[11px] text-[#6e7978]">{p.sub}</p>
                          </div>
                          <Toggle checked={on} onChange={() => { setOn(!on); showToast(`${p.label} ${!on ? "enabled" : "disabled"}`); }} />
                        </div>
                      );
                    })}
                  </Card>
                </div>
              )}

              {/* ══ AI ASSISTANT ══ */}
              {active === "ai" && (
                <Card className="p-6">
                  <SectionTitle title="AI Assistant" sub="Configure your AI-powered financial assistant." />
                  <div className="space-y-5">
                    {[
                      { label: "Personalised Insights", sub: "AI learns from your spending patterns", val: aiPersonalized, set: setAiPersonalized },
                      { label: "Voice Commands",        sub: "Enable voice input for the AI", val: aiVoice, set: setAiVoice },
                      { label: "Share Data for Training", sub: "Help improve AI models (anonymised)", val: aiDataShare, set: setAiDataShare },
                    ].map((s, i) => (
                      <div key={i} className="flex items-center justify-between py-4 border-b border-[#f0edec] last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Bot className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[14px] font-semibold text-[#1c1b1b]">{s.label}</p>
                            <p className="text-[12px] text-[#6e7978]">{s.sub}</p>
                          </div>
                        </div>
                        <Toggle checked={s.val} onChange={() => { s.set(!s.val); showToast(`${s.label} ${!s.val ? "enabled" : "disabled"}`); }} />
                      </div>
                    ))}
                    <div className="bg-[#f0edec] rounded-xl p-4 mt-2">
                      <p className="text-[13px] font-bold text-[#00534e] mb-1">Current AI Model</p>
                      <p className="text-[12px] text-[#3e4947]">Budget Predict AI v3.2 — Fine-tuned on financial data</p>
                      <button onClick={() => showToast("Checking for model updates…")}
                        className="mt-3 text-[12px] text-[#00534e] font-bold hover:underline">Check for updates →</button>
                    </div>
                  </div>
                </Card>
              )}

              {/* ══ SUBSCRIPTION ══ */}
              {active === "subscription" && (
                <div className="space-y-4">
                  <Card className="p-6">
                    <SectionTitle title="Subscription" sub="Manage your plan and billing." />
                    {/* Current plan */}
                    <div className="bg-gradient-to-r from-[#00534e] to-[#006d67] rounded-2xl p-6 text-white mb-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[12px] font-semibold opacity-80 uppercase tracking-wider">Current Plan</p>
                          <h3 className="text-[24px] font-bold mt-1">Premium</h3>
                          <p className="text-[13px] opacity-80 mt-1">$9.99 / month · Renews Jun 1, 2024</p>
                        </div>
                        <span className="px-3 py-1 bg-[#fcab28] text-[#694300] text-[11px] font-bold rounded-full">ACTIVE</span>
                      </div>
                      <div className="mt-5 grid grid-cols-2 gap-3">
                        {["AI Predictions","Unlimited Budgets","Export Reports","Priority Support"].map(f => (
                          <div key={f} className="flex items-center gap-1.5 text-[12px]">
                            <Check className="w-3.5 h-3.5 text-[#9ef1e9]" /> {f}
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Plan options */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { name: "Free",    price: "$0",    period: "forever", features: ["5 Budgets","Basic Reports","30-day history"], current: false },
                        { name: "Premium", price: "$9.99", period: "/ month",  features: ["Unlimited","AI Insights","Export + Priority"], current: true },
                        { name: "Business",price: "$24.99",period: "/ month",  features: ["Multi-user","API Access","Custom Reports"], current: false },
                      ].map(plan => (
                        <div key={plan.name} className={`border rounded-xl p-4 ${plan.current ? "border-[#00534e] bg-[#00534e]/5" : "border-[#e5e2e1]"}`}>
                          <p className="text-[15px] font-bold text-[#1c1b1b]">{plan.name}</p>
                          <p className="text-[22px] font-extrabold text-[#00534e] mt-1">{plan.price}<span className="text-[12px] text-[#6e7978] font-normal"> {plan.period}</span></p>
                          <ul className="mt-3 space-y-1.5">
                            {plan.features.map(f => <li key={f} className="text-[11px] text-[#3e4947] flex items-center gap-1.5"><Check className="w-3 h-3 text-[#00534e]" />{f}</li>)}
                          </ul>
                          <button onClick={() => showToast(plan.current ? "Already on this plan" : `Switching to ${plan.name}…`)}
                            className={`w-full mt-4 py-2 rounded-lg text-[12px] font-bold transition-all ${plan.current ? "bg-[#00534e] text-white" : "border border-[#00534e] text-[#00534e] hover:bg-[#00534e]/5"}`}>
                            {plan.current ? "Current Plan" : `Switch to ${plan.name}`}
                          </button>
                        </div>
                      ))}
                    </div>
                  </Card>
                  <Card className="p-5 flex items-center justify-between">
                    <div>
                      <p className="text-[14px] font-bold text-[#ba1a1a]">Cancel Subscription</p>
                      <p className="text-[12px] text-[#6e7978]">Your plan will remain active until the end of the billing period.</p>
                    </div>
                    <button onClick={() => showToast("Cancellation flow coming soon…")}
                      className="px-4 py-2 border border-[#ba1a1a] text-[#ba1a1a] rounded-xl text-[12px] font-bold hover:bg-[#ffdad6]/40">Cancel</button>
                  </Card>
                </div>
              )}

              {/* ══ BACKUP & EXPORT ══ */}
              {active === "backup" && (
                <Card className="p-6">
                  <SectionTitle title="Backup & Export" sub="Download your financial data or set up automatic backups." />
                  <div className="space-y-3">
                    {[
                      { icon: <Download className="w-4 h-4 text-[#00534e]" />, bg: "bg-[#9ef1e9]/30", title: "Export as CSV", sub: "All transactions in spreadsheet format",     action: () => showToast("CSV export started!") },
                      { icon: <Download className="w-4 h-4 text-[#835400]" />, bg: "bg-[#ffddb5]/40", title: "Export as PDF",  sub: "Full financial report as PDF",              action: () => showToast("PDF export started!") },
                      { icon: <CloudUpload className="w-4 h-4 text-indigo-600" />, bg: "bg-indigo-50", title: "Backup to Cloud", sub: "Sync your data to secure cloud storage",  action: () => showToast("Cloud backup initiated!") },
                      { icon: <Download className="w-4 h-4 text-[#3e4947]" />, bg: "bg-[#f0edec]", title: "Full Data Export",  sub: "Download everything as a ZIP archive",      action: () => setDownloadOpen(true) },
                    ].map(item => (
                      <button key={item.title} onClick={item.action}
                        className="w-full flex items-center justify-between p-4 bg-[#f6f3f2] hover:bg-[#f0edec] rounded-xl transition-all group">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center`}>{item.icon}</div>
                          <div className="text-left">
                            <p className="text-[14px] font-semibold text-[#1c1b1b]">{item.title}</p>
                            <p className="text-[12px] text-[#6e7978]">{item.sub}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#bec9c7] group-hover:translate-x-1 transition-transform" />
                      </button>
                    ))}
                  </div>
                  <div className="mt-5 p-4 bg-[#f6f3f2] rounded-xl">
                    <p className="text-[13px] font-bold text-[#1c1b1b]">Last Backup</p>
                    <p className="text-[12px] text-[#6e7978] mt-0.5">May 05, 2024 at 09:30 AM · All data synced</p>
                  </div>
                </Card>
              )}

              {/* ══ HELP & SUPPORT ══ */}
              {active === "help" && (
                <div className="space-y-4">
                  <Card className="p-6">
                    <SectionTitle title="Help & Support" sub="Find answers or get in touch with our team." />
                    <div className="space-y-2">
                      {[
                        { icon: <MessageSquare className="w-4 h-4 text-[#00534e]" />, bg: "bg-[#9ef1e9]/30", title: "Live Chat Support",   sub: "Chat with us — avg. response 2 min",  action: () => showToast("Opening live chat…") },
                        { icon: <Mail className="w-4 h-4 text-[#835400]" />,          bg: "bg-[#ffddb5]/40", title: "Email Support",       sub: "support@budgetpredict.ai",             action: () => showToast("Opening email…") },
                        { icon: <Phone className="w-4 h-4 text-[#3e4947]" />,         bg: "bg-[#f0edec]",    title: "Call Support",        sub: "+1 (800) 123-4567 · Mon–Fri 9–6 ET",  action: () => showToast("Initiating call…") },
                        { icon: <HelpCircle className="w-4 h-4 text-indigo-600" />,   bg: "bg-indigo-50",    title: "Help Centre / FAQ",   sub: "Browse articles and guides",           action: () => showToast("Opening Help Centre…") },
                      ].map(item => (
                        <button key={item.title} onClick={item.action}
                          className="w-full flex items-center justify-between p-4 hover:bg-[#f6f3f2] rounded-xl transition-all group">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center`}>{item.icon}</div>
                            <div className="text-left">
                              <p className="text-[14px] font-semibold text-[#1c1b1b]">{item.title}</p>
                              <p className="text-[12px] text-[#6e7978]">{item.sub}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#bec9c7] group-hover:translate-x-1 transition-transform" />
                        </button>
                      ))}
                    </div>
                  </Card>
                  <Card className="p-5">
                    <p className="text-[14px] font-bold text-[#1c1b1b] mb-3">Send a Message</p>
                    <textarea placeholder="Describe your issue…" rows={4}
                      className="w-full px-3 py-2.5 border border-[#bec9c7]/60 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#00534e]/30 bg-[#fcf9f8] resize-none" />
                    <button onClick={() => showToast("Message sent! We'll get back to you soon.")}
                      className="mt-3 px-6 py-2.5 bg-[#00534e] text-white rounded-xl text-[13px] font-bold hover:opacity-90">Send Message</button>
                  </Card>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── MODALS ── */}
      <PasswordModal open={pwOpen} onClose={() => setPwOpen(false)} onSave={() => showToast("Password changed successfully!")} />
      <ConfirmModal open={deleteOpen} onClose={() => setDeleteOpen(false)} danger
        title="Delete Account" message="This will permanently delete your account and all data. This action cannot be undone."
        onConfirm={() => showToast("Account deletion requested.")} />
      <ConfirmModal open={downloadOpen} onClose={() => setDownloadOpen(false)}
        title="Download Data" message="We'll prepare your data archive and email it to sarah.johnson@email.com within 24 hours."
        onConfirm={() => showToast("Data export requested! Check your email soon.")} />
    </div>
  );
}
