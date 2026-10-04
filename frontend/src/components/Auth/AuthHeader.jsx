import { ArrowLeft } from "lucide-react";

import "./AuthHeader.css";

export default function AuthHeader({ activeTab, setActiveTab, onClose }) {
  return (
    <div className="auth-header">
      {/* ==========================================
                BACK BUTTON
            ========================================== */}

      <button
        type="button"
        className="auth-back-button"
        onClick={onClose}
        aria-label="Go back"
      >
        <ArrowLeft size={17} />

        <span>Back</span>
      </button>

      {/* ==========================================
                LOGIN / REGISTER TABS
            ========================================== */}

      <div className="auth-tabs">
        {/* LOGIN */}

        <button
          type="button"
          className={`auth-tab ${activeTab === "login" ? "active" : ""}`}
          onClick={() => setActiveTab("login")}
        >
          Login
        </button>

        {/* REGISTER */}

        <button
          type="button"
          className={`auth-tab ${activeTab === "register" ? "active" : ""}`}
          onClick={() => setActiveTab("register")}
        >
          Register
        </button>
      </div>
    </div>
  );
}
