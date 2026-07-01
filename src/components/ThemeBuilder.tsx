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
  MessageSquare, 
  AlertCircle,
  ThumbsUp,
  Heart,
  Smile,
  ShieldAlert,
  HelpCircle,
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
  Terminal,
  Layers,
  Palette,
  Sliders,
  Sparkle,
  Download,
  Info,
  Type,
  AlignLeft,
  SmartphoneIcon,
  CheckCircle,
  Undo,
  Save,
  Send,
  Link,
  ChevronRight,
  Upload,
  Image as ImageIcon,
  CheckSquare,
  QrCode,
  Layout,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Twitter,
  Eye,
  FileText,
  MousePointer,
  Sparkles as SparklesIcon
} from "lucide-react";
import { QRCodeItem, BusinessProfile, ThemeConfig } from "../types";

interface ThemeBuilderProps {
  businessProfile: BusinessProfile;
  qrCodes: QRCodeItem[];
  onAddActivityLog: (action: string, details: string, type: "info" | "success" | "warning" | "error" | "ai") => void;
  onAddNotification: (title: string, description: string, type: "review" | "billing" | "ai" | "system") => void;
  onUpdateQRUrl?: (qrId: string, newUrl: string) => void;
}

// 12 Professional Presets for One-Click Apply
const PRESENTS_TEMPLATES: ThemeConfig[] = [
  {
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
    thankYouMessage: "Your feedback means a lot to this business.",
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
  },
  {
    id: "luxury",
    name: "Luxury Noir",
    logo: "",
    coverBanner: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80",
    businessName: "",
    tagline: "Excellence in every detail",
    description: "We strive to deliver perfection. Your review helps us maintain absolute prestige.",
    googleVerified: true,
    favicon: "",
    mode: "dark",
    bgType: "gradient",
    bgColor: "#000000",
    bgGradient: "linear-gradient(135deg, #1c1917 0%, #0c0a09 100%)",
    bgImage: "",
    cardStyle: "glass",
    borderRadius: "none",
    shadows: "lg",
    primaryColor: "#d97706",
    secondaryColor: "#f59e0b",
    accentColor: "#f59e0b",
    buttonColor: "#1c1917",
    buttonTextColor: "#f59e0b",
    textColor: "#f5f5f4",
    cardBgColor: "#1c191 stone-900/80",
    fontFamily: "Playfair Display",
    fontSize: "lg",
    fontWeight: "bold",
    buttonStyle: "square",
    iconStyle: "outline",
    welcomeTitle: "How would you rate our craftsmanship?",
    welcomeMessage: "We value your distinguished feedback.",
    thankYouMessage: "We appreciate your prestigious patronage.",
    ctaButtonText: "Post Prestigious Review",
    starColor: "#d97706",
    emojiStyle: "minimal",
    ratingLabels: {
      1: "Unacceptable",
      2: "Below Expectations",
      3: "Satisfactory",
      4: "Highly Accomplished",
      5: "Impeccable Masterpiece"
    },
    aiEnabled: true,
    aiSectionTitle: "AI Writing Assistant",
    aiGenerateBtnText: "Refine Suggestions",
    aiRewriteBtnText: "Formal Rewrite",
    aiLanguageSelector: true,
    aiToneSelector: false,
    enabledLanguages: ["English", "Spanish"],
    googleBtnText: "Publish to Google Reviews",
    googleBtnIcon: "Google",
    copyBtnText: "Copy Elegantly",
    visitWebsiteText: "Our Website",
    callText: "Concierge Hot-line",
    whatsappText: "Direct Representative",
    directionsText: "Find Location",
    socialLinks: {
      website: true,
      instagram: true,
      facebook: false,
      linkedin: true,
      whatsapp: true,
      youtube: true,
      x: false,
      maps: true
    },
    footerText: "Under strict copyright. Luxury concierge systems.",
    privacyLink: "#",
    termsLink: "#",
    hidePoweredBy: true
  },
  {
    id: "cafe",
    name: "Café Espresso",
    logo: "",
    coverBanner: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80",
    businessName: "",
    tagline: "Freshly brewed experiences",
    description: "Did your cup bring a smile to your face today? Let us know!",
    googleVerified: false,
    favicon: "",
    mode: "light",
    bgType: "color",
    bgColor: "#fafaf9",
    bgGradient: "linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 100%)",
    bgImage: "",
    cardStyle: "bordered",
    borderRadius: "full",
    shadows: "sm",
    primaryColor: "#7c2d12",
    secondaryColor: "#9a3412",
    accentColor: "#ea580c",
    buttonColor: "#7c2d12",
    buttonTextColor: "#ffffff",
    textColor: "#44403c",
    cardBgColor: "#ffffff",
    fontFamily: "Outfit",
    fontSize: "md",
    fontWeight: "medium",
    buttonStyle: "pill",
    iconStyle: "solid",
    welcomeTitle: "How was your brew today?",
    welcomeMessage: "Love your coffee? Share the aroma with the world!",
    thankYouMessage: "Thanks a latte! Your review keeps us steaming.",
    ctaButtonText: "Share Brew Feedback",
    starColor: "#ea580c",
    emojiStyle: "default",
    ratingLabels: {
      1: "Cold/Bitter",
      2: "Needs sugar",
      3: "Average Sip",
      4: "Yummy Brew",
      5: "Perfect Espresso!"
    },
    aiEnabled: true,
    aiSectionTitle: "AI Brew Writer",
    aiGenerateBtnText: "Spill the Beans",
    aiRewriteBtnText: "Sweeten Text",
    aiLanguageSelector: true,
    aiToneSelector: true,
    enabledLanguages: ["English", "Hindi", "Hinglish"],
    googleBtnText: "Share On Google",
    googleBtnIcon: "Google",
    copyBtnText: "Copy Review Text",
    visitWebsiteText: "Our Menu",
    callText: "Dial Cafe",
    whatsappText: "Order Delivery",
    directionsText: "Locate Cafe",
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
    footerText: "Brewed with care locally.",
    privacyLink: "#",
    termsLink: "#",
    hidePoweredBy: false
  },
  {
    id: "minimal",
    name: "Nordic Minimal",
    logo: "",
    coverBanner: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80",
    businessName: "",
    tagline: "Simplicity is perfection",
    description: "Write an honest review. Less is more.",
    googleVerified: true,
    favicon: "",
    mode: "light",
    bgType: "color",
    bgColor: "#f4f4f5",
    bgGradient: "",
    bgImage: "",
    cardStyle: "solid",
    borderRadius: "md",
    shadows: "none",
    primaryColor: "#09090b",
    secondaryColor: "#27272a",
    accentColor: "#3f3f46",
    buttonColor: "#09090b",
    buttonTextColor: "#ffffff",
    textColor: "#18181b",
    cardBgColor: "#ffffff",
    fontFamily: "Inter",
    fontSize: "sm",
    fontWeight: "normal",
    buttonStyle: "rounded",
    iconStyle: "outline",
    welcomeTitle: "How did we do?",
    welcomeMessage: "Provide simple stars feedback.",
    thankYouMessage: "Thank you.",
    ctaButtonText: "Post to Google",
    starColor: "#18181b",
    emojiStyle: "minimal",
    ratingLabels: {
      1: "Poor",
      2: "Mediocre",
      3: "Average",
      4: "Good",
      5: "Excellent"
    },
    aiEnabled: true,
    aiSectionTitle: "Draft Helper",
    aiGenerateBtnText: "Generate",
    aiRewriteBtnText: "Simplify",
    aiLanguageSelector: false,
    aiToneSelector: false,
    enabledLanguages: ["English"],
    googleBtnText: "Google Redirect",
    googleBtnIcon: "Google",
    copyBtnText: "Copy Text",
    visitWebsiteText: "Website",
    callText: "Call",
    whatsappText: "WhatsApp",
    directionsText: "Directions",
    socialLinks: {
      website: true,
      instagram: true,
      facebook: false,
      linkedin: false,
      whatsapp: false,
      youtube: false,
      x: false,
      maps: true
    },
    footerText: "Copyright 2026",
    privacyLink: "#",
    termsLink: "#",
    hidePoweredBy: false
  },
  {
    id: "restaurant",
    name: "Spicy Bistro",
    logo: "",
    coverBanner: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
    businessName: "",
    tagline: "Taste that makes you travel",
    description: "How was the seasoning and hospitality today?",
    googleVerified: true,
    favicon: "",
    mode: "light",
    bgType: "gradient",
    bgColor: "#fffaf0",
    bgGradient: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
    bgImage: "",
    cardStyle: "solid",
    borderRadius: "lg",
    shadows: "md",
    primaryColor: "#ea580c",
    secondaryColor: "#c2410c",
    accentColor: "#ca8a04",
    buttonColor: "#ea580c",
    buttonTextColor: "#ffffff",
    textColor: "#431407",
    cardBgColor: "#ffffff",
    fontFamily: "Outfit",
    fontSize: "md",
    fontWeight: "medium",
    buttonStyle: "rounded",
    iconStyle: "solid",
    welcomeTitle: "Was your meal mouth-watering?",
    welcomeMessage: "Rate our dishes and hospitality. We read every word!",
    thankYouMessage: "A delicious thank you! Hope to feed you again soon.",
    ctaButtonText: "Post Food Review",
    starColor: "#ea580c",
    emojiStyle: "default",
    ratingLabels: {
      1: "Tasteless/Cold",
      2: "Needs Flavor",
      3: "Average Taste",
      4: "Very Delicious",
      5: "Culinary Heaven!"
    },
    aiEnabled: true,
    aiSectionTitle: "AI Recipe Reviewer",
    aiGenerateBtnText: "Draft Tasty Review",
    aiRewriteBtnText: "Spice It Up",
    aiLanguageSelector: true,
    aiToneSelector: true,
    enabledLanguages: ["English", "Hindi", "Hinglish", "Bengali", "Tamil", "Telugu"],
    googleBtnText: "Publish To Google",
    googleBtnIcon: "Google",
    copyBtnText: "Copy Food Review",
    visitWebsiteText: "Online Menu & Orders",
    callText: "Reserve Table",
    whatsappText: "Catering Inquiry",
    directionsText: "Drive to Bistro",
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
    footerText: "All recipes traditional and fresh.",
    privacyLink: "#",
    termsLink: "#",
    hidePoweredBy: false
  },
  {
    id: "salon",
    name: "Glow & Co. Salon",
    logo: "",
    coverBanner: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80",
    businessName: "",
    tagline: "Unleash your true style",
    description: "Are you loving your brand new look today? Share your stylist review!",
    googleVerified: false,
    favicon: "",
    mode: "light",
    bgType: "color",
    bgColor: "#fff1f2",
    bgGradient: "",
    bgImage: "",
    cardStyle: "solid",
    borderRadius: "lg",
    shadows: "md",
    primaryColor: "#db2777",
    secondaryColor: "#be185d",
    accentColor: "#be185d",
    buttonColor: "#db2777",
    buttonTextColor: "#ffffff",
    textColor: "#4c0519",
    cardBgColor: "#ffffff",
    fontFamily: "Space Grotesk",
    fontSize: "md",
    fontWeight: "medium",
    buttonStyle: "rounded",
    iconStyle: "solid",
    welcomeTitle: "Loving your new glow?",
    welcomeMessage: "Rate your stylist and salon pampering experience today!",
    thankYouMessage: "You are beautiful! Thank you for sharing your experience.",
    ctaButtonText: "Recommend Stylist",
    starColor: "#db2777",
    emojiStyle: "default",
    ratingLabels: {
      1: "Bad Hair Day",
      2: "Uneven Cut",
      3: "Just Okay",
      4: "Fabulous Treatment",
      5: "Absolute Transformation!"
    },
    aiEnabled: true,
    aiSectionTitle: "AI Style Copywriter",
    aiGenerateBtnText: "Draft Salon Post",
    aiRewriteBtnText: "Polished Glow",
    aiLanguageSelector: true,
    aiToneSelector: true,
    enabledLanguages: ["English", "Hindi", "Hinglish"],
    googleBtnText: "Share on Google",
    googleBtnIcon: "Google",
    copyBtnText: "Copy Draft Review",
    visitWebsiteText: "Book Appointment",
    callText: "Call Front Desk",
    whatsappText: "WhatsApp Consult",
    directionsText: "Drive to Salon",
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
    footerText: "Style is a way to say who you are.",
    privacyLink: "#",
    termsLink: "#",
    hidePoweredBy: false
  }
];

