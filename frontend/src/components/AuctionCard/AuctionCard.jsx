import { useEffect, useState } from "react";

import "./AuctionCard.css";

/* =========================================================
   GET AUCTION COUNTDOWN
========================================================= */

const getAuctionCountdown = (startTime, endTime, now) => {
  const startMs = startTime ? new Date(startTime).getTime() : NaN;
  const endMs = endTime ? new Date(endTime).getTime() : NaN;

  // Missing or invalid timestamps
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

  // Auction has not started
  if (now < startMs) {
    return {
      remainingSeconds: Math.max(0, Math.floor((startMs - now) / 1000)),
      status: "UPCOMING",
    };
  }

  // Auction has ended
  if (now >= endMs) {
    return {
      remainingSeconds: 0,
      status: "ENDED",
    };
  }

  // Auction is currently live
  return {
    remainingSeconds: Math.max(0, Math.floor((endMs - now) / 1000)),
    status: "LIVE",
  };
};

/* =========================================================
   FORMAT COUNTDOWN
========================================================= */

const formatTime = (value) => {
  if (value === null || value === undefined) {
    return "--";
  }

  return String(value).padStart(2, "0");
};

/* =========================================================
   AUCTION CARD
========================================================= */

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
}) {
  /* =========================================================
     REAL-TIME CLOCK
  ========================================================= */

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /* =========================================================
     COUNTDOWN CALCULATION
  ========================================================= */

  const countdown = getAuctionCountdown(startTime, endTime, now);

  const remainingSeconds = countdown.remainingSeconds;

  const hours =
    remainingSeconds === null ? null : Math.floor(remainingSeconds / 3600);

  const minutes =
    remainingSeconds === null
      ? null
      : Math.floor((remainingSeconds % 3600) / 60);

  const seconds = remainingSeconds === null ? null : remainingSeconds % 60;

  /* =========================================================
     SELLER INITIAL
  ========================================================= */

  const sellerInitial =
    (typeof seller === "string" ? seller.trim().charAt(0).toUpperCase() : "") ||
    "S";

  /* =========================================================
     OPEN PRODUCT DETAILS
  ========================================================= */

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

  /* =========================================================
     KEYBOARD ACCESSIBILITY
  ========================================================= */

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCardClick();
    }
  };

  /* =========================================================
     RETURN
  ========================================================= */

  return (
    <article
      className="auction-card"
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      {/* PRODUCT IMAGE */}

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

        {/* VERIFIED */}

        {verified && (
          <div className="auction-verified">
            <span className="verified-check">✓</span>
            <span>Verified</span>
          </div>
        )}

        {/* WISHLIST */}

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

        {/* IMAGE COUNT */}

        <div className="auction-image-count">
          <span className="image-count-icon">▧</span>
          <span>1 / {imageCount}</span>
        </div>
      </div>

      {/* CARD CONTENT */}

      <div className="auction-card-content">
        {/* AUCTION ID */}

        <div className="auction-id">
          <span>Auction ID:</span>
          <strong>{auctionId || "N/A"}</strong>
        </div>

        {/* PRODUCT NAME */}

        <h3 className="auction-title">{title || "---"}</h3>

        {/* CATEGORY */}

        <div className="auction-category">
          <span className="category-icon">◉</span>
          <span>{category || "---"}</span>
        </div>

        {/* SELLER */}

        <div className="auction-seller">
          <div className="seller-avatar">{sellerInitial}</div>

          <div className="seller-details">
            <span className="seller-label">Seller</span>
            <span className="seller-name">{seller || "---"}</span>
          </div>
        </div>

        {/* COUNTDOWN - NO LABEL */}

        <div className="auction-bottom">
          <div className="auction-time">
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
          </div>
        </div>
      </div>
    </article>
  );
}
