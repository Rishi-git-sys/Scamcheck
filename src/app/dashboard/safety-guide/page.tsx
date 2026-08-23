"use client";

import Link from "next/link";
import {
  ShieldCheck,
  CreditCard,
  UserCheck,
  Globe,
  AlertTriangle,
  Lock,
  ExternalLink,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Search,
} from "lucide-react";

export default function SafetyGuidePage() {
  const safetyRules = [
    {
      step: "01",
      icon: CreditCard,
      title: "Never pay to get a job",
      subtitle: "Legitimate hiring processes never require candidate fees",
      description:
        "Legitimate employers generally do not require job or internship applicants to pay registration fees, document processing charges, training fees, or security deposits to secure a position.",
      actionableTip:
        "If you are asked to transfer money via UPI, gift cards, crypto, or direct payment before receiving a paycheck, treat this as a high-risk warning sign.",
    },
    {
      step: "02",
      icon: UserCheck,
      title: "Verify the recruiter",
      subtitle: "Check email domains and recruiter identity",
      description:
        "Corporate recruiters typically communicate using corporate email domains that match the official company website (e.g., recruiter@microsoft.com, not recruiter@gmail.com).",
      actionableTip:
        "Be cautious when recruiters reach out exclusively through informal chat applications like Telegram or WhatsApp without any verifiable corporate email address.",
    },
    {
      step: "03",
      icon: Globe,
      title: "Check the company domain",
      subtitle: "Look out for lookalike or misspelled websites",
      description:
        "Scammers often create lookalike domains that mimic legitimate brands by adding words like '-careers', '-jobs', or using unusual domain extensions (like .top, .xyz, or .work).",
      actionableTip:
        "Always cross-reference the website URL with the company's verified primary domain found on public search engines or official social media channels.",
    },
    {
      step: "04",
      icon: AlertTriangle,
      title: "Be careful with urgent offers",
      subtitle: "High-pressure tactics are designed to prevent due diligence",
      description:
        "Job scams often promise instant hiring without interviews, unrealistic salaries for simple tasks, and artificial urgency such as 'reply within 2 hours or forfeit your seat'.",
      actionableTip:
        "Take your time to research the opportunity. Legitimate organizations understand that candidates need time to evaluate offers and complete formal review processes.",
    },
    {
      step: "05",
      icon: Lock,
      title: "Protect personal information",
      subtitle: "Guard sensitive IDs, OTPs, and financial data",
      description:
        "You should never share sensitive identity documents (like Aadhaar numbers, PAN cards, or passport copies) or bank OTPs during initial screening or application steps.",
      actionableTip:
        "Official background checks and payroll setup occur only after you have signed an official contract and verified the organization through trusted channels.",
    },
    {
      step: "06",
      icon: ExternalLink,
      title: "Use official application channels",
      subtitle: "Confirm the opening on primary career portals",
      description:
        "Whenever you receive an unexpected job inquiry, check whether the identical opening is listed on the organization's official careers portal or verified job platform pages.",
      actionableTip:
        "If a job offer cannot be found on the company's official careers site, contact the organization's verified HR department to confirm authenticity.",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 page-enter-animation">
      {/* Top Hero Section */}
      <div className="bg-card border border-subtle rounded-2xl p-6 sm:p-8 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent-light border border-accent-light text-[11px] font-semibold text-accent-primary">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Student & Job Seeker Safety</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary-color">
              Safety guide
            </h1>
            <p className="text-xs sm:text-sm text-secondary-color leading-relaxed">
              Simple checks and best practices that can help you avoid suspicious jobs and internships.
            </p>
          </div>

          <Link
            href="/dashboard/check"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-primary hover:bg-accent-hover text-background text-xs font-bold transition-all duration-150 interactive-btn shadow-sm self-start sm:self-auto shrink-0"
          >
            <Search className="w-3.5 h-3.5" strokeWidth={2.2} />
            <span>Check an opportunity</span>
          </Link>
        </div>
      </div>

      {/* Safety Rules Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold uppercase tracking-wider text-tertiary-color">
            How to spot a suspicious opportunity
          </h2>
          <span className="text-xs text-tertiary-color">6 essential checks</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {safetyRules.map((rule) => {
            const Icon = rule.icon;
            return (
              <div
                key={rule.step}
                className="bg-card border border-subtle hover:border-subtle/90 rounded-2xl p-5 sm:p-6 shadow-soft interactive-card flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Card Header with Step and Icon */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-muted-custom border border-subtle text-tertiary-color">
                      {rule.step}
                    </span>
                    <div className="p-2 rounded-xl bg-accent-light text-accent-primary group-hover:scale-105 transition-transform duration-150">
                      <Icon className="w-4 h-4" strokeWidth={2} />
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-primary-color group-hover:text-accent-primary transition-colors">
                      {rule.title}
                    </h3>
                    <p className="text-[11px] font-medium text-tertiary-color">
                      {rule.subtitle}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-secondary-color leading-relaxed">
                    {rule.description}
                  </p>
                </div>

                {/* Actionable Tip Box */}
                <div className="p-3 rounded-xl bg-muted-custom border border-subtle/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-primary-color">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent-primary shrink-0" />
                    <span>What to look for:</span>
                  </div>
                  <p className="text-[11px] text-secondary-color leading-relaxed pl-5">
                    {rule.actionableTip}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA Card */}
      <div className="bg-card border border-subtle rounded-2xl p-6 sm:p-7 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-primary-color">
            Unsure about a specific message or job post?
          </h3>
          <p className="text-xs text-secondary-color">
            Paste the offer text, enter the URL, or upload a screenshot to run an automated verification check.
          </p>
        </div>

        <Link
          href="/dashboard/check"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-primary hover:bg-accent-hover text-background text-xs font-bold transition-all duration-150 interactive-btn shrink-0"
        >
          <span>Verify opportunity</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
