"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Link2,
  ImageIcon,
  AlignLeft,
  ArrowRight,
  AlertCircle,
  Upload,
  X,
  ExternalLink,
  Info,
  RotateCcw,
} from "lucide-react";
import { validateScreenshotFile } from "@/lib/evidence/screenshot";
import AnalysisProgress from "@/components/verification/AnalysisProgress";

type InputMode = "url" | "screenshot" | "text";

// ─── URL Tab ──────────────────────────────────────────────────────────────────

function UrlTab({
  onSuccess,
}: {
  onSuccess: (id: string) => void;
}) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const initial = searchParams.get("url");
    if (initial) setUrl(initial);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter a valid public URL.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/analyze-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Unable to analyze the submitted URL.");
        setIsLoading(false);
        return;
      }

      const verificationId = data.verificationId as string;
      if (!verificationId) {
        setError("Unable to save the verification. Please try again.");
        setIsLoading(false);
        return;
      }

      onSuccess(verificationId);
      router.push(`/dashboard/result/${verificationId}`);
    } catch {
      setError("A network error occurred. Please check your connection.");
      setIsLoading(false);
    }
  };

  if (isLoading) return <AnalysisProgress />;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3.5 rounded-xl bg-danger-light border border-danger-light text-danger-color text-xs flex items-start gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.8} />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs font-medium text-secondary-color block">
          Opportunity URL
        </label>
        <input
          type="text"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/careers/software-intern"
          className="w-full bg-muted-custom border border-subtle focus:border-accent-primary rounded-xl px-4 py-3 text-sm text-primary-color placeholder:text-tertiary-color focus:outline-none focus:ring-2 focus:ring-accent-primary/10 transition-all"
        />
        <p className="text-xs text-tertiary-color">
          Paste the careers page, job portal link, or opportunity posting URL.
        </p>
      </div>

      <button
        type="submit"
        className="w-full sm:w-auto bg-accent-primary bg-accent-hover text-white px-7 py-3 rounded-xl text-sm font-medium transition-all shadow-soft btn-interaction cursor-pointer flex items-center justify-center gap-2"
      >
        <span>Analyze opportunity</span>
        <ArrowRight className="w-4 h-4" strokeWidth={1.8} />
      </button>
    </form>
  );
}

// ─── Screenshot Tab ───────────────────────────────────────────────────────────

