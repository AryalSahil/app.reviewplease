import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  Building,
  Users,
  CreditCard,
  QrCode,
  MessageSquare,
  Sparkles,
  Megaphone,
  LifeBuoy,
  FileText,
  Bell,
  Settings,
  ShieldAlert,
  Activity,
  Search,
  Lock,
  RefreshCw,
  Plus,
  Trash2,
  Check,
  X,
  Download,
  AlertTriangle,
  UserCheck,
  ChevronRight,
  ExternalLink,
  Sliders,
  Play,
  RotateCcw,
  Upload,
  Globe,
  Mail,
  Filter,
  Eye,
  Server,
  Database,
  Cpu,
  Terminal,
  Moon,
  Sun,
  ShieldCheck,
  Key
} from "lucide-react";
import { User, BusinessProfile, QRCodeItem, Review } from "../types";
import {
  db,
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc
} from "../lib/firebase";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  Legend
} from "recharts";

interface SuperAdminPanelProps {
  onExit: () => void;
  onImpersonate: (businessName: string) => void;
}

interface AdminReview {
  id: string;
  author: string;
  business: string;
  rating: number;
  content: string;
  type: string;
  flagged?: boolean;
}

// Type definitions for Admin specific states
interface AdminBusiness {
  id: string;
  name: string;
  ownerName: string;
  email: string;
  plan: "Free" | "Pro" | "Enterprise";
  status: "Active" | "Suspended";
  joinedDate: string;
  scans: number;
  reviewsCount: number;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  businessName: string;
  role: string;
  status: "Active" | "Suspended";
  emailVerified: boolean;
  lastLogin: string;
}

interface Coupon {
  code: string;
  discount: number;
  type: "percent" | "fixed";
  expiry: string;
  limit: number;
  used: number;
}

interface Ticket {
  id: string;
  user: string;
  subject: string;
  category: "Billing" | "Technical" | "General";
  priority: "High" | "Medium" | "Low";
  status: "Open" | "In Progress" | "Resolved";
  date: string;
  messages: { sender: string; text: string; time: string }[];
}

interface AuditLog {
  id: string;
  timestamp: string;
  ip: string;
  action: string;
  details: string;
  status: "Success" | "Failed" | "Warning";
}

