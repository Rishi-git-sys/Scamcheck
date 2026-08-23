"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function LandingNav() {
  return (
    <header className="sticky top-0 z-40 bg-[#0b0c0e]/90 backdrop-blur-md border-b border-subtle">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Brand */}
        <Link href="/" className="flex items-center gap-2 text-primary group">
          <ShieldCheck className="w-5 h-5 text-primary" strokeWidth={1.8} />
          <span className="text-[17px] font-medium tracking-tight">
            ScamCheck
          </span>
        </Link>

        {/* Center: Nav links */}
        <nav className="hidden md:flex items-center gap-6">
          <a
            href="#how-it-works"
            className="text-sm text-secondary hover:text-primary transition-colors"
          >
            How it works
          </a>
          <a
            href="#features"
            className="text-sm text-secondary hover:text-primary transition-colors"
          >
            Features
          </a>
          <a
            href="#about"
            className="text-sm text-secondary hover:text-primary transition-colors"
          >
            About
          </a>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-primary hover:text-secondary transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="bg-white hover:bg-neutral-200 text-[#09090b] px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
