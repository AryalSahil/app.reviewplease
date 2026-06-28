import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Star, 
  Sparkles, 
  Check, 
  Copy, 
  ArrowLeft, 
  ExternalLink, 
  MessageSquare, 
  Globe, 
  Phone, 
  MapPin, 
  Lock, 
  ArrowRight, 
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Instagram,
  Facebook
} from "lucide-react";
import { QRCodeItem, BusinessProfile, Review, ThemeConfig } from "../types";

// Standard Fallback Theme Configuration (Classic Slate)
const DEFAULT_THEME: ThemeConfig = {
  id: "classic",
  name: "Classic Slate",
  logo: "",
  coverBanner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
  businessName: "",
  tagline: "Your experience means everything to us",
  description: "Please share your authentic review to help us keep growing and serving you better.",
  googleVerified: true,
  favicon: "",
  mode: "dark",
  bgType: "color",
  bgColor: "#09090b",
  bgGradient: "linear-gradient(135deg, #0f0c20 0%, #060608 100%)",
  bgImage: "",
  cardStyle: "solid",
  borderRadius: "lg",
  shadows: "md",
  primaryColor: "#10b981",
  secondaryColor: "#34d399",
  accentColor: "#f59e0b",
  buttonColor: "#10b981",
  buttonTextColor: "#ffffff",
  textColor: "#e4e4e7",
  cardBgColor: "#18181b",
  fontFamily: "Inter",
  fontSize: "md",
  fontWeight: "medium",
  buttonStyle: "rounded",
  iconStyle: "solid",
  welcomeTitle: "How was your experience today?",
  welcomeMessage: "Your feedback helps this business improve and helps other customers make informed decisions.",
  thankYouMessage: "Thank you for sharing your experience! We appreciate your support.",
  ctaButtonText: "Continue to Google Review",
  starColor: "#fbbf24",
  emojiStyle: "default",
  ratingLabels: {
    1: "Very Disappointed",
    2: "Disappointed",
    3: "Average / Neutral",
    4: "Good Experience",
    5: "Absolutely Outstanding!"
  },
  aiEnabled: true,
  aiSectionTitle: "AI Review Draft Assistant",
  aiGenerateBtnText: "Generate Custom Ideas",
  aiRewriteBtnText: "AI Polish Text",
  aiLanguageSelector: true,
  aiToneSelector: true,
  enabledLanguages: ["English", "Hindi", "Hinglish", "Spanish"],
  googleBtnText: "Continue to Google Review",
  googleBtnIcon: "Google",
  copyBtnText: "Copy Draft Review",
  visitWebsiteText: "Visit Website",
  callText: "Call Business",
  whatsappText: "WhatsApp Chat",
  directionsText: "Get Directions",
  socialLinks: {
    website: true,
    instagram: true,
    facebook: true,
    linkedin: false,
    whatsapp: true,
    youtube: false,
    x: false,
    maps: true
  },
  footerText: "Thank you for supporting our local business.",
  privacyLink: "#",
  termsLink: "#",
  hidePoweredBy: false
};

interface PublicReviewPageProps {
  businessProfile: BusinessProfile;
  qrCodes: QRCodeItem[];
  onAddReview: (review: Review) => void;
  uniqueId: string;
}

