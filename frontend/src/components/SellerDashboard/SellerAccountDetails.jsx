import { useEffect, useState } from "react";

import { getCurrentUser } from "../../api/user/userApi";
import Icon from "../Icon/Icon";

export default function SellerAccountDetails() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getCurrentUser();
        setUser(data);
      } catch (error) {
        console.error("Failed to fetch account details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatGender = (gender) => {
    if (!gender) {
      return "Not available";
    }

    return gender
      .toString()
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  if (loading) {
    return (
      <div className="seller-account-card">
        <div className="seller-section-heading">
          <div>
            <span className="seller-section-label">ACCOUNT</span>
            <h2>Account Details</h2>
          </div>
        </div>

        <div className="seller-account-loading">Loading account details...</div>
      </div>
    );
  }

  return (
    <div className="seller-account-card">
      {/* Section Heading */}
      <div className="seller-section-heading">
        <div>
          <span className="seller-section-label">ACCOUNT</span>

          <h2>Account Details</h2>
        </div>

        <div className="seller-account-status">
          <span
            className={
              user?.isVerified
                ? "seller-status-dot verified"
                : "seller-status-dot pending"
            }
          />

          <span>
            {user?.isVerified ? "Verified Account" : "Verification Pending"}
          </span>
        </div>
      </div>

      {/* Account Information */}
      <div className="seller-account-details-grid">
        <div className="seller-account-detail">
          <div className="seller-detail-icon">
            <Icon name="user" size={18} />
          </div>

          <div>
            <span>Name</span>
            <strong>{user?.name || "Not available"}</strong>
          </div>
        </div>

        <div className="seller-account-detail">
          <div className="seller-detail-icon">
            <Icon name="mail" size={18} />
          </div>

          <div>
            <span>Email</span>
            <strong>{user?.email || "Not available"}</strong>
          </div>
        </div>

        <div className="seller-account-detail">
          <div className="seller-detail-icon">
            <Icon name="phone" size={18} />
          </div>

          <div>
            <span>Mobile Number</span>
            <strong>{user?.mobileNo || "Not available"}</strong>
          </div>
        </div>

        <div className="seller-account-detail">
          <div className="seller-detail-icon">
            <Icon name="calendar" size={18} />
          </div>

          <div>
            <span>Date of Birth</span>
            <strong>{formatDate(user?.dob)}</strong>
          </div>
        </div>

        <div className="seller-account-detail">
          <div className="seller-detail-icon">
            <Icon name="user" size={18} />
          </div>

          <div>
            <span>Gender</span>
            <strong>{formatGender(user?.gender)}</strong>
          </div>
        </div>

        <div className="seller-account-detail">
          <div className="seller-detail-icon">
            <Icon name="shield" size={18} />
          </div>

          <div>
            <span>Account Status</span>

            <strong
              className={
                user?.isVerified
                  ? "seller-account-verified"
                  : "seller-account-pending"
              }
            >
              {user?.isVerified ? "Verified" : "Pending Verification"}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
