import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import "./OTPVerification.css";

const OTP_LENGTH = 6;
const DEMO_OTP = "123456";

export default function OTPVerification({
  isOpen,
  onClose,
  onVerify,
  onResend,
  onResetPassword,
  onSuccess,
  title = "Verify your email",
  description = "Enter the 6-digit verification code.",
  email = "",
  purpose = "forgot-password",
  mode = "demo",
}) {
  const [step, setStep] = useState("otp");
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [resending, setResending] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (!isOpen) return;

    setStep("otp");
    setOtp(Array(OTP_LENGTH).fill(""));
    setError("");
    setCountdown(30);
    setNewPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setVerificationResult(null);

    const timer = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown((previous) => Math.max(0, previous - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [isOpen, countdown]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !loading) {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const handleChange = (value, index) => {
    const digits = value.replace(/\D/g, "");

    setError("");

    // Support typing a digit or pasting a complete OTP.
    if (digits.length > 1) {
      const pasted = digits.slice(0, OTP_LENGTH);

      setOtp(Array.from({ length: OTP_LENGTH }, (_, i) => pasted[i] || ""));

      inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();

      return;
    }

    const digit = digits.slice(-1);

    setOtp((previous) => {
      const updated = [...previous];
      updated[index] = digit;
      return updated;
    });

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();

    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pasted) return;

    setOtp(
      Array.from({ length: OTP_LENGTH }, (_, index) => pasted[index] || ""),
    );

    setError("");

    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleKeyDown = (event, index) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();

    const enteredOtp = otp.join("");

    if (enteredOtp.length !== OTP_LENGTH) {
      setError("Please enter all 6 digits.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let result;

      if (mode === "demo") {
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (enteredOtp !== DEMO_OTP) {
          setError("Invalid OTP. For demo, enter 123456.");
          return;
        }

        result = { verified: true, demo: true };
      } else {
        if (!onVerify) {
          setError("OTP verification API is not configured.");
          return;
        }

        // Should resolve only when the backend confirms
        // that the OTP is valid.
        result = await onVerify(enteredOtp);
      }

      setVerificationResult(result);

      if (purpose === "forgot-password") {
        // Keep the same popup open and switch to password reset.
        setStep("password");
        setError("");
      } else {
        // Registration or KYC can continue in the parent.
        await onSuccess?.(result);
        onClose?.();
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "OTP verification failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending || loading) return;

    setResending(true);
    setError("");

    try {
      if (mode === "demo") {
        // No real OTP is sent in demo mode.
      } else {
        if (!onResend) {
          setError("OTP resend API is not configured.");
          return;
        }

        await onResend();
      }

      setOtp(Array(OTP_LENGTH).fill(""));
      setCountdown(30);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to resend OTP. Please try again.",
      );
    } finally {
      setResending(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setError("Password must contain at least one uppercase letter.");
      return;
    }

    if (!/[a-z]/.test(newPassword)) {
      setError("Password must contain at least one lowercase letter.");
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      setError("Password must contain at least one number.");
      return;
    }

    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      setError("Password must contain at least one special character.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "demo") {
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Demo only: no actual account password is changed.
      } else {
        if (!onResetPassword) {
          setError("Password reset API is not configured.");
          return;
        }

        // Pass the backend verification result too.
        // It may contain a reset token or other authorization data.
        await onResetPassword(newPassword, verificationResult);
      }

      setStep("success");
      setError("");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to reset password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToOtp = () => {
    if (loading) return;

    setStep("otp");
    setOtp(Array(OTP_LENGTH).fill(""));
    setError("");
    setCountdown(30);
    setNewPassword("");
    setConfirmPassword("");
    setVerificationResult(null);

    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  };

  const handleFinish = async () => {
    await onSuccess?.();
    onClose?.();
  };

  return (
    <div
      className="otp-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose?.();
        }
      }}
    >
      <section
        className="otp-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="otp-title"
      >
        <button
          type="button"
          className="otp-close"
          onClick={onClose}
          disabled={loading}
          aria-label="Close verification"
        >
          <X size={21} />
        </button>

        {step === "otp" && (
          <>
            <div className="otp-icon">
              <ShieldCheck size={32} />
            </div>

            <h2 id="otp-title">{title}</h2>

            <p className="otp-description">{description}</p>

            {email && (
              <p className="otp-email">
                Verification for <strong>{email}</strong>
              </p>
            )}

            <form onSubmit={handleVerify}>
              <div className="otp-inputs">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      inputRefs.current[index] = element;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    aria-label={`OTP digit ${index + 1}`}
                    onChange={(event) =>
                      handleChange(event.target.value, index)
                    }
                    onKeyDown={(event) => handleKeyDown(event, index)}
                    onPaste={handlePaste}
                    disabled={loading}
                  />
                ))}
              </div>

              {error && (
                <p className="otp-error" role="alert">
                  {error}
                </p>
              )}

              <div className="otp-resend">
                <span>
                  {countdown > 0
                    ? `Resend code in 00:${String(countdown).padStart(2, "0")}`
                    : "Didn't receive the code?"}
                </span>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={countdown > 0 || resending || loading}
                >
                  {resending ? (
                    <RefreshCw size={14} className="otp-spin" />
                  ) : (
                    "Resend OTP"
                  )}
                </button>
              </div>

              <button
                type="submit"
                className="otp-verify-button"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>

            {mode === "demo" && (
              <p className="otp-demo-note">
                Demo mode · Use 123456 to test verification.
              </p>
            )}
          </>
        )}

        {step === "password" && (
          <>
            <div className="otp-icon">
              <LockKeyhole size={32} />
            </div>

            <h2 id="otp-title">Reset Password</h2>

            <p className="otp-description">
              Create a new password for your account.
            </p>

            <div className="otp-verified-badge">
              <CheckCircle2 size={16} />
              OTP verified successfully
            </div>

            <form className="otp-password-form" onSubmit={handleResetPassword}>
              <label htmlFor="otp-new-password">New Password</label>

              <div className="otp-password-field">
                <input
                  id="otp-new-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(event) => {
                    setNewPassword(event.target.value);
                    setError("");
                  }}
                  disabled={loading}
                  required
                />

                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((previous) => !previous)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <p className="otp-password-hint">
                At least 8 characters, including uppercase, lowercase, a number
                and a special character.
              </p>

              <label htmlFor="otp-confirm-password">Re-enter Password</label>

              <div className="otp-password-field">
                <input
                  id="otp-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setError("");
                  }}
                  disabled={loading}
                  required
                />

                <button
                  type="button"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  onClick={() =>
                    setShowConfirmPassword((previous) => !previous)
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {error && (
                <p className="otp-error" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="otp-verify-button otp-reset-button"
                disabled={loading}
              >
                {loading ? "Resetting Password..." : "Reset Password"}
              </button>

              <button
                type="button"
                className="otp-back-button"
                onClick={handleBackToOtp}
                disabled={loading}
              >
                <ArrowLeft size={16} />
                Back to OTP
              </button>
            </form>

            {mode === "demo" && (
              <p className="otp-demo-note">
                Demo mode · No actual password will be changed.
              </p>
            )}
          </>
        )}

        {step === "success" && (
          <div className="otp-success">
            <div className="otp-success-icon">
              <CheckCircle2 size={38} />
            </div>

            <h2 id="otp-title">
              {purpose === "forgot-password"
                ? "Password Reset Successful"
                : "Verification Successful"}
            </h2>

            <p className="otp-description">
              {mode === "demo"
                ? "Demo completed successfully. No actual account password was changed."
                : "Your password has been updated successfully."}
            </p>

            <button
              type="button"
              className="otp-verify-button"
              onClick={handleFinish}
            >
              Continue to Login
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
