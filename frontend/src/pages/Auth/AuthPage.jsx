import { useEffect, useState } from "react";

import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Gavel,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
  UserRoundPlus,
} from "lucide-react";

import LoginForm from "../../components/Auth/LoginForm";
import RegisterForm from "../../components/Auth/RegisterForm";

import "./AuthPage.css";

export default function AuthPage({ onClose, onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState("login");

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  /*
   * =========================
   * LOGIN SUCCESS
   * =========================
   *
   * LoginForm sends:
   *
   * buyer  -> Buyer Dashboard
   * seller -> Seller Dashboard
   *
   * The selected login type is
   * passed to App.jsx.
   */

  const handleLoginSuccess = (loginType) => {
    if (onLoginSuccess) {
      onLoginSuccess(loginType);
    }
  };

  return (
    <div className="auth-overlay" onMouseDown={handleOverlayClick}>
      <div className="auth-modal">
        {/* =========================
            BACK BUTTON
        ========================= */}

        <button type="button" className="auth-back-button" onClick={onClose}>
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        {/* =========================
            LEFT SIDE
        ========================= */}

        <section className="auth-visual">
          <div className="visual-decoration decoration-one" />
          <div className="visual-decoration decoration-two" />

          <div className="visual-inner">
            {/* BRAND */}

            <div className="visual-brand">
              <div className="visual-brand-icon">
                <Gavel size={17} />
              </div>

              <span>
                e<span>Auction</span>
              </span>
            </div>

            {/* =========================
                LOGIN LEFT SIDE
            ========================= */}

            {activeTab === "login" ? (
              <>
                <div className="visual-heading">
                  Welcome
                  <br />
                  back.
                </div>

                <p className="visual-description">
                  Your next winning bid
                  <br />
                  could be just a click away.
                </p>

                {/* LAPTOP */}

                <div className="laptop-scene">
                  <div className="floating-icon floating-shield">
                    <ShieldCheck size={22} />
                  </div>

                  <div className="floating-icon floating-sparkle">
                    <Sparkles size={18} />
                  </div>

                  <div className="laptop">
                    <div className="laptop-screen">
                      <div className="screen-top">
                        <span />
                        <span />
                        <span />
                      </div>

                      <div className="screen-content">
                        <div className="screen-avatar">
                          <Gavel size={20} />
                        </div>

                        <div className="screen-line large" />

                        <div className="screen-line medium" />

                        <div className="screen-cards">
                          <div />
                          <div />
                          <div />
                        </div>

                        <div className="screen-button" />
                      </div>
                    </div>

                    <div className="laptop-base">
                      <div />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* =========================
                 REGISTER LEFT SIDE
              ========================= */

              <>
                <div className="visual-heading">
                  Start
                  <br />
                  bidding.
                </div>

                <p className="visual-description">
                  Create your account and
                  <br />
                  discover exciting auctions.
                </p>

                {/* REGISTER ILLUSTRATION */}

                <div className="register-scene">
                  <div className="register-circle" />

                  <div className="registration-card">
                    <div className="registration-card-header">
                      <div className="registration-card-icon">
                        <UserRoundPlus size={21} />
                      </div>

                      <div className="registration-card-title">
                        <div className="registration-title-line" />

                        <div className="registration-title-line short" />
                      </div>
                    </div>

                    {/* NAME */}

                    <div className="registration-field">
                      <UserRound size={12} />
                      <span />
                    </div>

                    {/* EMAIL */}

                    <div className="registration-field">
                      <Mail size={12} />
                      <span />
                    </div>

                    {/* SECURITY */}

                    <div className="registration-field">
                      <ShieldCheck size={12} />
                      <span />
                    </div>

                    {/* CREATE ACCOUNT */}

                    <div className="registration-submit">
                      <CheckCircle2 size={12} />
                      Create account
                    </div>
                  </div>

                  {/* VERIFICATION */}

                  <div className="registration-badge">
                    <BadgeCheck size={22} />
                  </div>

                  {/* SPARKLE */}

                  <div className="registration-sparkle">
                    <Sparkles size={17} />
                  </div>

                  {/* USER */}

                  <div className="registration-user">
                    <UserRoundPlus size={17} />
                  </div>
                </div>
              </>
            )}

            {/* SECURITY */}

            <div className="visual-security">
              <ShieldCheck size={14} />

              <span>Secure &amp; trusted platform</span>
            </div>
          </div>
        </section>

        {/* =========================
            RIGHT SIDE
        ========================= */}

        <section className="auth-content">
          {/* LOGIN / REGISTER TABS */}

          <div className="auth-tabs">
            <button
              type="button"
              className={activeTab === "login" ? "auth-tab active" : "auth-tab"}
              onClick={() => setActiveTab("login")}
            >
              Login
            </button>

            <button
              type="button"
              className={
                activeTab === "register" ? "auth-tab active" : "auth-tab"
              }
              onClick={() => setActiveTab("register")}
            >
              Register
            </button>
          </div>

          {/* =========================
              FORM
          ========================= */}

          <div className="auth-form-wrapper">
            {activeTab === "login" ? (
              <LoginForm
                setActiveTab={setActiveTab}
                onLoginSuccess={handleLoginSuccess}
              />
            ) : (
              <RegisterForm setActiveTab={setActiveTab} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
