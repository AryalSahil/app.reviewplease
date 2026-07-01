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

export const initialUser: User = {
  id: "usr_1",
  email: "owner@sweetbites.com",
  name: "Sarah Jenkins",
  businessName: "Sweet Bites Bakery",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120",
  plan: "Pro",
  role: "Owner"
};

export const initialBusinessProfile: BusinessProfile = {
  name: "Sweet Bites Bakery",
  logo: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=120",
  category: "Bakery & Cafe",
  address: "128 Gourmet Ave, Suite A, San Francisco, CA 94107",
  phone: "(415) 555-8931",
  website: "https://www.sweetbitesbakery.com",
  googleReviewLink: "https://g.page/r/sweet-bites-sf/review",
  hours: "Mon-Sat: 7:00 AM - 6:00 PM, Sun: 8:00 AM - 4:00 PM",
  socials: {
    facebook: "https://facebook.com/sweetbitesbakery",
    instagram: "https://instagram.com/sweetbitesbakery",
    twitter: "https://twitter.com/sweetbitessf",
    linkedin: "https://linkedin.com/company/sweet-bites-bakery"
  }
};

export const initialQRCodes: QRCodeItem[] = [
  {
    id: "qr_1",
    name: "Main Counter Sign",
    url: "https://reviewplease.ai/r/sweet-bites-counter",
    createdAt: "2026-01-15",
    scans: 1245,
    ratingRequired: 4,
    status: "Active"
  },
  {
    id: "qr_2",
    name: "Table Tents (All Tables)",
    url: "https://reviewplease.ai/r/sweet-bites-tables",
    createdAt: "2026-02-10",
    scans: 872,
    ratingRequired: 4,
    status: "Active"
  },
  {
    id: "qr_3",
    name: "Takeaway Bags Flyer",
    url: "https://reviewplease.ai/r/sweet-bites-bags",
    createdAt: "2026-03-01",
    scans: 430,
    ratingRequired: 4,
    status: "Active"
  },
  {
    id: "qr_4",
    name: "Weekend Event Board",
    url: "https://reviewplease.ai/r/sweet-bites-event",
    createdAt: "2026-05-12",
    scans: 98,
    ratingRequired: 5,
    status: "Active"
  }
];

export const initialReviews: Review[] = [
  {
    id: "rev_1",
    author: "Michael Chang",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
    rating: 5,
    text: "The almond croissants here are life-changing! Crispy on the outside, light and rich inside. The coffee pairing was perfect. Extremely fast service too even during the morning rush. Will be a regular here!",
    response: "Hi Michael, thank you so much for the wonderful feedback! We take pride in our croissants and are thrilled you enjoyed them. Looking forward to your next visit!",
    date: "2026-06-27",
    source: "Google",
    location: "Main Counter Sign",
    status: "replied"
  },
  {
    id: "rev_2",
    author: "Elena Rostova",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120",
    rating: 5,
    text: "Ordered a custom lemon elderflower cake for my daughter's birthday. Not only was it absolutely stunning, but it tasted phenomenal. Not overly sweet, perfect crumb. Thank you Sarah and the team!",
    date: "2026-06-26",
    source: "Google",
    location: "Direct Feed",
    status: "pending"
  },
  {
    id: "rev_3",
    author: "David Vance",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120",
    rating: 4,
    text: "Really delicious pastries and great atmosphere. The sourdough was stellar. Only minor issue is that seating is quite limited, so had to wait a bit for a table. Staff was friendly though!",
    response: "Hi David! Thank you for the 4-star review and your kind words about our sourdough. Yes, our cozy space can get packed! We hope to see you again soon.",
    date: "2026-06-25",
    source: "Google",
    location: "Table Tents (All Tables)",
    status: "replied"
  },
  {
    id: "rev_4",
    author: "Amara Okoye",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=120",
    rating: 3,
    text: "The cupcakes were lovely but the espresso was quite bitter today. I've had better coffee here before so maybe it was just a off-batch or different barista. Still love the vibes though.",
    date: "2026-06-24",
    source: "Google",
    location: "Table Tents (All Tables)",
    status: "pending"
  },
  {
    id: "rev_5",
    author: "Tom H.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120",
    rating: 2,
    text: "We arrived at 4 PM and almost all pastries were sold out. Staff seemed a bit rushed and unhelpful when we asked about gluten-free options. Disappointed because we heard great things.",
    date: "2026-06-22",
    source: "Direct Feed",
    location: "Takeaway Bags Flyer",
    status: "pending"
  },
  {
    id: "rev_6",
    author: "Chloe Dubois",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120",
    rating: 5,
    text: "Le meilleur café et croissant de San Francisco! It feels like a genuine Parisian neighborhood spot. Beautiful interior design, warm colors, and lovely music.",
    response: "Merci Chloe! We strive to bring that cozy Parisian feel to SF. Happy to hear you loved the coffee and pastries!",
    date: "2026-06-20",
    source: "Google",
    location: "Main Counter Sign",
    status: "replied"
  }
];

