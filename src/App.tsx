import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Analytics } from '@vercel/analytics/react';
import { 
  Star, 
  Search, 
  Bell, 
  Sparkles, 
  Plus, 
  Download, 
  Trash2, 
  RefreshCw, 
  Edit, 
  Copy, 
  Check, 
  UserPlus, 
  Filter, 
  X, 
  ArrowUpRight, 
  QrCode, 
  ExternalLink, 
  Sliders, 
  Menu,
  ChevronRight,
  Send,
  HelpCircle,
  FileText,
  AlertTriangle,
  Lightbulb,
  CreditCard,
  Building,
  Info,
  ThumbsUp,
  MessageSquare
} from "lucide-react";
import Auth from "./components/Auth";
import Sidebar, { ActiveSection } from "./components/Sidebar";
import QRReviewPortal from "./components/QRReviewPortal";
import ThemeBuilder from "./components/ThemeBuilder";
import { 
  User, 
  BusinessProfile, 
  QRCodeItem, 
  Review, 
  TeamMember, 
  ActivityLog, 
  BillingInvoice, 
  NotificationItem, 
  ScanAnalyticsPoint 
} from "./types";
import { 
  initialUser, 
  initialBusinessProfile, 
  initialQRCodes, 
  initialReviews, 
  initialTeam, 
  initialBilling, 
  initialNotifications, 
  initialActivityLogs, 
  initialScanAnalytics,
  ratingDist,
  deviceData,
  languageData
} from "./data";

