import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import AdminDashboard from "./pages/Admin/AdminDashboard";
import AllAuction from "./pages/AllAuctions/AllAuction";
import AuthPage from "./pages/Auth/AuthPage";
import Dashboard from "./pages/Dashboard/Dashboard";
import Home from "./pages/Home/Home";
import LiveAuction from "./pages/LiveAuction/LiveAuction";
import ProductDetails from "./pages/ProductDetails/ProductDetails";
import SellerDashboard from "./pages/SellerDashboard/SellerDashboard";

import Header from "./components/Header/Header";
import { logout } from "./redux/slices/authSlice";

//
// ROLE HELPER
//

const normalizeRole = (role) => {
  if (!role) return "";

  return String(role)
    .trim()
    .toLowerCase()
    .replace(/^role_/, "");
};

//
// MAIN APP
//

export default function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [selectedProduct, setSelectedProduct] = useState(
    location.state?.product || null,
  );

  const [isSeller, setIsSeller] = useState(
    localStorage.getItem("isSeller") === "true",
  );

  const [activeNav, setActiveNav] = useState("Home");

  const [loginType, setLoginType] = useState(() =>
    normalizeRole(localStorage.getItem("loginType")),
  );

  //
  // CURRENT LOGIN TYPE
  //

  const isAdmin = isAuthenticated && loginType === "admin";

  //
  // NAVIGATION HELPER
  //

  const goTo = (path, options = {}) => {
    navigate(path, options);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  //
  // AUTHENTICATION
  //

  const handleOpenAuth = () => {
    goTo("/auth");
  };

  const handleCloseAuth = () => {
    if (location.state?.backgroundLocation) {
      navigate(-1);
    } else {
      goTo("/");
    }
  };

  //
  // LOGIN SUCCESS
  //

  const handleLoginSuccess = (role) => {
    const selectedRole = normalizeRole(role);

    if (!selectedRole) {
      console.error("Login failed: No valid login type was received.");
      return;
    }

    localStorage.setItem("loginType", selectedRole);
    setLoginType(selectedRole);
    setActiveNav("");

    if (selectedRole === "admin") {
      goTo("/admin");
      return;
    }

    if (selectedRole === "buyer") {
      goTo("/dashboard");
      return;
    }

    if (selectedRole === "seller") {
      goTo("/seller-dashboard");
      return;
    }

    console.error("Unsupported login type:", selectedRole);
  };

  //
  // SELLER VERIFICATION SUCCESS
  //

  const handleSellerVerificationSuccess = () => {
    setIsSeller(true);
    localStorage.setItem("isSeller", "true");

    setActiveNav("Home");
    goTo("/auth");
  };

  //
  // LOGOUT
  //

  const handleLogout = () => {
    dispatch(logout());

    localStorage.removeItem("loginType");
    localStorage.removeItem("isSeller");
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setLoginType("");
    setIsSeller(false);
    setSelectedProduct(null);
    setActiveNav("Home");

    goTo("/");
  };

  //
  // VIEW ALL AUCTIONS
  //

  const handleViewAllAuctions = () => {
    setActiveNav("Auctions");
    goTo("/auctions");
  };

  //
  // PRODUCT DETAILS
  //

  const handleProductDetails = (product) => {
    if (!product) return;

    const productId = product.productId ?? product.id ?? product.auctionId;

    if (productId == null) {
      console.error(
        "Cannot open product details: product ID is missing.",
        product,
      );
      return;
    }

    setSelectedProduct(product);
    setActiveNav("");

    goTo(`/product/${productId}`, {
      state: { product },
    });
  };

  //
  // LIVE AUCTION
  //

  const handleLiveAuction = (auction = selectedProduct) => {
    if (!auction) {
      console.error("Cannot open live auction: no auction was provided.");
      return;
    }

    // Use the auction ID, not the product ID, for the live-auction route.
    const auctionId =
      auction.auctionId ??
      auction.auction?.auctionId ??
      auction.auction?.id ??
      auction.id;

    if (auctionId == null || String(auctionId).trim() === "") {
      console.error(
        "Cannot open live auction: auctionId is missing from the selected auction.",
        auction,
      );
      return;
    }

    setSelectedProduct(auction);
    setActiveNav("");

    goTo(`/live-auction/${encodeURIComponent(String(auctionId))}`, {
      state: { product: auction },
    });
  };

  //
  // BACK TO PRODUCT DETAILS
  //

  const handleBackToProduct = () => {
    const productId = selectedProduct?.productId ?? selectedProduct?.id;

    if (productId != null) {
      goTo(`/product/${productId}`, {
        state: { product: selectedProduct },
      });
    } else {
      goTo("/auctions");
    }
  };

  //
  // HOME
  //

  const handleHome = () => {
    setActiveNav("Home");
    goTo("/");
  };

  //
  // BUYER DASHBOARD
  //

  const handleDashboard = () => {
    setActiveNav("");
    goTo("/dashboard");
  };

  //
  // SELLER DASHBOARD
  //

  const handleSellerDashboard = () => {
    if (loginType !== "seller") {
      goTo("/");
      return;
    }

    setActiveNav("");
    goTo("/seller-dashboard");
  };

  //
  // ADMIN DASHBOARD
  //

  const handleAdminDashboard = () => {
    if (!isAdmin) {
      goTo("/");
      return;
    }

    setActiveNav("");
    goTo("/admin");
  };

  //
  // HOW IT WORKS
  //

  const handleHowItWorks = () => {
    setActiveNav("How It Works");

    if (location.pathname !== "/") {
      navigate("/", {
        state: { scrollToHowItWorks: true },
      });

      setTimeout(() => {
        document.getElementById("how-it-works")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 300);
    } else {
      document.getElementById("how-it-works")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  //
  // ACTIVE NAVIGATION
  //

  const handleActiveNavChange = (link) => {
    setActiveNav(link);
  };

  //
  // COMMON HEADER PROPS
  //

  const headerProps = {
    onLogin: handleOpenAuth,
    onLogout: handleLogout,
    onDashboard: handleDashboard,
    onSellerDashboard: handleSellerDashboard,
    canAccessSellerDashboard: loginType === "seller",
    onAdminDashboard: handleAdminDashboard,
    isAdmin,
    isLoggedIn: isAuthenticated,
    user,
    onHome: handleHome,
    onViewAllAuctions: handleViewAllAuctions,
    onHowItWorks: handleHowItWorks,
    activeLink: activeNav,
    onActiveLinkChange: handleActiveNavChange,
  };

  //
  // ROUTES
  //

  return (
    <Routes>
      {/* HOME */}
      <Route
        path="/"
        element={
          <Home {...headerProps} onProductDetails={handleProductDetails} />
        }
      />

      {/* ALL AUCTIONS */}
      <Route
        path="/auctions"
        element={
          <AllAuction
            {...headerProps}
            onProductDetails={handleProductDetails}
          />
        }
      />

      {/* AUTHENTICATION */}
      <Route
        path="/auth"
        element={
          <AuthPage
            onClose={handleCloseAuth}
            onLoginSuccess={handleLoginSuccess}
          />
        }
      />

      {/* ADMIN DASHBOARD */}
      <Route
        path="/admin"
        element={
          !isAuthenticated || !isAdmin ? (
            <Navigate to="/" replace />
          ) : (
            <>
              <Header {...headerProps} dashboardMode adminDashboardMode />
              <AdminDashboard onLogout={handleLogout} />
            </>
          )
        }
      />

      {/* BUYER DASHBOARD */}
      <Route
        path="/dashboard"
        element={
          !isAuthenticated || isAdmin ? (
            <Navigate to="/" replace />
          ) : (
            <Dashboard
              onLogout={handleLogout}
              onSellerVerified={handleSellerVerificationSuccess}
              isSeller={isSeller}
              isLoggedIn={isAuthenticated}
              user={user}
              onDashboard={handleDashboard}
              onSellerDashboard={handleSellerDashboard}
              canAccessSellerDashboard={loginType === "seller"}
              onHome={handleHome}
              onViewAllAuctions={handleViewAllAuctions}
              onHowItWorks={handleHowItWorks}
              activeLink={activeNav}
              onActiveLinkChange={handleActiveNavChange}
              onLiveAuction={handleLiveAuction}
            />
          )
        }
      />

      {/* SELLER DASHBOARD */}
      <Route
        path="/seller-dashboard"
        element={
          !isAuthenticated || isAdmin || loginType !== "seller" ? (
            <Navigate to="/" replace />
          ) : (
            <SellerDashboard
              onLogout={handleLogout}
              onDashboard={handleDashboard}
              onHome={handleHome}
              onViewAllAuctions={handleViewAllAuctions}
              onHowItWorks={handleHowItWorks}
            />
          )
        }
      />

      {/* PRODUCT DETAILS */}
      <Route
        path="/product/:productId"
        element={
          <ProductDetailsRoute
            {...headerProps}
            selectedProduct={selectedProduct}
            setSelectedProduct={setSelectedProduct}
            onProductDetails={handleProductDetails}
            onLiveAuction={handleLiveAuction}
          />
        }
      />

      {/* LIVE AUCTION */}
      <Route
        path="/live-auction/:auctionId"
        element={
          <LiveAuctionRoute
            {...headerProps}
            selectedProduct={selectedProduct}
            setSelectedProduct={setSelectedProduct}
            onBack={handleBackToProduct}
          />
        }
      />

      {/* UNKNOWN URL */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

//
// PRODUCT DETAILS ROUTE
//

function ProductDetailsRoute({
  selectedProduct,
  onLiveAuction,
  ...headerProps
}) {
  const location = useLocation();
  const { productId } = useParams();

  const product = location.state?.product ?? selectedProduct;

  // Pass productId even on a direct page refresh/open, so ProductDetails can
  // load the product when navigation state is not available.
  return (
    <ProductDetails
      {...headerProps}
      product={product}
      productId={productId}
      onLiveAuction={onLiveAuction}
    />
  );
}

//
// LIVE AUCTION ROUTE
//

function LiveAuctionRoute({ selectedProduct, onBack, ...headerProps }) {
  const { auctionId } = useParams();
  const location = useLocation();

  const product = location.state?.product ?? selectedProduct;

  // LiveAuction can fetch the auction by auctionId, even if the user opens
  // or refreshes this URL without navigation state.
  return (
    <LiveAuction
      {...headerProps}
      product={product}
      auctionId={auctionId}
      onBack={onBack}
    />
  );
}
