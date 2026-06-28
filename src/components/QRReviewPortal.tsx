import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Star, 
  Sparkles, 
  Check, 
  Copy, 
  ArrowLeft, 
  Smartphone, 
  ExternalLink, 
  Send, 
  MessageSquare, 
  AlertCircle,
  ThumbsUp,
  Heart,
  Smile,
  ShieldAlert,
  HelpCircle,
  Eye,
  RefreshCw,
  Clock,
  Wifi,
  Battery,
  Phone,
  Globe,
  MapPin,
  Share2,
  Lock,
  ArrowRight,
  Sparkle,
  Terminal,
  Layers,
  Settings,
  AlertTriangle
} from "lucide-react";
import { QRCodeItem, BusinessProfile, Review } from "../types";

interface QRReviewPortalProps {
  qrCodes: QRCodeItem[];
  businessProfile: BusinessProfile;
  onAddReview: (review: Review) => void;
  onAddActivityLog: (action: string, details: string, type: "info" | "success" | "warning" | "error" | "ai") => void;
  onAddNotification: (title: string, description: string, type: "review" | "billing" | "ai" | "system") => void;
  onIncrementScanCount: (qrCodeId: string) => void;
  selectedQRId?: string;
  onSelectedQRIdChange?: (id: string) => void;
}

interface TelemetryEvent {
  id: string;
  type: "scan" | "rating" | "ai" | "edit" | "redirect" | "language" | "error";
  message: string;
  timestamp: string;
  device: string;
  browser: string;
}

