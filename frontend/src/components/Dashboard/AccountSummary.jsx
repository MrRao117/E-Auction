import { useEffect, useState } from "react";

import { getCurrentUser } from "../../api/user/userApi";

function AccountSummary() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getCurrentUser();

        setUser(data);
      } catch (err) {
        console.error("Failed to fetch account details:", err);

        setError("Unable to load account details.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  return (
    <div className="dashboard-card account-card">
      {/* =========================
          HEADER
      ========================= */}

      <div className="card-header">
        <h2>Account Details</h2>

        <button type="button" className="edit-profile-button">
          Edit Profile
        </button>
      </div>

      {/* =========================
          ACCOUNT DETAILS
      ========================= */}

      {loading ? (
        <div className="account-loading">Loading account details...</div>
      ) : error ? (
        <div className="account-error">{error}</div>
      ) : user ? (
        <div className="account-row">
          {/* FULL NAME */}

          <div className="account-item">
            <span>Full Name</span>

            <strong>{user.name || "Not available"}</strong>
          </div>

          {/* EMAIL */}

          <div className="account-item">
            <span>Email Address</span>

            <strong>{user.email || "Not available"}</strong>
          </div>

          {/* DATE OF BIRTH */}

          <div className="account-item">
            <span>Date of Birth</span>

            <strong>{user.dob || "Not available"}</strong>
          </div>

          {/* GENDER */}

          <div className="account-item">
            <span>Gender</span>

            <strong>{user.gender || "Not available"}</strong>
          </div>

          {/* PHONE */}

          <div className="account-item">
            <span>Phone Number</span>

            <strong>{user.mobileNo || "Not available"}</strong>
          </div>

          {/* VERIFICATION */}

          <div className="account-item">
            <span>Account Status</span>

            <strong>{user.isVerified ? "Verified" : "Not Verified"}</strong>
          </div>
        </div>
      ) : (
        <div className="account-error">No account details found.</div>
      )}
    </div>
  );
}

export default AccountSummary;
