"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, LayoutGrid, Search, Clock3, Building2, BookOpen, Settings, X, LogOut, CircleHelp } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface DashboardSidebarProps { mobileOpen?: boolean; onCloseMobile?: () => void; }

export default function DashboardSidebar({ mobileOpen = false, onCloseMobile }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { fullName, email, signOut } = useAuth();
  const displayName = fullName && fullName !== "Alex Kumar" ? fullName : "Rishi R";
  const displayEmail = email && email !== "alex.kumar@student.edu" ? email : "rishi@university.edu";
  const getInitials = (name: string) => name.trim().split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
  const workspace = [{ name: "Overview", href: "/dashboard", icon: LayoutGrid, exact: true }, { name: "Check opportunity", href: "/dashboard/check", icon: Search, exact: false }, { name: "History", href: "/dashboard/history", icon: Clock3, exact: false }];
  const explore = [{ name: "Companies", href: "/dashboard/companies", icon: Building2, exact: false }, { name: "Safety guide", href: "/dashboard/safety-guide", icon: BookOpen, exact: false }];
  const account = [{ name: "Settings", href: "/dashboard/settings", icon: Settings, exact: false }];
  const isActive = (href: string, exact: boolean) => exact ? pathname === href : pathname.startsWith(href);

  const navGroup = (label: string, items: typeof workspace) => <div key={label}>
    <div className="px-3 mb-2 text-[10px] uppercase tracking-[.18em] font-semibold text-tertiary-color">{label}</div>
    <div className="space-y-1">{items.map(item => { const Icon = item.icon; const active = isActive(item.href, item.exact); return <Link key={item.name} href={item.href} onClick={onCloseMobile} className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? "bg-accent-light text-accent-primary" : "text-secondary-color hover:bg-card hover:text-primary-color"}`}>
      {active && <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-accent-primary"/>}<Icon className="w-[17px] h-[17px] shrink-0" strokeWidth={active ? 2.2 : 1.7}/><span>{item.name}</span>{item.name === "Check opportunity" && <span className="ml-auto text-[9px] rounded-full bg-accent-primary text-white dark:text-[#07100c] px-1.5 py-0.5 font-bold">SCAN</span>}
    </Link>})}</div>
  </div>;

  const content = <div className="h-full w-[248px] bg-[var(--bg-secondary)] border-r border-subtle flex flex-col p-4">
    <div className="px-2 pb-5 border-b border-subtle">
      <Link href="/" onClick={onCloseMobile} className="flex items-center gap-3"><span className="w-9 h-9 rounded-xl bg-accent-primary text-white dark:text-[#07100c] flex items-center justify-center"><ShieldCheck className="w-5 h-5"/></span><div><div className="font-semibold tracking-tight">ScamCheck</div><div className="text-[9px] uppercase tracking-[.16em] text-tertiary-color mt-0.5">Trust intelligence</div></div></Link>
      {onCloseMobile && <button onClick={onCloseMobile} className="md:hidden absolute right-4 top-4 p-2 text-secondary-color" aria-label="Close sidebar"><X className="w-4 h-4"/></button>}
    </div>
    <div className="flex-1 pt-6 space-y-7 overflow-y-auto">{navGroup("Workspace", workspace)}{navGroup("Explore", explore)}{navGroup("Account", account)}</div>
    <div className="pt-4 border-t border-subtle space-y-3">
      <div className="rounded-xl border border-subtle bg-card p-3"><div className="flex gap-2.5"><CircleHelp className="w-4 h-4 text-accent-primary shrink-0 mt-0.5"/><div><div className="text-xs font-semibold">Need a second opinion?</div><div className="text-[10px] text-tertiary-color mt-1 leading-relaxed">Use the safety guide before acting on a suspicious offer.</div></div></div></div>
      <div className="flex items-center gap-2.5 p-2 rounded-xl bg-card border border-subtle"><div className="w-8 h-8 rounded-lg bg-accent-light text-accent-primary flex items-center justify-center text-xs font-bold shrink-0">{getInitials(displayName)}</div><div className="min-w-0 flex-1"><div className="text-xs font-semibold truncate">{displayName}</div><div className="text-[10px] text-tertiary-color truncate">{displayEmail}</div></div><button onClick={() => { onCloseMobile?.(); signOut(); }} className="p-1.5 text-tertiary-color hover:text-danger-color" title="Log out"><LogOut className="w-4 h-4"/></button></div>
    </div>
  </div>;

  return <><aside className="hidden md:flex fixed inset-y-0 left-0 z-30 w-[248px]">{content}</aside>{mobileOpen && <div className="fixed inset-0 z-50 md:hidden"><div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCloseMobile}/><div className="absolute inset-y-0 left-0 z-50">{content}</div></div>}</>;
}
