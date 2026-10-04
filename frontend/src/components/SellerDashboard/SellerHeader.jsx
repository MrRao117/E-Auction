import { useEffect, useState } from "react";

import { getCurrentUser } from "../../api/user/userApi";
import Icon from "../Icon/Icon";

export default function SellerHeader({ onLogout }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userName, setUserName] = useState("Seller");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        if (user?.name) {
          setUserName(user.name);
        }

        if (user?.email) {
          setUserEmail(user.email);
        }
      })
      .catch(() => {
        setUserName("Seller");
        setUserEmail("");
      });
  }, []);

  const handleLogout = () => {
    setShowProfileMenu(false);

    if (onLogout) {
      onLogout();
    }
  };

  const userInitial = userName ? userName.charAt(0).toUpperCase() : "S";

  return (
    <header className="seller-header">
      {/* Logo */}
      <div className="seller-header-brand">
        <div className="seller-brand-mark">
          <Icon name="hammer" size={25} />
        </div>

        <div>
          <div className="seller-brand-name">
            <span>e</span>
            Auction
          </div>

          <div className="seller-brand-tag">Bid More, Win More</div>
        </div>
      </div>

      {/* Right Side */}
      <div className="seller-header-right">
        {/* Notifications */}
        <button
          type="button"
          className="seller-notification-btn"
          aria-label="Notifications"
        >
          <Icon name="bell" size={20} />

          <span className="seller-notification-count">3</span>
        </button>

        {/* Seller Profile */}
        <div className="seller-profile-wrapper">
          <button
            type="button"
            className="seller-profile-btn"
            onClick={() => setShowProfileMenu((previous) => !previous)}
            aria-label="Seller profile menu"
          >
            <span className="seller-profile-avatar">{userInitial}</span>

            <span className="seller-profile-details">
              <strong>{userName}</strong>

              {userEmail && <small>{userEmail}</small>}
            </span>

            <span className="seller-profile-arrow">
              {showProfileMenu ? "▲" : "▼"}
            </span>
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="seller-profile-menu">
              <button
                type="button"
                className="seller-profile-menu-item"
                onClick={() => setShowProfileMenu(false)}
              >
                <Icon name="settings" size={16} />
                <span>Account Settings</span>
              </button>

              <button
                type="button"
                className="seller-profile-menu-item seller-logout-item"
                onClick={handleLogout}
              >
                <Icon name="logout" size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
