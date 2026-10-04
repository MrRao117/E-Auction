import Icon from "../Icon/Icon";

export default function SellerDashboardSidebar({ activePage, onPageChange }) {
  return (
    <aside className="seller-dashboard-sidebar">
      {/* Sidebar Navigation */}
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

        <button
          type="button"
          className={`seller-nav-item ${
            activePage === "payment-methods" ? "active" : ""
          }`}
          onClick={() => onPageChange("payment-methods")}
        >
          <Icon name="creditCard" size={18} />
          <span>Payment Methods</span>
        </button>

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

      {/* Help Box */}
      <div className="seller-help-card">
        <div className="seller-help-icon">
          <Icon name="phone" size={18} />
        </div>

        <h4>Need Help?</h4>

        <p>We&apos;re here to help you with anything you need.</p>

        <button type="button" className="seller-help-button">
          <Icon name="phone" size={16} />
          <span>Contact and Support</span>
        </button>
      </div>
    </aside>
  );
}
