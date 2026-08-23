"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  LayoutGrid,
  Search,
  Clock,
  Building2,
  BookOpen,
  Settings,
  X,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface DashboardSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function DashboardSidebar({
  mobileOpen = false,
  onCloseMobile,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const { fullName, email, signOut } = useAuth();

  const displayName = fullName && fullName !== "Alex Kumar" ? fullName : "Rishi R";
  const displayEmail = email && email !== "alex.kumar@student.edu" ? email : "rishi@university.edu";

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const workspaceNav = [
    { name: "Overview", href: "/dashboard", icon: LayoutGrid, exact: true },
    { name: "Check opportunity", href: "/dashboard/check", icon: Search, exact: false },
    { name: "History", href: "/dashboard/history", icon: Clock, exact: false },
  ];

  const exploreNav = [
    { name: "Companies", href: "/dashboard/companies", icon: Building2, exact: false },
    { name: "Safety guide", href: "/#trust-section", icon: BookOpen, exact: false },
  ];

  const accountNav = [
    { name: "Settings", href: "/dashboard/settings", icon: Settings, exact: false },
  ];

  const isActive = (itemHref: string, exact: boolean) => {
    if (exact) {
      return pathname === itemHref;
    }
    return pathname.startsWith(itemHref);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-app border-r border-subtle w-[220px] select-none p-4 justify-between transition-colors">
      <div>
        {/* Logo */}
        <div className="px-2 pt-1 pb-6 flex items-center justify-between border-b border-subtle">
          <Link
            href="/"
            className="flex items-center gap-2 text-primary-color group"
            onClick={onCloseMobile}
          >
            <div className="w-6 h-6 rounded-md bg-accent-light flex items-center justify-center text-accent-primary">
              <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
            </div>
            <span className="text-[15px] font-medium tracking-tight">
              ScamCheck
            </span>
          </Link>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1 text-secondary-color hover:text-primary-color"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="pt-6 space-y-6">
          
          {/* Workspace */}
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-tertiary-color px-2 block mb-2">
              Workspace
            </span>
            <div className="space-y-1">
              {workspaceNav.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, item.exact);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                      active
                        ? "bg-accent-light text-accent-primary"
                        : "text-secondary-color hover:bg-card hover:text-primary-color"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" strokeWidth={1.8} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Explore */}
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-tertiary-color px-2 block mb-2">
              Explore
            </span>
            <div className="space-y-1">
              {exploreNav.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, item.exact);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                      active
                        ? "bg-accent-light text-accent-primary"
                        : "text-secondary-color hover:bg-card hover:text-primary-color"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" strokeWidth={1.8} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Account */}
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-tertiary-color px-2 block mb-2">
              Account
            </span>
            <div className="space-y-1">
              {accountNav.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, item.exact);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                      active
                        ? "bg-accent-light text-accent-primary"
                        : "text-secondary-color hover:bg-card hover:text-primary-color"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" strokeWidth={1.8} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* User Profile at Bottom */}
      <div className="pt-4 border-t border-subtle">
        <div className="flex items-center justify-between p-2 rounded-xl bg-card border border-subtle shadow-soft">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-accent-light text-accent-primary font-medium text-xs flex items-center justify-center shrink-0">
              {getInitials(displayName)}
            </div>
            <div className="text-left leading-tight truncate">
              <div className="text-xs font-medium text-primary-color truncate max-w-[95px]">
                {displayName}
              </div>
              <div className="text-[10px] text-tertiary-color truncate max-w-[95px]">
                {displayEmail}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              signOut();
            }}
            className="text-tertiary-color hover:text-danger-color p-1 transition-colors cursor-pointer"
            title="Log out"
          >
            <LogOut className="w-3.5 h-3.5" strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-30 w-[220px]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 max-w-[220px] w-full z-50 shadow-lg animate-in slide-in-from-left duration-150">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
