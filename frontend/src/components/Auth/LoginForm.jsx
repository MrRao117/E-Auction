import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { adminLogin, loginUser } from "../../api/auth/authApi";

import {
  clearAuthError,
  loginFailure,
  loginStart,
  loginSuccess,
} from "../../redux/slices/authSlice";

import OTPVerification from "../../components/OTPVerification/OTPVerification";

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

  // Field validation
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Forgot password / OTP popup
  const [showOtp, setShowOtp] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");

  // null = Admin, buyer = Buyer, seller = Seller
  const [loginType, setLoginType] = useState(null);

  // ==========================================
  // EMAIL VALIDATION
  // ==========================================

  const validateEmail = (value) => {
    if (!value.trim()) return "";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
      return "Enter a valid email address.";
    }

    return "";
  };

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

    setFieldErrors({});
    setTouched({});
    setSubmitted(false);

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
  // EMAIL BLUR VALIDATION
  // ==========================================

  const handleEmailBlur = () => {
    setTouched((prev) => ({ ...prev, email: true }));

    if (!email.trim()) {
      setFieldErrors((prev) => ({
        ...prev,
        email: submitted ? "Email address is required." : "",
      }));

      return;
    }

    setFieldErrors((prev) => ({
      ...prev,
      email: validateEmail(email),
    }));
  };

  // ==========================================
  // PASSWORD BLUR VALIDATION
  // ==========================================

  const handlePasswordBlur = () => {
    setTouched((prev) => ({ ...prev, password: true }));

    setFieldErrors((prev) => ({
      ...prev,
      password: !password ? (submitted ? "Password is required." : "") : "",
    }));
  };

  // ==========================================
  // FORGOT PASSWORD / OPEN OTP POPUP
  // ==========================================

  const handleForgotPassword = () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setFieldErrors((prev) => ({
        ...prev,
        email: "Enter your email address first.",
      }));

      setTouched((prev) => ({
        ...prev,
        email: true,
      }));

      return;
    }

    const emailError = validateEmail(trimmedEmail);

    if (emailError) {
      setFieldErrors((prev) => ({
        ...prev,
        email: emailError,
      }));

      setTouched((prev) => ({
        ...prev,
        email: true,
      }));

      return;
    }

    if (error) {
      dispatch(clearAuthError());
    }

    setFieldErrors((prev) => ({
      ...prev,
      email: "",
    }));

    setOtpEmail(trimmedEmail);
    setShowOtp(true);
  };

  // ==========================================
  // LOGIN
  // ==========================================

  const handleLogin = async (event) => {
    event.preventDefault();

    // Required field validation
    setSubmitted(true);

    const nextErrors = {
      email: !email.trim()
        ? "Email address is required."
        : validateEmail(email),
      password: !password ? "Password is required." : "",
    };

    setFieldErrors(nextErrors);
    setTouched({ email: true, password: true });

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    // Start loading
    dispatch(loginStart());

    try {
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
      // ======================================

      if (loginType === null) {
        const response = await adminLogin(loginData);

        dispatch(loginSuccess(response));

        localStorage.setItem("loginType", "admin");

        if (onLoginSuccess) {
          onLoginSuccess("admin");
        }

        return;
      }

      // ======================================
      // BUYER / SELLER LOGIN
      // ======================================

      const response = await loginUser(loginData);

      // Handle explicit failure responses
      if (
        response?.success === false ||
        response?.authenticated === false ||
        response?.status === 401 ||
        response?.status === 403
      ) {
        dispatch(loginFailure("Login failed. Please use valid credentials."));
        return;
      }

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

      // Save login type
      localStorage.setItem("loginType", loginType);

      // Save current email
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
      // LOGIN SUCCESS CALLBACK
      // ======================================

      if (onLoginSuccess) {
        onLoginSuccess(loginType);
      }
    } catch (error) {
      console.error("========== LOGIN ERROR ==========");
      console.error("Error:", error);
      console.error("Status:", error.response?.status);
      console.error("Response:", error.response?.data);
      console.error("Message:", error.message);
      console.error("=================================");

      let errorMessage = "Login failed. Please use valid credentials.";

      const status = error.response?.status;
      const responseData = error.response?.data;

      // Existing backend error handling preserved
      if ([400, 401, 403, 404].includes(status)) {
        errorMessage = "Login failed. Please use valid credentials.";
      } else if (responseData) {
        if (typeof responseData === "string") {
          errorMessage = responseData;
        } else if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.error) {
          errorMessage = responseData.error;
        }
      }

      dispatch(loginFailure(errorMessage));
    }
  };

  // ==========================================
  // EMAIL CHANGE
  // ==========================================

  const handleEmailChange = (event) => {
    const value = event.target.value;

    setEmail(value);

    if (error) {
      dispatch(clearAuthError());
    }

    if (touched.email || submitted) {
      setFieldErrors((prev) => ({
        ...prev,
        email: !value.trim()
          ? submitted
            ? "Email address is required."
            : ""
          : validateEmail(value),
      }));
    }
  };

  // ==========================================
  // PASSWORD CHANGE
  // ==========================================

  const handlePasswordChange = (event) => {
    const value = event.target.value;

    setPassword(value);

    if (error) {
      dispatch(clearAuthError());
    }

    if (touched.password || submitted) {
      setFieldErrors((prev) => ({
        ...prev,
        password: !value ? (submitted ? "Password is required." : "") : "",
      }));
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

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="auth-form-container">
      {/* TITLE */}

      <div className="form-title">
        <h1>Sign in to your account</h1>
        <p>Enter your details to continue</p>
      </div>

      <form onSubmit={handleLogin}>
        {/* LOGIN TYPE */}

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

        {/* EMAIL */}

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
              onBlur={handleEmailBlur}
              disabled={isLoading}
            />
          </div>

          {fieldErrors.email && (
            <p className="validation-error" role="alert">
              {fieldErrors.email}
            </p>
          )}
        </div>

        {/* PASSWORD */}

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
              onBlur={handlePasswordBlur}
              disabled={isLoading}
            />

            {/* SHOW / HIDE PASSWORD */}

            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {fieldErrors.password && (
            <p className="validation-error" role="alert">
              {fieldErrors.password}
            </p>
          )}
        </div>

        {/* BACKEND / LOGIN ERROR */}

        {error && <div className="auth-error-message">{error}</div>}

        {/* REMEMBER / FORGOT */}

        <div className="login-options">
          <label className="remember">
            <input type="checkbox" disabled={isLoading} />
            <span>Remember me</span>
          </label>

          <button
            type="button"
            className="forgot-password"
            onClick={handleForgotPassword}
            disabled={isLoading}
          >
            Forgot password?
          </button>
        </div>

        {/* LOGIN BUTTON */}

        <button type="submit" className="primary-button" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
        </button>

        {/* DIVIDER */}

        <div className="divider">
          <span />
          <p>or continue with</p>
          <span />
        </div>

        {/* GOOGLE / FACEBOOK */}

        <div className="social-buttons">
          <button
            type="button"
            className="social-button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <span className="google-logo">G</span>
            <span>Continue with Google</span>
          </button>

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

        {/* REGISTER LINK */}

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

      {/* ==========================================
          OTP VERIFICATION / FORGOT PASSWORD POPUP
          ========================================== */}

      <OTPVerification
        isOpen={showOtp}
        onClose={() => setShowOtp(false)}
        purpose="forgot-password"
        mode="demo"
        email={otpEmail}
        title="Verify your email"
        description="Enter the 6-digit code to reset your password."
        onVerify={async (enteredOtp) => {
          // Demo mode verifies 123456 inside OTPVerification.
          // Connect the real OTP verification API here later.
          return { verified: true };
        }}
        onResetPassword={async (newPassword, verificationResult) => {
          // Demo mode only. No real password is changed.
          // Connect your Spring Boot password-reset API here later.
          console.log("Demo password reset completed.");
        }}
        onSuccess={() => {
          setShowOtp(false);
          setPassword("");
          setFieldErrors({});
          setTouched({});
          setSubmitted(false);
        }}
      />
    </div>
  );
}
