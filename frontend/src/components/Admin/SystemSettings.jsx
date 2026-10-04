import {
  Archive,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  Database,
  Gavel,
  Globe,
  Hammer,
  IndianRupee,
  LockKeyhole,
  MailCheck,
  Save,
  Settings,
  Shield,
  ShieldCheck,
  Store,
  UserRound,
  Users,
  Wrench,
} from "lucide-react";
import { useState } from "react";

import "./SystemSettings.css";

const tabs = [
  "General Settings",
  "User Roles & Permissions",
  "Payment Settings",
  "Auction Settings",
  "Email & Notifications",
  "Security",
  "Backup & Logs",
];

const initialConfig = {
  userRegistration: true,
  sellerRegistration: true,
  emailVerification: true,
  kycVerification: true,
  autoAuctionApproval: false,
  maintenanceMode: false,
  twoFactor: true,
  passwordExpiry: true,
  loginAttemptLimit: true,
};

const initialForm = {
  platformName: "eAuction",
  description:
    "Online auction platform for physical items, digital assets, services and more.",
  supportEmail: "support@eauction.com",
  supportPhone: "+91 98765 43210",
  website: "https://www.eauction.com",
  primaryColor: "#059669",
  secondaryColor: "#2563EB",
  accentColor: "#F59E0B",
  theme: "Light Mode",
  itemsPerPage: "10",
  currency: "INR (₹)",
  timezone: "(GMT+05:30) India Standard Time",
  sessionTimeout: "30 minutes",
  allowedIPs: "",
};

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      className={`settings-toggle ${checked ? "is-on" : ""}`}
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      aria-label={label}
    >
      <span />
    </button>
  );
}

function SettingRow({ icon: Icon, title, description, checked, onChange }) {
  return (
    <div className="settings-row">
      <div className="settings-row-icon">
        <Icon size={17} />
      </div>

      <div className="settings-row-content">
        <span className="settings-row-title">{title}</span>
        <span className="settings-row-description">{description}</span>
      </div>

      <Toggle checked={checked} onChange={onChange} label={title} />
    </div>
  );
}

