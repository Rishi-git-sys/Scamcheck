"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/context/AuthContext";
import { Menu } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-app text-primary-color flex selection:bg-accent-light selection:text-accent-primary transition-colors">
      {/* Sidebar (Desktop 220px Fixed + Mobile Drawer) */}
      <DashboardSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="md:pl-[220px] flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-subtle bg-app">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-1.5 rounded-md text-secondary-color hover:text-primary-color"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" strokeWidth={1.8} />
          </button>
          <span className="text-sm font-medium text-primary-color">ScamCheck</span>
          <div className="w-5" />
        </div>

        {/* Content Container */}
        <main className="flex-1 p-6 sm:p-10 max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
