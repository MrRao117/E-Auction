import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  cancelRegistration,
  checkAuctionRegistration,
  getAuctionRegistrationCount,
  registerForAuction,
} from "../../api/auction/auctionRegistrationApi";
import LoginForm from "../Auth/LoginForm";
import "./RegisterForAuction.css";

export default function RegisterForAuction({
  product,
  user,
  onClose,
  onRegister,
}) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [participantCount, setParticipantCount] = useState(0);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [checkingRegistration, setCheckingRegistration] = useState(false);

  const authUser = useSelector((state) => state.auth?.user);
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  const currentUser = (isAuthenticated && authUser) || user || null;

  const fullName =
    currentUser?.fullName ?? currentUser?.name ?? currentUser?.username ?? "";
  const email = currentUser?.email ?? "";

  // AuctionRegistration uses userId + auctionId as its composite key.
  // registeredAt is generated automatically by the backend.
  const auctionId = product?.id ?? product?.auctionId ?? "";

  const images =
    product?.images?.length > 0
      ? product.images
      : [product?.image].filter(Boolean);

  const fallbackImage = "https://placehold.co/600x400?text=Auction+Product";

  const productImages = images.length > 0 ? images : [fallbackImage];

  const [remainingSeconds, setRemainingSeconds] = useState(
    product?.remainingSeconds ??
      product?.timeLeftSeconds ??
      2 * 3600 + 15 * 60 + 43,
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSeconds((previous) => Math.max(0, previous - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setSelectedImage(0);
  }, [product]);

  // Fetch the authoritative participant count from the backend and check
  // whether the currently logged-in buyer has already registered.
  useEffect(() => {
    if (!auctionId) {
      setParticipantCount(0);
      setAlreadyRegistered(false);
      return undefined;
    }

    let active = true;

    const loadRegistrationInfo = async () => {
      try {
        const countResponse = await getAuctionRegistrationCount(auctionId);
        const rawCount =
          typeof countResponse === "number"
            ? countResponse
            : (countResponse?.count ??
              countResponse?.totalCount ??
              countResponse?.registrationCount ??
              countResponse?.data?.count ??
              countResponse?.data?.totalCount ??
              countResponse?.data);

        const parsedCount = Number(rawCount);
        if (active) {
          setParticipantCount(
            rawCount !== null &&
              rawCount !== undefined &&
              rawCount !== "" &&
              Number.isFinite(parsedCount)
              ? parsedCount
              : 0,
          );
        }
      } catch (error) {
        console.error("Failed to fetch auction registration count:", error);
        if (active) setParticipantCount(0);
      }

      if (!currentUser) {
        if (active) {
          setAlreadyRegistered(false);
          setCheckingRegistration(false);
        }
        return;
      }

      try {
        if (active) setCheckingRegistration(true);
        const registrationResponse = await checkAuctionRegistration(auctionId);
        const registrationValue =
          typeof registrationResponse === "boolean"
            ? registrationResponse
            : (registrationResponse?.isRegistered ??
              registrationResponse?.registered ??
              registrationResponse?.data?.isRegistered ??
              registrationResponse?.data?.registered ??
              registrationResponse?.data);

        if (active) setAlreadyRegistered(registrationValue === true);
      } catch (error) {
        // If the check endpoint fails, leave registration available; the
        // backend must still reject duplicate registrations.
        console.error("Failed to check auction registration:", error);
        if (active) setAlreadyRegistered(false);
      } finally {
        if (active) setCheckingRegistration(false);
      }
    };

    loadRegistrationInfo();

    return () => {
      active = false;
    };
  }, [auctionId, currentUser]);

  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  const formatTime = (value) => String(value).padStart(2, "0");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (!currentUser) {
      setErrorMessage("Please log in to register for this auction.");
      return;
    }
    if (!acceptedTerms) return;
    if (alreadyRegistered) {
      setErrorMessage("You have already registered for this auction.");
      return;
    }
    if (!auctionId) {
      setErrorMessage("Auction ID is missing for this product.");
      return;
    }

    setLoading(true);
    try {
      // The backend identifies the logged-in user from the authentication token.
      // Prefer the parent callback when provided; otherwise call the API directly.
      const registerAction = onRegister ?? registerForAuction;
      await registerAction(Number(auctionId));
      // Update the displayed total immediately after successful registration.
      setParticipantCount((previous) =>
        typeof previous === "number" ? previous + 1 : 1,
      );
      setAlreadyRegistered(true);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async () => {
    setErrorMessage("");

    if (!currentUser) {
      setErrorMessage("Please log in to cancel your registration.");
      return;
    }

    if (!auctionId) {
      setErrorMessage("Auction ID is missing for this product.");
      return;
    }

    if (!alreadyRegistered) {
      setErrorMessage("You are not registered for this auction.");
      return;
    }

    setCancelLoading(true);

    try {
      await cancelRegistration(Number(auctionId));

      setAlreadyRegistered(false);
      setParticipantCount((previous) => Math.max(0, Number(previous || 0) - 1));
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to cancel registration. Please try again.",
      );
    } finally {
      setCancelLoading(false);
    }
  };

  const basePrice = product?.basePrice ?? product?.startingPrice ?? 75000;

  const formatPrice = (price) => Number(price).toLocaleString("en-IN");

  return (
    <div
      className="register-auction-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        className="register-auction-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-auction-title"
      >
        <button
          type="button"
          className="register-auction-close"
          onClick={onClose}
          aria-label="Close registration"
        >
          ×
        </button>

        {/* LEFT: PRODUCT DETAILS */}
        <section className="register-product-section">
          <div className="register-product-gallery">
            <div className="register-main-image">
              <img
                src={productImages[selectedImage]}
                alt={product?.title || "Auction product"}
              />

              <span className="register-live-badge">
                <span className="register-live-dot" />
                LIVE AUCTION
              </span>

              {productImages.length > 1 && (
                <>
                  <button
                    type="button"
                    className="register-image-arrow register-image-prev"
                    onClick={() =>
                      setSelectedImage(
                        (selectedImage - 1 + productImages.length) %
                          productImages.length,
                      )
                    }
                    aria-label="Previous image"
                  >
                    ‹
                  </button>

                  <button
                    type="button"
                    className="register-image-arrow register-image-next"
                    onClick={() =>
                      setSelectedImage(
                        (selectedImage + 1) % productImages.length,
                      )
                    }
                    aria-label="Next image"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            <div className="register-thumbnail-list">
              {productImages.map((image, index) => (
                <button
                  type="button"
                  key={`${image}-${index}`}
                  className={`register-thumbnail ${
                    selectedImage === index ? "register-thumbnail-active" : ""
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={image} alt={`Product view ${index + 1}`} />
                </button>
              ))}
            </div>
          </div>

          <h2 className="register-product-title">
            {product?.title || "MacBook Pro M3 14″ (2024)"}
          </h2>

          <div className="register-product-meta">
            <span>{product?.brand || "Apple"}</span>
            <span>•</span>
            <span>{product?.category || "Electronics"}</span>
          </div>

          <div className="register-product-tags">
            <span>New</span>
            <span>Free Shipping</span>
            <span>Original Product</span>
            <span>Verified Seller</span>
          </div>

          <p className="register-product-description">
            {product?.description ||
              "A verified auction item available through our trusted marketplace. Review the product information carefully before registering."}
          </p>

          <div className="register-product-specs">
            <div>
              <strong>◆</strong>
              <span>{product?.chip || "Apple M3"}</span>
              <small>Chip</small>
            </div>

            <div>
              <strong>▦</strong>
              <span>{product?.ram || "16 GB"}</span>
              <small>Unified RAM</small>
            </div>

            <div>
              <strong>▣</strong>
              <span>{product?.storage || "512 GB"}</span>
              <small>SSD Storage</small>
            </div>

            <div>
              <strong>▱</strong>
              <span>{product?.screenSize || '14"'}</span>
              <small>Display</small>
            </div>
          </div>

          <div className="register-auction-summary">
            <div className="register-auction-status">
              <span>
                <i className="register-live-dot" />
                Live Auction
              </span>

              <small>
                {product?.endTime
                  ? `Ends ${product.endTime}`
                  : "Ends Today, 6:30 PM"}
              </small>
            </div>

            <div className="register-countdown">
              <div>
                <strong>{formatTime(hours)}</strong>
                <span>Hours</span>
              </div>

              <div>
                <strong>{formatTime(minutes)}</strong>
                <span>Minutes</span>
              </div>

              <div>
                <strong>{formatTime(seconds)}</strong>
                <span>Seconds</span>
              </div>
            </div>
          </div>

          <div className="register-price-participants">
            <div className="register-base-price">
              <span className="register-summary-icon">₹</span>

              <div>
                <small>Base Price</small>
                <strong>₹ {formatPrice(basePrice)}</strong>
              </div>
            </div>

            <div className="register-participants">
              <span className="register-summary-icon">♟</span>

              <div>
                <small>Total Participants</small>
                <strong>{participantCount}</strong>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT: LOGIN OR REGISTRATION */}
        <section className="register-form-section">
          {!currentUser ? (
            <>
              <div className="register-form-heading">
                <span className="register-heading-icon">♙</span>
                <h1 id="register-auction-title">Sign in to Register</h1>
              </div>
              <p className="register-form-subtitle">
                Please sign in with your buyer account to register for this
                auction.
              </p>
              <div className="register-login-form-wrapper">
                <LoginForm
                  setActiveTab={(tab) => {
                    if (tab === "register") {
                      onClose?.();
                    }
                  }}
                />
              </div>
              <div className="register-security-box">
                <span className="register-security-icon">✓</span>
                <div>
                  <strong>Secure &amp; Fair Auction</strong>
                  <p>Sign in to continue with your auction registration.</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="register-form-heading">
                <span className="register-heading-icon">♟</span>

                <h1 id="register-auction-title">Register for Auction</h1>
              </div>

              <p className="register-form-subtitle">
                Register first to participate in this auction. It's quick and
                easy!
              </p>

              <div className="register-why-box">
                <div className="register-info-icon">i</div>

                <div>
                  <h3>Why register?</h3>

                  <ul>
                    <li>Required to place bids in this auction</li>
                    <li>Free registration</li>
                    <li>Only verified users can participate</li>
                  </ul>
                </div>
              </div>

              <form className="register-auction-form" onSubmit={handleSubmit}>
                <h3 className="register-details-title">Registration Details</h3>

                <div className="register-field">
                  <label htmlFor="register-user-name">Full Name</label>
                  <div className="register-input-wrapper">
                    <span className="register-input-icon">♙</span>
                    <input
                      id="register-user-name"
                      name="fullName"
                      type="text"
                      placeholder="Log in to view your name"
                      value={fullName}
                      autoComplete="name"
                      readOnly
                      required
                    />
                  </div>
                </div>

                <div className="register-field">
                  <label htmlFor="register-email">Email Address</label>
                  <div className="register-input-wrapper">
                    <span className="register-input-icon">✉</span>
                    <input
                      id="register-email"
                      name="email"
                      type="email"
                      placeholder="Log in to view your email"
                      value={email}
                      autoComplete="email"
                      readOnly
                      required
                    />
                  </div>
                </div>

                {!currentUser && (
                  <p role="status" className="register-lookup-error">
                    Please log in to continue with auction registration.
                  </p>
                )}
                {errorMessage && (
                  <p role="alert" className="register-lookup-error">
                    {errorMessage}
                  </p>
                )}

                <div className="register-field">
                  <label htmlFor="register-auction-id">Auction ID</label>
                  <div className="register-input-wrapper">
                    <span className="register-input-icon">♟</span>
                    <input
                      id="register-auction-id"
                      name="auctionId"
                      type="text"
                      value={auctionId}
                      readOnly
                      required
                    />
                  </div>
                </div>

                <label className="register-terms">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(event) => setAcceptedTerms(event.target.checked)}
                  />
                  <span>
                    I agree to the{" "}
                    <a href="/auction-terms" target="_blank" rel="noreferrer">
                      Auction Terms &amp; Conditions
                    </a>
                  </span>
                </label>

                <button
                  type="submit"
                  className="register-submit-button"
                  disabled={
                    !acceptedTerms ||
                    loading ||
                    checkingRegistration ||
                    !currentUser ||
                    !auctionId ||
                    alreadyRegistered
                  }
                >
                  <span>♟</span>
                  {loading
                    ? "Registering..."
                    : checkingRegistration
                      ? "Checking Registration..."
                      : alreadyRegistered
                        ? "Already Registered"
                        : "Register for Auction"}
                </button>

                {alreadyRegistered && (
                  <button
                    type="button"
                    className="register-submit-button register-cancel-button"
                    onClick={handleCancelRegistration}
                    disabled={loading || cancelLoading || checkingRegistration}
                  >
                    {cancelLoading
                      ? "Cancelling Registration..."
                      : "Cancel Registration"}
                  </button>
                )}
              </form>

              <div className="register-security-box">
                <span className="register-security-icon">✓</span>

                <div>
                  <strong>Secure &amp; Fair Auction</strong>
                  <p>
                    Your registration will be verified and you can start bidding
                    once eligible.
                  </p>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
