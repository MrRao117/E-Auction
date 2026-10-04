import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cpu,
  Eye,
  Gavel,
  HardDrive,
  Heart,
  Maximize,
  MemoryStick,
  Monitor,
  Radio,
  Search,
  ShieldCheck,
  ShoppingCart,
  Star,
  TrendingUp,
  UserRound,
  Users,
  X,
} from "lucide-react";

import { useCallback, useEffect, useState } from "react";

import { getAuctionById } from "../../api/auction/auctionApi";
import {
  getAuctionRegistrationCount,
  getRegistrationsForAuction,
} from "../../api/auction/auctionRegistrationApi";
import {
  getBidCountForAuction,
  getBidsByAuctionId,
  getHighestBidForAuction,
  placeBid,
} from "../../api/bid/bidApi";
import { getProductById } from "../../api/product/productApi";

import "./LiveAuction.css";

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
  const [participants, setParticipants] = useState([]);
  const [participantCount, setParticipantCount] = useState(0);
  const [bidCount, setBidCount] = useState(0);

  const [currentBid, setCurrentBid] = useState(null);

  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState("Description");
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAllBidders, setShowAllBidders] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [bidLoading, setBidLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const [message, setMessage] = useState("");
  const [currentTime, setCurrentTime] = useState(Date.now());

  const imageUrl = product?.imageUrl || "";

  const productImages = imageUrl ? [imageUrl] : [];

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

  // =====================================================
  // FETCH AUCTION, PRODUCT, BIDS, AND PARTICIPANTS
  // =====================================================

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

        // Participant details endpoint is admin-only in the current backend.
        try {
          const registrationResponse =
            await getRegistrationsForAuction(auctionId);

          const registrationData = getResponseData(registrationResponse);

          setParticipants(
            Array.isArray(registrationData) ? registrationData : [],
          );
        } catch (error) {
          console.warn("Participant details are unavailable:", error);
          setParticipants([]);
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

  // =====================================================
  // IMAGE CONTROLS
  // =====================================================

  const changeImage = (direction) => {
    if (productImages.length <= 1) return;

    setActiveImage((previous) => {
      if (direction === "next") {
        return (previous + 1) % productImages.length;
      }

      return (previous - 1 + productImages.length) % productImages.length;
    });
  };

  // =====================================================
  // PLACE BID
  // =====================================================

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

      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to place your bid. Please try again.";

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

  // =====================================================
  // LOADING / ERROR STATES
  // =====================================================

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

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="live-auction-page">
      {/* Header */}
      <header className="la-header">
        <div className="la-brand">
          <div className="la-brand-icon">
            <Gavel size={29} strokeWidth={2.5} />
          </div>
          <span className="la-brand-name">
            <span>e</span>Auction
          </span>
        </div>

        <nav className="la-nav">
          <a href="/">Home</a>
          <a href="/auctions">All Auctions</a>
          <a href="/categories">Categories</a>
          <a href="/how-it-works">How It Works</a>
        </nav>

        <div className="la-search">
          <Search size={19} />
          <input
            type="text"
            placeholder="Search auctions, products, categories..."
          />
          <Search size={21} />
        </div>

        <div className="la-header-actions">
          <button className="la-header-action" type="button">
            <Heart size={23} />
            <span>Watchlist</span>
          </button>

          <button className="la-cart-button" type="button" aria-label="Cart">
            <ShoppingCart size={25} />
          </button>

          <button className="la-profile-button" type="button">
            <span className="la-profile-avatar">B</span>
            <span>Bidder</span>
            <ChevronDown size={17} />
          </button>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="la-breadcrumb">
        <a href="/">Home</a>
        <ChevronRight size={15} />
        <a href="/auctions">All Auctions</a>
        <ChevronRight size={15} />
        <span>{product?.categoryName || "---"}</span>
        <ChevronRight size={15} />
        <span>{product?.pname || auction?.productTitle || "---"}</span>
      </div>

      <main className="la-main-grid">
        {/* LEFT COLUMN */}
        <section className="la-left-column">
          {/* Product gallery */}
          <div className="la-gallery">
            <div className="la-main-image">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product?.pname || auction?.productTitle || "Product"}
                />
              ) : (
                <div className="la-image-placeholder">No image available</div>
              )}

              <div className="la-live-badge">
                <Radio size={19} />
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

              <button
                className="la-gallery-arrow la-gallery-prev"
                onClick={() => changeImage("prev")}
                aria-label="Previous image"
                type="button"
                disabled={productImages.length <= 1}
              >
                <ChevronLeft size={23} />
              </button>

              <button
                className="la-gallery-arrow la-gallery-next"
                onClick={() => changeImage("next")}
                aria-label="Next image"
                type="button"
                disabled={productImages.length <= 1}
              >
                <ChevronRight size={23} />
              </button>

              <div className="la-image-count">
                {productImages.length
                  ? `${activeImage + 1} / ${productImages.length}`
                  : "---"}
              </div>
            </div>

            <div className="la-thumbnails">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  type="button"
                  className={`la-thumbnail ${
                    activeImage === index ? "active" : ""
                  }`}
                  onClick={() => setActiveImage(index)}
                >
                  <img src={image} alt={`Product view ${index + 1}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Seller information */}
          <div className="la-card la-seller-card">
            <div className="la-seller-heading">
              <h3>Seller Information</h3>
              <span className="la-verified-badge">
                <ShieldCheck size={14} />
                {product?.isVerified ? "Verified Seller" : "---"}
              </span>
            </div>

            <div className="la-seller-main">
              <div className="la-seller-avatar">
                {(product?.sellerName || "---").charAt(0).toUpperCase()}
              </div>

              <div className="la-seller-details">
                <h4>{product?.sellerName || "---"}</h4>
                <p>{product?.sellerEmail || "---"}</p>
                <div className="la-seller-rating">
                  <span className="la-stars">
                    <Star />
                    <Star />
                    <Star />
                    <Star />
                    <Star />
                  </span>
                  <strong>---</strong>
                  <span>Reviews unavailable</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product information tabs */}
          <div className="la-card la-description-card">
            <div className="la-tabs">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={activeTab === tab ? "active" : ""}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="la-tab-content">
              {activeTab === "Description" && (
                <p>{product?.description || "---"}</p>
              )}

              {activeTab === "Specifications" && (
                <div className="la-spec-list">
                  <p>
                    <strong>Product:</strong> {product?.pname || "---"}
                  </p>
                  <p>
                    <strong>Category:</strong> {product?.categoryName || "---"}
                  </p>
                  <p>
                    <strong>Base Price:</strong>{" "}
                    {formatCurrency(product?.basePrice)}
                  </p>
                </div>
              )}

              {activeTab === "Shipping & Delivery" && (
                <div className="la-spec-list">
                  <p>---</p>
                </div>
              )}

              {activeTab === "Terms" && (
                <div className="la-spec-list">
                  <p>---</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CENTER COLUMN */}
        <section className="la-center-column">
          <div className="la-product-heading">
            <div className="la-title-row">
              <h1>{product?.pname || auction?.productTitle || "---"}</h1>
              <button
                className={`la-favorite-button ${isFavorite ? "selected" : ""}`}
                type="button"
                onClick={() => setIsFavorite(!isFavorite)}
                aria-label="Add to watchlist"
              >
                <Heart size={23} fill={isFavorite ? "currentColor" : "none"} />
              </button>
            </div>

            <p className="la-product-category">
              {product?.categoryName || "---"}
            </p>

            <div className="la-product-tags">
              <span>{auction?.auctionStatus || "---"}</span>
              {product?.isVerified && <span>Verified Product</span>}
            </div>

            <p className="la-product-description">
              {product?.description || "---"}
            </p>

            <div className="la-product-features">
              <div>
                <Cpu size={23} />
                <span>
                  <strong>---</strong>
                  <small>Processor</small>
                </span>
              </div>

              <div>
                <MemoryStick size={23} />
                <span>
                  <strong>---</strong>
                  <small>Memory</small>
                </span>
              </div>

              <div>
                <HardDrive size={23} />
                <span>
                  <strong>---</strong>
                  <small>Storage</small>
                </span>
              </div>

              <div>
                <Monitor size={23} />
                <span>
                  <strong>---</strong>
                  <small>Display</small>
                </span>
              </div>
            </div>
          </div>

          {/* Bidding panel */}
          <div className="la-card la-bidding-card">
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
                  width: `${
                    product?.basePrice && currentBid
                      ? Math.min(
                          (Number(currentBid) /
                            (Number(product.basePrice) * 2)) *
                            100,
                          100,
                        )
                      : 0
                  }%`,
                }}
              />
            </div>

            <div className="la-bid-meta">
              <span>
                Minimum next bid: {formatCurrency(minimumBid)} (Increment:{" "}
                {formatCurrency(bidIncrement)} — {incrementPercentage}%)
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
                className={`la-bid-message ${
                  message.includes("successfully") ? "success" : "error"
                }`}
              >
                {message}
              </div>
            )}

            <p className="la-bid-terms">
              By placing a bid, you agree to our{" "}
              <a href="/auction-terms">Auction Terms & Conditions</a>
            </p>
          </div>

          {/* Auction summary cards: no Time Remaining card */}
          <div className="la-summary-grid">
            <div className="la-card la-summary-card">
              <Users size={27} />
              <strong>{participantCount}</strong>
              <span>Total Participants</span>
              <small>Registered for this auction</small>
            </div>

            <div className="la-card la-summary-card">
              <TrendingUp size={27} />
              <strong>{formatCurrency(bidIncrement)}</strong>
              <span>Bid Increment</span>
              <small>{incrementPercentage}% minimum increment</small>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN */}
        <aside className="la-right-column">
          {/* Participants */}
          <div className="la-card la-participants-card">
            <div className="la-section-heading">
              <div>
                <UserRound size={23} />
                <h3>
                  Auction Participants <span>({participantCount})</span>
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowAllBidders(!showAllBidders)}
              >
                {showAllBidders ? "Show Less" : "View All"}
              </button>
            </div>

            <div className="la-participants-list">
              {participants.length > 0 ? (
                (showAllBidders ? participants : participants.slice(0, 5)).map(
                  (participant, index) => {
                    const name = participant?.userName || "---";

                    return (
                      <div
                        className="la-participant"
                        key={
                          participant?.userId ?? participant?.userEmail ?? index
                        }
                      >
                        <div className="la-participant-avatar">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <span>{name}</span>
                      </div>
                    );
                  },
                )
              ) : (
                <p>No participant details available.</p>
              )}
            </div>
          </div>

          {/* Bid history */}
          <div className="la-card la-bid-history-card">
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
                              {(bid.bidderAlias || "---")
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                            <span>{bid.bidderAlias || "---"}</span>
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
          </div>

          {/* Auction details */}
          <div className="la-card la-auction-details-card">
            <div className="la-section-heading">
              <div>
                <Gavel size={25} />
                <h3>Auction Details</h3>
              </div>
            </div>

            <div className="la-detail-list">
              <div>
                <span>Auction ID</span>
                <strong>{auction?.auctionId ?? "---"}</strong>
              </div>

              <div>
                <span>Start Time</span>
                <strong>{formatDateTime(auction?.startTime)}</strong>
              </div>

              <div>
                <span>End Time</span>
                <strong>{formatDateTime(auction?.endTime)}</strong>
              </div>

              <div>
                <span>Auction Status</span>
                <strong>{auction?.auctionStatus || "---"}</strong>
              </div>

              <div>
                <span>Base Price</span>
                <strong>{formatCurrency(product?.basePrice)}</strong>
              </div>

              <div>
                <span>Bid Increment</span>
                <strong>{formatCurrency(bidIncrement)}</strong>
              </div>

              <div>
                <span>Total Bids</span>
                <strong>{bidCount}</strong>
              </div>

              <div>
                <span>Total Participants</span>
                <strong>{participantCount}</strong>
              </div>

              <div>
                <span>Category</span>
                <strong>{product?.categoryName || "---"}</strong>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Fullscreen image modal */}
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
            alt="Expanded product"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

export default LiveAuction;
