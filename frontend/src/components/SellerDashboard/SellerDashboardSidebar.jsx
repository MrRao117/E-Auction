import { useEffect, useState } from "react";
import Icon from "../Icon/Icon";

export default function SellerDashboardSidebar({ activePage, onPageChange }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const formattedDate = currentTime.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <aside className="seller-dashboard-sidebar">
      {/* REAL-TIME CLOCK */}
      <div className="real-time-watch">
        <div className="watch-details">
          <span className="watch-label">Current Time</span>
          <strong className="watch-time">{formattedTime}</strong>
          <span className="watch-date">{formattedDate}</span>
        </div>
      </div>

      {/* SIDEBAR NAVIGATION */}
      <nav className="seller-sidebar-nav">
        <button
          type="button"
          className={`seller-nav-item ${
            activePage === "overview" ? "active" : ""
          }`}
          onClick={() => onPageChange("overview")}
        >
          <Icon name="home" size={18} />
          <span>Overview</span>
        </button>

        <button
          type="button"
          className={`seller-nav-item ${
            activePage === "create-auction" ? "active" : ""
          }`}
          onClick={() => onPageChange("create-auction")}
        >
          <Icon name="gavel" size={18} />
          <span>Create New Auction</span>
        </button>

        {/* NOTIFICATIONS */}
        <button
          type="button"
          className={`seller-nav-item ${
            activePage === "notifications" ? "active" : ""
          }`}
          onClick={() => onPageChange("notifications")}
        >
          <Icon name="bell" size={18} />
          <span>Notifications</span>
        </button>

        {/* MANUAL AND FAQS */}
        <button
          type="button"
          className={`seller-nav-item ${
            activePage === "manual-faqs" ? "active" : ""
          }`}
          onClick={() => onPageChange("manual-faqs")}
        >
          <Icon name="book" size={18} />
          <span>Manual and FAQs</span>
        </button>
      </nav>

      {/* HELP BOX */}
      <div className="seller-help-card">
        <div className="seller-help-icon">
          <Icon name="phone" size={18} />
        </div>

        <h4>Need Help?</h4>

        <p>We're here to help you with anything you need.</p>

        <button type="button" className="seller-help-button">
          <Icon name="phone" size={16} />
          <span>Contact and Support</span>
        </button>
      </div>
    </aside>
  );
}
