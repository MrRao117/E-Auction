import { useState } from "react";

const messages = [
  {
    id: 1,
    sender: "Luxury Timepieces",
    message: "Regarding your bid on Rolex Submariner Date",
    time: "10:30 AM",
  },
  {
    id: 2,
    sender: "Art Gallery",
    message: "Your invoice for painting",
    time: "Yesterday",
  },
  {
    id: 3,
    sender: "Support Team",
    message: "Your query has been resolved",
    time: "2 May",
  },
  {
    id: 4,
    sender: "House Of Collectibles",
    message: "Shipping confirmation",
    time: "1 May",
  },
  {
    id: 5,
    sender: "Admin",
    message: "Important update",
    time: "28 Apr",
  },
];

const notifications = [
  {
    id: 101,
    title: "Your bid was successful",
    message: "You are currently the highest bidder.",
    time: "5 min ago",
    icon: "✓",
  },
  {
    id: 102,
    title: "Auction ending soon",
    message: "Modern 3BHK Villa ends in 1 hour.",
    time: "1 hour ago",
    icon: "⚡",
  },
  {
    id: 103,
    title: "Order shipped",
    message: "Your Diamond Necklace has been shipped.",
    time: "Yesterday",
    icon: "✓",
  },
  {
    id: 104,
    title: "New auction available",
    message: "A new Electronics auction matches your interests.",
    time: "2 days ago",
    icon: "🔔",
  },
];

function Messages({ mode = "overview" }) {
  const [activeTab, setActiveTab] = useState("all");

  const [messageItems, setMessageItems] = useState(
    messages.map((message) => ({
      ...message,
      unread: true,
    })),
  );

  const [notificationItems, setNotificationItems] = useState(
    notifications.map((notification) => ({
      ...notification,
      unread: true,
    })),
  );

  /*
   * OVERVIEW MODE
   * Keeps your existing compact Messages interface.
   */
  if (mode === "overview") {
    return (
      <div className="dashboard-card" id="messages">
        <div className="card-header">
          <h2>Messages</h2>
          <a href="#messages">View All →</a>
        </div>

        <div className="messages-list">
          {messages.map((message) => (
            <div className="message-item" key={message.id}>
              <div className="message-avatar">{message.sender.charAt(0)}</div>

              <div className="message-content">
                <strong>{message.sender}</strong>
                <p>{message.message}</p>
              </div>

              <small>{message.time}</small>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /*
   * FULL MESSAGES + NOTIFICATIONS MODE
   */
  const unreadMessages = messageItems.filter(
    (message) => message.unread,
  ).length;

  const unreadNotifications = notificationItems.filter(
    (notification) => notification.unread,
  ).length;

  const totalUnread = unreadMessages + unreadNotifications;

  const allItems = [
    ...messageItems.map((message) => ({
      id: `message-${message.id}`,
      type: "message",
      sender: message.sender,
      title: message.message,
      time: message.time,
      unread: message.unread,
      avatar: message.sender.charAt(0),
    })),

    ...notificationItems.map((notification) => ({
      id: `notification-${notification.id}`,
      type: "notification",
      sender: notification.title,
      title: notification.message,
      time: notification.time,
      unread: notification.unread,
      icon: notification.icon,
    })),
  ];

  let filteredItems = allItems;

  if (activeTab === "message") {
    filteredItems = allItems.filter((item) => item.type === "message");
  }

  if (activeTab === "notification") {
    filteredItems = allItems.filter((item) => item.type === "notification");
  }

  const handleMarkAllRead = () => {
    setMessageItems((currentItems) =>
      currentItems.map((item) => ({
        ...item,
        unread: false,
      })),
    );

    setNotificationItems((currentItems) =>
      currentItems.map((item) => ({
        ...item,
        unread: false,
      })),
    );
  };

  return (
    <div className="messages-full-page">
      <section className="dashboard-card messages-full-card">
        <div className="messages-full-header">
          <div>
            <div className="messages-full-title-row">
              <h2>Messages & Notifications</h2>

              {totalUnread > 0 && (
                <span className="messages-full-unread-count">
                  {totalUnread}
                </span>
              )}
            </div>

            <p>Stay updated with your conversations and auction activity.</p>
          </div>

          <button
            type="button"
            className="messages-full-mark-read"
            onClick={handleMarkAllRead}
          >
            Mark all read
          </button>
        </div>

        <div className="messages-full-tabs">
          <button
            type="button"
            className={activeTab === "all" ? "active" : ""}
            onClick={() => setActiveTab("all")}
          >
            All
          </button>

          <button
            type="button"
            className={activeTab === "message" ? "active" : ""}
            onClick={() => setActiveTab("message")}
          >
            Messages
            {unreadMessages > 0 && <span>{unreadMessages}</span>}
          </button>

          <button
            type="button"
            className={activeTab === "notification" ? "active" : ""}
            onClick={() => setActiveTab("notification")}
          >
            Notifications
            {unreadNotifications > 0 && <span>{unreadNotifications}</span>}
          </button>
        </div>

        <div className="messages-full-list">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div
                className={`messages-full-item ${item.unread ? "unread" : ""}`}
                key={item.id}
              >
                <div
                  className={`messages-full-icon ${
                    item.type === "message"
                      ? "message-full-icon"
                      : "notification-full-icon"
                  }`}
                >
                  {item.type === "message" ? (
                    <span>{item.avatar}</span>
                  ) : (
                    <span>{item.icon}</span>
                  )}
                </div>

                <div className="messages-full-content">
                  <div className="messages-full-item-top">
                    <strong>{item.sender}</strong>

                    <small>{item.time}</small>
                  </div>

                  <p>{item.title}</p>
                </div>

                {item.unread && (
                  <span
                    className="messages-full-unread-dot"
                    aria-label="Unread"
                  />
                )}
              </div>
            ))
          ) : (
            <div className="messages-full-empty">
              <div>✓</div>
              <strong>You're all caught up</strong>
              <p>No new messages or notifications.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Messages;