export default function ThemeBuilder({
  businessProfile,
  qrCodes,
  onAddActivityLog,
  onAddNotification,
  onUpdateQRUrl
}: ThemeBuilderProps) {
  // Active selected customizable QR code (for URL binding)
  const [activeQRId, setActiveQRId] = useState<string>(
    qrCodes.length > 0 ? qrCodes[0].id : ""
  );

  const activeQRItem = qrCodes.find(q => q.id === activeQRId);

  // Core Theme State loaded with default Classic Template
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    const classic = { ...PRESENTS_TEMPLATES[0] };
    classic.logo = businessProfile.logo;
    classic.businessName = businessProfile.name;
    return classic;
  });

  // Active editor tab
  const [activeTab, setActiveTab] = useState<"branding" | "colors" | "welcome" | "ai" | "buttons" | "social" | "footer" | "nfc_domain" | "analytics">("branding");

  // Local state for copy indicator
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Review portal preview simulation states (internal to device display mockup)
  const [portalLanguage, setPortalLanguage] = useState<string>("English");
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [step, setStep] = useState<"loading" | "rating" | "feedback_positive" | "feedback_negative" | "submitted">("rating");
  const [editedText, setEditedText] = useState<string>("");
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [couponCopied, setCouponCopied] = useState<boolean>(false);

  // Private direct feedback states for negative review flow preview
  const [directName, setDirectName] = useState("");
  const [directComments, setDirectComments] = useState("");

  // Simulated live clock for the phone frame
  const [currentTime, setCurrentTime] = useState("10:14 AM");

  // Sync business details if they update
  useEffect(() => {
    setTheme(prev => ({
      ...prev,
      logo: prev.logo || businessProfile.logo,
      businessName: prev.businessName || businessProfile.name
    }));
  }, [businessProfile]);

  // Update clock
  useEffect(() => {
    const now = new Date();
    setCurrentTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  }, []);

  // Update default edited text when rating changes in mockup
  useEffect(() => {
    if (rating > 0) {
      const isPositive = rating >= (activeQRItem?.ratingRequired || 4);
      if (isPositive) {
        setEditedText(`I had a brilliant experience at ${theme.businessName || businessProfile.name}! Highly recommend their premium services.`);
      } else {
        setEditedText(`Service could be improved at ${theme.businessName || businessProfile.name}. Had minor delays during my visit.`);
      }
    }
  }, [rating]);

  // One-click template applicator
  const applyTemplate = (template: ThemeConfig) => {
    setTheme({
      ...template,
      logo: businessProfile.logo,
      businessName: businessProfile.name
    });
    setRating(0);
    setStep("rating");
    onAddActivityLog(
      "Theme Template Applied",
      `Applied ready-made "${template.name}" visual presets to review page.`,
      "info"
    );
    onAddNotification(
      "Theme Applied",
      `The "${template.name}" ready-made template was successfully loaded in builder!`,
      "ai"
    );
  };

  // Copy customized permanent URL
  const handleCopyUrl = (url: string, label: string) => {
    navigator.clipboard.writeText(url);
    setCopySuccess(label);
    setTimeout(() => setCopySuccess(null), 2500);
    onAddActivityLog(
      "URL Copied",
      `Copied permanent review page URL: ${url}`,
      "success"
    );
  };

  // Generate NFC content payload link
  const generateNFCLink = () => {
    if (!activeQRItem) return;
    const nfcPayload = `${window.location.origin}/nfc-tag-write?payload=${encodeURIComponent(activeQRItem.url)}`;
    navigator.clipboard.writeText(nfcPayload);
    alert(`NFC NDEF Tag write URI prepared and copied to clipboard:\n\n${nfcPayload}`);
    onAddActivityLog(
      "NFC Link Generated",
      `Compiled standard NDEF NFC tag payload matching dynamic short code.`,
      "info"
    );
  };

  // Trigger save theme configuration
  const handleSaveTheme = (isPublish: boolean = false) => {
    // Save draft in localStorage
    localStorage.setItem("reviewplease_theme_config", JSON.stringify(theme));
    
    onAddActivityLog(
      isPublish ? "Theme Customization Published" : "Theme Saved as Draft",
      `Review page styling and typography changes successfully stored.`,
      isPublish ? "success" : "info"
    );

    onAddNotification(
      isPublish ? "Review Page Live!" : "Theme Saved",
      isPublish 
        ? "Your gorgeous, mobile-first QR review page has been deployed live!" 
        : "Your customizations have been successfully saved as a draft.",
      "system"
    );
    
    alert(isPublish ? "🎉 Congratulations! Your customized review page theme has been published live." : "Theme configuration saved successfully as draft.");
  };

  // Reset theme back to default slate
  const handleResetTheme = () => {
    if (confirm("Are you sure you want to reset all modifications back to the Classic Slate template?")) {
      const classic = { ...PRESENTS_TEMPLATES[0] };
      classic.logo = businessProfile.logo;
      classic.businessName = businessProfile.name;
      setTheme(classic);
      setRating(0);
      setStep("rating");
      onAddActivityLog("Theme Configurations Reset", "Restored standard default settings.", "warning");
    }
  };

  // Export theme as JSON
  const handleExportTheme = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(theme, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `reviewplease_theme_${theme.name.toLowerCase().replace(/ /g, "_")}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onAddActivityLog("Theme Exported", "Downloaded JSON styling payload.", "success");
  };

  // Import theme from JSON
  const handleImportTheme = () => {
    const input = prompt("Paste your exported Theme JSON payload here:");
    if (!input) return;
    try {
      const parsed = JSON.parse(input);
      if (parsed.id && parsed.name) {
        setTheme(parsed);
        alert("🎉 Custom Theme Imported and Applied Successfully!");
        onAddActivityLog("Theme Imported", `Imported custom theme configuration: "${parsed.name}"`, "success");
      } else {
        alert("Invalid Theme JSON structure. Please check and try again.");
      }
    } catch (e) {
      alert("Error parsing JSON. Please ensure you copied the entire exported text correctly.");
    }
  };

  // Duplicate current theme
  const handleDuplicateTheme = () => {
    const copy = {
      ...theme,
      id: "theme_" + Math.random().toString(36).substr(2, 5),
      name: `${theme.name} (Copy)`
    };
    setTheme(copy);
    alert(`🎉 Duplicated theme successfully! Currently working on "${copy.name}".`);
    onAddActivityLog("Theme Duplicated", `Created clone copy: ${copy.name}`, "info");
  };

  // Helper to resolve font styles dynamically
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

  // Helper to resolve button border radius
  const getBtnRadiusClass = () => {
    if (theme.buttonStyle === "pill") return "rounded-full";
    if (theme.buttonStyle === "square") return "rounded-none";
    return "rounded-xl";
  };

  // Helper to resolve card border radius
  const getCardRadiusStyle = () => {
    if (theme.borderRadius === "none") return "0px";
    if (theme.borderRadius === "sm") return "6px";
    if (theme.borderRadius === "md") return "12px";
    if (theme.borderRadius === "lg") return "20px";
    return "32px";
  };

  // Card shadow styling
  const getCardShadowStyle = () => {
    if (theme.shadows === "none") return "none";
    if (theme.shadows === "sm") return "0 2px 4px rgba(0,0,0,0.1)";
    if (theme.shadows === "md") return "0 8px 16px rgba(0,0,0,0.15)";
    return "0 20px 32px rgba(0,0,0,0.25)";
  };

  return (
    <div id="theme-builder-workspace" className="space-y-6">
      
      {/* 1. Permanent Short URL Quick Actions Panel */}
      <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-4 mb-4">
          <div>
            <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider font-bold">
              ReviewPlease Permanent Redirect Link Routing
            </span>
            <h3 className="text-lg font-serif text-white italic mt-1">Permanent Review URL</h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs text-zinc-500 font-mono">Current Active QR:</span>
            <select
              value={activeQRId}
              onChange={(e) => setActiveQRId(e.target.value)}
              className="bg-[#050505] border border-zinc-800 rounded-lg p-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
            >
              {qrCodes.map(q => (
                <option key={q.id} value={q.id}>{q.name}</option>
              ))}
            </select>
          </div>
        </div>

        {activeQRItem ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              
              {/* Custom slug editable path mock */}
              <div className="md:col-span-6 bg-[#050505] border border-zinc-900 rounded-xl p-3 flex items-center justify-between">
                <div className="flex-1 min-w-0 font-mono text-xs">
                  <span className="text-zinc-600">{window.location.host}/r/</span>
                  <span className="text-emerald-400 font-semibold">{activeQRItem.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}</span>
                </div>
                <span className="text-[9px] text-emerald-400 bg-emerald-950/20 border border-emerald-900/40 px-2 py-0.5 rounded uppercase font-bold tracking-tight">
                  Permanent Link
                </span>
              </div>

              {/* Action grid button triggers */}
              <div className="md:col-span-6 flex flex-wrap gap-2 justify-end">
                <button
                  onClick={() => handleCopyUrl(activeQRItem.url, "qrUrl")}
                  className="px-3.5 py-2 rounded-xl bg-[#141414] border border-zinc-800 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors flex items-center space-x-1.5"
                >
                  <Copy className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{copySuccess === "qrUrl" ? "Copied!" : "Copy Link"}</span>
                </button>

                <button
                  onClick={() => window.open(activeQRItem.url, "_blank")}
                  className="px-3.5 py-2 rounded-xl bg-[#141414] border border-zinc-800 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors flex items-center space-x-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Open URL</span>
                </button>

                <button
                  onClick={generateNFCLink}
                  className="px-3.5 py-2 rounded-xl bg-[#141414] border border-zinc-800 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors flex items-center space-x-1.5"
                  title="Generate dynamic payload for contactless NFC Tabletop Cards"
                >
                  <SmartphoneIcon className="w-3.5 h-3.5 text-zinc-500" />
                  <span>NFC Tag Link</span>
                </button>

                <button
                  onClick={() => handleCopyUrl(`https://rpl.io/s/${activeQRItem.id.split("_")[1]}`, "shortUrl")}
                  className="px-3.5 py-2 rounded-xl bg-[#141414] border border-zinc-800 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors flex items-center space-x-1.5 font-mono"
                  title="Create 4-letter short URL for SMS or Instabio"
                >
                  <Link className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{copySuccess === "shortUrl" ? "Copied short link!" : "Get Short URL"}</span>
                </button>
              </div>
            </div>

            {/* Warning that redirect doesn't break if flyer reprints */}
            <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl flex items-start space-x-2.5 text-[11px] text-zinc-500 leading-relaxed">
              <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>Zero-Reprint Guarantee:</strong> Business owners can completely rewrite or swap out Google Maps locations, design themes, and routing stars targets anytime. The printed QR codes and permanent landing page URL will <strong>never change</strong>, preserving your tabletop flyers forever!
              </span>
            </div>
          </div>
        ) : (
          <p className="text-zinc-500 text-xs text-center py-4">Generate your first QR Code under the QR Codes tab to set up a permanent link.</p>
        )}
      </div>

      {/* 2. One-Click Template presets applicator bar */}
      <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-6">
        <h4 className="text-xs font-semibold text-white uppercase tracking-widest font-mono mb-3.5 flex items-center space-x-1.5">
          <Palette className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>One-Click Professional Presets Theme Templates</span>
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {PRESENTS_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => applyTemplate(tpl)}
              className={`p-3 text-left rounded-xl border transition-all flex flex-col justify-between hover:scale-[1.03] hover:border-zinc-500 relative overflow-hidden group ${
                theme.id === tpl.id 
                  ? "bg-zinc-900 border-emerald-500 text-white" 
                  : "bg-[#050505] border-[#1a1a1a] text-zinc-400"
              }`}
            >
              <div>
                <span className="text-xs font-semibold block group-hover:text-white transition-colors">{tpl.name}</span>
                <span className="text-[9px] text-zinc-600 block mt-0.5 capitalize">{tpl.mode} • {tpl.fontFamily}</span>
              </div>
              <div className="flex items-center space-x-1.5 mt-3.5">
                <span className="w-3.5 h-3.5 rounded-full border border-zinc-850" style={{ backgroundColor: tpl.primaryColor }} />
                <span className="w-3.5 h-3.5 rounded-full border border-zinc-850" style={{ backgroundColor: tpl.bgColor }} />
                <span className="w-3.5 h-3.5 rounded-full border border-zinc-850" style={{ backgroundColor: tpl.buttonColor }} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Builder Interface layout (Grid: LEFT = Control Panel, RIGHT = Instant Live Smartphone Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* BUILDER SIDEBAR / CONTROLS (7 Cols) */}
        <div className="lg:col-span-7 bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl overflow-hidden flex flex-col">
          
          {/* Tab switches */}
          <div className="flex flex-wrap border-b border-zinc-900 bg-[#060608] p-1 font-mono text-[10px]">
            {[
              { id: "branding", label: "Branding" },
              { id: "colors", label: "Colors & Shape" },
              { id: "welcome", label: "Greetings" },
              { id: "ai", label: "AI & Languages" },
              { id: "buttons", label: "Buttons" },
              { id: "social", label: "Social Links" },
              { id: "footer", label: "Footer" },
              { id: "nfc_domain", label: "Custom Domain" },
              { id: "analytics", label: "Stats" }
            ].map(tb => (
              <button
                key={tb.id}
                onClick={() => setActiveTab(tb.id as any)}
                className={`px-3 py-2 rounded-lg transition-all ${
                  activeTab === tb.id 
                    ? "bg-white text-black font-bold" 
                    : "text-zinc-400 hover:text-white hover:bg-zinc-950"
                }`}
              >
                {tb.label}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-6">
            
            {/* TAB 1: BRANDING */}
            {activeTab === "branding" && (
              <div className="space-y-4">
                <h3 className="text-sm font-serif text-white italic">Page Branding Identifiers</h3>
                <p className="text-[11px] text-zinc-500 leading-relaxed">Modify client perception by updating logo, banners, verification, and name headers.</p>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-1 font-mono">Business Name</label>
                    <input
                      type="text"
                      value={theme.businessName}
                      onChange={(e) => setTheme({ ...theme, businessName: e.target.value })}
                      className="w-full bg-[#050505] border border-zinc-900 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-1 font-mono">Brand Tagline</label>
                    <input
                      type="text"
                      value={theme.tagline}
                      onChange={(e) => setTheme({ ...theme, tagline: e.target.value })}
                      className="w-full bg-[#050505] border border-zinc-900 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-1 font-mono">Page Meta Description</label>
                    <textarea
                      rows={2}
                      value={theme.description}
                      onChange={(e) => setTheme({ ...theme, description: e.target.value })}
                      className="w-full bg-[#050505] border border-zinc-900 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-1 font-mono">Favicon Link (.ico)</label>
                      <input
                        type="text"
                        placeholder="https://example.com/favicon.ico"
                        value={theme.favicon}
                        onChange={(e) => setTheme({ ...theme, favicon: e.target.value })}
                        className="w-full bg-[#050505] border border-zinc-900 rounded-xl p-2.5 text-xs text-white focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-1 font-mono">Cover Banner Image URL</label>
                      <input
                        type="text"
                        value={theme.coverBanner}
                        onChange={(e) => setTheme({ ...theme, coverBanner: e.target.value })}
                        className="w-full bg-[#050505] border border-zinc-900 rounded-xl p-2.5 text-xs text-white focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-900 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <div>
                        <p className="text-white text-xs font-semibold">Google Verified Badge</p>
                        <p className="text-[9px] text-zinc-500">Show a secure G-verified check banner to bolster authentic customer trust</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={theme.googleVerified}
                      onChange={(e) => setTheme({ ...theme, googleVerified: e.target.checked })}
                      className="w-4 h-4 rounded bg-[#050505] accent-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: COLORS & SHAPE */}
            {activeTab === "colors" && (
              <div className="space-y-4">
                <h3 className="text-sm font-serif text-white italic">Theme styling, palettes & aesthetics</h3>
                <p className="text-[11px] text-zinc-500">Unleash branding continuity. Adjust colors, card styles, and premium glassmorphism.</p>
                
                <div className="space-y-4">
                  
                  {/* Mode */}
                  <div className="grid grid-cols-3 gap-2 p-1 bg-zinc-950 rounded-xl border border-zinc-900 font-mono text-[10px]">
                    {["light", "dark", "auto"].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setTheme({ ...theme, mode: m as any })}
                        className={`py-1.5 rounded-lg capitalize font-bold ${theme.mode === m ? "bg-white text-black" : "text-zinc-400 hover:text-white"}`}
                      >
                        {m} Theme
                      </button>
                    ))}
                  </div>

                  {/* Bg Type */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-1 font-mono">Background Canvas Type</label>
                      <select
                        value={theme.bgType}
                        onChange={(e) => setTheme({ ...theme, bgType: e.target.value as any })}
                        className="w-full bg-[#050505] border border-zinc-900 rounded-xl p-2 text-xs text-white focus:outline-none"
                      >
                        <option value="color">Solid Base Color</option>
                        <option value="gradient">Luxurious Gradient</option>
                        <option value="image">Ambient Image URL</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-1 font-mono">Typography Family</label>
                      <select
                        value={theme.fontFamily}
                        onChange={(e) => setTheme({ ...theme, fontFamily: e.target.value as any })}
                        className="w-full bg-[#050505] border border-zinc-900 rounded-xl p-2 text-xs text-white focus:outline-none font-mono"
                      >
                        <option value="Inter">Inter (Swiss Sans)</option>
                        <option value="Space Grotesk">Space Grotesk (Neo Tech)</option>
                        <option value="Outfit">Outfit (Elegant Circle)</option>
                        <option value="Playfair Display">Playfair Display (Serif/Luxury)</option>
                        <option value="JetBrains Mono">JetBrains Mono (Symmetry Tech)</option>
                        <option value="Roboto">Roboto (Standard)</option>
                      </select>
                    </div>
                  </div>

                  {/* Bg values input */}
                  {theme.bgType === "color" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-1 font-mono font-bold">Background Color</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={theme.bgColor}
                            onChange={(e) => setTheme({ ...theme, bgColor: e.target.value })}
                            className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            value={theme.bgColor}
                            onChange={(e) => setTheme({ ...theme, bgColor: e.target.value })}
                            className="w-full bg-[#050505] border border-zinc-900 rounded-xl p-2 text-xs text-white focus:outline-none font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-1 font-mono font-bold">Primary Brand Accent</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={theme.primaryColor}
                            onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value, buttonColor: e.target.value })}
                            className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            value={theme.primaryColor}
                            onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value, buttonColor: e.target.value })}
                            className="w-full bg-[#050505] border border-zinc-900 rounded-xl p-2 text-xs text-white focus:outline-none font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {theme.bgType === "gradient" && (
                    <div>
                      <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-1 font-mono font-bold">Linear Gradient Payload</label>
                      <input
                        type="text"
                        value={theme.bgGradient}
                        onChange={(e) => setTheme({ ...theme, bgGradient: e.target.value })}
                        className="w-full bg-[#050505] border border-zinc-900 rounded-xl p-2.5 text-xs text-white focus:outline-none font-mono"
                        placeholder="linear-gradient(135deg, #0f0c20 0%, #060608 100%)"
                      />
                    </div>
                  )}

                  {theme.bgType === "image" && (
                    <div>
                      <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-1 font-mono font-bold">Unsplash/External Background Image URL</label>
                      <input
                        type="text"
                        value={theme.bgImage}
                        onChange={(e) => setTheme({ ...theme, bgImage: e.target.value })}
                        className="w-full bg-[#050505] border border-zinc-900 rounded-xl p-2.5 text-xs text-white focus:outline-none font-mono"
                        placeholder="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80"
                      />
                    </div>
                  )}

                  {/* Brand Color fine-tuning */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-zinc-950 border border-zinc-900 rounded-xl">
                    <div>
                      <label className="block text-[9px] text-zinc-500 font-bold uppercase mb-1 font-mono">Button Hex Color</label>
                      <input
                        type="text"
                        value={theme.buttonColor}
                        onChange={(e) => setTheme({ ...theme, buttonColor: e.target.value })}
                        className="w-full bg-[#050505] border border-[#1a1a1a] rounded p-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-zinc-500 font-bold uppercase mb-1 font-mono">Button Text Hex</label>
                      <input
                        type="text"
                        value={theme.buttonTextColor}
                        onChange={(e) => setTheme({ ...theme, buttonTextColor: e.target.value })}
                        className="w-full bg-[#050505] border border-[#1a1a1a] rounded p-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-zinc-500 font-bold uppercase mb-1 font-mono">Main Text Color</label>
                      <input
                        type="text"
                        value={theme.textColor}
                        onChange={(e) => setTheme({ ...theme, textColor: e.target.value })}
                        className="w-full bg-[#050505] border border-[#1a1a1a] rounded p-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-zinc-500 font-bold uppercase mb-1 font-mono">Container Card Hex</label>
                      <input
                        type="text"
                        value={theme.cardBgColor}
                        onChange={(e) => setTheme({ ...theme, cardBgColor: e.target.value })}
                        className="w-full bg-[#050505] border border-[#1a1a1a] rounded p-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Shapes, Borders, Shadows */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-1 font-mono">Card Base Style</label>
                      <select
                        value={theme.cardStyle}
                        onChange={(e) => setTheme({ ...theme, cardStyle: e.target.value as any })}
                        className="w-full bg-[#050505] border border-zinc-900 rounded-xl p-2 text-xs text-white"
                      >
                        <option value="solid">Flat / Solid</option>
                        <option value="bordered">Outlined border</option>
                        <option value="glass">Glassmorphism blur</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-1 font-mono">Border Radius</label>
                      <select
                        value={theme.borderRadius}
                        onChange={(e) => setTheme({ ...theme, borderRadius: e.target.value as any })}
                        className="w-full bg-[#050505] border border-zinc-900 rounded-xl p-2 text-xs text-white"
                      >
                        <option value="none">Sharp / None</option>
                        <option value="sm">Chiseled / Sm</option>
                        <option value="md">Modern / Md</option>
                        <option value="lg">Soft Elegant / Lg</option>
                        <option value="full">High Curved / Full</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-1 font-mono">Box Shadows</label>
                      <select
                        value={theme.shadows}
                        onChange={(e) => setTheme({ ...theme, shadows: e.target.value as any })}
                        className="w-full bg-[#050505] border border-zinc-900 rounded-xl p-2 text-xs text-white"
                      >
                        <option value="none">Flat / None</option>
                        <option value="sm">Subtle / Sm</option>
                        <option value="md">Elevated / Md</option>
                        <option value="lg">Floating / Lg</option>
                      </select>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB 3: GREETINGS & STARS */}
            {activeTab === "welcome" && (
              <div className="space-y-4">
                <h3 className="text-sm font-serif text-white italic">Welcome Headers & Stars rating customization</h3>
                <p className="text-[11px] text-zinc-500">Edit greeting headers, star colors, and interactive rating labels.</p>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-1 font-mono">Welcome Question / Title</label>
                    <input
                      type="text"
                      value={theme.welcomeTitle}
                      onChange={(e) => setTheme({ ...theme, welcomeTitle: e.target.value })}
                      className="w-full bg-[#050505] border border-zinc-900 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-1 font-mono">Welcome Support Subtitle</label>
                    <textarea
                      rows={2}
                      value={theme.welcomeMessage}
                      onChange={(e) => setTheme({ ...theme, welcomeMessage: e.target.value })}
                      className="w-full bg-[#050505] border border-zinc-900 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-1 font-mono">Interactive Star Icon Color</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={theme.starColor}
                        onChange={(e) => setTheme({ ...theme, starColor: e.target.value })}
                        className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={theme.starColor}
                        onChange={(e) => setTheme({ ...theme, starColor: e.target.value })}
                        className="w-full bg-[#050505] border border-zinc-900 rounded-xl p-2 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Rating labels list */}
                  <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl space-y-2.5">
                    <span className="block text-[9px] text-zinc-500 font-bold uppercase font-mono">Rating Emoji Feedback Text Labels</span>
                    
                    <div className="grid grid-cols-5 gap-2 text-center text-xs text-zinc-500 font-bold">
                      <span>1 Star</span>
                      <span>2 Star</span>
                      <span>3 Star</span>
                      <span>4 Star</span>
                      <span>5 Star</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5].map(st => (
                        <input
                          key={st}
                          type="text"
                          value={theme.ratingLabels[st] || ""}
                          onChange={(e) => {
                            const updatedLabels = { ...theme.ratingLabels, [st]: e.target.value };
                            setTheme({ ...theme, ratingLabels: updatedLabels });
                          }}
                          className="w-full bg-[#050505] border border-zinc-900 rounded p-1.5 text-[10px] text-white focus:outline-none"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: AI & LANGUAGES */}
            {activeTab === "ai" && (
              <div className="space-y-4">
                <h3 className="text-sm font-serif text-white italic">AI Review Generator & Supported Languages</h3>
                <p className="text-[11px] text-zinc-500">Configure the AI suggestion engine and restrict available language preferences.</p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3.5 bg-zinc-950 border border-zinc-900 rounded-xl">
                    <div className="flex items-center space-x-2.5">
                      <SparklesIcon className="w-5 h-5 text-emerald-400 animate-spin-slow" />
                      <div>
                        <p className="text-white text-xs font-semibold">Enable AI Review Assistant suggestions</p>
                        <p className="text-[9px] text-zinc-500">Auto-draft reviews matching rating to increase customer output by 3x</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={theme.aiEnabled}
                      onChange={(e) => setTheme({ ...theme, aiEnabled: e.target.checked })}
                      className="w-4 h-4 rounded bg-[#050505] accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  {theme.aiEnabled && (
                    <div className="space-y-3 p-4 bg-zinc-950 border border-zinc-900 rounded-xl">
                      <div>
                        <label className="block text-[9px] text-zinc-500 font-bold uppercase mb-1 font-mono">AI Section Title</label>
                        <input
                          type="text"
                          value={theme.aiSectionTitle}
                          onChange={(e) => setTheme({ ...theme, aiSectionTitle: e.target.value })}
                          className="w-full bg-[#050505] border border-[#1a1a1a] rounded p-1.5 text-xs text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] text-zinc-500 font-bold uppercase mb-1 font-mono">AI Generate Button Label</label>
                          <input
                            type="text"
                            value={theme.aiGenerateBtnText}
                            onChange={(e) => setTheme({ ...theme, aiGenerateBtnText: e.target.value })}
                            className="w-full bg-[#050505] border border-[#1a1a1a] rounded p-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-zinc-500 font-bold uppercase mb-1 font-mono">AI Rewrite Button Label</label>
                          <input
                            type="text"
                            value={theme.aiRewriteBtnText}
                            onChange={(e) => setTheme({ ...theme, aiRewriteBtnText: e.target.value })}
                            className="w-full bg-[#050505] border border-[#1a1a1a] rounded p-1.5 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-zinc-900 text-[10px] text-zinc-500 font-semibold font-mono">
                        <span className="flex items-center space-x-1.5">
                          <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Show Language Switcher</span>
                        </span>
                        <input
                          type="checkbox"
                          checked={theme.aiLanguageSelector}
                          onChange={(e) => setTheme({ ...theme, aiLanguageSelector: e.target.checked })}
                          className="w-3.5 h-3.5 rounded bg-zinc-900 accent-emerald-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Languages Selector list */}
                  <div className="space-y-2">
                    <label className="block text-[10px] text-zinc-500 font-bold uppercase font-mono">Permitted Page Languages</label>
                    <p className="text-[10px] text-zinc-600 mb-2">Check the languages available to customers on this page. De-select to hide from picker.</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        "English", "Hindi", "Hinglish", "Bengali", "Tamil", "Telugu", "Marathi", "Gujarati", "Punjabi", "Malayalam", "Kannada", "Spanish"
                      ].map(lang => {
                        const isChecked = theme.enabledLanguages.includes(lang);
                        return (
                          <label key={lang} className="flex items-center space-x-2 p-2 bg-zinc-950 border border-zinc-900 rounded-lg cursor-pointer text-xs select-none hover:border-zinc-800">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                const list = isChecked 
                                  ? theme.enabledLanguages.filter(l => l !== lang)
                                  : [...theme.enabledLanguages, lang];
                                setTheme({ ...theme, enabledLanguages: list });
                              }}
                              className="w-3.5 h-3.5 rounded bg-zinc-900 accent-emerald-500"
                            />
                            <span className={isChecked ? "text-white font-medium" : "text-zinc-500"}>{lang}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: BUTTON CUSTOMIZATION */}
            {activeTab === "buttons" && (
              <div className="space-y-4">
                <h3 className="text-sm font-serif text-white italic">Action buttons customization</h3>
                <p className="text-[11px] text-zinc-500">Edit Call-To-Action (CTA) redirects, text copy instructions, and labels.</p>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-1 font-mono">Google Review CTA Button Label</label>
                    <input
                      type="text"
                      value={theme.ctaButtonText}
                      onChange={(e) => setTheme({ ...theme, ctaButtonText: e.target.value })}
                      className="w-full bg-[#050505] border border-zinc-900 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] text-zinc-500 font-bold uppercase mb-1 font-mono">Copy Draft Button Text</label>
                      <input
                        type="text"
                        value={theme.copyBtnText}
                        onChange={(e) => setTheme({ ...theme, copyBtnText: e.target.value })}
                        className="w-full bg-[#050505] border border-zinc-900 rounded-xl p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-zinc-500 font-bold uppercase mb-1 font-mono">Call Business Text</label>
                      <input
                        type="text"
                        value={theme.callText}
                        onChange={(e) => setTheme({ ...theme, callText: e.target.value })}
                        className="w-full bg-[#050505] border border-zinc-900 rounded-xl p-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] text-zinc-500 font-bold uppercase mb-1 font-mono">Visit Website Text</label>
                      <input
                        type="text"
                        value={theme.visitWebsiteText}
                        onChange={(e) => setTheme({ ...theme, visitWebsiteText: e.target.value })}
                        className="w-full bg-[#050505] border border-zinc-900 rounded-xl p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-zinc-500 font-bold uppercase mb-1 font-mono">WhatsApp Text</label>
                      <input
                        type="text"
                        value={theme.whatsappText}
                        onChange={(e) => setTheme({ ...theme, whatsappText: e.target.value })}
                        className="w-full bg-[#050505] border border-zinc-900 rounded-xl p-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: SOCIAL LINKS */}
            {activeTab === "social" && (
              <div className="space-y-4">
                <h3 className="text-sm font-serif text-white italic">Active Social Media Directories</h3>
                <p className="text-[11px] text-zinc-500">Enable or disable social channels displayed on the thank you page.</p>
                
                <div className="space-y-2">
                  {Object.keys(theme.socialLinks).map((soc) => {
                    const isEnabled = (theme.socialLinks as any)[soc];
                    return (
                      <div key={soc} className="flex items-center justify-between p-2.5 bg-zinc-950 border border-zinc-900 rounded-xl">
                        <span className="text-xs text-white font-mono capitalize">
                          {soc === "maps" ? "Google Maps Directions" : soc} Link
                        </span>
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={(e) => {
                            const updated = { ...theme.socialLinks, [soc]: e.target.checked };
                            setTheme({ ...theme, socialLinks: updated });
                          }}
                          className="w-4 h-4 rounded bg-zinc-900 accent-emerald-500 cursor-pointer"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 7: FOOTER */}
            {activeTab === "footer" && (
              <div className="space-y-4">
                <h3 className="text-sm font-serif text-white italic">Page Footer & Legal Policies</h3>
                <p className="text-[11px] text-zinc-500">Alter policy URL targets and configure ReviewPlease agency branding.</p>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-1 font-mono">Custom Footer Paragraph</label>
                    <input
                      type="text"
                      value={theme.footerText}
                      onChange={(e) => setTheme({ ...theme, footerText: e.target.value })}
                      className="w-full bg-[#050505] border border-zinc-900 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-1 font-mono">Privacy Policy URL</label>
                      <input
                        type="text"
                        value={theme.privacyLink}
                        onChange={(e) => setTheme({ ...theme, privacyLink: e.target.value })}
                        className="w-full bg-[#050505] border border-zinc-900 rounded-xl p-2.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-1 font-mono">Terms of Service URL</label>
                      <input
                        type="text"
                        value={theme.termsLink}
                        onChange={(e) => setTheme({ ...theme, termsLink: e.target.value })}
                        className="w-full bg-[#050505] border border-zinc-900 rounded-xl p-2.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-zinc-950 border border-zinc-900 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <Lock className="w-4 h-4 text-emerald-400" />
                      <div>
                        <p className="text-white text-xs font-semibold">Remove "Powered by" branding (Pro)</p>
                        <p className="text-[9px] text-zinc-500">Hide agency footprints for a 100% white-labeled merchant system</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={theme.hidePoweredBy}
                      onChange={(e) => setTheme({ ...theme, hidePoweredBy: e.target.checked })}
                      className="w-4 h-4 rounded bg-[#050505] accent-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 8: CUSTOM DOMAIN (FUTURE) */}
            {activeTab === "nfc_domain" && (
              <div className="space-y-4">
                <h3 className="text-sm font-serif text-white italic">White-Labeled Custom Domain Configuration</h3>
                <p className="text-[11px] text-zinc-500">Connect your company domain to serve review pages directly from your website.</p>
                
                <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                    <div>
                      <span className="text-[10px] text-amber-500 font-mono uppercase tracking-wider font-bold">
                        CNAME DNS Verification
                      </span>
                      <h4 className="text-sm font-semibold text-white mt-1">reviews.yourbusiness.com</h4>
                    </div>
                    <span className="text-[9px] text-amber-400 bg-amber-950/20 border border-amber-900/40 px-2 py-0.5 rounded font-bold uppercase tracking-tight">
                      Pending DNS Setup
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <p className="text-zinc-400">To map your custom domain, point your subdomain's DNS records as follows:</p>
                    <div className="p-2.5 bg-[#050505] border border-zinc-900 rounded-lg space-y-1.5 font-mono text-[10px] text-zinc-300">
                      <div><span className="text-zinc-500">Type:</span> CNAME</div>
                      <div><span className="text-zinc-500">Host:</span> reviews</div>
                      <div><span className="text-zinc-500">Points to:</span> ingress.reviewplease.io</div>
                      <div><span className="text-zinc-500">TTL:</span> 3600 (1 hour)</div>
                    </div>
                  </div>

                  <button
                    onClick={() => alert("Checking custom domain DNS records... Please allow up to 24 hours for global DNS propagation.")}
                    className="w-full py-2 bg-zinc-900 hover:bg-zinc-850 text-xs font-bold text-white border border-zinc-800 rounded-xl transition-all"
                  >
                    Verify DNS Resolution
                  </button>
                </div>
              </div>
            )}

            {/* TAB 9: THEME ANALYTICS */}
            {activeTab === "analytics" && (
              <div className="space-y-4">
                <h3 className="text-sm font-serif text-white italic">Theme Performance & Conversion Metrics</h3>
                <p className="text-[11px] text-zinc-500">Track how well your selected style maps to real-world review generation ratios.</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl text-center">
                    <span className="block text-[9px] text-zinc-500 font-bold uppercase font-mono">Theme Loads</span>
                    <span className="text-2xl font-serif text-white italic block mt-1">1,482</span>
                    <span className="text-[10px] text-emerald-400 font-semibold font-mono mt-1 block">▲ 14% scans increase</span>
                  </div>

                  <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl text-center">
                    <span className="block text-[9px] text-zinc-500 font-bold uppercase font-mono">Conversion Ratio</span>
                    <span className="text-2xl font-serif text-white italic block mt-1">74.2%</span>
                    <span className="text-[10px] text-emerald-400 font-semibold font-mono mt-1 block">Best performing preset</span>
                  </div>
                </div>

                <div className="p-4 bg-[#050505] border border-zinc-900 rounded-xl space-y-2">
                  <span className="block text-[10px] text-zinc-500 font-bold uppercase font-mono">Device Access Percentages</span>
                  <div className="space-y-2 pt-1">
                    <div>
                      <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                        <span>Apple iOS (Safari)</span>
                        <span>82.4%</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: "82.4%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                        <span>Google Android (Chrome)</span>
                        <span>17.6%</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: "17.6%" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Builder Action footer buttons (Save draft, Publish, etc.) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-zinc-900">
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleResetTheme}
                  className="px-3.5 py-2 text-xs font-semibold bg-[#1a1a1a] hover:bg-zinc-900 text-zinc-400 rounded-xl border border-zinc-800 transition-colors"
                >
                  Reset Template
                </button>
                <button
                  type="button"
                  onClick={handleDuplicateTheme}
                  className="px-3.5 py-2 text-xs font-semibold bg-[#1a1a1a] hover:bg-zinc-900 text-zinc-300 rounded-xl border border-zinc-800 transition-colors"
                >
                  Duplicate
                </button>
              </div>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => handleSaveTheme(false)}
                  className="px-4 py-2 text-xs font-semibold bg-zinc-950 hover:bg-zinc-900 text-white rounded-xl border border-zinc-800 transition-all flex items-center space-x-2"
                >
                  <Save className="w-4 h-4 text-zinc-400" />
                  <span>Save Draft</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveTheme(true)}
                  className="px-4.5 py-2 text-xs font-bold bg-white text-black hover:bg-zinc-200 rounded-xl transition-all flex items-center space-x-2"
                >
                  <Send className="w-4 h-4 text-black fill-black" />
                  <span>Publish Theme</span>
                </button>
              </div>
            </div>

            {/* Import & Export JSON tools in builder page margin */}
            <div className="flex justify-between items-center text-[10px] text-zinc-600 font-mono pt-2 border-t border-zinc-950">
              <span>Theme System Payload</span>
              <div className="space-x-3">
                <button onClick={handleExportTheme} className="hover:text-zinc-300 transition-colors">Download JSON Schema</button>
                <button onClick={handleImportTheme} className="hover:text-zinc-300 transition-colors">Import JSON Schema</button>
              </div>
            </div>

          </div>
        </div>

        {/* INSTANT MOBILE PHONE PREVIEW ON THE RIGHT (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="text-center mb-2.5">
            <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-mono font-bold flex items-center justify-center space-x-1.5">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Instant Live Mobile Preview</span>
            </span>
            <p className="text-[11px] text-zinc-500 mt-1">Changes are compiled instantly in the smartphone simulator below.</p>
          </div>

          <div className="w-full max-w-[340px] h-[670px] bg-black border-[8px] border-zinc-800 rounded-[44px] shadow-2xl relative flex flex-col overflow-hidden ring-4 ring-zinc-900/30">
            
            {/* Top camera Notch */}
            <div className="absolute top-0 inset-x-0 h-7 bg-black z-30 flex items-center justify-between px-5 text-[9px] text-white">
              <span className="font-semibold font-mono text-[9px]">{currentTime}</span>
              <div className="w-20 h-4 bg-black rounded-full mx-auto" />
              <div className="flex items-center space-x-1 font-mono text-[8px]">
                <Wifi className="w-3 h-3 text-white" />
                <Battery className="w-3.5 h-2.5 text-white" />
              </div>
            </div>

            {/* Display View Content */}
            <div 
              className="flex-1 bg-zinc-950 pt-7 text-xs flex flex-col relative select-none"
              style={{
                background: theme.bgType === "gradient" 
                  ? theme.bgGradient 
                  : theme.bgType === "image" 
                    ? `url(${theme.bgImage}) center/cover no-referrer` 
                    : theme.bgColor,
                fontFamily: getFontFamilyStyle()
              }}
            >
              {/* Address bar mockup */}
              <div className="px-3 py-1.5 bg-black/40 backdrop-blur-xs border-b border-white/5 flex items-center space-x-1 font-mono text-[8px] text-zinc-500">
                <Lock className="w-2.5 h-2.5 text-emerald-500" />
                <span className="truncate flex-1 text-zinc-400">
                  {window.location.host}/r/{theme.businessName.toLowerCase().replace(/[^a-z0-9]/g, "-")}
                </span>
                <RefreshCw className="w-2.5 h-2.5 text-zinc-500" />
              </div>

              {/* Internal Dynamic Preview Steps */}
              <div className="flex-1 p-4 flex flex-col justify-between overflow-y-auto scrollbar-none text-zinc-300">
                
                {/* PREVIEW STEP 1: RATING SELECTION */}
                {step === "rating" && (
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    
                    {/* Header profile branding section */}
                    <div className="space-y-3">
                      
                      {/* Logo and G Verified banner inside card */}
                      <div 
                        className="p-3 bg-zinc-900/60 rounded-xl"
                        style={{
                          borderRadius: getCardRadiusStyle(),
                          border: theme.cardStyle === "bordered" ? "1px solid rgba(255,255,255,0.15)" : "none",
                          backgroundColor: theme.cardStyle === "glass" ? "rgba(255,255,255,0.07)" : theme.cardBgColor,
                          boxShadow: getCardShadowStyle(),
                          backdropFilter: theme.cardStyle === "glass" ? "blur(12px)" : "none"
                        }}
                      >
                        <div className="flex items-center space-x-2.5">
                          <img 
                            src={theme.logo || businessProfile.logo} 
                            alt="Brand Logo" 
                            className="w-9 h-9 object-cover rounded-md"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-1">
                              <h4 className="text-xs font-semibold text-white leading-tight truncate">{theme.businessName || businessProfile.name}</h4>
                              {theme.googleVerified && (
                                <span className="w-3.5 h-3.5 bg-emerald-500 text-white flex items-center justify-center rounded-full scale-90">
                                  <Check className="w-2 h-2 fill-white" />
                                </span>
                              )}
                            </div>
                            <p className="text-[9px] text-zinc-500 truncate">{theme.tagline}</p>
                          </div>
                        </div>
                      </div>

                      {/* Language Selection display */}
                      {theme.aiLanguageSelector && (
                        <div className="flex justify-between items-center text-[9px] text-zinc-500">
                          <span>Choose Language:</span>
                          <span className="text-white px-1.5 py-0.5 bg-zinc-900/50 rounded border border-zinc-850">{portalLanguage}</span>
                        </div>
                      )}

                      {/* Welcome and feedback questions */}
                      <div className="text-center pt-2 space-y-1">
                        <h3 className="text-sm font-bold text-white leading-snug">{theme.welcomeTitle}</h3>
                        <p className="text-[10px] text-zinc-400 leading-normal">{theme.welcomeMessage}</p>
                      </div>

                    </div>

                    {/* interactive stars mockup */}
                    <div className="text-center py-4 space-y-3">
                      <div className="flex justify-center space-x-2">
                        {[1, 2, 3, 4, 5].map(st => {
                          const isLit = st <= (hoverRating || rating);
                          return (
                            <button
                              key={st}
                              type="button"
                              onClick={() => setRating(st)}
                              onMouseEnter={() => setHoverRating(st)}
                              onMouseLeave={() => setHoverRating(0)}
                              className="p-0.5 focus:outline-none hover:scale-115 transition-transform"
                            >
                              <Star 
                                className="w-7 h-7"
                                style={{
                                  fill: isLit ? theme.starColor : "none",
                                  color: isLit ? theme.starColor : "rgba(255,255,255,0.15)"
                                }}
                              />
                            </button>
                          );
                        })}
                      </div>

                      {/* feedback emojis and labels custom styles */}
                      <div className="h-6 flex items-center justify-center">
                        {(hoverRating || rating) > 0 ? (
                          <span 
                            className="text-[10px] font-bold uppercase tracking-wider font-mono"
                            style={{ color: theme.starColor }}
                          >
                            {theme.ratingLabels[hoverRating || rating] || "Tap star to rate"}
                          </span>
                        ) : (
                          <span className="text-[9px] text-zinc-500">Tap stars to leave a review</span>
                        )}
                      </div>
                    </div>

                    {/* Action flow routing if rating exists */}
                    {rating > 0 ? (
                      <div className="pt-2 animate-fade-in-up">
                        {rating >= (activeQRItem?.ratingRequired || 4) ? (
                          <button
                            type="button"
                            onClick={() => setStep("feedback_positive")}
                            className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
                            style={{
                              backgroundColor: theme.buttonColor,
                              color: theme.buttonTextColor,
                              borderRadius: getCardRadiusStyle()
                            }}
                          >
                            <span>Continue to suggestions</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setStep("feedback_negative")}
                            className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
                            style={{
                              borderRadius: getCardRadiusStyle()
                            }}
                          >
                            <span>Share Private Feedback</span>
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="h-9" />
                    )}

                    {/* Powered by footer branding */}
                    {!theme.hidePoweredBy && (
                      <div className="text-center text-[8px] text-zinc-600 font-mono mt-3">
                        Powered by <span className="text-emerald-500 font-semibold">ReviewPlease</span>
                      </div>
                    )}

                  </div>
                )}

                {/* PREVIEW STEP 2A: POSITIVE ROUTE (AI Draft Suggestions) */}
                {step === "feedback_positive" && (
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      
                      <button
                        onClick={() => {
                          setRating(0);
                          setStep("rating");
                        }}
                        className="inline-flex items-center space-x-1 text-[9px] text-zinc-500 hover:text-white"
                      >
                        <ArrowLeft className="w-3 h-3" />
                        <span>Change Rating</span>
                      </button>

                      <div className="text-center">
                        <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Wonderful {rating} Stars!</p>
                        <h4 className="text-xs text-white leading-tight mt-0.5">{theme.aiSectionTitle}</h4>
                      </div>

                      {/* AI generated suggestion mockup */}
                      {theme.aiEnabled && (
                        <div className="space-y-2 p-2.5 bg-zinc-950 border border-zinc-900 rounded-xl">
                          <p className="text-[10px] text-zinc-400 leading-normal italic">
                            "{editedText}"
                          </p>
                          <div className="flex justify-between items-center pt-2 border-t border-zinc-900">
                            <span className="text-[8px] text-zinc-500 flex items-center">
                              <Sparkles className="w-3 h-3 text-emerald-400 mr-1" />
                              <span>AI Recommended Draft</span>
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(editedText);
                                alert("Draft review copied to virtual clipboard!");
                              }}
                              className="text-[9px] text-emerald-400 hover:underline flex items-center space-x-0.5"
                            >
                              <Copy className="w-3 h-3" />
                              <span>{theme.copyBtnText}</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Custom input review editor container */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-zinc-500 block">Or customize review comment below:</span>
                        <textarea
                          rows={2.5}
                          value={editedText}
                          onChange={(e) => setEditedText(e.target.value)}
                          className="w-full bg-[#050505] border border-zinc-900 rounded-xl p-2 text-[10px] text-white focus:outline-none"
                        />
                      </div>

                    </div>

                    {/* Redirect Google Trigger CTA */}
                    <div className="space-y-2">
                      <button
                        onClick={() => setShowConfirmModal(true)}
                        className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
                        style={{
                          backgroundColor: theme.buttonColor,
                          color: theme.buttonTextColor,
                          borderRadius: getCardRadiusStyle()
                        }}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{theme.ctaButtonText}</span>
                      </button>
                      <p className="text-[8px] text-zinc-500 text-center leading-normal">
                        Launches merchant Google reviews portal instantly. Paste your copied template there!
                      </p>
                    </div>

                  </div>
                )}

                {/* PREVIEW STEP 2B: NEGATIVE ROUTE (Gated Private feedback) */}
                {step === "feedback_negative" && (
                  <div className="space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          setRating(0);
                          setStep("rating");
                        }}
                        className="inline-flex items-center space-x-1 text-[9px] text-zinc-500"
                      >
                        <ArrowLeft className="w-3 h-3" />
                        <span>Change Rating</span>
                      </button>

                      <div className="text-center">
                        <h4 className="text-xs font-serif text-white italic">Help Us Improve</h4>
                        <p className="text-[9px] text-zinc-500 leading-normal">We apologize that we fell short. Your feedback is sent directly to management.</p>
                      </div>

                      <form onSubmit={(e) => { e.preventDefault(); setStep("submitted"); }} className="space-y-2">
                        <div>
                          <input
                            type="text"
                            placeholder="Your Name"
                            value={directName}
                            onChange={(e) => setDirectName(e.target.value)}
                            className="w-full bg-[#050505] border border-zinc-900 rounded-lg p-2 text-[10px] text-white"
                          />
                        </div>
                        <div>
                          <textarea
                            rows={3}
                            placeholder="How can we make things right?"
                            value={directComments}
                            onChange={(e) => setDirectComments(e.target.value)}
                            className="w-full bg-[#050505] border border-zinc-900 rounded-lg p-2 text-[10px] text-white"
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold"
                          style={{ borderRadius: getCardRadiusStyle() }}
                        >
                          Submit Private Feedback
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* PREVIEW STEP 3: THANK YOU & SOCIALS */}
                {step === "submitted" && (
                  <div className="space-y-4 flex-1 flex flex-col justify-between text-center py-6">
                    <div className="space-y-3">
                      <div className="w-10 h-10 bg-emerald-950 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-900">
                        <Check className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-serif text-white italic">✅ Thank You!</h4>
                      <p className="text-[10px] text-zinc-400 leading-relaxed px-1">
                        {theme.thankYouMessage}
                      </p>

                      {/* Coupon loyalty rewards mock if enabled */}
                      <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-xl space-y-1.5 max-w-[280px] mx-auto text-center">
                        <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider font-mono">
                          Loyalty Coupon Code
                        </span>
                        <p className="text-white text-xs font-bold font-mono">WELCOME10</p>
                        <p className="text-[9px] text-zinc-400">Show this code on your next visit for 10% Off Your Purchase!</p>
                      </div>
                    </div>

                    {/* Social button directory mockup */}
                    <div className="space-y-2">
                      <p className="text-[8px] text-zinc-500 font-mono">Follow or Call Business:</p>
                      
                      <div className="grid grid-cols-2 gap-2 text-[9px]">
                        {theme.socialLinks.website && (
                          <a href="#" className="p-1.5 bg-[#141414] border border-zinc-900 rounded-lg text-zinc-300 hover:text-white flex items-center justify-center space-x-1">
                            <Globe className="w-3 h-3 text-emerald-400" />
                            <span>{theme.visitWebsiteText}</span>
                          </a>
                        )}
                        {theme.socialLinks.whatsapp && (
                          <a href="#" className="p-1.5 bg-[#141414] border border-zinc-900 rounded-lg text-zinc-300 hover:text-white flex items-center justify-center space-x-1">
                            <Phone className="w-3 h-3 text-emerald-400" />
                            <span>{theme.whatsappText}</span>
                          </a>
                        )}
                        {theme.socialLinks.instagram && (
                          <a href="#" className="p-1.5 bg-[#141414] border border-zinc-900 rounded-lg text-zinc-300 hover:text-white flex items-center justify-center space-x-1">
                            <Instagram className="w-3 h-3 text-pink-400" />
                            <span>Instagram</span>
                          </a>
                        )}
                        {theme.socialLinks.maps && (
                          <a href="#" className="p-1.5 bg-[#141414] border border-zinc-900 rounded-lg text-zinc-300 hover:text-white flex items-center justify-center space-x-1">
                            <MapPin className="w-3 h-3 text-amber-500" />
                            <span>{theme.directionsText}</span>
                          </a>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setRating(0);
                          setStep("rating");
                        }}
                        className="text-[9px] text-emerald-400 hover:underline mt-4 block mx-auto font-mono"
                      >
                        Start Next Simulated Scan
                      </button>
                    </div>

                  </div>
                )}

              </div>

              {/* Footer text custom footer info */}
              <div className="p-3 text-center border-t border-white/5 bg-black/20 text-[8px] text-zinc-600 space-y-1">
                <p>{theme.footerText}</p>
                <div className="flex justify-center space-x-2 text-[7px] text-zinc-500">
                  <a href="#">Privacy Policy</a>
                  <span>•</span>
                  <a href="#">Terms of Use</a>
                </div>
              </div>

            </div>

            {/* Simulated confirmation modal for redirect */}
            {showConfirmModal && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 max-w-[260px] text-center space-y-3.5">
                  <div className="w-10 h-10 bg-amber-950 text-amber-500 rounded-full flex items-center justify-center mx-auto">
                    <Info className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-white">Opening Google Reviews</h5>
                    <p className="text-[9px] text-zinc-500 leading-normal">
                      We're redirecting you to Google reviews. Please paste or write your draft in the input screen.
                    </p>
                  </div>
                  <div className="flex space-x-2 text-[10px]">
                    <button
                      onClick={() => setShowConfirmModal(false)}
                      className="flex-1 py-1.5 bg-[#1a1a1a] hover:bg-zinc-800 text-zinc-400 rounded-lg border border-zinc-800 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setShowConfirmModal(false);
                        setStep("submitted");
                        alert("Redirected successfully to: Google Review Location.");
                      }}
                      className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
