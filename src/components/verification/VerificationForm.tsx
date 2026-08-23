"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Link2, AlignLeft, ArrowRight, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { analyzeOpportunity } from "@/lib/risk-engine/analyzer";
import { OpportunityInput } from "@/lib/risk-engine/types";
import AnalysisProgress from "./AnalysisProgress";

export default function VerificationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialUrl = searchParams.get("url") || "";

  const [mode, setMode] = useState<"url" | "manual">("url");
  const [url, setUrl] = useState(initialUrl);

  // Manual Fields
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [recruiterEmail, setRecruiterEmail] = useState("");
  const [salaryText, setSalaryText] = useState("");
  const [contactMethod, setContactMethod] = useState("Email");
  const [paymentOption, setPaymentOption] = useState<"no" | "yes" | "not_sure">("no");
  const [jobDescription, setJobDescription] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (initialUrl) {
      setUrl(initialUrl);
      setMode("url");
    }
  }, [initialUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      router.push("/login");
      return;
    }

    setIsAnalyzing(true);

    try {
      if (mode === "url") {
        const trimmedUrl = url.trim();
        if (!trimmedUrl) {
          setErrorMessage("Please enter a valid public URL.");
          setIsAnalyzing(false);
          return;
        }

        // Call server-side URL Intelligence API (which also saves to Supabase)
        const response = await fetch("/api/analyze-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: trimmedUrl }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          setErrorMessage(data.error || "Unable to analyze the submitted URL.");
          setIsAnalyzing(false);
          return;
        }

        // The API now handles saving to Supabase and returns the verificationId
        const verificationId = data.verificationId as string;
        if (!verificationId) {
          setErrorMessage("Unable to save your verification. Please try again.");
          setIsAnalyzing(false);
          return;
        }

        router.push(`/dashboard/result/${verificationId}`);
      } else {
        // Manual Mode
        if (!companyName.trim() && !jobTitle.trim() && !jobDescription.trim()) {
          setErrorMessage("Please provide at least a company name, job title, or description.");
          setIsAnalyzing(false);
          return;
        }

        const opportunityInput: OpportunityInput = {
          inputType: "manual",
          companyName: companyName.trim() || undefined,
          jobTitle: jobTitle.trim() || undefined,
          recruiterEmail: recruiterEmail.trim() || undefined,
          salaryText: salaryText.trim() || undefined,
          contactMethod: contactMethod.toLowerCase(),
          paymentRequested:
            paymentOption === "yes" ? true : paymentOption === "no" ? false : null,
          jobDescription: jobDescription.trim() || undefined,
        };

        const analysis = analyzeOpportunity(opportunityInput);

        const { data: verificationData, error: insertError } = await supabase
          .from("verifications")
          .insert({
            user_id: user.id,
            input_type: "manual",
            url: null,
            company_name: opportunityInput.companyName || null,
            job_title: opportunityInput.jobTitle || null,
            recruiter_email: opportunityInput.recruiterEmail || null,
            salary_text: opportunityInput.salaryText || null,
            contact_method: opportunityInput.contactMethod || null,
            payment_requested: opportunityInput.paymentRequested,
            job_description: opportunityInput.jobDescription || null,
            risk_score: analysis.score,
            risk_level: analysis.level,
            summary: analysis.summary,
            recommendations: analysis.recommendations,
          })
          .select("id")
          .single();

        if (insertError || !verificationData) {
          setErrorMessage("Unable to save your verification. Please check your connection and try again.");
          setIsAnalyzing(false);
          return;
        }

        const verificationId = verificationData.id;

        // Only store real risk signals (not informational observations)
        const signalsToStore = analysis.signals.filter((sig) => !sig.isInformational);
        if (signalsToStore.length > 0) {
          const signalRows = signalsToStore.map((sig) => ({
            verification_id: verificationId,
            title: sig.title,
            description: sig.description,
            severity: sig.severity,
            points: sig.points,
          }));

          await supabase.from("risk_signals").insert(signalRows);
        }

        router.push(`/dashboard/result/${verificationId}`);
      }
    } catch {
      setErrorMessage("An unexpected error occurred during verification. Please try again.");
      setIsAnalyzing(false);
    }
  };

  if (isAnalyzing) {
    return (
      <div className="bg-card border border-subtle rounded-2xl p-6 sm:p-8 shadow-card">
        <AnalysisProgress />
      </div>
    );
  }

  return (
    <div className="bg-card border border-subtle rounded-2xl p-6 sm:p-8 shadow-card space-y-6">
      
      {/* Mode Selector Tabs */}
      <div className="flex border-b border-subtle gap-6">
        <button
          type="button"
          onClick={() => {
            setMode("url");
            setErrorMessage(null);
          }}
          className={`pb-3 text-xs sm:text-sm font-medium transition-colors border-b-2 -mb-[1px] flex items-center gap-1.5 cursor-pointer ${
            mode === "url"
              ? "border-accent-primary text-accent-primary"
              : "border-transparent text-secondary-color hover:text-primary-color"
          }`}
        >
          <Link2 className="w-3.5 h-3.5" strokeWidth={1.8} />
          <span>URL</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMode("manual");
            setErrorMessage(null);
          }}
          className={`pb-3 text-xs sm:text-sm font-medium transition-colors border-b-2 -mb-[1px] flex items-center gap-1.5 cursor-pointer ${
            mode === "manual"
              ? "border-accent-primary text-accent-primary"
              : "border-transparent text-secondary-color hover:text-primary-color"
          }`}
        >
          <AlignLeft className="w-3.5 h-3.5" strokeWidth={1.8} />
          <span>Details</span>
        </button>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-danger-light border border-danger-light text-danger-color text-xs flex items-start gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.8} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {mode === "url" ? (
          <div className="space-y-2">
            <label className="text-xs font-medium text-secondary-color block">
              Job or internship URL
            </label>
            <input
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://company.com/careers/software-intern"
              className="w-full bg-muted-custom border border-subtle focus:border-accent-primary rounded-xl px-4 py-3 text-sm text-primary-color placeholder:text-tertiary-color focus:outline-none focus:ring-2 focus:ring-accent-primary/10 transition-all"
            />
            <p className="text-xs text-tertiary-color">
              Paste the public careers page, job portal link, or opportunity posting.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-secondary-color block">
                  Company name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Tech Solutions"
                  className="w-full bg-muted-custom border border-subtle focus:border-accent-primary rounded-xl px-3.5 py-2.5 text-sm text-primary-color placeholder:text-tertiary-color focus:outline-none focus:ring-2 focus:ring-accent-primary/10 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-secondary-color block">
                  Job title
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Software Engineering Intern"
                  className="w-full bg-muted-custom border border-subtle focus:border-accent-primary rounded-xl px-3.5 py-2.5 text-sm text-primary-color placeholder:text-tertiary-color focus:outline-none focus:ring-2 focus:ring-accent-primary/10 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-secondary-color block">
                  Recruiter email
                </label>
                <input
                  type="email"
                  value={recruiterEmail}
                  onChange={(e) => setRecruiterEmail(e.target.value)}
                  placeholder="recruiter@company.com"
                  className="w-full bg-muted-custom border border-subtle focus:border-accent-primary rounded-xl px-3.5 py-2.5 text-sm text-primary-color placeholder:text-tertiary-color focus:outline-none focus:ring-2 focus:ring-accent-primary/10 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-secondary-color block">
                  Salary / stipend
                </label>
                <input
                  type="text"
                  value={salaryText}
                  onChange={(e) => setSalaryText(e.target.value)}
                  placeholder="e.g. ₹25,000 / month"
                  className="w-full bg-muted-custom border border-subtle focus:border-accent-primary rounded-xl px-3.5 py-2.5 text-sm text-primary-color placeholder:text-tertiary-color focus:outline-none focus:ring-2 focus:ring-accent-primary/10 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-secondary-color block">
                  Contact method
                </label>
                <select
                  value={contactMethod}
                  onChange={(e) => setContactMethod(e.target.value)}
                  className="w-full bg-muted-custom border border-subtle focus:border-accent-primary rounded-xl px-3.5 py-2.5 text-sm text-primary-color focus:outline-none focus:ring-2 focus:ring-accent-primary/10 transition-all cursor-pointer"
                >
                  <option value="Email">Email</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Telegram">Telegram</option>
                  <option value="Phone">Phone</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-secondary-color block">
                  Payment requested
                </label>
                <select
                  value={paymentOption}
                  onChange={(e) =>
                    setPaymentOption(e.target.value as "no" | "yes" | "not_sure")
                  }
                  className="w-full bg-muted-custom border border-subtle focus:border-accent-primary rounded-xl px-3.5 py-2.5 text-sm text-primary-color focus:outline-none focus:ring-2 focus:ring-accent-primary/10 transition-all cursor-pointer"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes (registration/deposit requested)</option>
                  <option value="not_sure">Not sure</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-secondary-color block">
                Job description / offer details
              </label>
              <textarea
                rows={4}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description, responsibilities, or offer email text..."
                className="w-full bg-muted-custom border border-subtle focus:border-accent-primary rounded-xl p-3.5 text-sm text-primary-color placeholder:text-tertiary-color focus:outline-none focus:ring-2 focus:ring-accent-primary/10 transition-all resize-none"
              />
            </div>
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto bg-accent-primary bg-accent-hover text-white px-7 py-3 rounded-xl text-sm font-medium transition-all shadow-soft btn-interaction cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Analyze opportunity</span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.8} />
          </button>
        </div>
      </form>
    </div>
  );
}
