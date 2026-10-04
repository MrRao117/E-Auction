import { useEffect, useState } from "react";

import { getProductCategories } from "../../api/product/productApi";
import { getCurrentUser } from "../../api/user/userApi";

import Icon from "../Icon/Icon";

import "./Header.css";

export default function Header({
  onLogin,
  onLogout,
  onDashboard,
  onSellerDashboard,
  canAccessSellerDashboard = false,
  onAdminDashboard,
  isAdmin = false,
  dashboardMode = false,
  sellerDashboardMode = false,
  onSellerVerified,
  onBecomeSeller,
  isSeller = false,
  isLoggedIn = false,
  user,
  onHome,
  onViewAllAuctions,
  onHowItWorks,
  activeLink = "",
  onActiveLinkChange,
}) {
  const [location, setLocation] = useState({
    code: "--",
    name: "Locating...",
    flag: "",
  });

  const [showCategories, setShowCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  // Categories will come from the backend API.
  // Only categoryName is used.
  const [categories, setCategories] = useState(["All Categories"]);

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [userName, setUserName] = useState("User");

  // ==========================================
  // GET PRODUCT CATEGORIES
  // ==========================================

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getProductCategories();

        if (!Array.isArray(data)) {
          setCategories(["All Categories"]);
          return;
        }

        /*
         * Backend response:
         *
         * [
         *   {
         *     categoryId: 1,
         *     categoryName: "Electronics"
         *   },
         *   {
         *     categoryId: 2,
         *     categoryName: "Vehicles"
         *   }
         * ]
         *
         * Only categoryName is required in Header.
         */

        const categoryNames = data
          .map((category) => category.categoryName)
          .filter((categoryName) => categoryName);

        setCategories(["All Categories", ...categoryNames]);
      } catch (error) {
        console.error("Failed to load product categories:", error);

        setCategories(["All Categories"]);
      }
    };

    loadCategories();
  }, []);

  // ==========================================
  // GET LOGGED-IN USER
  // ==========================================

  useEffect(() => {
    // First use the user already stored in Redux.
    if (user?.name) {
      setUserName(user.name);
      return;
    }

    // If Redux does not contain the name,
    // get it from the backend.
    if (!isLoggedIn && !dashboardMode) {
      setUserName("User");
      return;
    }

    getCurrentUser()
      .then((currentUser) => {
        if (currentUser?.name) {
          setUserName(currentUser.name);
        }
      })
      .catch(() => {
        setUserName("User");
      });
  }, [user, isLoggedIn, dashboardMode]);

  // ==========================================
  // GET USER LOCATION
  // ==========================================

  useEffect(() => {
    const savedLocation = sessionStorage.getItem("eAuctionLocation");

    if (savedLocation) {
      try {
        const parsedLocation = JSON.parse(savedLocation);

        if (parsedLocation?.code && parsedLocation?.name) {
          setLocation(parsedLocation);
          return;
        }
      } catch {
        sessionStorage.removeItem("eAuctionLocation");
      }
    }

    fetch("https://ipapi.co/json/")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Location request failed");
        }

        return response.json();
      })
      .then((data) => {
        if (data.country_code && data.country_name) {
          const countryCode = data.country_code.toLowerCase();

          const detectedLocation = {
            code: data.country_code,
            name: data.country_name,
            flag: `https://flagcdn.com/w40/${countryCode}.png`,
          };

          setLocation(detectedLocation);

          sessionStorage.setItem(
            "eAuctionLocation",
            JSON.stringify(detectedLocation),
          );
        }
      })
      .catch(() => {
        // Keep "Locating..." instead of showing "Unknown".
      });
  }, []);

  // ==========================================
  // CATEGORY SELECT
  // ==========================================

  const handleCategorySelect = (category) => {
    if (category === "All Categories") {
      setSelectedCategory("");
    } else {
      setSelectedCategory(category);
    }

    setShowCategories(false);
  };

  // ==========================================
  // NAVIGATION
  // ==========================================

  const handleNavClick = (event, link) => {
    event.preventDefault();

    // Tell App.jsx which navigation item is active.
    if (onActiveLinkChange) {
      onActiveLinkChange(link);
    }

    // ==========================================
    // HOME
    // ==========================================

    if (link === "Home") {
      if (onHome) {
        onHome();
      }

      return;
    }

    // ==========================================
    // AUCTIONS
    // ==========================================

    if (link === "Auctions") {
      if (onViewAllAuctions) {
        onViewAllAuctions();
      }

      return;
    }

    // ==========================================
    // HOW IT WORKS
    // ==========================================

    if (link === "How It Works") {
      if (onHowItWorks) {
        onHowItWorks();
      }

      return;
    }

    // ==========================================
    // FAQ & SUPPORT
    // ==========================================

    if (link === "FAQ & Support") {
      return;
    }
  };

  // ==========================================
  // PROFILE MENU
  // ==========================================

  const handleProfileClick = () => {
    setShowProfileMenu((previous) => !previous);
  };

  // ==========================================
  // BUYER DASHBOARD
  // ==========================================

  const handleDashboard = () => {
    setShowProfileMenu(false);

    if (onDashboard) {
      onDashboard();
    }
  };

  // ==========================================
  // SELLER DASHBOARD
  // ==========================================

  const handleSellerDashboard = () => {
    setShowProfileMenu(false);

    if (onSellerDashboard) {
      onSellerDashboard();
    }
  };

  // ==========================================
  // ADMIN DASHBOARD
  // ==========================================

  const handleAdminDashboard = () => {
    setShowProfileMenu(false);

    if (onAdminDashboard) {
      onAdminDashboard();
    }
  };

  // ==========================================
  // ACCOUNT SETTINGS
  // ==========================================

  const handleAccountSettings = () => {
    setShowProfileMenu(false);
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    setShowProfileMenu(false);

    if (onLogout) {
      onLogout();
    }
  };

  // ==========================================
  // USER INITIAL
  // ==========================================

  const userInitial = userName ? userName.charAt(0).toUpperCase() : "U";

  // ==========================================
  // BECOME A SELLER
  // ==========================================

  const handleBecomeSeller = () => {
    if (onBecomeSeller) {
      onBecomeSeller();
    }
  };

  return (
    <header
      className={`header page-container ${
        dashboardMode ? "dashboard-header-fixed" : ""
      }`}
    >
      {/* ========================================
          BRAND
      ======================================== */}

      <a
        href="/"
        className="brand"
        onClick={(event) => handleNavClick(event, "Home")}
      >
        <div className="brand-mark">
          <Icon name="hammer" size={25} />
        </div>

        <div>
          <div className="brand-name">
            <span>e</span>
            Auction
          </div>

          <div className="brand-tag">Bid More, Win More</div>
        </div>
      </a>

      {/* ========================================
          SEARCH
      ======================================== */}

      <div className="search-wrap">
        <div className="category-wrapper">
          <button
            className="menu-circle"
            aria-label="Categories"
            type="button"
            onClick={() => setShowCategories(!showCategories)}
          >
            <Icon name="menu" size={18} />
          </button>

          {showCategories && (
            <div className="category-menu">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`category-option ${
                    selectedCategory === category ? "selected" : ""
                  }`}
                  onClick={() => handleCategorySelect(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder={
              selectedCategory
                ? `Search Products of ${selectedCategory}`
                : "Search Auctions Here"
            }
            aria-label="Search auctions"
          />

          <button aria-label="Search" type="button">
            <Icon name="search" size={19} />
          </button>
        </div>
      </div>

      {/* ========================================
          LOCATION
      ======================================== */}

      <div className="location-wrapper">
        <div className="location-display">
          <div className="location-info">
            <span className="location-code">{location.code}</span>

            <span className="location-name">{location.name}</span>
          </div>

          {location.flag && (
            <img
              src={location.flag}
              alt={`${location.name} flag`}
              className="location-flag"
            />
          )}
        </div>
      </div>

      {/* ========================================
          HOMEPAGE NAVIGATION
      ======================================== */}

      <nav className="nav-links">
        <a
          href="/"
          className={`nav-link ${activeLink === "Home" ? "active" : ""}`}
          onClick={(event) => handleNavClick(event, "Home")}
        >
          Home
        </a>

        <a
          href="/auctions"
          className={`nav-link ${activeLink === "Auctions" ? "active" : ""}`}
          onClick={(event) => handleNavClick(event, "Auctions")}
        >
          Auctions
        </a>

        <a
          href="/how-it-works"
          className={`nav-link ${
            activeLink === "How It Works" ? "active" : ""
          }`}
          onClick={(event) => handleNavClick(event, "How It Works")}
        >
          How It Works
        </a>

        <a
          href="/support"
          className={`nav-link ${
            activeLink === "FAQ & Support" ? "active" : ""
          }`}
          onClick={(event) => handleNavClick(event, "FAQ & Support")}
        >
          FAQ &amp; Support
        </a>
      </nav>

      {/* ========================================
          LOGIN BUTTON
      ======================================== */}

      {!isLoggedIn && !dashboardMode && (
        <button className="login-btn" type="button" onClick={onLogin}>
          SignUp/Login
        </button>
      )}

      {/* ========================================
          PROFILE
      ======================================== */}

      {(isLoggedIn || dashboardMode) && (
        <div className="profile-wrapper">
          <button
            className="profile-btn"
            type="button"
            onClick={handleProfileClick}
            aria-label="Profile menu"
          >
            <span className="profile-avatar">{userInitial}</span>

            <span className="profile-name">{userName}</span>

            <span className="profile-arrow">{showProfileMenu ? "▲" : "▼"}</span>
          </button>

          {showProfileMenu && (
            <div className="profile-menu">
              {/* ADMIN DASHBOARD */}
              {isAdmin && (
                <button
                  type="button"
                  className="profile-menu-item"
                  onClick={handleAdminDashboard}
                >
                  Admin Dashboard
                </button>
              )}

              {/* SELLER DASHBOARD */}
              {!isAdmin && sellerDashboardMode && (
                <button
                  type="button"
                  className="profile-menu-item"
                  onClick={handleDashboard}
                >
                  Buyer Dashboard
                </button>
              )}

              {/* SELLER DASHBOARD: shown to users with seller access */}
              {!isAdmin &&
                dashboardMode &&
                !sellerDashboardMode &&
                canAccessSellerDashboard && (
                  <button
                    type="button"
                    className="profile-menu-item"
                    onClick={handleSellerDashboard}
                  >
                    Seller Dashboard
                  </button>
                )}

              {/* NORMAL HOME / ALL AUCTIONS */}
              {!isAdmin && !sellerDashboardMode && !dashboardMode && (
                <button
                  type="button"
                  className="profile-menu-item"
                  onClick={handleDashboard}
                >
                  Dashboard
                </button>
              )}

              {/* ACCOUNT SETTINGS */}
              <button
                type="button"
                className="profile-menu-item"
                onClick={handleAccountSettings}
              >
                Account Settings
              </button>

              {/* LOGOUT */}
              <button
                type="button"
                className="profile-menu-item logout-item"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
