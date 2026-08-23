"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";

export default function ScannerCard() {
  const [url, setUrl] = useState("https://careers-global-tech.xyz/internships/apply");
  const [scanState, setScanState] = useState<"idle" | "scanning" | "result">("idle");
  const [statusIndex, setStatusIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  const statusMessages = [
    "Resolving domain...",
    "Analyzing DNS records...",
    "Checking domain age...",
    "Scanning for phishing patterns...",
    "Verifying SSL certificate...",
    "Cross-referencing threat database...",
    "Generating risk profile...",
  ];

  const handleStartScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setScanState("scanning");
    setStatusIndex(0);
    setProgress(0);
  };

  useEffect(() => {
    if (scanState !== "scanning") return;

    // Cycle status messages
    const messageInterval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statusMessages.length);
    }, 360);

    // Smooth progress bar over ~2.5s
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          clearInterval(messageInterval);
          setTimeout(() => setScanState("result"), 200);
          return 100;
        }
        return prev + 4;
      });
    }, 100);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, [scanState]);

  const handleCopy = () => {
    navigator.clipboard.writeText(`ScamCheck Report: ${url} - Risk Score: 75/100 (High Risk Detected)`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-surface-raised border border-subtle rounded-xl p-7 flex flex-col justify-between select-none">
      {/* Header Row */}
      <div className="flex items-center justify-between pb-5 border-b border-subtle">
        <span className="text-[15px] font-medium text-primary">
          Live threat inspector
        </span>
        <span className="text-[11px] text-tertiary bg-surface-muted border border-subtle rounded-md px-2.5 py-0.5">
          Engine v2.4
        </span>
      </div>

      {/* Body / States */}
      <div className="py-6 min-h-[300px] flex flex-col justify-center">
        {scanState === "idle" && (
          <form onSubmit={handleStartScan} className="space-y-4 my-auto">
            <div className="space-y-2">
              <label className="text-xs text-secondary block font-normal">
                Target link or opportunity domain
              </label>
              <div className="flex gap-2.5">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste a URL or email to verify..."
                  className="flex-1 bg-surface border border-subtle rounded-lg px-4 py-3 text-sm text-primary placeholder:text-quaternary focus:outline-none focus:border-white transition-colors"
                />
                <button
                  type="submit"
                  className="bg-white hover:bg-neutral-200 text-[#09090b] rounded-lg px-5 py-3 text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer shrink-0"
                >
                  <Search className="w-4 h-4" strokeWidth={1.8} />
                  <span>Analyze</span>
                </button>
              </div>
            </div>
            <p className="text-xs text-quaternary leading-relaxed">
              Supported: job URLs, internship postings, company domains, recruiter emails
            </p>
          </form>
        )}

        {scanState === "scanning" && (
          <div className="flex flex-col items-center justify-center space-y-6 py-2">
            {/* Radar Animation (120x120px, 3 concentric rings, rotating sweep, 3 blinking dots) */}
            <div className="relative w-[120px] h-[120px] rounded-full border-[1.5px] border-subtle flex items-center justify-center overflow-hidden">
              {/* Concentric rings */}
              <div className="absolute w-[80px] h-[80px] rounded-full border-[1.5px] border-subtle" />
              <div className="absolute w-[40px] h-[40px] rounded-full border-[1.5px] border-subtle" />
              <div className="absolute w-[2px] h-[2px] rounded-full bg-white" />

              {/* Rotating conic sweep (15% accent opacity, 1.5s linear infinite) */}
              <div
                className="absolute inset-0 rounded-full animate-radar-sweep pointer-events-none"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(59, 130, 246, 0.18) 360deg)",
                }}
              />

              {/* 3 Blinking dots at different positions */}
              {/* Dot 1: Danger */}
              <div
                className="absolute top-4 right-6 w-2 h-2 rounded-full bg-danger animate-radar-blink"
                style={{ animationDelay: "0ms" }}
              />
              {/* Dot 2: Warning */}
              <div
                className="absolute bottom-6 left-5 w-2 h-2 rounded-full bg-warning animate-radar-blink"
                style={{ animationDelay: "350ms" }}
              />
              {/* Dot 3: Positive */}
              <div
                className="absolute top-8 left-7 w-2 h-2 rounded-full bg-positive animate-radar-blink"
                style={{ animationDelay: "700ms" }}
              />
            </div>

            {/* Cycling Status Text */}
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-primary tracking-tight font-mono">
                {statusMessages[statusIndex]}
              </p>
              <p className="text-xs text-tertiary">
                Evaluating heuristic threat indicators
              </p>
            </div>

            {/* Progress Bar (3px height, animates 0-100%) */}
            <div className="w-48 h-[3px] bg-surface-muted border border-subtle rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-150 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {scanState === "result" && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Risk Gauge Header */}
            <div className="flex items-center gap-4 p-3 bg-surface-muted border border-subtle rounded-lg">
              {/* SVG Circle Gauge (80px, stroke-dasharray 213.6, offset 53.4 for 75) */}
              <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 80 80">
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="6"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="6"
                    strokeDasharray="213.6"
                    strokeDashoffset="53.4"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-base font-medium text-danger tabular-nums">
                  75
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-danger">
                  High risk detected
                </div>
                <div className="text-xs text-secondary mt-0.5">
                  4 out of 6 critical warning signals triggered
                </div>
              </div>
            </div>

            {/* Signal List */}
            <div className="space-y-2">
              {/* Signal 1: Bad */}
              <div className="flex items-center justify-between bg-surface border border-subtle rounded-lg px-3.5 py-2.5 hover:bg-surface-muted transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-danger/15 flex items-center justify-center text-danger">
                    <ShieldAlert className="w-3.5 h-3.5" strokeWidth={1.8} />
                  </div>
                  <span className="text-[13px] text-primary">Payment upfront request</span>
                </div>
                <span className="text-[11px] font-medium text-danger bg-danger/15 rounded px-2 py-0.5">
                  Critical
                </span>
              </div>

              {/* Signal 2: Bad */}
              <div className="flex items-center justify-between bg-surface border border-subtle rounded-lg px-3.5 py-2.5 hover:bg-surface-muted transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-danger/15 flex items-center justify-center text-danger">
                    <AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.8} />
                  </div>
                  <span className="text-[13px] text-primary">Domain registered 3 days ago</span>
                </div>
                <span className="text-[11px] font-medium text-danger bg-danger/15 rounded px-2 py-0.5">
                  Critical
                </span>
              </div>

              {/* Signal 3: Warn */}
              <div className="flex items-center justify-between bg-surface border border-subtle rounded-lg px-3.5 py-2.5 hover:bg-surface-muted transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-warning/15 flex items-center justify-center text-warning">
                    <AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.8} />
                  </div>
                  <span className="text-[13px] text-primary">Recruiter identity unverified</span>
                </div>
                <span className="text-[11px] font-medium text-warning bg-warning/15 rounded px-2 py-0.5">
                  Unverified
                </span>
              </div>

              {/* Signal 4: OK */}
              <div className="flex items-center justify-between bg-surface border border-subtle rounded-lg px-3.5 py-2.5 hover:bg-surface-muted transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-positive/15 flex items-center justify-center text-positive">
                    <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.8} />
                  </div>
                  <span className="text-[13px] text-primary">Job description syntax</span>
                </div>
                <span className="text-[11px] font-medium text-positive bg-positive/15 rounded px-2 py-0.5">
                  Extracted
                </span>
              </div>
            </div>

            {/* Actions Row */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setScanState("idle")}
                className="flex-1 border border-subtle bg-surface hover:bg-surface-muted text-secondary rounded-lg px-3 py-2 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.8} />
                <span>Scan again</span>
              </button>

              <button
                onClick={handleCopy}
                className="flex-1 border border-subtle bg-surface hover:bg-surface-muted text-secondary rounded-lg px-3 py-2 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-positive" strokeWidth={1.8} />
                    <span className="text-positive">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" strokeWidth={1.8} />
                    <span>Copy report</span>
                  </>
                )}
              </button>

              <Link
                href="/report"
                className="flex-1 bg-white hover:bg-neutral-200 text-[#09090b] rounded-lg px-3 py-2 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>View details</span>
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.8} />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Footer text */}
      <div className="pt-4 border-t border-subtle flex items-center justify-between text-xs text-tertiary">
        <span>Zero retention of personal details</span>
        <span className="font-mono text-[11px] text-quaternary">SHA-256</span>
      </div>
    </div>
  );
}
