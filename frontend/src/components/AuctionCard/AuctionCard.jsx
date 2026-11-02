import { useEffect, useState } from "react";
import "./AuctionCard.css";

// Get auction countdown
const getAuctionCountdown = (startTime, endTime, now) => {
  const startMs = startTime ? new Date(startTime).getTime() : NaN;
  const endMs = endTime ? new Date(endTime).getTime() : NaN;

  if (
    !Number.isFinite(startMs) ||
    !Number.isFinite(endMs) ||
    endMs <= startMs
  ) {
    return {
      remainingSeconds: null,
      status: "INVALID",
    };
  }

  if (now < startMs) {
    return {
      remainingSeconds: Math.max(0, Math.floor((startMs - now) / 1000)),
      status: "UPCOMING",
    };
  }

  if (now >= endMs) {
    return {
      remainingSeconds: 0,
      status: "ENDED",
    };
  }

  return {
    remainingSeconds: Math.max(0, Math.floor((endMs - now) / 1000)),
    status: "LIVE",
  };
};

// Format countdown
const formatTime = (value) => {
  if (value === null || value === undefined) {
    return "--";
  }

  return String(value).padStart(2, "0");
};

// Auction card component
export default function AuctionCard({
  auctionId,
  productId,
  image,
  title,
  seller,
  category,
  description,
  basePrice,
  currHighestBid,
  startTime,
  endTime,
  auctionStatus,
  product,
  timeLeft,
  imageCount = 5,
  verified = true,
  onProductClick,
  showLiveBadge = false,
}) {
  // Real-time clock
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Calculate countdown
  const countdown = getAuctionCountdown(startTime, endTime, now);
  const remainingSeconds = countdown.remainingSeconds;

  const hours =
    remainingSeconds === null ? null : Math.floor(remainingSeconds / 3600);

  const minutes =
    remainingSeconds === null
      ? null
      : Math.floor((remainingSeconds % 3600) / 60);

  const seconds = remainingSeconds === null ? null : remainingSeconds % 60;

  // Get seller initial
  const sellerInitial =
    (typeof seller === "string" ? seller.trim().charAt(0).toUpperCase() : "") ||
    "S";

  // Open product details
  const handleCardClick = () => {
    if (typeof onProductClick !== "function") {
      return;
    }

    onProductClick({
      auctionId,
      productId,
      image,
      title,
      seller,
      category,
      description,
      basePrice,
      currHighestBid,
      startTime,
      endTime,
      auctionStatus,
      product,
      timeLeft: remainingSeconds,
      remainingSeconds,
      imageCount,
      verified,
    });
  };

  // Handle keyboard accessibility
  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCardClick();
    }
  };

  return (
    <article
      className="auction-card"
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      {/* Product image */}
      <div className="auction-image-wrapper">
        {image ? (
          <img
            src={image}
            alt={title || "Auction product"}
            className="auction-image"
          />
        ) : (
          <div className="auction-image auction-image-placeholder">
            Image not available
          </div>
        )}

        {/* Verified badge */}
        {verified && (
          <div className="auction-verified">
            <span className="verified-check">✓</span>
            <span>Verified</span>
          </div>
        )}

        {/* Wishlist button */}
        <button
          type="button"
          className="auction-wishlist"
          aria-label="Add to wishlist"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          ♡
        </button>

        {/* Image count */}
        <div className="auction-image-count">
          <span className="image-count-icon">▧</span>
          <span>1 / {imageCount}</span>
        </div>
      </div>

      {/* Card content */}
      <div className="auction-card-content">
        {/* Auction ID */}
        <div className="auction-id">
          <span>Auction ID:</span>
          <strong>{auctionId || "N/A"}</strong>
        </div>

        {/* Product name */}
        <h3 className="auction-title">{title || "---"}</h3>

        {/* Category */}
        <div className="auction-category">
          <span className="category-icon">◉</span>
          <span>{category || "---"}</span>
        </div>

        {/* Seller details */}
        <div className="auction-seller">
          <div className="seller-avatar">{sellerInitial}</div>

          <div className="seller-details">
            <span className="seller-label">Seller</span>
            <span className="seller-name">{seller || "---"}</span>
          </div>
        </div>

        {/* Countdown or LIVE badge */}
        <div className="auction-bottom">
          <div className="auction-time">
            {showLiveBadge ? (
              <div className="auction-live-badge">
                <span className="auction-live-indicator"></span>
                <span>LIVE NOW</span>
              </div>
            ) : (
              <div className="time-details">
                <div className="countdown">
                  <div className="countdown-box">
                    <strong>{formatTime(hours)}</strong>
                    <small>HH</small>
                  </div>

                  <span className="countdown-separator">:</span>

                  <div className="countdown-box">
                    <strong>{formatTime(minutes)}</strong>
                    <small>MM</small>
                  </div>

                  <span className="countdown-separator">:</span>

                  <div className="countdown-box">
                    <strong>{formatTime(seconds)}</strong>
                    <small>SS</small>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
