"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  ChevronDown,
  Menu,
  Shield,
  Search,
  User,
  Settings,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface DashboardHeaderProps {
  title?: string;
  onOpenMobileMenu?: () => void;
}

export default function DashboardHeader({
  title = "Dashboard",
  onOpenMobileMenu,
}: DashboardHeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { fullName, email, signOut } = useAuth();

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-[#070a12]/85 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      {/* Left side: Mobile menu toggle & Current Page Title */}
      <div className="flex items-center gap-3 sm:gap-4">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            aria-label="Open navigation sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2">
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
            {title}
          </h1>
          <span className="hidden sm:inline-block text-xs font-mono text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
            LIVE SHIELD
          </span>
        </div>
      </div>

      {/* Right side: Notifications & User Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notification Bell with Badge & Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors relative cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#070a12] animate-pulse" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#0b0f19] border border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                  Threat Alerts
                </span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded">
                  1 New
                </span>
              </div>
              <div className="py-2.5 space-y-2">
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/70 hover:border-slate-700 transition-colors">
                  <div className="text-xs font-semibold text-rose-300">
                    High Risk Scam Detected
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    &quot;Global Career Hub&quot; flagged for upfront equipment fee requests.
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1.5">
                    10 minutes ago
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar & Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-slate-800/50 border border-transparent hover:border-slate-800 transition-colors cursor-pointer"
          >
            {/* Avatar */}
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-xs font-mono shrink-0">
              {getInitials(fullName)}
            </div>

            {/* Name */}
            <span className="hidden sm:inline-block text-xs font-semibold text-slate-200">
              {fullName}
            </span>

            {/* Dropdown chevron */}
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0b0f19] border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                <div className="text-xs font-semibold text-white truncate">{fullName}</div>
                <div className="text-[11px] font-mono text-slate-400 truncate">
                  {email}
                </div>
              </div>

              <Link
                href="/dashboard/settings"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Account Settings</span>
              </Link>

              <button
                onClick={() => {
                  setProfileOpen(false);
                  signOut();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