function ScreenshotTab({ onSuccess }: { onSuccess: (id: string) => void }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [additionalContext, setAdditionalContext] = useState("");
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [ocrProgressText, setOcrProgressText] = useState("Preparing screenshot...");
  const [ocrProgressPct, setOcrProgressPct] = useState(0);
  const [ocrStatus, setOcrStatus] = useState<"idle" | "low_text" | "ocr_error" | "timeout">("idle");
  const [fallbackText, setFallbackText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const router = useRouter();

  const handleFile = useCallback((file: File) => {
    setError(null);
    setOcrStatus("idle");
    setFallbackText("");

    const validation = validateScreenshotFile(file);
    if (!validation.valid) {
      setError(validation.error || "Invalid file.");
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) handleFile(file);
          break;
        }
      }
    },
    [handleFile]
  );

  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [previewUrl]);

  const removeFile = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setOcrStatus("idle");
    setFallbackText("");
    setError(null);
    setIsProcessingOcr(false);
    setIsAnalyzing(false);
  };

  const handleAnalyzeScreenshot = async () => {
    if (!selectedFile || isProcessingOcr || isAnalyzing) return;
    setError(null);
    setOcrStatus("idle");
    setIsProcessingOcr(true);
    setOcrProgressPct(0.2);
    setOcrProgressText("Uploading screenshot...");

    // Setup abort controller for cancellation on navigation or timeout
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // 30-second client-side timeout safeguard
    const clientTimeoutId = setTimeout(() => {
      controller.abort();
    }, 30_000);

    try {
      // 1. Convert selected image to base64
      const base64Data = await new Promise<{ base64: string; mimeType: string }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const commaIdx = result.indexOf(",");
          const base64 = commaIdx !== -1 ? result.slice(commaIdx + 1) : result;
          resolve({ base64, mimeType: selectedFile.type });
        };
        reader.onerror = () => reject(new Error("Unable to read image file."));
        reader.readAsDataURL(selectedFile);
      });

      setOcrProgressPct(0.5);
      setOcrProgressText("Screenshot uploaded. Analyzing screenshot...");

      // 2. Post JSON payload to /api/analyze-evidence
      const res = await fetch("/api/analyze-evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64Data.base64,
          mimeType: base64Data.mimeType,
          additionalContext: additionalContext.trim() || undefined,
          sourceType: "screenshot",
        }),
        signal: controller.signal,
      });

      clearTimeout(clientTimeoutId);

      setOcrProgressPct(0.8);
      setOcrProgressText("Extracting evidence & text...");

      const data = await res.json();

      setOcrProgressPct(0.95);
      setOcrProgressText("Assessing risk signals...");

      if (!res.ok || !data.success) {
        if (data.status === "timeout") {
          setOcrStatus("timeout");
          setError("Screenshot analysis timed out. Please try again or paste the text manually.");
          return;
        }

        if (data.status === "low_text") {
          setOcrStatus("low_text");
          setFallbackText(data.extractedText || "");
          return;
        }

        if (data.status === "ocr_error") {
          setOcrStatus("ocr_error");
          setError(data.error || "Screenshot uploaded, but analysis failed. You can paste the text manually or try again.");
          return;
        }

        setError(data.error || "Upload failed. Please try again.");
        setOcrStatus("ocr_error");
        return;
      }

      setOcrProgressPct(1.0);
      setOcrProgressText("Analysis complete!");
      onSuccess(data.verificationId);
      router.push(`/dashboard/result/${data.verificationId}`);
    } catch (err: any) {
      clearTimeout(clientTimeoutId);
      if (err?.name === "AbortError") {
        setError("Screenshot analysis timed out. Please try again or paste the text manually.");
        setOcrStatus("timeout");
        return;
      }
      setError("Upload failed. Please try again.");
      setOcrStatus("ocr_error");
    } finally {
      setIsProcessingOcr(false);
      setIsAnalyzing(false);
      abortControllerRef.current = null;
    }
  };

  const handleManualFallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fallbackText.trim() || fallbackText.trim().length < 10) {
      setError("Please paste the text from the screenshot to analyze.");
      return;
    }

    setIsAnalyzing(true);

    try {
      const res = await fetch("/api/analyze-evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: fallbackText.trim(),
          sourceType: "screenshot",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Unable to analyze the submitted text.");
        setIsAnalyzing(false);
        return;
      }

      onSuccess(data.verificationId);
      router.push(`/dashboard/result/${data.verificationId}`);
    } catch {
      setError("A network error occurred. Please try again.");
      setIsAnalyzing(false);
    }
  };

  if (isAnalyzing) return <AnalysisProgress />;

  return (
    <div className="space-y-5">
      {error && (
        <div className="p-3.5 rounded-xl bg-danger-light border border-danger-light text-danger-color text-xs flex items-start gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.8} />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Area */}
      {!selectedFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
            isDragOver
              ? "border-accent-primary bg-accent-light"
              : "border-subtle hover:border-accent-primary/50 hover:bg-muted-custom"
          }`}
        >
          <Upload className="w-8 h-8 text-tertiary-color mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm font-medium text-primary-color mb-1">
            Drop screenshot here
          </p>
          <p className="text-xs text-secondary-color mb-4">
            or click to choose an image from gallery / files
          </p>
          <p className="text-[11px] text-tertiary-color">
            PNG, JPG, JPEG, WEBP · Max 5 MB · Paste from clipboard supported (Ctrl+V)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Preview */}
          <div className="relative rounded-xl overflow-hidden border border-subtle bg-muted-custom">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl!}
              alt="Screenshot preview"
              className="w-full max-h-64 object-contain mx-auto"
            />
            {!isProcessingOcr && (
              <button
                type="button"
                onClick={removeFile}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-card/90 backdrop-blur border border-subtle text-secondary-color hover:text-primary-color transition-colors cursor-pointer"
                title="Remove image"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            )}
          </div>

          {/* Optional Context Text Input */}
          {!isProcessingOcr && ocrStatus === "idle" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-secondary-color block">
                Additional context (optional)
              </label>
              <textarea
                rows={2}
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                placeholder="e.g., 'Received via WhatsApp claiming to be from Microsoft India'"
                className="w-full bg-muted-custom border border-subtle focus:border-accent-primary rounded-xl p-3 text-xs text-primary-color placeholder:text-tertiary-color focus:outline-none focus:ring-2 focus:ring-accent-primary/10 transition-all resize-none"
              />
            </div>
          )}

          {/* OCR Processing Active Indicator */}
          {isProcessingOcr && (
            <div className="p-4 rounded-xl bg-muted-custom border border-subtle space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-primary-color flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
                  {ocrProgressText}
                </span>
                <span className="text-tertiary-color tabular-nums">
                  {Math.round(ocrProgressPct * 100)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-subtle rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-primary transition-all duration-300 rounded-full"
                  style={{ width: `${Math.round(ocrProgressPct * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-tertiary-color">
                Analyzing screenshot text and extracting evidence...
              </p>
            </div>
          )}

          {/* Low Text Detected Banner */}
          {ocrStatus === "low_text" && !isProcessingOcr && (
            <form onSubmit={handleManualFallbackSubmit} className="space-y-3 animate-in fade-in">
              <div className="p-3.5 rounded-xl bg-warning-light border border-warning-light text-warning-color text-xs flex items-start gap-2.5">
                <Info className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={2} />
                <div>
                  <p className="font-medium">
                    We couldn&apos;t extract enough text from this screenshot.
                  </p>
                  <p className="mt-0.5 text-secondary-color">
                    Please paste or edit the text from the screenshot below to verify the opportunity.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-secondary-color block">
                  Screenshot text
                </label>
                <textarea
                  rows={5}
                  required
                  value={fallbackText}
                  onChange={(e) => setFallbackText(e.target.value)}
                  placeholder="Paste the message, offer details, or recruiter text here..."
                  className="w-full bg-muted-custom border border-subtle focus:border-accent-primary rounded-xl p-3 text-sm text-primary-color placeholder:text-tertiary-color focus:outline-none focus:ring-2 focus:ring-accent-primary/10 transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto bg-accent-primary bg-accent-hover text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all shadow-soft btn-interaction cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Analyze screenshot text</span>
                <ArrowRight className="w-4 h-4" strokeWidth={1.8} />
              </button>
            </form>
          )}

          {/* OCR Error / Timeout State with Retry & Manual Option */}
          {(ocrStatus === "ocr_error" || ocrStatus === "timeout") && !isProcessingOcr && (
            <div className="space-y-4 animate-in fade-in">
              <form onSubmit={handleManualFallbackSubmit} className="space-y-3">
                <div className="p-3.5 rounded-xl bg-warning-light border border-warning-light text-warning-color text-xs flex items-start gap-2.5">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={2} />
                  <div>
                    <p className="font-medium">
                      {ocrStatus === "timeout"
                        ? "Screenshot analysis timed out."
                        : "Screenshot analysis is temporarily unavailable."}
                    </p>
                    <p className="mt-0.5 text-secondary-color">
                      You can try analyzing the screenshot again, or paste the text manually below.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAnalyzeScreenshot}
                    disabled={isProcessingOcr || isAnalyzing}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Try again</span>
                  </button>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-medium text-secondary-color block">
                    Paste text manually
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={fallbackText}
                    onChange={(e) => setFallbackText(e.target.value)}
                    placeholder="Paste the message, offer details, or recruiter text here..."
                    className="w-full bg-muted-custom border border-subtle focus:border-accent-primary rounded-xl p-3 text-sm text-primary-color placeholder:text-tertiary-color focus:outline-none focus:ring-2 focus:ring-accent-primary/10 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isProcessingOcr || isAnalyzing}
                  className="w-full sm:w-auto bg-accent-primary bg-accent-hover text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all shadow-soft btn-interaction cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Analyze text</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={1.8} />
                </button>
              </form>
            </div>
          )}

          {/* Primary Action Button (when OCR is idle) */}
          {ocrStatus === "idle" && !isProcessingOcr && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleAnalyzeScreenshot}
                disabled={isProcessingOcr || isAnalyzing}
                className="w-full sm:w-auto bg-accent-primary bg-accent-hover text-white px-7 py-3 rounded-xl text-sm font-medium transition-all shadow-soft btn-interaction cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Analyze screenshot</span>
                <ArrowRight className="w-4 h-4" strokeWidth={1.8} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Text Tab ─────────────────────────────────────────────────────────────────

function TextTab({ onSuccess }: { onSuccess: (id: string) => void }) {
  const [text, setText] = useState("");
  const [detectedUrls, setDetectedUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Detect URLs as user types
  useEffect(() => {
    const matches = text.match(/https?:\/\/[^\s"'<>)\]]+/g) || [];
    setDetectedUrls(Array.from(new Set(matches)).slice(0, 3));
  }, [text]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!text.trim() || text.trim().length < 10) {
      setError("Please paste the message or offer details to analyze.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/analyze-evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), sourceType: "text" }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Unable to analyze the provided text.");
        setIsLoading(false);
        return;
      }

      onSuccess(data.verificationId);
      router.push(`/dashboard/result/${data.verificationId}`);
    } catch {
      setError("A network error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  if (isLoading) return <AnalysisProgress />;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3.5 rounded-xl bg-danger-light border border-danger-light text-danger-color text-xs flex items-start gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.8} />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs font-medium text-secondary-color block">
          Paste the message or offer details
        </label>
        <textarea
          rows={8}
          required
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"Paste the job offer, WhatsApp message, email, internship details, or offer letter text here..."}
          className="w-full bg-muted-custom border border-subtle focus:border-accent-primary rounded-xl p-3.5 text-sm text-primary-color placeholder:text-tertiary-color focus:outline-none focus:ring-2 focus:ring-accent-primary/10 transition-all resize-none"
        />
        <p className="text-xs text-tertiary-color">
          You can paste text from WhatsApp, email, Telegram, LinkedIn, an offer letter, or any other source.
        </p>
      </div>

      {/* Detected URLs */}
      {detectedUrls.length > 0 && (
        <div className="p-3.5 rounded-xl bg-muted-custom border border-subtle space-y-2">
          <div className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-accent-primary shrink-0" strokeWidth={2} />
            <span className="text-xs font-medium text-primary-color">
              {detectedUrls.length === 1 ? "Link detected in text" : `${detectedUrls.length} links detected in text`}
            </span>
          </div>
          {detectedUrls.map((u, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-secondary-color truncate max-w-xs">{u}</span>
              <span className="text-[10px] text-tertiary-color shrink-0">
                · will be included in analysis
              </span>
            </div>
          ))}
        </div>
      )}

      <button
        type="submit"
        className="w-full sm:w-auto bg-accent-primary bg-accent-hover text-white px-7 py-3 rounded-xl text-sm font-medium transition-all shadow-soft btn-interaction cursor-pointer flex items-center justify-center gap-2"
      >
        <span>Analyze opportunity</span>
        <ArrowRight className="w-4 h-4" strokeWidth={1.8} />
      </button>
    </form>
  );
}

// ─── Main Check Page ──────────────────────────────────────────────────────────

function CheckPageContent() {
  const [mode, setMode] = useState<InputMode>("url");
  const searchParams = useSearchParams();

  useEffect(() => {
    const modeParam = searchParams.get("mode") as InputMode | null;
    if (modeParam && ["url", "screenshot", "text"].includes(modeParam)) {
      setMode(modeParam);
    }
  }, [searchParams]);

  const handleSuccess = (id: string) => {
    // Router push handled inside each tab component
  };

  const tabs: { id: InputMode; label: string; icon: React.ReactNode }[] = [
    { id: "url", label: "Paste URL", icon: <Link2 className="w-3.5 h-3.5" strokeWidth={1.8} /> },
    { id: "screenshot", label: "Upload screenshot", icon: <ImageIcon className="w-3.5 h-3.5" strokeWidth={1.8} /> },
    { id: "text", label: "Paste text", icon: <AlignLeft className="w-3.5 h-3.5" strokeWidth={1.8} /> },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="space-y-1">
        <span className="text-xs text-tertiary-color font-medium block">
          Workspace / New check
        </span>
        <h1 className="text-2xl font-medium tracking-tight text-primary-color">
          Check an opportunity
        </h1>
        <p className="text-sm text-secondary-color">
          Paste a link, upload a screenshot, or paste the details you received.
        </p>
      </div>

      {/* Unified Input Card */}
      <div className="bg-card border border-subtle rounded-2xl p-6 sm:p-8 shadow-card space-y-6">
        {/* Mode Tabs */}
        <div className="flex border-b border-subtle gap-1 -mx-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMode(tab.id)}
              className={`flex items-center gap-1.5 pb-3 px-1 text-xs sm:text-sm font-medium transition-colors border-b-2 -mb-[1px] whitespace-nowrap shrink-0 cursor-pointer ${
                mode === tab.id
                  ? "border-accent-primary text-accent-primary"
                  : "border-transparent text-secondary-color hover:text-primary-color"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {mode === "url" && <UrlTab onSuccess={handleSuccess} />}
        {mode === "screenshot" && <ScreenshotTab onSuccess={handleSuccess} />}
        {mode === "text" && <TextTab onSuccess={handleSuccess} />}
      </div>

      {/* Privacy note for screenshot */}
      {mode === "screenshot" && (
        <p className="text-[11px] text-tertiary-color text-center px-4">
          Screenshots are processed securely for text extraction. Images are never shared with third parties.
        </p>
      )}
    </div>
  );
}

export default function CheckOpportunityPage() {
  const { Suspense } = require("react");
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto py-12 text-xs text-tertiary-color">
          Loading verification workspace...
        </div>
      }
    >
      <CheckPageContent />
    </Suspense>
  );
}
