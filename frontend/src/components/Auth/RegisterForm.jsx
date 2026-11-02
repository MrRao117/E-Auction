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

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // =========================
  // ERRORS AND TOUCHED FIELDS
  // =========================

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // =========================
  // DATE LIMITS
  // =========================

  const today = new Date();

  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  // A person who has reached their 18th birthday is eligible.
  const latestEligibleDOB = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate(),
  );

  const latestEligibleDOBString = [
    latestEligibleDOB.getFullYear(),
    String(latestEligibleDOB.getMonth() + 1).padStart(2, "0"),
    String(latestEligibleDOB.getDate()).padStart(2, "0"),
  ].join("-");

  // =========================
  // VALIDATION FUNCTIONS
  // Empty values are handled separately during submission.
  // =========================

  const validateName = (name) => {
    if (!name.trim()) return "";

    if (!/^[A-Za-z]+(?: +[A-Za-z]+)*$/.test(name.trim())) {
      return "Name must contain alphabets and spaces only.";
    }

    return "";
  };

  const validateMobile = (mobileNo) => {
    if (!mobileNo) return "";

    if (!/^[6-9]\d{9}$/.test(mobileNo)) {
      return "Enter a valid 10-digit Indian mobile number.";
    }

    if (/^(\d)\1{9}$/.test(mobileNo)) {
      return "Mobile number cannot contain the same digit repeatedly.";
    }

    return "";
  };

  const validateEmail = (email) => {
    const value = email.trim();

    if (!value) return "";

    const gmailPattern = /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@gmail\.com$/i;

    const localPart = value.split("@")[0];

    if (
      !gmailPattern.test(value) ||
      !localPart ||
      localPart.startsWith(".") ||
      localPart.endsWith(".") ||
      localPart.includes("..")
    ) {
      return "Enter a valid Gmail address ending with @gmail.com.";
    }

    return "";
  };

  const validateDOB = (dob) => {
    if (!dob) return "";

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      return "Enter a valid date of birth.";
    }

    const birthDate = new Date(`${dob}T00:00:00`);

    if (
      Number.isNaN(birthDate.getTime()) ||
      birthDate.toISOString().slice(0, 10) !== dob
    ) {
      return "Enter a valid date of birth.";
    }

    if (dob > todayString) {
      return "Date of birth cannot be in the future.";
    }

    let age = today.getFullYear() - birthDate.getFullYear();

    const birthdayNotReached =
      today.getMonth() < birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() &&
        today.getDate() < birthDate.getDate());

    if (birthdayNotReached) {
      age--;
    }

    if (age < 18) {
      return "Age must be greater than 18.";
    }

    return "";
  };

  const validateGender = (gender) => {
    if (!gender) return "";
    return "";
  };

  const validatePassword = (value) => {
    if (!value) return "";

    if (value.length < 8) {
      return "Password must contain at least 8 characters.";
    }

    if (/\s/.test(value)) {
      return "Password must not contain spaces.";
    }

    if (!/[A-Z]/.test(value)) {
      return "Password must contain at least one uppercase letter.";
    }

    if (!/[a-z]/.test(value)) {
      return "Password must contain at least one lowercase letter.";
    }

    if (!/\d/.test(value)) {
      return "Password must contain at least one number.";
    }

    if (!/[^A-Za-z0-9\s]/.test(value)) {
      return "Password must contain at least one special character.";
    }

    return "";
  };

  const validateConfirmPassword = (value, originalPassword) => {
    if (!value) return "";

    if (value !== originalPassword) {
      return "Passwords do not match.";
    }

    return "";
  };

  // =========================
  // FIELD VALIDATION ROUTER
  // =========================

  const validateField = (fieldName, value, currentPassword = password) => {
    switch (fieldName) {
      case "name":
        return validateName(value);

      case "mobileNo":
        return validateMobile(value);

      case "email":
        return validateEmail(value);

      case "dob":
        return validateDOB(value);

      case "gender":
        return validateGender(value);

      case "password":
        return validatePassword(value);

      case "confirmPassword":
        return validateConfirmPassword(value, currentPassword);

      default:
        return "";
    }
  };

  // =========================
  // FORM FIELD CHANGE
  // =========================

  const handleChange = (event) => {
    const { name, value } = event.target;

    const updatedValue =
      name === "mobileNo" ? value.replace(/\D/g, "").slice(0, 10) : value;

    setFormData((previous) => ({
      ...previous,
      [name]: updatedValue,
    }));

    // Empty fields remain error-free during normal navigation.
    // After a submission attempt, required errors also update.
    if (touched[name] || submitted) {
      let message = "";

      if (!updatedValue.trim?.() && !updatedValue && !submitted) {
        message = "";
      } else if (!updatedValue && submitted) {
        message = `${
          name === "mobileNo"
            ? "Mobile number"
            : name === "dob"
              ? "Date of birth"
              : name === "gender"
                ? "Gender"
                : name.charAt(0).toUpperCase() + name.slice(1)
        } is required.`;
      } else {
        message = validateField(name, updatedValue);
      }

      setErrors((previous) => ({
        ...previous,
        [name]: message,
      }));
    }
  };

  // =========================
  // FIELD BLUR / TAB
  // =========================

  const handleBlur = (fieldName, value) => {
    setTouched((previous) => ({
      ...previous,
      [fieldName]: true,
    }));

    // Do not show required errors when leaving a blank field.
    if (!value || !value.trim?.()) {
      setErrors((previous) => ({
        ...previous,
        [fieldName]: "",
      }));

      return;
    }

    setErrors((previous) => ({
      ...previous,
      [fieldName]: validateField(fieldName, value),
    }));
  };

  // =========================
  // PASSWORD CHANGE
  // =========================

  const handlePasswordChange = (event) => {
    const value = event.target.value;

    setPassword(value);

    if (touched.password || submitted) {
      setErrors((previous) => ({
        ...previous,
        password:
          !value && submitted
            ? "Password is required."
            : validatePassword(value),
      }));
    }

    if (touched.confirmPassword || submitted) {
      setErrors((previous) => ({
        ...previous,
        confirmPassword:
          !confirmPassword && submitted
            ? "Confirm password is required."
            : validateConfirmPassword(confirmPassword, value),
      }));
    }
  };

  // =========================
  // CONFIRM PASSWORD CHANGE
  // =========================

  const handleConfirmPasswordChange = (event) => {
    const value = event.target.value;

    setConfirmPassword(value);

    if (touched.confirmPassword || submitted) {
      setErrors((previous) => ({
        ...previous,
        confirmPassword:
          !value && submitted
            ? "Confirm password is required."
            : validateConfirmPassword(value, password),
      }));
    }
  };

  // =========================
  // OPEN DATE PICKER
  // =========================

  const openDatePicker = () => {
    const dateInput = document.getElementById("register-dob");

    if (!dateInput) return;

    if (typeof dateInput.showPicker === "function") {
      try {
        dateInput.showPicker();
        return;
      } catch {
        // Fall back to focusing the date input.
      }
    }

    dateInput.focus();
  };

  // =========================
  // SUBMIT REGISTRATION
  // =========================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitted(true);

    const newErrors = {
      name: formData.name.trim()
        ? validateName(formData.name)
        : "Full name is required.",

      mobileNo: formData.mobileNo
        ? validateMobile(formData.mobileNo)
        : "Mobile number is required.",

      email: formData.email.trim()
        ? validateEmail(formData.email)
        : "Email address is required.",

      dob: formData.dob
        ? validateDOB(formData.dob)
        : "Date of birth is required.",

      gender: formData.gender
        ? validateGender(formData.gender)
        : "Gender is required.",

      password: password ? validatePassword(password) : "Password is required.",

      confirmPassword: confirmPassword
        ? validateConfirmPassword(confirmPassword, password)
        : "Confirm password is required.",
    };

    setTouched({
      name: true,
      mobileNo: true,
      email: true,
      dob: true,
      gender: true,
      password: true,
      confirmPassword: true,
    });

    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) {
      return;
    }

    dispatch(registerStart());

    try {
      const registrationData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password,
        dob: formData.dob,
        gender: formData.gender,
        mobileNo: formData.mobileNo,
      };

      const response = await registerUser(registrationData);

      dispatch(registerSuccess(response));

      setActiveTab("login");
    } catch (registrationError) {
      console.error("Registration failed:", registrationError);

      const message =
        registrationError.response?.data?.message ||
        registrationError.response?.data?.error ||
        "Registration failed. Please try again.";

      dispatch(registerFailure(message));
    }
  };

  // =========================
  // ERROR MESSAGE
  // =========================

  const renderError = (fieldName) => {
    if (!errors[fieldName]) {
      return null;
    }

    return (
      <p className="validation-error" role="alert">
        {errors[fieldName]}
      </p>
    );
  };

  // =========================
  // FORM UI
  // =========================

  return (
    <div className="auth-form-container register-container">
      <div className="form-title">
        <h1>Create your account</h1>
        <p>Join eAuction and start bidding today</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* FULL NAME */}

        <div className="input-group">
          <label htmlFor="register-name">Full name</label>

          <div className={`input-wrapper ${errors.name ? "input-error" : ""}`}>
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
              onBlur={() => handleBlur("name", formData.name)}
              aria-invalid={Boolean(errors.name)}
              required
            />
          </div>

          {renderError("name")}
        </div>

        {/* MOBILE NUMBER */}

        <div className="input-group">
          <label htmlFor="register-mobile">Mobile number</label>

          <div
            className={`input-wrapper ${errors.mobileNo ? "input-error" : ""}`}
          >
            <div className="input-icon">
              <Phone size={15} />
            </div>

            <input
              id="register-mobile"
              name="mobileNo"
              type="tel"
              inputMode="numeric"
              placeholder="Enter your mobile number"
              maxLength={10}
              autoComplete="tel-national"
              value={formData.mobileNo}
              onChange={handleChange}
              onBlur={() => handleBlur("mobileNo", formData.mobileNo)}
              aria-invalid={Boolean(errors.mobileNo)}
              required
            />
          </div>

          {renderError("mobileNo")}
        </div>

        {/* EMAIL */}

        <div className="input-group">
          <label htmlFor="register-email">Email address</label>

          <div className={`input-wrapper ${errors.email ? "input-error" : ""}`}>
            <div className="input-icon">
              <Mail size={15} />
            </div>

            <input
              id="register-email"
              name="email"
              type="email"
              placeholder="Enter your Gmail address"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={() => handleBlur("email", formData.email)}
              aria-invalid={Boolean(errors.email)}
              required
            />
          </div>

          {renderError("email")}
        </div>

        {/* DOB + GENDER */}

        <div className="register-two-column">
          {/* DATE OF BIRTH */}

          <div className="input-group">
            <label htmlFor="register-dob">Date of birth</label>

            <div
              className={`input-wrapper dob-wrapper ${
                errors.dob ? "input-error" : ""
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
                max={latestEligibleDOBString}
                value={formData.dob}
                onChange={handleChange}
                onBlur={() => handleBlur("dob", formData.dob)}
                aria-invalid={Boolean(errors.dob)}
                required
              />
            </div>

            {renderError("dob")}

            {touched.dob && formData.dob && !errors.dob && (
              <p className="validation-success">Date of birth is valid.</p>
            )}
          </div>

          {/* GENDER */}

          <div className="input-group">
            <label htmlFor="register-gender">Gender</label>

            <div
              className={`input-wrapper ${errors.gender ? "input-error" : ""}`}
            >
              <div className="input-icon">
                <UserRound size={15} />
              </div>

              <select
                id="register-gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                onBlur={() => handleBlur("gender", formData.gender)}
                aria-invalid={Boolean(errors.gender)}
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

            {renderError("gender")}
          </div>
        </div>

        {/* PASSWORD */}

        <div className="input-group">
          <label htmlFor="register-password">Password</label>

          <div
            className={`input-wrapper ${errors.password ? "input-error" : ""}`}
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
              onBlur={() => handleBlur("password", password)}
              aria-invalid={Boolean(errors.password)}
              required
            />

            <button
              type="button"
              className="password-toggle"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((previous) => !previous)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {renderError("password")}
        </div>

        {/* CONFIRM PASSWORD */}

        <div className="input-group">
          <label htmlFor="register-confirm">Confirm password</label>

          <div
            className={`input-wrapper ${
              errors.confirmPassword ? "input-error" : ""
            }`}
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
              onBlur={() => handleBlur("confirmPassword", confirmPassword)}
              aria-invalid={Boolean(errors.confirmPassword)}
              required
            />

            <button
              type="button"
              className="password-toggle"
              aria-label={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
              onClick={() => setShowConfirmPassword((previous) => !previous)}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {renderError("confirmPassword")}
        </div>

        {/* BACKEND ERROR */}

        {error && (
          <p className="validation-error" role="alert">
            {typeof error === "string"
              ? error
              : "Registration failed. Please try again."}
          </p>
        )}

        {/* TERMS */}

        <label className="terms">
          <input type="checkbox" required />

          <span>
            I agree to the <button type="button">Terms &amp; Conditions</button>{" "}
            and <button type="button">Privacy Policy</button>
          </span>
        </label>

        {/* CREATE ACCOUNT */}

        <button type="submit" className="primary-button" disabled={isLoading}>
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
