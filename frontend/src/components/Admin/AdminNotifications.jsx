import {
  AlertTriangle,
  Bell,
  Check,
  CheckCheck,
  CheckCircle,
  Clock,
  CreditCard,
  Eye,
  Filter,
  Gavel,
  Search,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import "./AdminNotifications.css";

function AdminNotification() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New Seller Verification Request",
      message:
        "Rahul Sharma has submitted a seller verification request for TechWorld.",
      type: "Seller",
      date: "2026-09-26T10:30:00",
      read: false,
    },
    {
      id: 2,
      title: "New Auction Created",
      message:
        "A new auction for Apple MacBook Pro M3 has been created and is awaiting review.",
      type: "Auction",
      date: "2026-09-26T09:45:00",
      read: false,
    },
    {
      id: 3,
      title: "Payment Received",
      message: "Payment of ₹1,45,000 has been completed for order ORD-1001.",
      type: "Payment",
      date: "2026-09-25T18:20:00",
      read: false,
    },
    {
      id: 4,
      title: "New Dispute Reported",
      message: "A buyer has raised a dispute regarding order ORD-1002.",
      type: "Dispute",
      date: "2026-09-25T16:10:00",
      read: true,
    },
    {
      id: 5,
      title: "Auction Ending Soon",
      message: "The auction for Sony Alpha Camera is scheduled to end soon.",
      type: "Auction",
      date: "2026-09-25T14:00:00",
      read: true,
    },
    {
      id: 6,
      title: "Order Delivered",
      message: "Order ORD-1004 has been marked as delivered.",
      type: "Order",
      date: "2026-09-24T12:30:00",
      read: true,
    },
    {
      id: 7,
      title: "Seller Verification Approved",
      message: "The seller account for Photo World has been approved.",
      type: "Seller",
      date: "2026-09-24T11:00:00",
      read: true,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [readFilter, setReadFilter] = useState("All");
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Notification Statistics
  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  const readCount = notifications.filter(
    (notification) => notification.read,
  ).length;

  // Get Icon Based on Notification Type
  const getTypeIcon = (type) => {
    switch (type) {
      case "Auction":
        return <Gavel size={20} />;

      case "Payment":
        return <CreditCard size={20} />;

      case "Seller":
        return <ShieldCheck size={20} />;

      case "Dispute":
        return <AlertTriangle size={20} />;

      case "Order":
        return <ShoppingBag size={20} />;

      default:
        return <Bell size={20} />;
    }
  };

  // Get CSS Class Based on Notification Type
  const getTypeClass = (type) => {
    switch (type) {
      case "Auction":
        return "notification-icon notification-auction";

      case "Payment":
        return "notification-icon notification-payment";

      case "Seller":
        return "notification-icon notification-seller";

      case "Dispute":
        return "notification-icon notification-dispute";

      case "Order":
        return "notification-icon notification-order";

      default:
        return "notification-icon";
    }
  };

  // Search and Filter Notifications
  const filteredNotifications = notifications.filter((notification) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      notification.title.toLowerCase().includes(search) ||
      notification.message.toLowerCase().includes(search) ||
      notification.type.toLowerCase().includes(search);

    const matchesType =
      typeFilter === "All" || notification.type === typeFilter;

    const matchesRead =
      readFilter === "All" ||
      (readFilter === "Unread" && !notification.read) ||
      (readFilter === "Read" && notification.read);

    return matchesSearch && matchesType && matchesRead;
  });

  // Mark Notification as Read
  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification,
      ),
    );

    // Update the selected notification in the modal too
    setSelectedNotification((prev) =>
      prev && prev.id === notificationId ? { ...prev, read: true } : prev,
    );
  };

  // Mark Notification as Unread
  const markAsUnread = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: false }
          : notification,
      ),
    );

    setSelectedNotification((prev) =>
      prev && prev.id === notificationId ? { ...prev, read: false } : prev,
    );
  };

  // Mark All Notifications as Read
  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        read: true,
      })),
    );

    setSelectedNotification((prev) => (prev ? { ...prev, read: true } : prev));
  };

  // Delete Notification
  const deleteNotification = (notificationId) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId),
    );

    setSelectedNotification(null);
  };

  // Clear All Read Notifications
  const clearReadNotifications = () => {
    setNotifications((prev) =>
      prev.filter((notification) => !notification.read),
    );

    setSelectedNotification((prev) => (prev && prev.read ? null : prev));
  };

  // Format Date and Time
  const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="admin-page admin-notifications">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1>Notifications</h1>
          <p>
            Stay updated with important activities across the auction platform.
          </p>
        </div>

        <div className="admin-notification-header-actions">
          <button
            className="admin-btn admin-btn-secondary"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck size={18} />
            Mark All as Read
          </button>

          <button
            className="admin-btn admin-btn-danger"
            onClick={clearReadNotifications}
            disabled={readCount === 0}
          >
            <Trash2 size={18} />
            Clear Read
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <Bell size={22} />
          </div>

          <div>
            <p>Total Notifications</p>
            <h2>{notifications.length}</h2>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <AlertTriangle size={22} />
          </div>

          <div>
            <p>Unread Notifications</p>
            <h2>{unreadCount}</h2>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <CheckCircle size={22} />
          </div>

          <div>
            <p>Read Notifications</p>
            <h2>{readCount}</h2>
          </div>
        </div>
      </div>

      {/* Notification List */}
      <div className="admin-table-container">
        <div className="admin-table-header">
          <div>
            <h2>All Notifications</h2>
            <p>View and manage your notifications.</p>
          </div>

          <div className="admin-table-actions">
            {/* Search */}
            <div className="admin-search-box">
              <Search size={18} />

              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Type Filter */}
            <div className="admin-filter-box">
              <Filter size={17} />

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="All">All Types</option>
                <option value="Auction">Auction</option>
                <option value="Payment">Payment</option>
                <option value="Seller">Seller</option>
                <option value="Dispute">Dispute</option>
                <option value="Order">Order</option>
              </select>
            </div>

            {/* Read Status Filter */}
            <div className="admin-filter-box">
              <Filter size={17} />

              <select
                value={readFilter}
                onChange={(e) => setReadFilter(e.target.value)}
              >
                <option value="All">All Notifications</option>
                <option value="Unread">Unread</option>
                <option value="Read">Read</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Items */}
        <div className="admin-notification-list">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`admin-notification-item ${
                  !notification.read ? "unread" : ""
                }`}
              >
                {/* Type Icon */}
                <div className={getTypeClass(notification.type)}>
                  {getTypeIcon(notification.type)}
                </div>

                {/* Notification Content */}
                <div className="admin-notification-content">
                  <div className="admin-notification-title-row">
                    <h3>{notification.title}</h3>

                    {!notification.read && (
                      <span className="admin-notification-unread-dot" />
                    )}
                  </div>

                  <p>{notification.message}</p>

                  <div className="admin-notification-meta">
                    <span>{notification.type}</span>

                    <span>
                      <Clock size={14} />
                      {formatDate(notification.date)}
                    </span>
                  </div>
                </div>

                {/* Notification Actions */}
                <div className="admin-notification-actions">
                  {/* View Details */}
                  <button
                    className="admin-icon-btn"
                    title="View Details"
                    onClick={() => {
                      const updatedNotification = {
                        ...notification,
                        read: true,
                      };

                      setSelectedNotification(updatedNotification);
                      markAsRead(notification.id);
                    }}
                  >
                    <Eye size={18} />
                  </button>

                  {/* Mark as Read / Unread */}
                  <button
                    className="admin-icon-btn"
                    title={
                      notification.read ? "Mark as Unread" : "Mark as Read"
                    }
                    onClick={() =>
                      notification.read
                        ? markAsUnread(notification.id)
                        : markAsRead(notification.id)
                    }
                  >
                    {notification.read ? (
                      <Bell size={18} />
                    ) : (
                      <Check size={18} />
                    )}
                  </button>

                  {/* Delete */}
                  <button
                    className="admin-icon-btn admin-icon-danger"
                    title="Delete Notification"
                    onClick={() => deleteNotification(notification.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="admin-empty-state">No notifications found.</div>
          )}
        </div>

        {/* Footer */}
        <div className="admin-table-footer">
          <p>
            Showing {filteredNotifications.length} of {notifications.length}{" "}
            notifications
          </p>
        </div>
      </div>

      {/* Notification Details Modal */}
      {selectedNotification && (
        <div
          className="admin-modal-overlay"
          onClick={() => setSelectedNotification(null)}
        >
          <div
            className="admin-modal notification-details-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="admin-modal-header">
              <div>
                <h2>Notification Details</h2>
                <p>Notification #{selectedNotification.id}</p>
              </div>

              <button
                className="admin-icon-btn"
                title="Close"
                onClick={() => setSelectedNotification(null)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="admin-modal-body">
              <div className="admin-detail-section">
                <h3>{selectedNotification.title}</h3>

                <p className="admin-notification-detail-message">
                  {selectedNotification.message}
                </p>

                <div className="admin-detail-grid">
                  <div>
                    <span>Notification Type</span>
                    <strong>{selectedNotification.type}</strong>
                  </div>

                  <div>
                    <span>Date &amp; Time</span>
                    <strong>{formatDate(selectedNotification.date)}</strong>
                  </div>

                  <div>
                    <span>Read Status</span>
                    <strong>
                      {selectedNotification.read ? "Read" : "Unread"}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="admin-modal-footer">
              <button
                className="admin-btn admin-btn-secondary"
                onClick={() => setSelectedNotification(null)}
              >
                Close
              </button>

              <button
                className="admin-btn admin-btn-danger"
                onClick={() => deleteNotification(selectedNotification.id)}
              >
                <Trash2 size={18} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminNotification;
