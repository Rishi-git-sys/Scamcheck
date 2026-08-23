import {
  Building2,
  UserCheck,
  ShieldAlert,
  BrainCircuit,
  FileSearch,
  History,
  Check,
} from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: Building2,
      title: "Company Verification",
      description:
        "Check whether a company appears legitimate and whether its digital presence matches the opportunity.",
      badge: "Entity Auth",
    },
    {
      icon: UserCheck,
      title: "Recruiter Analysis",
      description:
        "Identify suspicious recruiter information, email mismatches, and unusual contact patterns.",
      badge: "Identity Defense",
    },
    {
      icon: ShieldAlert,
      title: "Scam Pattern Detection",
      description:
        "Detect common signals associated with fake jobs, internship scams, payment scams, and impersonation.",
      badge: "Threat Intelligence",
    },
    {
      icon: BrainCircuit,
      title: "AI Risk Analysis",
      description:
        "Generate an understandable risk assessment instead of just returning raw AI output.",
      badge: "Contextual Scoring",
    },
    {
      icon: FileSearch,
      title: "Explainable Results",
      description:
        "Show exactly which signals contributed to the risk score with breakdown alerts.",
      badge: "Zero Blackbox",
    },
    {
      icon: History,
      title: "Verification History",
      description:
        "Allow users to revisit previously analyzed opportunities and track recurring threat patterns.",
      badge: "Audit Log",
    },
  ];

  return (
    <section id="features" className="relative py-24 sm:py-32 bg-[#060911] border-t border-slate-800/80">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 cyber-dots opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-cyan-400 text-xs font-mono mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>SECURITY CAPABILITIES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Engineered for Job & Internship Safety
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400">
            Comprehensive fraud detection modules designed to protect your career decisions from Day 1.
          </p>
        </div>

        {/* Features 2x3 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="group relative p-7 rounded-2xl bg-[#0b0f1a]/80 border border-slate-800/90 hover:border-cyan-500/40 hover:bg-[#0e1424] transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-cyan-500/5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/15 to-blue-600/20 border border-cyan-500/25 flex items-center justify-center text-cyan-400 group-hover:scale-105 group-hover:text-cyan-300 transition-all">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400/80 bg-cyan-950/40 border border-cyan-900/50 px-2.5 py-1 rounded-md">
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2.5 group-hover:text-cyan-300 transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-sm text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center gap-1.5 text-xs font-mono text-slate-400 group-hover:text-slate-300 transition-colors">
                  <Check className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Continuous protection active</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
