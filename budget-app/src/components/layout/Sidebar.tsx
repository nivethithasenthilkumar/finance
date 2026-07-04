"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, BrainCircuit, ArrowLeftRight, PieChart,
  Target, MessageSquareText, Bell, UserCircle,
  Settings, LogOut, TrendingUp, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/app-store";

const navItems = [
  { label: "Dashboard",    icon: LayoutDashboard,    href: "/dashboard" },
  { label: "AI Prediction",icon: BrainCircuit,        href: "/dashboard/ai-prediction" },
  { label: "Transactions", icon: ArrowLeftRight,      href: "/dashboard/transactions" },
  { label: "Budget Planner",icon: PieChart,           href: "/dashboard/budget-planner" },
  { label: "Goals",        icon: Target,              href: "/dashboard/goals" },
  { label: "AI Assistant", icon: MessageSquareText,   href: "/dashboard/ai-assistant" },
  { label: "Notifications",icon: Bell,                href: "/dashboard/notifications" },
  { label: "Profile",      icon: UserCircle,          href: "/dashboard/profile" },
  { label: "Settings",     icon: Settings,            href: "/dashboard/settings" },
];

interface SidebarProps {
  onClose?: () => void;
  isMobileOpen?: boolean;
}

export function Sidebar({ onClose, isMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, logout } = useAppStore();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside className="sidebar-gradient flex flex-col h-full w-64 shadow-2xl">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shadow-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">BUDGET</p>
            <p className="text-emerald-400 font-semibold text-xs tracking-wider">PREDICT AI</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User quick info */}
      <div className="mx-4 mb-4 p-3 rounded-2xl bg-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {profile.avatar ? (
            <img src={profile.avatar} alt="avatar" className="w-9 h-9 rounded-full object-cover border border-white/20 shadow" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
              {profile.initials || "?"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">{profile.name || "Set up profile"}</p>
            <p className="text-white/60 text-xs truncate">{profile.plan} Plan</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto scrollbar-hide space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                active
                  ? "bg-white/20 text-white shadow-lg shadow-black/10"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 flex-shrink-0 transition-transform duration-200",
                  active ? "text-emerald-400" : "group-hover:scale-110"
                )}
              />
              <span className="text-sm font-medium">{item.label}</span>
              {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-6 pt-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200 w-full group"
        >
          <LogOut className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