export default function QRReviewPortal({
  qrCodes,
  businessProfile,
  onAddReview,
  onAddActivityLog,
  onAddNotification,
  onIncrementScanCount,
  selectedQRId: propSelectedQRId,
  onSelectedQRIdChange
}: QRReviewPortalProps) {
  // Simulator configuration state
  const [localSelectedQRId, setLocalSelectedQRId] = useState<string>(
    qrCodes.length > 0 ? qrCodes[0].id : ""
  );

  const selectedQRId = propSelectedQRId || localSelectedQRId;
  const setSelectedQRId = (id: string) => {
    if (onSelectedQRIdChange) {
      onSelectedQRIdChange(id);
    } else {
      setLocalSelectedQRId(id);
    }
  };

  const activeQR = qrCodes.find(q => q.id === selectedQRId);

  // Configuration settings for simulation
  const [isProBranding, setIsProBranding] = useState<boolean>(false);
  const [simulateInactive, setSimulateInactive] = useState<boolean>(false);
  const [simulateInvalidToken, setSimulateInvalidToken] = useState<boolean>(false);
  const [simulatedDevice, setSimulatedDevice] = useState<"iphone" | "pixel">("iphone");
  const [simulatedBrowser, setSimulatedBrowser] = useState<"Safari" | "Chrome">("Safari");
  const [couponEnabled, setCouponEnabled] = useState<boolean>(true);
  const [couponCode, setCouponCode] = useState<string>("WELCOME10");
  const [couponReward, setCouponReward] = useState<string>("10% Off Your Next Purchase");

  // Portal Customer states
  const [portalLanguage, setPortalLanguage] = useState<string>("English");
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [step, setStep] = useState<"loading" | "rating" | "feedback_positive" | "feedback_negative" | "submitted">("loading");
  
  // Review Editor states
  const [editedReviewText, setEditedReviewText] = useState<string>("");
  const [isEditingCustom, setIsEditingCustom] = useState<boolean>(false);
  const [saveIndicator, setSaveIndicator] = useState<string>("");
  const [isRewriting, setIsRewriting] = useState<boolean>(false);

  // AI Assistant Suggestions
  const [suggestedReviews, setSuggestedReviews] = useState<string[]>([]);
  const [aiTone, setAiTone] = useState<"friendly" | "professional" | "casual">("friendly");
  const [aiLength, setAiLength] = useState<"short" | "medium" | "long">("medium");
  const [aiKeywords, setAiKeywords] = useState<string>("");
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [isCopiedEditor, setIsCopiedEditor] = useState<boolean>(false);

  // Private direct-feedback states
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackEmail, setFeedbackEmail] = useState("");
  const [feedbackPhone, setFeedbackPhone] = useState("");
  const [feedbackCategory, setFeedbackCategory] = useState("Quality");
  const [feedbackComments, setFeedbackComments] = useState("");

  // Confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  // Telemetry stream state
  const [telemetry, setTelemetry] = useState<TelemetryEvent[]>([]);

  // Simulated Time for notch
  const [currentTime, setCurrentTime] = useState("");

  // References for scroll locking
  const telemetryEndRef = useRef<HTMLDivElement>(null);

  // Available Languages list
  const languages = [
    { code: "English", label: "English" },
    { code: "Hindi", label: "हिन्दी (Hindi)" },
    { code: "Hinglish", label: "Hinglish" },
    { code: "Bengali", label: "বাংলা (Bengali)" },
    { code: "Tamil", label: "தமிழ் (Tamil)" },
    { code: "Telugu", label: "తెలుగు (Telugu)" },
    { code: "Marathi", label: "मराठी (Marathi)" },
    { code: "Gujarati", label: "ગુજરાતી (Gujarati)" },
    { code: "Punjabi", label: "ਪੰਜਾਬੀ (Punjabi)" },
    { code: "Malayalam", label: "മലയാളം (Malayalam)" },
    { code: "Kannada", label: "ಕನ್ನಡ (Kannada)" },
    { code: "Spanish", label: "Español (Spanish)" }
  ];

  // Helper to add telemetry log in simulator
  const logTelemetry = (type: TelemetryEvent["type"], message: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const newEvent: TelemetryEvent = {
      id: "tel_" + Math.random().toString(36).substr(2, 9),
      type,
      message,
      timestamp,
      device: simulatedDevice === "iphone" ? "iPhone 15 Pro" : "Google Pixel 8",
      browser: simulatedBrowser
    };
    setTelemetry(prev => [newEvent, ...prev].slice(0, 50));
  };

  // Clock Update for Device Notch
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      setCurrentTime(`${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Simulating the automatic initial QR code scan load
  useEffect(() => {
    if (activeQR) {
      setStep("loading");
      logTelemetry("scan", `Permanent QR flyer scanned: "${activeQR.name}". Checking placement token validation...`);
      
      const timer = setTimeout(() => {
        if (simulateInvalidToken) {
          logTelemetry("error", "Spam protection: Invalid QR token signature or expired timestamp validation!");
          setStep("rating"); // State is handled by simulation logic checks
        } else if (simulateInactive) {
          logTelemetry("error", `Verified status checked: Business profile "${businessProfile.name}" is marked inactive.`);
          setStep("rating");
        } else {
          // Normal active scan
          onIncrementScanCount(activeQR.id);
          logTelemetry("scan", `Verified secure landing page loaded in 450ms. QR placement counter: ${activeQR.scans + 1} scans.`);
          setStep("rating");

          onAddActivityLog(
            "QR Placement Scanned",
            `A customer simulated scanning the ${activeQR.name} flyer using ${simulatedBrowser} on ${simulatedDevice === "iphone" ? "iOS" : "Android"}.`,
            "info"
          );
        }
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [selectedQRId, simulateInactive, simulateInvalidToken]);

  // Handle rating emoji & status mapping
  const getRatingFeedback = () => {
    switch (rating) {
      case 1: return { emoji: "😢", label: "Very Disappointed", color: "text-rose-400" };
      case 2: return { emoji: "🙁", label: "Disappointed", color: "text-rose-300" };
      case 3: return { emoji: "😐", label: "Average / Neutral", color: "text-amber-300" };
      case 4: return { emoji: "🙂", label: "Good Experience", color: "text-emerald-300" };
      case 5: return { emoji: "🤩", label: "Absolutely Outstanding!", color: "text-emerald-400 animate-bounce" };
      default: return { emoji: "🤔", label: "Tap stars to rate", color: "text-zinc-500" };
    }
  };

  // Pre-set review templates depending on rating and language for authentic feel
  const getPreSetReviewDrafts = (stars: number, lang: string): string[] => {
    const biz = businessProfile.name;
    const isHigh = stars >= (activeQR?.ratingRequired || 4);

    if (lang === "Hindi") {
      return isHigh ? [
        `${biz} में हमारा अनुभव बहुत ही बेहतरीन रहा! यहाँ की सर्विस और स्टाफ का व्यवहार बहुत अच्छा था।`,
        `बहुत ही बढ़िया जगह है। प्रोडक्ट की क्वालिटी लाजवाब थी, मैं दोबारा यहाँ ज़रूर आना चाहूँगा।`,
        `शानदार अनुभव! सब कुछ समय पर मिला और क्वालिटी बहुत अच्छी थी। ५ स्टार!`
      ] : [
        `${biz} में सर्विस थोड़ी धीमी थी। इसे और बेहतर किया जा सकता है।`,
        `क्वालिटी उतनी अच्छी नहीं लगी जितना सोचा था। स्टाफ को थोड़ा और ध्यान देना चाहिए।`,
        `ठीक-ठाक अनुभव था लेकिन कुछ चीज़ें सुधारी जा सकती हैं। सर्विस में देरी हुई।`
      ];
    }

    if (lang === "Hinglish") {
      return isHigh ? [
        `${biz} ka experience sach me bohot badhiya tha! Staff ka behavior amazing hai.`,
        `Highly recommend karta hu sabhi ko. Products aur food quality bilkul top-notch hai!`,
        `Amazing service and super friendly vibe. Must visit place again, thanks!`
      ] : [
        `Service thodi slow thi aaj. Please response time thoda improve karein.`,
        `Quality bohot average lagi as compared to the price. Scope for improvement hai.`,
        `Vibe acchi thi par order aane me kafi time lag gaya. Management needs to be better.`
      ];
    }

    if (lang === "Spanish") {
      return isHigh ? [
        `¡Una experiencia fantástica en ${biz}! El servicio al cliente fue excepcional y la calidad excelente.`,
        `Muy recomendable. Ambiente acogedor, personal amable y todo de primer nivel.`,
        `¡Excelente servicio y atención al cliente! Definitivamente volveré pronto.`
      ] : [
        `El servicio fue un poco lento hoy en ${biz}. La atención del personal puede mejorar.`,
        `La calidad no cumplió con mis expectativas para el precio. Espero que mejoren.`,
        `Experiencia regular. Hubo bastante demora con el pedido, aunque el personal fue amable.`
      ];
    }

    // Default English
    return isHigh ? [
      `We had a wonderful experience at ${biz}! The level of service was outstanding, and the staff was extremely friendly.`,
      `Highly recommend visiting ${biz}. The quality is top-tier and the environment is exceptionally clean and tidy.`,
      `Excellent service and fantastic attention to detail. Everything exceeded our expectations. Will definitely be back!`
    ] : [
      `The customer service response time at ${biz} was slower than expected during my visit today.`,
      `Quality did not match my expectations. I feel there is room for improvement in overall management.`,
      `An average experience. Order took quite a while to arrive, though the staff was polite.`
    ];
  };

  // Generate Review Drafts
  const handleStarSelect = (stars: number) => {
    setRating(stars);
    logTelemetry("rating", `Customer selected rating: ${stars} Stars (${getRatingFeedback().label})`);
    
    // Automatically trigger suggestion generation based on rating
    const threshold = activeQR ? activeQR.ratingRequired : 4;
    const isPositive = stars >= threshold;

    setAiLoading(true);
    setTimeout(() => {
      // Initialize with preset drafts
      const defaultDrafts = getPreSetReviewDrafts(stars, portalLanguage);
      setSuggestedReviews(defaultDrafts);
      setEditedReviewText(defaultDrafts[0]); // default fill editor
      setStep(isPositive ? "feedback_positive" : "feedback_negative");
      setAiLoading(false);
      logTelemetry("ai", `AI Review Assistant compiled 3 suggestions tailored for ${stars}-star feedback in ${portalLanguage}.`);
    }, 800);
  };

  // Trigger Gemini-powered custom suggestions
  const regenerateAISuggestions = async () => {
    setAiLoading(true);
    logTelemetry("ai", `Contacting Gemini API to generate custom ${aiTone} suggestions for rating: ${rating} stars...`);
    try {
      const response = await fetch("/api/gemini/suggest-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: rating,
          tone: aiTone,
          length: aiLength,
          language: portalLanguage,
          extraDetails: aiKeywords,
          businessName: businessProfile.name
        })
      });
      const data = await response.json();
      if (data.suggestions && Array.isArray(data.suggestions)) {
        setSuggestedReviews(data.suggestions);
        setEditedReviewText(data.suggestions[0]);
        logTelemetry("ai", `Successfully received 3 real-time custom Gemini suggestions in ${portalLanguage}.`);
      } else {
        throw new Error("No suggestions returned");
      }
    } catch (e) {
      console.error(e);
      // Fallback
      const backups = [
        `The experience was absolutely fantastic. ${businessProfile.name} is top tier! Tone: ${aiTone}.`,
        `Amazing ${aiKeywords || "service"}! Superb experience and highly recommend.`,
        `Extremely satisfied with the overall quality in ${portalLanguage}. Will be back for sure!`
      ];
      setSuggestedReviews(backups);
      setEditedReviewText(backups[0]);
      logTelemetry("error", "Failed to connect to server API. Fallback high-quality local suggestions generated.");
    } finally {
      setAiLoading(false);
    }
  };

  // Trigger AI text rewriting
  const triggerAIRewrite = async () => {
    if (!editedReviewText.trim()) return;
    setIsRewriting(true);
    logTelemetry("ai", `Invoking Gemini API to rewrite review draft using style: ${aiTone}...`);
    try {
      const response = await fetch("/api/gemini/rewrite-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: editedReviewText,
          tone: aiTone,
          length: aiLength,
          language: portalLanguage
        })
      });
      const data = await response.json();
      if (data.rewritten) {
        setEditedReviewText(data.rewritten);
        logTelemetry("edit", `Draft successfully rewritten by AI: updated to ${data.rewritten.length} characters.`);
        setSaveIndicator("Rewrite successful!");
        setTimeout(() => setSaveIndicator(""), 2500);
      }
    } catch (e) {
      console.error(e);
      logTelemetry("error", "AI Rewrite failed. Please try again or edit manually.");
    } finally {
      setIsRewriting(false);
    }
  };

  // Change active language
  const handleLanguageChange = (lang: string) => {
    setPortalLanguage(lang);
    logTelemetry("language", `Language preference updated to: ${lang}. Regenerating templates...`);
    if (rating > 0) {
      const updatedDrafts = getPreSetReviewDrafts(rating, lang);
      setSuggestedReviews(updatedDrafts);
      setEditedReviewText(updatedDrafts[0]);
    }
  };

  // Copy draft review text
  const copyTextToClipboard = (text: string, index?: number) => {
    navigator.clipboard.writeText(text);
    if (index !== undefined) {
      setCopiedIdx(index);
      setTimeout(() => setCopiedIdx(null), 2000);
    } else {
      setIsCopiedEditor(true);
      setTimeout(() => setIsCopiedEditor(false), 2000);
    }
    logTelemetry("edit", "Review text copied to user clipboard successfully.");
    onAddActivityLog(
      "Review Copy Action",
      `Customer copied the drafted review to clipboard. Ready to paste on Google.`,
      "success"
    );
  };

  // Trigger simulated redirect to Google Review link
  const handleContinueToGoogleClick = () => {
    setShowConfirmModal(true);
    logTelemetry("redirect", "Customer initiated 'Continue to Google' CTA. Prompting confirmation alert...");
  };

  const confirmGoogleRedirect = () => {
    setShowConfirmModal(false);
    logTelemetry("redirect", `Redirecting customer to: "${businessProfile.googleReviewLink}" in a new tab...`);
    
    // Add review to platform simulation DB
    const finalReviewText = editedReviewText || `Excellent experience. Tapped ${rating} stars.`;
    const newReview: Review = {
      id: "rev_sim_" + Math.random().toString(36).substr(2, 9),
      author: "Verified Customer (Google)",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
      rating: rating,
      text: finalReviewText,
      date: "Just now",
      source: "Google",
      location: activeQR?.name || "Counter QR",
      status: "pending"
    };

    onAddReview(newReview);
    onAddActivityLog(
      "Google Review Redirected",
      `Simulated customer was redirected to the Google review page with text draft: "${finalReviewText}"`,
      "success"
    );
    onAddNotification(
      "Google Review Generated!",
      `A customer was redirected to post on Google via ${activeQR?.name}: ${rating} stars.`,
      "review"
    );

    setStep("submitted");
  };

  // Submit negative review gated feedback privately
  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackComments.trim()) return;

    logTelemetry("redirect", "Direct Private Feedback submitted by customer. Intercepting before Google!");

    const finalFeedbackText = `[Direct Gated Category: ${feedbackCategory}] ${feedbackComments}`;
    const newReview: Review = {
      id: "rev_sim_" + Math.random().toString(36).substr(2, 9),
      author: feedbackName.trim() || "Anonymous Client",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120",
      rating: rating,
      text: finalFeedbackText,
      date: "Just now",
      source: "Direct Feed",
      location: activeQR?.name || "Counter QR",
      status: "pending"
    };

    onAddReview(newReview);
    onAddActivityLog(
      "Direct Feedback Intercepted",
      `Critical rating (${rating} Stars) caught privately from reaching Google. Routed to Manager feed.`,
      "warning"
    );
    onAddNotification(
      "Negative Feedback Intercepted",
      `A direct feedback form was submitted by ${feedbackName || "anonymous"} regarding ${feedbackCategory} (${rating} stars).`,
      "review"
    );

    setStep("submitted");
  };

  // Reset simulator state
  const resetSimulatorFlow = () => {
    setRating(0);
    setHoverRating(0);
    setStep("rating");
    setEditedReviewText("");
    setFeedbackComments("");
    setFeedbackName("");
    setFeedbackEmail("");
    setFeedbackPhone("");
    setIsEditingCustom(false);
    logTelemetry("scan", "Simulator session reset. Ready for next simulation turn.");
  };

  return (
    <div id="qr-review-portal-root" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* LEFT COLUMN: SIMULATOR SETUP & DIAGNOSTICS & TELEMETRY */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Device Controls */}
        <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-6 space-y-5">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
            <div>
              <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-mono font-bold flex items-center space-x-1">
                <Smartphone className="w-3 h-3 text-emerald-400" />
                <span>Simulation Workshop</span>
              </span>
              <h3 className="text-md font-serif text-white italic mt-1">Gated Review QR Portal</h3>
            </div>
            <span className="text-[9px] text-zinc-500 bg-zinc-950 border border-zinc-900 px-2 py-1 rounded-md font-mono">
              Live Preview
            </span>
          </div>

          <div className="space-y-4">
            
            {/* 1. Placement Selector */}
            <div>
              <label className="block text-[10px] text-zinc-500 font-semibold uppercase mb-1.5 font-mono">1. Select QR Code Flyer</label>
              <select
                value={selectedQRId}
                onChange={(e) => setSelectedQRId(e.target.value)}
                className="w-full bg-[#050505] border border-[#1a1a1a] text-xs text-white rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              >
                {qrCodes.map(q => (
                  <option key={q.id} value={q.id}>
                    {q.name} ({q.ratingRequired}+ Stars Google threshold)
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-zinc-500 mt-1 leading-normal">
                Determines threshold for public Google redirect vs private feedback gate.
              </p>
            </div>

            {/* 2. Simulation Scenarios */}
            <div className="space-y-2 pt-2 border-t border-zinc-900">
              <label className="block text-[10px] text-zinc-500 font-semibold uppercase mb-1.5 font-mono">2. Simulate Scenarios</label>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSimulateInactive(false);
                    setSimulateInvalidToken(prev => !prev);
                    resetSimulatorFlow();
                  }}
                  className={`p-2.5 rounded-lg border text-left transition-colors flex flex-col justify-between h-16 ${
                    simulateInvalidToken
                      ? "bg-rose-950/20 border-rose-900/60 text-rose-200"
                      : "bg-[#050505] border-zinc-900 text-zinc-400 hover:border-zinc-800"
                  }`}
                >
                  <div className="flex items-center space-x-1.5 text-[10px] font-bold">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>Invalid QR Code</span>
                  </div>
                  <span className="text-[9px] text-zinc-500 leading-none">Simulate missing token</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSimulateInvalidToken(false);
                    setSimulateInactive(prev => !prev);
                    resetSimulatorFlow();
                  }}
                  className={`p-2.5 rounded-lg border text-left transition-colors flex flex-col justify-between h-16 ${
                    simulateInactive
                      ? "bg-amber-950/20 border-amber-900/60 text-amber-200"
                      : "bg-[#050505] border-zinc-900 text-zinc-400 hover:border-zinc-800"
                  }`}
                >
                  <div className="flex items-center space-x-1.5 text-[10px] font-bold">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Business Inactive</span>
                  </div>
                  <span className="text-[9px] text-zinc-500 leading-none">Simulate offline state</span>
                </button>
              </div>
            </div>

            {/* 3. Branding & Customization Settings */}
            <div className="space-y-3 pt-2 border-t border-zinc-900 text-xs">
              <label className="block text-[10px] text-zinc-500 font-semibold uppercase mb-1 font-mono">3. Pro Customization</label>
              
              <div className="flex items-center justify-between p-2 bg-[#050505] border border-zinc-900 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Layers className="w-3.5 h-3.5 text-zinc-400" />
                  <div>
                    <p className="text-white font-medium text-[11px]">Remove Branding (Pro Feature)</p>
                    <p className="text-[9px] text-zinc-500">Hide "Powered by ReviewPlease" logo</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isProBranding}
                  onChange={(e) => {
                    setIsProBranding(e.target.checked);
                    logTelemetry("edit", `Pro Customization: Branding removal toggled ${e.target.checked ? "ON" : "OFF"}`);
                  }}
                  className="w-3.5 h-3.5 rounded bg-zinc-900 border-zinc-800 focus:ring-0 focus:ring-offset-0 accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="p-3 bg-[#050505] border border-zinc-900 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase font-mono">4. Loyalty Coupon Offer</span>
                  <input
                    type="checkbox"
                    checked={couponEnabled}
                    onChange={(e) => setCouponEnabled(e.target.checked)}
                    className="w-3 h-3 rounded bg-zinc-900 accent-emerald-500"
                  />
                </div>
                {couponEnabled && (
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <span className="text-[9px] text-zinc-500">Coupon Code</span>
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="w-full bg-[#0c0c0c] border border-zinc-800 rounded p-1 text-[10px] text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-500">Reward Text</span>
                      <input
                        type="text"
                        value={couponReward}
                        onChange={(e) => setCouponReward(e.target.value)}
                        className="w-full bg-[#0c0c0c] border border-zinc-800 rounded p-1 text-[10px] text-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Phone Setup Toggle */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-900 text-xs">
              <div>
                <label className="block text-[10px] text-zinc-500 font-semibold uppercase mb-1 font-mono">Device Frame</label>
                <div className="grid grid-cols-2 gap-1 p-0.5 bg-zinc-950 rounded-lg border border-zinc-900 font-mono text-[10px]">
                  <button
                    onClick={() => setSimulatedDevice("iphone")}
                    className={`py-1 rounded ${simulatedDevice === "iphone" ? "bg-white text-black font-semibold" : "text-zinc-400 hover:text-white"}`}
                  >
                    iPhone 15
                  </button>
                  <button
                    onClick={() => setSimulatedDevice("pixel")}
                    className={`py-1 rounded ${simulatedDevice === "pixel" ? "bg-white text-black font-semibold" : "text-zinc-400 hover:text-white"}`}
                  >
                    Pixel 8
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-zinc-500 font-semibold uppercase mb-1 font-mono">Client Browser</label>
                <div className="grid grid-cols-2 gap-1 p-0.5 bg-zinc-950 rounded-lg border border-zinc-900 font-mono text-[10px]">
                  <button
                    onClick={() => {
                      setSimulatedBrowser("Safari");
                      logTelemetry("edit", "Simulating browser change: Safari (iOS Core rendering engine)");
                    }}
                    className={`py-1 rounded ${simulatedBrowser === "Safari" ? "bg-white text-black font-semibold" : "text-zinc-400 hover:text-white"}`}
                  >
                    Safari
                  </button>
                  <button
                    onClick={() => {
                      setSimulatedBrowser("Chrome");
                      logTelemetry("edit", "Simulating browser change: Google Chrome (Android WebKit rendering engine)");
                    }}
                    className={`py-1 rounded ${simulatedBrowser === "Chrome" ? "bg-white text-black font-semibold" : "text-zinc-400 hover:text-white"}`}
                  >
                    Chrome
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Live Telemetry Analytics Feed */}
        <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
            <h4 className="text-xs font-semibold text-white uppercase tracking-widest font-mono flex items-center space-x-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Telemetry Logs & Analytics</span>
            </h4>
            <button
              onClick={() => {
                setTelemetry([]);
                logTelemetry("scan", "Telemetry logs cleared.");
              }}
              className="text-[9px] text-zinc-500 hover:text-white font-mono hover:underline"
            >
              Clear Logs
            </button>
          </div>

          <div className="space-y-2 text-[11px] max-h-[220px] overflow-y-auto pr-1">
            {telemetry.length === 0 ? (
              <div className="text-zinc-600 text-center py-6 font-mono">
                No simulated activity recorded yet.
              </div>
            ) : (
              telemetry.map((t) => {
                const getBadgeColor = () => {
                  if (t.type === "error") return "text-rose-400 bg-rose-950/20 border-rose-900/30";
                  if (t.type === "ai") return "text-emerald-400 bg-emerald-950/20 border-emerald-900/30";
                  if (t.type === "redirect") return "text-cyan-400 bg-cyan-950/20 border-cyan-900/30";
                  return "text-zinc-400 bg-zinc-950 border-zinc-900";
                };

                return (
                  <div key={t.id} className="p-2 bg-[#050505] border border-zinc-900 rounded-lg space-y-1 font-mono">
                    <div className="flex justify-between items-center text-[9px]">
                      <span className={`px-1.5 py-0.5 rounded border text-[8px] font-bold ${getBadgeColor()}`}>
                        {t.type.toUpperCase()}
                      </span>
                      <span className="text-zinc-600">{t.timestamp}</span>
                    </div>
                    <p className="text-zinc-300 leading-tight">{t.message}</p>
                    <div className="flex justify-between items-center text-[8px] text-zinc-500 pt-1 border-t border-zinc-950">
                      <span>{t.device}</span>
                      <span>{t.browser}</span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={telemetryEndRef} />
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: HIGH-FIDELITY MOBILE SMARTPHONE DEVICE FRAME */}
      <div className="lg:col-span-7 flex justify-center">
        <div 
          id="simulated-smartphone-frame" 
          className={`w-full max-w-[390px] h-[780px] bg-[#000] border-[10px] border-[#1f1f1f] shadow-2xl overflow-hidden relative flex flex-col ring-8 ring-zinc-900/50 transition-all ${
            simulatedDevice === "iphone" ? "rounded-[52px]" : "rounded-[36px]"
          }`}
        >
          {/* Smartphone Hardware Notch / Speaker Area */}
          <div className="absolute top-0 inset-x-0 h-8 bg-black z-30 flex items-center justify-between px-6 text-[10px] text-white">
            <span className="font-semibold font-mono text-[10px]">{currentTime}</span>
            
            {/* Dynamic notch style */}
            {simulatedDevice === "iphone" ? (
              <div className="w-28 h-5.5 bg-[#000] rounded-full mx-auto border border-zinc-800/20 flex items-center justify-center shrink-0">
                <div className="w-2 h-2 rounded-full bg-zinc-900/80 mr-2.5" />
                <div className="w-10 h-1 bg-zinc-950 rounded-full" />
              </div>
            ) : (
              <div className="w-4.5 h-4.5 bg-[#000] rounded-full mx-auto border border-zinc-800/10 flex items-center justify-center shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
              </div>
            )}

            <div className="flex items-center space-x-1.5 font-mono">
              <Wifi className="w-3.5 h-3.5 text-white shrink-0" />
              <span className="text-[9px] text-zinc-400 font-bold shrink-0">5G</span>
              <Battery className="w-4.5 h-3.5 text-white shrink-0" />
            </div>
          </div>

          {/* Smartphone Simulated Display Content Container */}
          <div className="flex-1 bg-[#050505] text-[#e0e0e0] flex flex-col pt-8 overflow-y-auto overflow-x-hidden relative scrollbar-none">
            
            {/* Simulated browser address bar (simulating native Safari/Chrome headers) */}
            <div className="px-4 py-2 border-b border-[#111] bg-[#080808] flex items-center space-x-1.5 select-none text-[9px] font-mono text-zinc-500">
              <Lock className="w-3 h-3 text-emerald-500" />
              <span className="truncate flex-1 text-zinc-400">
                reviewplease.com/biz/{businessProfile.name.toLowerCase().replace(/ /g, "-")}?token=qr_{activeQR.id}
              </span>
              <RefreshCw className="w-3 h-3 hover:text-white cursor-pointer" onClick={resetSimulatorFlow} />
            </div>

            {/* Screen Content Switcher */}
            <div className="flex-1 p-5 flex flex-col justify-between">
              
              <AnimatePresence mode="wait">
                
                {/* A: LOADING STATE */}
                {step === "loading" && (
                  <motion.div
                    key="loading-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center py-20 text-center"
                  >
                    <div className="relative mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-zinc-900 flex items-center justify-center p-3">
                        <img 
                          src={businessProfile.logo} 
                          alt="Logo" 
                          className="w-full h-full object-cover rounded-md animate-pulse"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-950/80 border border-emerald-900 flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-emerald-400 animate-spin" />
                      </div>
                    </div>
                    <h3 className="text-sm font-serif font-medium text-white italic">{businessProfile.name}</h3>
                    <p className="text-[11px] text-zinc-500 mt-1 max-w-[200px]">Establishing secure customer review tunnel...</p>
                    
                    {/* Skeleton mock components to look super high-fidelity */}
                    <div className="w-full max-w-[280px] mt-8 space-y-3">
                      <div className="h-4 bg-zinc-950 rounded-md animate-pulse w-3/4 mx-auto" />
                      <div className="h-3 bg-zinc-950 rounded-md animate-pulse w-5/6 mx-auto" />
                      <div className="flex justify-center space-x-2 pt-4">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className="w-8 h-8 rounded-full bg-zinc-950 animate-pulse" />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* B: SIMULATED INACTIVE SCENARIO */}
                {step !== "loading" && simulateInactive && (
                  <motion.div
                    key="inactive-error-view"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 flex flex-col items-center justify-center text-center py-10 space-y-4"
                  >
                    <div className="w-12 h-12 bg-amber-950/40 text-amber-500 border border-amber-900/30 rounded-full flex items-center justify-center">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-serif font-bold text-white italic">Business Currently Offline</h3>
                      <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                        This business profile is currently marked as unavailable by the merchant administration team.
                      </p>
                    </div>
                    <p className="text-[10px] text-amber-500 bg-amber-950/20 border border-amber-900/30 px-3 py-1.5 rounded-lg max-w-[240px]">
                      "This business is currently unavailable."
                    </p>
                    <button
                      onClick={() => setSimulateInactive(false)}
                      className="mt-4 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-xs text-white rounded-lg border border-zinc-800"
                    >
                      Return Home
                    </button>
                  </motion.div>
                )}

                {/* C: SIMULATED INVALID TOKEN SCENARIO */}
                {step !== "loading" && !simulateInactive && simulateInvalidToken && (
                  <motion.div
                    key="invalid-error-view"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 flex flex-col items-center justify-center text-center py-10 space-y-4"
                  >
                    <div className="w-12 h-12 bg-rose-950/40 text-rose-500 border border-rose-900/30 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-serif font-bold text-white italic">QR Code Not Found</h3>
                      <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                        We could not validate the secure scanning token for this tabletop placement code flyer.
                      </p>
                    </div>
                    <p className="text-[10px] text-rose-500 bg-rose-950/20 border border-rose-900/30 px-3 py-1.5 rounded-lg font-mono">
                      "QR Code Not Found"
                    </p>
                    <button
                      onClick={() => setSimulateInvalidToken(false)}
                      className="mt-4 px-4 py-2 bg-white text-black text-xs rounded-lg hover:bg-zinc-200 transition-colors"
                    >
                      Return Home
                    </button>
                  </motion.div>
                )}

                {/* STEP 1: STAR SELECTION & WELCOME */}
                {step === "rating" && !simulateInactive && !simulateInvalidToken && (
                  <motion.div
                    key="rating-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6 flex-1 flex flex-col justify-between"
                  >
                    
                    {/* Header Branding */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 bg-zinc-950 p-3 rounded-xl border border-zinc-900/80">
                        <img 
                          src={businessProfile.logo} 
                          alt={businessProfile.name} 
                          className="w-10 h-10 rounded-lg object-cover border border-zinc-900"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <h4 className="text-xs font-semibold text-white leading-tight truncate">{businessProfile.name}</h4>
                            <span className="inline-flex items-center px-1 py-0.5 bg-emerald-950 text-emerald-400 text-[8px] rounded border border-emerald-900/50 shrink-0 font-bold uppercase scale-90">
                              <Check className="w-2.5 h-2.5 mr-0.5 fill-emerald-400" />
                              <span>Verified</span>
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-500 truncate">{businessProfile.category} • {businessProfile.address.split(",")[0]}</p>
                        </div>
                      </div>

                      {/* Language Selection */}
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-zinc-500">Language Preference:</span>
                        <select
                          value={portalLanguage}
                          onChange={(e) => handleLanguageChange(e.target.value)}
                          className="bg-zinc-950 border border-zinc-900 text-zinc-300 text-[10px] rounded px-2 py-1 focus:outline-none cursor-pointer"
                        >
                          {languages.map(l => (
                            <option key={l.code} value={l.code}>{l.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2 pt-4 text-center">
                        <h3 className="text-base font-serif font-semibold text-white italic">
                          How was your experience today?
                        </h3>
                        <p className="text-[11px] text-zinc-400 leading-relaxed px-2">
                          Your feedback helps this business improve and helps other customers make informed decisions.
                        </p>
                      </div>
                    </div>

                    {/* INTERACTIVE STARS & EMOJI FEEDBACK */}
                    <div className="space-y-5 text-center py-6">
                      <div className="flex justify-center space-x-2.5">
                        {[1, 2, 3, 4, 5].map((stars) => {
                          const isLit = stars <= (hoverRating || rating);
                          return (
                            <button
                              key={stars}
                              type="button"
                              onClick={() => handleStarSelect(stars)}
                              onMouseEnter={() => setHoverRating(stars)}
                              onMouseLeave={() => setHoverRating(0)}
                              className="p-1 transition-all active:scale-135 focus:outline-none"
                            >
                              <Star 
                                className={`w-10 h-10 transition-colors ${
                                  isLit 
                                    ? "fill-amber-400 text-amber-500 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]" 
                                    : "text-zinc-800 hover:text-zinc-600"
                                }`} 
                              />
                            </button>
                          );
                        })}
                      </div>

                      {/* Live Emoji Reactions based on selected star */}
                      <div className="h-12 flex flex-col justify-center items-center">
                        <AnimatePresence mode="wait">
                          {(hoverRating || rating) > 0 ? (
                            <motion.div
                              key={hoverRating || rating}
                              initial={{ opacity: 0, scale: 0.8, y: 5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="flex items-center space-x-1.5"
                            >
                              <span className="text-2xl leading-none">
                                {getRatingFeedback().emoji}
                              </span>
                              <span className={`text-[11px] font-bold uppercase tracking-wider font-mono ${getRatingFeedback().color}`}>
                                {getRatingFeedback().label}
                              </span>
                            </motion.div>
                          ) : (
                            <span className="text-[10px] text-zinc-600 font-mono">Select rating from 1 to 5 stars to begin</span>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Footer powered branding */}
                    <div className="text-center py-3">
                      {!isProBranding ? (
                        <div className="inline-flex items-center space-x-1 text-[9px] text-zinc-600">
                          <span>Powered by</span>
                          <span className="font-semibold text-zinc-400 tracking-tight flex items-center">
                            Review<span className="text-emerald-500">Please</span>
                          </span>
                        </div>
                      ) : (
                        <div className="h-3" />
                      )}
                    </div>

                  </motion.div>
                )}

                {/* STEP 2A: POSITIVE ROUTE - GOOGLE REDIRECT & AI SUGGESTIONS */}
                {step === "feedback_positive" && !simulateInactive && !simulateInvalidToken && (
                  <motion.div
                    key="positive-view"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4 flex-1 flex flex-col justify-between"
                  >
                    
                    {/* Header */}
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setRating(0);
                          setStep("rating");
                        }}
                        className="inline-flex items-center space-x-1 text-zinc-500 hover:text-white text-[10px] font-mono"
                      >
                        <ArrowLeft className="w-3 h-3" />
                        <span>Go Back</span>
                      </button>

                      <div className="flex items-center justify-between bg-zinc-950 p-3 rounded-xl border border-zinc-900/80">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{getRatingFeedback().emoji}</span>
                          <div>
                            <p className="text-xs font-semibold text-white">Wonderful {rating}-Star Rating!</p>
                            <p className="text-[10px] text-zinc-500">Would you support us on Google?</p>
                          </div>
                        </div>
                        <div className="flex space-x-0.5 text-amber-400">
                          {Array.from({ length: rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-500" />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* SUGGESTED REVIEWS SLIDER */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-zinc-500 font-bold uppercase font-mono flex items-center space-x-1">
                          <Sparkles className="w-3 h-3 text-emerald-400" />
                          <span>AI Assistant Drafts</span>
                        </span>
                        
                        <div className="flex items-center space-x-2">
                          <select
                            value={aiTone}
                            onChange={(e) => setAiTone(e.target.value as any)}
                            className="bg-zinc-950 border border-zinc-900 text-[9px] text-zinc-400 rounded px-1.5 py-0.5 focus:outline-none"
                          >
                            <option value="friendly">Friendly</option>
                            <option value="professional">Professional</option>
                            <option value="casual">Casual</option>
                          </select>
                          <button
                            onClick={regenerateAISuggestions}
                            disabled={aiLoading}
                            className="text-[9px] text-emerald-400 hover:underline flex items-center space-x-0.5"
                          >
                            <RefreshCw className={`w-2.5 h-2.5 ${aiLoading ? "animate-spin" : ""}`} />
                            <span>Regen</span>
                          </button>
                        </div>
                      </div>

                      {aiLoading ? (
                        <div className="py-8 text-center bg-[#080808] border border-zinc-900 rounded-xl">
                          <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin mx-auto mb-2" />
                          <p className="text-[10px] text-zinc-500">Consulting Gemini to compose reviews...</p>
                        </div>
                      ) : (
                        <div className="space-y-1.5 max-h-[145px] overflow-y-auto pr-1">
                          {suggestedReviews.map((text, idx) => (
                            <div 
                              key={idx} 
                              className="p-2.5 bg-zinc-950 border border-zinc-900 rounded-xl relative hover:border-zinc-800 transition-colors"
                            >
                              <div className="flex justify-between items-center mb-1 text-[8px] font-mono text-zinc-500">
                                <span>SUGGESTED DRAFT 0{idx + 1}</span>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => {
                                      setEditedReviewText(text);
                                      setIsEditingCustom(true);
                                      logTelemetry("edit", `Loaded suggested draft 0${idx + 1} into Review Editor.`);
                                    }}
                                    className="text-emerald-400 hover:underline"
                                  >
                                    Use & Edit
                                  </button>
                                  <span>•</span>
                                  <button
                                    onClick={() => copyTextToClipboard(text, idx)}
                                    className="text-white hover:underline flex items-center"
                                  >
                                    {copiedIdx === idx ? "Copied" : "Copy"}
                                  </button>
                                </div>
                              </div>
                              <p className="text-[10px] text-zinc-300 leading-normal line-clamp-3">{text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* RICH REVIEW EDITOR */}
                    <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-3 space-y-2.5">
                      <div className="flex justify-between items-center text-[9px] font-mono">
                        <span className="text-zinc-500">Edit / Review Workspace</span>
                        <span className="text-zinc-600 font-bold">
                          {editedReviewText.length} / 4000 chars
                        </span>
                      </div>

                      <textarea
                        value={editedReviewText}
                        onChange={(e) => {
                          setEditedReviewText(e.target.value);
                          setSaveIndicator("✓ Typing saved");
                          setTimeout(() => setSaveIndicator(""), 1500);
                        }}
                        placeholder="Write your review experience here..."
                        className="w-full bg-[#050505] border border-zinc-900 text-[10px] text-zinc-300 placeholder-zinc-800 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed font-sans h-16 resize-none"
                      />

                      <div className="flex justify-between items-center text-[9px]">
                        <span className="text-emerald-500 font-medium font-mono text-[8px]">
                          {saveIndicator || "✓ Draft Autosaved"}
                        </span>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={triggerAIRewrite}
                            disabled={isRewriting || !editedReviewText.trim()}
                            className="text-[9px] bg-emerald-950/40 text-emerald-400 hover:bg-emerald-950 px-2 py-1 rounded border border-emerald-900/30 flex items-center space-x-1"
                          >
                            {isRewriting ? (
                              <>
                                <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                                <span>Rewriting...</span>
                              </>
                            ) : (
                              <>
                                <Sparkle className="w-2.5 h-2.5 text-emerald-400" />
                                <span>AI Grammar Fix</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => {
                              setEditedReviewText("");
                              logTelemetry("edit", "Cleared editor to write custom review.");
                            }}
                            className="text-zinc-500 hover:text-white"
                          >
                            Clear
                          </button>

                          <button
                            onClick={() => copyTextToClipboard(editedReviewText)}
                            className="text-white bg-zinc-900 hover:bg-zinc-800 px-2 py-1 rounded flex items-center space-x-1"
                          >
                            {isCopiedEditor ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                            <span>Copy</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* DIRECT GOOGLE REDIRECT BUTTON */}
                    <div className="space-y-2">
                      <button
                        onClick={handleContinueToGoogleClick}
                        className="w-full py-2.5 bg-white text-black hover:bg-zinc-200 transition-colors font-bold text-[11px] rounded-xl flex items-center justify-center space-x-2 shadow-lg"
                      >
                        <ExternalLink className="w-4 h-4 shrink-0" />
                        <span>Continue to Google Review</span>
                      </button>
                      <p className="text-[8px] text-zinc-500 text-center leading-relaxed">
                        Copies review draft. Simply paste in the official review window.
                      </p>
                    </div>

                  </motion.div>
                )}

                {/* STEP 2B: NEGATIVE ROUTE - PRIVATE GATE INTEGRATION */}
                {step === "feedback_negative" && !simulateInactive && !simulateInvalidToken && (
                  <motion.div
                    key="negative-view"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-3.5 flex-1 flex flex-col justify-between"
                  >
                    
                    {/* Header */}
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setRating(0);
                          setStep("rating");
                        }}
                        className="inline-flex items-center space-x-1 text-zinc-500 hover:text-white text-[10px] font-mono"
                      >
                        <ArrowLeft className="w-3 h-3" />
                        <span>Back</span>
                      </button>

                      <div className="p-2.5 bg-rose-950/20 border border-rose-900/30 rounded-xl flex items-center space-x-2.5">
                        <div className="p-1.5 bg-rose-950 text-rose-400 rounded-lg shrink-0">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-[11px] font-bold text-white">We want to make it right!</h4>
                          <p className="text-[9px] text-zinc-400">Your concerns will be handled privately by general managers.</p>
                        </div>
                      </div>
                    </div>

                    {/* Private Form */}
                    <form onSubmit={handleFeedbackSubmit} className="space-y-2.5">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[8px] text-zinc-500 font-semibold mb-0.5 uppercase font-mono">Full Name</label>
                          <input
                            type="text"
                            placeholder="John Doe"
                            required
                            value={feedbackName}
                            onChange={(e) => setFeedbackName(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-900 text-[10px] text-white placeholder-zinc-800 rounded-lg px-2 py-1.5 focus:outline-none focus:border-rose-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] text-zinc-500 font-semibold mb-0.5 uppercase font-mono">Email Address</label>
                          <input
                            type="email"
                            placeholder="john@example.com"
                            required
                            value={feedbackEmail}
                            onChange={(e) => setFeedbackEmail(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-900 text-[10px] text-white placeholder-zinc-800 rounded-lg px-2 py-1.5 focus:outline-none focus:border-rose-900"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[8px] text-zinc-500 font-semibold mb-0.5 uppercase font-mono">Phone Number</label>
                          <input
                            type="tel"
                            placeholder="+1 (555) 0123"
                            value={feedbackPhone}
                            onChange={(e) => setFeedbackPhone(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-900 text-[10px] text-white placeholder-zinc-800 rounded-lg px-2 py-1.5 focus:outline-none focus:border-rose-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] text-zinc-500 font-semibold mb-0.5 uppercase font-mono">Issue Area</label>
                          <select
                            value={feedbackCategory}
                            onChange={(e) => setFeedbackCategory(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-900 text-[10px] text-white rounded-lg px-1.5 py-1.5 focus:outline-none focus:border-rose-900"
                          >
                            <option value="Service">Customer Service</option>
                            <option value="Quality">Product / Food Quality</option>
                            <option value="Cleanliness">Facility Cleanliness</option>
                            <option value="Wait Time">Delay / Wait Time</option>
                            <option value="Other">Other Concerns</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[8px] text-zinc-500 font-semibold mb-0.5 uppercase font-mono">Your Direct Message</label>
                        <textarea
                          rows={3}
                          required
                          value={feedbackComments}
                          onChange={(e) => setFeedbackComments(e.target.value)}
                          placeholder="Please let us know what happened. Management will contact you directly to resolve this."
                          className="w-full bg-zinc-950 border border-zinc-900 text-[10px] text-white placeholder-zinc-800 rounded-lg p-2 focus:outline-none focus:border-rose-900 leading-relaxed resize-none h-14"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-xl transition-all flex items-center justify-center space-x-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Private Feedback</span>
                      </button>
                    </form>

                    <div className="text-center py-1">
                      <p className="text-[8px] text-zinc-600">
                        Shield Gating Active: Negative reviews are securely directed to the management desk.
                      </p>
                    </div>

                  </motion.div>
                )}

                {/* THANK YOU / SUCCESS PAGE */}
                {step === "submitted" && !simulateInactive && !simulateInvalidToken && (
                  <motion.div
                    key="thank-you-view"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 flex flex-col justify-between py-2"
                  >
                    
                    {/* Tick Icon */}
                    <div className="text-center space-y-4 pt-4">
                      <div className="w-12 h-12 bg-emerald-950/40 text-emerald-400 border border-emerald-900/30 rounded-full flex items-center justify-center mx-auto shadow-xl animate-bounce">
                        <Check className="w-6 h-6" />
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-base font-serif font-bold text-white italic">Thank You!</h3>
                        <p className="text-[11px] text-zinc-400 leading-relaxed px-4">
                          {rating >= (activeQR?.ratingRequired || 4) ? (
                            <span>Your feedback means a lot to this business. We really appreciate you supporting <strong className="text-white">{businessProfile.name}</strong> on our growth journey!</span>
                          ) : (
                            <span>We have intercepted your report privately. Our executive management desk will review your concerns and respond within 24 hours.</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* COUPON CARD OPTION */}
                    {couponEnabled && (
                      <div className="p-3 bg-zinc-950 border border-dashed border-zinc-800 rounded-xl space-y-2 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-3 h-3 bg-[#050505] rounded-full translate-x-1.5 -translate-y-1.5 border border-zinc-850" />
                        <div className="absolute top-0 left-0 w-3 h-3 bg-[#050505] rounded-full -translate-x-1.5 -translate-y-1.5 border border-zinc-850" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#050505] rounded-full translate-x-1.5 translate-y-1.5 border border-zinc-850" />
                        <div className="absolute bottom-0 left-0 w-3 h-3 bg-[#050505] rounded-full -translate-x-1.5 translate-y-1.5 border border-zinc-850" />
                        
                        <span className="text-[8px] font-mono font-bold text-emerald-400 tracking-wider block uppercase">Review Reward Voucher</span>
                        <h4 className="text-xs font-serif italic text-white font-semibold">{couponReward}</h4>
                        
                        <div className="flex justify-between items-center bg-[#0c0c0c] border border-zinc-900 rounded p-1.5 max-w-[180px] mx-auto text-[10px]">
                          <span className="font-mono text-zinc-400 font-bold tracking-widest">{couponCode}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(couponCode);
                              logTelemetry("edit", `Customer copied thank-you coupon code: "${couponCode}"`);
                            }}
                            className="text-emerald-400 hover:underline font-bold text-[9px]"
                          >
                            Copy Code
                          </button>
                        </div>
                      </div>
                    )}

                    {/* BUSINESS ACTION CTAS */}
                    <div className="space-y-2">
                      <span className="block text-[8px] text-zinc-500 uppercase tracking-widest font-mono text-center mb-1">Engage with business</span>
                      
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <a
                          href={businessProfile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => logTelemetry("redirect", `Customer clicked 'Visit Website': ${businessProfile.website}`)}
                          className="p-2 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 rounded-lg flex items-center space-x-1.5 font-medium transition-colors"
                        >
                          <Globe className="w-3.5 h-3.5 text-zinc-400" />
                          <span className="truncate">Visit Website</span>
                        </a>

                        <a
                          href={`tel:${businessProfile.phone}`}
                          onClick={() => logTelemetry("redirect", `Customer clicked 'Call Business': ${businessProfile.phone}`)}
                          className="p-2 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 rounded-lg flex items-center space-x-1.5 font-medium transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5 text-zinc-400" />
                          <span className="truncate">Call Direct</span>
                        </a>
                      </div>

                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(businessProfile.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => logTelemetry("redirect", "Customer clicked 'Get Directions' link.")}
                        className="w-full p-2 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 rounded-lg flex items-center justify-center space-x-2 font-medium text-[10px] transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Get Directions & Location</span>
                      </a>
                    </div>

                    <button
                      onClick={resetSimulatorFlow}
                      className="w-full py-2 bg-[#111] hover:bg-[#1a1a1a] border border-zinc-800 text-zinc-300 rounded-lg text-[10px] font-semibold transition-colors mt-2"
                    >
                      Simulate Another Scan
                    </button>

                  </motion.div>
                )}

              </AnimatePresence>

            </div>

            {/* CONFIRMATION INTERCEPT DIALOG MODAL (Simulated browser popover) */}
            <AnimatePresence>
              {showConfirmModal && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-6"
                >
                  <motion.div 
                    initial={{ scale: 0.9, y: 15 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 15 }}
                    className="bg-[#0c0c0c] border border-zinc-800 p-5 rounded-2xl max-w-[280px] text-center space-y-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-900/40">
                      <Lock className="w-4.5 h-4.5" />
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white">Proceed to Google Reviews?</h4>
                      <p className="text-[10px] text-zinc-400 leading-normal">
                        You are about to continue to Google to publish your review. You can paste your prepared review draft there before submitting.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold font-mono">
                      <button
                        onClick={() => {
                          setShowConfirmModal(false);
                          logTelemetry("redirect", "Customer aborted Google redirect.");
                        }}
                        className="py-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={confirmGoogleRedirect}
                        className="py-1.5 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400"
                      >
                        Go to Google
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Simulated smartphone home bar */}
            <footer className="h-9 border-t border-[#111] bg-[#080808]/50 flex items-center justify-center pt-1 shrink-0 select-none">
              <div className="w-28 h-1 bg-zinc-800 rounded-full" />
            </footer>

          </div>
        </div>
      </div>

    </div>
  );
}
