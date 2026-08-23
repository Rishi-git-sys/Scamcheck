"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  UserCheck,
  Briefcase,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";

export default function HeroVerificationCard() {
  const [url, setUrl] = useState("https://careers.example.com/software-intern");
  const [stage, setStage] = useState<"idle" | "reviewing" | "result">("idle");
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    "Reviewing opportunity",
    "Checking company details",
    "Looking for warning signs",
    "Preparing your result",
  ];

  const handleStartReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setStage("reviewing");
    setStepIndex(0);
  };

  useEffect(() => {
    if (stage !== "reviewing") return;

    const interval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          setTimeout(() => setStage("result"), 400);
          return prev;
        }
        return prev + 1;
      });
    }, 450);

    return () => clearInterval(interval);
  }, [stage]);

  return (
    <div className="w-full max-w-2xl mx-auto bg-white border border-[#E5E8E5] rounded-2xl p-6 sm:p-8 shadow-card text-left transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E5E8E5]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#171918]">
            Opportunity check
          </span>
        </div>
        <span className="text-xs text-[#646966] bg-[#F8F9F7] border border-[#E5E8E5] rounded-full px-3 py-0.5">
          {stage === "result" ? "Assessment ready" : "Ready to verify"}
        </span>
      </div>

      {/* Body */}
      <div className="pt-6">
        {stage === "idle" && (
          <form onSubmit={handleStartReview} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs text-[#646966] font-medium block">
                Paste a job or internship link
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://careers.example.com/software-intern"
                  className="flex-1 bg-[#F8F9F7] border border-[#E5E8E5] focus:border-[#1F7A5A] rounded-xl px-4 py-3 text-sm text-[#171918] placeholder:text-[#929895] focus:outline-none focus:ring-2 focus:ring-[#1F7A5A]/10 transition-all font-sans"
                />
                <button
                  type="submit"
                  className="bg-[#1F7A5A] hover:bg-[#18644a] text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors shadow-soft cursor-pointer shrink-0"
                >
                  Check opportunity
                </button>
              </div>
            </div>

            {/* Three Small Trust Indicators */}
            <div className="pt-2 flex items-center gap-6 text-xs text-[#646966]">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#929895]" strokeWidth={1.8} />
                <span>Company</span>
              </div>
              <div className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#929895]" strokeWidth={1.8} />
                <span>Recruiter</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#929895]" strokeWidth={1.8} />
                <span>Opportunity</span>
              </div>
            </div>
          </form>
        )}

        {stage === "reviewing" && (
          <div className="py-8 text-center space-y-4 animate-in fade-in duration-200">
            <div className="w-8 h-8 mx-auto rounded-full border-2 border-[#1F7A5A] border-t-transparent animate-spin" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-[#171918]">
                {steps[stepIndex]}...
              </p>
              <p className="text-xs text-[#929895]">
                Reviewing signals to ensure a safe assessment
              </p>
            </div>
          </div>
        )}

        {stage === "result" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top Score Box */}
            <div className="flex items-start justify-between bg-[#F8F9F7] border border-[#E5E8E5] rounded-xl p-5">
              <div>
                <span className="text-xs text-[#646966] block font-medium">
                  Review complete
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-3xl font-medium text-[#C94A4A] tabular-nums">
                    82
                  </span>
                  <span className="text-xs text-[#929895] font-normal">
                    / 100
                  </span>
                </div>
                <p className="text-xs text-[#646966] mt-1">
                  Several warning signs were found in this opportunity.
                </p>
              </div>

              <span className="bg-[#FCECEC] text-[#C94A4A] text-xs font-medium px-2.5 py-1 rounded-md">
                High risk
              </span>
            </div>

            {/* Signals Stack */}
            <div className="space-y-2.5">
              {/* Signal 1 */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-[#E5E8E5] bg-white">
                <span className="text-xs text-[#171918] font-medium">
                  Payment request
                </span>
                <span className="text-xs font-medium text-[#C94A4A] bg-[#FCECEC] px-2 py-0.5 rounded">
                  High risk
                </span>
              </div>

              {/* Signal 2 */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-[#E5E8E5] bg-white">
                <span className="text-xs text-[#171918] font-medium">
                  Recruiter identity
                </span>
                <span className="text-xs font-medium text-[#C88719] bg-[#FFF5DD] px-2 py-0.5 rounded">
                  Needs verification
                </span>
              </div>

              {/* Signal 3 */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-[#E5E8E5] bg-white">
                <span className="text-xs text-[#171918] font-medium">
                  Company information
                </span>
                <span className="text-xs font-medium text-[#646966] bg-[#F8F9F7] px-2 py-0.5 rounded">
                  Limited
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStage("idle")}
                className="text-xs text-[#646966] hover:text-[#171918] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.8} />
                <span>Check another</span>
              </button>

              <Link
                href="/dashboard/result/sample-1"
                className="text-xs font-medium text-[#1F7A5A] hover:text-[#18644a] flex items-center gap-1 transition-colors"
              >
                <span>See full assessment</span>
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.8} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
