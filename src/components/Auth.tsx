import React, { useState } from "react";
import { motion } from "motion/react";
import { Star, Mail, Lock, User as UserIcon, Shield, CheckCircle2, ArrowRight } from "lucide-react";
import { User } from "../types";
import { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  googleProvider,
  sendPasswordResetEmail,
  db,
  doc,
  setDoc,
  getDoc
} from "../lib/firebase";

interface AuthProps {
  onLogin: (user: User) => void;
  onAdminAccess?: () => void;
}

export default function Auth({ onLogin, onAdminAccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [forgotEmailSent, setForgotEmailSent] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (forgotPasswordMode) {
        if (!email) {
          setError("Please enter your email address.");
          setIsLoading(false);
          return;
        }
        await sendPasswordResetEmail(auth, email);
        setForgotEmailSent(true);
        setIsLoading(false);
        return;
      }

      if (!email || !password) {
        setError("Please fill in all fields.");
        setIsLoading(false);
        return;
      }

      if (isLogin) {
        // Sign in with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        // Fetch user doc from Firestore
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        let appUser: User;
        if (userDocSnap.exists()) {
          appUser = userDocSnap.data() as User;
        } else {
          // Fallback if auth exists but no doc
          appUser = {
            id: firebaseUser.uid,
            email: firebaseUser.email || email,
            name: firebaseUser.displayName || email.split("@")[0],
            businessName: "My Business",
            avatar: firebaseUser.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120",
            plan: "Free",
            role: "Owner",
          };
          await setDoc(userDocRef, appUser);
        }

        // Special case: make sure certain emails are designated as admins
        if (email === "admin@reviewplease.ai" || email === "sahil265064@gmail.com") {
          if (appUser.role !== "Admin") {
            appUser.role = "Admin";
            await setDoc(userDocRef, appUser, { merge: true });
          }
        }

        onLogin(appUser);
      } else {
        // Sign up with Firebase Auth
        if (!name || !businessName) {
          setError("Please provide your name and business name.");
          setIsLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        // Create new User profile doc
        const isDefaultAdmin = email === "admin@reviewplease.ai" || email === "sahil265064@gmail.com";
        const newAppUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || email,
          name: name,
          businessName: businessName,
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120",
          plan: "Pro",
          role: isDefaultAdmin ? "Admin" : "Owner",
        };

        await setDoc(doc(db, "users", firebaseUser.uid), newAppUser);

        // Initialize default business profile in database
        const defaultProfile = {
          id: firebaseUser.uid,
          name: businessName,
          logo: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=120",
          category: "Bakery & Cafe",
          address: "128 Gourmet Ave, Suite A, San Francisco, CA 94107",
          phone: "(415) 555-8931",
          website: "https://www.sweetbitesbakery.com",
          googleReviewLink: "https://g.page/r/sweet-bites-sf/review",
          hours: "Mon-Sat: 7:00 AM - 6:00 PM, Sun: 8:00 AM - 4:00 PM",
          socials: {
            facebook: "https://facebook.com",
            instagram: "https://instagram.com",
            twitter: "https://twitter.com",
            linkedin: "https://linkedin.com"
          },
          userId: firebaseUser.uid
        };
        await setDoc(doc(db, "businesses", firebaseUser.uid), defaultProfile);

        onLogin(newAppUser);
      }
    } catch (err: any) {
      console.error("Authentication error:", err);
      let errMsg = "An error occurred during authentication.";
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        errMsg = "Invalid email or password.";
      } else if (err.code === "auth/email-already-in-use") {
        errMsg = "This email is already in use.";
      } else if (err.code === "auth/weak-password") {
        errMsg = "Password is too weak. Please use at least 6 characters.";
      } else if (err.message) {
        errMsg = err.message;
      }
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      let appUser: User;
      if (userDocSnap.exists()) {
        appUser = userDocSnap.data() as User;
      } else {
        const isDefaultAdmin = firebaseUser.email === "admin@reviewplease.ai" || firebaseUser.email === "sahil265064@gmail.com";
        appUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: firebaseUser.displayName || "Google User",
          businessName: "My Business",
          avatar: firebaseUser.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120",
          plan: "Pro",
          role: isDefaultAdmin ? "Admin" : "Owner",
        };
        await setDoc(userDocRef, appUser);

        // Also seed initial business doc for Google user
        const defaultProfile = {
          id: firebaseUser.uid,
          name: "My Business",
          logo: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=120",
          category: "Retail Business",
          address: "Main Street, USA",
          phone: "(555) 555-5555",
          website: "https://example.com",
          googleReviewLink: "https://google.com",
          hours: "Mon-Fri: 9:00 AM - 5:00 PM",
          socials: {
            facebook: "https://facebook.com",
            instagram: "https://instagram.com",
            twitter: "https://twitter.com",
            linkedin: "https://linkedin.com"
          },
          userId: firebaseUser.uid
        };
        await setDoc(doc(db, "businesses", firebaseUser.uid), defaultProfile);
      }

      onLogin(appUser);
    } catch (err: any) {
      console.error("Google Auth error:", err);
      if (err.code === "auth/unauthorized-domain" || (err.message && err.message.includes("unauthorized-domain"))) {
        setError(`This domain (${window.location.hostname}) is not authorized for Google Sign-In in your Firebase project. To enable Google Sign-In, please add this domain to the "Authorized Domains" list under Authentication > Settings in your Firebase Console. Alternatively, you can use standard Email & Password sign-in/registration below instantly!`);
      } else {
        setError(err.message || "Failed to sign in with Google.");
      }
    } finally {
      setIsLoading(false);
    }
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
                        required={!isLogin}
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
                        required={!isLogin}
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
          <div className="mt-4 text-center space-y-3">
            {onAdminAccess && (
              <button
                type="button"
                onClick={onAdminAccess}
                className="inline-flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold hover:text-emerald-300 transition-colors uppercase tracking-wider bg-emerald-950/20 border border-emerald-900/40 py-1.5 px-4 rounded-xl cursor-pointer"
              >
                <span>🔐 Access Super Admin Panel</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
