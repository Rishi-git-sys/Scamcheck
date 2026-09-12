"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Globe2,
  LockKeyhole,
  Search,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const checks = ["URL intelligence", "Evidence & OCR", "Company signals", "Recruiter verification", "Threat intelligence"];

export default function LandingPage() {
  const { user } = useAuth();
  const ctaHref = user ? "/dashboard/check" : "/login";

  return (
    <div className="min-h-screen bg-app text-primary-color overflow-hidden">
      <header className="sticky top-0 z-50 border-b border-subtle/80 bg-app/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto h-18 px-5 sm:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="h-9 w-9 rounded-xl bg-accent-primary text-white dark:text-[#07100c] flex items-center justify-center shadow-soft group-hover:rotate-3 transition-transform">
              <ShieldCheck className="w-5 h-5" strokeWidth={2.2} />
            </span>
            <span className="font-semibold tracking-[-.03em] text-lg">ScamCheck</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm text-secondary-color">
            <a href="#how-it-works" className="hover:text-primary-color transition-colors">How it works</a>
            <a href="#signals" className="hover:text-primary-color transition-colors">What we check</a>
            <a href="#safety" className="hover:text-primary-color transition-colors">Safety</a>
          </nav>

          <div className="flex items-center gap-2">
            {!user && <Link href="/login" className="hidden sm:inline-flex px-4 py-2 text-sm font-medium hover:text-accent-primary transition-colors">Sign in</Link>}
            <Link href={ctaHref} className="inline-flex items-center gap-2 rounded-xl bg-primary-color text-[var(--bg-primary)] px-4 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity">
              {user ? "Open scanner" : "Check an opportunity"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative surface-grid border-b border-subtle">
          <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full bg-accent-primary/10 blur-3xl pointer-events-none" />
          <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-20 sm:pt-28 pb-20 relative">
            <div className="max-w-4xl">
              <div className="animate-hero-eyebrow inline-flex items-center gap-2 rounded-full border border-accent-light-border bg-accent-light px-3 py-1.5 text-xs font-semibold text-accent-primary mb-7">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-primary animate-pulse" />
                AI-assisted opportunity verification
              </div>
              <h1 className="animate-hero-heading text-[clamp(3rem,8vw,6.8rem)] leading-[.9] tracking-[-.065em] font-semibold max-w-4xl">
                Don&apos;t trust the offer.<br />
                <span className="text-accent-primary">Check it first.</span>
              </h1>
              <p className="animate-hero-sub mt-8 text-lg sm:text-xl text-secondary-color max-w-2xl leading-relaxed">
                ScamCheck helps students investigate job and internship opportunities using security signals, evidence, company checks, and AI-assisted explanations — before money or personal data is on the line.
              </p>
              <div className="animate-hero-cta mt-9 flex flex-col sm:flex-row items-start gap-3">
                <Link href={ctaHref} className="btn-interaction inline-flex items-center justify-center gap-2 rounded-2xl bg-accent-primary text-white dark:text-[#07100c] px-6 py-3.5 text-sm font-semibold shadow-soft">
                  Scan an opportunity <ArrowRight className="w-4 h-4" />
                </Link>
                <a href="#how-it-works" className="inline-flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium text-secondary-color hover:text-primary-color transition-colors">
                  See how it works <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="animate-hero-visual mt-16 max-w-5xl">
              <div className="rounded-3xl border border-subtle bg-card/95 shadow-card overflow-hidden glow-accent">
                <div className="flex items-center justify-between border-b border-subtle px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5"><span className="w-2 h-2 rounded-full bg-danger-color/70"/><span className="w-2 h-2 rounded-full bg-warning-color/70"/><span className="w-2 h-2 rounded-full bg-accent-primary/70"/></div>
                    <span className="text-xs text-tertiary-color font-mono">scamcheck / opportunity scan</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-[.16em] text-accent-primary font-semibold">Live analysis</span>
                </div>
                <div className="grid md:grid-cols-[1.3fr_.7fr] divide-y md:divide-y-0 md:divide-x divide-subtle">
                  <div className="p-6 sm:p-9">
                    <div className="text-[11px] uppercase tracking-[.16em] text-tertiary-color mb-3">Opportunity</div>
                    <div className="flex items-center gap-3 rounded-xl border border-subtle bg-muted-custom px-4 py-3">
                      <Globe2 className="w-4 h-4 text-tertiary-color" />
                      <span className="font-mono text-sm truncate">careers-example.internships/apply</span>
                    </div>
                    <div className="mt-7 grid sm:grid-cols-3 gap-3">
                      {["Domain age", "SSL", "Redirects"].map((label, i) => <div key={label} className="rounded-xl border border-subtle p-4"><div className="text-[11px] text-tertiary-color">{label}</div><div className="mt-1 font-semibold">{["18 days", "Valid", "2 hops"][i]}</div></div>)}
                    </div>
                  </div>
                  <div className="p-6 sm:p-9 flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] uppercase tracking-[.16em] text-tertiary-color">Risk assessment</div>
                      <div className="mt-5 flex items-end gap-3"><span className="text-6xl font-semibold tracking-[-.06em]">65</span><span className="mb-2 rounded-full bg-danger-light px-2.5 py-1 text-xs font-semibold text-danger-color">High risk</span></div>
                      <div className="mt-5 h-2 rounded-full bg-muted-custom overflow-hidden"><div className="h-full w-[65%] rounded-full bg-danger-color" /></div>
                    </div>
                    <div className="mt-8 space-y-2.5 text-xs text-secondary-color">
                      <div className="flex gap-2"><TriangleAlert className="w-4 h-4 text-warning-color shrink-0"/> Domain registered recently</div>
                      <div className="flex gap-2"><TriangleAlert className="w-4 h-4 text-warning-color shrink-0"/> Payment request detected</div>
                      <div className="flex gap-2"><TriangleAlert className="w-4 h-4 text-warning-color shrink-0"/> Recruiter needs verification</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="signals" className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
          <div className="grid lg:grid-cols-[.75fr_1.25fr] gap-14 lg:gap-24">
            <div>
              <div className="text-xs uppercase tracking-[.18em] text-accent-primary font-semibold">One investigation</div>
              <h2 className="mt-4 text-3xl sm:text-5xl tracking-[-.045em] font-semibold leading-tight">Five angles.<br />One clearer decision.</h2>
              <p className="mt-5 text-secondary-color leading-relaxed max-w-md">Instead of relying on a single “scam / not scam” prediction, ScamCheck brings several useful signals together so you can see what deserves attention.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-px bg-subtle rounded-2xl overflow-hidden border border-subtle">
              {checks.map((item, index) => (
                <div key={item} className="bg-card p-6 sm:p-7 group hover:bg-muted-custom transition-colors">
                  <div className="flex items-center justify-between"><span className="text-xs font-mono text-tertiary-color">0{index + 1}</span><Check className="w-4 h-4 text-accent-primary opacity-0 group-hover:opacity-100 transition-opacity"/></div>
                  <h3 className="mt-9 font-semibold tracking-tight">{item}</h3>
                  <p className="mt-2 text-sm text-secondary-color leading-relaxed">A dedicated signal that contributes evidence to the overall assessment.</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="border-y border-subtle bg-card">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
            <div className="max-w-2xl"><div className="text-xs uppercase tracking-[.18em] text-accent-primary font-semibold">How it works</div><h2 className="mt-4 text-3xl sm:text-5xl tracking-[-.045em] font-semibold">Slow down the moment<br />a scam asks you to hurry.</h2></div>
            <div className="mt-14 grid md:grid-cols-3 gap-8">
              {[{n:"01",icon:Search,t:"Submit",d:"Paste the opportunity link and add any screenshots or messages you received."},{n:"02",icon:Sparkles,t:"Analyze",d:"ScamCheck evaluates available URL, evidence, company, recruiter, and threat signals."},{n:"03",icon:ShieldCheck,t:"Understand",d:"Review the risk indicators and AI-assisted explanation before deciding what to do next."}].map(({n,icon:Icon,t,d}) => <div key={n} className="border-t-2 border-primary-color pt-5"><div className="flex justify-between text-xs font-mono text-tertiary-color"><span>{n}</span><Icon className="w-5 h-5 text-accent-primary"/></div><h3 className="mt-8 text-xl font-semibold tracking-tight">{t}</h3><p className="mt-2 text-sm text-secondary-color leading-relaxed max-w-sm">{d}</p></div>)}
            </div>
          </div>
        </section>

        <section id="safety" className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
          <div className="rounded-3xl bg-primary-color text-[var(--bg-primary)] p-8 sm:p-12 lg:p-16 overflow-hidden relative">
            <div className="absolute -right-20 -top-24 w-72 h-72 rounded-full border border-accent-primary/30" />
            <div className="absolute -right-8 -top-12 w-40 h-40 rounded-full border border-accent-primary/20" />
            <div className="relative max-w-2xl">
              <LockKeyhole className="w-7 h-7 text-accent-primary" />
              <h2 className="mt-7 text-3xl sm:text-5xl tracking-[-.045em] font-semibold">Evidence first.<br />AI second.</h2>
              <p className="mt-5 text-[var(--text-secondary)] leading-relaxed max-w-xl">The AI layer is designed to explain the signals it receives. Deterministic checks remain the foundation of the risk assessment, so the interface can show you the reasons behind a warning instead of asking you to blindly trust a model.</p>
              <div className="mt-8 flex flex-wrap gap-3 text-xs font-medium"><span className="rounded-full border border-[var(--border-color)] px-3 py-1.5">Explainable signals</span><span className="rounded-full border border-[var(--border-color)] px-3 py-1.5">Risk-focused</span><span className="rounded-full border border-[var(--border-color)] px-3 py-1.5">Human judgment stays central</span></div>
            </div>
          </div>
        </section>

        <section className="border-t border-subtle">
          <div className="max-w-4xl mx-auto px-5 sm:px-8 py-20 sm:py-28 text-center">
            <ShieldCheck className="w-9 h-9 text-accent-primary mx-auto" />
            <h2 className="mt-6 text-3xl sm:text-5xl tracking-[-.05em] font-semibold">Before you send money.<br />Before you send data.</h2>
            <p className="mt-5 text-secondary-color">Give the opportunity one more look.</p>
            <Link href={ctaHref} className="btn-interaction mt-8 inline-flex items-center gap-2 rounded-2xl bg-accent-primary text-white dark:text-[#07100c] px-6 py-3.5 text-sm font-semibold">Start a check <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-subtle">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between text-xs text-tertiary-color">
          <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-accent-primary"/> ScamCheck · Verify before you trust.</div>
          <div className="flex gap-5"><Link href="/login" className="hover:text-primary-color">Sign in</Link><Link href="/signup" className="hover:text-primary-color">Create account</Link></div>
        </div>
      </footer>
    </div>
  );
}
