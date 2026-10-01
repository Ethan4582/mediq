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
      <div className="w-full max-w-[440px] sm:max-w-[460px] bg-white/95 backdrop-blur-md rounded-3xl p-8 sm:p-9 shadow-2xl border relative z-10" style={{ borderColor: "var(--border-default)" }}>
        <div className="mb-6 text-center">
          <div className="flex justify-center mb-3">
            <div className="size-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="MediQ"
                width={24}
                height={24}
                style={{ width: "24px", height: "auto" }}
                className="object-contain"
                priority
              />
            </div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            {isSignUp ? "Sign up with email" : "Sign in with email"}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1.5 leading-normal">
            {isSignUp ? "Create an account to bring clinical intelligence together." : "Clinical discharge records and synthesis for healthcare teams."}
          </p>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-3.5">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Mail size={16} />
            </div>
            <Input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-11 text-sm rounded-xl bg-gray-50/70 border-gray-200"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Lock size={16} />
            </div>
            <Input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 h-11 text-sm rounded-xl bg-gray-50/70 border-gray-200"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {!isSignUp && (
            <div className="flex items-center justify-end pt-0.5">
              <a href="#" className="text-xs font-medium text-gray-600 hover:text-primary transition-colors">
                Forgot password?
              </a>
            </div>
          )}

          {displayError && (
            <p className="text-xs text-red-500 text-center">{displayError}</p>
          )}

          <div className="pt-1.5">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:opacity-95 transition-all bg-[#1e2433] hover:bg-[#151924] text-white"
            >
              {loading && <Spinner />}
              {isSignUp ? "Get Started" : "Sign in"}
              {!loading && (
                <Image
                  src="/arrow-alt-lright-alt.svg"
                  alt=""
                  width={14}
                  height={14}
                  className="size-3.5 brightness-0 invert"
                />
              )}
            </Button>
          </div>
        </form>

        <div className="relative flex items-center my-5">
          <div className="flex-grow border-t border-dashed border-gray-200"></div>
          <span className="shrink-0 px-3 text-xs text-gray-400">Or sign in with</span>
          <div className="flex-grow border-t border-dashed border-gray-200"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={googleLoading}
          className="w-full h-11 flex items-center justify-center gap-2.5 border border-gray-200 rounded-xl text-sm font-medium transition-colors hover:bg-gray-50 cursor-pointer text-gray-700 bg-white shadow-2xs"
        >
          {googleLoading ? (
            <Spinner />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
          <span>Continue with Google</span>
        </button>

        <p className="text-center text-xs text-gray-500 mt-4">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setAuthError("");
            }}
            className="font-semibold text-primary hover:underline cursor-pointer"
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-400 font-medium w-full">
          <CheckCircle2 size={14} className="text-gray-400" />
          <span>Your data is secure with MediQ</span>
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
