"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); const [isLoading, setIsLoading] = useState(false); const [errorMessage, setErrorMessage] = useState<string | null>(null); const [isSuccessEmailConfirmation, setIsSuccessEmailConfirmation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErrorMessage(null);
    if (!fullName.trim()) return setErrorMessage("Please enter your full name.");
    if (!email.trim() || !email.includes("@") || !email.includes(".")) return setErrorMessage("Please enter a valid email address.");
    if (password.length < 6) return setErrorMessage("Password must be at least 6 characters long.");
    if (password !== confirmPassword) return setErrorMessage("Passwords do not match. Please re-enter.");
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: fullName.trim() }, emailRedirectTo: `${window.location.origin}/auth/callback` } });
      if (error) {
        const message = error.message.toLowerCase();
        if (message.includes("already registered") || message.includes("unique")) setErrorMessage("An account with this email already exists. Please sign in.");
        else if (message.includes("password")) setErrorMessage("Password is too weak. Please use a stronger password.");
        else setErrorMessage(error.message || "Failed to create account. Please try again.");
        setIsLoading(false); return;
      }
      if (data?.user && !data?.session) { setIsSuccessEmailConfirmation(true); setIsLoading(false); } else { router.push("/dashboard"); router.refresh(); }
    } catch { setErrorMessage("A network error occurred. Please try again."); setIsLoading(false); }
  };

  const handleGoogleSignUp = async () => {
    setErrorMessage(null);
    try { const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` } }); if (error) setErrorMessage("Google sign-in is not configured yet."); }
    catch { setErrorMessage("Google sign-in is not configured yet."); }
  };

  return (
    <div className="min-h-screen bg-app text-primary-color grid lg:grid-cols-2">
      <section className="hidden lg:flex relative surface-grid bg-primary-color text-[var(--bg-primary)] p-12 xl:p-20 flex-col justify-between overflow-hidden">
        <div className="absolute -right-32 -bottom-32 w-[520px] h-[520px] rounded-full border border-accent-primary/20" />
        <Link href="/" className="relative flex items-center gap-3 w-fit"><span className="w-10 h-10 rounded-xl bg-accent-primary text-[#07100c] flex items-center justify-center"><ShieldCheck className="w-5 h-5"/></span><span className="font-semibold text-lg">ScamCheck</span></Link>
        <div className="relative max-w-lg">
          <div className="flex items-center gap-2 text-accent-primary text-xs font-semibold uppercase tracking-[.18em]"><Sparkles className="w-4 h-4"/> Start with a safer workflow</div>
          <h1 className="mt-6 text-5xl xl:text-6xl font-semibold tracking-[-.055em] leading-[.95]">Make verification<br/>a habit.</h1>
          <p className="mt-7 text-[var(--text-secondary)] leading-relaxed max-w-md">Keep your opportunity checks in one place and investigate suspicious offers before you act.</p>
          <div className="mt-10 space-y-3 text-sm text-[var(--text-secondary)]"><div className="flex gap-3"><CheckCircle2 className="w-4 h-4 text-accent-primary shrink-0"/> Review links and supporting evidence</div><div className="flex gap-3"><CheckCircle2 className="w-4 h-4 text-accent-primary shrink-0"/> Compare company and recruiter signals</div><div className="flex gap-3"><CheckCircle2 className="w-4 h-4 text-accent-primary shrink-0"/> Understand the reasons behind risk flags</div></div>
        </div>
        <div className="relative text-xs text-[var(--text-tertiary)] flex items-center gap-2"><LockKeyhole className="w-3.5 h-3.5"/> Built as an assistive security tool.</div>
      </section>

      <main className="min-h-screen flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-tertiary-color hover:text-primary-color mb-10"><ArrowLeft className="w-3.5 h-3.5"/> Back to home</Link>
          {isSuccessEmailConfirmation ? (
            <div className="rounded-3xl border border-subtle bg-card p-8 sm:p-10 shadow-card text-center"><div className="w-14 h-14 rounded-2xl bg-accent-light text-accent-primary flex items-center justify-center mx-auto"><CheckCircle2 className="w-7 h-7"/></div><div className="text-xs uppercase tracking-[.18em] text-accent-primary font-semibold mt-7">Almost there</div><h2 className="mt-3 text-3xl font-semibold tracking-[-.045em]">Confirm your email.</h2><p className="mt-4 text-sm text-secondary-color leading-relaxed">We sent a verification link to <span className="font-medium text-primary-color">{email}</span>. Confirm it, then return to ScamCheck.</p><Link href="/login" className="btn-interaction mt-7 inline-flex items-center gap-2 rounded-xl bg-accent-primary text-white dark:text-[#07100c] px-5 py-3 text-sm font-semibold">Back to login <ArrowRight className="w-4 h-4"/></Link></div>
          ) : (
            <>
              <div className="mb-8"><div className="text-xs uppercase tracking-[.18em] text-accent-primary font-semibold">Create account</div><h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-[-.045em]">Your safer workflow starts here.</h2><p className="mt-3 text-sm text-secondary-color">Create an account to access your ScamCheck workspace.</p></div>
              {errorMessage && <div className="mb-5 p-3.5 rounded-xl bg-danger-light border border-danger-light text-danger-color text-sm flex gap-2.5"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5"/><span>{errorMessage}</span></div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><label htmlFor="fullName" className="block text-xs font-semibold mb-2">Full name</label><input id="fullName" type="text" required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Alex Rivera" className="w-full h-12 rounded-xl border border-subtle bg-card px-4 text-sm outline-none focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/10 transition-all"/></div>
                <div><label htmlFor="signupEmail" className="block text-xs font-semibold mb-2">Email address</label><input id="signupEmail" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@university.edu" className="w-full h-12 rounded-xl border border-subtle bg-card px-4 text-sm outline-none focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/10 transition-all"/></div>
                <div><label htmlFor="signupPassword" className="block text-xs font-semibold mb-2">Password</label><div className="relative"><input id="signupPassword" type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" className="w-full h-12 rounded-xl border border-subtle bg-card px-4 pr-12 text-sm outline-none focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/10 transition-all"/><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-0 h-12 w-12 flex items-center justify-center text-tertiary-color hover:text-primary-color">{showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}</button></div></div>
                <div><label htmlFor="confirmPassword" className="block text-xs font-semibold mb-2">Confirm password</label><input id="confirmPassword" type={showPassword ? "text" : "password"} required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat your password" className="w-full h-12 rounded-xl border border-subtle bg-card px-4 text-sm outline-none focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/10 transition-all"/></div>
                <button type="submit" disabled={isLoading} className="btn-interaction w-full h-12 rounded-xl bg-accent-primary text-white dark:text-[#07100c] font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60">{isLoading ? "Creating account…" : <>Create account <ArrowRight className="w-4 h-4"/></>}</button>
              </form>
              <div className="my-7 flex items-center gap-3 text-[11px] text-tertiary-color"><span className="h-px flex-1 bg-subtle"/><span>OR</span><span className="h-px flex-1 bg-subtle"/></div>
              <button type="button" onClick={handleGoogleSignUp} className="w-full h-12 rounded-xl border border-subtle bg-card hover:bg-muted-custom text-sm font-semibold transition-colors flex items-center justify-center gap-2"><span className="w-5 h-5 rounded-full border border-subtle flex items-center justify-center text-[10px] font-bold">G</span> Continue with Google</button>
              <p className="mt-7 text-center text-sm text-secondary-color">Already have an account? <Link href="/login" className="font-semibold text-accent-primary hover:underline">Sign in</Link></p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
