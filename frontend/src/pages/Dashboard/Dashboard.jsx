import { useState } from "react";

import AccountSummary from "../../components/Dashboard/AccountSummary";
import ActiveBids from "../../components/Dashboard/ActiveBids";
import DashboardSidebar from "../../components/Dashboard/DashboardSidebar";
import DashboardStats from "../../components/Dashboard/DashboardStats";
import Messages from "../../components/Dashboard/Messages";
import MyAddress from "../../components/Dashboard/MyAddress";
import MyOrders from "../../components/Dashboard/MyOrders";
import PaymentMethods from "../../components/Dashboard/PaymentMethods";
import RecentActivity from "../../components/Dashboard/RecentActivity";
import Watchlist from "../../components/Dashboard/Watchlist";
import WonAuctions from "../../components/Dashboard/WonAuctions";
import Header from "../../components/Header/Header";
import SellerVerificationModal from "../../components/Seller/SellerVerificationModal";

import "./Dashboard.css";

function Dashboard({
  onLogout,
  onSellerVerified,
  isSeller,
  isLoggedIn,
  user,
  onDashboard,
  onSellerDashboard,
  canAccessSellerDashboard = false,
  onHome,
  onViewAllAuctions,
  onProductDetails,
  onHowItWorks,
  onLiveAuction,
  activeLink = "",
  onActiveLinkChange,
}) {
  const [showSellerModal, setShowSellerModal] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");

  const handleBecomeSeller = () => {
    setShowSellerModal(true);
  };

  const handleCloseSellerModal = () => {
    setShowSellerModal(false);
  };

  const handleSellerVerified = () => {
    setShowSellerModal(false);

    if (onSellerVerified) {
      onSellerVerified();
    }
  };

  const handleOverview = () => setActiveSection("overview");
  const handleOrders = () => setActiveSection("orders");
  const handleWatchlist = () => setActiveSection("watchlist");
  const handleMessages = () => setActiveSection("messages");
  const handleAddress = () => setActiveSection("address");
  const handlePaymentMethods = () => setActiveSection("payment-methods");

  return (
    <>
      <Header
        onLogout={onLogout}
        onSellerVerified={onSellerVerified}
        dashboardMode
        isSeller={isSeller}
        isLoggedIn={isLoggedIn}
        user={user}
        onDashboard={onDashboard}
        onSellerDashboard={onSellerDashboard}
        canAccessSellerDashboard={canAccessSellerDashboard}
        onBecomeSeller={handleBecomeSeller}
        onHome={onHome}
        onViewAllAuctions={onViewAllAuctions}
        onHowItWorks={onHowItWorks}
        activeLink={activeLink}
        onActiveLinkChange={onActiveLinkChange}
      />

      <div className="dashboard">
        <DashboardSidebar
          onLogout={onLogout}
          onBecomeSeller={handleBecomeSeller}
          activeSection={activeSection}
          onOverview={handleOverview}
          onOrders={handleOrders}
          onWatchlist={handleWatchlist}
          onMessages={handleMessages}
          onAddress={handleAddress}
          onPaymentMethods={handlePaymentMethods}
        />

        <main className="dashboard-main">
          {activeSection === "orders" ? (
            <MyOrders />
          ) : activeSection === "watchlist" ? (
            <Watchlist mode="full" onProductDetails={onProductDetails} />
          ) : activeSection === "messages" ? (
            <Messages mode="full" />
          ) : activeSection === "address" ? (
            <MyAddress />
          ) : activeSection === "payment-methods" ? (
            <PaymentMethods />
          ) : (
            <>
              <section className="account-summary-row">
                <AccountSummary />
              </section>

              <DashboardStats />

              <section className="dashboard-columns active-bids-row">
                <ActiveBids onLiveAuction={onLiveAuction} />
                <RecentActivity />
              </section>

              <section className="dashboard-columns bottom-three-row">
                <WonAuctions />
                <Messages mode="overview" />
                <div></div>
              </section>

              <footer className="dashboard-footer">
                <p className="copyright">
                  © 2026 eAuction. All rights reserved.
                </p>
              </footer>
            </>
          )}
        </main>
      </div>

      {showSellerModal && (
        <SellerVerificationModal
          onClose={handleCloseSellerModal}
          onSellerVerified={handleSellerVerified}
        />
      )}
    </>
  );
}

export default Dashboard;
