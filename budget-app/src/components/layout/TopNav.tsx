"use client";

import { useState } from "react";
import { 
  Bell, Sun, Moon, Menu, LogOut, User, Settings,
} from "lucide-react";
import { useTheme } from "@/lib/theme-provider";
import { useAppStore } from "@/lib/app-store";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

interface TopNavProps {
  onMenuClick: () => void;
}

const navItems = [
  { label: "Overview",     href: "/dashboard" },
  { label: "AI Predict",   href: "/dashboard/ai-prediction" },
  { label: "Transactions", href: "/dashboard/transactions" },
  { label: "Budgets",      href: "/dashboard/budget-planner" },
  { label: "Goals",        href: "/dashboard/goals" },
  { label: "Assistant",    href: "/dashboard/ai-assistant" },
];

export function TopNav({ onMenuClick }: TopNavProps) {
  const { theme, toggleTheme } = useTheme();
  const { profile, logout } = useAppStore();
  const router = useRouter();
  const pathname = usePathname();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Page title from path
  const titleMap: Record<string, string> = {
    "/dashboard":              "Overview",
    "/dashboard/ai-prediction":"AI Prediction",
    "/dashboard/transactions": "Transactions",
    "/dashboard/budget-planner":"Budgets",
    "/dashboard/goals":        "Goals",
    "/dashboard/ai-assistant": "AI Assistant",
    "/dashboard/settings":     "Settings",
    "/dashboard/notifications":"Notifications",
    "/dashboard/profile":      "Profile",
  };
  const pageTitle = Object.entries(titleMap).find(([k]) => pathname === k || (k !== "/dashboard" && pathname.startsWith(k)))?.[1] ?? "Dashboard";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white w-full h-16 flex items-center border-b border-[#e5e2e1] shadow-sm">
      <div className="flex justify-between items-center w-full px-5 lg:px-8">

        {/* LEFT: hamburger + logo + page title */}
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="lg:hidden p-2 rounded-xl hover:bg-[#f0edec] text-[#3e4947]">
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-[#00534e] rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="text-[17px] font-extrabold text-[#00534e] tracking-tight hidden sm:block">
              Budget Predict AI
            </span>
          </Link>

          {/* Page title for desktop */}
          <div className="hidden lg:flex items-center gap-2 ml-2">
            <span className="text-[#bec9c7]">·</span>
            <span className="text-[14px] font-semibold text-[#3e4947]">{pageTitle}</span>
          </div>
        </div>

        {/* CENTER: Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 mx-4">
          {navItems.map((item) => {
            const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-colors ${
                  isActive 
                    ? "bg-[#00534e]/10 text-[#00534e]" 
                    : "text-[#6e7978] hover:bg-[#f0edec] hover:text-[#1c1b1b]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT: theme + bell + profile */}
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-[#f0edec] text-[#3e4947] hover:text-[#00534e] transition-colors" title="Toggle theme">
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <Link href="/dashboard/notifications" className="relative p-2 rounded-lg hover:bg-[#f0edec] text-[#3e4947] hover:text-[#00534e] transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#ba1a1a] border border-white" />
          </Link>

          {/* Profile avatar with dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="w-9 h-9 rounded-full border-2 border-[#9ef1e9] bg-[#00534e] flex items-center justify-center text-white font-bold text-[13px] hover:opacity-90 transition-opacity shadow-sm"
            >
              {profile.avatar ? (
                <img src={profile.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                profile.initials || "?"
              )}
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-[#e5e2e1] z-50 py-1.5" onClick={() => setProfileMenuOpen(false)}>
                {/* Profile info */}
                <div className="px-4 py-3 border-b border-[#f0edec]">
                  <p className="text-[13px] font-bold text-[#1c1b1b] truncate">{profile.name || "Guest"}</p>
                  <p className="text-[11px] text-[#6e7978] truncate">{profile.email || ""}</p>
                </div>
                <Link href="/dashboard/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#1c1b1b] hover:bg-[#f6f3f2] transition-colors">
                  <User className="w-4 h-4 text-[#6e7978]" /> Profile
                </Link>
                <Link href="/dashboard/settings" className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#1c1b1b] hover:bg-[#f6f3f2] transition-colors">
                  <Settings className="w-4 h-4 text-[#6e7978]" /> Settings
                </Link>
                <div className="border-t border-[#f0edec] mt-1 pt-1">
                  <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#ba1a1a] hover:bg-[#ffdad6]/30 transition-colors">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
