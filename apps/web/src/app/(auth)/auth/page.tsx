"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Mail, Lock, CheckCircle2 } from "lucide-react";
import Spinner from "@/components/shared/Spinner";

function AuthForm() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const displayError = authError !== null ? authError : errorParam || "";

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) setAuthError(error.message);
      else setAuthError("Check your email for the confirmation link.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setAuthError(error.message);
      else router.push("/chat");
    }
    setLoading(false);
  };

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div
      className="min-h-screen relative flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/hero_bg.png')" }}
    >
      <div className="w-full max-w-[440px] bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-2xl border relative z-10" style={{ borderColor: "var(--border-default)" }}>
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-3">
            <Image
              src="/logo.png"
              alt="MediQ"
              width={42}
              height={42}
              className="rounded-xl object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            {isSignUp ? "Create an account" : "Welcome back"}
          </h2>
          <p className="text-sm mt-1.5" style={{ color: "var(--text-secondary)" }}>
            {isSignUp ? "Sign up to get started with MediQ" : "Sign in to continue to MediQ"}
          </p>
        </div>

        <div className="space-y-5">
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={googleLoading}
            className="w-full h-9.5 flex items-center justify-center gap-2 border rounded-lg text-xs font-medium transition-colors hover:bg-gray-50 cursor-pointer"
            style={{ borderColor: "var(--border-default)", color: "var(--text-primary)" }}
          >
            {googleLoading ? (
              <Spinner />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Continue with Google
          </button>

          <div className="relative flex items-center">
            <div className="flex-grow border-t" style={{ borderColor: "var(--border-default)" }}></div>
            <span className="shrink-0 px-4 text-xs" style={{ color: "var(--text-muted)" }}>or</span>
            <div className="flex-grow border-t" style={{ borderColor: "var(--border-default)" }}></div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail size={15} />
                </div>
                <Input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-9.5 text-xs rounded-lg bg-gray-50/50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={15} />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10 h-9.5 text-xs rounded-lg bg-gray-50/50"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {!isSignUp && (
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                  <span className="text-xs text-gray-600 cursor-pointer">Remember me</span>
                </label>
                <a href="#" className="text-xs font-medium text-blue-600 hover:underline">Forgot password?</a>
              </div>
            )}

            {displayError && (
              <p className="text-xs text-red-500 text-center">{displayError}</p>
            )}

            <div className="pt-1.5">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-9 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer shadow-xs hover:opacity-95 transition-all"
                style={{ background: "var(--brand-primary)", color: "#fff" }}
              >
                {loading && <Spinner />}
                {isSignUp ? "Sign up" : "Sign in"}
                {!loading && (
                  <Image
                    src="/arrow-alt-lright-alt.svg"
                    alt=""
                    width={14}
                    height={14}
                    className="size-3 brightness-0 invert"
                  />
                )}
              </Button>
            </div>
          </form>

          <p className="text-center text-sm text-gray-600">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setAuthError("");
              }}
              className="font-medium text-blue-600 hover:underline cursor-pointer"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500 font-medium w-full">
          <CheckCircle2 size={16} className="text-gray-400" />
          Your data is secure with MediQ
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center"><Spinner /></div>}>
      <AuthForm />
    </Suspense>
  );
}