export default function App() {
  // Authentication state
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("reviewplease_user");
    return saved ? JSON.parse(saved) : null;
  });

  // Business profile state
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(() => {
    const saved = localStorage.getItem("reviewplease_profile");
    return saved ? JSON.parse(saved) : initialBusinessProfile;
  });

  // Master lists
  const [qrCodes, setQRCodes] = useState<QRCodeItem[]>(() => {
    const saved = localStorage.getItem("reviewplease_qrcodes");
    return saved ? JSON.parse(saved) : initialQRCodes;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem("reviewplease_reviews");
    return saved ? JSON.parse(saved) : initialReviews;
  });

  const [team, setTeam] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem("reviewplease_team");
    return saved ? JSON.parse(saved) : initialTeam;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem("reviewplease_logs");
    return saved ? JSON.parse(saved) : initialActivityLogs;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem("reviewplease_notifications");
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [billing, setBilling] = useState<BillingInvoice[]>(() => {
    const saved = localStorage.getItem("reviewplease_billing");
    return saved ? JSON.parse(saved) : initialBilling;
  });

  // App metrics & UI Controls
  const [activeSection, setActiveSection] = useState<ActiveSection>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [aiUsageCredits, setAiUsageCredits] = useState(84); // out of 100

  // Filter States for Reviews screen
  const [reviewFilterRating, setReviewFilterRating] = useState<number | "All">("All");
  const [reviewFilterLocation, setReviewFilterLocation] = useState<string | "All">("All");
  const [reviewFilterSource, setReviewFilterSource] = useState<string | "All">("All");
  const [reviewSearch, setReviewSearch] = useState("");

  // AI Assistant active sandbox state
  const [aiAssistantRating, setAiAssistantRating] = useState<number>(5);
  const [aiAssistantTone, setAiAssistantTone] = useState<"friendly" | "professional" | "casual">("friendly");
  const [aiAssistantLength, setAiAssistantLength] = useState<"short" | "medium" | "long">("medium");
  const [aiAssistantLanguage, setAiAssistantLanguage] = useState<string>("English");
  const [aiAssistantExtra, setAiAssistantExtra] = useState("");
  const [aiAssistantSuggestions, setAiAssistantSuggestions] = useState<string[]>([
    "Excellent bakery with fresh pastries daily. The almond croissant is a masterpiece. Highly recommended!",
    "Great customer service and cozy environment. The staff was incredibly welcoming.",
    "Delicious baked goods and excellent espresso. I will definitely be coming back!"
  ]);
  const [aiAssistantLoading, setAiAssistantLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // AI Rewrite auxiliary state
  const [aiRewriteInput, setAiRewriteInput] = useState("");
  const [aiRewriteOutput, setAiRewriteOutput] = useState("");
  const [aiRewriteLoading, setAiRewriteLoading] = useState(false);

  // AI Reply Generator active state
  const [selectedReviewForReply, setSelectedReviewForReply] = useState<Review | null>(initialReviews[1]); //Elena Rostova (Pending)
  const [aiReplyTone, setAiReplyTone] = useState<"friendly" | "professional" | "casual">("professional");
  const [aiReplyDraft, setAiReplyDraft] = useState("");
  const [aiReplyLoading, setAiReplyLoading] = useState(false);

  // QR Management Popups
  const [newQRModalOpen, setNewQRModalOpen] = useState(false);
  const [newQRName, setNewQRName] = useState("");
  const [newQRRequiredRating, setNewQRRequiredRating] = useState(4);
  const [selectedQRForPoster, setSelectedQRForPoster] = useState<QRCodeItem | null>(null);
  const [selectedSimulatedQRId, setSelectedSimulatedQRId] = useState<string>("");

  // Settings & Account
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("English");
  const [notificationPref, setNotificationPref] = useState({
    newReview: true,
    weeklyReport: true,
    aiAlerts: true,
    billing: true
  });

  // Team Invite Form
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"Admin" | "Manager" | "Editor">("Editor");

  // Help support tickets / request forms
  const [supportCategory, setSupportCategory] = useState("Bug Report");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportSuccess, setSupportSuccess] = useState(false);

  // Auto-persist to localStorage on edits
  useEffect(() => {
    if (user) {
      localStorage.setItem("reviewplease_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("reviewplease_user");
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem("reviewplease_profile", JSON.stringify(businessProfile));
  }, [businessProfile]);

  useEffect(() => {
    localStorage.setItem("reviewplease_qrcodes", JSON.stringify(qrCodes));
  }, [qrCodes]);

  useEffect(() => {
    localStorage.setItem("reviewplease_reviews", JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem("reviewplease_team", JSON.stringify(team));
  }, [team]);

  useEffect(() => {
    localStorage.setItem("reviewplease_logs", JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem("reviewplease_notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("reviewplease_billing", JSON.stringify(billing));
  }, [billing]);

  // Auth handler
  const handleLogin = (newUser: User) => {
    setUser(newUser);
    addLog("User Signed In", `Sarah Jenkins successfully logged into review please console.`, "success");
  };

  const handleLogout = () => {
    setUser(null);
  };

  // Utility to log activities
  const addLog = (action: string, details: string, type: "info" | "success" | "warning" | "error" | "ai" = "info") => {
    const newLog: ActivityLog = {
      id: "act_" + Math.random().toString(36).substr(2, 9),
      user: user?.name || "System",
      action,
      details,
      time: "Just now",
      type: type as any
    };
    setActivityLogs(prev => [newLog, ...prev.slice(0, 19)]);
  };

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    addLog("Marked Read", "All pending alert notifications cleared.", "info");
  };

  const handleGenerateAISuggestions = async () => {
    setAiAssistantLoading(true);
    try {
      const response = await fetch("/api/gemini/suggest-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: aiAssistantRating,
          tone: aiAssistantTone,
          length: aiAssistantLength,
          language: aiAssistantLanguage,
          extraDetails: aiAssistantExtra,
          businessName: businessProfile.name
        })
      });
      const data = await response.json();
      if (data.suggestions && Array.isArray(data.suggestions)) {
        setAiAssistantSuggestions(data.suggestions);
        addLog("AI Suggestion Created", `Generated 3 alternative review copies for rating: ${aiAssistantRating} stars.`, "success");
        // Consume a credit
        setAiUsageCredits(prev => Math.max(0, prev - 1));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiAssistantLoading(false);
    }
  };

  const handleRewriteReview = async () => {
    if (!aiRewriteInput.trim()) return;
    setAiRewriteLoading(true);
    try {
      const response = await fetch("/api/gemini/rewrite-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: aiRewriteInput,
          tone: aiAssistantTone,
          length: aiAssistantLength,
          language: aiAssistantLanguage
        })
      });
      const data = await response.json();
      if (data.rewritten) {
        setAiRewriteOutput(data.rewritten);
        addLog("AI Review Rewritten", `Polished customer review draft with premium ${aiAssistantTone} tone.`, "success");
        setAiUsageCredits(prev => Math.max(0, prev - 1));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiRewriteLoading(false);
    }
  };

  const handleGenerateReply = async () => {
    if (!selectedReviewForReply) return;
    setAiReplyLoading(true);
    try {
      const response = await fetch("/api/gemini/generate-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewText: selectedReviewForReply.text,
          reviewerName: selectedReviewForReply.author,
          rating: selectedReviewForReply.rating,
          tone: aiReplyTone,
          businessName: businessProfile.name
        })
      });
      const data = await response.json();
      if (data.reply) {
        setAiReplyDraft(data.reply);
        addLog("Reply Suggestion Generated", `Generated reply suggestion for ${selectedReviewForReply.author}.`, "success");
        setAiUsageCredits(prev => Math.max(0, prev - 1));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiReplyLoading(false);
    }
  };

  const saveReplyToReview = () => {
    if (!selectedReviewForReply || !aiReplyDraft.trim()) return;
    setReviews(prev => prev.map(r => {
      if (r.id === selectedReviewForReply.id) {
        return {
          ...r,
          response: aiReplyDraft,
          status: "replied"
        };
      }
      return r;
    }));
    addLog("Review Reply Published", `Replied successfully to customer ${selectedReviewForReply.author}.`, "success");
    // Clear and update current review item state
    setSelectedReviewForReply(null);
    setAiReplyDraft("");
  };

  const handleCreateQRCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQRName.trim()) return;
    
    // Pro Tier has unlimited QR codes. Free is limited to 3. 
    if (user?.plan === "Free" && qrCodes.length >= 3) {
      alert("Upgrade to PRO to generate unlimited dynamic QR Codes.");
      return;
    }

    const uniqueSlug = newQRName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const newQR: QRCodeItem = {
      id: "qr_" + Math.random().toString(36).substr(2, 9),
      name: newQRName,
      url: `https://reviewplease.ai/r/${uniqueSlug}`,
      createdAt: new Date().toISOString().split("T")[0],
      scans: 0,
      ratingRequired: newQRRequiredRating,
      status: "Active"
    };

    setQRCodes(prev => [...prev, newQR]);
    setNewQRName("");
    setNewQRModalOpen(false);
    addLog("QR Code Created", `Generated dynamic URL matching counter/location for: ${newQRName}`, "success");
  };

  const handleDeleteQR = (id: string) => {
    setQRCodes(prev => prev.filter(q => q.id !== id));
    addLog("QR Code Deleted", `Removed dynamic destination setup for ID: ${id}`, "warning");
  };

  const handleRegenerateQR = (id: string) => {
    setQRCodes(prev => prev.map(q => {
      if (q.id === id) {
        const newSlug = Math.random().toString(36).substr(2, 5);
        return {
          ...q,
          url: `https://reviewplease.ai/r/sb-${newSlug}`
        };
      }
      return q;
    }));
    addLog("QR Code Regenerated", `Created fresh random routing slug for QR ID: ${id}`, "info");
  };

  const handleInviteTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    const newMember: TeamMember = {
      id: "team_" + Math.random().toString(36).substr(2, 9),
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      status: "Pending",
      joinedAt: new Date().toISOString().split("T")[0]
    };

    setTeam(prev => [...prev, newMember]);
    setInviteName("");
    setInviteEmail("");
    addLog("Team Member Invited", `Sent verification invitation to: ${inviteEmail} with ${inviteRole} privileges.`, "success");
  };

  const handleUpgradePlan = () => {
    if (user) {
      const updated = { ...user, plan: "Enterprise" as const };
      setUser(updated);
      addLog("Subscription Upgraded", "Upgraded to Enterprise tier. Unlimited QR, custom API keys unlocked.", "success");
    }
  };

  const handleDowngradePlan = () => {
    if (user) {
      const updated = { ...user, plan: "Free" as const };
      setUser(updated);
      addLog("Subscription Cancelled", "Downgraded to Free Tier. Limitations apply.", "warning");
    }
  };

  const handleSendSupportTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;
    setSupportSuccess(true);
    addLog("Support Ticket Created", `Submitted ${supportCategory} request successfully to technical operations.`, "info");
    setTimeout(() => {
      setSupportMessage("");
      setSupportSuccess(false);
    }, 4000);
  };

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // If not logged in, render the login flow
  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  // Derived metrics
  const totalScans = qrCodes.reduce((sum, qr) => sum + qr.scans, 0);
  const reviewsCollectedCount = reviews.length;
  const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCollectedCount).toFixed(2);
  const conversionRate = ((reviewsCollectedCount / totalScans) * 100).toFixed(1);
  const aiReviewsGeneratedCount = 529;

  // Filter logic for reviews
  const filteredReviews = reviews.filter(r => {
    const matchesRating = reviewFilterRating === "All" || r.rating === Number(reviewFilterRating);
    const matchesLocation = reviewFilterLocation === "All" || r.location === reviewFilterLocation;
    const matchesSource = reviewFilterSource === "All" || r.source === reviewFilterSource;
    const matchesSearch = r.author.toLowerCase().includes(reviewSearch.toLowerCase()) || 
                          r.text.toLowerCase().includes(reviewSearch.toLowerCase());
    return matchesRating && matchesLocation && matchesSource && matchesSearch;
  });

  return (
    <div id="app-container" className="h-screen w-full bg-[#050505] text-[#e0e0e0] flex overflow-hidden font-sans">
      
      {/* Sidebar Component */}
      <Sidebar 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        user={user}
        businessProfile={businessProfile}
        unreadCount={unreadCount}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 border-b border-[#1a1a1a] flex items-center justify-between px-6 bg-[#050505] shrink-0">
          <div className="flex items-center space-x-3">
            <button
              id="mobile-sidebar-toggle"
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg text-zinc-400 hover:text-white lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden md:flex items-center space-x-3 bg-[#0c0c0c] border border-[#1a1a1a] px-3.5 py-1.5 rounded-lg w-72">
              <Search className="h-4 w-4 text-zinc-500" />
              <input
                id="search-header-input"
                type="text"
                placeholder="Search metrics, QRs, reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-xs text-white placeholder-zinc-500 focus:outline-none w-full"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            
            {/* AI Credits Widget */}
            <div className="hidden sm:flex items-center space-x-3 bg-[#0c0c0c] border border-[#1a1a1a] px-3 py-1.5 rounded-lg text-xs">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-zinc-400">AI Assist Credits:</span>
              <span className="text-white font-mono font-bold">{aiUsageCredits}/100</span>
              <div className="w-12 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${aiUsageCredits}%` }}></div>
              </div>
            </div>

            {/* Notifications Center */}
            <div className="relative">
              <button
                id="header-notifications-btn"
                onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
                className="relative p-2 rounded-xl border border-[#1a1a1a] bg-[#0c0c0c] text-zinc-400 hover:text-white transition-colors"
              >
                <Bell className="h-4.5 w-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-emerald-500" />
                )}
              </button>

              {notificationDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setNotificationDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2.5 w-80 bg-[#0c0c0c] border border-[#1a1a1a] rounded-xl shadow-2xl z-40 py-2">
                    <div className="px-4 py-2 border-b border-[#1a1a1a] flex justify-between items-center">
                      <span className="text-xs font-semibold text-white">System Alerts ({unreadCount})</span>
                      <button 
                        onClick={markAllNotificationsAsRead}
                        className="text-[10px] text-emerald-400 hover:underline"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.map(notif => (
                        <div key={notif.id} className={`p-3 border-b border-[#1a1a1a]/80 last:border-0 hover:bg-[#111] ${!notif.read ? "bg-emerald-950/10" : ""}`}>
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-medium text-white">{notif.title}</span>
                            <span className="text-[9px] text-zinc-500 font-mono">{notif.time}</span>
                          </div>
                          <p className="text-[10px] text-zinc-400 mt-1">{notif.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Menu Actions */}
            <div className="flex items-center space-x-3 border-l border-[#1a1a1a] pl-4">
              <div className="hidden xl:flex flex-col items-end">
                <span className="text-xs font-semibold text-white">{businessProfile.name}</span>
                <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-wider">{user.role}</span>
              </div>
              <button 
                id="header-logout-btn"
                onClick={handleLogout}
                className="text-xs text-zinc-500 hover:text-rose-400 transition-colors"
                title="Log Out"
              >
                Sign Out
              </button>
            </div>

          </div>
        </header>

        {/* Dynamic Content Views */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <AnimatePresence mode="wait">
            
            {/* 1. DASHBOARD OVERVIEW */}
            {activeSection === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Intro Hero with custom action banner */}
                <div className="p-6 bg-gradient-to-r from-emerald-950/20 via-zinc-950 to-zinc-950 border border-[#1a1a1a] rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-serif text-white italic">Welcome back, {user.name}</h2>
                    <p className="text-xs text-zinc-400 mt-1">ReviewPlease auto-analyzes rating thresholds to maximize real-time Google Reviews.</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setNewQRModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors flex items-center space-x-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Create QR Code</span>
                    </button>
                  </div>
                </div>

                {/* KPI Cards Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                  
                  <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-4 rounded-xl">
                    <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Total QR Scans</p>
                    <h3 className="text-xl font-serif text-white mt-1.5">{totalScans.toLocaleString()}</h3>
                    <span className="text-[9px] text-emerald-400 font-mono mt-1 block">▲ +14.2% scans</span>
                  </div>

                  <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-4 rounded-xl">
                    <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Google Reviews</p>
                    <h3 className="text-xl font-serif text-white mt-1.5">{reviewsCollectedCount}</h3>
                    <span className="text-[9px] text-emerald-400 font-mono mt-1 block">▲ +8.1% reviews</span>
                  </div>

                  <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-4 rounded-xl">
                    <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Average Rating</p>
                    <h3 className="text-xl font-serif text-white mt-1.5">{avgRating}</h3>
                    <div className="flex text-amber-500 text-[9px] mt-1">★★★★★</div>
                  </div>

                  <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-4 rounded-xl">
                    <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Conversion Rate</p>
                    <h3 className="text-xl font-serif text-white mt-1.5">{conversionRate}%</h3>
                    <span className="text-[9px] text-zinc-400 font-mono mt-1 block">Average: 24.1% industry</span>
                  </div>

                  <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-4 rounded-xl">
                    <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">AI Reviews Drafted</p>
                    <h3 className="text-xl font-serif text-white mt-1.5">{aiReviewsGeneratedCount}</h3>
                    <span className="text-[9px] text-zinc-500 font-mono mt-1 block">Saving 12h writing time</span>
                  </div>

                  <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-4 rounded-xl">
                    <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Reviews This Month</p>
                    <h3 className="text-xl font-serif text-white mt-1.5">62</h3>
                    <span className="text-[9px] text-emerald-400 font-mono mt-1 block">On track for target</span>
                  </div>

                </div>

                {/* Chart Trends & Side panels */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Scan acquisition chart */}
                  <div className="lg:col-span-2 bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h4 className="font-serif text-base text-white italic">Scan Trend & Review Velocity</h4>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Showing daily totals from last 7 operating days</p>
                      </div>
                      <div className="flex space-x-1.5">
                        <span className="text-[9px] font-mono bg-[#1a1a1a] border border-[#333] px-2 py-0.5 rounded text-white">Weekly</span>
                        <span className="text-[9px] font-mono text-zinc-500 px-2 py-0.5">Monthly</span>
                      </div>
                    </div>

                    {/* Simple dynamic SVG visualization */}
                    <div className="flex-1 h-44 flex items-end justify-between space-x-2 pt-4 px-2">
                      {initialScanAnalytics.map((pt, i) => {
                        const maxScans = 300;
                        const heightPercent = Math.min(95, Math.max(15, (pt.scans / maxScans) * 100));
                        const reviewPercent = Math.min(95, Math.max(10, (pt.reviews / maxScans) * 100));
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center group">
                            <div className="w-full relative flex justify-center items-end h-32">
                              {/* Scans bar */}
                              <div 
                                className="w-3/5 bg-zinc-800 rounded-t-sm group-hover:bg-zinc-700 transition-colors"
                                style={{ height: `${heightPercent}%` }}
                                title={`${pt.scans} scans`}
                              />
                              {/* Reviews bar overlay */}
                              <div 
                                className="w-2/5 bg-emerald-500 rounded-t-sm absolute"
                                style={{ height: `${reviewPercent}%` }}
                                title={`${pt.reviews} reviews`}
                              />
                            </div>
                            <span className="text-[9px] text-zinc-500 mt-2 font-mono">{pt.date}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center space-x-4 mt-4 pt-2 border-t border-[#1a1a1a]/40 text-[10px]">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2 h-2 bg-zinc-800 rounded-xs"></span>
                        <span className="text-zinc-400">Total QR Scans</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2 h-2 bg-emerald-500 rounded-xs"></span>
                        <span className="text-zinc-400">Reviews Submitted</span>
                      </div>
                    </div>
                  </div>

                  {/* Rating distribution panel */}
                  <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-6 flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif text-base text-white italic">Rating Distribution</h4>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Overall rating spread over {reviewsCollectedCount} reviews</p>
                    </div>

                    <div className="space-y-3 my-4">
                      {ratingDist.map((dist) => (
                        <div key={dist.star} className="space-y-1">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-zinc-400 font-mono">{dist.star} Stars</span>
                            <span className="text-zinc-500 font-mono">{dist.count} ({dist.percentage}%)</span>
                          </div>
                          <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500" 
                              style={{ width: `${dist.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => setActiveSection("reviews")}
                      className="w-full py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-zinc-200 transition-colors"
                    >
                      View All Reviews
                    </button>
                  </div>

                </div>

                {/* Recent Reviews & Recent activity feeds */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  
                  {/* Reviews preview list */}
                  <div className="xl:col-span-2 bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-6">
                    <h4 className="font-serif text-base text-white mb-4 italic">Latest customer sentiment</h4>
                    <div className="divide-y divide-[#1a1a1a]">
                      {reviews.slice(0, 3).map((rev) => (
                        <div key={rev.id} className="py-4 first:pt-0 last:pb-0 flex items-start space-x-4">
                          <img 
                            src={rev.avatar} 
                            alt={rev.author} 
                            className="w-9 h-9 rounded-full object-cover border border-[#1a1a1a]"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h5 className="text-xs font-semibold text-white">{rev.author}</h5>
                              <span className="text-[9px] text-zinc-500 font-mono">{rev.date}</span>
                            </div>
                            <div className="flex text-amber-500 text-[9px] my-1">
                              {Array.from({ length: rev.rating }).map((_, i) => "★")}
                            </div>
                            <p className="text-[11px] text-zinc-400 leading-relaxed truncate-2-lines">{rev.text}</p>
                            {rev.response ? (
                              <div className="mt-2.5 p-2.5 bg-[#050505] border border-[#1a1a1a] rounded-xl">
                                <p className="text-[10px] text-zinc-500 font-semibold">Response Published:</p>
                                <p className="text-[10px] text-zinc-400 mt-1 italic">"{rev.response}"</p>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedReviewForReply(rev);
                                  setActiveSection("ai_replies");
                                }}
                                className="text-[10px] text-emerald-400 hover:underline mt-2 flex items-center space-x-1"
                              >
                                <span>Draft AI Reply</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Activity log feed */}
                  <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-6 flex flex-col">
                    <h4 className="font-serif text-base text-white mb-4 italic">Audit Log Activity</h4>
                    <div className="flex-1 space-y-4 overflow-hidden max-h-[300px] overflow-y-auto pr-1">
                      {activityLogs.map((log) => (
                        <div key={log.id} className="text-xs border-b border-[#1a1a1a]/40 pb-3 last:border-0 last:pb-0">
                          <div className="flex justify-between items-start">
                            <span className="font-semibold text-white">{log.action}</span>
                            <span className="text-[9px] text-zinc-600 font-mono">{log.time}</span>
                          </div>
                          <p className="text-[10px] text-zinc-500 mt-0.5">{log.details}</p>
                          <span className="text-[9px] text-zinc-600 mt-1 block font-mono">By: {log.user}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* 2. QR CODE MANAGEMENT */}
            {activeSection === "qrcodes" && (
              <motion.div
                key="qrcodes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-serif text-white italic">Direct QR Code Hub</h2>
                    <p className="text-xs text-zinc-500">Generate high-contrast permanent destination QR codes mapped to custom counters or bags.</p>
                  </div>
                  <button
                    onClick={() => setNewQRModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Generate New QR</span>
                  </button>
                </div>

                {/* QR Codes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  {qrCodes.map((qr) => (
                    <div key={qr.id} className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-semibold text-white">{qr.name}</h4>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-semibold ${qr.status === "Active" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/40" : "bg-zinc-900 text-zinc-500"}`}>
                            {qr.status}
                          </span>
                        </div>
                        <p className="text-[9px] text-zinc-500 font-mono mt-1 truncate">{qr.url}</p>

                        {/* Centered QR code mockup inside container with actual downloadable API */}
                        <div className="my-5 p-4 bg-white rounded-xl flex items-center justify-center border border-zinc-800">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qr.url)}`}
                            alt={qr.name}
                            className="w-36 h-36"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-zinc-500">Scan Required Stars:</span>
                            <span className="text-amber-400 font-semibold">{qr.ratingRequired}+ Stars</span>
                          </div>
                          <div className="flex justify-between text-[11px]">
                            <span className="text-zinc-500">Total Unique Scans:</span>
                            <span className="text-white font-mono font-semibold">{qr.scans}</span>
                          </div>
                          <div className="flex justify-between text-[11px]">
                            <span className="text-zinc-500">Created At:</span>
                            <span className="text-zinc-400 font-mono">{qr.createdAt}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-[#1a1a1a]">
                        <button
                          onClick={() => {
                            setSelectedQRForPoster(qr);
                          }}
                          className="py-1.5 text-[10px] font-semibold bg-[#1a1a1a] border border-[#333] hover:bg-[#252525] rounded-lg text-white transition-colors flex items-center justify-center space-x-1"
                        >
                          <Download className="w-3 h-3 text-emerald-400" />
                          <span>Download</span>
                        </button>
                        <button
                          onClick={() => handleRegenerateQR(qr.id)}
                          className="py-1.5 text-[10px] font-semibold bg-[#1a1a1a] border border-[#333] hover:bg-[#252525] rounded-lg text-white transition-colors"
                          title="Change Routing Token"
                        >
                          Regen
                        </button>
                        <button
                          onClick={() => handleDeleteQR(qr.id)}
                          className="py-1.5 text-[10px] font-semibold bg-rose-950/20 border border-rose-900/30 hover:bg-rose-900/20 text-rose-400 rounded-lg transition-colors flex items-center justify-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedSimulatedQRId(qr.id);
                          setActiveSection("customer_portal");
                        }}
                        className="w-full mt-2.5 py-1.5 text-[10px] font-bold bg-zinc-950 hover:bg-white hover:text-black border border-zinc-800 rounded-lg text-zinc-300 transition-all flex items-center justify-center space-x-1.5"
                      >
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>Simulate Scan Portal</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Upgrade limits notice */}
                <div className="p-4 bg-emerald-950/10 border border-emerald-900/30 rounded-xl flex items-center justify-between text-xs text-zinc-400">
                  <div className="flex items-center space-x-2">
                    <Info className="w-4 h-4 text-emerald-400" />
                    <span>Free accounts are capped at 3 active counters. Upgrade to <strong>Pro</strong> or <strong>Enterprise</strong> for infinite QR Code generation.</span>
                  </div>
                  <button onClick={() => setActiveSection("subscription")} className="text-emerald-400 hover:underline font-semibold shrink-0">Upgrade Now</button>
                </div>
              </motion.div>
            )}

            {/* CUSTOMER PORTAL SIMULATION */}
            {activeSection === "customer_portal" && (
              <motion.div
                key="customer_portal"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-serif text-white italic">QR Review Gated Portal</h2>
                  <p className="text-xs text-zinc-500">Preview the gorgeous live review-gathering flow that customers see when they scan your tabletop flyers.</p>
                </div>

                <QRReviewPortal
                  qrCodes={qrCodes}
                  businessProfile={businessProfile}
                  onAddReview={(review) => setReviews(prev => [review, ...prev])}
                  onAddActivityLog={(action, details, type) => addLog(action, details, type)}
                  onAddNotification={(title, description, type) => {
                    const newNotif: any = {
                      id: "notif_" + Math.random().toString(36).substr(2, 9),
                      title,
                      description,
                      time: "Just now",
                      type,
                      read: false
                    };
                    setNotifications(prev => [newNotif, ...prev]);
                  }}
                  onIncrementScanCount={(qrCodeId) => {
                    setQRCodes(prev => prev.map(q => q.id === qrCodeId ? { ...q, scans: q.scans + 1 } : q));
                  }}
                  selectedQRId={selectedSimulatedQRId || (qrCodes.length > 0 ? qrCodes[0].id : "")}
                  onSelectedQRIdChange={setSelectedSimulatedQRId}
                />
              </motion.div>
            )}

            {/* THEME BUILDER & CUSTOM URL SECTION */}
            {activeSection === "theme_builder" && (
              <motion.div
                key="theme_builder"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-serif text-white italic">QR Review Page Theme Builder</h2>
                  <p className="text-xs text-zinc-500">Fully customize your public-facing review portal's branding, colours, styles, and action buttons without coding.</p>
                </div>

                <ThemeBuilder
                  businessProfile={businessProfile}
                  qrCodes={qrCodes}
                  onAddActivityLog={(action, details, type) => addLog(action, details, type)}
                  onAddNotification={(title, description, type) => {
                    const newNotif: any = {
                      id: "notif_" + Math.random().toString(36).substr(2, 9),
                      title,
                      description,
                      time: "Just now",
                      type,
                      read: false
                    };
                    setNotifications(prev => [newNotif, ...prev]);
                  }}
                  onUpdateQRUrl={(qrId, newUrl) => {
                    setQRCodes(prev => prev.map(q => q.id === qrId ? { ...q, url: newUrl } : q));
                  }}
                />
              </motion.div>
            )}

            {/* 3. REVIEW MANAGEMENT */}
            {activeSection === "reviews" && (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-serif text-white italic">Reputation Feed & Review Engine</h2>
                  <p className="text-xs text-zinc-500">Monitor external Google feeds alongside private feedback captures.</p>
                </div>

                {/* Filter and query controls */}
                <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    
                    {/* Rating selector */}
                    <div className="flex flex-col">
                      <span className="text-[9px] text-zinc-500 font-semibold mb-1 uppercase tracking-wider">Rating filter</span>
                      <select
                        value={reviewFilterRating}
                        onChange={(e) => setReviewFilterRating(e.target.value === "All" ? "All" : Number(e.target.value))}
                        className="bg-[#050505] border border-[#1a1a1a] text-xs text-zinc-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
                      >
                        <option value="All">All Stars</option>
                        <option value="5">5 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="2">2 Stars</option>
                        <option value="1">1 Star</option>
                      </select>
                    </div>

                    {/* QR Code origin location */}
                    <div className="flex flex-col">
                      <span className="text-[9px] text-zinc-500 font-semibold mb-1 uppercase tracking-wider">Origin Location</span>
                      <select
                        value={reviewFilterLocation}
                        onChange={(e) => setReviewFilterLocation(e.target.value)}
                        className="bg-[#050505] border border-[#1a1a1a] text-xs text-zinc-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
                      >
                        <option value="All">All QR Origins</option>
                        {Array.from(new Set(reviews.map(r => r.location))).map(loc => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>

                    {/* Feed source */}
                    <div className="flex flex-col">
                      <span className="text-[9px] text-zinc-500 font-semibold mb-1 uppercase tracking-wider">Source Channel</span>
                      <select
                        value={reviewFilterSource}
                        onChange={(e) => setReviewFilterSource(e.target.value)}
                        className="bg-[#050505] border border-[#1a1a1a] text-xs text-zinc-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
                      >
                        <option value="All">All Channels</option>
                        <option value="Google">Google Maps</option>
                        <option value="Direct Feed">Private Direct Feed</option>
                      </select>
                    </div>

                  </div>

                  {/* Search and Action Buttons */}
                  <div className="flex items-end space-x-3">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="Search text..."
                        value={reviewSearch}
                        onChange={(e) => setReviewSearch(e.target.value)}
                        className="pl-8 pr-3 py-1.5 bg-[#050505] border border-[#1a1a1a] text-xs text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 w-44"
                      />
                    </div>
                    <button
                      onClick={() => {
                        alert(JSON.stringify(filteredReviews, null, 2));
                        addLog("Reviews Exported", "Downloaded filtered reviews in spreadsheet format (JSON view).", "info");
                      }}
                      className="px-3.5 py-2.5 border border-[#1a1a1a] bg-[#050505] text-zinc-300 hover:text-white rounded-lg text-xs font-semibold flex items-center space-x-1"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Export (CSV)</span>
                    </button>
                  </div>
                </div>

                {/* Table Layout */}
                <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#1a1a1a] text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                          <th className="p-4">Customer</th>
                          <th className="p-4">Rating</th>
                          <th className="p-4">Review Content</th>
                          <th className="p-4">Source & Target</th>
                          <th className="p-4">Status & Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1a1a1a]/60 text-xs">
                        {filteredReviews.map((rev) => (
                          <tr key={rev.id} className="hover:bg-[#111]/30 transition-colors">
                            <td className="p-4 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                <img src={rev.avatar} alt={rev.author} className="w-8 h-8 rounded-full object-cover border border-[#1a1a1a]" />
                                <div>
                                  <span className="font-semibold text-white block">{rev.author}</span>
                                  <span className="text-[10px] text-zinc-500 font-mono">{rev.date}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 whitespace-nowrap">
                              <div className="flex text-amber-500 text-[10px]">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <span key={i}>{i < rev.rating ? "★" : "☆"}</span>
                                ))}
                              </div>
                            </td>
                            <td className="p-4 max-w-sm">
                              <p className="text-zinc-300 leading-relaxed text-[11px] truncate-3-lines">{rev.text}</p>
                              {rev.response && (
                                <div className="mt-2 p-2 bg-[#050505] border border-[#1a1a1a] rounded-lg">
                                  <span className="text-[9px] text-emerald-400 font-mono">Owner response published:</span>
                                  <p className="text-[10px] text-zinc-400 italic mt-0.5">"{rev.response}"</p>
                                </div>
                              )}
                            </td>
                            <td className="p-4 whitespace-nowrap">
                              <span className="block text-white text-[11px]">{rev.location}</span>
                              <span className="text-[9px] text-zinc-500 block">{rev.source}</span>
                            </td>
                            <td className="p-4 whitespace-nowrap">
                              {rev.status === "replied" ? (
                                <span className="inline-flex items-center rounded-md bg-zinc-900 px-2 py-0.5 text-[10px] font-medium text-zinc-400 border border-zinc-800">
                                  Replied
                                </span>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedReviewForReply(rev);
                                    setActiveSection("ai_replies");
                                  }}
                                  className="px-2.5 py-1 text-[10px] font-bold text-black bg-white hover:bg-zinc-200 rounded-md transition-colors"
                                >
                                  Draft Reply
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 4. AI REVIEW ASSISTANT (CUSTOM DRAFT ASSISTANCE FOR END-USER) */}
            {activeSection === "ai_assistant" && (
              <motion.div
                key="ai_assistant"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-serif text-white italic">AI Review Generator sandbox</h2>
                  <p className="text-xs text-zinc-500">Provide customers custom review suggestions based on selected ratings and language parameters.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Generation Config form */}
                  <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-6 space-y-4">
                    <h4 className="text-xs font-semibold text-white uppercase tracking-widest font-mono">Input Parameters</h4>
                    
                    {/* Star selection */}
                    <div>
                      <label className="block text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-1.5">Rating Gate Selection</label>
                      <div className="flex space-x-1.5">
                        {[1, 2, 3, 4, 5].map((stars) => (
                          <button
                            key={stars}
                            type="button"
                            onClick={() => setAiAssistantRating(stars)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors border ${
                              aiAssistantRating === stars 
                                ? "bg-amber-950/20 text-amber-400 border-amber-900/40" 
                                : "bg-[#050505] text-zinc-500 border-[#1a1a1a]"
                            }`}
                          >
                            {stars} ★
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tone Select */}
                    <div>
                      <label className="block text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-1.5">Desired Review Tone</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["friendly", "professional", "casual"] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setAiAssistantTone(t)}
                            className={`py-1.5 rounded-lg text-xs capitalize transition-colors border ${
                              aiAssistantTone === t 
                                ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/40" 
                                : "bg-[#050505] text-zinc-500 border-[#1a1a1a]"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Length limit */}
                    <div>
                      <label className="block text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-1.5">Length</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["short", "medium", "long"] as const).map((l) => (
                          <button
                            key={l}
                            type="button"
                            onClick={() => setAiAssistantLength(l)}
                            className={`py-1.5 rounded-lg text-xs capitalize transition-colors border ${
                              aiAssistantLength === l 
                                ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/40" 
                                : "bg-[#050505] text-zinc-500 border-[#1a1a1a]"
                            }`}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Languages */}
                    <div>
                      <label className="block text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-1.5">Target Language</label>
                      <select
                        value={aiAssistantLanguage}
                        onChange={(e) => setAiAssistantLanguage(e.target.value)}
                        className="w-full bg-[#050505] border border-[#1a1a1a] text-xs text-white rounded-lg p-2.5 focus:outline-none"
                      >
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                        <option value="Japanese">Japanese</option>
                      </select>
                    </div>

                    {/* Additional features */}
                    <div>
                      <label className="block text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-1.5">Contextual Keywords</label>
                      <textarea
                        rows={2}
                        value={aiAssistantExtra}
                        onChange={(e) => setAiAssistantExtra(e.target.value)}
                        placeholder="e.g. delicious sourdough, polite manager, clean interiors..."
                        className="w-full bg-[#050505] border border-[#1a1a1a] text-xs text-white placeholder-zinc-700 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <button
                      onClick={handleGenerateAISuggestions}
                      disabled={aiAssistantLoading}
                      className="w-full py-2.5 bg-white text-black font-bold text-xs rounded-xl hover:bg-zinc-200 disabled:opacity-50 transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{aiAssistantLoading ? "Drafting..." : "Generate 3 Alternatives"}</span>
                    </button>
                  </div>

                  {/* AI Output / Results sandbox */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-6">
                      <h4 className="text-xs font-semibold text-white uppercase tracking-widest font-mono mb-4">Output suggestions</h4>
                      
                      <div className="space-y-4">
                        {aiAssistantSuggestions.map((text, idx) => (
                          <div key={idx} className="p-4 bg-[#050505] border border-[#1a1a1a] rounded-xl relative group">
                            <span className="absolute top-2.5 left-3 text-[9px] font-mono font-bold text-zinc-600 uppercase tracking-widest">Option 0{idx + 1}</span>
                            <p className="text-xs text-zinc-300 leading-relaxed mt-4">{text}</p>
                            
                            <div className="flex justify-end space-x-2 mt-4 pt-3 border-t border-[#1a1a1a]/40">
                              <button
                                onClick={() => handleCopyText(text, idx)}
                                className="px-2.5 py-1 rounded bg-[#1a1a1a] border border-[#333] hover:bg-[#252525] text-[10px] text-white transition-colors flex items-center space-x-1"
                              >
                                {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-400" />}
                                <span>{copiedIndex === idx ? "Copied" : "Copy suggestion"}</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Rewrite Assistant sub module */}
                    <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-6 space-y-4">
                      <h4 className="text-xs font-semibold text-white uppercase tracking-widest font-mono">Premium AI Rewrite Assist</h4>
                      <p className="text-[11px] text-zinc-500">Paste rough text written by customer to format it into highly legible display copy.</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] text-zinc-500 font-semibold mb-1 uppercase">Rough original draft</label>
                          <textarea
                            rows={3}
                            value={aiRewriteInput}
                            onChange={(e) => setAiRewriteInput(e.target.value)}
                            placeholder="Rough draft: croissants were cool but the clerk was a bit lazy..."
                            className="w-full bg-[#050505] border border-[#1a1a1a] text-xs text-white placeholder-zinc-700 rounded-lg p-2.5 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-zinc-500 font-semibold mb-1 uppercase">AI Premium response</label>
                          <div className="w-full h-20 bg-[#050505] border border-[#1a1a1a] rounded-lg p-2.5 text-xs text-zinc-300 overflow-y-auto font-sans leading-relaxed">
                            {aiRewriteLoading ? "Rewriting into polished copy..." : aiRewriteOutput || "Your rewritten draft will render here."}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={handleRewriteReview}
                          disabled={aiRewriteLoading || !aiRewriteInput.trim()}
                          className="px-4 py-2 bg-white text-black text-xs font-bold rounded-lg disabled:opacity-50 hover:bg-zinc-200 transition-colors"
                        >
                          Rewrite & Format
                        </button>
                        {aiRewriteOutput && (
                          <button
                            onClick={() => handleCopyText(aiRewriteOutput, 99)}
                            className="px-3 py-2 bg-[#1a1a1a] border border-[#333] text-zinc-300 hover:text-white rounded-lg text-xs"
                          >
                            Copy Rewritten
                          </button>
                        )}
                      </div>
                    </div>

                  </div>

                </div>
              </motion.div>
            )}

            {/* 5. AI REPLY GENERATOR (BUSINESS TOOL FOR REPLYING) */}
            {activeSection === "ai_replies" && (
              <motion.div
                key="ai_replies"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-serif text-white italic">AI Professional Reply generator</h2>
                  <p className="text-xs text-zinc-500">Draft responses directly targeting customer keywords to publish instantly on Google Business profiles.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Pending review selector */}
                  <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-6 space-y-4">
                    <h4 className="text-xs font-semibold text-white uppercase tracking-widest font-mono">Select Review to Reply</h4>
                    <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                      {reviews.map(rev => (
                        <div 
                          key={rev.id} 
                          onClick={() => {
                            setSelectedReviewForReply(rev);
                            setAiReplyDraft("");
                          }}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                            selectedReviewForReply?.id === rev.id 
                              ? "bg-emerald-950/10 border-emerald-900/60" 
                              : "bg-[#050505] border-[#1a1a1a] hover:bg-[#111]"
                          }`}
                        >
                          <div className="flex justify-between text-[11px]">
                            <span className="font-semibold text-white">{rev.author}</span>
                            <span className="text-zinc-500 font-mono text-[9px]">{rev.date}</span>
                          </div>
                          <div className="flex text-amber-500 text-[9px] my-1">
                            {Array.from({ length: rev.rating }).map((_, i) => "★")}
                          </div>
                          <p className="text-[10px] text-zinc-400 truncate-2-lines mt-1">{rev.text}</p>
                          <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#1a1a1a]/40">
                            <span className="text-[9px] text-zinc-500 font-mono uppercase">{rev.source}</span>
                            <span className={`text-[9px] font-bold ${rev.status === "replied" ? "text-zinc-500" : "text-emerald-400"}`}>
                              {rev.status === "replied" ? "✓ Replied" : "● Needs Reply"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reply Draft Workspace */}
                  <div className="lg:col-span-2 bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-6 space-y-5">
                    {selectedReviewForReply ? (
                      <>
                        <div className="bg-[#050505] p-4 rounded-xl border border-[#1a1a1a]">
                          <span className="text-[9px] text-zinc-500 font-semibold uppercase tracking-widest block mb-2">Original customer voice</span>
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-semibold text-white">{selectedReviewForReply.author} ({selectedReviewForReply.rating} Stars)</span>
                            <span className="text-[10px] font-mono text-zinc-500">{selectedReviewForReply.location}</span>
                          </div>
                          <p className="text-xs text-zinc-400 italic mt-2">"{selectedReviewForReply.text}"</p>
                        </div>

                        {/* Tone settings for replies */}
                        <div className="space-y-2">
                          <label className="block text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Configure Response Tone</label>
                          <div className="flex space-x-2">
                            {(["friendly", "professional", "casual"] as const).map(t => (
                              <button
                                key={t}
                                onClick={() => setAiReplyTone(t)}
                                className={`flex-1 py-1.5 rounded-lg text-xs capitalize transition-colors border ${
                                  aiReplyTone === t 
                                    ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/40" 
                                    : "bg-[#050505] text-zinc-500 border-[#1a1a1a]"
                                }`}
                              >
                                {t} Response
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Draft block */}
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">AI Generated reply draft</label>
                            <button
                              onClick={handleGenerateReply}
                              disabled={aiReplyLoading}
                              className="text-[10px] text-emerald-400 hover:underline flex items-center space-x-1"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>{aiReplyDraft ? "Regenerate alternative" : "Auto-Generate Draft"}</span>
                            </button>
                          </div>
                          <textarea
                            rows={4}
                            value={aiReplyDraft}
                            onChange={(e) => setAiReplyDraft(e.target.value)}
                            placeholder="Draft reply content directly or trigger AI to write it."
                            className="w-full bg-[#050505] border border-[#1a1a1a] text-xs text-white placeholder-zinc-700 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
                          />
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-[#1a1a1a]/40">
                          <span className="text-[10px] text-zinc-500">Note: Saving publishes directly to sync profiles.</span>
                          <div className="flex space-x-2">
                            {aiReplyDraft && (
                              <button
                                onClick={() => handleCopyText(aiReplyDraft, 999)}
                                className="px-3.5 py-2 rounded-lg border border-[#333] bg-[#050505] text-xs text-zinc-300 font-semibold hover:text-white transition-colors"
                              >
                                Copy reply
                              </button>
                            )}
                            <button
                              onClick={saveReplyToReview}
                              disabled={!aiReplyDraft.trim()}
                              className="px-4 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-zinc-200 disabled:opacity-50 transition-colors"
                            >
                              Publish Reply
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-16 text-zinc-500">
                        <MessageSquare className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                        <h4 className="font-serif text-white mb-1">No review selected</h4>
                        <p className="text-xs">Pick a review from the sidebar feed to draft a perfect automated AI reply.</p>
                      </div>
                    )}
                  </div>

                </div>
              </motion.div>
            )}

            {/* 6. ANALYTICS DETAIL PANEL */}
            {activeSection === "analytics" && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-serif text-white italic">Reputation Analytics & Reports</h2>
                  <p className="text-xs text-zinc-500">Review scan-to-submission pipeline conversion benchmarks.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-5 rounded-2xl">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Conversion Velocity</span>
                    <h3 className="text-2xl font-serif text-white mt-1">26.2%</h3>
                    <p className="text-[10px] text-emerald-400 mt-2">Top 5% bakery industry</p>
                  </div>
                  <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-5 rounded-2xl">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Weekly Scans</span>
                    <h3 className="text-2xl font-serif text-white mt-1">1,482</h3>
                    <p className="text-[10px] text-zinc-500 mt-2">Active tables: 24 active tents</p>
                  </div>
                  <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-5 rounded-2xl">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Total Feedbacks</span>
                    <h3 className="text-2xl font-serif text-white mt-1">{reviewsCollectedCount}</h3>
                    <p className="text-[10px] text-emerald-400 mt-2">▲ 18% month over month</p>
                  </div>
                  <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-5 rounded-2xl">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">AI Response Rate</span>
                    <h3 className="text-2xl font-serif text-white mt-1">89.4%</h3>
                    <p className="text-[10px] text-zinc-500 mt-2">Average draft reply latency &lt; 2s</p>
                  </div>
                </div>

                {/* Sub plots */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Device breakdown */}
                  <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-6">
                    <h4 className="font-serif text-base text-white mb-4 italic">Device & Browser channels</h4>
                    <div className="space-y-4">
                      {deviceData.map(dev => (
                        <div key={dev.name} className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-zinc-400 font-semibold">{dev.name} Platform</span>
                            <span className="text-white font-mono">{dev.value}%</span>
                          </div>
                          <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${dev.value}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Language metrics */}
                  <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-6">
                    <h4 className="font-serif text-base text-white mb-4 italic">Language Distribution of Reviews</h4>
                    <div className="space-y-4">
                      {languageData.map(lang => (
                        <div key={lang.name} className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-zinc-400 font-semibold">{lang.name}</span>
                            <span className="text-white font-mono">{lang.value}%</span>
                          </div>
                          <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500" style={{ width: `${lang.value}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* 7. BUSINESS PROFILE */}
            {activeSection === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-serif text-white italic">Google Profile Synchronization</h2>
                  <p className="text-xs text-zinc-500">Configure parameters to generate direct Google review matching links.</p>
                </div>

                <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-6 space-y-6">
                  <div className="flex items-center space-x-4 pb-4 border-b border-[#1a1a1a]">
                    <img 
                      src={businessProfile.logo} 
                      alt={businessProfile.name} 
                      className="w-16 h-16 rounded-xl object-cover border border-[#1a1a1a]"
                    />
                    <div>
                      <h3 className="text-base font-semibold text-white">{businessProfile.name}</h3>
                      <p className="text-xs text-zinc-500">{businessProfile.category}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-1.5">Business Name</label>
                      <input
                        type="text"
                        value={businessProfile.name}
                        onChange={(e) => setBusinessProfile({ ...businessProfile, name: e.target.value })}
                        className="w-full bg-[#050505] border border-[#1a1a1a] text-xs text-white rounded-lg p-2.5 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-1.5">Logo URL</label>
                      <input
                        type="text"
                        value={businessProfile.logo}
                        onChange={(e) => setBusinessProfile({ ...businessProfile, logo: e.target.value })}
                        className="w-full bg-[#050505] border border-[#1a1a1a] text-xs text-white rounded-lg p-2.5 focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-1.5">Street Address</label>
                      <input
                        type="text"
                        value={businessProfile.address}
                        onChange={(e) => setBusinessProfile({ ...businessProfile, address: e.target.value })}
                        className="w-full bg-[#050505] border border-[#1a1a1a] text-xs text-white rounded-lg p-2.5 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-1.5">Phone Number</label>
                      <input
                        type="text"
                        value={businessProfile.phone}
                        onChange={(e) => setBusinessProfile({ ...businessProfile, phone: e.target.value })}
                        className="w-full bg-[#050505] border border-[#1a1a1a] text-xs text-white rounded-lg p-2.5 focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-1.5">Google Maps Review Link</label>
                      <input
                        type="text"
                        value={businessProfile.googleReviewLink}
                        onChange={(e) => setBusinessProfile({ ...businessProfile, googleReviewLink: e.target.value })}
                        className="w-full bg-[#050505] border border-[#1a1a1a] text-xs text-white rounded-lg p-2.5 focus:outline-none font-mono text-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-1.5">Operating Hours</label>
                      <input
                        type="text"
                        value={businessProfile.hours}
                        onChange={(e) => setBusinessProfile({ ...businessProfile, hours: e.target.value })}
                        className="w-full bg-[#050505] border border-[#1a1a1a] text-xs text-white rounded-lg p-2.5 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-1.5">Website Domain</label>
                      <input
                        type="text"
                        value={businessProfile.website}
                        onChange={(e) => setBusinessProfile({ ...businessProfile, website: e.target.value })}
                        className="w-full bg-[#050505] border border-[#1a1a1a] text-xs text-white rounded-lg p-2.5 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-[#1a1a1a]">
                    <button
                      onClick={() => {
                        addLog("Profile Saved", "Synchronized business credentials with Google API wrapper.", "success");
                        alert("Profile changes synchronized successfully!");
                      }}
                      className="px-5 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-zinc-200 transition-colors"
                    >
                      Save Configuration
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 8. TEAM MANAGEMENT */}
            {activeSection === "team" && (
              <motion.div
                key="team"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-serif text-white italic">Team Privileges & Roles</h2>
                  <p className="text-xs text-zinc-500">Invite staff members to respond to reviews or track counter analytics.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Invite form */}
                  <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-6">
                    <h4 className="text-xs font-semibold text-white uppercase tracking-widest font-mono mb-4">Invite Member</h4>
                    <form onSubmit={handleInviteTeamMember} className="space-y-4">
                      <div>
                        <label className="block text-[10px] text-zinc-500 font-semibold mb-1 uppercase">Full Name</label>
                        <input
                          type="text"
                          required
                          placeholder="John Doe"
                          value={inviteName}
                          onChange={(e) => setInviteName(e.target.value)}
                          className="w-full bg-[#050505] border border-[#1a1a1a] text-xs text-white rounded-lg p-2.5 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-500 font-semibold mb-1 uppercase">Email Address</label>
                        <input
                          type="email"
                          required
                          placeholder="john@sweetbites.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className="w-full bg-[#050505] border border-[#1a1a1a] text-xs text-white rounded-lg p-2.5 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-500 font-semibold mb-1 uppercase">Role Level</label>
                        <select
                          value={inviteRole}
                          onChange={(e) => setInviteRole(e.target.value as any)}
                          className="w-full bg-[#050505] border border-[#1a1a1a] text-xs text-white rounded-lg p-2.5 focus:outline-none"
                        >
                          <option value="Admin">Administrator</option>
                          <option value="Manager">Manager</option>
                          <option value="Editor">Editor (Replies Only)</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center space-x-1.5"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Send Invite Link</span>
                      </button>
                    </form>
                  </div>

                  {/* Team Members List */}
                  <div className="lg:col-span-2 bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-6">
                    <h4 className="text-xs font-semibold text-white uppercase tracking-widest font-mono mb-4">Active Roster</h4>
                    
                    <div className="divide-y divide-[#1a1a1a] text-xs">
                      {team.map(member => (
                        <div key={member.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                          <div>
                            <span className="font-semibold text-white block">{member.name}</span>
                            <span className="text-[10px] text-zinc-500 font-mono">{member.email}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-[10px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 font-mono">{member.role}</span>
                            <span className={`text-[10px] font-bold ${member.status === "Active" ? "text-emerald-400" : "text-amber-400"}`}>
                              {member.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* 9. SUBSCRIPTION & BILLING */}
            {activeSection === "subscription" && (
              <motion.div
                key="subscription"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-serif text-white italic">Current Plan & Billing History</h2>
                  <p className="text-xs text-zinc-500">Track invoices or upgrade dynamic QR counter limits.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Active plan card */}
                  <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-6 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Subscription Status</span>
                      <h3 className="text-2xl font-serif italic text-white mt-1.5">{user.plan} Active Plan</h3>
                      <p className="text-xs text-zinc-400 mt-2">Provides custom AI templates and 10 dynamic QR placements.</p>
                      
                      <div className="mt-5 space-y-3 text-xs">
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Rate Limits:</span>
                          <span className="text-white">Unlimited</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Next Renewal:</span>
                          <span className="text-zinc-400 font-mono">July 15, 2026</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Price Model:</span>
                          <span className="text-emerald-400 font-mono">$49.00 / month</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mt-6">
                      <button
                        onClick={handleUpgradePlan}
                        className="w-full py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-zinc-200 transition-colors"
                      >
                        Upgrade to Enterprise ($129/mo)
                      </button>
                      <button
                        onClick={handleDowngradePlan}
                        className="w-full py-2 bg-transparent border border-[#333] text-zinc-400 hover:text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        Cancel / Downgrade Subscription
                      </button>
                    </div>
                  </div>

                  {/* Billing invoice history list */}
                  <div className="lg:col-span-2 bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-6">
                    <h4 className="text-xs font-semibold text-white uppercase tracking-widest font-mono mb-4">Billing History & Invoices</h4>
                    
                    <div className="divide-y divide-[#1a1a1a] text-xs">
                      {billing.map(invoice => (
                        <div key={invoice.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                          <div>
                            <span className="font-semibold text-white block">{invoice.id}</span>
                            <span className="text-[10px] text-zinc-500 font-mono">{invoice.date} • {invoice.plan}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-white font-mono font-semibold">${invoice.amount.toFixed(2)}</span>
                            <span className="text-[10px] text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-900/30">
                              {invoice.status}
                            </span>
                            <button
                              onClick={() => {
                                alert(`Downloading PDF Invoice matching ${invoice.id}...`);
                                addLog("Invoice Downloaded", `Retrieved invoice receipt ${invoice.id} successfully.`, "info");
                              }}
                              className="text-zinc-500 hover:text-white p-1"
                              title="Download Receipt"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* 10. NOTIFICATIONS LOGS */}
            {activeSection === "notifications" && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-serif text-white italic">Alert Alerts Hub</h2>
                    <p className="text-xs text-zinc-500 font-mono">System event tracking logs and alert channels.</p>
                  </div>
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="px-3 py-1.5 rounded-lg border border-[#333] text-zinc-400 hover:text-white text-xs"
                  >
                    Mark All as Read
                  </button>
                </div>

                <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl divide-y divide-[#1a1a1a]">
                  {notifications.map(notif => (
                    <div key={notif.id} className={`p-4 flex items-start space-x-3.5 ${!notif.read ? "bg-[#111]/40" : ""}`}>
                      <div className={`p-1.5 rounded-lg ${notif.type === "review" ? "bg-amber-950/20 text-amber-400" : notif.type === "ai" ? "bg-emerald-950/20 text-emerald-400" : "bg-zinc-900 text-zinc-400"}`}>
                        <Bell className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-white">{notif.title}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">{notif.time}</span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">{notif.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 11. GENERAL SETTINGS */}
            {activeSection === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-serif text-white italic">General Configuration Settings</h2>
                  <p className="text-xs text-zinc-500 font-mono">Toggle multi-factor auth, profile credentials, and alert notification channels.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* General Config preferences */}
                  <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-6 space-y-5">
                    <h4 className="text-xs font-semibold text-white uppercase tracking-widest font-mono">Profile and Account Credentials</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] text-zinc-500 font-semibold mb-1 uppercase">Display Profile Name</label>
                        <input
                          type="text"
                          value={user.name}
                          onChange={(e) => setUser({ ...user, name: e.target.value })}
                          className="w-full bg-[#050505] border border-[#1a1a1a] text-xs text-white rounded-lg p-2.5 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-500 font-semibold mb-1 uppercase">Email Address</label>
                        <input
                          type="email"
                          value={user.email}
                          onChange={(e) => setUser({ ...user, email: e.target.value })}
                          className="w-full bg-[#050505] border border-[#1a1a1a] text-xs text-white rounded-lg p-2.5 focus:outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-500 font-semibold mb-1 uppercase">Change Password</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full bg-[#050505] border border-[#1a1a1a] text-xs text-white rounded-lg p-2.5 focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        addLog("Account Changed", "Successfully modified account login settings.", "success");
                        alert("Account profile saved!");
                      }}
                      className="w-full py-2 bg-white text-black font-bold text-xs rounded-lg hover:bg-zinc-200 transition-colors"
                    >
                      Save account changes
                    </button>
                  </div>

                  {/* Security preferences */}
                  <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-6 space-y-6">
                    <h4 className="text-xs font-semibold text-white uppercase tracking-widest font-mono">Two-Factor Authentication & Theme</h4>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-white block">Enforce Two-Factor Auth</span>
                        <span className="text-[10px] text-zinc-500 mt-0.5">Protect dashboard from unauthorized actions</span>
                      </div>
                      <button
                        onClick={() => {
                          setTwoFactorEnabled(!twoFactorEnabled);
                          addLog("2FA Toggle", `Modified multi-factor policy to: ${!twoFactorEnabled}`, "info");
                        }}
                        className={`w-10 h-6 rounded-full p-0.5 transition-colors ${twoFactorEnabled ? "bg-emerald-500" : "bg-zinc-800"}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${twoFactorEnabled ? "translate-x-4" : ""}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-[#1a1a1a]/60">
                      <div>
                        <span className="text-xs font-semibold text-white block">Active Dashboard Language</span>
                        <span className="text-[10px] text-zinc-500">Target dialect used across AI assist suggestions</span>
                      </div>
                      <select
                        value={currentLanguage}
                        onChange={(e) => {
                          setCurrentLanguage(e.target.value);
                          addLog("Language Modified", `Changed default dictionary target to: ${e.target.value}`, "info");
                        }}
                        className="bg-[#050505] border border-[#1a1a1a] text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
                      >
                        <option value="English">English (US)</option>
                        <option value="Spanish">Español</option>
                        <option value="French">Français</option>
                        <option value="German">Deutsch</option>
                      </select>
                    </div>

                    <div className="pt-4 border-t border-[#1a1a1a]/60">
                      <span className="text-xs font-semibold text-white block mb-2">Delete Developer Account</span>
                      <p className="text-[10px] text-zinc-500 mb-4 leading-relaxed">Permanently drop all active configurations and business feedback records from this instance.</p>
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to purge all business data? This is non-reversible.")) {
                            handleLogout();
                          }
                        }}
                        className="px-3.5 py-2 rounded-lg bg-rose-950/20 border border-rose-900/30 text-rose-400 text-xs font-semibold hover:bg-rose-900/20 transition-colors"
                      >
                        Purge Account
                      </button>
                    </div>
                  </div>

                  {/* Notification preference toggles */}
                  <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-6 space-y-4">
                    <h4 className="text-xs font-semibold text-white uppercase tracking-widest font-mono">Notification Channels</h4>
                    
                    <div className="space-y-4">
                      {Object.keys(notificationPref).map((key) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-xs text-zinc-300 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <button
                            onClick={() => setNotificationPref(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                            className={`w-8 h-5 rounded-full p-0.5 transition-colors ${notificationPref[key as keyof typeof notificationPref] ? "bg-emerald-500" : "bg-zinc-800"}`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${notificationPref[key as keyof typeof notificationPref] ? "translate-x-3" : ""}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* 12. FAQ & SUPPORT */}
            {activeSection === "help" && (
              <motion.div
                key="help"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-serif text-white italic">Help Center & Technical Support</h2>
                  <p className="text-xs text-zinc-500 font-mono">Get answers to critical reputation features or contact our engineering staff directly.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* FAQs list */}
                  <div className="lg:col-span-2 bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-6 space-y-4">
                    <h4 className="text-xs font-semibold text-white uppercase tracking-widest font-mono">Frequently Asked Questions</h4>
                    
                    <div className="space-y-4 text-xs">
                      <div className="p-3 bg-[#050505] border border-[#1a1a1a] rounded-xl">
                        <span className="font-semibold text-white block">How does the star rating gate routing logic work?</span>
                        <p className="text-zinc-400 mt-1.5 leading-relaxed">By setting a threshold (e.g. 4+ stars), users scanning the counter flyer who select high stars are immediately redirected to your Google Business Profile page. Low rating selects are intercepted and redirected to private feedback forms to protect public scores.</p>
                      </div>

                      <div className="p-3 bg-[#050505] border border-[#1a1a1a] rounded-xl">
                        <span className="font-semibold text-white block">Is the AI generator custom to our business?</span>
                        <p className="text-zinc-400 mt-1.5 leading-relaxed">Yes! By providing keywords and configuring business profiles, the generative model drafts natural, human-like copy highlighting your specific sourdough, managers, or cafe vibes.</p>
                      </div>

                      <div className="p-3 bg-[#050505] border border-[#1a1a1a] rounded-xl">
                        <span className="font-semibold text-white block">Do you support automatic reply sync?</span>
                        <p className="text-zinc-400 mt-1.5 leading-relaxed">Currently, clicking "Publish Reply" updates internal feeds and interfaces with Google API scopes mapped directly to your certified locations list.</p>
                      </div>
                    </div>
                  </div>

                  {/* Bug request / feedback ticket form */}
                  <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-6">
                    <h4 className="text-xs font-semibold text-white uppercase tracking-widest font-mono mb-4">Request assistance</h4>
                    
                    {supportSuccess ? (
                      <div className="text-center py-6 text-emerald-400">
                        <Check className="w-10 h-10 mx-auto mb-3" />
                        <h5 className="font-semibold">Ticket Received</h5>
                        <p className="text-[11px] text-zinc-500 mt-1">Our support staff is reviewing your diagnostics request.</p>
                      </div>
                    ) : (
                      <form onSubmit={handleSendSupportTicket} className="space-y-4">
                        <div>
                          <label className="block text-[10px] text-zinc-500 font-semibold mb-1 uppercase">Support Class</label>
                          <select
                            value={supportCategory}
                            onChange={(e) => setSupportCategory(e.target.value)}
                            className="w-full bg-[#050505] border border-[#1a1a1a] text-xs text-white rounded-lg p-2.5 focus:outline-none"
                          >
                            <option value="Bug Report">Report a Bug</option>
                            <option value="Feature Request">Request a Feature</option>
                            <option value="Billing Query">Billing Question</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-zinc-500 font-semibold mb-1 uppercase">Description</label>
                          <textarea
                            rows={4}
                            required
                            placeholder="Detail your request or feature ideas..."
                            value={supportMessage}
                            onChange={(e) => setSupportMessage(e.target.value)}
                            className="w-full bg-[#050505] border border-[#1a1a1a] text-xs text-white placeholder-zinc-700 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2 bg-white text-black font-bold text-xs rounded-lg hover:bg-zinc-200 transition-colors"
                        >
                          Submit Assist Ticket
                        </button>
                      </form>
                    )}
                  </div>

                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </main>

      {/* Popups & Modals */}

      {/* 1. Generate New QR Code Popup */}
      {newQRModalOpen && (
        <div id="new-qr-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-6 relative">
            <button
              onClick={() => setNewQRModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-zinc-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-serif italic text-white mb-2">Configure Dynamic QR code</h3>
            <p className="text-xs text-zinc-500 mb-4">Set location context so scan metrics can isolate which counter is collecting the highest conversion scores.</p>

            <form onSubmit={handleCreateQRCode} className="space-y-4">
              <div>
                <label className="block text-[10px] text-zinc-500 font-semibold mb-1 uppercase">Display/Location Tag</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Table 15 Sign, Front Window Flyer..."
                  value={newQRName}
                  onChange={(e) => setNewQRName(e.target.value)}
                  className="w-full bg-[#050505] border border-[#1a1a1a] text-xs text-white placeholder-zinc-700 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-500 font-semibold mb-1 uppercase">Rating Gate Threshold</label>
                <select
                  value={newQRRequiredRating}
                  onChange={(e) => setNewQRRequiredRating(Number(e.target.value))}
                  className="w-full bg-[#050505] border border-[#1a1a1a] text-xs text-white rounded-lg p-2.5 focus:outline-none"
                >
                  <option value={5}>5 Stars Only (Elite positive capture)</option>
                  <option value={4}>4+ Stars Only (Recommended default)</option>
                  <option value={3}>3+ Stars (Accept moderate stars)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setNewQRModalOpen(false)}
                  className="px-4 py-2 bg-transparent text-zinc-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-white text-black font-bold text-xs rounded-lg hover:bg-zinc-200 transition-colors"
                >
                  Generate QR Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Download Poster / QR Poster Preview Popup */}
      {selectedQRForPoster && (
        <div id="print-poster-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-6 relative">
            <button
              onClick={() => setSelectedQRForPoster(null)}
              className="absolute top-4 right-4 p-1 text-zinc-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-serif italic text-white mb-2">Print Poster Setup</h3>
            <p className="text-xs text-zinc-500 mb-4">Print directly or download vectorized SVG files to place on tabletop acrylic tents.</p>

            {/* Poster Mockup */}
            <div className="p-8 bg-white text-black rounded-xl text-center shadow-2xl border border-zinc-200 my-4 max-w-xs mx-auto space-y-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Love Sweet Bites Bakery?</span>
              <h2 className="text-xl font-serif font-semibold italic text-slate-900 leading-tight">Please leave us a review!</h2>
              
              <div className="flex justify-center py-2">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(selectedQRForPoster.url)}`}
                  alt={selectedQRForPoster.name}
                  className="w-32 h-32 border-2 border-black p-1"
                />
              </div>

              <div className="space-y-1">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Scan this matching flyer QR</p>
                <p className="text-[9px] font-mono font-bold text-zinc-700">{selectedQRForPoster.url}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => {
                  window.print();
                  addLog("Printed Poster", `Triggered direct print dialog for: ${selectedQRForPoster.name}`, "info");
                }}
                className="py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-zinc-200"
              >
                Direct Print Poster
              </button>
              <button
                onClick={() => {
                  alert(`Downloading vectorized SVG/PNG/PDF package for QR Code Slug: ${selectedQRForPoster.url}`);
                  addLog("Downloaded QR Asset Pack", `Retrieved premium PDF/SVG asset pack for ${selectedQRForPoster.name}`, "success");
                  setSelectedQRForPoster(null);
                }}
                className="py-2 bg-[#1a1a1a] border border-[#333] text-zinc-300 hover:text-white text-xs font-semibold rounded-lg"
              >
                Download Package (SVG/PDF)
              </button>
            </div>
          </div>
        </div>
      )}

      <Analytics />
    </div>
  );
}
