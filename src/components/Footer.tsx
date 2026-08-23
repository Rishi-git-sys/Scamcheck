import Link from "next/link";
import { ShieldCheck, Lock, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-[#04060a] border-t border-slate-800/80 pt-16 pb-12 overflow-hidden text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-12 border-b border-slate-800/80">
          {/* Logo & Tagline */}
          <div className="space-y-3 max-w-sm">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold tracking-wider text-white font-mono">
                SCAM<span className="text-cyan-400">CHECK</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400">
              Verify opportunities. Avoid scams.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-sm font-medium text-slate-300">
            <Link href="/" className="hover:text-cyan-400 transition-colors">
              Home
            </Link>
            <Link href="#how-it-works" className="hover:text-cyan-400 transition-colors">
              How It Works
            </Link>
            <Link href="#features" className="hover:text-cyan-400 transition-colors">
              Features
            </Link>
            <Link href="#privacy" className="hover:text-cyan-400 transition-colors">
              Privacy
            </Link>
            <Link href="#terms" className="hover:text-cyan-400 transition-colors">
              Terms
            </Link>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div>
            © 2026 ScamCheck. Built for safer opportunities.
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>All verification systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
