"use client";

import { useState } from "react";
import { Check, Edit2, Download, Shield, Laptop, Sun, Moon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ThemeSelector from "@/components/theme/ThemeSelector";

export default function SettingsPage() {
  const { fullName, email } = useAuth();
  const displayName = fullName && fullName !== "Alex Kumar" ? fullName : "Rishi R";
  const displayEmail = email && email !== "alex.kumar@student.edu" ? email : "rishi@university.edu";

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    weeklyDigest: false,
    communityReports: true,
  });

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-16 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <span className="text-xs text-tertiary-color font-medium block">
          Account / Settings
        </span>
        <h1 className="text-2xl font-medium tracking-tight text-primary-color">
          Account settings
        </h1>
        <p className="text-sm text-secondary-color">
          Manage your personal profile, verification preferences, and appearance.
        </p>
      </div>

      <div className="space-y-6">
        
        {/* 1. Appearance Section (Light / Dark / System) */}
        <div className="bg-card border border-subtle rounded-2xl p-6 sm:p-7 shadow-card space-y-5">
          <div className="space-y-1">
            <h2 className="text-sm font-medium text-primary-color">Appearance</h2>
            <p className="text-xs text-secondary-color">
              Customize how ScamCheck looks on your device.
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <label className="text-xs font-medium text-secondary-color block">
              Theme
            </label>
            <ThemeSelector />
            <p className="text-[11px] text-tertiary-color pt-1">
              Your selection is saved automatically.
            </p>
          </div>
        </div>

        {/* 2. Profile Card */}
        <div className="bg-card border border-subtle rounded-2xl p-6 sm:p-7 shadow-card space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-primary-color">Personal profile</h2>
            <button className="text-xs text-secondary-color hover:text-primary-color flex items-center gap-1 cursor-pointer">
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent-light text-accent-primary font-medium text-base flex items-center justify-center shrink-0">
              {getInitials(displayName)}
            </div>
            <div className="space-y-0.5">
              <div className="text-sm font-medium text-primary-color">
                {displayName}
              </div>
              <div className="text-xs text-secondary-color">
                {displayEmail}
              </div>
              <div className="text-xs text-tertiary-color">
                Verified student account
              </div>
            </div>
          </div>
        </div>

        {/* 3. Notifications */}
        <div className="bg-card border border-subtle rounded-2xl p-6 sm:p-7 shadow-card space-y-4">
          <h2 className="text-sm font-medium text-primary-color">
            Notifications
          </h2>

          <div className="divide-y divide-subtle space-y-1">
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="text-xs sm:text-sm font-medium text-primary-color">
                  Email alerts
                </div>
                <div className="text-xs text-secondary-color">
                  Receive notification when high-risk warning signs are flagged
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailAlerts}
                onChange={(e) =>
                  setNotifications({ ...notifications, emailAlerts: e.target.checked })
                }
                className="w-4 h-4 accent-accent-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <div className="text-xs sm:text-sm font-medium text-primary-color">
                  Weekly safety summary
                </div>
                <div className="text-xs text-secondary-color">
                  A quiet digest of new scam tactics reported by students
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifications.weeklyDigest}
                onChange={(e) =>
                  setNotifications({ ...notifications, weeklyDigest: e.target.checked })
                }
                className="w-4 h-4 accent-accent-primary cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 4. Security & Sessions */}
        <div className="bg-card border border-subtle rounded-2xl p-6 sm:p-7 shadow-card space-y-4">
          <h2 className="text-sm font-medium text-primary-color">
            Security
          </h2>

          <div className="space-y-3 divide-y divide-subtle">
            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="text-xs sm:text-sm font-medium text-primary-color">Password</div>
                <div className="text-xs text-tertiary-color">Managed via Supabase secure authentication</div>
              </div>
              <button className="border border-subtle hover:bg-muted-custom text-primary-color px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer">
                Update
              </button>
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <div className="text-xs sm:text-sm font-medium text-primary-color">Two-factor authentication</div>
                <div className="text-xs text-warning-color">Recommended for career portals</div>
              </div>
              <button className="bg-accent-primary bg-accent-hover text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-soft btn-interaction">
                Enable
              </button>
            </div>
          </div>
        </div>

        {/* 5. Data & Privacy */}
        <div className="bg-card border border-subtle rounded-2xl p-6 sm:p-7 shadow-card space-y-4">
          <h2 className="text-sm font-medium text-primary-color">
            Data & privacy
          </h2>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs sm:text-sm font-medium text-primary-color">
                Export verification history
              </div>
              <div className="text-xs text-secondary-color">
                Download a private archive of your scanned opportunity reports
              </div>
            </div>
            <button className="border border-subtle hover:bg-muted-custom text-primary-color px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer">
              <Download className="w-3.5 h-3.5" strokeWidth={1.8} />
              <span>Export</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