export default function SuperAdminPanel({ onExit, onImpersonate }: SuperAdminPanelProps) {
  // Theme & Layout
  const [isAdminDark, setIsAdminDark] = useState(true);
  const [activeSection, setActiveSection] = useState<string>("dashboard");
  const [globalSearch, setGlobalSearch] = useState("");
  const [showNotification, setShowNotification] = useState<string | null>(null);

  // Authentication State
  const [isAuth, setIsAuth] = useState(false);
  const [authStep, setAuthStep] = useState<"login" | "2fa">("login");
  const [emailInput, setEmailInput] = useState("aryalsahil@proton.me");
  const [passwordInput, setPasswordInput] = useState("Sahil2007");
  const [otpInput, setOtpInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Core Admin States & Real-Time Firebase Data
  const [businesses, setBusinesses] = useState<AdminBusiness[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [blockedIPs, setBlockedIPs] = useState<string[]>([]);
  const [newBlockedIP, setNewBlockedIP] = useState("");

  // Reviews dynamic state for SuperAdminPanel
  const [adminReviews, setAdminReviews] = useState<AdminReview[]>([]);
  const [selectedReviewIds, setSelectedReviewIds] = useState<string[]>([]);

  // 1. Listen for Businesses in Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "businesses"), (snapshot) => {
      if (snapshot.empty) {
        const initialBusinesses = [
          { id: "biz_1", name: "Sweet Bites Bakery", ownerName: "Sarah Jenkins", email: "owner@sweetbites.com", plan: "Pro", status: "Active", joinedDate: "2026-01-15", scans: 2645, reviewsCount: 42 },
          { id: "biz_2", name: "Golden Gate Gym", ownerName: "Mike Henderson", email: "mike@goldengategym.com", plan: "Enterprise", status: "Active", joinedDate: "2026-02-10", scans: 14890, reviewsCount: 388 },
          { id: "biz_3", name: "Apex Dental Care", ownerName: "Dr. Linda Porter", email: "contact@apexdental.com", plan: "Pro", status: "Active", joinedDate: "2026-03-01", scans: 1102, reviewsCount: 89 },
          { id: "biz_4", name: "Bella Italia Bistro", ownerName: "Giovanni Rossi", email: "gio@bellaitalia.com", plan: "Free", status: "Active", joinedDate: "2026-04-12", scans: 450, reviewsCount: 15 },
          { id: "biz_5", name: "Cascade Tech Labs", ownerName: "David Vance", email: "vance@cascadetech.io", plan: "Pro", status: "Suspended", joinedDate: "2026-05-18", scans: 95, reviewsCount: 2 }
        ];
        initialBusinesses.forEach(b => {
          setDoc(doc(db, "businesses", b.id), b).catch(err => console.error(err));
        });
        return;
      }
      const list = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || "Unnamed Business",
          ownerName: data.ownerName || "Owner",
          email: data.email || "",
          plan: data.plan || "Free",
          status: data.status || "Active",
          joinedDate: data.joinedDate || new Date().toISOString().split("T")[0],
          scans: data.scans || 0,
          reviewsCount: data.reviewsCount || 0
        } as AdminBusiness;
      });
      setBusinesses(list);
    });
    return () => unsub();
  }, []);

  // 2. Listen for Users in Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
      if (snapshot.empty) {
        const initialUsersList = [
          { id: "usr_1", name: "Sarah Jenkins", email: "owner@sweetbites.com", businessName: "Sweet Bites Bakery", role: "Owner", status: "Active", emailVerified: true, lastLogin: "2026-06-29 09:12" },
          { id: "usr_2", name: "Mike Henderson", email: "mike@goldengategym.com", businessName: "Golden Gate Gym", role: "Owner", status: "Active", emailVerified: true, lastLogin: "2026-06-28 18:45" },
          { id: "usr_3", name: "Dr. Linda Porter", email: "contact@apexdental.com", businessName: "Apex Dental Care", role: "Owner", status: "Active", emailVerified: true, lastLogin: "2026-06-29 08:30" },
          { id: "usr_4", name: "Giovanni Rossi", email: "gio@bellaitalia.com", businessName: "Bella Italia Bistro", role: "Owner", status: "Active", emailVerified: false, lastLogin: "2026-06-25 14:20" },
          { id: "usr_5", name: "David Vance", email: "vance@cascadetech.io", businessName: "Cascade Tech Labs", role: "Owner", status: "Suspended", emailVerified: true, lastLogin: "2026-06-20 11:05" }
        ];
        initialUsersList.forEach(u => {
          setDoc(doc(db, "users", u.id), u).catch(err => console.error(err));
        });
        return;
      }
      const list = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || "User",
          email: data.email || "",
          businessName: data.businessName || "My Business",
          role: data.role || "Owner",
          status: data.status || "Active",
          emailVerified: !!data.emailVerified,
          lastLogin: data.lastLogin || new Date().toISOString().replace("T", " ").substring(0, 16)
        } as AdminUser;
      });
      setAdminUsers(list);
    });
    return () => unsub();
  }, []);

  // 3. Listen for Coupons in Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "coupons"), (snapshot) => {
      if (snapshot.empty) {
        const initialCoupons = [
          { code: "SUPER50", discount: 50, type: "percent", expiry: "2026-12-31", limit: 200, used: 84 },
          { code: "BREADPRO", discount: 15, type: "fixed", expiry: "2026-09-30", limit: 50, used: 12 },
          { code: "VIPLAUNCH", discount: 100, type: "percent", expiry: "2026-07-31", limit: 10, used: 10 }
        ];
        initialCoupons.forEach(c => {
          setDoc(doc(db, "coupons", c.code), c).catch(err => console.error(err));
        });
        return;
      }
      const list = snapshot.docs.map(doc => doc.data() as Coupon);
      setCoupons(list);
    });
    return () => unsub();
  }, []);

  // 4. Listen for Tickets in Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "tickets"), (snapshot) => {
      if (snapshot.empty) {
        const initialTickets = [
          { id: "tkt_102", user: "Sarah Jenkins", subject: "NFC Writing Error on iPhone 15", category: "Technical", priority: "High", status: "Open", date: "2026-06-29", messages: [{ sender: "Sarah Jenkins", text: "I tried copying the NFC payload but my phone keeps saying write error.", time: "10:15 AM" }] },
          { id: "tkt_101", user: "Mike Henderson", subject: "Custom Domain Integration Setup", category: "Technical", priority: "Medium", status: "In Progress", date: "2026-06-28", messages: [{ sender: "Mike Henderson", text: "We need our reviews portal on feedback.goldengategym.com", time: "04:30 PM" }] },
          { id: "tkt_100", user: "Dr. Linda Porter", subject: "Invoice mismatch for annual billing", category: "Billing", priority: "Low", status: "Resolved", date: "2026-06-26", messages: [{ sender: "Dr. Linda Porter", text: "The coupon was not applied on the first check.", time: "09:00 AM" }, { sender: "Support Admin", text: "Apologies, we processed a refund of ₹99 for the variance.", time: "11:30 AM" }] }
        ];
        initialTickets.forEach(t => {
          setDoc(doc(db, "tickets", t.id), t).catch(err => console.error(err));
        });
        return;
      }
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Ticket);
      setTickets(list);
    });
    return () => unsub();
  }, []);

  // 5. Listen for Audit Logs in Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "audit_logs"), (snapshot) => {
      if (snapshot.empty) {
        const initialLogs = [
          { id: "log_1", timestamp: "2026-06-29 11:35:12", ip: "104.244.75.12", action: "User Impersonation", details: "Admin impersonated Mike Henderson (Golden Gate Gym)", status: "Success" },
          { id: "log_2", timestamp: "2026-06-29 10:50:24", ip: "104.244.75.12", action: "Coupon Created", details: "Coupon BREADPRO (₹15 Off) added to directory", status: "Success" },
          { id: "log_3", timestamp: "2026-06-29 08:12:44", ip: "198.51.100.84", action: "Failed Authentication Attempt", details: "Brute-force alert on username 'admin_root'", status: "Warning" },
          { id: "log_4", timestamp: "2026-06-28 23:45:01", ip: "104.244.75.12", action: "Settings Update", details: "AI Response temperature set to 0.7", status: "Success" }
        ];
        initialLogs.forEach(l => {
          setDoc(doc(db, "audit_logs", l.id), l).catch(err => console.error(err));
        });
        return;
      }
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as AuditLog);
      list.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      setAuditLogs(list);
    });
    return () => unsub();
  }, []);

  // 6. Listen for Blocked IPs in Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "blocked_ips"), (snapshot) => {
      if (snapshot.empty) {
        const initialIPs = ["198.51.100.84", "203.0.113.15"];
        initialIPs.forEach(ip => {
          const id = ip.replace(/\./g, "_");
          setDoc(doc(db, "blocked_ips", id), { ip }).catch(err => console.error(err));
        });
        return;
      }
      const list = snapshot.docs.map(doc => doc.data().ip as string);
      setBlockedIPs(list);
    });
    return () => unsub();
  }, []);

  // 7. Listen for Admin Reviews in Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "reviews"), (snapshot) => {
      if (snapshot.empty) {
        const initialReviews = [
          { id: "rev_1", author: "Michael Chang", business: "Sweet Bites Bakery", rating: 5, content: "The almond croissants here are life-changing! Crispy on the outside, light and rich inside.", type: "Google redirected", flagged: false },
          { id: "rev_2", author: "Robert Downey", business: "Golden Gate Gym", rating: 2, content: "Equipments are good but the showers were cold this morning. Hope they fix the heater.", type: "Gated Private Feed", flagged: true },
          { id: "rev_3", author: "Sarah Miller", business: "Apex Dental Care", rating: 5, content: "Incredibly professional staff and completely painless cleaning. Dr. Linda was wonderful!", type: "Google redirected", flagged: false },
          { id: "rev_4", author: "Giovanni Rossi", business: "Bella Italia Bistro", rating: 1, content: "Waited 45 minutes for cold pasta. Extremely disappointed with the service tonight.", type: "Gated Private Feed", flagged: false },
          { id: "rev_5", author: "Emily Watson", business: "Sweet Bites Bakery", rating: 4, content: "Lovely cupcakes and beautiful shop! A bit crowded on Saturday morning, but worth the wait.", type: "Google redirected", flagged: false }
        ];
        initialReviews.forEach(r => {
          setDoc(doc(db, "reviews", r.id), r).catch(err => console.error(err));
        });
        return;
      }
      const list = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          author: data.author || data.authorName || "Anonymous",
          business: data.business || data.businessName || "My Business",
          rating: data.rating || 5,
          content: data.content || "",
          type: data.type || "Google redirected",
          flagged: !!data.flagged
        } as AdminReview;
      });
      setAdminReviews(list);
    });
    return () => unsub();
  }, []);

  // Live latency tracking for Gemini AI Service
  const [aiLatencyHistory, setAiLatencyHistory] = useState<{ time: string; latency: number }[]>([
    { time: "-14s", latency: 135 },
    { time: "-12s", latency: 142 },
    { time: "-10s", latency: 128 },
    { time: "-8s", latency: 155 },
    { time: "-6s", latency: 130 },
    { time: "-4s", latency: 148 },
    { time: "-2s", latency: 132 },
    { time: "0s", latency: 135 }
  ]);

  // Task queue stats
  const [queueSize, setQueueSize] = useState(3);
  const [queueDelay, setQueueDelay] = useState(0.18);
  const [uptimePercent, setUptimePercent] = useState(99.98);

  // AI & System Configuration
  const [selectedAIModel, setSelectedAIModel] = useState("gemini-3.5-flash");
  const [rateLimitFree, setRateLimitFree] = useState(5);
  const [rateLimitPro, setRateLimitPro] = useState(100);
  const [systemPromptReview, setSystemPromptReview] = useState(
    "You are an AI assistant helping a customer write a Google Review for {{businessName}}. Generate exactly 3 diverse, natural review suggestions."
  );

  // CMS Content Management States
  const [cmsHeroTitle, setCmsHeroTitle] = useState("Double Your Google Reviews Effortlessly.");
  const [cmsHeroSubtitle, setCmsHeroSubtitle] = useState("The elite AI-driven review acceleration engine for ambitious brick-and-mortar storefronts.");
  const [cmsFaqList, setCmsFaqList] = useState([
    { q: "How does the NFC feedback card work?", a: "Customers tap their iPhone or Android on the card to instantly trigger your custom branding review gateway." }
  ]);
  const [announcementText, setAnnouncementText] = useState("");
  const [announcementType, setAnnouncementType] = useState<"info" | "warning" | "error">("info");

  // System Resource Simulation Stats
  const [cpuLoad, setCpuLoad] = useState(12);
  const [ramLoad, setRamLoad] = useState(42);
  const [dbLoad, setDbLoad] = useState(4);
  const [liveLogLines, setLiveLogLines] = useState<string[]>([
    "INFO: [Express] ReviewPlease super-admin listener initialized on port 3000.",
    "INFO: [Vite] Hot-Module-Replacement server connection established.",
    "DB: [Firestore] Ping took 12ms. Status: Optimal.",
    "API: [Gemini-3.5-flash] Suggestion requested from user owner@sweetbites.com (Tokens: 384)."
  ]);

  // Billing History state
  const [billingHistory, setBillingHistory] = useState<{ id: string; business: string; date: string; amount: number; status: string; plan: string }[]>([]);

  // Coupon Form Inputs
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDiscount, setNewCouponDiscount] = useState(10);
  const [newCouponType, setNewCouponType] = useState<"percent" | "fixed">("percent");

  // Ticket Composition State
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState("");

  // Simulated live logs cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuLoad(Math.floor(Math.random() * 20) + 5);
      setRamLoad(Math.floor(Math.random() * 5) + 40);
      setDbLoad(Math.floor(Math.random() * 3) + 3);

      // System health fluctuations
      setQueueSize(prev => {
        const delta = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        return Math.max(0, prev + delta);
      });
      setQueueDelay(prev => {
        const val = Number((0.1 + Math.random() * 0.2).toFixed(2));
        return val;
      });

      // Latency history update
      setAiLatencyHistory(prev => {
        const nextLatency = Math.floor(Math.random() * 50) + 110; // 110 to 160ms
        const shifted = prev.slice(1);
        const labels = ["-14s", "-12s", "-10s", "-8s", "-6s", "-4s", "-2s", "0s"];
        return [...shifted, { time: "0s", latency: nextLatency }].map((item, idx) => ({
          time: labels[idx],
          latency: item.latency
        }));
      });

      const events = [
        `API: [Gemini] Suggested reviews created. Latency 142ms.`,
        `DB: [Firestore] Query on table 'qrcodes' executed in 8ms.`,
        `INFO: [Nginx] Ingress routing to app-gateway successful.`,
        `SEC: [IP Filter] Checked blacklist for connection 192.168.1.56.`
      ];
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      setLiveLogLines(prev => [randomEvent, ...prev.slice(0, 15)]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const triggerAlert = (message: string) => {
    setShowNotification(message);
    setTimeout(() => setShowNotification(null), 4000);
  };

  // Review Batch Action Handlers
  const handleToggleSelectReview = (id: string) => {
    setSelectedReviewIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllReviews = () => {
    if (selectedReviewIds.length === adminReviews.length) {
      setSelectedReviewIds([]);
    } else {
      setSelectedReviewIds(adminReviews.map(r => r.id));
    }
  };

  const handleBatchFlag = async (flag: boolean) => {
    try {
      for (const id of selectedReviewIds) {
        await updateDoc(doc(db, "reviews", id), { flagged: flag });
      }
      triggerAlert(`Successfully ${flag ? "flagged" : "unflagged"} ${selectedReviewIds.length} review(s).`);
      setSelectedReviewIds([]);
    } catch (e) {
      console.error("Error batch flagging reviews:", e);
    }
  };

  const handleBatchDelete = async () => {
    const count = selectedReviewIds.length;
    try {
      for (const id of selectedReviewIds) {
        await deleteDoc(doc(db, "reviews", id));
      }
      triggerAlert(`Successfully deleted ${count} review(s).`);
      setSelectedReviewIds([]);
    } catch (e) {
      console.error("Error batch deleting reviews:", e);
    }
  };

  // Secure Authentication Handlers
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsAuthLoading(true);

    setTimeout(async () => {
      if (emailInput === "aryalsahil@proton.me" && passwordInput === "Sahil2007") {
        setIsAuth(true);
        triggerAlert("Secure session verified. Welcome back, Administrator.");
        // Log the security audit log
        const newLog: AuditLog = {
          id: `log_${Date.now()}`,
          timestamp: new Date().toISOString().replace("T", " ").substr(0, 19),
          ip: "104.244.75.12",
          action: "Secure Login Success",
          details: "Administrator authenticated successfully via secure password",
          status: "Success"
        };
        try {
          await setDoc(doc(db, "audit_logs", newLog.id), newLog);
        } catch (err) {
          console.error("Error saving audit log:", err);
        }
      } else {
        setAuthError("Invalid administrative credentials.");
      }
      setIsAuthLoading(false);
    }, 1000);
  };

  const handle2FAVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsAuthLoading(true);

    setTimeout(async () => {
      if (otpInput === "123456" || otpInput.length === 6) {
        setIsAuth(true);
        triggerAlert("Secure session verified. Welcome back, Administrator.");
        // Log the security audit log
        const newLog: AuditLog = {
          id: `log_${Date.now()}`,
          timestamp: new Date().toISOString().replace("T", " ").substr(0, 19),
          ip: "104.244.75.12",
          action: "Secure Login Success",
          details: "Administrator authenticated successfully via secure password + 2FA",
          status: "Success"
        };
        try {
          await setDoc(doc(db, "audit_logs", newLog.id), newLog);
        } catch (err) {
          console.error("Error saving audit log:", err);
        }
      } else {
        setAuthError("Invalid 2FA code. (Use code: 123456)");
      }
      setIsAuthLoading(false);
    }, 1000);
  };

  const handleAdminLogout = () => {
    setIsAuth(false);
    setAuthStep("login");
    setOtpInput("");
    triggerAlert("Logged out of the Super Admin Panel successfully.");
  };

  // Administrative CRUD Actions
  const toggleBusinessStatus = async (id: string) => {
    const b = businesses.find(x => x.id === id);
    if (!b) return;
    const nextStatus = b.status === "Active" ? "Suspended" : "Active";
    try {
      await updateDoc(doc(db, "businesses", id), { status: nextStatus });
      await updateDoc(doc(db, "users", id), { status: nextStatus });
      triggerAlert(`Business status updated: ${b.name} is now ${nextStatus}.`);
    } catch (e) {
      console.error("Error toggling business status:", e);
    }
  };

  const deleteBusiness = async (id: string, name: string) => {
    if (confirm(`Are you absolutely sure you want to permanently delete "${name}"? This action is irreversible.`)) {
      try {
        await deleteDoc(doc(db, "businesses", id));
        await deleteDoc(doc(db, "users", id));
        triggerAlert(`Business "${name}" deleted.`);
      } catch (e) {
        console.error("Error deleting business:", e);
      }
    }
  };

  const triggerImpersonation = (biz: AdminBusiness) => {
    triggerAlert(`Initiating secure container session proxy for "${biz.name}"...`);
    setTimeout(() => {
      onImpersonate(biz.name);
    }, 1200);
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;

    const newCp: Coupon = {
      code: newCouponCode.toUpperCase().replace(/\s/g, ""),
      discount: Number(newCouponDiscount),
      type: newCouponType,
      expiry: "2026-12-31",
      limit: 100,
      used: 0
    };

    try {
      await setDoc(doc(db, "coupons", newCp.code), newCp);
      setNewCouponCode("");
      triggerAlert(`Administrative Coupon ${newCp.code} successfully deployed.`);
    } catch (err) {
      console.error("Error creating coupon:", err);
    }
  };

  const handleTicketReply = async (ticketId: string) => {
    if (!ticketReplyText.trim()) return;
    const t = tickets.find(x => x.id === ticketId);
    if (!t) return;

    const updatedTicket = {
      ...t,
      status: "Resolved",
      messages: [
        ...t.messages,
        { sender: "Support Admin", text: ticketReplyText, time: "Just Now" }
      ]
    };

    try {
      await setDoc(doc(db, "tickets", ticketId), updatedTicket);
      setTicketReplyText("");
      setSelectedTicketId(null);
      triggerAlert("Response sent. Ticket updated to [Resolved].");
    } catch (err) {
      console.error("Error replying to ticket:", err);
    }
  };

  const handleBlockIP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockedIP.trim()) return;
    const ip = newBlockedIP.trim();
    const id = ip.replace(/\./g, "_");
    try {
      await setDoc(doc(db, "blocked_ips", id), { ip });
      triggerAlert(`IP ${ip} has been blacklisted.`);
      setNewBlockedIP("");
    } catch (err) {
      console.error("Error blocking IP:", err);
    }
  };

  const handleUnblockIP = async (ip: string) => {
    const id = ip.replace(/\./g, "_");
    try {
      await deleteDoc(doc(db, "blocked_ips", id));
      triggerAlert(`IP ${ip} removed from blacklist.`);
    } catch (err) {
      console.error("Error unblocking IP:", err);
    }
  };

  // Simulated Database Backup Exporter
  const handleExportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ businesses, coupons, tickets, auditLogs }));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `reviewplease_saas_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerAlert("System state backup compiled and downloaded successfully.");
  };

  // Render Authentication views
  if (!isAuth) {
    return (
      <div className={`min-h-screen ${isAdminDark ? "bg-[#050505] text-[#e0e0e0]" : "bg-slate-50 text-slate-800"} flex flex-col justify-center items-center py-12 px-4 transition-colors duration-300`}>
        {/* Toast Alert */}
        <AnimatePresence>
          {showNotification && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-5 bg-[#0c0c0c] border border-emerald-900/60 text-emerald-400 px-4 py-2.5 rounded-xl text-xs font-mono shadow-2xl flex items-center space-x-2 z-50"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>{showNotification}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex bg-emerald-950/20 p-3 rounded-2xl border border-emerald-900/40 text-emerald-400 mb-3">
              <Lock className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-serif italic text-white">ReviewPlease</h1>
            <p className="text-xs uppercase tracking-widest text-emerald-500 font-bold mt-1.5">Super Admin Gateway</p>
          </div>

          <div className={`border p-8 rounded-2xl shadow-2xl ${isAdminDark ? "bg-[#0c0c0c] border-zinc-900" : "bg-white border-slate-200"}`}>
            <form onSubmit={handleAdminLogin} className="space-y-5">
              <h3 className="text-lg font-semibold text-center text-white font-serif">Credential Authentication</h3>
              {authError && (
                <div className="p-3 bg-rose-950/20 text-rose-400 rounded-xl text-xs font-medium border border-rose-900/40">
                  {authError}
                </div>
              )}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Admin Email</label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-black border border-zinc-900 text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  placeholder="aryalsahil@proton.me"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Security Password</label>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-black border border-zinc-900 text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={isAuthLoading}
                className="w-full py-2.5 rounded-xl font-bold text-sm bg-emerald-500 text-black hover:bg-emerald-400 transition-colors disabled:opacity-50"
              >
                {isAuthLoading ? "Authenticating security..." : "Verify Identity"}
              </button>
            </form>
          </div>
          <button
            onClick={onExit}
            className="w-full text-center text-xs text-zinc-500 hover:text-white transition-colors mt-6 underline underline-offset-4"
          >
            ← Exit back to user dashboard
          </button>
        </div>
      </div>
    );
  }

  // Define admin sections list
  const adminSections = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "businesses", label: "Businesses", icon: Building },
    { id: "users", label: "Users", icon: Users },
    { id: "subscriptions", label: "Subscriptions", icon: CreditCard },
    { id: "reviews", label: "Review Stream", icon: MessageSquare },
    { id: "ai_config", label: "AI & Prompts", icon: Sparkles },
    { id: "marketing", label: "Marketing", icon: Megaphone },
    { id: "support", label: "Support tickets", icon: LifeBuoy, badge: tickets.filter(t => t.status === "Open").length || undefined },
    { id: "content", label: "CMS Content", icon: FileText },
    { id: "security", label: "Security & IP", icon: ShieldAlert },
    { id: "health", label: "System Uptime", icon: Activity }
  ];

  return (
    <div className={`h-screen w-full flex overflow-hidden font-sans ${isAdminDark ? "bg-[#050505] text-[#e0e0e0]" : "bg-slate-50 text-slate-800"}`}>
      {/* Toast Alert */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 bg-[#0c0c0c] border border-emerald-900/60 text-emerald-400 px-4 py-2.5 rounded-xl text-xs font-mono shadow-2xl flex items-center space-x-2 z-50"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>{showNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Sidebar Layout */}
      <aside className={`w-64 border-r shrink-0 flex flex-col justify-between ${isAdminDark ? "bg-[#0a0a0a] border-zinc-900" : "bg-white border-slate-200"}`}>
        <div>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-zinc-900 flex items-center space-x-2">
            <div className="bg-emerald-950/20 p-1.5 rounded-lg border border-emerald-900/40 text-emerald-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif italic text-lg text-white font-bold block">ReviewPlease</span>
              <span className="text-[9px] uppercase tracking-widest text-emerald-500 font-bold font-mono">Super Admin Hub</span>
            </div>
          </div>

          {/* Sidebar Nav Items */}
          <nav className="p-3 space-y-1">
            {adminSections.map(sec => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-emerald-550 bg-emerald-950/30 border border-emerald-900/40 text-emerald-400"
                      : `${isAdminDark ? "text-zinc-500 hover:text-white hover:bg-zinc-900/50" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"}`
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-zinc-600"}`} />
                    <span>{sec.label}</span>
                  </div>
                  {sec.badge && (
                    <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-full bg-rose-950/20 text-rose-400 border border-rose-900/30">
                      {sec.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className={`p-4 border-t ${isAdminDark ? "border-zinc-900 bg-black/40" : "border-slate-200 bg-slate-50"}`}>
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-black flex items-center justify-center font-bold font-serif">SA</div>
            <div>
              <h5 className="text-xs font-semibold text-white">Platform Administrator</h5>
              <p className="text-[9px] text-zinc-500">Master Level</p>
            </div>
          </div>
          <button
            onClick={handleAdminLogout}
            className="w-full py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-rose-400 border border-rose-900/20 bg-rose-950/10 hover:bg-rose-950/30 transition-colors"
          >
            Secure Disconnect
          </button>
        </div>
      </aside>

      {/* Admin Content Area Layout */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className={`h-16 border-b flex items-center justify-between px-6 shrink-0 ${isAdminDark ? "bg-[#080808] border-zinc-900" : "bg-white border-slate-200"}`}>
          <div className="flex items-center space-x-4">
            <h2 className="text-md font-bold font-serif text-white capitalize">{activeSection.replace("_", " ")} Workspace</h2>
            <div className="flex items-center space-x-2.5 bg-black/40 border border-zinc-900 px-3 py-1.5 rounded-xl w-64">
              <Search className="w-3.5 h-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Global platform search..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="bg-transparent border-none text-xs text-white focus:outline-none w-full placeholder-zinc-600"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Quick action buttons */}
            <button
              onClick={handleExportBackup}
              title="Download SaaS backup"
              className="p-2 rounded-lg border border-zinc-900 hover:bg-zinc-900/50 text-zinc-400 hover:text-white transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsAdminDark(!isAdminDark)}
              className="p-2 rounded-lg border border-zinc-900 hover:bg-zinc-900/50 text-zinc-400 hover:text-white transition-colors"
            >
              {isAdminDark ? <Sun className="w-4 h-4 text-emerald-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={onExit}
              className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold rounded-xl text-white transition-colors"
            >
              Exit Portal
            </button>
          </div>
        </header>

        {/* Section View Routing */}
        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6"
            >
              {/* SECTION: DASHBOARD */}
              {activeSection === "dashboard" && (
                <>
                  {/* Platform Health Alert */}
                  <div className="bg-emerald-950/10 border border-emerald-900/40 p-3 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                      <span className="text-xs text-zinc-300 font-medium">All platform microservices are healthy. Gemini-3.5 API latency: 135ms.</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-950/30 border border-emerald-900/30 px-2 py-0.5 rounded font-mono">
                      v2.4.1 Production
                    </span>
                  </div>

                  {/* SaaS Metrics KPI Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl border border-zinc-900 bg-[#0c0c0c] flex flex-col">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Businesses</span>
                      <span className="text-2xl font-serif text-white font-bold mt-1">2,845</span>
                      <div className="flex items-center justify-between text-[10px] text-emerald-400 mt-2 font-mono">
                        <span>+12.4% MoM</span>
                        <span>Uptime 99.99%</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl border border-zinc-900 bg-[#0c0c0c] flex flex-col">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">SaaS Revenue (MRR)</span>
                      <span className="text-2xl font-serif text-emerald-400 font-bold mt-1">₹4,86,500</span>
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-2 font-mono">
                        <span>ARR: ₹58,38,000</span>
                        <span>Churn: 1.8%</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl border border-zinc-900 bg-[#0c0c0c] flex flex-col">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active QR Codes</span>
                      <span className="text-2xl font-serif text-white font-bold mt-1">12,482</span>
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-2 font-mono">
                        <span>Scans today: +4,510</span>
                        <span>Gate: 4+ stars</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl border border-zinc-900 bg-[#0c0c0c] flex flex-col">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">AI Reviews Generated</span>
                      <span className="text-2xl font-serif text-white font-bold mt-1">18,520</span>
                      <div className="flex items-center justify-between text-[10px] text-emerald-400 mt-2 font-mono">
                        <span>Requests: 1.4k/day</span>
                        <span>Gemini active</span>
                      </div>
                    </div>
                  </div>

                  {/* interactive SVG Charts Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recharts Revenue Growth Chart */}
                    <div className="p-5 border border-zinc-900 bg-[#0c0c0c] rounded-2xl col-span-1 lg:col-span-2">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Revenue Growth Index (MRR & ARR Trends)</h4>
                          <p className="text-[10px] text-zinc-500 mt-0.5">Dual-axis SaaS trajectory visualization for the past 12 months</p>
                        </div>
                        <span className="text-[10px] uppercase tracking-wider text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 px-2 py-0.5 rounded font-mono font-bold">
                          MRR + ARR Multi-Axis
                        </span>
                      </div>
                      <div className="w-full h-64 text-zinc-400 text-xs">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={[
                              { month: "Jul 25", mrr: 32000, arr: 384000 },
                              { month: "Aug 25", mrr: 34500, arr: 414000 },
                              { month: "Sep 25", mrr: 36000, arr: 432000 },
                              { month: "Oct 25", mrr: 37800, arr: 453600 },
                              { month: "Nov 25", mrr: 39500, arr: 474000 },
                              { month: "Dec 25", mrr: 41000, arr: 492000 },
                              { month: "Jan 26", mrr: 43200, arr: 518400 },
                              { month: "Feb 26", mrr: 44800, arr: 537600 },
                              { month: "Mar 26", mrr: 45500, arr: 546000 },
                              { month: "Apr 26", mrr: 46800, arr: 561600 },
                              { month: "May 26", mrr: 47900, arr: 574800 },
                              { month: "Jun 26", mrr: 48650, arr: 583800 }
                            ]}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="arrGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1c1c1c" vertical={false} />
                            <XAxis 
                              dataKey="month" 
                              stroke="#52525b" 
                              tickLine={false} 
                              axisLine={false}
                              fontSize={10}
                              fontFamily="monospace"
                            />
                            <YAxis 
                              yAxisId="left"
                              stroke="#10b981" 
                              tickLine={false} 
                              axisLine={false}
                              fontSize={10}
                              fontFamily="monospace"
                              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                            />
                            <YAxis 
                              yAxisId="right"
                              orientation="right"
                              stroke="#3b82f6" 
                              tickLine={false} 
                              axisLine={false}
                              fontSize={10}
                              fontFamily="monospace"
                              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                            />
                            <RechartsTooltip 
                              contentStyle={{ 
                                backgroundColor: '#0a0a0a', 
                                borderColor: '#27272a',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontFamily: 'monospace'
                              }}
                              labelStyle={{ color: '#a1a1aa', fontWeight: 'bold' }}
                            />
                            <Legend 
                              wrapperStyle={{ fontSize: '11px', marginTop: '10px' }}
                            />
                            <Area 
                              yAxisId="left"
                              type="monotone" 
                              dataKey="mrr" 
                              name="MRR (₹/Month)" 
                              stroke="#10b981" 
                              strokeWidth={2}
                              fillOpacity={1} 
                              fill="url(#mrrGrad)" 
                            />
                            <Area 
                              yAxisId="right"
                              type="monotone" 
                              dataKey="arr" 
                              name="ARR (₹/Year)" 
                              stroke="#3b82f6" 
                              strokeWidth={2}
                              fillOpacity={1} 
                              fill="url(#arrGrad)" 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="p-5 border border-zinc-900 bg-[#0c0c0c] rounded-2xl">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Reviews Gated Distribution</h4>
                        <span className="text-[10px] text-zinc-500">Global Aggregated</span>
                      </div>
                      {/* Bar chart SVGs */}
                      <div className="space-y-3.5 mt-4">
                        <div>
                          <div className="flex justify-between text-[11px] mb-1 text-zinc-400">
                            <span>Excellent (5 Stars - Google review redirected)</span>
                            <span className="font-mono text-emerald-400 font-bold">78%</span>
                          </div>
                          <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: "78%" }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[11px] mb-1 text-zinc-400">
                            <span>Good (4 Stars - Gated route choice)</span>
                            <span className="font-mono text-zinc-400">12%</span>
                          </div>
                          <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                            <div className="h-full bg-zinc-500 rounded-full" style={{ width: "12%" }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[11px] mb-1 text-zinc-400">
                            <span>Private Feedback (1-3 Stars - Gated private inbox)</span>
                            <span className="font-mono text-rose-400">10%</span>
                          </div>
                          <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                            <div className="h-full bg-rose-500 rounded-full" style={{ width: "10%" }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* SECTION: BUSINESSES */}
              {activeSection === "businesses" && (
                <div className="p-5 border border-zinc-900 bg-[#0c0c0c] rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-serif text-white">Platform Tenant Directory</h3>
                    <span className="text-xs text-zinc-500 font-mono">Total: {businesses.length} Tenants</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-zinc-900 text-zinc-500">
                          <th className="py-3 px-2">ID</th>
                          <th className="py-3 px-2">Business Name</th>
                          <th className="py-3 px-2">Owner</th>
                          <th className="py-3 px-2">Plan</th>
                          <th className="py-3 px-2">QR Scans</th>
                          <th className="py-3 px-2">Reviews</th>
                          <th className="py-3 px-2">Status</th>
                          <th className="py-3 px-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900/60">
                        {businesses
                          .filter(b => b.name.toLowerCase().includes(globalSearch.toLowerCase()) || b.ownerName.toLowerCase().includes(globalSearch.toLowerCase()))
                          .map(b => (
                            <tr key={b.id} className="hover:bg-zinc-950">
                              <td className="py-3 px-2 font-mono text-zinc-600">{b.id}</td>
                              <td className="py-3 px-2 font-semibold text-white">{b.name}</td>
                              <td className="py-3 px-2">
                                <div className="text-zinc-300">{b.ownerName}</div>
                                <div className="text-[10px] text-zinc-600 font-mono">{b.email}</div>
                              </td>
                              <td className="py-3 px-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  b.plan === "Enterprise" ? "bg-purple-950/40 text-purple-400 border border-purple-900/40" :
                                  b.plan === "Pro" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/40" :
                                  "bg-zinc-900 text-zinc-400"
                                }`}>
                                  {b.plan}
                                </span>
                              </td>
                              <td className="py-3 px-2 font-mono">{b.scans.toLocaleString()}</td>
                              <td className="py-3 px-2 font-mono">{b.reviewsCount}</td>
                              <td className="py-3 px-2">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  b.status === "Active" ? "bg-emerald-950/20 text-emerald-400" : "bg-rose-950/20 text-rose-400"
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${b.status === "Active" ? "bg-emerald-400" : "bg-rose-400"}`} />
                                  {b.status}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-right">
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    onClick={() => triggerImpersonation(b)}
                                    title="Impersonate (Log in secure)"
                                    className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-emerald-400 hover:border-emerald-900/40 transition-colors"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => toggleBusinessStatus(b.id)}
                                    className={`p-1.5 rounded-lg border border-zinc-800 text-xs font-semibold ${
                                      b.status === "Active" ? "hover:text-amber-400 text-zinc-500" : "hover:text-emerald-400 text-zinc-500"
                                    }`}
                                  >
                                    {b.status === "Active" ? "Suspend" : "Activate"}
                                  </button>
                                  <button
                                    onClick={() => deleteBusiness(b.id, b.name)}
                                    className="p-1.5 rounded-lg border border-zinc-800 text-zinc-500 hover:text-rose-400 hover:border-rose-900/40 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SECTION: USERS */}
              {activeSection === "users" && (
                <div className="p-5 border border-zinc-900 bg-[#0c0c0c] rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-serif text-white">SaaS User Index</h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-zinc-900 text-zinc-500">
                          <th className="py-3 px-2">Name</th>
                          <th className="py-3 px-2">Assigned Business</th>
                          <th className="py-3 px-2">Email status</th>
                          <th className="py-3 px-2">Last Active</th>
                          <th className="py-3 px-2">Status</th>
                          <th className="py-3 px-2 text-right">Administrative</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900/60">
                        {adminUsers
                          .filter(u => u.name.toLowerCase().includes(globalSearch.toLowerCase()) || u.email.toLowerCase().includes(globalSearch.toLowerCase()))
                          .map(u => (
                            <tr key={u.id} className="hover:bg-zinc-950">
                              <td className="py-3 px-2">
                                <div className="font-semibold text-white">{u.name}</div>
                                <div className="text-[10px] text-zinc-500 font-mono">{u.email}</div>
                              </td>
                              <td className="py-3 px-2 text-zinc-300 font-medium">{u.businessName}</td>
                              <td className="py-3 px-2 font-mono">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  u.emailVerified ? "bg-emerald-950/20 text-emerald-400" : "bg-zinc-900 text-zinc-500"
                                }`}>
                                  {u.emailVerified ? "Verified" : "Pending Verification"}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-zinc-500 font-mono">{u.lastLogin}</td>
                              <td className="py-3 px-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] ${
                                  u.status === "Active" ? "bg-emerald-950/10 text-emerald-400" : "bg-rose-950/10 text-rose-400"
                                }`}>
                                  {u.status}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-right space-x-2">
                                <button
                                  onClick={() => triggerAlert(`Password recovery code dispatched to ${u.email}`)}
                                  className="text-[10px] text-emerald-400 hover:underline"
                                >
                                  Reset Password
                                </button>
                                <button
                                  onClick={() => {
                                    setAdminUsers(prev => prev.map(usr => usr.id === u.id ? { ...usr, emailVerified: true } : usr));
                                    triggerAlert(`Email verified for ${u.name}`);
                                  }}
                                  disabled={u.emailVerified}
                                  className={`text-[10px] ${u.emailVerified ? "text-zinc-600 cursor-not-allowed" : "text-zinc-400 hover:underline"}`}
                                >
                                  Force Verify
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SECTION: SUBSCRIPTIONS */}
              {activeSection === "subscriptions" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Coupon Codes Generator */}
                  <div className="p-5 border border-zinc-900 bg-[#0c0c0c] rounded-2xl space-y-4 lg:col-span-1 h-fit">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                      <Key className="w-4 h-4 text-emerald-400" /> Create Campaign Coupon
                    </h3>

                    <form onSubmit={handleCreateCoupon} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Promo Code</label>
                        <input
                          type="text"
                          required
                          value={newCouponCode}
                          onChange={(e) => setNewCouponCode(e.target.value)}
                          className="w-full px-3 py-2 bg-black border border-zinc-900 text-white rounded-lg text-xs"
                          placeholder="e.g. SUMMER30"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Discount Val</label>
                          <input
                            type="number"
                            required
                            min={1}
                            value={newCouponDiscount}
                            onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-black border border-zinc-900 text-white rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Type</label>
                          <select
                            value={newCouponType}
                            onChange={(e) => setNewCouponType(e.target.value as "percent" | "fixed")}
                            className="w-full px-3 py-2 bg-black border border-zinc-900 text-white rounded-lg text-xs"
                          >
                            <option value="percent">Percentage (%)</option>
                            <option value="fixed">Fixed (₹)</option>
                          </select>
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl transition-all"
                      >
                        Deploy Campaign Coupon
                      </button>
                    </form>

                    <div className="pt-4 border-t border-zinc-900">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-3">Active coupons</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {coupons.map(c => (
                          <div key={c.code} className="flex justify-between items-center text-xs p-2 rounded bg-black/60 border border-zinc-900/60 font-mono">
                            <span className="text-emerald-400 font-bold">{c.code}</span>
                            <span className="text-zinc-500">{c.type === "percent" ? `${c.discount}%` : `₹${c.discount}`} Off ({c.used}/{c.limit} used)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Billing Invoices List */}
                  <div className="p-5 border border-zinc-900 bg-[#0c0c0c] rounded-2xl space-y-4 lg:col-span-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Platform SaaS Invoices</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-zinc-900 text-zinc-500">
                            <th className="py-2">Invoice</th>
                            <th className="py-2">Business</th>
                            <th className="py-2">Date</th>
                            <th className="py-2">Amount</th>
                            <th className="py-2">Status</th>
                            <th className="py-2 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900/60 font-mono">
                          {billingHistory.map(b => (
                            <tr key={b.id} className="hover:bg-zinc-950">
                              <td className="py-3 font-semibold text-white">{b.id}</td>
                              <td className="py-3 text-zinc-300 font-sans">{b.business}</td>
                              <td className="py-3 text-zinc-500">{b.date}</td>
                              <td className="py-3 font-bold text-white">₹{b.amount}</td>
                              <td className="py-3">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                  b.status === "Paid" ? "bg-emerald-950/20 text-emerald-400" : "bg-rose-950/20 text-rose-400"
                                }`}>
                                  {b.status}
                                </span>
                              </td>
                              <td className="py-3 text-right">
                                {b.status === "Paid" && (
                                  <button
                                    onClick={() => {
                                      setBillingHistory(prev => prev.map(inv => inv.id === b.id ? { ...inv, status: "Refunded" as any } : inv));
                                      triggerAlert(`Refund processed successfully for ${b.id}.`);
                                    }}
                                    className="text-[10px] text-rose-400 hover:underline"
                                  >
                                    Process Refund
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: REVIEWS */}
              {activeSection === "reviews" && (
                <div className="p-5 border border-zinc-900 bg-[#0c0c0c] rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-serif text-white">Consolidated Reviews Directory</h3>
                      <p className="text-xs text-zinc-500 mt-0.5">Reputation logs & private feedback logs across all corporate sub-accounts</p>
                    </div>
                    
                    {/* Select All Control */}
                    <button
                      onClick={handleSelectAllReviews}
                      className="px-3 py-1.5 bg-[#141414] border border-zinc-850 hover:border-zinc-750 text-zinc-300 hover:text-white rounded-xl text-xs flex items-center space-x-2 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={adminReviews.length > 0 && selectedReviewIds.length === adminReviews.length}
                        onChange={() => {}} // handled by parent click
                        className="rounded border-zinc-700 text-emerald-500 focus:ring-emerald-500 pointer-events-none"
                      />
                      <span className="font-medium">
                        {selectedReviewIds.length === adminReviews.length ? "Deselect All" : "Select All"}
                      </span>
                    </button>
                  </div>

                  <div className="bg-[#050505] p-3 rounded-xl border border-zinc-900 text-xs">
                    <p className="text-zinc-500 font-medium">To keep reputation performance optimal, ReviewPlease automatically routes 1-3 star feedbacks into a private, offline mailbox before they hit real Google servers, giving owners a chance to reconcile directly. This workspace monitors all logs.</p>
                  </div>

                  {/* Batch Actions floating overlay container if any selected */}
                  {selectedReviewIds.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xl"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="h-5 px-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-[10px] rounded flex items-center">
                          {selectedReviewIds.length} Selected
                        </div>
                        <span className="text-xs text-zinc-400 font-medium">Bulk operation queued across indices:</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleBatchFlag(true)}
                          className="px-3 py-1.5 bg-amber-600/20 text-amber-300 hover:bg-amber-600/30 border border-amber-900/30 text-[11px] font-semibold rounded-lg transition-colors"
                        >
                          Flag Spammer
                        </button>
                        <button
                          onClick={() => handleBatchFlag(false)}
                          className="px-3 py-1.5 bg-[#141414] text-zinc-400 hover:text-zinc-200 border border-zinc-800 text-[11px] rounded-lg transition-colors"
                        >
                          Clear Flag
                        </button>
                        <button
                          onClick={handleBatchDelete}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] rounded-lg transition-colors flex items-center space-x-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Permanently</span>
                        </button>
                        <button
                          onClick={() => setSelectedReviewIds([])}
                          className="text-[11px] text-zinc-500 hover:text-white px-2"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Reviews Stream Feed */}
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    {adminReviews.length === 0 ? (
                      <div className="p-8 border border-zinc-900 bg-black/40 rounded-xl text-center space-y-1">
                        <p className="text-xs text-zinc-400 font-medium">No reviews logged in this view.</p>
                        <p className="text-[10px] text-zinc-600 font-mono">Use select action or check database connectivity logs.</p>
                      </div>
                    ) : (
                      adminReviews.map((rev) => {
                        const isSelected = selectedReviewIds.includes(rev.id);
                        return (
                          <div 
                            key={rev.id} 
                            onClick={() => handleToggleSelectReview(rev.id)}
                            className={`p-4 border rounded-xl space-y-2 cursor-pointer transition-all ${
                              isSelected 
                                ? "border-emerald-500/50 bg-emerald-950/5 shadow-inner" 
                                : rev.flagged 
                                  ? "border-amber-900/40 bg-amber-950/10" 
                                  : "border-zinc-900 bg-black/60 hover:border-zinc-800"
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex items-start space-x-3">
                                {/* Checkbox input */}
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {}} // Handled by outer div click
                                  className="mt-1 rounded border-zinc-800 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                                />
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <span className="font-semibold text-white text-xs sm:text-sm">{rev.author}</span>
                                    {rev.flagged && (
                                      <span className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded text-[8px] font-bold uppercase tracking-wider font-mono">
                                        Flagged Spam
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-zinc-600 font-mono block sm:inline mt-0.5 sm:mt-0">
                                    {rev.business} • <span className="text-zinc-500">{rev.type}</span>
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex text-amber-400 text-xs font-mono font-bold">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <span key={i} className={i < rev.rating ? "text-amber-400" : "text-zinc-700"}>★</span>
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-zinc-300 leading-normal pl-7">{rev.content}</p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* SECTION: AI & PROMPTS */}
              {activeSection === "ai_config" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Model settings */}
                  <div className="p-5 border border-zinc-900 bg-[#0c0c0c] rounded-2xl space-y-4 lg:col-span-1 h-fit">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">SaaS AI Model</h3>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1.5">Primary Inference Engine</label>
                      <select
                        value={selectedAIModel}
                        onChange={(e) => setSelectedAIModel(e.target.value)}
                        className="w-full px-3 py-2 bg-black border border-zinc-900 text-white rounded-lg text-xs font-mono"
                      >
                        <option value="gemini-3.5-flash">gemini-3.5-flash (Standard)</option>
                        <option value="gemini-2.5-flash">gemini-2.5-flash (Legacy)</option>
                      </select>
                    </div>

                    <div className="pt-4 border-t border-zinc-900 space-y-3">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Daily Token Limits</h4>
                      <div>
                        <label className="block text-[10px] text-zinc-400 mb-1">Free Plan (Generations/day)</label>
                        <input
                          type="number"
                          value={rateLimitFree}
                          onChange={(e) => setRateLimitFree(Number(e.target.value))}
                          className="w-full px-3 py-1.5 bg-black border border-zinc-900 text-white rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-400 mb-1">Pro Plan (Generations/day)</label>
                        <input
                          type="number"
                          value={rateLimitPro}
                          onChange={(e) => setRateLimitPro(Number(e.target.value))}
                          className="w-full px-3 py-1.5 bg-black border border-zinc-900 text-white rounded-lg text-xs"
                        />
                      </div>
                      <button
                        onClick={() => triggerAlert("AI Inference parameter updates saved.")}
                        className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl"
                      >
                        Commit Model Settings
                      </button>
                    </div>
                  </div>

                  {/* Prompt Editor */}
                  <div className="p-5 border border-zinc-900 bg-[#0c0c0c] rounded-2xl space-y-4 lg:col-span-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Platform System Prompts Tuning</h3>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1.5">Suggest-Reviews Assistant Prompt</label>
                      <textarea
                        value={systemPromptReview}
                        onChange={(e) => setSystemPromptReview(e.target.value)}
                        rows={6}
                        className="w-full p-3 bg-black border border-zinc-900 text-white font-mono text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <button
                      onClick={() => triggerAlert("Prompt template changes updated inside cache cluster.")}
                      className="px-4 py-2 bg-emerald-555 bg-emerald-950/20 border border-emerald-900 text-emerald-400 hover:bg-emerald-950/40 text-xs font-bold rounded-xl transition-all"
                    >
                      Update Prompts Database
                    </button>
                  </div>
                </div>
              )}

              {/* SECTION: MARKETING */}
              {activeSection === "marketing" && (
                <div className="p-5 border border-zinc-900 bg-[#0c0c0c] rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Global Announcements & Waitlist dispatch</h3>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Platform-Wide Banner Dispatch</label>
                    <textarea
                      placeholder="Compose administrative alert banner text to show inside all user dashboards..."
                      value={announcementText}
                      onChange={(e) => setAnnouncementText(e.target.value)}
                      className="w-full p-3 bg-black border border-zinc-900 text-white text-xs rounded-xl focus:ring-1 focus:ring-emerald-500"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <select
                        value={announcementType}
                        onChange={(e: any) => setAnnouncementType(e.target.value)}
                        className="px-3 py-2 bg-black border border-zinc-900 text-white rounded-lg text-xs"
                      >
                        <option value="info">Info Alert (Blue)</option>
                        <option value="warning">Warning Notification (Orange)</option>
                        <option value="error">Maintenance Alert (Rose)</option>
                      </select>
                    </div>
                    <button
                      onClick={() => {
                        if (!announcementText.trim()) return;
                        triggerAlert(`System announcement broadcasted safely to ${businesses.length} tenants.`);
                        setAnnouncementText("");
                      }}
                      className="px-4 py-2 bg-emerald-500 text-black hover:bg-emerald-400 font-bold text-xs rounded-xl"
                    >
                      Publish Announcement
                    </button>
                  </div>
                </div>
              )}

              {/* SECTION: SUPPORT */}
              {activeSection === "support" && (
                <div className="p-5 border border-zinc-900 bg-[#0c0c0c] rounded-2xl space-y-4">
                  <h3 className="text-lg font-serif text-white">SaaS Priority Support Desk</h3>

                  <div className="space-y-3.5">
                    {tickets.map(t => (
                      <div key={t.id} className="p-4 border border-zinc-900 bg-black/40 rounded-xl space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-emerald-400 font-mono text-xs font-bold">[{t.id}]</span>
                            <span className="text-white font-semibold ml-2 text-xs">{t.subject}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                            t.status === "Open" ? "bg-rose-950/20 text-rose-400 border border-rose-900/30" :
                            t.status === "In Progress" ? "bg-amber-950/20 text-amber-400 border border-amber-900/30" :
                            "bg-zinc-900 text-zinc-500"
                          }`}>
                            {t.status}
                          </span>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-zinc-900/60 text-xs">
                          {t.messages.map((m, idx) => (
                            <div key={idx} className={`p-2 rounded ${m.sender === "Support Admin" ? "bg-emerald-950/10 text-emerald-400 border border-emerald-900/10" : "bg-[#050505] text-zinc-300"}`}>
                              <span className="font-bold text-[10px] block mb-0.5">{m.sender}:</span>
                              <span>{m.text}</span>
                            </div>
                          ))}
                        </div>

                        {t.status !== "Resolved" && selectedTicketId !== t.id && (
                          <button
                            onClick={() => setSelectedTicketId(t.id)}
                            className="text-xs text-emerald-400 font-bold hover:underline"
                          >
                            Reply to Ticket
                          </button>
                        )}

                        {selectedTicketId === t.id && (
                          <div className="space-y-2 pt-2">
                            <textarea
                              placeholder="Type administrative support response..."
                              value={ticketReplyText}
                              onChange={(e) => setTicketReplyText(e.target.value)}
                              className="w-full p-2.5 bg-black border border-zinc-900 text-white text-xs rounded-xl focus:ring-1 focus:ring-emerald-500"
                              rows={2.5}
                            />
                            <div className="flex gap-2.5 justify-end">
                              <button
                                onClick={() => setSelectedTicketId(null)}
                                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-[11px] rounded-lg text-zinc-400"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleTicketReply(t.id)}
                                className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-[11px] rounded-lg"
                              >
                                Dispatch Response
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: CONTENT */}
              {activeSection === "content" && (
                <div className="p-5 border border-zinc-900 bg-[#0c0c0c] rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Marketing Landing Page CMS</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Hero Title Heading</label>
                      <input
                        type="text"
                        value={cmsHeroTitle}
                        onChange={(e) => setCmsHeroTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-black border border-zinc-900 text-white rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Hero Subtitle</label>
                      <textarea
                        value={cmsHeroSubtitle}
                        onChange={(e) => setCmsHeroSubtitle(e.target.value)}
                        className="w-full p-3 bg-black border border-zinc-900 text-white text-xs rounded-xl"
                        rows={3}
                      />
                    </div>
                    <button
                      onClick={() => triggerAlert("Landing page content CMS cached on Redis successfully.")}
                      className="px-4 py-2 bg-emerald-500 text-black font-bold text-xs rounded-xl"
                    >
                      Publish CMS Changes
                    </button>
                  </div>
                </div>
              )}

              {/* SECTION: SECURITY */}
              {activeSection === "security" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* IP Filter Blacklist */}
                  <div className="p-5 border border-zinc-900 bg-[#0c0c0c] rounded-2xl space-y-4 lg:col-span-1 h-fit">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-500" /> Malicious IP Filter
                    </h3>
                    <form onSubmit={handleBlockIP} className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">IP to Block</label>
                        <input
                          type="text"
                          required
                          value={newBlockedIP}
                          onChange={(e) => setNewBlockedIP(e.target.value)}
                          placeholder="e.g. 192.168.42.100"
                          className="w-full px-3 py-2 bg-black border border-zinc-900 text-white rounded-lg text-xs font-mono"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-all"
                      >
                        Blacklist IP Node
                      </button>
                    </form>

                    <div className="pt-4 border-t border-zinc-900">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Blocked IP Nodes</h4>
                      <div className="space-y-1.5 font-mono text-xs">
                        {blockedIPs.map(ip => (
                          <div key={ip} className="flex justify-between items-center p-2 rounded bg-black/60 border border-zinc-900">
                            <span className="text-rose-400">{ip}</span>
                            <button
                              onClick={() => handleUnblockIP(ip)}
                              className="text-[10px] text-zinc-500 hover:text-white"
                            >
                              Release
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Audit Logs */}
                  <div className="p-5 border border-zinc-900 bg-[#0c0c0c] rounded-2xl space-y-4 lg:col-span-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Security Audit Trail</h3>
                    <div className="overflow-x-auto max-h-96">
                      <table className="w-full text-left border-collapse text-[11px] font-mono">
                        <thead>
                          <tr className="border-b border-zinc-900 text-zinc-500">
                            <th className="py-2">IP Address</th>
                            <th className="py-2">Timestamp</th>
                            <th className="py-2">Action</th>
                            <th className="py-2">Log Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900/60">
                          {auditLogs.map(l => (
                            <tr key={l.id} className="hover:bg-zinc-950 py-1.5">
                              <td className="py-2.5 pr-2 font-bold text-zinc-400">{l.ip}</td>
                              <td className="py-2.5 text-zinc-600">{l.timestamp}</td>
                              <td className="py-2.5 text-zinc-300 font-sans font-semibold">{l.action}</td>
                              <td className="py-2.5 text-zinc-500 font-sans">{l.details}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: SYSTEM HEALTH */}
              {activeSection === "health" && (
                <div className="space-y-6">
                  
                  {/* Real-time System Overview Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Panel 1: Uptime Status & Microservices */}
                    <div className="p-5 border border-zinc-900 bg-[#0c0c0c] rounded-2xl space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Microservice Health</h4>
                          <span className="text-[10px] text-zinc-500">Uptime monitored over past 30 days</span>
                        </div>
                        <span className="text-emerald-400 text-xs font-bold font-mono">99.98% OK</span>
                      </div>

                      {/* 30-day timeline visualization */}
                      <div className="space-y-2">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-mono">30-Day Operational Log</span>
                        <div className="flex justify-between gap-1 h-6">
                          {Array.from({ length: 30 }).map((_, i) => {
                            // Let's make a few days have slight latency degradations for realism
                            const isDegraded = i === 7 || i === 21;
                            return (
                              <div
                                key={i}
                                className={`flex-1 rounded-sm cursor-pointer transition-colors ${
                                  isDegraded 
                                    ? "bg-amber-500/80 hover:bg-amber-400" 
                                    : "bg-emerald-500 hover:bg-emerald-400"
                                }`}
                                title={`Day -${30 - i}: ${isDegraded ? "Partial API degradation (Latency: 280ms)" : "Operational (Uptime 100%)"}`}
                              />
                            );
                          })}
                        </div>
                        <div className="flex justify-between text-[9px] text-zinc-600 font-mono">
                          <span>30 days ago</span>
                          <span>Today (Live)</span>
                        </div>
                      </div>

                      {/* Microservices Checklist */}
                      <div className="space-y-2 pt-2 border-t border-zinc-900/60 text-xs">
                        {[
                          { name: "SaaS Web Router Ingress", status: "Active", latency: "14ms" },
                          { name: "Gemini-3.5 API Bridge", status: "Active", latency: "135ms" },
                          { name: "Firestore Document Cluster", status: "Active", latency: "8ms" },
                          { name: "Task Queue Processor", status: "Active", latency: "2ms" }
                        ].map((srv, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-black/40 p-2 rounded-xl border border-zinc-900">
                            <div className="flex items-center space-x-2">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                              <span className="text-zinc-300 font-medium">{srv.name}</span>
                            </div>
                            <div className="text-right font-mono text-[10px]">
                              <span className="text-emerald-400 font-bold">{srv.status}</span>
                              <span className="text-zinc-600 ml-2">({srv.latency})</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Panel 2: Gemini AI Latency Tracker (Live Recharts) */}
                    <div className="p-5 border border-zinc-900 bg-[#0c0c0c] rounded-2xl space-y-3 lg:col-span-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Gemini AI API Latency</h4>
                          <span className="text-[10px] text-zinc-500">Live query inference speed trends</span>
                        </div>
                        <div className="text-right">
                          <span className="text-emerald-400 font-bold font-mono text-xs block">~{aiLatencyHistory[aiLatencyHistory.length - 1]?.latency || 135}ms</span>
                          <span className="text-[8px] text-zinc-500 uppercase tracking-widest block font-mono">Real-time</span>
                        </div>
                      </div>

                      {/* Recharts Sparkline */}
                      <div className="w-full h-32">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={aiLatencyHistory}>
                            <defs>
                              <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1c1c1c" vertical={false} />
                            <XAxis 
                              dataKey="time" 
                              stroke="#444" 
                              tickLine={false} 
                              fontSize={9}
                              fontFamily="monospace"
                            />
                            <YAxis 
                              domain={[80, 220]} 
                              stroke="#444" 
                              tickLine={false} 
                              fontSize={9}
                              fontFamily="monospace"
                              tickFormatter={(v) => `${v}ms`}
                            />
                            <RechartsTooltip 
                              contentStyle={{ 
                                backgroundColor: '#0a0a0a', 
                                borderColor: '#222',
                                borderRadius: '8px',
                                fontSize: '10px',
                                fontFamily: 'monospace'
                              }}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="latency" 
                              stroke="#10b981" 
                              strokeWidth={1.5}
                              fillOpacity={1} 
                              fill="url(#latencyGrad)" 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Summary Metrics */}
                      <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-1.5 border-t border-zinc-900/60 font-mono">
                        <div className="bg-black/30 p-1.5 rounded-lg border border-zinc-900">
                          <span className="text-zinc-600 block">MIN</span>
                          <span className="text-zinc-300 font-bold">110ms</span>
                        </div>
                        <div className="bg-black/30 p-1.5 rounded-lg border border-zinc-900">
                          <span className="text-zinc-600 block">AVG</span>
                          <span className="text-zinc-300 font-bold">135ms</span>
                        </div>
                        <div className="bg-black/30 p-1.5 rounded-lg border border-zinc-900">
                          <span className="text-zinc-600 block">MAX</span>
                          <span className="text-rose-400 font-bold">185ms</span>
                        </div>
                      </div>
                    </div>

                    {/* Panel 3: Background Task Queue Processing Time */}
                    <div className="p-5 border border-zinc-900 bg-[#0c0c0c] rounded-2xl space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Queue Processing Engine</h4>
                          <span className="text-[10px] text-zinc-500">Backlog queuing delay & latency limits</span>
                        </div>
                        <span className="text-zinc-400 text-xs font-bold font-mono">Queue Healthy</span>
                      </div>

                      {/* Delay display and animation */}
                      <div className="flex items-center space-x-4 bg-black/30 p-3 rounded-xl border border-zinc-900">
                        <div className="relative flex items-center justify-center">
                          {/* Animated spinning loader to represent queue processing */}
                          <div className="w-12 h-12 rounded-full border-2 border-zinc-800 border-t-emerald-500 animate-spin" />
                          <span className="absolute text-[10px] font-bold text-white font-mono">{queueSize}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-mono">Active Queue Backlog</span>
                          <span className="text-lg font-bold text-white font-mono">{queueSize} Tasks Pending</span>
                        </div>
                      </div>

                      {/* Delay Metric Dial */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className="text-zinc-500">Average Processing Delay</span>
                          <span className="text-emerald-400 font-bold">{queueDelay}s</span>
                        </div>
                        <div className="w-full bg-zinc-950 border border-zinc-900 h-2 rounded-full overflow-hidden">
                          {/* Width reflects queueDelay (0.1s to 0.3s -> mapping to percentages) */}
                          <div 
                            className="bg-emerald-500 h-full rounded-full transition-all duration-1000" 
                            style={{ width: `${(queueDelay / 0.5) * 100}%` }} 
                          />
                        </div>
                        <div className="flex justify-between text-[8px] text-zinc-600 font-mono">
                          <span>0s (Instant)</span>
                          <span>0.5s (Target Max)</span>
                        </div>
                      </div>

                      {/* Processing Efficiency Metrics */}
                      <div className="flex justify-between text-[10px] text-zinc-400 font-mono bg-black/20 p-2 rounded-lg border border-zinc-900/60">
                        <span>Max Capacity: 1.2k/min</span>
                        <span className="text-emerald-500">Efficiency: 99.8%</span>
                      </div>

                    </div>

                  </div>

                  {/* Health Meters Grid (Existing CPU / Ram stats) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-5 border border-zinc-900 bg-[#0c0c0c] rounded-2xl text-center space-y-2">
                      <Cpu className="w-8 h-8 text-emerald-400 mx-auto animate-pulse" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">CPU Core Cluster</h4>
                      <div className="text-2xl font-mono font-bold text-white">{cpuLoad}%</div>
                      <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${cpuLoad}%` }} />
                      </div>
                    </div>

                    <div className="p-5 border border-zinc-900 bg-[#0c0c0c] rounded-2xl text-center space-y-2">
                      <Database className="w-8 h-8 text-emerald-400 mx-auto" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Memory Allocation</h4>
                      <div className="text-2xl font-mono font-bold text-white">{ramLoad}%</div>
                      <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${ramLoad}%` }} />
                      </div>
                    </div>

                    <div className="p-5 border border-zinc-900 bg-[#0c0c0c] rounded-2xl text-center space-y-2">
                      <Server className="w-8 h-8 text-emerald-400 mx-auto" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Database Queries Index</h4>
                      <div className="text-2xl font-mono font-bold text-white">{dbLoad}%</div>
                      <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${dbLoad}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Terminal Logs */}
                  <div className="p-5 border border-zinc-900 bg-[#0c0c0c] rounded-2xl space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-emerald-400" /> Platform Container Log Stream
                    </h3>
                    <div className="bg-black/80 font-mono text-emerald-500/90 text-[10px] p-4 rounded-xl border border-zinc-900 max-h-60 overflow-y-auto space-y-1.5 select-text">
                      {liveLogLines.map((line, idx) => (
                        <div key={idx} className="hover:bg-zinc-900/60 py-0.5 px-1 rounded transition-colors">
                          <span className="text-zinc-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                          <span>{line}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
