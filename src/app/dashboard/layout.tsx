"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/context/AuthContext";
import { Menu, ShieldCheck } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!loading && !user) router.push("/login"); }, [user, loading, router]);

  return <div className="min-h-screen bg-app text-primary-color flex">
    <DashboardSidebar mobileOpen={mobileSidebarOpen} onCloseMobile={() => setMobileSidebarOpen(false)} />
    <div className="md:pl-[248px] flex-1 flex flex-col min-w-0">
      <header className="md:hidden sticky top-0 z-40 h-16 px-4 border-b border-subtle bg-app/90 backdrop-blur-xl flex items-center justify-between">
        <button onClick={() => setMobileSidebarOpen(true)} className="w-9 h-9 rounded-lg border border-subtle bg-card flex items-center justify-center" aria-label="Open navigation"><Menu className="w-4 h-4"/></button>
        <div className="flex items-center gap-2 font-semibold text-sm"><ShieldCheck className="w-4 h-4 text-accent-primary"/> ScamCheck</div>
        <div className="w-9" />
      </header>
      <main className="flex-1 w-full max-w-7xl mx-auto p-5 sm:p-8 lg:p-10 page-enter-animation">{children}</main>
    </div>
  </div>;
}
