import { Cpu, ShieldCheck, GraduationCap, ArrowUpRight } from "lucide-react";

export default function TrustStats() {
  const items = [
    {
      icon: Cpu,
      title: "AI-Powered Analysis",
      description: "Analyze suspicious opportunities using multiple deep signals, NLP, domain age, and scam intelligence.",
      tag: "Multi-Vector Scanning",
    },
    {
      icon: ShieldCheck,
      title: "Explainable Risk Score",
      description: "Understand exactly why something may be dangerous with plain-English breakdown of all red flags.",
      tag: "0-100 Gauge",
    },
    {
      icon: GraduationCap,
      title: "Student-Focused Protection",
      description: "Designed specifically for internship applicants, new grads, and remote job seekers facing predatory scams.",
      tag: "Tailored Defenses",
    },
  ];

  return (
    <section className="relative py-12 border-y border-slate-800/80 bg-[#080c14]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative p-6 rounded-2xl bg-gradient-to-b from-slate-900/60 to-slate-950/80 border border-slate-800/80 hover:border-cyan-500/40 transition-all duration-300 shadow-sm hover:shadow-cyan-500/5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-800/60 border border-slate-700/50 px-2.5 py-0.5 rounded-full">
                    {item.tag}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
