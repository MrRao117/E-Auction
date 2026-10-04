import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";

import { adminLogin, loginUser } from "../../api/auth/authApi";

import {
  clearAuthError,
  loginFailure,
  loginStart,
  loginSuccess,
} from "../../redux/slices/authSlice";

// =====================================================
// ROLE HELPER
// =====================================================

const normalizeRole = (role) => {
  if (!role) return "";

  return String(role)
    .trim()
    .toUpperCase()
    .replace(/^ROLE_/, "");
};

// =====================================================
// MAIN LOGIN FORM
// =====================================================

export default function LoginForm({ setActiveTab, onLoginSuccess }) {
  const dispatch = useDispatch();

  const { isLoading, error, registeredUser } = useSelector(
    (state) => state.auth,
  );

  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ==========================================
  // LOGIN TYPE
  // null = Admin login
  // buyer = Buyer login
  // seller = Seller login
  // ==========================================

  const [loginType, setLoginType] = useState(null);

  // ==========================================
  // PREFILL REGISTERED EMAIL
  // ==========================================

  useEffect(() => {
    if (registeredUser?.email) {
      setEmail(registeredUser.email);
    }
  }, [registeredUser]);

  // ==========================================
  // PREFILL SELLER EMAIL
  // ==========================================

  useEffect(() => {
    if (loginType === "seller") {
      const sellerEmail = localStorage.getItem("sellerEmail");

      if (sellerEmail) {
        setEmail(sellerEmail);
      }
    } else if (registeredUser?.email) {
      setEmail(registeredUser.email);
    }
  }, [loginType, registeredUser]);

  // ==========================================
  // LOGIN TYPE CHANGE
  // ==========================================

  const handleLoginTypeChange = (type) => {
    setLoginType(type);

    if (error) {
      dispatch(clearAuthError());
    }

    if (type === "seller") {
      const sellerEmail = localStorage.getItem("sellerEmail");

      if (sellerEmail) {
        setEmail(sellerEmail);
      }
    } else if (registeredUser?.email) {
      setEmail(registeredUser.email);
    } else {
      setEmail("");
    }

    // Clear password when changing login type
    setPassword("");
  };

  // ==========================================
  // LOGIN
  // ==========================================

  const handleLogin = async (event) => {
    event.preventDefault();

    // ========================================
    // CHECK REQUIRED FIELDS
    // ========================================

    if (!email.trim() || !password) {
      dispatch(loginFailure("Email and password are required."));
      return;
    }

    // ========================================
    // START LOADING
    // ========================================

    dispatch(loginStart());

    try {
      // ======================================
      // LOGIN REQUEST
      // ======================================

      const loginData = {
        email: email.trim(),
        password: password,
      };

      console.log("========== LOGIN REQUEST ==========");
      console.log("Login Type:", loginType ?? "admin");
      console.log("Email:", loginData.email);
      console.log("===================================");

      // ======================================
      // ADMIN LOGIN
      // No Buyer/Seller radio selected
      // ======================================

      if (loginType === null) {
        const response = await adminLogin(loginData);

        // ====================================
        // ADMIN LOGIN SUCCESS
        // ====================================

        dispatch(loginSuccess(response));

        localStorage.setItem("loginType", "admin");

        // ====================================
        // REDIRECT TO ADMIN DASHBOARD
        // ====================================

        if (onLoginSuccess) {
          onLoginSuccess("admin");
        }

        return;
      }

      // ======================================
      // BUYER / SELLER LOGIN
      // ======================================

      const response = await loginUser(loginData);

      // ======================================
      // GET USER ROLE FROM BACKEND
      // ======================================

      const backendRole = normalizeRole(
        response?.userRole ??
          response?.user?.userRole ??
          response?.role ??
          response?.user?.role ??
          response?.userType ??
          response?.user?.userType,
      );

      // ======================================
      // CONVERT SELECTED RADIO TO ROLE
      // ======================================

      const selectedRole = loginType === "buyer" ? "BUYER" : "SELLER";

      console.log("========== LOGIN RESPONSE ==========");
      console.log("Selected Login Type:", selectedRole);
      console.log("Backend User Role:", backendRole);
      console.log("Response:", response);
      console.log("====================================");

      // ======================================
      // ROLE / ACCESS CHECK
      // ======================================

      /*
       * BUYER LOGIN
       *
       * Both BUYER and SELLER accounts can
       * log in using "Login as Buyer".
       *
       * BUYER  -> Buyer Dashboard
       * SELLER -> Buyer Dashboard
       */

      if (selectedRole === "BUYER") {
        if (backendRole !== "BUYER" && backendRole !== "SELLER") {
          dispatch(
            loginFailure("This account is not eligible for Buyer login."),
          );
          return;
        }
      }

      /*
       * SELLER LOGIN
       *
       * Only a SELLER account can use
       * "Login as Seller".
       *
       * SELLER -> Seller Dashboard
       * BUYER  -> Rejected
       */

      if (selectedRole === "SELLER") {
        if (backendRole !== "SELLER") {
          dispatch(loginFailure("This account is not registered as a Seller."));
          return;
        }
      }

      // ======================================
      // LOGIN SUCCESS
      // ======================================

      dispatch(loginSuccess(response));

      // ======================================
      // SAVE LOGIN TYPE
      // ======================================

      localStorage.setItem("loginType", loginType);

      // ======================================
      // SAVE CURRENT EMAIL
      // ======================================

      localStorage.setItem("sellerEmail", email.trim());

      // ======================================
      // CONGRATULATIONS POPUP
      // WHEN A SELLER LOGS IN AS BUYER
      // ======================================

      if (selectedRole === "BUYER" && backendRole === "SELLER") {
        window.alert(
          "Congratulations! Your account has been approved as a Seller. You can now access both Buyer and Seller dashboards.",
        );
      }

      // ======================================
      // TELL AUTH PAGE / APP LOGIN SUCCEEDED
      // ======================================

      if (onLoginSuccess) {
        // Preserve the selected login dashboard.
        // Buyer login opens Buyer Dashboard,
        // even when the backend role is SELLER.
        onLoginSuccess(loginType);
      }
    } catch (error) {
      // ======================================
      // DETAILED LOGIN ERROR
      // ======================================

      console.error("========== LOGIN ERROR ==========");
      console.error("Error:", error);
      console.error("Status:", error.response?.status);
      console.error("Response:", error.response?.data);
      console.error("Message:", error.message);
      console.error("=================================");

      // ======================================
      // DEFAULT ERROR MESSAGE
      // ======================================

      let errorMessage = "Login failed.";

      // ======================================
      // GET ACTUAL BACKEND ERROR
      // ======================================

      if (error.response?.data) {
        // Backend returned plain text
        if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        }

        // Backend returned { message: "..." }
        else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }

        // Backend returned { error: "..." }
        else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }

        // Backend returned another JSON object
        else {
          errorMessage = JSON.stringify(error.response.data);
        }
      } else if (error.message) {
        // Network / Axios error
        errorMessage = error.message;
      }

      // ======================================
      // SAVE ERROR IN REDUX
      // ======================================

      dispatch(loginFailure(errorMessage));
    }
  };

  // ==========================================
  // EMAIL CHANGE
  // ==========================================

  const handleEmailChange = (event) => {
    setEmail(event.target.value);

    if (error) {
      dispatch(clearAuthError());
    }
  };

  // ==========================================
  // PASSWORD CHANGE
  // ==========================================

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);

    if (error) {
      dispatch(clearAuthError());
    }
  };

  // ==========================================
  // GOOGLE LOGIN
  // ==========================================

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  // ==========================================
  // FACEBOOK LOGIN
  // ==========================================

  const handleFacebookLogin = () => {
    window.location.href =
      "http://localhost:8080/oauth2/authorization/facebook";
  };

  return (
    <div className="auth-form-container">
      {/* =========================
          TITLE
      ========================= */}

      <div className="form-title">
        <h1>Sign in to your account</h1>
        <p>Enter your details to continue</p>
      </div>

      <form onSubmit={handleLogin}>
        {/* =========================
            LOGIN TYPE
        ========================= */}

        <div className="login-type-options">
          <label className="login-type-option">
            <input
              type="radio"
              name="loginType"
              value="buyer"
              checked={loginType === "buyer"}
              onChange={() => handleLoginTypeChange("buyer")}
              disabled={isLoading}
            />

            <span>Login as Buyer</span>
          </label>

          <label className="login-type-option">
            <input
              type="radio"
              name="loginType"
              value="seller"
              checked={loginType === "seller"}
              onChange={() => handleLoginTypeChange("seller")}
              disabled={isLoading}
            />

            <span>Login as Seller</span>
          </label>
        </div>

        {/* =========================
            EMAIL
        ========================= */}

        <div className="input-group">
          <label htmlFor="login-email">Email address</label>

          <div className="input-wrapper">
            <div className="input-icon">
              <Mail size={16} />
            </div>

            <input
              id="login-email"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              value={email}
              onChange={handleEmailChange}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* =========================
            PASSWORD
        ========================= */}

        <div className="input-group">
          <label htmlFor="login-password">Password</label>

          <div className="input-wrapper">
            <div className="input-icon">
              <LockKeyhole size={15} />
            </div>

            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              value={password}
              onChange={handlePasswordChange}
              disabled={isLoading}
            />

            {/* SHOW / HIDE PASSWORD */}

            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* =========================
            ERROR MESSAGE
        ========================= */}

        {error && <div className="auth-error-message">{error}</div>}

        {/* =========================
            REMEMBER / FORGOT
        ========================= */}

        <div className="login-options">
          <label className="remember">
            <input type="checkbox" disabled={isLoading} />
            <span>Remember me</span>
          </label>

          <button type="button" className="forgot-password">
            Forgot password?
          </button>
        </div>

        {/* =========================
            LOGIN BUTTON
        ========================= */}

        <button type="submit" className="primary-button" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
        </button>

        {/* =========================
            DIVIDER
        ========================= */}

        <div className="divider">
          <span />
          <p>or continue with</p>
          <span />
        </div>

        {/* =========================
            GOOGLE / FACEBOOK
        ========================= */}

        <div className="social-buttons">
          {/* GOOGLE */}

          <button
            type="button"
            className="social-button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <span className="google-logo">G</span>
            <span>Continue with Google</span>
          </button>

          {/* FACEBOOK */}

          <button
            type="button"
            className="social-button"
            onClick={handleFacebookLogin}
            disabled={isLoading}
          >
            <span className="facebook-logo">f</span>
            <span>Continue with Facebook</span>
          </button>
        </div>

        {/* =========================
            REGISTER LINK
        ========================= */}

        <div className="switch-account">
          <span>Don't have an account?</span>

          <button
            type="button"
            onClick={() => setActiveTab("register")}
            disabled={isLoading}
          >
            Create account
          </button>
        </div>
      </form>
    </div>
  );
}
