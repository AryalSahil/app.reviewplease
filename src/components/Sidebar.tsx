import { 
  LayoutDashboard, 
  QrCode, 
  MessageSquare, 
  Sparkles, 
  Reply, 
  BarChart3, 
  Briefcase, 
  Users, 
  CreditCard, 
  Bell, 
  Settings, 
  HelpCircle,
  Star,
  X,
  Palette
} from "lucide-react";
import { User, BusinessProfile } from "../types";

export type ActiveSection = 
  | "dashboard"
  | "qrcodes"
  | "customer_portal"
  | "theme_builder"
  | "reviews"
  | "ai_assistant"
  | "ai_replies"
  | "analytics"
  | "profile"
  | "team"
  | "subscription"
  | "notifications"
  | "settings"
  | "help";

interface SidebarProps {
  activeSection: ActiveSection;
  onSectionChange: (section: ActiveSection) => void;
  user: User;
  businessProfile: BusinessProfile;
  unreadCount: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ 
  activeSection, 
  onSectionChange, 
  user, 
  businessProfile,
  unreadCount,
  isOpen,
  onClose
}: SidebarProps) {

  const menuItems = [
    { id: "dashboard" as ActiveSection, label: "Dashboard", icon: LayoutDashboard },
    { id: "qrcodes" as ActiveSection, label: "QR Codes", icon: QrCode },
    { id: "customer_portal" as ActiveSection, label: "QR Review Portal", icon: Star, badge: "Simulate" },
    { id: "theme_builder" as ActiveSection, label: "Theme Builder", icon: Palette, badge: "Custom" },
    { id: "reviews" as ActiveSection, label: "Reviews", icon: MessageSquare },
    { id: "ai_assistant" as ActiveSection, label: "AI Assistant", icon: Sparkles, badge: "New" },
    { id: "ai_replies" as ActiveSection, label: "AI Replies", icon: Reply },
    { id: "analytics" as ActiveSection, label: "Analytics", icon: BarChart3 },
    { id: "profile" as ActiveSection, label: "Business Profile", icon: Briefcase },
    { id: "team" as ActiveSection, label: "Team", icon: Users },
    { id: "subscription" as ActiveSection, label: "Subscription", icon: CreditCard },
    { 
      id: "notifications" as ActiveSection, 
      label: "Notifications", 
      icon: Bell, 
      count: unreadCount > 0 ? unreadCount : undefined 
    },
    { id: "settings" as ActiveSection, label: "Settings", icon: Settings },
    { id: "help" as ActiveSection, label: "Help & Support", icon: HelpCircle },
  ];

  const handleItemClick = (id: ActiveSection) => {
    onSectionChange(id);
    onClose(); // Close sidebar on mobile
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          id="sidebar-overlay"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Main Sidebar */}
      <aside
        id="sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-66 flex-col border-r border-[#1a1a1a] bg-[#080808] transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-[#1a1a1a]">
          <div className="flex items-center space-x-2">
            <div className="bg-[#1a1a1a] p-1.5 rounded-lg border border-[#333] text-white">
              <Star className="h-4 w-4 fill-white text-emerald-400" />
            </div>
            <span className="text-xl font-serif italic tracking-tight text-white">
              ReviewPlease
            </span>
          </div>
          <button
            id="close-sidebar-btn"
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-500 hover:bg-[#111] lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Business Select / Summary */}
        <div className="p-4 border-b border-[#1a1a1a]">
          <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-[#0c0c0c] border border-[#1a1a1a]">
            <img
              src={businessProfile.logo}
              alt={businessProfile.name}
              className="h-9 w-9 rounded-lg object-cover border border-[#1a1a1a]"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 overflow-hidden">
              <h4 className="text-xs font-semibold text-white truncate">
                {businessProfile.name}
              </h4>
              <p className="text-[10px] text-zinc-500 truncate">{businessProfile.category}</p>
            </div>
            <span className="inline-flex items-center rounded-md bg-emerald-950/40 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-900/40 font-mono">
              {user.plan}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav id="sidebar-nav" className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-item-${item.id}`}
                onClick={() => handleItemClick(item.id)}
                className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#1a1a1a] text-white"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-[#0c0c0c]"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <IconComponent
                    className={`h-4.5 w-4.5 transition-colors ${
                      isActive
                        ? "text-emerald-400"
                        : "text-zinc-600 group-hover:text-zinc-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className="ml-auto inline-block rounded-full bg-[#1a1a1a] px-2 py-0.5 text-xs font-semibold text-zinc-300 border border-[#2a2a2a]">
                    {item.count}
                  </span>
                )}
                {item.badge && (
                  <span className="ml-auto inline-block rounded bg-emerald-950/50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-900/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#1a1a1a] bg-[#050505]">
          <div className="flex items-center space-x-3">
            <img
              src={user.avatar}
              alt={user.name}
              className="h-9 w-9 rounded-full object-cover border border-[#1a1a1a]"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 overflow-hidden">
              <h5 className="text-xs font-semibold text-white truncate">
                {user.name}
              </h5>
              <p className="text-[10px] text-zinc-500 truncate font-mono">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
