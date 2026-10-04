import { useEffect, useState } from "react";

import Icon from "../Icon/Icon";

function DashboardSidebar({
  onLogout,
  onBecomeSeller,
  activeSection = "overview",
  onOverview,
  onOrders,
  onWatchlist,
  onMessages,
  onAddress,
  onPaymentMethods,
}) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const formattedDate = currentTime.toLocaleDateString([], {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <aside className="dashboard-sidebar">
      {/* REAL-TIME CLOCK */}
      <div className="real-time-watch">
        <div className="watch-details">
          <span className="watch-label">Current Time</span>

          <strong className="watch-time">{formattedTime}</strong>

          <span className="watch-date">{formattedDate}</span>
        </div>
      </div>

      {/* SIDEBAR NAVIGATION */}
      <nav className="sidebar-nav">
        <button
          className={`nav-item ${activeSection === "overview" ? "active" : ""}`}
          type="button"
          onClick={onOverview}
        >
          <Icon name="home" size={18} />
          <span>Overview</span>
        </button>

        <button
          className={`nav-item ${activeSection === "orders" ? "active" : ""}`}
          type="button"
          onClick={onOrders}
        >
          <Icon name="gavel" size={18} />
          <span>My Orders</span>
        </button>

        {/* WATCHLIST */}
        <button
          className={`nav-item ${
            activeSection === "watchlist" ? "active" : ""
          }`}
          type="button"
          onClick={onWatchlist}
        >
          <Icon name="heart" size={18} />
          <span>Watchlist</span>
        </button>

        {/* BECOME A SELLER */}
        <button
          className="nav-item sidebar-seller-button"
          type="button"
          onClick={onBecomeSeller}
        >
          <Icon name="user" size={18} />
          <span>Become A Seller</span>
        </button>

        {/* MESSAGES */}
        <button
          className={`nav-item ${activeSection === "messages" ? "active" : ""}`}
          type="button"
          onClick={onMessages}
        >
          <Icon name="mail" size={18} />
          <span>Messages</span>
          <span className="message-count">2</span>
        </button>

        {/* MY ADDRESS */}
        <button
          className={`nav-item ${activeSection === "address" ? "active" : ""}`}
          type="button"
          onClick={onAddress}
        >
          <Icon name="home" size={18} />
          <span>My Address</span>
        </button>

        {/* PAYMENT METHODS */}
        <button
          className={`nav-item ${
            activeSection === "payment-methods" ? "active" : ""
          }`}
          type="button"
          onClick={onPaymentMethods}
        >
          <Icon name="creditCard" size={18} />
          <span>Payment Methods</span>
        </button>
      </nav>

      {/* HELP */}
      <div className="help-card">
        <h4>Need Help?</h4>

        <p>We're here to help you with anything you need.</p>

        <button type="button">
          <Icon name="phone" size={15} />
          <span>Contact Support</span>
        </button>
      </div>
    </aside>
  );
}

export default DashboardSidebar;