export const initialTeam: TeamMember[] = [
  {
    id: "team_1",
    name: "Sarah Jenkins",
    email: "owner@sweetbites.com",
    role: "Admin",
    status: "Active",
    joinedAt: "2025-10-01"
  },
  {
    id: "team_2",
    name: "Marcus Brody",
    email: "marcus@sweetbites.com",
    role: "Manager",
    status: "Active",
    joinedAt: "2025-11-15"
  },
  {
    id: "team_3",
    name: "Lila Chen",
    email: "lila@sweetbites.com",
    role: "Editor",
    status: "Active",
    joinedAt: "2026-01-20"
  },
  {
    id: "team_4",
    name: "John Miller",
    email: "john.m@sweetbites.com",
    role: "Editor",
    status: "Pending",
    joinedAt: "2026-06-25"
  }
];

export const initialBilling: BillingInvoice[] = [
  {
    id: "INV-2026-006",
    date: "2026-06-15",
    amount: 99.00,
    status: "Paid",
    plan: "Pro Plan (Monthly)"
  },
  {
    id: "INV-2026-005",
    date: "2026-05-15",
    amount: 99.00,
    status: "Paid",
    plan: "Pro Plan (Monthly)"
  },
  {
    id: "INV-2026-004",
    date: "2026-04-15",
    amount: 99.00,
    status: "Paid",
    plan: "Pro Plan (Monthly)"
  },
  {
    id: "INV-2026-003",
    date: "2026-03-15",
    amount: 99.00,
    status: "Paid",
    plan: "Pro Plan (Monthly)"
  },
  {
    id: "INV-2026-002",
    date: "2026-02-15",
    amount: 99.00,
    status: "Paid",
    plan: "Pro Plan (Monthly)"
  },
  {
    id: "INV-2026-001",
    date: "2026-01-15",
    amount: 99.00,
    status: "Paid",
    plan: "Pro Plan (Monthly)"
  }
];

export const initialNotifications: NotificationItem[] = [
  {
    id: "notif_1",
    title: "New 5-Star Google Review",
    description: "Michael Chang left a new 5-star review about almond croissants.",
    time: "1 hour ago",
    type: "review",
    read: false
  },
  {
    id: "notif_2",
    title: "AI Response Assist Used",
    description: "Successfully drafted reply for David Vance's 4-star review.",
    time: "3 hours ago",
    type: "ai",
    read: false
  },
  {
    id: "notif_3",
    title: "Weekly Summary Ready",
    description: "Your weekly performance summary is available. Conversion up by 4.2%.",
    time: "1 day ago",
    type: "system",
    read: true
  },
  {
    id: "notif_4",
    title: "Subscription Renewal Successful",
    description: "Invoice INV-2026-006 for $49.00 was paid successfully.",
    time: "13 days ago",
    type: "billing",
    read: true
  },
  {
    id: "notif_5",
    title: "High QR Scan Activity",
    description: "Your 'Main Counter Sign' QR code saw a 30% spike in scans today.",
    time: "15 days ago",
    type: "system",
    read: true
  }
];

export const initialActivityLogs: ActivityLog[] = [
  {
    id: "act_1",
    user: "Sarah Jenkins",
    action: "Replied to Review",
    details: "Drafted reply for Michael Chang",
    time: "10:45 AM",
    type: "success"
  },
  {
    id: "act_2",
    user: "Marcus Brody",
    action: "Generated QR Code",
    details: "Created 'Takeaway Bags Flyer' code",
    time: "Yesterday, 3:30 PM",
    type: "info"
  },
  {
    id: "act_3",
    user: "System AI",
    action: "AI Auto-suggest",
    details: "Generated response suggestions for Elena Rostova",
    time: "Yesterday, 11:15 AM",
    type: "ai" as any // Handled gracefully
  },
  {
    id: "act_4",
    user: "Sarah Jenkins",
    action: "Updated Profile",
    details: "Changed cafe opening hours to 7:00 AM",
    time: "2 days ago",
    type: "info"
  },
  {
    id: "act_5",
    user: "Lila Chen",
    action: "Exported Reviews",
    details: "Downloaded Q2 spreadsheet format (62 reviews)",
    time: "3 days ago",
    type: "info"
  }
];

export const initialScanAnalytics: ScanAnalyticsPoint[] = [
  { date: "Jun 22", scans: 140, reviews: 35 },
  { date: "Jun 23", scans: 165, reviews: 42 },
  { date: "Jun 24", scans: 130, reviews: 29 },
  { date: "Jun 25", scans: 210, reviews: 68 },
  { date: "Jun 26", scans: 245, reviews: 74 },
  { date: "Jun 27", scans: 290, reviews: 92 },
  { date: "Jun 28", scans: 195, reviews: 55 }
];

export const ratingDist = [
  { star: 5, count: 184, percentage: 70 },
  { star: 4, count: 48, percentage: 18 },
  { star: 3, count: 18, percentage: 7 },
  { star: 2, count: 8, percentage: 3 },
  { star: 1, count: 5, percentage: 2 }
];

export const deviceData = [
  { name: "Mobile", value: 78, color: "#3B82F6" },
  { name: "Tablet", value: 12, color: "#10B981" },
  { name: "Desktop", value: 10, color: "#F59E0B" }
];

export const languageData = [
  { name: "English", value: 85, color: "#6366F1" },
  { name: "Spanish", value: 8, color: "#EC4899" },
  { name: "French", value: 4, color: "#14B8A6" },
  { name: "Others", value: 3, color: "#6B7280" }
];
