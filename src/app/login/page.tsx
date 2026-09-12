"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirectTo") || "/dashboard";
  const redirectTo = rawRedirect.startsWith("/") && !rawRedirect.startsWith("//") && !rawRedirect.startsWith("/\\") && !rawRedirect.includes("://") ? rawRedirect : "/dashboard";
  const callbackError = searchParams.get("error");
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(callbackError === "auth_callback_failed" ? "Authentication link expired or invalid. Please sign in with your credentials." : null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErrorMessage(null);
    if (!email.trim()) return setErrorMessage("Please enter your email address.");
    if (!password) return setErrorMessage("Please enter your password.");
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        const message = error.message.toLowerCase();
        if (message.includes("email not confirmed")) setErrorMessage("Please check your email and confirm your account before signing in.");
        else setErrorMessage("Invalid email or password.");
        setIsLoading(false); return;
      }
      router.push(data?.session ? redirectTo : "/dashboard"); router.refresh();
    } catch { setErrorMessage("A network error occurred. Please check your connection and try again."); setIsLoading(false); }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` } });
      if (error) setErrorMessage("Google sign-in is not configured yet.");
    } catch { setErrorMessage("Google sign-in is not configured yet."); }
  };

  return (
    <div className="min-h-screen bg-app text-primary-color grid lg:grid-cols-2">
      <section className="hidden lg:flex relative surface-grid bg-primary-color text-[var(--bg-primary)] p-12 xl:p-20 flex-col justify-between overflow-hidden">
        <div className="absolute -right-32 -bottom-32 w-[520px] h-[520px] rounded-full border border-accent-primary/20" />
        <div className="absolute right-0 bottom-0 w-[360px] h-[360px] rounded-full border border-accent-primary/15" />
        <Link href="/" className="relative flex items-center gap-3 w-fit"><span className="w-10 h-10 rounded-xl bg-accent-primary text-[#07100c] flex items-center justify-center"><ShieldCheck className="w-5 h-5"/></span><span className="font-semibold text-lg">ScamCheck</span></Link>
        <div className="relative max-w-lg">
          <div className="flex items-center gap-2 text-accent-primary text-xs font-semibold uppercase tracking-[.18em]"><Sparkles className="w-4 h-4"/> Secure workspace</div>
          <h1 className="mt-6 text-5xl xl:text-6xl font-semibold tracking-[-.055em] leading-[.95]">Check smarter.<br/>Trust slower.</h1>
          <p className="mt-7 text-[var(--text-secondary)] leading-relaxed max-w-md">Your verification workspace for suspicious job links, internship offers, recruiters, and company claims.</p>
          <div className="mt-10 grid grid-cols-2 gap-3 max-w-sm">
            {["URL intelligence", "Evidence review", "Company signals", "Risk explanation"].map(item => <div key={item} className="border border-[var(--border-color)] rounded-xl px-3 py-3 text-xs text-[var(--text-secondary)]">{item}</div>)}
          </div>
        </div>
        <div className="relative text-xs text-[var(--text-tertiary)] flex items-center gap-2"><LockKeyhole className="w-3.5 h-3.5"/> Your account protects your verification workspace.</div>
      </section>

      <main className="min-h-screen flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <Link href="/" className="lg:hidden inline-flex items-center gap-2 text-sm font-semibold mb-12"><ShieldCheck className="w-5 h-5 text-accent-primary"/> ScamCheck</Link>
          <Link href="/" className="hidden lg:inline-flex items-center gap-1.5 text-xs text-tertiary-color hover:text-primary-color mb-10"><ArrowLeft className="w-3.5 h-3.5"/> Back to home</Link>
          <div className="mb-8"><div className="text-xs uppercase tracking-[.18em] text-accent-primary font-semibold">Welcome back</div><h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-[-.045em]">Sign in to ScamCheck.</h2><p className="mt-3 text-sm text-secondary-color">Continue your opportunity verification workspace.</p></div>

          {errorMessage && <div className="mb-5 p-3.5 rounded-xl bg-danger-light border border-danger-light text-danger-color text-sm flex gap-2.5"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5"/><span>{errorMessage}</span></div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div><label htmlFor="email" className="block text-xs font-semibold mb-2">Email address</label><input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@university.edu" className="w-full h-12 rounded-xl border border-subtle bg-card px-4 text-sm outline-none focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/10 transition-all" /></div>
            <div><div className="flex items-center justify-between mb-2"><label htmlFor="password" className="text-xs font-semibold">Password</label><Link href="#" className="text-xs text-accent-primary hover:underline">Forgot password?</Link></div><div className="relative"><input id="password" type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" className="w-full h-12 rounded-xl border border-subtle bg-card px-4 pr-12 text-sm outline-none focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/10 transition-all"/><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-0 h-12 w-12 flex items-center justify-center text-tertiary-color hover:text-primary-color" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}</button></div></div>
            <button type="submit" disabled={isLoading} className="btn-interaction w-full h-12 rounded-xl bg-accent-primary text-white dark:text-[#07100c] font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60">{isLoading ? "Signing in…" : <>Sign in <ArrowRight className="w-4 h-4"/></>}</button>
          </form>

          <div className="my-7 flex items-center gap-3 text-[11px] text-tertiary-color"><span className="h-px flex-1 bg-subtle"/><span>OR</span><span className="h-px flex-1 bg-subtle"/></div>
          <button type="button" onClick={handleGoogleSignIn} className="w-full h-12 rounded-xl border border-subtle bg-card hover:bg-muted-custom text-sm font-semibold transition-colors flex items-center justify-center gap-2"><span className="w-5 h-5 rounded-full border border-subtle flex items-center justify-center text-[10px] font-bold">G</span> Continue with Google</button>
          <p className="mt-7 text-center text-sm text-secondary-color">Don&apos;t have an account? <Link href="/signup" className="font-semibold text-accent-primary hover:underline">Create one</Link></p>
          <p className="mt-10 text-center text-[11px] leading-relaxed text-tertiary-color">By continuing, you agree to use ScamCheck as an assistive verification tool and make your own final decisions.</p>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() { return <Suspense fallback={<div className="min-h-screen bg-app" />}><LoginForm /></Suspense>; }