export default function PublicReviewPage({
  businessProfile,
  qrCodes,
  onAddReview,
  uniqueId
}: PublicReviewPageProps) {
  
  // Find matching QR Code or placement configuration
  const activeQR = qrCodes.find(
    q => q.id === uniqueId || 
         q.id === `qr_${uniqueId}` || 
         q.url.toLowerCase().endsWith(`/r/${uniqueId.toLowerCase()}`) || 
         q.url.toLowerCase().endsWith(`/review/${uniqueId.toLowerCase()}`)
  ) || qrCodes[0];

  // Resolve Business Theme Config from localStorage or fallback
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    try {
      const saved = localStorage.getItem("reviewplease_theme_config");
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_THEME,
          ...parsed,
          logo: parsed.logo || businessProfile.logo,
          businessName: parsed.businessName || businessProfile.name
        };
      }
    } catch (e) {
      console.error("Failed to parse saved theme config", e);
    }
    return {
      ...DEFAULT_THEME,
      logo: businessProfile.logo,
      businessName: businessProfile.name
    };
  });

  // Portal Interaction States
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [portalLanguage, setPortalLanguage] = useState<string>("English");
  const [step, setStep] = useState<"rating" | "feedback_positive" | "feedback_negative" | "submitted">("rating");
  
  // Review Drafting States
  const [editedText, setEditedText] = useState<string>("");
  const [aiTone, setAiTone] = useState<"friendly" | "professional" | "casual">("friendly");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  // Private Direct Feedback Form States
  const [directName, setDirectName] = useState("");
  const [directEmail, setDirectEmail] = useState("");
  const [directPhone, setDirectPhone] = useState("");
  const [directComments, setDirectComments] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Load Custom Font Styles dynamically if specified in custom theme settings
  useEffect(() => {
    if (theme.fontFamily) {
      const fontId = `google-font-${theme.fontFamily.replace(/ /g, "-")}`;
      if (!document.getElementById(fontId)) {
        const link = document.createElement("link");
        link.id = fontId;
        link.rel = "stylesheet";
        link.href = `https://fonts.googleapis.com/css2?family=${theme.fontFamily.replace(/ /g, "+")}:wght@400;500;600;700&display=swap`;
        document.head.appendChild(link);
      }
    }
  }, [theme.fontFamily]);

  // Track page scan views and analytics on load
  useEffect(() => {
    if (activeQR) {
      // 1. Increment scan counter inside State / local memory
      try {
        const savedQRs = localStorage.getItem("reviewplease_qrcodes");
        if (savedQRs) {
          const qrs = JSON.parse(savedQRs) as QRCodeItem[];
          const updated = qrs.map(q => q.id === activeQR.id ? { ...q, scans: q.scans + 1 } : q);
          localStorage.setItem("reviewplease_qrcodes", JSON.stringify(updated));
          activeQR.scans += 1;
        }
      } catch (err) {
        console.warn("Could not save scans count", err);
      }

      // 2. Log real Analytics point event to localStorage persistent buffer
      try {
        const analyticsRaw = localStorage.getItem("reviewplease_analytics_data");
        const analytics = analyticsRaw ? JSON.parse(analyticsRaw) : {
          pageViews: 0,
          scans: 0,
          reviewStarted: 0,
          reviewCompleted: 0,
          redirectClicks: 0
        };
        analytics.pageViews = (analytics.pageViews || 0) + 1;
        analytics.scans = (analytics.scans || 0) + 1;
        localStorage.setItem("reviewplease_analytics_data", JSON.stringify(analytics));
      } catch (err) {
        console.warn("Could not record analytics data point", err);
      }
    }
  }, [activeQR?.id]);

  // Handle setting default drafts on rating selection
  useEffect(() => {
    if (rating > 0) {
      // Record Review Started analytics event
      try {
        const analyticsRaw = localStorage.getItem("reviewplease_analytics_data");
        const analytics = analyticsRaw ? JSON.parse(analyticsRaw) : {};
        analytics.reviewStarted = (analytics.reviewStarted || 0) + 1;
        localStorage.setItem("reviewplease_analytics_data", JSON.stringify(analytics));
      } catch (e) {}

      const isPositive = rating >= (activeQR?.ratingRequired || 4);
      if (isPositive) {
        const defaultDraft = `I had an exceptional experience at ${theme.businessName || businessProfile.name}! The quality was outstanding, the service was welcoming, and I highly recommend them to everyone.`;
        setEditedText(defaultDraft);
        setAiSuggestions([defaultDraft]);
      } else {
        setEditedText("");
      }
    }
  }, [rating]);

  // Call Gemini API Proxy to Generate 3 suggestions
  const handleFetchAiSuggestions = async () => {
    setAiLoading(true);
    try {
      const response = await fetch("/api/gemini/suggest-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: rating,
          tone: aiTone,
          length: "medium",
          language: portalLanguage,
          extraDetails: `Customer left a high-quality ${rating}-star feedback review for our business.`,
          businessName: theme.businessName || businessProfile.name
        })
      });
      const data = await response.json();
      if (data.suggestions && Array.isArray(data.suggestions)) {
        setAiSuggestions(data.suggestions);
        setEditedText(data.suggestions[0]);
      }
    } catch (err) {
      console.warn("AI generation failed. Loading robust simulated suggestions instead.", err);
      // Fallback response suggestions
      const templates = [
        `Absolutely spectacular experience at ${theme.businessName || businessProfile.name}! The atmosphere is wonderful and the service exceeded my expectations. 10/10 recommend!`,
        `Extremely satisfied with ${theme.businessName || businessProfile.name}. The team was helpful, clean, and professional. I will definitely be coming back again.`,
        `Amazing service and beautiful presentation. Standard of excellence is truly maintained here.`
      ];
      setAiSuggestions(templates);
      setEditedText(templates[0]);
    } finally {
      setAiLoading(false);
    }
  };

  // Handle clipboard text copy
  const handleCopyReview = () => {
    navigator.clipboard.writeText(editedText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Submit direct private review (Negative gating routing)
  const handleSubmitPrivateFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directComments.trim()) return;

    setIsSubmittingFeedback(true);
    
    // Create new Direct Feed Review
    const newFeedbackReview: Review = {
      id: "rev_" + Math.random().toString(36).substr(2, 9),
      author: directName.trim() || "Anonymous Customer",
      rating: rating,
      text: directComments.trim(),
      date: new Date().toISOString().split("T")[0],
      source: "Direct Feed",
      location: activeQR?.name || "Permanent Landing Page",
      status: "pending"
    };

    setTimeout(() => {
      onAddReview(newFeedbackReview);
      
      // Track Analytics review completed
      try {
        const analyticsRaw = localStorage.getItem("reviewplease_analytics_data");
        const analytics = analyticsRaw ? JSON.parse(analyticsRaw) : {};
        analytics.reviewCompleted = (analytics.reviewCompleted || 0) + 1;
        localStorage.setItem("reviewplease_analytics_data", JSON.stringify(analytics));
      } catch (e) {}

      setIsSubmittingFeedback(false);
      setStep("submitted");
    }, 800);
  };

  // Confirm Redirect to Google Reviews Link
  const handleProceedToGoogle = () => {
    setShowConfirmModal(false);
    
    // Copy the edited/written text to clipboard automatically
    navigator.clipboard.writeText(editedText);

    // Track Analytics Continue clicks & completion
    try {
      const analyticsRaw = localStorage.getItem("reviewplease_analytics_data");
      const analytics = analyticsRaw ? JSON.parse(analyticsRaw) : {};
      analytics.redirectClicks = (analytics.redirectClicks || 0) + 1;
      analytics.reviewCompleted = (analytics.reviewCompleted || 0) + 1;
      localStorage.setItem("reviewplease_analytics_data", JSON.stringify(analytics));
    } catch (e) {}

    // Add public positive review to our dashboard table too
    const newPositiveReview: Review = {
      id: "rev_" + Math.random().toString(36).substr(2, 9),
      author: "Verified Customer",
      rating: rating,
      text: editedText || `Highly recommended positive feedback!`,
      date: new Date().toISOString().split("T")[0],
      source: "Google",
      location: activeQR?.name || "Permanent Landing Page",
      status: "pending"
    };
    onAddReview(newPositiveReview);

    // Open business's Google Review Link in a separate tab
    const targetUrl = businessProfile.googleReviewLink || "https://google.com";
    window.open(targetUrl, "_blank", "noopener,noreferrer");

    // Transition to Thank You page
    setStep("submitted");
  };

  // Font style resolvers
  const getFontFamilyStyle = () => {
    switch (theme.fontFamily) {
      case "Space Grotesk": return "'Space Grotesk', sans-serif";
      case "Outfit": return "'Outfit', sans-serif";
      case "Playfair Display": return "'Playfair Display', serif";
      case "JetBrains Mono": return "'JetBrains Mono', monospace";
      case "Roboto": return "'Roboto', sans-serif";
      default: return "'Inter', sans-serif";
    }
  };

  // Rounding styles
  const getCardRadiusStyle = () => {
    if (theme.borderRadius === "none") return "0px";
    if (theme.borderRadius === "sm") return "6px";
    if (theme.borderRadius === "md") return "12px";
    if (theme.borderRadius === "lg") return "20px";
    return "32px";
  };

  const getCardShadowStyle = () => {
    if (theme.shadows === "none") return "none";
    if (theme.shadows === "sm") return "0 2px 4px rgba(0,0,0,0.1)";
    if (theme.shadows === "md") return "0 8px 16px rgba(0,0,0,0.15)";
    return "0 20px 32px rgba(0,0,0,0.25)";
  };

  // Resolve Background Canvas styles
  const getPageBgStyle = () => {
    if (theme.bgType === "gradient") {
      return { background: theme.bgGradient };
    }
    if (theme.bgType === "image" && theme.bgImage) {
      return { 
        backgroundImage: `url(${theme.bgImage})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat"
      };
    }
    return { backgroundColor: theme.bgColor || "#09090b" };
  };

  // Card Content Style
  const getCardBodyStyle = () => {
    if (theme.cardStyle === "glass") {
      return {
        backgroundColor: "rgba(255, 255, 255, 0.06)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        backdropFilter: "blur(16px)",
        borderRadius: getCardRadiusStyle(),
        boxShadow: getCardShadowStyle(),
        color: theme.textColor || "#e4e4e7"
      };
    }
    if (theme.cardStyle === "bordered") {
      return {
        backgroundColor: theme.cardBgColor || "#18181b",
        border: `1.5px solid ${theme.primaryColor || "#10b981"}`,
        borderRadius: getCardRadiusStyle(),
        boxShadow: getCardShadowStyle(),
        color: theme.textColor || "#e4e4e7"
      };
    }
    return {
      backgroundColor: theme.cardBgColor || "#18181b",
      border: "1px solid rgba(255, 255, 255, 0.05)",
      borderRadius: getCardRadiusStyle(),
      boxShadow: getCardShadowStyle(),
      color: theme.textColor || "#e4e4e7"
    };
  };

  return (
    activeQR && activeQR.status === "Inactive" ? (
      <div 
        className="min-h-screen w-full flex flex-col justify-center items-center p-6 select-none"
        style={{
          ...getPageBgStyle(),
          fontFamily: getFontFamilyStyle()
        }}
      >
        <div className="w-full max-w-md p-8 text-center space-y-6" style={getCardBodyStyle()}>
          <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mx-auto text-amber-500 animate-pulse">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-white">Review Portal Paused</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              The feedback collector for <strong>{theme.businessName || businessProfile.name}</strong> is temporarily disabled by the business owner.
            </p>
          </div>
          <div className="pt-2">
            <p className="text-[10px] text-zinc-500 font-mono">
              Please check back later or ask staff for assistance.
            </p>
          </div>
        </div>
      </div>
    ) : (
    <div 
      className="min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 select-none overflow-y-auto"
      style={{
        ...getPageBgStyle(),
        fontFamily: getFontFamilyStyle()
      }}
    >
      
      {/* Header Cover Banner (Optional) */}
      {theme.coverBanner && (
        <div className="w-full max-w-md mx-auto h-24 sm:h-32 rounded-2xl overflow-hidden mb-4 shadow-lg border border-white/5 shrink-0 relative">
          <img 
            src={theme.coverBanner} 
            alt="Cover" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      {/* Main Review Dialog Form Wrapper */}
      <div className="flex-1 w-full max-w-md mx-auto flex flex-col justify-center my-2">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: INITIAL STAR RATING SELECTION */}
          {step === "rating" && (
            <motion.div
              key="rating-step"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="p-6 sm:p-8 space-y-6"
              style={getCardBodyStyle()}
            >
              {/* Brand Branding Header */}
              <div className="flex items-center space-x-3 pb-4 border-b border-white/10">
                <img 
                  src={theme.logo || businessProfile.logo} 
                  alt="Logo" 
                  className="w-12 h-12 object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-1.5">
                    <h1 className="text-base sm:text-lg font-bold text-white truncate leading-tight">
                      {theme.businessName || businessProfile.name}
                    </h1>
                    {theme.googleVerified && (
                      <span className="w-4 h-4 bg-emerald-500 text-white flex items-center justify-center rounded-full shrink-0">
                        <Check className="w-2.5 h-2.5 fill-white" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 truncate mt-0.5">{theme.tagline}</p>
                </div>
              </div>

              {/* Language Selector if enabled in current active theme */}
              {theme.aiLanguageSelector && theme.enabledLanguages.length > 1 && (
                <div className="flex justify-between items-center text-xs text-zinc-400 font-mono">
                  <span>Portal Language:</span>
                  <select
                    value={portalLanguage}
                    onChange={(e) => setPortalLanguage(e.target.value)}
                    className="bg-black/30 border border-white/10 rounded-lg p-1.5 text-xs text-white focus:outline-none"
                  >
                    {theme.enabledLanguages.map(lang => (
                      <option key={lang} value={lang} className="bg-zinc-950 text-white">{lang}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Welcome Greetings text details */}
              <div className="text-center space-y-2 pt-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-snug">
                  {theme.welcomeTitle}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300 leading-normal">
                  {theme.welcomeMessage}
                </p>
              </div>

              {/* Interactive Rating Stars Area */}
              <div className="text-center py-4 space-y-3.5">
                <div className="flex justify-center space-x-3">
                  {[1, 2, 3, 4, 5].map(st => {
                    const isLit = st <= (hoverRating || rating);
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setRating(st)}
                        onMouseEnter={() => setHoverRating(st)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 focus:outline-none hover:scale-120 transition-all cursor-pointer active:scale-95"
                      >
                        <Star 
                          className="w-8 h-8 sm:w-9 sm:h-9"
                          style={{
                            fill: isLit ? theme.starColor : "none",
                            color: isLit ? theme.starColor : "rgba(255,255,255,0.15)"
                          }}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Star level descriptive indicator labels */}
                <div className="h-6 flex items-center justify-center">
                  {(hoverRating || rating) > 0 ? (
                    <span 
                      className="text-xs font-bold uppercase tracking-wider font-mono animate-pulse"
                      style={{ color: theme.starColor }}
                    >
                      {theme.ratingLabels[hoverRating || rating] || "Select star feedback"}
                    </span>
                  ) : (
                    <span className="text-xs text-zinc-500">Tap a star to rate your visit</span>
                  )}
                </div>
              </div>

              {/* Navigation Action based on rating threshold */}
              {rating > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-2"
                >
                  {rating >= (activeQR?.ratingRequired || 4) ? (
                    <button
                      onClick={() => setStep("feedback_positive")}
                      className="w-full py-3 text-xs sm:text-sm font-bold tracking-wide uppercase shadow-lg hover:brightness-110 active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                      style={{
                        backgroundColor: theme.buttonColor,
                        color: theme.buttonTextColor,
                        borderRadius: theme.buttonStyle === "pill" ? "9999px" : theme.buttonStyle === "square" ? "0px" : "12px"
                      }}
                    >
                      <span>Continue & Generate Copy</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setStep("feedback_negative")}
                      className="w-full py-3 text-xs sm:text-sm font-bold tracking-wide uppercase bg-rose-600 text-white shadow-lg hover:bg-rose-500 active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer rounded-xl"
                    >
                      <span>Share Private Feedback</span>
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* STEP 2A: POSITIVE ROUTE (AI suggestion generation and copywriting) */}
          {step === "feedback_positive" && (
            <motion.div
              key="positive-step"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="p-6 sm:p-8 space-y-5"
              style={getCardBodyStyle()}
            >
              {/* Back navigation */}
              <button
                onClick={() => {
                  setRating(0);
                  setStep("rating");
                }}
                className="inline-flex items-center space-x-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Go Back</span>
              </button>

              <div className="text-center space-y-1">
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 font-mono">
                  Fantastic {rating} Stars!
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                  {theme.aiSectionTitle}
                </h3>
              </div>

              {/* AI generator engine mock block */}
              {theme.aiEnabled && (
                <div className="bg-black/35 border border-white/10 rounded-2xl p-4 space-y-3">
                  {aiSuggestions.length > 1 && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-zinc-500 uppercase font-mono block">Choose alternative drafts:</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {aiSuggestions.map((s, idx) => (
                          <button
                            key={idx}
                            onClick={() => setEditedText(s)}
                            className={`p-2 text-[10px] truncate rounded-lg border transition-all cursor-pointer ${
                              editedText === s 
                                ? "bg-white/10 border-emerald-500 text-white font-bold" 
                                : "bg-black/20 border-white/5 text-zinc-400 hover:text-zinc-200"
                            }`}
                          >
                            Draft #{idx + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Language & Tone pickers inside assistant section */}
                  {theme.aiToneSelector && (
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <div>
                        <span className="text-zinc-500 uppercase block mb-1">Select Tone:</span>
                        <select
                          value={aiTone}
                          onChange={(e) => setAiTone(e.target.value as any)}
                          className="w-full bg-zinc-900 border border-white/5 rounded p-1 text-white focus:outline-none"
                        >
                          <option value="friendly">Friendly / Sincere</option>
                          <option value="professional">Professional / Crisp</option>
                          <option value="casual">Casual / Direct</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={handleFetchAiSuggestions}
                          disabled={aiLoading}
                          className="w-full py-1.5 bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-white rounded font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer disabled:opacity-50"
                        >
                          {aiLoading ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                          )}
                          <span>{aiLoading ? "Drafting..." : "Re-draft AI"}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="relative pt-2 border-t border-white/5">
                    <p className="text-xs text-zinc-300 leading-relaxed italic pr-8">
                      "{editedText || "Use the editor below to type your review copy!"}"
                    </p>
                    <button
                      onClick={handleCopyReview}
                      className="absolute right-0 top-2.5 p-1 text-zinc-400 hover:text-emerald-400 transition-all cursor-pointer"
                      title={theme.copyBtnText}
                    >
                      {isCopied ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Review content writer textarea */}
              <div className="space-y-1.5">
                <label className="block text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
                  Make any edits below:
                </label>
                <textarea
                  rows={3}
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="w-full bg-black/25 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="Tell us what you liked most about your experience today..."
                />
              </div>

              {/* Continue button to launch confirm redirection */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="w-full py-3.5 text-xs sm:text-sm font-bold tracking-wider uppercase shadow-lg flex items-center justify-center space-x-2 hover:brightness-115 active:scale-98 transition-all cursor-pointer"
                  style={{
                    backgroundColor: theme.buttonColor,
                    color: theme.buttonTextColor,
                    borderRadius: theme.buttonStyle === "pill" ? "9999px" : theme.buttonStyle === "square" ? "0px" : "12px"
                  }}
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{theme.ctaButtonText}</span>
                </button>
                <p className="text-[10px] text-zinc-500 text-center leading-normal">
                  Your custom draft will be copied automatically. Just paste it on the Google Maps popup!
                </p>
              </div>
            </motion.div>
          )}

          {/* STEP 2B: NEGATIVE ROUTE (Gated Private feedback modal form) */}
          {step === "feedback_negative" && (
            <motion.div
              key="negative-step"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="p-6 sm:p-8 space-y-5"
              style={getCardBodyStyle()}
            >
              <button
                onClick={() => {
                  setRating(0);
                  setStep("rating");
                }}
                className="inline-flex items-center space-x-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Go Back</span>
              </button>

              <div className="text-center space-y-1">
                <div className="w-9 h-9 bg-amber-950/40 text-amber-500 rounded-full flex items-center justify-center mx-auto border border-amber-900/40">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mt-2 leading-tight">We Want to Make This Right</h3>
                <p className="text-xs text-zinc-400 leading-normal px-1">
                  We sincerely apologize that your visit fell short. Your feedback is sent directly to management.
                </p>
              </div>

              <form onSubmit={handleSubmitPrivateFeedback} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] text-zinc-500 font-mono uppercase mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={directName}
                    onChange={(e) => setDirectName(e.target.value)}
                    className="w-full bg-black/25 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                    placeholder="Enter your name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-zinc-500 font-mono uppercase mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={directEmail}
                      onChange={(e) => setDirectEmail(e.target.value)}
                      className="w-full bg-black/25 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                      placeholder="name@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 font-mono uppercase mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={directPhone}
                      onChange={(e) => setDirectPhone(e.target.value)}
                      className="w-full bg-black/25 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-500 font-mono uppercase mb-1">What can we improve?</label>
                  <textarea
                    rows={4}
                    required
                    value={directComments}
                    onChange={(e) => setDirectComments(e.target.value)}
                    className="w-full bg-black/25 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none"
                    placeholder="Please specify any staff issues, wait delays, food concerns, or overall recommendations..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingFeedback}
                  className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm tracking-wider uppercase rounded-xl transition-all shadow-lg cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  {isSubmittingFeedback ? "Submitting..." : "Submit Private Feedback"}
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 3: THANK YOU END STATE (COUPONS & EXTERNAL LINK ACTIONS) */}
          {step === "submitted" && (
            <motion.div
              key="submitted-step"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 sm:p-8 space-y-6 text-center"
              style={getCardBodyStyle()}
            >
              <div className="w-12 h-12 bg-emerald-950 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-900 shadow-md">
                <Check className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                  Thank You So Much!
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed px-2">
                  {theme.thankYouMessage || `Your feedback is extremely important to us. Thank you for taking the time to share your perspective.`}
                </p>
              </div>

              {/* Loyalty Coupon display if rated */}
              <div className="p-4 bg-emerald-950/25 border border-emerald-900/30 rounded-2xl max-w-sm mx-auto space-y-2">
                <span className="block text-[10px] text-emerald-400 font-extrabold tracking-widest uppercase font-mono">
                  Loyalty Reward Coupon
                </span>
                <p className="text-white text-base sm:text-lg font-black font-mono tracking-tight bg-black/40 py-1.5 rounded-lg border border-white/5">
                  WELCOME10
                </p>
                <p className="text-[10px] text-zinc-400 font-medium">
                  Show this code to our cashier on your next visit for <strong>10% Off Your Purchase</strong>!
                </p>
              </div>

              {/* Custom Action buttons based on branding social links */}
              <div className="space-y-3 pt-2">
                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Follow or Contact Us Directly:</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {theme.socialLinks.website && (
                    <a 
                      href={businessProfile.website || "#"} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="p-2.5 bg-black/40 border border-white/10 rounded-xl hover:bg-white/5 text-xs text-white flex items-center justify-center space-x-2 transition-colors"
                    >
                      <Globe className="w-4 h-4 text-emerald-400" />
                      <span>{theme.visitWebsiteText}</span>
                    </a>
                  )}
                  {theme.socialLinks.whatsapp && (
                    <a 
                      href={`https://wa.me/${businessProfile.phone.replace(/[^0-9]/g, "")}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="p-2.5 bg-black/40 border border-white/10 rounded-xl hover:bg-white/5 text-xs text-white flex items-center justify-center space-x-2 transition-colors"
                    >
                      <Phone className="w-4 h-4 text-emerald-400" />
                      <span>{theme.whatsappText}</span>
                    </a>
                  )}
                  {theme.socialLinks.instagram && (
                    <a 
                      href={businessProfile.socials.instagram || "#"} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="p-2.5 bg-black/40 border border-white/10 rounded-xl hover:bg-white/5 text-xs text-white flex items-center justify-center space-x-2 transition-colors"
                    >
                      <Instagram className="w-4 h-4 text-pink-500" />
                      <span>Instagram</span>
                    </a>
                  )}
                  {theme.socialLinks.facebook && (
                    <a 
                      href={businessProfile.socials.facebook || "#"} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="p-2.5 bg-black/40 border border-white/10 rounded-xl hover:bg-white/5 text-xs text-white flex items-center justify-center space-x-2 transition-colors"
                    >
                      <Facebook className="w-4 h-4 text-blue-500" />
                      <span>Facebook</span>
                    </a>
                  )}
                </div>

                {theme.socialLinks.maps && (
                  <a 
                    href={`https://maps.google.com/?q=${encodeURIComponent(businessProfile.address)}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-full mt-2 p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 text-xs text-white flex items-center justify-center space-x-2 transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-amber-500" />
                    <span>{theme.directionsText}</span>
                  </a>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* SEO Friendly Footer Brand credits */}
      <footer className="w-full max-w-md mx-auto text-center py-4 shrink-0 space-y-1.5 border-t border-white/5 bg-black/10 rounded-2xl">
        <p className="text-[10px] text-zinc-500 font-medium px-2">
          {theme.footerText || `All rights reserved © ${theme.businessName || businessProfile.name}.`}
        </p>
        
        <div className="flex justify-center items-center space-x-2.5 text-[9px] text-zinc-500">
          <a href="#" className="hover:text-zinc-300 transition-colors">Privacy Policy</a>
          <span>•</span>
          <a href="#" className="hover:text-zinc-300 transition-colors">Terms of Service</a>
        </div>

        {!theme.hidePoweredBy && (
          <div className="text-[9px] text-zinc-600 pt-1 font-mono">
            Powered with absolute integrity by <span className="text-emerald-500 font-bold">ReviewPlease</span>
          </div>
        )}
      </footer>

      {/* CONFIRM REDIRECT MODAL DIALOG */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 max-w-xs text-center space-y-4 shadow-2xl"
          >
            <div className="w-10 h-10 bg-amber-950/50 text-amber-500 rounded-full flex items-center justify-center mx-auto border border-amber-900/40">
              <Sparkles className="w-5 h-5 text-amber-400 animate-spin-slow" />
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Opening Google Reviews</h4>
              <p className="text-xs text-zinc-400 leading-normal">
                Your AI suggested review text was copied. Simply paste or hold on the input area once the Google Maps Review interface loads!
              </p>
            </div>

            <div className="flex space-x-2.5 text-xs pt-1">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-xl font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleProceedToGoogle}
                className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl cursor-pointer transition-colors"
              >
                Continue
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
    )
  );
}
