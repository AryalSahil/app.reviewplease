import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Lock, 
  Check, 
  Sparkles, 
  CreditCard, 
  Smartphone, 
  User as UserIcon, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Loader2,
  MessageSquare
} from "lucide-react";
import { db } from "../lib/firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { User as AppUser } from "../types";

interface ProLockOverlayProps {
  user: AppUser;
  featureName: string;
  onUpgradeSuccess: (newPlan: string) => void;
}

export default function ProLockOverlay({ user, featureName, onUpgradeSuccess }: ProLockOverlayProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card">("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"billing" | "processing" | "success">("billing");

  const handleStartCheckout = () => {
    setShowPaymentModal(true);
  };

  const handleSimulatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setPaymentStep("processing");

    // Simulate standard card/UPI latency
    setTimeout(async () => {
      try {
        const paymentId = "pay_" + Math.random().toString(36).substring(2, 11).toUpperCase();
        const invoiceId = "INV-" + new Date().getFullYear() + "-" + Math.floor(Math.random() * 9000 + 1000);
        const subPeriod = "Monthly (" + new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) + ")";

        // 1. Save payment record to Firestore 'payments'
        const paymentData = {
          id: paymentId,
          userId: user.id,
          userEmail: user.email,
          userName: user.name || "Tenant",
          amount: 99,
          currency: "INR",
          status: "Succeeded",
          method: paymentMethod === "upi" ? `UPI (${upiId || "customer@okaxis"})` : "Credit/Debit Card",
          invoiceId: invoiceId,
          subscriptionPeriod: subPeriod,
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, "payments", paymentId), paymentData);

        // 2. Save billing invoice record to 'billing'
        const invoiceData = {
          id: invoiceId,
          userId: user.id,
          date: new Date().toISOString().split("T")[0],
          amount: 99,
          status: "Paid" as const,
          plan: "Pro Plan (Monthly)"
        };
        await setDoc(doc(db, "billing", invoiceId), invoiceData);

        // 3. Update User document plan in Firestore
        await updateDoc(doc(db, "users", user.id), {
          plan: "Pro"
        });

        // 4. Update BusinessProfile plan in Firestore
        await updateDoc(doc(db, "businesses", user.id), {
          plan: "Pro"
        }).catch((err) => console.log("Business profile might not exist yet, skipping:", err));

        setPaymentStep("success");
        setIsProcessing(false);
      } catch (error) {
        console.error("Failed to complete simulated checkout in Firestore:", error);
        setIsProcessing(false);
        setPaymentStep("billing");
        alert("Payment simulated successfully but failed to update Firestore profile. Please verify your permissions.");
      }
    }, 2000);
  };

  const handleFinalizeUpgrade = () => {
    setShowPaymentModal(false);
    onUpgradeSuccess("Pro");
  };

  const proFeatures = [
    { title: "Unlimited QR Codes", desc: "Place separate codes at every table, counter, and room." },
    { title: "Sleek Theme Builder", desc: "Fully customize background colors, gradients, and custom business logos." },
    { title: "Gemini AI Review Assistant", desc: "Unlock custom ideas and polish feedback text in multiple languages." },
    { title: "Google Review Direct Router", desc: "Route high-rating reviews straight to your business maps page." },
    { title: "Custom Branding", desc: "Completely remove ReviewPlease labels on public portal pages." },
    { title: "Advanced QR Analytics", desc: "Track exact scans and review completion metrics per placement." },
    { title: "Multi-Language Support", desc: "Translate dynamic prompts to English, Hindi, Hinglish, Spanish." },
    { title: "Priority Email Support", desc: "Get dedicated 24/7 technical and print deployment support." }
  ];

  return (
    <div className="relative w-full rounded-2xl border border-zinc-900 bg-[#070707] p-8 md:p-12 overflow-hidden flex flex-col items-center justify-center text-center">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Lock Icon Emblem */}
      <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-950/30 border border-emerald-500/20 text-emerald-400">
        <Lock className="h-7 w-7" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-black text-black">PRO</span>
      </div>

      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 font-mono mb-2">Exclusive Pro Capability</span>
      <h3 className="text-2xl md:text-3xl font-serif text-white italic leading-tight">
        Unlock {featureName}
      </h3>
      <p className="mt-2 text-sm text-zinc-400 max-w-lg leading-relaxed">
        You are currently on the <span className="text-zinc-200 font-bold">Free Plan</span>. Upgrade to our Premium Pro Plan today to remove limits and unlock beautiful custom feedback portals.
      </p>

      {/* Pricing Tag */}
      <div className="mt-6 inline-flex flex-col items-center bg-zinc-950 border border-zinc-900 px-6 py-3.5 rounded-2xl font-mono">
        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Premium Subscription</span>
        <div className="flex items-baseline mt-1 space-x-1">
          <span className="text-3xl font-bold text-white">₹99</span>
          <span className="text-sm text-zinc-400">/ month</span>
        </div>
        <span className="text-[9px] text-zinc-600 mt-1">Cancel anytime • Zero hidden fees</span>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full max-w-md">
        <button
          onClick={handleStartCheckout}
          className="w-full py-3 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg active:scale-95"
        >
          <Zap className="w-4 h-4 text-emerald-600 fill-emerald-500" />
          <span>Upgrade to Pro Now • ₹99</span>
        </button>
      </div>

      {/* Pro Plan Feature Grid */}
      <div className="mt-16 w-full max-w-4xl text-left border-t border-zinc-900 pt-10">
        <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 text-center mb-8 font-mono">Everything included in Pro</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {proFeatures.map((feat, idx) => (
            <div key={idx} className="flex space-x-3.5 bg-zinc-950/35 border border-zinc-900/40 p-4 rounded-xl">
              <div className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-950/40 border border-emerald-900/30 text-emerald-400">
                <Check className="h-3.5 w-3.5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white font-sans">{feat.title}</h5>
                <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Simulation Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#0a0a0a] border border-zinc-900 rounded-3xl p-6 overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 right-0 p-4">
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="text-zinc-500 hover:text-white font-bold text-sm"
                >
                  Cancel
                </button>
              </div>

              {paymentStep === "billing" && (
                <form onSubmit={handleSimulatePayment} className="space-y-5 text-left">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-mono font-bold block">Production-Ready Gateway Simulator</span>
                    <h3 className="text-lg font-serif italic text-white mt-1">ReviewPlease Checkout</h3>
                    <p className="text-xs text-zinc-400 mt-1">Complete your subscription setup with INR localized billing details.</p>
                  </div>

                  {/* Summary Box */}
                  <div className="bg-zinc-950 border border-zinc-900 p-3.5 rounded-xl flex justify-between items-center text-xs font-mono">
                    <div>
                      <span className="text-white font-bold block">Pro Subscription (1 Month)</span>
                      <span className="text-zinc-500 text-[10px]">Auto-renews at ₹99/mo</span>
                    </div>
                    <span className="text-emerald-400 font-bold text-sm">₹99.00</span>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("upi")}
                      className={`py-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-1.5 transition-all ${
                        paymentMethod === "upi" 
                          ? "border-emerald-500 bg-emerald-950/10 text-white" 
                          : "border-zinc-900 bg-black text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>UPI Payment (Instant)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`py-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-1.5 transition-all ${
                        paymentMethod === "card" 
                          ? "border-emerald-500 bg-emerald-950/10 text-white" 
                          : "border-zinc-900 bg-black text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Card (Debit/Credit)</span>
                    </button>
                  </div>

                  {/* Form fields based on selected method */}
                  {paymentMethod === "upi" ? (
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Enter UPI ID</label>
                      <input
                        type="text"
                        required
                        placeholder="yourname@okhdfcbank"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 text-white rounded-xl text-xs font-mono placeholder-zinc-700 focus:outline-none focus:border-emerald-500"
                      />
                      <span className="text-[9px] text-zinc-600 block">Accepted handles: @okaxis, @okhdfcbank, @paytm, @okicici etc.</span>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Card Number</label>
                        <input
                          type="text"
                          required
                          placeholder="4111 2222 3333 4444"
                          maxLength={19}
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                          className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 text-white rounded-xl text-xs font-mono placeholder-zinc-700 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3.5">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Expiry Date</label>
                          <input
                            type="text"
                            required
                            placeholder="MM/YY"
                            maxLength={5}
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 text-white rounded-xl text-xs font-mono placeholder-zinc-700 text-center focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">CVV Code</label>
                          <input
                            type="password"
                            required
                            placeholder="***"
                            maxLength={3}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 text-white rounded-xl text-xs font-mono placeholder-zinc-700 text-center focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl flex items-center justify-center space-x-2 transition-all mt-4"
                  >
                    <span>Authorize INR ₹99.00 Payment</span>
                  </button>

                  <div className="flex items-center justify-center space-x-2 text-[10px] text-zinc-500 font-mono mt-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Secure 256-Bit Encrypted Sandbox Routing</span>
                  </div>
                </form>
              )}

              {paymentStep === "processing" && (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                  <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                  <div>
                    <h4 className="text-sm font-bold text-white font-mono">Routing to Payment Gateway...</h4>
                    <p className="text-xs text-zinc-500 mt-1">Acquiring merchant token and verifying balance details.</p>
                  </div>
                </div>
              )}

              {paymentStep === "success" && (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-5">
                  <div className="h-16 w-16 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center animate-bounce">
                    <Check className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-serif italic text-white">Payment Received!</h4>
                    <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                      Your subscription is now upgraded successfully to the <span className="text-white font-bold">Pro Plan</span>.
                    </p>
                  </div>

                  <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl text-left w-full space-y-2 text-[11px] font-mono">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Transaction ID:</span>
                      <span className="text-white">PAY-TX-{Math.floor(Math.random() * 90000 + 10000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Charged Amount:</span>
                      <span className="text-emerald-400">₹99.00 INR</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Account status:</span>
                      <span className="text-white uppercase font-bold">PRO Enabled</span>
                    </div>
                  </div>

                  <button
                    onClick={handleFinalizeUpgrade}
                    className="w-full py-2.5 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-xl transition-all"
                  >
                    Continue to Dashboard
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
