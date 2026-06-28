export interface User {
  id: string;
  email: string;
  name: string;
  businessName: string;
  avatar?: string;
  plan: "Free" | "Pro" | "Enterprise";
  role: "Owner" | "Admin" | "Manager" | "Editor";
}

export interface BusinessProfile {
  name: string;
  logo: string;
  category: string;
  address: string;
  phone: string;
  website: string;
  googleReviewLink: string;
  hours: string;
  socials: {
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
  };
}

export interface QRCodeItem {
  id: string;
  name: string;
  url: string;
  createdAt: string;
  scans: number;
  ratingRequired: number; // For review filtering gate (e.g. 4+ stars goes to Google, <4 goes to private feedback)
  status: "Active" | "Inactive";
}

export interface Review {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  text: string;
  response?: string;
  date: string;
  source: "Google" | "Direct Feed";
  location: string;
  status: "replied" | "pending";
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Manager" | "Editor";
  status: "Active" | "Pending";
  joinedAt: string;
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  details: string;
  time: string;
  type: "info" | "success" | "warning" | "error";
}

export interface BillingInvoice {
  id: string;
  date: string;
  amount: number;
  status: "Paid" | "Pending" | "Failed";
  plan: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "review" | "billing" | "ai" | "system";
  read: boolean;
}

export interface ScanAnalyticsPoint {
  date: string;
  scans: number;
  reviews: number;
}

export interface ThemeConfig {
  id: string;
  name: string;
  // Branding
  logo: string;
  coverBanner: string; // image URL or hex/gradient string
  businessName: string;
  tagline: string;
  description: string;
  googleVerified: boolean;
  favicon: string;

  // Theme type
  mode: "light" | "dark" | "auto";
  bgType: "color" | "gradient" | "image";
  bgColor: string;
  bgGradient: string;
  bgImage: string;
  cardStyle: "solid" | "bordered" | "glass";
  borderRadius: "none" | "sm" | "md" | "lg" | "full";
  shadows: "none" | "sm" | "md" | "lg";

  // Brand Colors
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  buttonColor: string;
  buttonTextColor: string;
  textColor: string;
  cardBgColor: string;

  // Typography
  fontFamily: "Inter" | "Space Grotesk" | "Outfit" | "Playfair Display" | "JetBrains Mono" | "Roboto";
  fontSize: "sm" | "md" | "lg";
  fontWeight: "normal" | "medium" | "bold";
  buttonStyle: "square" | "rounded" | "pill";
  iconStyle: "outline" | "solid";

  // Welcome Section
  welcomeTitle: string;
  welcomeMessage: string;
  thankYouMessage: string;
  ctaButtonText: string;

  // Rating Section
  starColor: string;
  emojiStyle: "default" | "animated" | "minimal";
  ratingLabels: { [key: number]: string };

  // AI Review Section
  aiEnabled: boolean;
  aiSectionTitle: string;
  aiGenerateBtnText: string;
  aiRewriteBtnText: string;
  aiLanguageSelector: boolean;
  aiToneSelector: boolean;

  // Languages
  enabledLanguages: string[];

  // Buttons customization
  googleBtnText: string;
  googleBtnIcon: string;
  copyBtnText: string;
  visitWebsiteText: string;
  callText: string;
  whatsappText: string;
  directionsText: string;

  // Social Links
  socialLinks: {
    website: boolean;
    instagram: boolean;
    facebook: boolean;
    linkedin: boolean;
    whatsapp: boolean;
    youtube: boolean;
    x: boolean;
    maps: boolean;
  };

  // Footer
  footerText: string;
  privacyLink: string;
  termsLink: string;
  hidePoweredBy: boolean;
}
