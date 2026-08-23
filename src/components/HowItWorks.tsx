import { ClipboardCheck, Cpu, CheckCircle2, ArrowRight } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      badge: "Step 01",
      title: "Submit",
      description:
        "Paste a job URL, company website, recruiter information, message, or offer details.",
      icon: ClipboardCheck,
      details: ["Job & Internship Links", "Recruiter Emails", "Interview Messages"],
    },
    {
      step: "02",
      badge: "Step 02",
      title: "Analyze",
      description:
        "ScamCheck evaluates domains, company information, suspicious patterns, recruiter signals, and scam indicators.",
      icon: Cpu,
      details: ["Domain Age & WHOIS", "Impersonation Flags", "Payment Request Scanning"],
    },
    {
      step: "03",
      badge: "Step 03",
      title: "Decide",
      description:
        "Receive a clear risk score with an explanation of the detected warning signs.",
      icon: CheckCircle2,
      details: ["Transparent 0-100 Score", "Actionable Guidance", "Audit History Log"],
    },
  ];

  return (
    <section id="how-it-works" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-cyan-900/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-4">
            <span>3-STEP VERIFICATION PIPELINE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Verify Before You Trust
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400">
            A fast, seamless workflow designed to stop employment fraud before you share sensitive data or money.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative rounded-2xl bg-gradient-to-b from-[#0e1320] to-[#090c15] border border-slate-800 p-8 hover:border-cyan-500/40 transition-all duration-300 group flex flex-col justify-between"
              >
                {/* Step header */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl sm:text-4xl font-extrabold font-mono text-cyan-400/30 group-hover:text-cyan-400/80 transition-colors">
                      {step.step}
                    </span>
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 group-hover:bg-cyan-500/20 transition-all">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                    <span>{step.step} — {step.title}</span>
                  </h3>

                  <p className="text-slate-300 text-sm leading-relaxed mb-6">
                    {step.description}
                  </p>
                </div>

                {/* Sub details */}
                <div className="pt-4 border-t border-slate-800/80 space-y-2">
                  {step.details.map((detail, dIdx) => (
                    <div
                      key={dIdx}
                      className="flex items-center gap-2 text-xs font-mono text-slate-400"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/70" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
