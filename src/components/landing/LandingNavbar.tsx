"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LandingNavbar() {
  const { user } = useAuth();
  const ctaHref = user ? "/dashboard/check" : "/login";

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-40 bg-app/95 backdrop-blur-sm border-b border-subtle transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Brand */}
        <Link href="/" className="flex items-center gap-2 text-primary-color group">
          <div className="w-7 h-7 rounded-md bg-accent-light flex items-center justify-center text-accent-primary">
            <ShieldCheck className="w-4 h-4" strokeWidth={2} />
          </div>
          <span className="text-[17px] font-medium tracking-tight">
            ScamCheck
          </span>
        </Link>

        {/* Center: Nav links */}
        <nav className="hidden md:flex items-center gap-7">
          <button
            onClick={() => scrollTo("how-it-works")}
            className="text-sm text-secondary-color hover:text-primary-color transition-colors cursor-pointer"
          >
            How it works
          </button>
          <button
            onClick={() => scrollTo("why-scamcheck")}
            className="text-sm text-secondary-color hover:text-primary-color transition-colors cursor-pointer"
          >
            Why ScamCheck
          </button>
          <button
            onClick={() => scrollTo("trust-section")}
            className="text-sm text-secondary-color hover:text-primary-color transition-colors cursor-pointer"
          >
            Safety guide
          </button>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <Link
              href="/dashboard"
              className="text-sm text-primary-color hover:text-secondary-color transition-colors font-medium"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-sm text-primary-color hover:text-secondary-color transition-colors font-medium"
            >
              Log in
            </Link>
          )}

          <Link
            href={ctaHref}
            className="bg-accent-primary bg-accent-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-soft btn-interaction"
          >
            Check an opportunity
          </Link>
        </div>
      </div>
    </header>
  );
}
