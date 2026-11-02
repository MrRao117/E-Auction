import {
  Clock,
  Eye,
  Gavel,
  Maximize,
  Radio,
  ShieldCheck,
  Star,
  X,
} from "lucide-react";

import { useCallback, useEffect, useState } from "react";

import { getAuctionById } from "../../api/auction/auctionApi";
import { getAuctionRegistrationCount } from "../../api/auction/auctionRegistrationApi";
import {
  getBidCountForAuction,
  getBidsByAuctionId,
  getHighestBidForAuction,
  placeBid,
} from "../../api/bid/bidApi";
import { getProductById } from "../../api/product/productApi";

import "./LiveAuction.css";

const getImages = (item = {}) => {
  // The product state starts as null; normalize it before reading properties.
  item = item && typeof item === "object" ? item : {};
  const nested = item.product || {};
  const productDetails = item.productDetails || {};

  const possible = [
    item.image,
    item.imageUrl,
    item.imageURL,
    item.productImage,
    item.productImageUrl,
    item.productImagesUrl,
    item.imagePath,
    item.images,
    item.imageUrls,
    item.productImages,
    item.photos,
    item.imageList,
    item.imagePaths,

    nested.image,
    nested.imageUrl,
    nested.imageURL,
    nested.productImage,
    nested.productImageUrl,
    nested.productImagesUrl,
    nested.imagePath,
    nested.images,
    nested.imageUrls,
    nested.productImages,
    nested.photos,
    nested.imageList,
    nested.imagePaths,

    productDetails.image,
    productDetails.imageUrl,
    productDetails.imageURL,
    productDetails.productImage,
    productDetails.images,
    productDetails.imageUrls,
  ];

  const extractImages = (value) => {
    if (value == null || value === "") return [];

    if (Array.isArray(value)) {
      return value.flatMap(extractImages);
    }

    if (typeof value === "object") {
      return extractImages(
        value.imageUrl ??
          value.imageURL ??
          value.image ??
          value.url ??
          value.imagePath,
      );
    }

    if (typeof value !== "string") return [];

    let cleaned = value.trim();
    if (!cleaned) return [];

    // Decode JSON/string wrappers such as:
    // ["data:image/png;base64,..."] or "%22data:image/png;base64,...%22"
    if (
      cleaned.includes("%22") ||
      cleaned.includes("%5B") ||
      cleaned.includes("%5D")
    ) {
      try {
        const decoded = decodeURIComponent(cleaned);
        if (decoded !== cleaned) cleaned = decoded.trim();
      } catch {
        // Continue with the original string if it is not valid URI encoding.
      }
    }

    // Parse JSON arrays and JSON-encoded strings when possible.
    if (
      (cleaned.startsWith("[") && cleaned.endsWith("]")) ||
      (cleaned.startsWith('"') && cleaned.endsWith('"'))
    ) {
      try {
        const parsed = JSON.parse(cleaned);
        if (parsed !== cleaned) return extractImages(parsed);
      } catch {
        // Continue with safe wrapper cleanup below.
      }
    }

    // Recover a single image if an array/string wrapper was partially encoded.
    cleaned = cleaned
      .replace(/^\s*\[\s*/, "")
      .replace(/\s*\]\s*$/, "")
      .replace(/^["']+|["']+$/g, "")
      .trim();

    if (!cleaned) return [];

    // A remaining JSON delimiter means this is not a clean image source.
    if (cleaned.startsWith("{") || cleaned.startsWith("[")) return [];

    return [cleaned];
  };

  return [
    ...new Set(
      possible
        .flatMap(extractImages)
        .map((url) => url.trim())
        .filter(Boolean),
    ),
  ].slice(0, 6);
};

const formatCurrency = (amount) => {
  if (amount == null || amount === "") return "---";

  return `₹ ${Number(amount).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};

const formatTime = (seconds) => {
  if (seconds == null || seconds <= 0) return "00h 00m 00s";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(
    2,
    "0",
  )}m ${String(secs).padStart(2, "0")}s`;
};

const formatDateTime = (value) => {
  if (!value) return "---";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "---";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getResponseData = (response) => response?.data ?? response;

// Percentage sequence: 2%, 3%, 4% ... 10%, 10.2%, 10.4% ...
const getIncrementPercentage = (bidCount) => {
  const count = Math.max(0, Number(bidCount) || 0);

  if (count < 9) {
    return 2 + count;
  }

  return 10 + (count - 8) * 0.2;
};

function LiveAuction({ auctionId, onBack }) {
  const [auction, setAuction] = useState(null);
  const [product, setProduct] = useState(null);

  const [bids, setBids] = useState([]);
  const [participantCount, setParticipantCount] = useState(0);
  const [bidCount, setBidCount] = useState(0);

  const [currentBid, setCurrentBid] = useState(null);

  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState("Description");
  const [showImageModal, setShowImageModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [bidLoading, setBidLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const [message, setMessage] = useState("");
  const [currentTime, setCurrentTime] = useState(Date.now());

  const productImages = getImages(product);
  const imageUrl = productImages[activeImage] || productImages[0] || "";

  const startTime = auction?.startTime
    ? new Date(auction.startTime).getTime()
    : null;

  const endTime = auction?.endTime ? new Date(auction.endTime).getTime() : null;

  const auctionStarted = startTime != null && currentTime >= startTime;

  const auctionEnded = endTime != null && currentTime >= endTime;

  const timeLeft =
    endTime != null
      ? Math.max(0, Math.floor((endTime - currentTime) / 1000))
      : null;

  const incrementPercentage = getIncrementPercentage(bidCount);

  const bidIncrement =
    currentBid != null
      ? Number(((Number(currentBid) * incrementPercentage) / 100).toFixed(2))
      : 0;

  const minimumBid =
    currentBid != null
      ? Number((Number(currentBid) + bidIncrement).toFixed(2))
      : null;

  const tabs = [
    "Description",
    "Specifications",
    "Shipping & Delivery",
    "Terms",
  ];

  //
  // FETCH AUCTION, PRODUCT, BIDS, AND PARTICIPANTS
  //

  const fetchAuctionData = useCallback(
    async (showLoader = false) => {
      if (!auctionId) {
        setLoading(false);
        setMessage("Auction ID is missing.");
        return;
      }

      if (showLoader) {
        setLoading(true);
      }

      try {
        const auctionResponse = await getAuctionById(auctionId);
        const auctionData = getResponseData(auctionResponse);

        setAuction(auctionData);

        let productData = null;

        if (auctionData?.productId) {
          try {
            const productResponse = await getProductById(auctionData.productId);

            productData = getResponseData(productResponse);
            setProduct(productData);
          } catch (error) {
            console.error("Failed to fetch product:", error);
            setProduct(null);
          }
        }

        const basePrice =
          productData?.basePrice ?? auctionData?.basePrice ?? null;

        const [
          historyResult,
          highestResult,
          countResult,
          participantCountResult,
        ] = await Promise.allSettled([
          getBidsByAuctionId(auctionId),
          getHighestBidForAuction(auctionId),
          getBidCountForAuction(auctionId),
          getAuctionRegistrationCount(auctionId),
        ]);

        // Bid history
        if (historyResult.status === "fulfilled") {
          const historyData = getResponseData(historyResult.value);

          setBids(Array.isArray(historyData) ? historyData : []);
        }

        // Current highest bid
        let latestBid = basePrice;

        if (highestResult.status === "fulfilled") {
          const highestData = getResponseData(highestResult.value);

          if (highestData?.bidAmount != null) {
            latestBid = Number(highestData.bidAmount);
          } else if (auctionData?.currHighestBid != null) {
            latestBid = Number(auctionData.currHighestBid);
          }
        } else if (auctionData?.currHighestBid != null) {
          latestBid = Number(auctionData.currHighestBid);
        }

        setCurrentBid(latestBid != null ? Number(latestBid) : null);

        // Total bid count
        if (countResult.status === "fulfilled") {
          const countData = getResponseData(countResult.value);

          const count =
            typeof countData === "number"
              ? countData
              : Number(
                  countData?.bidCount ??
                    countData?.totalBids ??
                    countData?.count ??
                    0,
                );

          setBidCount(Number.isFinite(count) ? count : 0);
        }

        // Total registered participants
        if (participantCountResult.status === "fulfilled") {
          const countData = getResponseData(participantCountResult.value);

          const count =
            typeof countData === "number"
              ? countData
              : Number(
                  countData?.totalRegistrations ??
                    countData?.registrationCount ??
                    countData?.count ??
                    0,
                );

          setParticipantCount(Number.isFinite(count) ? count : 0);
        }
      } catch (error) {
        console.error("Failed to fetch auction details:", error);
        setMessage("Failed to load auction details.");
      } finally {
        setLoading(false);
      }
    },
    [auctionId],
  );

  useEffect(() => {
    fetchAuctionData(true);
  }, [fetchAuctionData]);

  // Refresh auction information every 3 seconds
  useEffect(() => {
    if (!auctionId) return undefined;

    const refreshTimer = setInterval(() => {
      fetchAuctionData(false);
    }, 3000);

    return () => clearInterval(refreshTimer);
  }, [auctionId, fetchAuctionData]);

  // Update the countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Enforce a 3-second cooldown after a successful bid
  useEffect(() => {
    if (cooldown <= 0) return undefined;

    const timer = setTimeout(() => {
      setCooldown((previous) => Math.max(previous - 1, 0));
    }, 1000);

    return () => clearTimeout(timer);
  }, [cooldown]);

  //
  // IMAGE CONTROLS
  //

  const changeImage = (direction) => {
    if (productImages.length <= 1) return;

    setActiveImage((previous) => {
      if (direction === "next") {
        return (previous + 1) % productImages.length;
      }

      return (previous - 1 + productImages.length) % productImages.length;
    });
  };

  //
  // PLACE BID
  //

  const handlePlaceBid = async () => {
    if (!auctionId) {
      setMessage("Auction ID is missing.");
      return;
    }

    if (!auctionStarted) {
      setMessage("This auction has not started yet.");
      return;
    }

    if (auctionEnded || timeLeft === 0) {
      setMessage("This auction has ended.");
      return;
    }

    if (bidLoading || cooldown > 0) {
      return;
    }

    // Prevent the auction creator from bidding on their own auction.
    // The login flow stores the current user's email in localStorage as sellerEmail.
    const currentUserEmail = localStorage.getItem("sellerEmail")?.trim();
    const auctionSellerEmail = product?.sellerEmail?.trim();

    if (
      currentUserEmail &&
      auctionSellerEmail &&
      currentUserEmail.toLowerCase() === auctionSellerEmail.toLowerCase()
    ) {
      setMessage("You created this auction, so you can't bid on it.");
      return;
    }

    // The bid amount is calculated automatically and cannot be edited.
    const amount = minimumBid;

    if (amount == null || !Number.isFinite(amount) || amount <= 0) {
      setMessage("The next bid amount could not be calculated.");
      return;
    }

    setBidLoading(true);
    setMessage("");

    try {
      await placeBid(auctionId, {
        bidAmount: amount,
      });

      setCurrentBid(amount);
      setCooldown(3);

      setMessage("Your bid has been placed successfully!");

      await fetchAuctionData(false);
    } catch (error) {
      console.error("Failed to place bid:", error);

      const status = error?.response?.status;
      const backendMessage =
        error?.response?.data?.message || error?.response?.data?.error;

      // Prefer the actual backend validation message when available.
      // Use a login prompt only when the backend did not provide a message.
      const errorMessage =
        backendMessage ||
        (status === 401
          ? "Please log in to place a bid."
          : "Failed to place your bid. Please try again.");

      setMessage(errorMessage);
    } finally {
      setBidLoading(false);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  //
  // LOADING / ERROR STATES
  //

  if (loading) {
    return (
      <div className="live-auction-page">
        <div className="la-card" style={{ padding: "40px" }}>
          Loading auction details...
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="live-auction-page">
        <div className="la-card" style={{ padding: "40px" }}>
          <p>{message || "Auction details are unavailable."}</p>
          <button
            type="button"
            className="la-outline-button"
            onClick={handleBack}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  //
  // MAIN UI
  //

  return (
    <div className="live-auction-page">
      <div className="la-topbar">
        <button className="la-back-button" type="button" onClick={handleBack}>
          <span aria-hidden="true">←</span> Back
        </button>
      </div>
      <main className="la-main-grid">
        <div className="la-left-column">
          <section className="la-gallery la-layout-photo">
            <div className="la-main-image">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={
                    product?.pname || auction?.productTitle || "Auction product"
                  }
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                    event.currentTarget.parentElement?.classList.add(
                      "la-image-failed",
                    );
                  }}
                />
              ) : (
                <div className="la-image-placeholder">
                  Product image unavailable
                </div>
              )}
              <div className="la-live-badge">
                <Radio size={18} />
                {auctionEnded ? "AUCTION ENDED" : "LIVE AUCTION"}
              </div>
              {imageUrl && (
                <button
                  className="la-image-expand"
                  onClick={() => setShowImageModal(true)}
                  aria-label="Expand image"
                  type="button"
                >
                  <Maximize size={20} />
                </button>
              )}
              <div className="la-image-count">
                {imageUrl
                  ? `${activeImage + 1} / ${productImages.length}`
                  : "No image"}
              </div>
            </div>
          </section>

          <section
            className="la-other-photos"
            aria-label="Other product photos"
          >
            {productImages.length > 1 ? (
              <div className="la-other-photos-list">
                {productImages.map((photo, index) => (
                  <button
                    key={`${photo}-${index}`}
                    type="button"
                    className={`la-other-photo ${activeImage === index ? "active" : ""}`}
                    onClick={() => setActiveImage(index)}
                    aria-label={`View product photo ${index + 1}`}
                  >
                    <img
                      src={photo}
                      alt={`${product?.pname || "Product"} view ${index + 1}`}
                    />
                  </button>
                ))}
              </div>
            ) : (
              <p className="la-no-other-photos">
                No additional product photos available.
              </p>
            )}
          </section>
        </div>

        <div className="la-right-layout">
          <div className="la-info-cards-grid">
            <section className="la-product-info-card la-layout-product-info">
              <h2 className="la-auction-details-title">Auction Details</h2>
              <hr className="la-auction-details-divider" />
              <div className="la-product-info-split">
                <div className="la-product-info-main">
                  <div className="la-product-details-layout">
                    <div
                      className="la-auction-meta-grid"
                      aria-label="Auction information"
                    >
                      <div className="la-auction-meta-item">
                        <span>Auction ID:</span>
                        <strong>
                          {auction?.auctionId ??
                            auction?.id ??
                            auction?.auction_id ??
                            "---"}
                        </strong>
                      </div>
                      <div className="la-auction-meta-item la-product-category-box">
                        <span>Product Category:</span>
                        <strong>
                          {product?.categoryName ||
                            product?.category?.categoryName ||
                            product?.category?.name ||
                            "Unavailable"}
                        </strong>
                      </div>
                    </div>
                    <div className="la-product-name-row">
                      <span className="la-product-field-label">
                        Product Name:
                      </span>
                      <span className="la-product-field-value la-product-name-value">
                        {product?.pname || auction?.productTitle || "Product"}
                      </span>
                    </div>
                    <div className="la-auction-time-grid">
                      <div className="la-auction-meta-item">
                        <span>Start Time:</span>
                        <strong>
                          {formatDateTime(
                            auction?.startTime ??
                              auction?.startDateTime ??
                              auction?.start_time,
                          )}
                        </strong>
                      </div>
                      <div className="la-auction-meta-item">
                        <span>End Time:</span>
                        <strong>
                          {formatDateTime(
                            auction?.endTime ??
                              auction?.endDateTime ??
                              auction?.end_time,
                          )}
                        </strong>
                      </div>
                    </div>
                    <div className="la-product-description">
                      <strong className="la-product-field-label">
                        Product Description
                      </strong>
                      <p>
                        {product?.description ||
                          "No product description available."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <aside className="la-product-info-card la-product-seller-panel la-layout-seller-info">
              <h2 className="la-seller-info-title">Seller Information</h2>
              <section className="la-card la-seller-card la-layout-seller">
                <div className="la-seller-heading">
                  <span className="la-verified-badge">
                    <ShieldCheck size={14} />
                    {product?.isVerified ? "Verified Seller" : "Seller"}
                  </span>
                </div>
                <div className="la-seller-main">
                  <div className="la-seller-avatar">
                    {(product?.sellerName || "S").charAt(0).toUpperCase()}
                  </div>
                  <div className="la-seller-details">
                    <h4>{product?.sellerName || "Seller"}</h4>
                    <p>
                      {product?.sellerEmail || "Contact details unavailable"}
                    </p>
                    <div className="la-seller-rating">
                      <span className="la-stars">
                        <Star />
                        <Star />
                        <Star />
                        <Star />
                        <Star />
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            </aside>
          </div>
          <div className="la-auction-lower-grid">
            <div className="la-middle-column">
              <section className="la-card la-bidding-card la-layout-bidding">
                <div className="la-bidding-top">
                  <span className="la-live-text">
                    <span className="la-live-dot" />
                    {auctionEnded
                      ? "AUCTION ENDED"
                      : auctionStarted
                        ? "LIVE AUCTION"
                        : "SCHEDULED"}
                  </span>
                  <span className="la-watching">
                    <Eye size={18} />
                    {participantCount} participants
                  </span>
                </div>
                <div className="la-countdown">
                  <Clock size={28} />
                  <div>
                    <strong>{formatTime(timeLeft)}</strong>
                    <small>
                      {auctionEnded
                        ? "Auction Ended"
                        : auction?.endTime
                          ? `Ends ${formatDateTime(auction.endTime)}`
                          : "---"}
                    </small>
                  </div>
                </div>
                <div className="la-current-bid-label">
                  <span>Current Bid</span>
                  <span className="la-bid-count">
                    <Gavel size={20} />
                    {bidCount} bids
                  </span>
                </div>
                <div className="la-current-bid-value">
                  {formatCurrency(currentBid)}
                </div>
                <div className="la-bid-progress">
                  <div
                    style={{
                      width: `${product?.basePrice && currentBid ? Math.min((Number(currentBid) / (Number(product.basePrice) * 2)) * 100, 100) : 0}%`,
                    }}
                  />
                </div>
                <div className="la-bid-meta">
                  <span>
                    Minimum next bid: {formatCurrency(minimumBid)} (
                    {incrementPercentage}% increase)
                  </span>
                </div>
                <div className="la-bid-input-row">
                  <div className="la-bid-input-wrap">
                    <span>₹</span>
                    <input
                      type="text"
                      value={
                        minimumBid != null
                          ? Number(minimumBid).toLocaleString("en-IN", {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2,
                            })
                          : ""
                      }
                      aria-label="Calculated bid amount"
                      readOnly
                      disabled={bidLoading || auctionEnded || !auctionStarted}
                    />
                  </div>
                  <button
                    type="button"
                    className="la-place-bid-button"
                    onClick={handlePlaceBid}
                    disabled={
                      bidLoading ||
                      cooldown > 0 ||
                      auctionEnded ||
                      !auctionStarted ||
                      timeLeft === 0
                    }
                  >
                    <Gavel size={22} />
                    {bidLoading
                      ? "Please wait..."
                      : cooldown > 0
                        ? `Wait ${cooldown}s`
                        : "Place Bid"}
                  </button>
                </div>
                {message && (
                  <div
                    className={`la-bid-message ${message.includes("successfully") ? "success" : "error"}`}
                  >
                    {message}
                  </div>
                )}
                <p className="la-bid-terms">
                  By placing a bid, you agree to our{" "}
                  <a href="/auction-terms">Auction Terms &amp; Conditions</a>
                </p>
              </section>
            </div>
            <div className="la-right-column">
              <section className="la-card la-bid-history-card la-layout-history">
                <div className="la-section-heading">
                  <div>
                    <Gavel size={23} />
                    <h3>Bid History</h3>
                  </div>
                  <span className="la-live-updates">
                    <span className="la-live-dot" />
                    Live Updates
                  </span>
                </div>
                <div className="la-bid-table-wrap">
                  <table className="la-bid-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Bidder</th>
                        <th>Bid Amount</th>
                        <th>Bid Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bids.length > 0 ? (
                        bids.slice(0, 7).map((bid, index) => (
                          <tr
                            key={`${bid.bidTime}-${index}`}
                            className={index === 0 ? "highest" : ""}
                          >
                            <td>{bidCount - index || index + 1}</td>
                            <td>
                              <div className="la-table-bidder">
                                <span className="la-mini-avatar">
                                  {String(bid?.bidderAlias || "B")
                                    .charAt(0)
                                    .toUpperCase()}
                                </span>
                                <span>
                                  {String(bid?.bidderAlias || "Bidder")}
                                </span>
                              </div>
                            </td>
                            <td>{formatCurrency(bid.bidAmount)}</td>
                            <td>{formatDateTime(bid.bidTime)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4}>No bids yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      {showImageModal && imageUrl && (
        <div
          className="la-image-modal"
          onClick={() => setShowImageModal(false)}
          role="presentation"
        >
          <button
            className="la-modal-close"
            type="button"
            onClick={() => setShowImageModal(false)}
            aria-label="Close image"
          >
            <X size={26} />
          </button>
          <img
            src={imageUrl}
            alt="Expanded auction product"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

export default LiveAuction;
