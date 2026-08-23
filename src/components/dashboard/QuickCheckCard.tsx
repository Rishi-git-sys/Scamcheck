import Link from "next/link";
import { Link2, FileText, Building2, UserCheck, ArrowRight } from "lucide-react";

export default function QuickCheckCard() {
  const methods = [
    {
      id: "url",
      title: "Job / Internship URL",
      description: "Analyze an opportunity link",
      icon: Link2,
      href: "/dashboard/check?tab=url",
    },
    {
      id: "offer",
      title: "Offer Letter",
      description: "Check an offer document",
      icon: FileText,
      href: "/dashboard/check?tab=offer",
    },
    {
      id: "company",
      title: "Company",
      description: "Verify a company",
      icon: Building2,
      href: "/dashboard/companies",
    },
    {
      id: "recruiter",
      title: "Recruiter",
      description: "Analyze recruiter information",
      icon: UserCheck,
      href: "/dashboard/check?tab=recruiter",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
        Quick Verification Methods
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {methods.map((method) => {
          const Icon = method.icon;
          return (
            <Link
              key={method.id}
              href={method.href}
              className="group p-4 rounded-xl bg-[#0a0e17] border border-slate-800/80 hover:border-cyan-500/40 hover:bg-[#0e1424] transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-cyan-500/5 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 group-hover:bg-cyan-500/20 transition-all">
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {method.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {method.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
