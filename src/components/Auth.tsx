import React, { useState } from "react";
import { motion } from "motion/react";
import { Star, Mail, Lock, User as UserIcon, Shield, CheckCircle2, ArrowRight } from "lucide-react";
import { User } from "../types";

interface AuthProps {
  onLogin: (user: User) => void;
}

export default function Auth({ onLogin }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("owner@sweetbites.com");
  const [password, setPassword] = useState("password123");
  const [name, setName] = useState("Sarah Jenkins");
  const [businessName, setBusinessName] = useState("Sweet Bites Bakery");
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [forgotEmailSent, setForgotEmailSent] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    setTimeout(() => {
      if (forgotPasswordMode) {
        setForgotEmailSent(true);
        setIsLoading(false);
        return;
      }

      if (!email || !password) {
        setError("Please fill in all fields.");
        setIsLoading(false);
        return;
      }

      const mockUser: User = {
        id: "usr_" + Math.random().toString(36).substr(2, 9),
        email,
        name: isLogin ? "Sarah Jenkins" : name,
        businessName: isLogin ? "Sweet Bites Bakery" : businessName,
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120",
        plan: "Pro",
        role: "Owner",
      };

      onLogin(mockUser);
      setIsLoading(false);
    }, 1000);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      const mockUser: User = {
        id: "usr_google",
        email: "sarah.j@gmail.com",
        name: "Sarah Jenkins",
        businessName: "Sweet Bites Bakery",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120",
        plan: "Pro",
        role: "Owner",
      };
      onLogin(mockUser);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div id="auth-page" className="min-h-screen bg-[#050505] text-[#e0e0e0] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto w-full max-w-md">
        <div className="flex items-center justify-center space-x-2">
          <div className="bg-[#1a1a1a] p-2 rounded-xl border border-[#333] text-white">
            <Star className="h-6 w-6 fill-white text-emerald-400" />
          </div>
          <span className="text-3xl font-serif italic tracking-tight text-white">
            ReviewPlease
          </span>
        </div>
        <h2 className="mt-6 text-center text-2xl font-serif text-white">
          {forgotPasswordMode
            ? "Reset your password"
            : isLogin
            ? "Sign in to your dashboard"
            : "Get started with ReviewPlease"}
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-500">
          {forgotPasswordMode ? (
            <button
              id="back-to-login-btn"
              onClick={() => {
                setForgotPasswordMode(false);
                setForgotEmailSent(false);
              }}
              className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Back to sign in
            </button>
          ) : isLogin ? (
            <>
              Or{" "}
              <button
                id="toggle-signup-btn"
                onClick={() => setIsLogin(false)}
                className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                create a new free trial account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                id="toggle-login-btn"
                onClick={() => setIsLogin(true)}
                className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Sign in instead
              </button>
            </>
          )}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto w-full sm:max-w-md px-4 sm:px-0">
        <motion.div
          id="auth-card"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0c0c0c] border border-[#1a1a1a] py-8 px-4 shadow-2xl rounded-2xl sm:px-10"
        >
          {forgotEmailSent ? (
            <div id="forgot-success-message" className="text-center py-4">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400 mb-4" />
              <h3 className="text-lg font-serif text-white">
                Check your email
              </h3>
              <p className="mt-2 text-sm text-zinc-400">
                We've sent a temporary password reset link to <span className="font-semibold text-white">{email}</span>.
              </p>
              <button
                id="return-to-signin-btn"
                onClick={() => {
                  setForgotPasswordMode(false);
                  setForgotEmailSent(false);
                }}
                className="mt-6 w-full flex justify-center py-2.5 px-4 border border-[#1a1a1a] rounded-xl text-sm font-semibold text-zinc-300 hover:bg-[#111] transition-colors"
              >
                Return to Sign In
              </button>
            </div>
          ) : (
            <form id="auth-form" className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div id="auth-error" className="p-3 bg-rose-950/20 text-rose-400 rounded-xl text-xs font-medium border border-rose-900/40">
                  {error}
                </div>
              )}

              {!isLogin && !forgotPasswordMode && (
                <>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Full Name
                    </label>
                    <div className="mt-1.5 relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                        <UserIcon className="h-4 w-4" />
                      </div>
                      <input
                        id="signup-name-input"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Sarah Jenkins"
                        className="block w-full pl-10 pr-3 py-2.5 bg-[#050505] border border-[#1a1a1a] rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Business Name
                    </label>
                    <div className="mt-1.5 relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                        <Shield className="h-4 w-4" />
                      </div>
                      <input
                        id="signup-business-input"
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Sweet Bites Bakery"
                        className="block w-full pl-10 pr-3 py-2.5 bg-[#050505] border border-[#1a1a1a] rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Email address
                </label>
                <div className="mt-1.5 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="auth-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@sweetbites.com"
                    className="block w-full pl-10 pr-3 py-2.5 bg-[#050505] border border-[#1a1a1a] rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {!forgotPasswordMode && (
                <div>
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Password
                    </label>
                    {isLogin && (
                      <button
                        id="forgot-password-link"
                        type="button"
                        onClick={() => setForgotPasswordMode(true)}
                        className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="mt-1.5 relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      id="auth-password-input"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-10 pr-3 py-2.5 bg-[#050505] border border-[#1a1a1a] rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <button
                  id="auth-submit-btn"
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl text-sm font-semibold text-black bg-white hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Authenticating...
                    </span>
                  ) : forgotPasswordMode ? (
                    "Send reset instructions"
                  ) : isLogin ? (
                    "Sign In"
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>

              {!forgotPasswordMode && (
                <>
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#1a1a1a]"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                      <span className="px-2 bg-[#0c0c0c] text-zinc-500 font-medium">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <button
                      id="google-login-btn"
                      type="button"
                      onClick={handleGoogleLogin}
                      className="w-full flex items-center justify-center py-2.5 px-4 border border-[#1a1a1a] rounded-xl bg-[#080808] text-sm font-semibold text-zinc-300 hover:bg-[#111] transition-colors"
                    >
                      <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.1-.13-.2-.27-.27-.41z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                      </svg>
                      Google
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </motion.div>

        {isLogin && !forgotPasswordMode && (
          <div className="mt-4 text-center">
            <span className="text-xs text-zinc-500">
              Demo credentials: <span className="font-mono text-emerald-400 font-bold">owner@sweetbites.com</span> / <span className="font-mono text-emerald-400 font-bold">password123</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
