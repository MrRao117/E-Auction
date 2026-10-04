import { useState } from "react";

import {
  CalendarDays,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";

import {
  registerFailure,
  registerStart,
  registerSuccess,
} from "../../redux/slices/authSlice";

import { registerUser } from "../../api/auth/authApi";

export default function RegisterForm({ setActiveTab }) {
  const dispatch = useDispatch();

  const { isLoading, error } = useSelector((state) => state.auth);

  // =========================
  // FORM DATA
  // =========================

  const [formData, setFormData] = useState({
    name: "",
    mobileNo: "",
    email: "",
    dob: "",
    gender: "",
  });

  // =========================
  // PASSWORD
  // =========================

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordError, setPasswordError] = useState("");

  const [dobError, setDobError] = useState("");

  // =========================
  // TODAY
  // =========================

  const today = new Date();

  const todayString = today.toISOString().split("T")[0];

  // =========================
  // FORM CHANGE
  // =========================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // PASSWORD
  // =========================

  const handlePasswordChange = (event) => {
    const value = event.target.value;

    setPassword(value);

    if (confirmPassword && value !== confirmPassword) {
      setPasswordError("Passwords do not match");
    } else {
      setPasswordError("");
    }
  };

  // =========================
  // CONFIRM PASSWORD
  // =========================

  const handleConfirmPasswordChange = (event) => {
    const value = event.target.value;

    setConfirmPassword(value);

    if (password && password !== value) {
      setPasswordError("Passwords do not match");
    } else {
      setPasswordError("");
    }
  };

  // =========================
  // DOB VALIDATION
  // =========================

  const handleDobChange = (event) => {
    const value = event.target.value;

    setDobError("");

    setFormData((previous) => ({
      ...previous,
      dob: value,
    }));

    if (!value) {
      return;
    }

    const parts = value.split("-");

    const year = parts[0];

    // Year must contain exactly 4 digits

    if (!year || year.length !== 4 || !/^\d{4}$/.test(year)) {
      setDobError("Year must contain exactly 4 digits");

      return;
    }

    // Year must be between 1900 and current year

    const numericYear = Number(year);

    const currentYear = today.getFullYear();

    if (numericYear < 1900 || numericYear > currentYear) {
      setDobError(`Year must be between 1900 and ${currentYear}`);

      return;
    }

    // DOB cannot be future

    if (value > todayString) {
      setDobError("Date of birth cannot be in the future");

      return;
    }
  };

  // =========================
  // OPEN DATE PICKER
  // =========================

  const openDatePicker = () => {
    const dateInput = document.getElementById("register-dob");

    if (!dateInput) {
      return;
    }

    if (typeof dateInput.showPicker === "function") {
      try {
        dateInput.showPicker();

        return;
      } catch (error) {
        // Browser may block showPicker
      }
    }

    dateInput.focus();
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Password validation

    if (!password) {
      setPasswordError("Password is required");

      return;
    }

    if (!confirmPassword) {
      setPasswordError("Please confirm your password");

      return;
    }

    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");

      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");

      return;
    }

    // DOB validation

    if (dobError) {
      return;
    }

    // =========================
    // SEND TO BACKEND
    // =========================

    dispatch(registerStart());

    try {
      const registrationData = {
        name: formData.name.trim(),

        email: formData.email.trim(),

        password: password,

        dob: formData.dob,

        gender: formData.gender,

        mobileNo: formData.mobileNo.trim(),
      };

      console.log("Registration request:", registrationData);

      const response = await registerUser(registrationData);

      console.log("Registration response:", response);

      // Save registration result in Redux

      dispatch(registerSuccess(response));

      // Go to login

      setActiveTab("login");
    } catch (error) {
      console.error("Registration failed:", error);

      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Registration failed. Please try again.";

      dispatch(registerFailure(message));
    }
  };

  return (
    <div className="auth-form-container register-container">
      {/* TITLE */}

      <div className="form-title">
        <h1>Create your account</h1>

        <p>Join eAuction and start bidding today</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* FULL NAME */}

        <div className="input-group">
          <label htmlFor="register-name">Full name</label>

          <div className="input-wrapper">
            <div className="input-icon">
              <UserRound size={15} />
            </div>

            <input
              id="register-name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* MOBILE NUMBER */}

        <div className="input-group">
          <label htmlFor="register-mobile">Mobile number</label>

          <div className="input-wrapper">
            <div className="input-icon">
              <Phone size={15} />
            </div>

            <input
              id="register-mobile"
              name="mobileNo"
              type="tel"
              placeholder="Enter your mobile number"
              maxLength={10}
              autoComplete="tel"
              pattern="[6-9][0-9]{9}"
              value={formData.mobileNo}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* EMAIL */}

        <div className="input-group">
          <label htmlFor="register-email">Email address</label>

          <div className="input-wrapper">
            <div className="input-icon">
              <Mail size={15} />
            </div>

            <input
              id="register-email"
              name="email"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* DOB + GENDER */}

        <div className="register-two-column">
          {/* DOB */}

          <div className="input-group">
            <label htmlFor="register-dob">Date of birth</label>

            <div
              className={`input-wrapper dob-wrapper ${
                dobError ? "input-error" : ""
              }`}
            >
              <button
                type="button"
                className="dob-calendar-button"
                aria-label="Select date of birth"
                onClick={openDatePicker}
              >
                <CalendarDays size={15} />
              </button>

              <input
                id="register-dob"
                name="dob"
                type="date"
                min="1900-01-01"
                max={todayString}
                value={formData.dob}
                onChange={handleDobChange}
                required
              />
            </div>

            {dobError && <div className="password-error">{dobError}</div>}
          </div>

          {/* GENDER */}

          <div className="input-group">
            <label htmlFor="register-gender">Gender</label>

            <div className="input-wrapper">
              <div className="input-icon">
                <UserRound size={15} />
              </div>

              <select
                id="register-gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Select
                </option>

                <option value="MALE">Male</option>

                <option value="FEMALE">Female</option>

                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* PASSWORD */}

        <div className="input-group">
          <label htmlFor="register-password">Password</label>

          <div
            className={`input-wrapper ${passwordError ? "input-error" : ""}`}
          >
            <div className="input-icon">
              <LockKeyhole size={15} />
            </div>

            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              autoComplete="new-password"
              value={password}
              onChange={handlePasswordChange}
              minLength={6}
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* CONFIRM PASSWORD */}

        <div className="input-group">
          <label htmlFor="register-confirm">Confirm password</label>

          <div
            className={`input-wrapper ${passwordError ? "input-error" : ""}`}
          >
            <div className="input-icon">
              <LockKeyhole size={15} />
            </div>

            <input
              id="register-confirm"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              minLength={6}
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {passwordError && (
            <div className="password-error">{passwordError}</div>
          )}
        </div>

        {/* BACKEND ERROR */}

        {error && (
          <div className="password-error">
            {typeof error === "string"
              ? error
              : "Registration failed. Please try again."}
          </div>
        )}

        {/* TERMS */}

        <label className="terms">
          <input type="checkbox" required />

          <span>
            I agree to the <button type="button">Terms & Conditions</button> and{" "}
            <button type="button">Privacy Policy</button>
          </span>
        </label>

        {/* CREATE ACCOUNT */}

        <button
          type="submit"
          className="primary-button"
          disabled={
            isLoading ||
            !password ||
            !confirmPassword ||
            password !== confirmPassword ||
            Boolean(dobError)
          }
        >
          {isLoading ? "Creating account..." : "Create account"}
        </button>

        {/* LOGIN */}

        <div className="switch-account">
          <span>Already have an account?</span>

          <button type="button" onClick={() => setActiveTab("login")}>
            Sign in
          </button>
        </div>
      </form>
    </div>
  );
}
