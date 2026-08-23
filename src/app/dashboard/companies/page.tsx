"use client";

import { useState } from "react";
import { Building2, Search, CheckCircle2, ShieldAlert, AlertTriangle } from "lucide-react";

export default function CompaniesPage() {
  const [search, setSearch] = useState("");

  const companies = [
    {
      name: "TechNova Solutions",
      domain: "technova.io",
      category: "Software & Cloud",
      status: "Verified",
      severity: "low",
      trustScore: 94,
      description: "Established technology company with authenticated hiring domains and university recruiter verification.",
    },
    {
      name: "Global Career Hub",
      domain: "careerhub-telegram.xyz",
      category: "Staffing / Remote",
      status: "High risk",
      severity: "high",
      trustScore: 14,
      description: "Known advance-fee recruitment scam impersonating legitimate job portals. Requests equipment wire transfers.",
    },
    {
      name: "NextGen Labs",
      domain: "nextgenlabs.co",
      category: "AI Research",
      status: "Needs review",
      severity: "review",
      trustScore: 62,
      description: "Recent domain registration. Recruiter identity unconfirmed across official corporate registry channels.",
    },
    {
      name: "Datadog",
      domain: "datadoghq.com",
      category: "Cloud Observability",
      status: "Verified",
      severity: "low",
      trustScore: 99,
      description: "Public enterprise technology company with authenticated email protocols and standard recruiting channels.",
    },
  ];

  const filtered = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.domain.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <span className="text-xs text-tertiary-color font-medium block">
          Explore / Companies
        </span>
        <h1 className="text-2xl font-medium tracking-tight text-primary-color">
          Company directory
        </h1>
        <p className="text-sm text-secondary-color">
          Verified employer profiles, known impersonators, and recruiter trust ratings.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by company name or domain..."
          className="w-full bg-card border border-subtle focus:border-accent-primary rounded-xl px-4 py-2.5 text-sm text-primary-color placeholder:text-tertiary-color focus:outline-none focus:ring-2 focus:ring-accent-primary/10 transition-all shadow-soft"
        />
      </div>

      {/* Company Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((comp, idx) => (
          <div
            key={idx}
            className="bg-card border border-subtle rounded-2xl p-6 shadow-soft space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center text-accent-primary shrink-0">
                  <Building2 className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-primary-color">
                    {comp.name}
                  </h3>
                  <div className="text-xs font-mono text-tertiary-color">
                    {comp.domain}
                  </div>
                </div>
              </div>

              <span
                className={`text-xs font-medium px-2.5 py-0.5 rounded-md ${
                  comp.severity === "high"
                    ? "bg-danger-light text-danger-color"
                    : comp.severity === "review"
                    ? "bg-warning-light text-warning-color"
                    : "bg-accent-light text-accent-primary"
                }`}
              >
                {comp.status}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-secondary-color leading-relaxed">
              {comp.description}
            </p>

            <div className="pt-2 border-t border-subtle flex items-center justify-between text-xs text-tertiary-color">
              <span>{comp.category}</span>
              <span className="text-primary-color font-medium tabular-nums">
                Trust rating: {comp.trustScore}/100
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
