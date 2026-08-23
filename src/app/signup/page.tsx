"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccessEmailConfirmation, setIsSuccessEmailConfirmation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!email.trim() || !email.includes("@") || !email.includes(".")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        if (
          error.message.toLowerCase().includes("already registered") ||
          error.message.toLowerCase().includes("unique")
        ) {
          setErrorMessage("An account with this email already exists. Please sign in.");
        } else if (error.message.toLowerCase().includes("password")) {
          setErrorMessage("Password is too weak. Please use a stronger password.");
        } else {
          setErrorMessage(error.message || "Failed to create account. Please try again.");
        }
        setIsLoading(false);
        return;
      }

      if (data?.user && !data?.session) {
        setIsSuccessEmailConfirmation(true);
        setIsLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setErrorMessage("A network error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setErrorMessage(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setErrorMessage("Google sign-in is not configured yet.");
      }
    } catch {
      setErrorMessage("Google sign-in is not configured yet.");
    }
  };

  return (
    <div className="min-h-screen bg-app text-primary-color flex flex-col justify-center relative selection:bg-accent-light selection:text-accent-primary transition-colors">
      {/* Top Header / Back Link */}
      <div className="absolute top-6 left-6 sm:left-10 z-20">
        <Link href="/" className="flex items-center gap-2 text-primary-color group">
          <div className="w-7 h-7 rounded-md bg-accent-light flex items-center justify-center text-accent-primary">
            <ShieldCheck className="w-4 h-4" strokeWidth={2} />
          </div>
          <span className="text-[17px] font-medium tracking-tight">
            ScamCheck
          </span>
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 w-full py-16 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Left Column (Desktop Only) */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-7 pr-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-light border border-accent-light text-xs font-medium text-accent-primary w-fit">
              <span>New member registration</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-medium text-primary-color tracking-tight">
                Start protecting your career decisions.
              </h1>
              <p className="text-sm text-secondary-color leading-relaxed max-w-md">
                Join students and job seekers verifying opportunities before sending resumes or sensitive details.
              </p>
            </div>

            {/* Checklist */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs sm:text-sm text-secondary-color">
                <CheckCircle2 className="w-4 h-4 text-accent-primary shrink-0" strokeWidth={2} />
                <span>Instant automated link and company reviews</span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-secondary-color">
                <CheckCircle2 className="w-4 h-4 text-accent-primary shrink-0" strokeWidth={2} />
                <span>Recruiter impersonation & payment scam flags</span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-secondary-color">
                <CheckCircle2 className="w-4 h-4 text-accent-primary shrink-0" strokeWidth={2} />
                <span>100% private and confidential analysis</span>
              </div>
            </div>

          </div>

          {/* Right Column: Signup Card */}
          <div className="w-full max-w-md mx-auto lg:col-span-6">
            <div className="bg-card border border-subtle rounded-2xl p-7 sm:p-9 shadow-card space-y-6">
              
              {isSuccessEmailConfirmation ? (
                <div className="text-center py-4 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-accent-light text-accent-primary flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" strokeWidth={2} />
                  </div>
                  <h2 className="text-lg font-medium text-primary-color">
                    Account created successfully
                  </h2>
                  <p className="text-xs text-secondary-color leading-relaxed">
                    Please check your email (<span className="text-primary-color font-mono">{email}</span>) to verify your account before signing in.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-accent-primary bg-accent-hover text-white font-medium text-sm transition-all shadow-soft btn-interaction"
                    >
                      <span>Back to login</span>
                      <ArrowRight className="w-4 h-4" strokeWidth={1.8} />
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div>
                    <h2 className="text-xl font-medium text-primary-color tracking-tight">
                      Create your account
                    </h2>
                    <p className="text-xs text-secondary-color mt-1">
                      Start verifying opportunities today
                    </p>
                  </div>

                  {/* Error Alert Message */}
                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-danger-light border border-danger-light text-danger-color text-xs flex items-start gap-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.8} />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="fullName"
                        className="block text-xs font-medium text-secondary-color"
                      >
                        Full name
                      </label>
                      <input
                        id="fullName"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Alex Rivera"
                        className="w-full bg-muted-custom border border-subtle focus:border-accent-primary rounded-xl px-3.5 py-2.5 text-sm text-primary-color placeholder:text-tertiary-color focus:outline-none focus:ring-2 focus:ring-accent-primary/10 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="signupEmail"
                        className="block text-xs font-medium text-secondary-color"
                      >
                        Email address
                      </label>
                      <input
                        id="signupEmail"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@university.edu"
                        className="w-full bg-muted-custom border border-subtle focus:border-accent-primary rounded-xl px-3.5 py-2.5 text-sm text-primary-color placeholder:text-tertiary-color focus:outline-none focus:ring-2 focus:ring-accent-primary/10 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="signupPassword"
                        className="block text-xs font-medium text-secondary-color"
                      >
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="signupPassword"
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Create a password (min 6 chars)"
                          className="w-full bg-muted-custom border border-subtle focus:border-accent-primary rounded-xl px-3.5 pr-10 py-2.5 text-sm text-primary-color placeholder:text-tertiary-color focus:outline-none focus:ring-2 focus:ring-accent-primary/10 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-tertiary-color hover:text-primary-color transition-colors"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" strokeWidth={1.8} />
                          ) : (
                            <Eye className="w-4 h-4" strokeWidth={1.8} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="confirmPassword"
                        className="block text-xs font-medium text-secondary-color"
                      >
                        Confirm password
                      </label>
                      <input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        className="w-full bg-muted-custom border border-subtle focus:border-accent-primary rounded-xl px-3.5 py-2.5 text-sm text-primary-color placeholder:text-tertiary-color focus:outline-none focus:ring-2 focus:ring-accent-primary/10 transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 mt-2 rounded-xl bg-accent-primary bg-accent-hover text-white font-medium text-sm transition-all shadow-soft btn-interaction cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {isLoading ? (
                        <span>Creating account...</span>
                      ) : (
                        <>
                          <span>Create account</span>
                          <ArrowRight className="w-4 h-4" strokeWidth={1.8} />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-subtle" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-card px-2 text-tertiary-color">or</span>
                    </div>
                  </div>

                  {/* Continue with Google */}
                  <button
                    type="button"
                    onClick={handleGoogleSignUp}
                    className="w-full py-2.5 px-4 rounded-xl border border-subtle bg-card hover:bg-muted-custom text-primary-color font-medium text-sm transition-colors flex items-center justify-center gap-2.5 cursor-pointer shadow-soft"
                  >
                    <span>Continue with Google</span>
                  </button>

                  <p className="text-center text-xs text-secondary-color">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="text-accent-primary hover:underline font-medium"
                    >
                      Sign in
                    </Link>
                  </p>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
