import { useState } from "react";

import Messages from "../../components/Dashboard/Messages";
import Header from "../../components/Header/Header";
import CreateAuction from "../../components/SellerDashboard/CreateAuction";
import ManualFAQs from "../../components/SellerDashboard/ManualFAQs";
import SellerDashboardOverview from "../../components/SellerDashboard/SellerDashboardOverview";
import SellerDashboardSidebar from "../../components/SellerDashboard/SellerDashboardSidebar";

import "./SellerDashboard.css";

export default function SellerDashboard({
  onLogout,
  onDashboard,
  onHome,
  onViewAllAuctions,
  onHowItWorks,
}) {
  const [activePage, setActivePage] = useState("overview");

  const handlePageChange = (page) => {
    setActivePage(page);
  };

  const renderContent = () => {
    switch (activePage) {
      case "overview":
        return <SellerDashboardOverview />;

      case "create-auction":
        return <CreateAuction />;

      case "notifications":
        return <Messages mode="full" />;

      case "manual-faqs":
        return <ManualFAQs />;

      default:
        return <SellerDashboardOverview />;
    }
  };

  return (
    <div className="seller-dashboard">
      <Header
        onLogout={onLogout}
        onDashboard={onDashboard}
        onHome={onHome}
        onViewAllAuctions={onViewAllAuctions}
        onHowItWorks={onHowItWorks}
        dashboardMode
        sellerDashboardMode
        isLoggedIn
        activeLink=""
      />

      <div className="seller-dashboard-layout">
        <SellerDashboardSidebar
          activePage={activePage}
          onPageChange={handlePageChange}
        />

        <main className="seller-dashboard-main">{renderContent()}</main>
      </div>
    </div>
  );
}
