"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirectTo") || "/dashboard";
  const redirectTo =
    rawRedirect.startsWith("/") && !rawRedirect.startsWith("//") && !rawRedirect.startsWith("/\\") && !rawRedirect.includes("://")
      ? rawRedirect
      : "/dashboard";
  const callbackError = searchParams.get("error");

  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    callbackError === "auth_callback_failed"
      ? "Authentication link expired or invalid. Please sign in with your credentials."
      : null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (
          error.message.toLowerCase().includes("invalid login credentials") ||
          error.message.toLowerCase().includes("invalid_grant") ||
          error.message.toLowerCase().includes("invalid credentials")
        ) {
          setErrorMessage("Invalid email or password.");
        } else if (error.message.toLowerCase().includes("email not confirmed")) {
          setErrorMessage("Please check your email and confirm your account before signing in.");
        } else {
          setErrorMessage("Invalid email or password.");
        }
        setIsLoading(false);
        return;
      }

      if (data?.session) {
        router.push(redirectTo);
        router.refresh();
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setErrorMessage("A network error occurred. Please check your connection and try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
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
              <span>Secure member workspace</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-medium text-primary-color tracking-tight">
                Welcome back.
              </h1>
              <p className="text-sm text-secondary-color leading-relaxed max-w-md">
                Continue checking opportunities and protecting your personal details from hiring scams.
              </p>
            </div>

            {/* Checklist */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs sm:text-sm text-secondary-color">
                <CheckCircle2 className="w-4 h-4 text-accent-primary shrink-0" strokeWidth={2} />
                <span>Encrypted private verification history</span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-secondary-color">
                <CheckCircle2 className="w-4 h-4 text-accent-primary shrink-0" strokeWidth={2} />
                <span>Instant automated link and company reviews</span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-secondary-color">
                <CheckCircle2 className="w-4 h-4 text-accent-primary shrink-0" strokeWidth={2} />
                <span>Zero data selling or third-party sharing</span>
              </div>
            </div>

          </div>

          {/* Right Column: Login Card */}
          <div className="w-full max-w-md mx-auto lg:col-span-6">
            <div className="bg-card border border-subtle rounded-2xl p-7 sm:p-9 shadow-card space-y-6">
              
              {/* Header */}
              <div>
                <h2 className="text-xl font-medium text-primary-color tracking-tight">
                  Sign in to ScamCheck
                </h2>
                <p className="text-xs text-secondary-color mt-1">
                  Access your verification dashboard
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
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="block text-xs font-medium text-secondary-color"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@university.edu"
                    className="w-full bg-muted-custom border border-subtle focus:border-accent-primary rounded-xl px-3.5 py-2.5 text-sm text-primary-color placeholder:text-tertiary-color focus:outline-none focus:ring-2 focus:ring-accent-primary/10 transition-all"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-xs font-medium text-secondary-color"
                    >
                      Password
                    </label>
                    <Link
                      href="#"
                      className="text-xs text-accent-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
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

                {/* Primary Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-accent-primary bg-accent-hover text-white font-medium text-sm transition-all shadow-soft btn-interaction cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isLoading ? (
                    <span>Signing in...</span>
                  ) : (
                    <>
                      <span>Sign in</span>
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
                onClick={handleGoogleSignIn}
                className="w-full py-2.5 px-4 rounded-xl border border-subtle bg-card hover:bg-muted-custom text-primary-color font-medium text-sm transition-colors flex items-center justify-center gap-2.5 cursor-pointer shadow-soft"
              >
                <span>Continue with Google</span>
              </button>

              {/* Bottom switch link */}
              <p className="text-center text-xs text-secondary-color">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-accent-primary hover:underline font-medium"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-app" />}>
      <LoginForm />
    </Suspense>
  );
}
