import { useState } from "react";

function Messages({ mode = "overview" }) {
  const [activeTab, setActiveTab] = useState("all");

  // No static messages or notifications.
  const [messageItems, setMessageItems] = useState([]);
  const [notificationItems, setNotificationItems] = useState([]);

  /*
   * OVERVIEW MODE
   */
  if (mode === "overview") {
    return (
      <div className="dashboard-card" id="messages">
        <div className="card-header">
          <h2>Messages</h2>
          <a href="#messages">View All →</a>
        </div>

        <div className="messages-list">
          {messageItems.length > 0 ? (
            messageItems.map((message) => (
              <div className="message-item" key={message.id}>
                <div className="message-avatar">
                  {message.sender?.charAt(0) || "?"}
                </div>

                <div className="message-content">
                  <strong>{message.sender}</strong>
                  <p>{message.message}</p>
                </div>

                <small>{message.time}</small>
              </div>
            ))
          ) : (
            <p>No messages found.</p>
          )}
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

  const allItems = [
    ...messageItems.map((message) => ({
      id: `message-${message.id}`,
      type: "message",
      sender: message.sender,
      title: message.message,
      time: message.time,
      unread: message.unread,
      avatar: message.sender?.charAt(0) || "?",
    })),

    ...notificationItems.map((notification) => ({
      id: `notification-${notification.id}`,
      type: "notification",
      sender: notification.title,
      title: notification.message,
      time: notification.time,
      unread: notification.unread,
      icon: notification.icon || "🔔",
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

  const hasItems = messageItems.length > 0 || notificationItems.length > 0;

  return (
    <div className="messages-full-page">
      <section className="dashboard-card messages-full-card">
        <div className="messages-full-header">
          <div>
            <div className="messages-full-title-row">
              <h2>Messages &amp; Notifications</h2>
            </div>

            <p>Stay updated with your conversations and auction activity.</p>
          </div>

          {hasItems && (
            <button
              type="button"
              className="messages-full-mark-read"
              onClick={handleMarkAllRead}
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="messages-full-tabs">
          <button
            type="button"
            className={activeTab === "all" ? "active" : ""}
            onClick={() => setActiveTab("all")}
          >
            All <span>{allItems.length}</span>
          </button>

          <button
            type="button"
            className={activeTab === "message" ? "active" : ""}
            onClick={() => setActiveTab("message")}
          >
            Messages <span>{messageItems.length}</span>
          </button>

          <button
            type="button"
            className={activeTab === "notification" ? "active" : ""}
            onClick={() => setActiveTab("notification")}
          >
            Notifications <span>{notificationItems.length}</span>
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
                  <span>
                    {item.type === "message" ? item.avatar : item.icon}
                  </span>
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