function SelectRow({ icon: Icon, title, value, onChange, options }) {
  return (
    <div className="settings-row settings-select-row">
      <div className="settings-row-icon">
        <Icon size={17} />
      </div>

      <div className="settings-row-content">
        <span className="settings-row-title">{title}</span>
      </div>

      <select value={value} onChange={onChange}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function SettingsCard({ title, children, className = "" }) {
  return (
    <section className={`settings-card ${className}`}>
      <div className="settings-card-header">
        <h3>{title}</h3>
      </div>
      <div className="settings-card-body">{children}</div>
    </section>
  );
}

function SummaryCard({ icon: Icon, label, value, description, color }) {
  return (
    <div className={`settings-summary-card ${color}`}>
      <div className="settings-summary-icon">
        <Icon size={24} />
      </div>

      <div className="settings-summary-content">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{description}</small>
      </div>
    </div>
  );
}

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState("General Settings");
  const [config, setConfig] = useState(initialConfig);
  const [form, setForm] = useState(initialForm);
  const [logo, setLogo] = useState(null);
  const [favicon, setFavicon] = useState(null);
  const [saved, setSaved] = useState(false);

  const updateConfig = (key) => {
    setConfig((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setSaved(false);
  };

  const updateForm = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
    setSaved(false);
  };

  const handleFileChange = (event, setter) => {
    const file = event.target.files?.[0];
    if (file) {
      setter(URL.createObjectURL(file));
      setSaved(false);
    }
  };

  const handleSave = (event) => {
    event.preventDefault();
    setSaved(true);
  };

  return (
    <div className="system-settings-page">
      {/* Page Header */}
      <div className="settings-page-header">
        <div>
          <h1>System Settings</h1>
          <p>
            Manage platform configurations, permissions, and system preferences.
          </p>
        </div>

        <div className="settings-date">
          <CalendarDays size={18} />
          <span>Fri, 11 Sep, 2026</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="settings-tabs-wrapper">
        <div className="settings-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`settings-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="settings-summary-grid">
        <SummaryCard
          icon={Settings}
          label="Platform Status"
          value="Active"
          description="All systems operational"
          color="green"
        />

        <SummaryCard
          icon={Users}
          label="Total Admin Users"
          value="5"
          description="Manage admin accounts"
          color="blue"
        />

        <SummaryCard
          icon={ShieldCheck}
          label="Security Level"
          value="High"
          description="2FA enabled"
          color="green"
        />

        <SummaryCard
          icon={Database}
          label="Last Backup"
          value="11 Sep, 2026"
          description="02:30 AM - Success"
          color="red"
        />
      </div>

      {/* Settings Content */}
      {activeTab === "General Settings" ? (
        <form onSubmit={handleSave}>
          <div className="settings-main-grid">
            {/* Platform Information */}
            <SettingsCard
              title="Platform Information"
              className="platform-information-card"
            >
              <div className="platform-information-layout">
                <div className="platform-form-fields">
                  <div className="settings-field">
                    <label>
                      Platform Name <span>*</span>
                    </label>
                    <input
                      type="text"
                      value={form.platformName}
                      onChange={(e) =>
                        updateForm("platformName", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="settings-field">
                    <label>Platform Description</label>
                    <textarea
                      rows="3"
                      value={form.description}
                      onChange={(e) =>
                        updateForm("description", e.target.value)
                      }
                    />
                  </div>

                  <div className="settings-field">
                    <label>
                      Support Email <span>*</span>
                    </label>
                    <input
                      type="email"
                      value={form.supportEmail}
                      onChange={(e) =>
                        updateForm("supportEmail", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="settings-field">
                    <label>Support Phone</label>
                    <input
                      type="tel"
                      value={form.supportPhone}
                      onChange={(e) =>
                        updateForm("supportPhone", e.target.value)
                      }
                    />
                  </div>

                  <div className="settings-field">
                    <label>Website URL</label>
                    <input
                      type="url"
                      value={form.website}
                      onChange={(e) => updateForm("website", e.target.value)}
                    />
                  </div>
                </div>

                {/* Logo Uploads */}
                <div className="settings-assets">
                  <div className="settings-asset-field">
                    <label>Platform Logo</label>

                    <div className="settings-logo-preview">
                      {logo ? (
                        <img src={logo} alt="Platform logo preview" />
                      ) : (
                        <Gavel size={42} />
                      )}
                    </div>

                    <label className="settings-upload-button">
                      Change Logo
                      <input
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={(e) => handleFileChange(e, setLogo)}
                      />
                    </label>

                    <small>PNG, JPG (Max 2MB)</small>
                  </div>

                  <div className="settings-asset-field">
                    <label>Favicon</label>

                    <div className="settings-favicon-preview">
                      {favicon ? (
                        <img src={favicon} alt="Favicon preview" />
                      ) : (
                        <Gavel size={27} />
                      )}
                    </div>

                    <label className="settings-upload-button">
                      Change Favicon
                      <input
                        type="file"
                        accept="image/png,image/x-icon,image/jpeg"
                        onChange={(e) => handleFileChange(e, setFavicon)}
                      />
                    </label>

                    <small>PNG, ICO (Max 1MB)</small>
                  </div>

                  <button type="submit" className="settings-save-button">
                    <Save size={15} />
                    Save Changes
                  </button>
                </div>
              </div>
            </SettingsCard>

            {/* System Configuration */}
            <SettingsCard title="System Configuration">
              <div className="settings-rows">
                <SettingRow
                  icon={UserRound}
                  title="User Registration"
                  description="Allow new users to register on the platform"
                  checked={config.userRegistration}
                  onChange={() => updateConfig("userRegistration")}
                />

                <SettingRow
                  icon={Store}
                  title="Seller Registration"
                  description="Allow new sellers to register and list products"
                  checked={config.sellerRegistration}
                  onChange={() => updateConfig("sellerRegistration")}
                />

                <SettingRow
                  icon={MailCheck}
                  title="Email Verification"
                  description="Require email verification for new accounts"
                  checked={config.emailVerification}
                  onChange={() => updateConfig("emailVerification")}
                />

                <SettingRow
                  icon={ShieldCheck}
                  title="KYC Verification"
                  description="Require KYC for sellers"
                  checked={config.kycVerification}
                  onChange={() => updateConfig("kycVerification")}
                />

                <SettingRow
                  icon={Hammer}
                  title="Auto Auction Approval"
                  description="Automatically approve auctions after verification"
                  checked={config.autoAuctionApproval}
                  onChange={() => updateConfig("autoAuctionApproval")}
                />

                <SettingRow
                  icon={Wrench}
                  title="Maintenance Mode"
                  description="Temporarily disable the platform for maintenance"
                  checked={config.maintenanceMode}
                  onChange={() => updateConfig("maintenanceMode")}
                />

                <SelectRow
                  icon={IndianRupee}
                  title="Default Currency"
                  value={form.currency}
                  onChange={(e) => updateForm("currency", e.target.value)}
                  options={["INR (₹)", "USD ($)", "EUR (€)", "GBP (£)"]}
                />

                <SelectRow
                  icon={Clock}
                  title="Default Time Zone"
                  value={form.timezone}
                  onChange={(e) => updateForm("timezone", e.target.value)}
                  options={[
                    "(GMT+05:30) India Standard Time",
                    "(GMT+00:00) UTC",
                    "(GMT-05:00) Eastern Time",
                    "(GMT+01:00) Central European Time",
                  ]}
                />
              </div>
            </SettingsCard>

            {/* Site Appearance */}
            <SettingsCard title="Site Appearance">
              <div className="settings-appearance-fields">
                <div className="settings-color-row">
                  <label>Primary Color</label>
                  <div className="settings-color-input">
                    <input
                      type="color"
                      value={form.primaryColor}
                      onChange={(e) =>
                        updateForm("primaryColor", e.target.value)
                      }
                    />
                    <span>{form.primaryColor.toUpperCase()}</span>
                  </div>
                </div>

                <div className="settings-color-row">
                  <label>Secondary Color</label>
                  <div className="settings-color-input">
                    <input
                      type="color"
                      value={form.secondaryColor}
                      onChange={(e) =>
                        updateForm("secondaryColor", e.target.value)
                      }
                    />
                    <span>{form.secondaryColor.toUpperCase()}</span>
                  </div>
                </div>

                <div className="settings-color-row">
                  <label>Accent Color</label>
                  <div className="settings-color-input">
                    <input
                      type="color"
                      value={form.accentColor}
                      onChange={(e) =>
                        updateForm("accentColor", e.target.value)
                      }
                    />
                    <span>{form.accentColor.toUpperCase()}</span>
                  </div>
                </div>

                <div className="settings-appearance-row">
                  <label>Dashboard Theme</label>
                  <select
                    value={form.theme}
                    onChange={(e) => updateForm("theme", e.target.value)}
                  >
                    <option>Light Mode</option>
                    <option>Dark Mode</option>
                    <option>System Default</option>
                  </select>
                </div>

                <div className="settings-appearance-row">
                  <label>Items Per Page</label>
                  <select
                    value={form.itemsPerPage}
                    onChange={(e) => updateForm("itemsPerPage", e.target.value)}
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>
              </div>
            </SettingsCard>

            {/* Security Settings */}
            <SettingsCard title="Security Settings">
              <div className="settings-rows">
                <SettingRow
                  icon={Shield}
                  title="Two-Factor Authentication (2FA)"
                  description="Enable 2FA for admin accounts"
                  checked={config.twoFactor}
                  onChange={() => updateConfig("twoFactor")}
                />

                <SettingRow
                  icon={LockKeyhole}
                  title="Password Expiry"
                  description="Require password change every 90 days"
                  checked={config.passwordExpiry}
                  onChange={() => updateConfig("passwordExpiry")}
                />

                <SettingRow
                  icon={Wrench}
                  title="Login Attempt Limit"
                  description="Block account after 5 failed attempts"
                  checked={config.loginAttemptLimit}
                  onChange={() => updateConfig("loginAttemptLimit")}
                />

                <SelectRow
                  icon={Clock}
                  title="Session Timeout"
                  value={form.sessionTimeout}
                  onChange={(e) => updateForm("sessionTimeout", e.target.value)}
                  options={[
                    "15 minutes",
                    "30 minutes",
                    "60 minutes",
                    "120 minutes",
                  ]}
                />

                <div className="settings-row settings-ip-row">
                  <div className="settings-row-icon">
                    <Globe size={17} />
                  </div>

                  <div className="settings-row-content">
                    <span className="settings-row-title">
                      Allowed IP Addresses
                    </span>
                    <span className="settings-row-description">
                      Restrict admin access to specific IP addresses
                    </span>
                  </div>

                  <input
                    type="text"
                    placeholder="Enter IP addresses (comma separated)"
                    value={form.allowedIPs}
                    onChange={(e) => updateForm("allowedIPs", e.target.value)}
                  />
                </div>
              </div>
            </SettingsCard>
          </div>

          <div className="settings-bottom-actions">
            {saved && (
              <span className="settings-saved-message">
                <CheckCircle2 size={16} />
                Settings saved successfully.
              </span>
            )}

            <button type="submit" className="settings-save-button">
              <Save size={16} />
              Save All Settings
            </button>
          </div>
        </form>
      ) : (
        <div className="settings-placeholder">
          <div className="settings-placeholder-icon">
            {activeTab === "User Roles & Permissions" && <Users size={28} />}
            {activeTab === "Payment Settings" && <CreditCard size={28} />}
            {activeTab === "Auction Settings" && <Gavel size={28} />}
            {activeTab === "Email & Notifications" && <Bell size={28} />}
            {activeTab === "Security" && <ShieldCheck size={28} />}
            {activeTab === "Backup & Logs" && <Archive size={28} />}
          </div>

          <h2>{activeTab}</h2>
          <p>Configure your platform's {activeTab.toLowerCase()} here.</p>

          <button
            type="button"
            className="settings-btn-outline"
            onClick={() => setActiveTab("General Settings")}
          >
            Back to General Settings
          </button>
        </div>
      )}
    </div>
  );
}
