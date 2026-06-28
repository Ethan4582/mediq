"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Mail, Lock, CheckCircle2, ArrowRight } from "lucide-react";
import Spinner from "@/components/shared/Spinner";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) setError(error.message);
      else setError("Check your email for the confirmation link.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setError(error.message);
      else router.push("/chat"); // Redirect to chat on success
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
    <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center">
      {/* Outer wrapper to prevent ultra-wide distortion while keeping it full-screen feeling */}
      <div className="w-full h-full min-h-screen max-w-[1920px] relative flex items-center justify-center lg:justify-end overflow-hidden shadow-2xl bg-white">
        
        {/* Background Image Container */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: "url('/auth1.png')",
            backgroundSize: "contain",
            backgroundPosition: "left center",
            backgroundRepeat: "no-repeat",
            backgroundColor: "#ffffff"
          }}
        />
        
        {/* Auth Card Container */}
        <div className="relative z-10 w-full flex items-center justify-center lg:justify-end lg:pr-[10%] xl:pr-[12%] p-4 lg:p-12 h-full">
      <div
        className="w-full max-w-[440px] bg-white rounded-2xl p-8 shadow-xl border relative"
        style={{ borderColor: "var(--border-default)" }}
      >
        <div className="mb-8">
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            {isSignUp ? "Create an account" : "Welcome back"}
          </h2>
          <p className="text-sm mt-1.5" style={{ color: "var(--text-secondary)" }}>
            {isSignUp ? "Sign up to get started with MediQ" : "Sign in to continue to MediQ"}
          </p>
        </div>

        <div className="space-y-6">
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-2 border rounded-xl py-2.5 text-sm font-medium transition-colors hover:bg-gray-50"
            style={{ borderColor: "var(--border-default)", color: "var(--text-primary)" }}
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
            Continue with Google
          </button>

          <div className="relative flex items-center">
            <div className="flex-grow border-t" style={{ borderColor: "var(--border-default)" }}></div>
            <span className="shrink-0 px-4 text-xs" style={{ color: "var(--text-muted)" }}>or</span>
            <div className="flex-grow border-t" style={{ borderColor: "var(--border-default)" }}></div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail size={16} />
                </div>
                <Input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-11 rounded-xl bg-gray-50/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={16} />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10 h-11 rounded-xl bg-gray-50/50"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {!isSignUp && (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                  <span className="text-sm text-gray-600 cursor-pointer">Remember me</span>
                </label>
                <a href="#" className="text-sm font-medium text-blue-600 hover:underline">Forgot password?</a>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl text-base font-medium flex items-center justify-center gap-2 mt-2"
              style={{ background: "var(--brand-primary)", color: "#fff" }}
            >
              {loading && <Spinner />}
              {isSignUp ? "Sign up" : "Sign in"}
              {!loading && <ArrowRight size={16} />}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
              className="font-medium text-blue-600 hover:underline"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </div>
      </div>
      
      {/* Absolute positioned secure text matching the design below the card */}
      <div className="absolute bottom-10 lg:bottom-16 lg:right-[15%] w-full max-w-[440px] flex items-center justify-center gap-2 text-sm text-gray-500 font-medium">
        <CheckCircle2 size={16} className="text-gray-400" />
        Your data is secure with MediQ
      </div>
      </div>
      </div>
    </div>
  );
}
