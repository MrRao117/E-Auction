import {
  Activity,
  AlertTriangle,
  Bell,
  ChartNoAxesColumn,
  ChevronRight,
  CreditCard,
  Gavel,
  Grid2X2,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBag,
  Store,
  Users,
} from "lucide-react";

import "./AdminSidebar.css";

// ==========================================
// ADMIN SIDEBAR NAVIGATION
// ==========================================

const navigation = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", label: "User Management", icon: Users, arrow: true },
  { id: "sellers", label: "Seller Management", icon: Store, arrow: true },
  { id: "products", label: "Product Verification", icon: Package, badge: 12 },
  {
    id: "auctions",
    label: "Auction Management",
    icon: Gavel,
    arrow: true,
  },
  {
    id: "orders",
    label: "Orders",
    icon: ShoppingBag,
    arrow: true,
  },
  {
    id: "payments",
    label: "Payments & Transactions",
    icon: CreditCard,
    arrow: true,
  },
  {
    id: "categories",
    label: "Categories",
    icon: Grid2X2,
    arrow: true,
  },
  {
    id: "disputes",
    label: "Disputes & Support",
    icon: AlertTriangle,
    badge: 3,
  },
  {
    id: "reports",
    label: "Reports & Analytics",
    icon: ChartNoAxesColumn,
    arrow: true,
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    badge: 5,
  },
  {
    id: "settings",
    label: "System Settings",
    icon: Settings,
    arrow: true,
  },
  {
    id: "system-operations",
    label: "System Operations",
    icon: Activity,
    arrow: true,
  },
];

// ==========================================
// ADMIN SIDEBAR COMPONENT
// ==========================================

export default function AdminSidebar({ activePage, setActivePage }) {
  // ==========================================
  // HANDLE NAVIGATION
  // ==========================================

  const handleNavigation = (id, label) => {
    if (id === "notifications") {
      setActivePage("Notifications");
      return;
    }

    setActivePage(label);
  };

  // ==========================================
  // RENDER SIDEBAR
  // ==========================================

  return (
    <aside className="admin-sidebar">
      <nav className="admin-sidebar-nav">
        {navigation.map(({ id, label, icon: Icon, badge, arrow }) => (
          <button
            key={id}
            type="button"
            className={`admin-nav-item ${activePage === label ? "active" : ""}`}
            onClick={() => handleNavigation(id, label)}
          >
            <Icon className="admin-nav-icon" size={19} strokeWidth={1.9} />

            <span className="admin-nav-label">{label}</span>

            {badge !== undefined && (
              <span className="admin-nav-badge">{badge}</span>
            )}

            {arrow && <ChevronRight className="admin-nav-arrow" size={17} />}
          </button>
        ))}
      </nav>
    </aside>
  );
}
