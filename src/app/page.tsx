"use client";

import Link from "next/link";
import { ShieldCheck, ArrowRight, Check } from "lucide-react";
import LandingNavbar from "@/components/landing/LandingNavbar";
import HeroTrustVisual from "@/components/landing/HeroTrustVisual";
import OpportunityNetworkVisual from "@/components/landing/OpportunityNetworkVisual";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useAuth } from "@/context/AuthContext";

export default function LandingPage() {
  const { user } = useAuth();
  const ctaHref = user ? "/dashboard/check" : "/login";

  return (
    <div className="min-h-screen bg-app text-primary-color flex flex-col selection:bg-accent-light selection:text-accent-primary">
      {/* 1. Navigation */}
      <LandingNavbar />

      <main className="flex-1">
        {/* 2. Hero Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-14 text-center">
          
          {/* Eyebrow */}
          <div className="animate-hero-eyebrow inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent-light border border-accent-light text-xs font-medium text-accent-primary mb-6">
            <span>For safer job and internship decisions</span>
          </div>

          {/* Heading */}
          <h1 className="animate-hero-heading text-3xl sm:text-5xl lg:text-[54px] font-medium tracking-tight text-primary-color leading-[1.12] mb-3">
            Before you apply, make sure it&apos;s real.
          </h1>
          <div className="animate-hero-sub text-2xl sm:text-4xl lg:text-[44px] font-medium tracking-tight text-secondary-color leading-[1.15] mb-6">
            Verify before you trust.
          </div>

          {/* Supporting Paragraph */}
          <p className="animate-hero-sub text-base sm:text-lg text-secondary-color max-w-2xl mx-auto leading-relaxed mb-8">
            ScamCheck helps you identify suspicious job offers, internships, recruiters, and companies before you share your information or send money.
          </p>

          {/* CTAs */}
          <div className="animate-hero-cta flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link
              href={ctaHref}
              className="w-full sm:w-auto bg-accent-primary bg-accent-hover text-white px-7 py-3.5 rounded-xl text-sm font-medium transition-all shadow-soft btn-interaction inline-flex items-center justify-center gap-2"
            >
              <span>Check an opportunity</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.8} />
            </Link>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-primary-color hover:text-secondary-color transition-colors flex items-center gap-1.5 py-2 px-3 group"
            >
              <span>See how it works</span>
              <span aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform">→</span>
            </a>
          </div>

          {/* Hero Editorial Visual Element */}
          <div className="animate-hero-visual">
            <HeroTrustVisual />
          </div>

        </section>

        {/* 3. Trust / Value Section (Trust Strip) */}
        <section className="border-y border-subtle bg-surface py-14">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <ScrollReveal>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-primary-color">
                    Explainable
                  </h3>
                  <p className="text-xs sm:text-sm text-secondary-color leading-relaxed">
                    Understand why an opportunity may be risky with plain-language signals.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-primary-color">
                    Fast
                  </h3>
                  <p className="text-xs sm:text-sm text-secondary-color leading-relaxed">
                    Get an initial assessment in seconds before submitting personal data.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-primary-color">
                    Built for job seekers
                  </h3>
                  <p className="text-xs sm:text-sm text-secondary-color leading-relaxed">
                    Designed around real internship and remote job-search risks.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* 4. Visual Product Section: "Know what you're getting into" */}
        <section className="py-20 sm:py-24 border-b border-subtle">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <ScrollReveal>
              <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
                <span className="text-xs uppercase tracking-wider text-tertiary-color font-medium block">
                  Intelligent inspection
                </span>
                <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-primary-color">
                  Know what you&apos;re getting into.
                </h2>
                <p className="text-sm text-secondary-color leading-relaxed">
                  ScamCheck looks at the details that matter before you take the next step.
                </p>
              </div>

              <OpportunityNetworkVisual />
            </ScrollReveal>
          </div>
        </section>

        {/* 5. How It Works */}
        <section id="how-it-works" className="py-20 sm:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <ScrollReveal>
              <div className="mb-14 text-center sm:text-left">
                <span className="text-xs uppercase tracking-wider text-tertiary-color font-medium block mb-2">
                  Process
                </span>
                <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-primary-color">
                  A second opinion before you apply.
                </h2>
              </div>

              {/* 3 Horizontal Steps with connecting line */}
              <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
                
                {/* Connecting line on desktop */}
                <div className="hidden md:block absolute top-7 left-12 right-12 h-[1px] bg-subtle -z-0" />

                {/* Step 1 */}
                <div className="bg-card border border-subtle rounded-2xl p-6 sm:p-7 relative z-10 shadow-soft space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-muted-custom border border-subtle flex items-center justify-center text-xs font-medium text-primary-color">
                    01
                  </div>
                  <h3 className="text-base font-medium text-primary-color">
                    Submit
                  </h3>
                  <p className="text-xs sm:text-sm text-secondary-color leading-relaxed">
                    Paste a job link or enter opportunity details you received.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="bg-card border border-subtle rounded-2xl p-6 sm:p-7 relative z-10 shadow-soft space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-muted-custom border border-subtle flex items-center justify-center text-xs font-medium text-primary-color">
                    02
                  </div>
                  <h3 className="text-base font-medium text-primary-color">
                    Review
                  </h3>
                  <p className="text-xs sm:text-sm text-secondary-color leading-relaxed">
                    ScamCheck evaluates available risk signals and domain history.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="bg-card border border-subtle rounded-2xl p-6 sm:p-7 relative z-10 shadow-soft space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-muted-custom border border-subtle flex items-center justify-center text-xs font-medium text-primary-color">
                    03
                  </div>
                  <h3 className="text-base font-medium text-primary-color">
                    Decide
                  </h3>
                  <p className="text-xs sm:text-sm text-secondary-color leading-relaxed">
                    Get a clear assessment and practical next steps before moving forward.
                  </p>
                </div>

              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* 6. Why ScamCheck (Split Section) */}
        <section id="why-scamcheck" className="border-t border-subtle py-20 sm:py-24 bg-surface">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <ScrollReveal>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
                
                {/* Left */}
                <div className="lg:col-span-5 space-y-3">
                  <span className="text-xs uppercase tracking-wider text-tertiary-color font-medium block">
                    Philosophy
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-primary-color leading-tight">
                    A warning is useful only when you understand it.
                  </h2>
                </div>

                {/* Right */}
                <div className="lg:col-span-7 space-y-8">
                  <div className="space-y-1.5 pb-6 border-b border-subtle">
                    <h3 className="text-base font-medium text-primary-color">
                      Clear risk signals
                    </h3>
                    <p className="text-sm text-secondary-color leading-relaxed">
                      See exactly what triggered concern, from recent domain registrations to payment requests.
                    </p>
                  </div>

                  <div className="space-y-1.5 pb-6 border-b border-subtle">
                    <h3 className="text-base font-medium text-primary-color">
                      No black-box verdicts
                    </h3>
                    <p className="text-sm text-secondary-color leading-relaxed">
                      Don&apos;t just receive an arbitrary number. Understand the specific reasoning behind every flag.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-base font-medium text-primary-color">
                      Practical next steps
                    </h3>
                    <p className="text-sm text-secondary-color leading-relaxed">
                      Know what to verify and where to check before continuing your application process.
                    </p>
                  </div>
                </div>

              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* 7. Trust Section (Soft Green Tint) */}
        <section id="trust-section" className="border-y border-subtle bg-accent-light py-20 sm:py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-6">
            <ScrollReveal>
              <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-primary-color">
                Your next opportunity deserves a closer look.
              </h2>
              <p className="text-base sm:text-lg text-secondary-color leading-relaxed max-w-xl mx-auto">
                ScamCheck is designed to help you slow down at exactly the moment when a suspicious opportunity asks you to move quickly.
              </p>
              <div className="pt-2">
                <Link
                  href={ctaHref}
                  className="bg-accent-primary bg-accent-hover text-white px-7 py-3.5 rounded-xl text-sm font-medium transition-all shadow-soft btn-interaction inline-block"
                >
                  Check an opportunity
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* 8. Final CTA */}
        <section className="py-20 sm:py-24 text-center">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
            <ScrollReveal>
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-primary-color">
                  Not sure about an opportunity?
                </h2>
                <p className="text-lg sm:text-xl text-secondary-color font-normal">
                  Check it before you trust it.
                </p>
              </div>

              <div className="pt-4">
                <Link
                  href={ctaHref}
                  className="bg-accent-primary bg-accent-hover text-white px-8 py-3.5 rounded-xl text-sm font-medium transition-all shadow-soft btn-interaction inline-block"
                >
                  Start checking
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      {/* 9. Minimal Footer */}
      <footer className="border-t border-subtle bg-surface py-12 text-xs text-secondary-color">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-subtle">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-primary-color">
                <div className="w-5 h-5 rounded bg-accent-light flex items-center justify-center text-accent-primary">
                  <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
                </div>
                <span className="font-medium text-sm">ScamCheck</span>
              </div>
              <p className="text-xs text-tertiary-color">
                Verify before you trust.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-secondary-color">
              <a href="#how-it-works" className="hover:text-primary-color transition-colors">
                How it works
              </a>
              <a href="#why-scamcheck" className="hover:text-primary-color transition-colors">
                Why ScamCheck
              </a>
              <a href="#trust-section" className="hover:text-primary-color transition-colors">
                Safety guide
              </a>
              <Link href="/privacy" className="hover:text-primary-color transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-primary-color transition-colors">
                Terms
              </Link>
            </div>
          </div>

          <div className="pt-6 text-tertiary-color">
            © 2026 ScamCheck
          </div>
        </div>
      </footer>
    </div>
  );
}
