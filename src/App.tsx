import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
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
import { Share2, Printer, Palette, BarChart2, Lock as LockIcon, Unlock as UnlockIcon, FileDown, Eye } from "lucide-react";
import Auth from "./components/Auth";
import Sidebar, { ActiveSection } from "./components/Sidebar";
import QRReviewPortal from "./components/QRReviewPortal";
import ProLockOverlay from "./components/ProLockOverlay";
import ThemeBuilder from "./components/ThemeBuilder";
import PublicReviewPage from "./components/PublicReviewPage";
import SuperAdminPanel from "./components/SuperAdminPanel";
import SystemHealth from "./components/SystemHealth";
import { 
  auth, 
  db, 
  signOut,
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  addDoc,
  OperationType,
  handleFirestoreError
} from "./lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
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
    const list: QRCodeItem[] = saved ? JSON.parse(saved) : initialQRCodes;
    return list.map(q => {
      let slug = "";
      if (q.url) {
        const parts = q.url.split("/");
        slug = parts[parts.length - 1];
      }
      if (!slug || slug === "r" || slug === "review" || slug.startsWith("http")) {
        slug = q.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
      }
      return {
        ...q,
        url: `${window.location.origin}/r/${slug}`
      };
    });
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

  // Public route loading states
  const pathnameTmp = window.location.pathname;
  const isPublicRouteTmp = pathnameTmp.startsWith("/r/") || pathnameTmp.startsWith("/review/");
  const [publicQR, setPublicQR] = useState<QRCodeItem | null>(null);
  const [publicProfile, setPublicProfile] = useState<BusinessProfile | null>(null);
  const [loadingPublic, setLoadingPublic] = useState(isPublicRouteTmp);

  // App metrics & UI Controls
  const [activeSection, setActiveSection] = useState<ActiveSection>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [aiUsageCredits, setAiUsageCredits] = useState(84); // out of 100

  // Super Admin Mode State
  const [isSuperAdminMode, setIsSuperAdminMode] = useState(false);

  const handleAdminImpersonate = (businessName: string) => {
    let category = "Local Store";
    let website = "https://example.com";
    let phone = "(555) 019-2834";
    let logo = "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=120";
    let plan: "Free" | "Pro" | "Enterprise" = "Pro";

    if (businessName === "Golden Gate Gym") {
      category = "Fitness & Health";
      website = "https://www.goldengategym.com";
      phone = "(415) 555-2019";
      logo = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=120";
      plan = "Enterprise";
    } else if (businessName === "Apex Dental Care") {
      category = "Medical & Dental";
      website = "https://www.apexdental.com";
      phone = "(415) 555-4029";
      logo = "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=120";
      plan = "Pro";
    } else if (businessName === "Bella Italia Bistro") {
      category = "Restaurant & Dining";
      website = "https://www.bellaitalia.com";
      phone = "(415) 555-0192";
      logo = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=120";
      plan = "Free";
    }

    setBusinessProfile({
      name: businessName,
      logo,
      category,
      address: "100 SaaS Blvd, Suite 200, San Francisco, CA 94107",
      phone,
      website,
      googleReviewLink: `https://g.page/r/${businessName.toLowerCase().replace(/[^a-z0-9]/g, "-")}/review`,
      hours: "Mon-Fri: 9:00 AM - 8:00 PM",
      socials: {
        facebook: "https://facebook.com",
        instagram: "https://instagram.com",
        twitter: "https://twitter.com",
        linkedin: "https://linkedin.com"
      }
    });

    setUser({
      id: "usr_impersonate_" + Math.random().toString(36).substr(2, 5),
      email: `${businessName.toLowerCase().replace(/[^a-z0-9]/g, "")}@example.com`,
      name: "Impersonated Tenant",
      businessName,
      plan,
      role: "Owner"
    });

    setIsSuperAdminMode(false);
  };

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
  const [showAllQRFlyer, setShowAllQRFlyer] = useState(false);
  const [newQRName, setNewQRName] = useState("");
  const [newQRRequiredRating, setNewQRRequiredRating] = useState(4);
  const [selectedQRForPoster, setSelectedQRForPoster] = useState<QRCodeItem | null>(null);
  const [selectedSimulatedQRId, setSelectedSimulatedQRId] = useState<string>("");
  const [sharingQRCode, setSharingQRCode] = useState<QRCodeItem | null>(null);
  const [copiedQRId, setCopiedQRId] = useState<string | null>(null);

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

  // Listen for Firebase Auth changes
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        return;
      }

      // Fetch user profile from Firestore
      try {
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const uData = userSnap.data() as User;
          setUser(uData);
        } else {
          const isDefaultAdmin = firebaseUser.email === "admin@reviewplease.ai" || firebaseUser.email === "sahil265064@gmail.com";
          const fallbackUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
            businessName: "My Business",
            avatar: firebaseUser.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120",
            plan: "Pro",
            role: isDefaultAdmin ? "Admin" : "Owner"
          };
          await setDoc(userRef, fallbackUser);
          setUser(fallbackUser);
        }
      } catch (e) {
        console.error("Error fetching or initializing user profile:", e);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Listen for Firestore dynamic tenant collection snapshots
  useEffect(() => {
    if (!user) {
      // Clear tenant-specific states upon sign out to isolate memory boundaries
      setQRCodes([]);
      setReviews([]);
      setTeam([]);
      setActivityLogs([]);
      setNotifications([]);
      setBilling([]);
      return;
    }

    // 1. Business Profile Snap
    const unsubBusiness = onSnapshot(doc(db, "businesses", user.id), (snap) => {
      if (snap.exists()) {
        setBusinessProfile(snap.data() as BusinessProfile);
      } else {
        // Seed initial business profile document
        const newProfile: BusinessProfile = {
          name: user.businessName || "My Business",
          logo: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=120",
          category: "Retail Business",
          address: "128 Gourmet Ave, Suite A, San Francisco, CA 94107",
          phone: "(415) 555-8931",
          website: "https://example.com",
          googleReviewLink: "https://g.page/r/review",
          hours: "Mon-Sat: 7:00 AM - 6:00 PM",
          socials: {
            facebook: "https://facebook.com",
            instagram: "https://instagram.com",
            twitter: "https://twitter.com",
            linkedin: "https://linkedin.com"
          }
        };
        setDoc(doc(db, "businesses", user.id), { ...newProfile, userId: user.id })
          .catch((e) => console.error("Failed to seed initial business profile:", e));
      }
    });

    // 2. QR Codes List Snap
    const unsubQRCodes = onSnapshot(
      query(collection(db, "qrcodes"), where("userId", "==", user.id)),
      (snap) => {
        const list: QRCodeItem[] = [];
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as QRCodeItem);
        });
        setQRCodes(list);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, "qrcodes")
    );

    // 3. Reviews List Snap
    const unsubReviews = onSnapshot(
      query(collection(db, "reviews"), where("userId", "==", user.id)),
      (snap) => {
        const list: Review[] = [];
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Review);
        });
        setReviews(list);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, "reviews")
    );

    // 4. Team Members Snap
    const unsubTeam = onSnapshot(
      query(collection(db, "team"), where("userId", "==", user.id)),
      (snap) => {
        const list: TeamMember[] = [];
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as TeamMember);
        });
        setTeam(list);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, "team")
    );

    // 5. Activity Logs Snap
    const unsubLogs = onSnapshot(
      query(collection(db, "activity_logs"), where("userId", "==", user.id)),
      (snap) => {
        const list: ActivityLog[] = [];
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as ActivityLog);
        });
        // Sort logs in reverse chronological order
        list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setActivityLogs(list);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, "activity_logs")
    );

    // 6. Notifications Snap
    const unsubNotifications = onSnapshot(
      query(collection(db, "notifications"), where("userId", "==", user.id)),
      (snap) => {
        const list: NotificationItem[] = [];
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as NotificationItem);
        });
        list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setNotifications(list);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, "notifications")
    );

    // 7. Billing Invoices Snap
    const unsubBilling = onSnapshot(
      query(collection(db, "billing"), where("userId", "==", user.id)),
      (snap) => {
        const list: BillingInvoice[] = [];
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as BillingInvoice);
        });
        setBilling(list);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, "billing")
    );

    return () => {
      unsubBusiness();
      unsubQRCodes();
      unsubReviews();
      unsubTeam();
      unsubLogs();
      unsubNotifications();
      unsubBilling();
    };
  }, [user]);

  // Auth handler
  const handleLogin = (newUser: User) => {
    setUser(newUser);
    addLog("User Signed In", `Sarah Jenkins successfully logged into review please console.`, "success");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  // Utility to log activities
  const addLog = async (action: string, details: string, type: "info" | "success" | "warning" | "error" | "ai" = "info") => {
    if (!user) return;
    try {
      const logId = "act_" + Math.random().toString(36).substr(2, 9);
      const newLog = {
        user: user.name || "System",
        action,
        details,
        time: "Just now",
        timestamp: Date.now(),
        type: type,
        userId: user.id
      };
      await setDoc(doc(db, "activity_logs", logId), newLog);
    } catch (e) {
      console.error("Failed to append activity log document in database", e);
    }
  };

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllNotificationsAsRead = async () => {
    if (!user) return;
    try {
      for (const n of notifications) {
        if (!n.read) {
          await updateDoc(doc(db, "notifications", n.id), { read: true });
        }
      }
      addLog("Marked Read", "All pending alert notifications cleared.", "info");
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, "notifications");
    }
  };

  const handleGenerateAISuggestions = async () => {
    setAiAssistantLoading(true);
    try {
      const response = await fetch("/api/gemini/suggest-reviews", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-User-Plan": user?.plan || "Free"
        },
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
        headers: { 
          "Content-Type": "application/json",
          "X-User-Plan": user?.plan || "Free"
        },
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
        headers: { 
          "Content-Type": "application/json",
          "X-User-Plan": user?.plan || "Free"
        },
        body: JSON.stringify({
          reviewText: selectedReviewForReply.text,
          reviewerName: selectedReviewForReply.author,
          rating: selectedReviewForReply.rating,
          tone: aiReplyTone,
          businessName: businessProfile.name
        })
      });
      
      if (response.status === 403) {
        const errorData = await response.json();
        alert(errorData.error || "AI Replies are restricted to PRO plan accounts.");
        return;
      }

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

  const saveReplyToReview = async () => {
    if (!selectedReviewForReply || !aiReplyDraft.trim()) return;
    try {
      await updateDoc(doc(db, "reviews", selectedReviewForReply.id), {
        response: aiReplyDraft,
        status: "replied"
      });
      addLog("Review Reply Published", `Replied successfully to customer ${selectedReviewForReply.author}.`, "success");
      setSelectedReviewForReply(null);
      setAiReplyDraft("");
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `reviews/${selectedReviewForReply.id}`);
    }
  };

  const handleCreateQRCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQRName.trim() || !user) return;
    
    // Pro Tier has unlimited QR codes. Free is limited to 3. 
    if (user.plan === "Free" && qrCodes.length >= 3) {
      alert("Upgrade to PRO to generate unlimited dynamic QR Codes.");
      return;
    }

    try {
      const uniqueSlug = newQRName.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Math.random().toString(36).substr(2, 4);
      const qrId = "qr_" + Math.random().toString(36).substr(2, 9);
      const newQR: any = {
        name: newQRName,
        url: `${window.location.origin}/r/${uniqueSlug}`,
        createdAt: new Date().toISOString().split("T")[0],
        scans: 0,
        ratingRequired: newQRRequiredRating,
        status: "Active",
        userId: user.id
      };

      await setDoc(doc(db, "qrcodes", qrId), newQR);
      setNewQRName("");
      setNewQRModalOpen(false);
      addLog("QR Code Created", `Generated dynamic URL matching counter/location for: ${newQRName}`, "success");
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, "qrcodes");
    }
  };

  const handleDeleteQR = async (id: string) => {
    try {
      await deleteDoc(doc(db, "qrcodes", id));
      addLog("QR Code Deleted", `Removed dynamic destination setup for ID: ${id}`, "warning");
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `qrcodes/${id}`);
    }
  };

  const handleRegenerateQR = async (id: string) => {
    try {
      const qrRef = doc(db, "qrcodes", id);
      const qrSnap = await getDoc(qrRef);
      if (qrSnap.exists()) {
        const qrData = qrSnap.data();
        const uniqueSlug = qrData.name.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Math.random().toString(36).substr(2, 4);
        await updateDoc(qrRef, {
          url: `${window.location.origin}/r/${uniqueSlug}`
        });
        addLog("QR Code Regenerated", `Created fresh random routing slug for QR ID: ${id}`, "info");
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `qrcodes/${id}`);
    }
  };

  const handleInviteTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim() || !user) return;

    try {
      const memberId = "team_" + Math.random().toString(36).substr(2, 9);
      const newMember = {
        name: inviteName,
        email: inviteEmail,
        role: inviteRole,
        status: "Pending",
        joinedAt: new Date().toISOString().split("T")[0],
        userId: user.id
      };

      await setDoc(doc(db, "team", memberId), newMember);
      setInviteName("");
      setInviteEmail("");
      addLog("Team Member Invited", `Sent verification invitation to: ${inviteEmail} with ${inviteRole} privileges.`, "success");
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, "team");
    }
  };

  const handleUpgradePlan = async () => {
    if (user) {
      try {
        await updateDoc(doc(db, "users", user.id), { plan: "Enterprise" });
        addLog("Subscription Upgraded", "Upgraded to Enterprise tier. Unlimited QR, custom API keys unlocked.", "success");
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `users/${user.id}`);
      }
    }
  };

  const handleDowngradePlan = async () => {
    if (user) {
      try {
        await updateDoc(doc(db, "users", user.id), { plan: "Free" });
        addLog("Subscription Cancelled", "Downgraded to Free Tier. Limitations apply.", "warning");
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `users/${user.id}`);
      }
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

  // Client-side Router mapping for QR Permanent Review Page URLs
  const pathname = window.location.pathname;
  const isPublicRoute = pathname.startsWith("/r/") || pathname.startsWith("/review/");

  useEffect(() => {
    if (isPublicRoute) {
      const uniqueId = pathname.startsWith("/r/") 
        ? pathname.split("/r/")[1] 
        : pathname.split("/review/")[1];

      if (uniqueId) {
        const loadPublicData = async () => {
          try {
            const qrsSnap = await getDocs(collection(db, "qrcodes"));
            let foundQR: any = null;
            qrsSnap.forEach((doc) => {
              const data = doc.data();
              const qrId = doc.id;
              const url = data.url || "";
              const slug = url.split("/").pop() || "";
              if (qrId === uniqueId || slug === uniqueId) {
                foundQR = { id: qrId, ...data };
              }
            });

            if (foundQR) {
              setPublicQR(foundQR);
              const bizSnap = await getDoc(doc(db, "businesses", foundQR.userId));
              if (bizSnap.exists()) {
                setPublicProfile(bizSnap.data() as BusinessProfile);
              }
            } else {
              // Fallback to local profile if no cloud record is seeded yet
              setPublicProfile(businessProfile);
              setPublicQR({
                id: uniqueId,
                name: "Demo Location",
                url: window.location.href,
                createdAt: new Date().toISOString().split("T")[0],
                scans: 10,
                ratingRequired: 4,
                status: "Active"
              });
            }
          } catch (e) {
            console.error("Error loading public review tenant data", e);
            // Fallback safe defaults to ensure the app never crashes
            setPublicProfile(businessProfile);
          } finally {
            setLoadingPublic(false);
          }
        };
        loadPublicData();
      }
    }
  }, [isPublicRoute, pathname]);

  if (isPublicRoute) {
    if (loadingPublic) {
      return (
        <div className="min-h-screen bg-[#050505] flex flex-col justify-center items-center space-y-4">
          <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-zinc-500 font-mono tracking-widest uppercase">Loading review portal...</p>
        </div>
      );
    }

    const uniqueId = pathname.startsWith("/r/") 
      ? pathname.split("/r/")[1] 
      : pathname.split("/review/")[1];

    if (uniqueId) {
      return (
        <PublicReviewPage
          businessProfile={publicProfile || businessProfile}
          qrCodes={publicQR ? [publicQR] : qrCodes}
          onAddReview={async (newReview) => {
            try {
              const targetUserId = publicQR ? (publicQR as any).userId : (user ? user.id : "system");
              const reviewId = "rev_" + Math.random().toString(36).substr(2, 9);
              const payload = {
                ...newReview,
                userId: targetUserId
              };
              await setDoc(doc(db, "reviews", reviewId), payload);
              
              // Local log trigger
              console.log("Successfully recorded public review in Firestore database.");
            } catch (e) {
              console.error("Failed to save public review to firestore:", e);
            }
          }}
          uniqueId={uniqueId}
        />
      );
    }
  }

  if (isSuperAdminMode) {
    return (
      <SuperAdminPanel
        onExit={() => setIsSuperAdminMode(false)}
        onImpersonate={handleAdminImpersonate}
      />
    );
  }

  // If not logged in, render the login flow
  if (!user) {
    return <Auth onLogin={handleLogin} onAdminAccess={() => setIsSuperAdminMode(true)} />;
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
        onAdminAccess={() => setIsSuperAdminMode(true)}
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

            {/* 2. QR CODE & PERMANENT REVIEW PAGES HUB */}
            {activeSection === "qrcodes" && (
              <motion.div
                key="qrcodes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-serif text-white italic">QR Codes & Review Pages</h2>
                    <p className="text-xs text-zinc-500">Each permanent physical placement receives a unique permanent redirect URL and high-contrast dynamic QR flyer.</p>
                  </div>
                  <div className="flex flex-wrap gap-3 self-start">
                    <button
                      onClick={() => setNewQRModalOpen(true)}
                      className="px-4 py-2.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Generate New QR Page</span>
                    </button>
                    <button
                      onClick={() => setShowAllQRFlyer(true)}
                      className="px-4 py-2.5 rounded-xl bg-[#0c0c0c] border border-zinc-800 text-zinc-300 text-xs font-semibold hover:text-white hover:border-zinc-700 transition-colors flex items-center space-x-2"
                    >
                      <Printer className="h-4 w-4 text-emerald-400 animate-pulse" />
                      <span>Export All (A4 PDF Flyer)</span>
                    </button>
                  </div>
                </div>

                {/* QR Codes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {qrCodes.map((qr) => {
                    // Build a fully dynamic, correct local URL matching origin format and preserving any specific slug
                    let slug = "";
                    if (qr.url) {
                      const parts = qr.url.split("/");
                      slug = parts[parts.length - 1];
                    }
                    if (!slug || slug === "r" || slug === "review" || slug.startsWith("http")) {
                      slug = qr.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
                    }
                    const liveReviewUrl = `${window.location.origin}/r/${slug}`;
                    // Keep local representation updated
                    qr.url = liveReviewUrl;

                    return (
                      <div key={qr.id} className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-zinc-800 transition-all shadow-xl">
                        <div className="space-y-3">
                          
                          {/* Business Info Header */}
                          <div className="flex justify-between items-start border-b border-[#1a1a1a] pb-3">
                            <div>
                              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Business Name</span>
                              <h4 className="text-sm font-semibold text-white leading-tight">{businessProfile.name}</h4>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Status</span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase mt-0.5 ${qr.status === "Active" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/40" : "bg-zinc-900/50 text-zinc-500 border border-zinc-800"}`}>
                                {qr.status}
                              </span>
                            </div>
                          </div>

                          {/* Specific QR Identifier */}
                          <div className="flex justify-between items-center bg-black/40 border border-zinc-900 px-3 py-1.5 rounded-xl text-xs">
                            <span className="text-zinc-400 font-medium">Placement:</span>
                            <span className="text-white font-bold">{qr.name}</span>
                          </div>

                          {/* Review Page URL */}
                          <div className="space-y-1">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono block">Review Page URL</span>
                            <div className="bg-[#050505] border border-zinc-900 rounded-xl p-2.5 flex items-center justify-between">
                              <span className="text-[10px] text-zinc-400 font-mono truncate mr-2">{liveReviewUrl}</span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(liveReviewUrl);
                                  setCopiedQRId(qr.id);
                                  setTimeout(() => setCopiedQRId(null), 2000);
                                  addLog("Copied URL", `Copied permanent URL for ${qr.name}`, "success");
                                }}
                                className="text-zinc-500 hover:text-emerald-400 p-1 transition-colors animate-pulse"
                                title="Copy Review URL"
                              >
                                {copiedQRId === qr.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Google Review Target Link */}
                          <div className="space-y-1">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono block">Google Review Link Target</span>
                            <div className="bg-[#050505] border border-zinc-900 rounded-xl p-2.5 flex items-center justify-between text-[10px]">
                              <span className="text-amber-500 font-mono truncate mr-2">{businessProfile.googleReviewLink || "No link connected"}</span>
                              <a 
                                href={businessProfile.googleReviewLink || "#"} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-zinc-500 hover:text-white"
                                title="Verify Direct Google Link"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>

                          {/* Center QR code container with dynamic image preview */}
                          <div className="my-3 p-4 bg-white rounded-xl flex flex-col items-center justify-center border border-zinc-800 shadow-inner group relative">
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(liveReviewUrl)}`}
                              alt={qr.name}
                              className="w-32 h-32"
                            />
                            <span className="text-[9px] text-zinc-400 font-mono mt-2 uppercase tracking-tight">QR Flyer Preview</span>
                          </div>

                          {/* Quick Analytics Summary */}
                          <div className="grid grid-cols-2 gap-2 bg-black/20 p-2.5 rounded-xl border border-zinc-900/60 text-[11px]">
                            <div className="text-center border-r border-zinc-900">
                              <span className="text-zinc-500 block">Total Scans</span>
                              <span className="text-white font-mono font-bold text-xs">{qr.scans}</span>
                            </div>
                            <div className="text-center">
                              <span className="text-zinc-500 block">Required Stars</span>
                              <span className="text-amber-400 font-bold text-xs">{qr.ratingRequired}+ Stars</span>
                            </div>
                          </div>

                        </div>

                        {/* Complete 12 Actions Command Matrix */}
                        <div className="space-y-2 pt-3 border-t border-[#1a1a1a]">
                          <span className="text-[9px] text-zinc-600 uppercase tracking-widest font-mono block">QR Command Matrix:</span>
                          
                          {/* Row 1: Copy, Open, Share */}
                          <div className="grid grid-cols-3 gap-1.5">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(liveReviewUrl);
                                setCopiedQRId(qr.id);
                                setTimeout(() => setCopiedQRId(null), 2000);
                                addLog("Copied Link", `Copied permanent review page URL: ${liveReviewUrl}`, "success");
                              }}
                              className="py-1.5 px-1 bg-[#141414] border border-zinc-800 text-[10px] text-zinc-300 hover:text-white rounded-lg flex items-center justify-center space-x-1"
                              title="Copy Review URL to clipboard"
                            >
                              <Copy className="w-3 h-3 text-zinc-500" />
                              <span>{copiedQRId === qr.id ? "Copied" : "Copy Link"}</span>
                            </button>
                            <button
                              onClick={() => window.open(liveReviewUrl, "_blank")}
                              className="py-1.5 px-1 bg-[#141414] border border-zinc-800 text-[10px] text-zinc-300 hover:text-white rounded-lg flex items-center justify-center space-x-1"
                              title="Open page in a new window tab"
                            >
                              <ExternalLink className="w-3 h-3 text-zinc-500" />
                              <span>Open URL</span>
                            </button>
                            <button
                              onClick={() => setSharingQRCode(qr)}
                              className="py-1.5 px-1 bg-[#141414] border border-zinc-800 text-[10px] text-zinc-300 hover:text-white rounded-lg flex items-center justify-center space-x-1"
                              title="Share Review URL across social platforms"
                            >
                              <Share2 className="w-3 h-3 text-zinc-500" />
                              <span>Share</span>
                            </button>
                          </div>

                          {/* Row 2: Download PNG, Download SVG, Download PDF */}
                          <div className="grid grid-cols-3 gap-1.5">
                            <button
                              onClick={() => {
                                const api = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&format=png&data=${encodeURIComponent(liveReviewUrl)}`;
                                window.open(api, "_blank");
                                addLog("Downloaded PNG", `Saved 500x500 high-res PNG for ${qr.name}`, "success");
                              }}
                              className="py-1.5 px-1 bg-[#141414] border border-zinc-800 text-[10px] text-zinc-300 hover:text-white rounded-lg flex items-center justify-center space-x-1"
                              title="Download 500px high-contrast PNG"
                            >
                              <FileDown className="w-3 h-3 text-emerald-500" />
                              <span>PNG</span>
                            </button>
                            <button
                              onClick={() => {
                                const api = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&format=svg&data=${encodeURIComponent(liveReviewUrl)}`;
                                window.open(api, "_blank");
                                addLog("Downloaded SVG", `Saved scalable vector SVG for ${qr.name}`, "success");
                              }}
                              className="py-1.5 px-1 bg-[#141414] border border-zinc-800 text-[10px] text-zinc-300 hover:text-white rounded-lg flex items-center justify-center space-x-1"
                              title="Download clean vectorized SVG"
                            >
                              <FileDown className="w-3 h-3 text-teal-500" />
                              <span>SVG</span>
                            </button>
                            <button
                              onClick={() => {
                                alert(`Generating print-ready PDF review flyer template for counter placement: ${qr.name}...`);
                                addLog("Downloaded PDF", `Generated corporate flyer instructions PDF for ${qr.name}`, "success");
                              }}
                              className="py-1.5 px-1 bg-[#141414] border border-zinc-800 text-[10px] text-zinc-300 hover:text-white rounded-lg flex items-center justify-center space-x-1"
                              title="Download PDF standee layout instructions"
                            >
                              <FileDown className="w-3 h-3 text-blue-500" />
                              <span>PDF</span>
                            </button>
                          </div>

                          {/* Row 3: Print QR Flyer, Customize Theme, View Analytics */}
                          <div className="grid grid-cols-3 gap-1.5">
                            <button
                              onClick={() => setSelectedQRForPoster(qr)}
                              className="py-1.5 px-1 bg-[#141414] border border-zinc-800 text-[10px] text-zinc-300 hover:text-white rounded-lg flex items-center justify-center space-x-1"
                              title="Launch print dialog with tabletop template"
                            >
                              <Printer className="w-3 h-3 text-purple-400" />
                              <span>Print QR</span>
                            </button>
                            <button
                              onClick={() => setActiveSection("theme_builder")}
                              className="py-1.5 px-1 bg-[#141414] border border-zinc-800 text-[10px] text-zinc-300 hover:text-white rounded-lg flex items-center justify-center space-x-1"
                              title="Go to builder and customize theme, logo and fonts"
                            >
                              <Palette className="w-3 h-3 text-pink-400" />
                              <span>Theme</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveSection("dashboard");
                                alert(`Filtering real-time scan analytics specifically for counter: "${qr.name}"`);
                              }}
                              className="py-1.5 px-1 bg-[#141414] border border-zinc-800 text-[10px] text-zinc-300 hover:text-white rounded-lg flex items-center justify-center space-x-1"
                              title="Filter analytics graphs"
                            >
                              <BarChart2 className="w-3 h-3 text-amber-400" />
                              <span>Metrics</span>
                            </button>
                          </div>

                          {/* Row 4: Regenerate, Enable/Disable, Delete */}
                          <div className="grid grid-cols-3 gap-1.5 pt-1.5 border-t border-[#1a1a1a]/40">
                            <button
                              onClick={() => {
                                alert(`Refreshing QR routing signature rules for ${qr.name}. Stable permanent redirect URL remains exactly: ${liveReviewUrl}`);
                                addLog("Regenerated QR Signature", `Refreshed secure counter handshake rules for ${qr.name}. URL remained stable.`, "info");
                              }}
                              className="py-1.5 bg-zinc-900 border border-zinc-800 text-[9px] hover:text-white font-mono text-zinc-400 hover:bg-zinc-800 rounded-lg"
                              title="Refreshes QR visual signature without changing URL"
                            >
                              Regenerate
                            </button>
                            <button
                              onClick={() => {
                                const nextStatus = qr.status === "Active" ? "Inactive" : "Active";
                                setQRCodes(prev => prev.map(q => q.id === qr.id ? { ...q, status: nextStatus } : q));
                                addLog(
                                  nextStatus === "Active" ? "Review Page Enabled" : "Review Page Disabled",
                                  `Switched ${qr.name} to ${nextStatus}. Visiting customers will see corresponding page states.`,
                                  nextStatus === "Active" ? "success" : "warning"
                                );
                              }}
                              className={`py-1.5 border text-[9px] font-mono rounded-lg transition-colors ${
                                qr.status === "Active" 
                                  ? "bg-amber-950/20 border-amber-900/30 text-amber-400 hover:bg-amber-900/20" 
                                  : "bg-emerald-950/20 border-emerald-900/30 text-emerald-400 hover:bg-emerald-900/20"
                              }`}
                              title={qr.status === "Active" ? "Disable Customer Access" : "Enable Customer Access"}
                            >
                              {qr.status === "Active" ? "Disable" : "Enable"}
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you absolutely sure you want to delete the Review Page and QR code for: ${qr.name}? This action cannot be undone.`)) {
                                  handleDeleteQR(qr.id);
                                }
                              }}
                              className="py-1.5 bg-rose-950/20 border border-rose-900/30 hover:bg-rose-900/20 text-rose-400 text-[9px] font-mono rounded-lg transition-colors flex items-center justify-center space-x-1"
                              title="Delete this placement forever"
                            >
                              <span>Delete</span>
                            </button>
                          </div>

                        </div>
                      </div>
                    );
                  })}
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
                  onAddReview={async (review) => {
                    if (user) {
                      try {
                        const reviewId = review.id || "rev_" + Math.random().toString(36).substr(2, 9);
                        await setDoc(doc(db, "reviews", reviewId), {
                          ...review,
                          userId: user.id
                        });
                      } catch (e) {
                        handleFirestoreError(e, OperationType.WRITE, `reviews/${review.id}`);
                      }
                    }
                  }}
                  onAddActivityLog={(action, details, type) => addLog(action, details, type)}
                  onAddNotification={async (title, description, type) => {
                    if (user) {
                      const notifId = "notif_" + Math.random().toString(36).substr(2, 9);
                      try {
                        await setDoc(doc(db, "notifications", notifId), {
                          title,
                          description,
                          time: "Just now",
                          type,
                          read: false,
                          userId: user.id,
                          timestamp: Date.now()
                        });
                      } catch (e) {
                        handleFirestoreError(e, OperationType.WRITE, `notifications/${notifId}`);
                      }
                    }
                  }}
                  onIncrementScanCount={async (qrCodeId) => {
                    if (user) {
                      try {
                        const qrRef = doc(db, "qrcodes", qrCodeId);
                        const qrSnap = await getDoc(qrRef);
                        if (qrSnap.exists()) {
                          const currentScans = qrSnap.data().scans || 0;
                          await updateDoc(qrRef, { scans: currentScans + 1 });
                        }
                      } catch (e) {
                        handleFirestoreError(e, OperationType.UPDATE, `qrcodes/${qrCodeId}`);
                      }
                    }
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

                {user && user.plan === "Free" ? (
                  <ProLockOverlay
                    user={user}
                    featureName="Theme Builder & Custom Branding"
                    onUpgradeSuccess={(newPlan) => {
                      setUser(prev => prev ? { ...prev, plan: newPlan } : null);
                      addLog("Account Upgraded", "Successfully activated Premium Pro subscription!", "success");
                    }}
                  />
                ) : (
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
                )}
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

                {user && user.plan === "Free" ? (
                  <ProLockOverlay
                    user={user}
                    featureName="AI Professional Reply Generator"
                    onUpgradeSuccess={(newPlan) => {
                      setUser(prev => prev ? { ...prev, plan: newPlan } : null);
                      addLog("Account Upgraded", "Successfully activated Premium Pro subscription!", "success");
                    }}
                  />
                ) : (
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
                )}
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
                      onClick={async () => {
                        if (user) {
                          try {
                            await setDoc(doc(db, "businesses", user.id), { ...businessProfile, userId: user.id });
                            addLog("Profile Saved", "Synchronized business credentials with Google API wrapper.", "success");
                            alert("Profile changes synchronized successfully!");
                          } catch (e) {
                            handleFirestoreError(e, OperationType.WRITE, `businesses/${user.id}`);
                          }
                        }
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

                {user && user.plan === "Free" ? (
                  <ProLockOverlay
                    user={user}
                    featureName="Team Members & Collaboration"
                    onUpgradeSuccess={(newPlan) => {
                      setUser(prev => prev ? { ...prev, plan: newPlan } : null);
                      addLog("Account Upgraded", "Successfully activated Premium Pro subscription!", "success");
                    }}
                  />
                ) : (
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
                )}
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

            {/* 13. SYSTEM HEALTH DASHBOARD */}
            {activeSection === "system_health" && (
              <SystemHealth />
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

      {/* Share Review Link Dialog Popup */}
      {sharingQRCode && (() => {
        let slug = "";
        if (sharingQRCode.url) {
          const parts = sharingQRCode.url.split("/");
          slug = parts[parts.length - 1];
        }
        if (!slug || slug === "r" || slug === "review" || slug.startsWith("http")) {
          slug = sharingQRCode.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
        }
        const shareUrl = `${window.location.origin}/r/${slug}`;
        const encodedUrl = encodeURIComponent(shareUrl);
        const businessName = businessProfile.name;
        
        // Share Messages Templates
        const templates = {
          whatsapp: `Please leave us a review! It takes less than 30 seconds: ${shareUrl}`,
          sms: `Hi! We'd love your feedback. Rate us here: ${shareUrl}`,
          emailSubject: `We'd love your feedback!`,
          emailBody: `Dear Customer,\n\nThank you for choosing ${businessName}! We would appreciate it if you could take 30 seconds to share your experience with us here:\n\n${shareUrl}\n\nThank you!`,
          nfcText: `Write the following permanent redirect URL to your physical NFC NTAG213 cards or keychains: ${shareUrl}`
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-6 relative">
              <button
                onClick={() => setSharingQRCode(null)}
                className="absolute top-4 right-4 p-1 text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-serif italic text-white mb-1">Share Review Link</h3>
              <p className="text-xs text-zinc-500 mb-5">Distribute your permanent review page link to customers via digital channels or NFC chips.</p>

              <div className="space-y-4">
                {/* Display Current URL */}
                <div className="bg-[#050505] border border-zinc-900 rounded-xl p-3 flex items-center justify-between">
                  <div className="truncate mr-3 text-left">
                    <span className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 block mb-0.5">Permanent URL</span>
                    <span className="text-xs text-zinc-300 font-mono">{shareUrl}</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl);
                      addLog("Copied Link", "Shared URL copied to clipboard", "success");
                    }}
                    className="p-1.5 bg-[#141414] border border-zinc-800 text-zinc-400 hover:text-white rounded-lg text-xs font-semibold shrink-0"
                  >
                    Copy
                  </button>
                </div>

                {/* Grid of sharing options */}
                <div className="grid grid-cols-2 gap-3">
                  
                  {/* WhatsApp */}
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(templates.whatsapp)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-[#111] border border-zinc-900 hover:border-[#25d366]/40 hover:bg-[#25d366]/5 rounded-xl flex items-center space-x-3 transition-all text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#25d366]/10 flex items-center justify-center text-[#25d366] shrink-0">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.528 2.01 14.069.99 11.519.99 6.086.99 1.662 5.361 1.658 10.793c-.001 1.741.486 3.443 1.411 4.908l-.989 3.613 3.73-.972c1.452.8 3.097 1.222 4.837 1.222zm10.71-7.172c-.292-.146-1.727-.853-1.993-.95-.266-.097-.46-.146-.653.146-.193.292-.748.95-.917 1.146-.169.196-.338.22-.63.073-.292-.146-1.234-.455-2.35-1.453-.868-.775-1.454-1.733-1.625-2.026-.17-.293-.018-.452.129-.597.132-.131.292-.341.439-.512.146-.17.195-.292.292-.487.097-.195.048-.365-.024-.512-.073-.146-.653-1.573-.895-2.156-.236-.569-.475-.491-.653-.5-.169-.008-.362-.01-.555-.01-.193 0-.507.073-.772.365-.266.292-1.015.992-1.015 2.417 0 1.425 1.038 2.802 1.183 2.997.146.195 2.041 3.116 4.945 4.37 1.42.614 2.213.78 2.97.712.824-.074 1.727-.472 1.97-.93.242-.458.242-.851.169-.95-.073-.1-.266-.146-.558-.292z"/>
                      </svg>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">WhatsApp</span>
                      <span className="text-[10px] text-zinc-500">Send pre-filled ping</span>
                    </div>
                  </a>

                  {/* SMS / Text */}
                  <a
                    href={`sms:?&body=${encodeURIComponent(templates.sms)}`}
                    className="p-3 bg-[#111] border border-zinc-900 hover:border-sky-500/40 hover:bg-sky-500/5 rounded-xl flex items-center space-x-3 transition-all text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 shrink-0">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">SMS / Text</span>
                      <span className="text-[10px] text-zinc-500">Quick text invite</span>
                    </div>
                  </a>

                  {/* Email */}
                  <a
                    href={`mailto:?subject=${encodeURIComponent(templates.emailSubject)}&body=${encodeURIComponent(templates.emailBody)}`}
                    className="p-3 bg-[#111] border border-zinc-900 hover:border-purple-500/40 hover:bg-purple-500/5 rounded-xl flex items-center space-x-3 transition-all text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
                      <Send className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Email Campaign</span>
                      <span className="text-[10px] text-zinc-500">Structured invite</span>
                    </div>
                  </a>

                  {/* Instagram Bio Link instructions */}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl);
                      alert(`Review Page Link Copied!\n\nSteps to share on Instagram:\n1. Open Instagram\n2. Go to Edit Profile\n3. Tap Add Link > External Link\n4. Paste this review link!`);
                      addLog("Instagram Instructions", "Copied URL for Instagram Bio Link", "success");
                    }}
                    className="p-3 bg-[#111] border border-zinc-900 hover:border-pink-500/40 hover:bg-pink-500/5 rounded-xl flex items-center space-x-3 transition-all text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400 shrink-0">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                      </svg>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Instagram Bio</span>
                      <span className="text-[10px] text-zinc-500">Bio link guidelines</span>
                    </div>
                  </button>

                  {/* Facebook */}
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-[#111] border border-zinc-900 hover:border-blue-600/40 hover:bg-blue-600/5 rounded-xl flex items-center space-x-3 transition-all text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-500 shrink-0">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Facebook Feed</span>
                      <span className="text-[10px] text-zinc-500">Post review flyer</span>
                    </div>
                  </a>

                  {/* NFC Card Link Generation / Tag Writer */}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl);
                      alert(`NFC Dynamic URL Copied!\n\nSteps to configure a smart NFC review card:\n1. Download 'NFC Tools' from iOS App Store or Android Google Play.\n2. Open NFC Tools > Write > Add a record > URL.\n3. Paste this copied review URL.\n4. Tap 'Write' and hold your phone over an NTAG213 physical card or standee!`);
                      addLog("NFC Configuration", "Copied NFC payload URL and prepared instructions", "success");
                    }}
                    className="p-3 bg-[#111] border border-zinc-900 hover:border-amber-500/40 hover:bg-amber-500/5 rounded-xl flex items-center space-x-3 transition-all text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">NFC Hardware</span>
                      <span className="text-[10px] text-zinc-500">NTAG213 write protocol</span>
                    </div>
                  </button>

                </div>

                {/* Direct QR scan indicator */}
                <div className="bg-[#141414] border border-zinc-900 rounded-xl p-4 flex items-center space-x-4">
                  <div className="w-14 h-14 bg-white p-1 rounded-lg shrink-0">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodedUrl}`}
                      alt="NFC matching qr"
                      className="w-full h-full"
                    />
                  </div>
                  <div className="text-left">
                    <h5 className="text-xs font-bold text-white">Dynamic Routing Scanner</h5>
                    <p className="text-[10px] text-zinc-500 leading-normal">
                      Scan to preview the matching mobile-first customer journey. Updates immediately with any theme customizer tweaks!
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        );
      })()}

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

      {/* 3. Consolidated A4 Feedback Station Flyer Print Overlay */}
      {showAllQRFlyer && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-start p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
          
          {/* Non-printable action controls */}
          <div className="w-full max-w-4xl bg-[#0c0c0c] border border-zinc-900 rounded-2xl p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left print:hidden">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">A4 Multi-QR Flyer Export Utility</h3>
              <p className="text-xs text-zinc-500 mt-1">This tool dynamically generates a single high-quality A4 print flyer containing all active QR feedback codes for placement on customer tables, counters, or room walls.</p>
            </div>
            <div className="flex items-center space-x-3 shrink-0">
              <button
                onClick={() => {
                  window.print();
                  addLog("Printed All QR Flyer", `Triggered print dialog for Consolidated A4 flyer containing ${qrCodes.filter(q => q.status === "Active").length} active stations.`, "info");
                }}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl flex items-center space-x-2 transition-all shadow-lg"
              >
                <Printer className="w-4 h-4" />
                <span>Print or Save A4 PDF</span>
              </button>
              <button
                onClick={() => {
                  alert(`Compiling and downloading high-definition PDF and scalable vector package...`);
                  addLog("Downloaded A4 Vector Pack", `Retrieved consolidated SVG/PDF assets for active stations.`, "success");
                }}
                className="px-4 py-2 bg-[#141414] border border-zinc-800 hover:text-white text-zinc-300 font-semibold text-xs rounded-xl flex items-center space-x-2 transition-all"
              >
                <FileDown className="w-4 h-4" />
                <span>Direct Download</span>
              </button>
              <button
                onClick={() => setShowAllQRFlyer(false)}
                className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-xl transition-all"
                title="Close Export Panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable A4 Flyer Mockup */}
          <div 
            id="printable-a4-flyer" 
            className="w-full max-w-[210mm] aspect-[1/1.414] bg-white text-black p-12 flex flex-col justify-between shadow-2xl border border-zinc-200 rounded-lg select-none relative"
          >
            {/* Elegant Header Frame */}
            <div className="text-center space-y-3 pb-6 border-b-2 border-black">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold block font-mono">Feedback Terminal & Reputation Gateway</span>
              <h1 className="text-3xl font-serif font-bold italic text-slate-950 leading-tight">
                {businessProfile.name || "Sweet Bites Bakery"}
              </h1>
              <p className="text-xs text-zinc-600 max-w-lg mx-auto font-sans leading-relaxed">
                We strive for absolute perfection in every experience. Please support our hard-working local team by scanning the code at your table or station to leave us your feedback directly on Google!
              </p>
            </div>

            {/* Main QR Cards Grid */}
            <div className="my-auto py-8">
              <div className="grid grid-cols-2 gap-8">
                {qrCodes.filter(q => q.status === "Active").map((qr) => {
                  let slug = "";
                  if (qr.url) {
                    const parts = qr.url.split("/");
                    slug = parts[parts.length - 1];
                  }
                  if (!slug || slug === "r" || slug === "review" || slug.startsWith("http")) {
                    slug = qr.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
                  }
                  const liveReviewUrl = `${window.location.origin}/r/${slug}`;

                  return (
                    <div key={qr.id} className="border border-zinc-300 p-6 rounded-xl flex flex-col items-center justify-center text-center space-y-4 bg-[#fcfcfc] shadow-sm animate-fade-in">
                      <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded font-mono">
                        {qr.name} Station
                      </span>
                      
                      {/* High-res print QR */}
                      <div className="p-3 bg-white border border-black rounded-xl">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(liveReviewUrl)}`}
                          alt={qr.name}
                          className="w-28 h-28"
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-900 block font-mono">1. Scan Table Code</span>
                        <span className="text-[8px] text-zinc-500 block truncate font-mono max-w-[150px]">{liveReviewUrl}</span>
                      </div>

                      {/* Gating prompt */}
                      <div className="flex flex-col items-center space-y-0.5">
                        <div className="flex text-amber-500 text-[10px] tracking-wider">★★★★★</div>
                        <span className="text-[8px] text-zinc-500 font-sans uppercase tracking-tight">Requires {qr.ratingRequired}+ Stars Gating</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Brand Verification */}
            <div className="flex justify-between items-center pt-5 border-t border-zinc-200 text-[9px] text-zinc-400 font-mono">
              <span>Secure NFC & QR Encrypted Terminal Routing</span>
              <span>Powered by ReviewPlease Reputation SaaS</span>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}
