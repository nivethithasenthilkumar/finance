"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { MobileNav } from "@/components/layout/MobileNav";
import { useAppStore } from "@/lib/app-store";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isLoggedIn, profileComplete } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    // If not logged in, set error message and redirect to landing
    if (!isLoggedIn) {
      sessionStorage.setItem("bpa_auth_error", "Please register or login first to access the dashboard.");
      router.replace("/");
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-[#fcf9f8] flex flex-col pt-16">
      {/* Top Nav — fixed at top */}
      <TopNav onMenuClick={() => setSidebarOpen(true)} />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 flex flex-col w-64 h-full animate-slide-in">
            <Sidebar onClose={() => setSidebarOpen(false)} isMobileOpen={sidebarOpen} />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 lg:px-8 py-6 pb-24 lg:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
