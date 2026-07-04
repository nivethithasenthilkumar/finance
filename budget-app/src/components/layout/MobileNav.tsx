"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  UserCircle,
  Plus,
} from "lucide-react";

const mobileNavItems = [
  { label: "Dashboard",    icon: LayoutDashboard, href: "/dashboard" },
  { label: "Transactions", icon: ArrowLeftRight,  href: "/dashboard/transactions" },
  { label: "Budget",       icon: PieChart,        href: "/dashboard/budget-planner" },
  { label: "Profile",      icon: UserCircle,      href: "/dashboard/profile" },
];

export function MobileNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      {/* FAB */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2">
        <button className="w-12 h-12 rounded-full bg-[#00534e] flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200">
          <Plus className="w-6 h-6 text-white" />
        </button>
      </div>

      <nav className="bg-white/95 backdrop-blur-xl border-t border-[#e5e2e1] px-2 pb-4">
        <div className="flex items-center justify-around py-2">
          {mobileNavItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 ${
                  active ? "text-[#00534e]" : "text-[#6e7978] hover:text-[#1c1b1b]"
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all duration-200 ${active ? "bg-[#9ef1e9]/30" : ""}`}>
                  <item.icon className={`w-5 h-5 ${active ? "text-[#00534e]" : ""}`} />
                </div>
                <span className="text-[10px] font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
