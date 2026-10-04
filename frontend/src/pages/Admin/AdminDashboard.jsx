import { useState } from "react";

import AdminSidebar from "../../components/Admin/AdminSidebar";

// Dashboard components
import AdminStats from "../../components/Admin/AdminStats";
import AuctionActivity from "../../components/Admin/AuctionActivity";
import RecentActivities from "../../components/Admin/RecentActivities";
import RevenueOverview from "../../components/Admin/RevenueOverview";

// Admin section components
import AdminNotifications from "../../components/Admin/AdminNotifications";
import AuctionManagement from "../../components/Admin/AuctionManagement";
import Categories from "../../components/Admin/CategoryManagement";
import DisputesSupport from "../../components/Admin/DisputesSupport";
import Orders from "../../components/Admin/OrderManagement";
import PaymentsTransactions from "../../components/Admin/PaymentsTransactions";
import ProductVerification from "../../components/Admin/ProductVerification";
import ReportsAnalytics from "../../components/Admin/ReportsAnalytics";
import SellerManagement from "../../components/Admin/SellerManagement";
import SystemOperations from "../../components/Admin/SystemOperations";
import SystemSettings from "../../components/Admin/SystemSettings";
import UserManagement from "../../components/Admin/UserManagement";

import "./AdminDashboard.css";

// ==========================================
// DASHBOARD CONTENT
// ==========================================

function DashboardContent() {
  return (
    <div className="admin-dashboard-content">
      <AdminStats />

      <div className="admin-dashboard-charts">
        <AuctionActivity />
        <RevenueOverview />
      </div>

      <div className="admin-dashboard-bottom">
        <RecentActivities />
      </div>
    </div>
  );
}

// ==========================================
// ADMIN DASHBOARD
// ==========================================

export default function AdminDashboard() {
  const [activePage, setActivePage] = useState("Dashboard");

  // ==========================================
  // HANDLE SIDEBAR NAVIGATION
  // ==========================================

  const handlePageChange = (page) => {
    setActivePage(page);
  };

  // ==========================================
  // RENDER ACTIVE SECTION
  // ==========================================

  const renderContent = () => {
    switch (activePage) {
      case "Dashboard":
        return <DashboardContent />;

      case "User Management":
        return <UserManagement />;

      case "Seller Management":
        return <SellerManagement />;

      case "Product Verification":
        return <ProductVerification />;

      case "Auction Management":
        return <AuctionManagement />;

      case "Orders":
        return <Orders />;

      case "Payments & Transactions":
        return <PaymentsTransactions />;

      case "Categories":
        return <Categories />;

      case "Disputes & Support":
        return <DisputesSupport />;

      case "Reports & Analytics":
        return <ReportsAnalytics />;

      case "Notifications":
        return <AdminNotifications />;

      case "System Settings":
        return <SystemSettings />;

      case "System Operations":
        return <SystemOperations />;

      default:
        return <DashboardContent />;
    }
  };

  // ==========================================
  // ADMIN DASHBOARD LAYOUT
  // ==========================================

  return (
    <div className="admin-panel-layout">
      {/* ADMIN SIDEBAR */}
      <AdminSidebar activePage={activePage} setActivePage={handlePageChange} />

      {/* MAIN CONTENT */}
      <div className="admin-panel-main">
        {/* ACTIVE PAGE CONTENT */}
        <main className="admin-panel-content">{renderContent()}</main>
      </div>
    </div>
  );
}
