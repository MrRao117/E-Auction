import { useEffect, useMemo, useState } from "react";
import { getAuctionsByStatus } from "../../api/auction/auctionApi";
import {
  getProductById,
  getProductsByCategory,
} from "../../api/product/productApi";
import AuctionCard from "../../components/AuctionCard/AuctionCard";
import Footer from "../../components/FooterBanner/FooterBanner";
import Header from "../../components/Header/Header";
import RegisterForAuction from "../../components/RegisterForAuction/RegisterForAuction";
import "./ProductDetails.css";

const blank = (value) =>
  value === null || value === undefined || value === "" ? "---" : value;
const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") return "---";
  const number = Number(value);
  return Number.isFinite(number) ? `₹${number.toLocaleString("en-IN")}` : "---";
};
const formatDateTime = (value) => {
  if (!value) return "---";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "---"
    : date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
};
const getImages = (item = {}) => {
  const possible = [
    item.images,
    item.imageUrls,
    item.productImages,
    item.photos,
    item.imageList,
    item.imagePaths,
    item.productImagesUrl,
    item.imageUrl,
    item.imageURL,
    item.imagePath,
    item.image,
    item.product?.images,
    item.product?.imageUrls,
    item.product?.productImages,
    item.product?.photos,
    item.product?.imageList,
    item.product?.imageUrl,
    item.product?.imagePath,
    item.product?.image,
  ];
  const urls = possible.flatMap((value) =>
    Array.isArray(value) ? value : value ? [value] : [],
  );
  return [
    ...new Set(
      urls
        .filter((value) => typeof value === "string" && value.trim())
        .map((value) => value.trim()),
    ),
  ].slice(0, 6);
};

export default function ProductDetails({
  product,
  onLogin,
  onLogout,
  isLoggedIn,
  user,
  onDashboard,
  onViewAllAuctions,
  onProductDetails,
  onHome,
  onHowItWorks,
  activeNav,
  onActiveLinkChange,
}) {
  const [productDetails, setProductDetails] = useState(product || null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [similarAuctions, setSimilarAuctions] = useState([]);

  useEffect(() => {
    setProductDetails(product || null);
    setSelectedImage(0);
    setActiveTab("description");
  }, [product]);

  useEffect(() => {
    const productId = product?.productId ?? product?.product?.productId;
    if (!productId) return undefined;
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setLoadError("");
        const response = await getProductById(productId);
        const data = response?.data?.data ?? response?.data ?? response;
        const fetched = data?.product ?? data;
        if (active && fetched)
          setProductDetails((previous) => ({
            ...(previous || {}),
            ...(product || {}),
            ...fetched,
          }));
      } catch (error) {
        console.error("Failed to fetch product details:", error);
        if (active) setLoadError("Unable to load the latest product details.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [product?.productId, product?.product?.productId]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const selectedProduct = useMemo(() => {
    const raw = productDetails || {};
    const nested = raw.product || {};
    const auction = raw.auction || {};
    const sellerObject =
      raw.seller && typeof raw.seller === "object"
        ? raw.seller
        : raw.sellerDetails || {};
    return {
      ...raw,
      productId: raw.productId ?? nested.productId,
      auctionId: raw.auctionId ?? auction.auctionId,
      image: getImages(raw)[0] || "",
      images: getImages(raw),
      title: raw.title ?? raw.pname ?? nested.title ?? nested.pname,
      description: raw.description ?? nested.description,
      basePrice: raw.basePrice ?? nested.basePrice,
      category:
        raw.categoryName ??
        raw.category ??
        nested.categoryName ??
        nested.category,
      sellerName:
        (typeof raw.seller === "string" ? raw.seller : "") ||
        raw.sellerName ||
        sellerObject.name ||
        sellerObject.fullName ||
        nested.sellerName,
      sellerEmail: raw.sellerEmail ?? sellerObject.email ?? nested.sellerEmail,
      sellerId: raw.sellerId ?? sellerObject.sellerId ?? sellerObject.userId,
      sellerLocation:
        raw.sellerLocation ?? sellerObject.location ?? sellerObject.address,
      sellerVerified: raw.sellerVerified ?? sellerObject.isVerified,
      sellerRating: raw.sellerRating ?? sellerObject.rating,
      sellerReviewsCount: raw.sellerReviewsCount ?? sellerObject.reviewCount,
      totalAuctions: raw.totalAuctions ?? sellerObject.totalAuctions,
      successfulSales: raw.successfulSales ?? sellerObject.successfulSales,
      memberSince:
        raw.memberSince ?? sellerObject.memberSince ?? sellerObject.createdAt,
      responseRate: raw.responseRate ?? sellerObject.responseRate,
      positiveFeedback: raw.positiveFeedback ?? sellerObject.positiveFeedback,
      startTime: raw.startTime ?? auction.startTime,
      endTime: raw.endTime ?? auction.endTime,
      auctionStatus: raw.auctionStatus ?? raw.status ?? auction.status,
      verified: raw.verified ?? raw.isVerified ?? nested.isVerified,
      shippingMethod: raw.shippingMethod ?? raw.shippingInfo?.method,
      estimatedDelivery:
        raw.estimatedDelivery ??
        raw.deliveryEstimate ??
        raw.shippingInfo?.estimatedDelivery,
      shippingLocation: raw.shippingLocation ?? raw.shippingInfo?.location,
      deliveryAvailable:
        raw.deliveryAvailable ?? raw.shippingInfo?.deliveryAvailable,
      shippingCost: raw.shippingCost ?? raw.shippingInfo?.cost,
      packaging: raw.packaging ?? raw.shippingInfo?.packaging,
      sellerReviews: raw.sellerReviews ?? sellerObject.reviews ?? [],
      similarAuctions: Array.isArray(raw.similarAuctions)
        ? raw.similarAuctions
        : [],
    };
  }, [productDetails]);

  // Fetch same-category products and keep only products with SCHEDULED auctions.
  useEffect(() => {
    const categoryId =
      selectedProduct.categoryId ??
      selectedProduct.category?.categoryId ??
      selectedProduct.category?.id ??
      selectedProduct.product?.categoryId ??
      selectedProduct.product?.category?.categoryId ??
      selectedProduct.product?.category?.id;

    if (categoryId == null || categoryId === "") {
      setSimilarAuctions([]);
      return undefined;
    }

    let active = true;
    const unwrapList = (response) => {
      const data = response?.data?.data ?? response?.data ?? response;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.content)) return data.content;
      if (Array.isArray(data?.products)) return data.products;
      if (Array.isArray(data?.auctions)) return data.auctions;
      return [];
    };

    const getRelatedProductId = (item = {}) =>
      item.productId ?? item.product?.productId ?? item.product?.id;

    (async () => {
      try {
        const [productsResponse, auctionsResponse] = await Promise.all([
          getProductsByCategory(categoryId),
          getAuctionsByStatus("SCHEDULED"),
        ]);

        const categoryProducts = unwrapList(productsResponse);
        const scheduledAuctions = unwrapList(auctionsResponse).filter(
          (auction) =>
            String(
              auction.status ??
                auction.auctionStatus ??
                auction.auction?.status ??
                "",
            )
              .trim()
              .toUpperCase() === "SCHEDULED",
        );

        const currentProductId = String(selectedProduct.productId ?? "");
        const currentAuctionId = String(selectedProduct.auctionId ?? "");

        const matched = categoryProducts.flatMap((categoryProduct) => {
          const productId = getRelatedProductId(categoryProduct);
          if (productId == null || String(productId) === currentProductId)
            return [];

          const matchingAuction = scheduledAuctions.find((auction) => {
            const auctionProductId = getRelatedProductId(auction);
            const auctionId = auction.auctionId ?? auction.id;
            return (
              auctionProductId != null &&
              String(auctionProductId) === String(productId) &&
              String(auctionId ?? "") !== currentAuctionId
            );
          });

          if (!matchingAuction) return [];
          return [
            {
              ...categoryProduct,
              ...matchingAuction,
              product: categoryProduct,
            },
          ];
        });

        if (active) setSimilarAuctions(matched);
      } catch (error) {
        console.error("Failed to fetch similar scheduled auctions:", error);
        if (active) setSimilarAuctions([]);
      }
    })();

    return () => {
      active = false;
    };
  }, [
    selectedProduct.categoryId,
    selectedProduct.category,
    selectedProduct.productId,
    selectedProduct.auctionId,
  ]);

  const productImages = selectedProduct.images;
  const sellerInitial =
    String(selectedProduct.sellerName || "")
      .trim()
      .charAt(0)
      .toUpperCase() || "—";
  const targetTime =
    selectedProduct.startTime &&
    new Date(selectedProduct.startTime).getTime() > now
      ? selectedProduct.startTime
      : selectedProduct.endTime;
  const targetMs = targetTime ? new Date(targetTime).getTime() : NaN;
  const remainingSeconds = Number.isFinite(targetMs)
    ? Math.max(0, Math.floor((targetMs - now) / 1000))
    : null;
  const hours =
    remainingSeconds == null ? null : Math.floor(remainingSeconds / 3600);
  const minutes =
    remainingSeconds == null
      ? null
      : Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds == null ? null : remainingSeconds % 60;
  const formatTime = (value) =>
    value == null ? "--" : String(value).padStart(2, "0");
  const sellerReviews = Array.isArray(selectedProduct.sellerReviews)
    ? selectedProduct.sellerReviews
    : [];
  const reviewCount =
    Number(selectedProduct.sellerReviewsCount ?? sellerReviews.length) || 0;
  const averageRating = Number(selectedProduct.sellerRating) || 0;
  const ratingBreakdown = [5, 4, 3, 2, 1].map((rating) => {
    const count = sellerReviews.filter(
      (review) => Number(review.rating) === rating,
    ).length;
    return {
      rating,
      count,
      percent: reviewCount ? (count / reviewCount) * 100 : 0,
    };
  });
  const [similarFilter, setSimilarFilter] = useState("All");
  const similarCategories = [
    "All",
    ...new Set(
      similarAuctions
        .map((item) => item.categoryName || item.category)
        .filter(Boolean),
    ),
  ];
  const filteredSimilarAuctions =
    similarFilter === "All"
      ? similarAuctions
      : similarAuctions.filter(
          (item) => (item.categoryName || item.category) === similarFilter,
        );

  const renderTabContent = () => {
    switch (activeTab) {
      case "details":
        return (
          <div className="product-tab-panel">
            <h2>Product Details</h2>
            <div className="product-details-grid">
              {[
                ["Category", selectedProduct.category],
                ["Product ID", selectedProduct.productId],
                ["Auction ID", selectedProduct.auctionId],
                ["Base Price", formatCurrency(selectedProduct.basePrice)],
                ["Auction Status", selectedProduct.auctionStatus],
                ["Start Time", formatDateTime(selectedProduct.startTime)],
                ["End Time", formatDateTime(selectedProduct.endTime)],
                [
                  "Verification",
                  selectedProduct.verified == null
                    ? "---"
                    : selectedProduct.verified
                      ? "Verified"
                      : "Not verified",
                ],
              ].map(([label, value]) => (
                <div className="product-detail-row" key={label}>
                  <span>{label}</span>
                  <strong>{blank(value)}</strong>
                </div>
              ))}
            </div>
          </div>
        );
      case "shipping":
        return (
          <div className="product-tab-panel">
            <h2>Shipping Information</h2>
            <div className="product-shipping-list">
              {[
                ["Shipping Method", selectedProduct.shippingMethod],
                ["Estimated Delivery", selectedProduct.estimatedDelivery],
                ["Shipping Location", selectedProduct.shippingLocation],
                ["Delivery Available", selectedProduct.deliveryAvailable],
                [
                  "Shipping Cost",
                  selectedProduct.shippingCost == null ||
                  selectedProduct.shippingCost === ""
                    ? "---"
                    : formatCurrency(selectedProduct.shippingCost),
                ],
                ["Packaging", selectedProduct.packaging],
              ].map(([label, value]) => (
                <div className="product-shipping-row" key={label}>
                  <span>{label}</span>
                  <strong>{blank(value)}</strong>
                </div>
              ))}
            </div>
          </div>
        );
      case "seller":
        return (
          <div className="product-tab-panel">
            <h2>Seller Information</h2>
            <div className="seller-info-profile">
              <div className="seller-info-avatar">{sellerInitial}</div>
              <div className="seller-info-name">
                <h3>{blank(selectedProduct.sellerName)}</h3>
                <span>
                  {selectedProduct.sellerVerified == null
                    ? "---"
                    : selectedProduct.sellerVerified
                      ? "✓ Verified Seller"
                      : "Not verified"}
                </span>
              </div>
            </div>
            <div className="seller-info-grid">
              {[
                ["Seller ID", selectedProduct.sellerId],
                ["Seller Email", selectedProduct.sellerEmail],
                [
                  "Seller Rating",
                  selectedProduct.sellerRating == null
                    ? "---"
                    : `★ ${selectedProduct.sellerRating} / 5`,
                ],
                ["Total Auctions", selectedProduct.totalAuctions],
                ["Successful Sales", selectedProduct.successfulSales],
                ["Member Since", formatDateTime(selectedProduct.memberSince)],
                ["Location", selectedProduct.sellerLocation],
                ["Response Rate", selectedProduct.responseRate],
                ["Positive Feedback", selectedProduct.positiveFeedback],
              ].map(([label, value]) => (
                <div className="seller-info-row" key={label}>
                  <span>{label}</span>
                  <strong>{blank(value)}</strong>
                </div>
              ))}
            </div>
          </div>
        );
      case "reviews":
        return (
          <div className="product-tab-panel">
            <h2>Seller Reviews</h2>
            <div className="reviews-summary">
              <div className="reviews-score">
                <strong>{averageRating.toFixed(1)}</strong>
                <div className="reviews-stars">
                  {"★".repeat(Math.round(averageRating))}
                  {"☆".repeat(5 - Math.round(averageRating))}
                </div>
                <span>{reviewCount} Reviews</span>
              </div>
              <div className="reviews-breakdown">
                {ratingBreakdown.map(({ rating, count, percent }) => (
                  <div key={rating}>
                    <span>{rating} ★</span>
                    <div className="review-bar">
                      <span style={{ width: `${percent}%` }} />
                    </div>
                    <strong>{count}</strong>
                  </div>
                ))}
              </div>
            </div>
            {sellerReviews.length ? (
              <div className="customer-reviews">
                {sellerReviews.map((review, index) => (
                  <div
                    className="customer-review"
                    key={review.reviewId ?? review.id ?? index}
                  >
                    <div className="customer-review-header">
                      <strong>
                        {blank(
                          review.reviewerName ??
                            review.userName ??
                            review.buyerName,
                        )}
                      </strong>
                      <span>
                        {formatDateTime(review.createdAt ?? review.reviewDate)}
                      </span>
                    </div>
                    <div className="customer-review-stars">
                      {review.rating == null || review.rating === ""
                        ? "☆☆☆☆☆"
                        : `${"★".repeat(Math.max(0, Math.min(5, Number(review.rating))))}${"☆".repeat(Math.max(0, 5 - Math.min(5, Number(review.rating))))}`}
                    </div>
                    <p>
                      {blank(
                        review.comment ?? review.feedback ?? review.reviewText,
                      )}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No seller reviews yet.</p>
            )}
          </div>
        );
      case "description":
      default:
        return (
          <div className="product-tab-panel">
            <h2>Product Description</h2>
            <p>{blank(selectedProduct.description)}</p>
          </div>
        );
    }
  };

  return (
    <>
      <Header
        onLogin={onLogin}
        onLogout={onLogout}
        isLoggedIn={isLoggedIn}
        user={user}
        onDashboard={onDashboard}
        onHome={onHome}
        onViewAllAuctions={onViewAllAuctions}
        onHowItWorks={onHowItWorks}
        activeLink={activeNav}
        onActiveLinkChange={onActiveLinkChange}
      />
      <main className="product-details-page">
        <div className="product-breadcrumb">
          <button type="button" onClick={onHome}>
            Home
          </button>
          <span>›</span>
          <button type="button" onClick={onViewAllAuctions}>
            Auctions
          </button>
          <span>›</span>
          <span>{blank(selectedProduct.category)}</span>
          <span>›</span>
          <strong>{blank(selectedProduct.title)}</strong>
        </div>
        {loading && (
          <p className="product-loading-message">Loading product details...</p>
        )}
        {loadError && <p className="product-error-message">{loadError}</p>}
        <section className="product-main-section">
          <div className="product-gallery">
            <div className="product-main-image-wrapper">
              {productImages.length ? (
                <img
                  src={productImages[selectedImage] || productImages[0]}
                  alt={selectedProduct.title || "Product"}
                  className="product-main-image"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="product-main-image product-image-placeholder">
                  Images are not uploaded
                </div>
              )}
              {selectedProduct.verified && (
                <div className="product-verified-badge">
                  <span>✓</span>
                  <span>Verified Item</span>
                </div>
              )}
              {productImages.length > 1 && (
                <>
                  <button
                    type="button"
                    className="product-gallery-arrow product-gallery-prev"
                    onClick={() =>
                      setSelectedImage((index) =>
                        index === 0 ? productImages.length - 1 : index - 1,
                      )
                    }
                    aria-label="Previous image"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="product-gallery-arrow product-gallery-next"
                    onClick={() =>
                      setSelectedImage((index) =>
                        index === productImages.length - 1 ? 0 : index + 1,
                      )
                    }
                    aria-label="Next image"
                  >
                    ›
                  </button>
                  <div className="product-image-number">
                    {selectedImage + 1} / {productImages.length}
                  </div>
                </>
              )}
            </div>
            {productImages.length > 1 && (
              <div className="product-thumbnails">
                {productImages.slice(0, 5).map((image, index) => (
                  <button
                    type="button"
                    key={`${image}-${index}`}
                    className={`product-thumbnail ${selectedImage === index ? "product-thumbnail-active" : ""}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={image} alt={`Product view ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="product-information">
            <div className="product-category-tag">
              {blank(selectedProduct.category)}
            </div>
            <h1>{blank(selectedProduct.title)}</h1>
            <div className="product-auction-id">
              <span>Auction ID:</span>
              <strong>{blank(selectedProduct.auctionId)}</strong>
            </div>
            <p className="product-short-description">
              {blank(selectedProduct.description)}
            </p>
            <div className="product-seller-row">
              <div className="product-seller-avatar">{sellerInitial}</div>
              <div className="product-seller-details">
                <span>Seller</span>
                <strong>{blank(selectedProduct.sellerName)}</strong>
              </div>
              <div className="product-seller-divider"></div>
              <div className="product-rating">
                <span className="rating-star">★</span>
                <div>
                  <strong>{blank(selectedProduct.sellerRating)}</strong>
                  <span>
                    ({blank(selectedProduct.sellerReviewsCount)} reviews)
                  </span>
                </div>
              </div>
            </div>
            <div className="product-auction-box">
              <div className="product-price-section">
                <span className="product-price-label">Base Price</span>
                <strong className="product-base-price">
                  {formatCurrency(selectedProduct.basePrice)}
                </strong>
                <span className="product-price-note">
                  Starting price for this auction
                </span>
              </div>
              <div className="product-countdown-section">
                <span className="product-price-label">
                  {selectedProduct.startTime &&
                  new Date(selectedProduct.startTime).getTime() > now
                    ? "Starts In"
                    : "Time Left"}
                </span>
                <div className="product-countdown">
                  <div>
                    <strong>{formatTime(hours)}</strong>
                    <span>HH</span>
                  </div>
                  <b>:</b>
                  <div>
                    <strong>{formatTime(minutes)}</strong>
                    <span>MM</span>
                  </div>
                  <b>:</b>
                  <div>
                    <strong>{formatTime(seconds)}</strong>
                    <span>SS</span>
                  </div>
                </div>
                <span className="product-price-note">
                  {formatDateTime(targetTime)}
                </span>
              </div>
              <button
                type="button"
                className="register-now-button"
                onClick={() => setShowRegisterModal(true)}
                disabled={!selectedProduct.auctionId}
              >
                <span className="register-icon">♙</span>
                <span>Register For This Auction</span>
              </button>
              <button type="button" className="watchlist-button">
                <span>♡</span>
                <span>Add to Watchlist</span>
              </button>
            </div>
          </div>
        </section>
        <section className="product-lower-section">
          <div className="product-description-card">
            <div className="product-tabs">
              {[
                ["description", "Description"],
                ["details", "Details"],
                ["shipping", "Shipping"],
                ["seller", "Seller Info"],
                ["reviews", "Seller Reviews"],
              ].map(([tab, label]) => (
                <button
                  type="button"
                  key={tab}
                  className={`product-tab ${activeTab === tab ? "product-tab-active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="product-description-content">
              {renderTabContent()}
            </div>
          </div>
          <aside className="product-trust-card">
            <h2>Why Register for This Item?</h2>
            <div className="product-trust-item">
              <div className="trust-icon">✓</div>
              <div>
                <h3>Authentic &amp; Verified</h3>
                <p>All items are checked for authenticity.</p>
              </div>
            </div>
            <div className="product-trust-item">
              <div className="trust-icon">♙</div>
              <div>
                <h3>Unique Collectibles</h3>
                <p>Rare items you won't find elsewhere.</p>
              </div>
            </div>
            <div className="product-trust-item">
              <div className="trust-icon">✓</div>
              <div>
                <h3>Trusted Community</h3>
                <p>Register and participate with confidence.</p>
              </div>
            </div>
            <div className="product-trust-item">
              <div className="trust-icon">♙</div>
              <div>
                <h3>Unique Collectibles</h3>
                <p>Rare items you won't find elsewhere.</p>
              </div>
            </div>
            <div className="product-trust-item">
              <div className="trust-icon">♙</div>
              <div>
                <h3>Unique Collectibles</h3>
                <p>Rare items you won't find elsewhere.</p>
              </div>
            </div>
          </aside>
        </section>
        <section className="similar-products-section">
          <div className="similar-products-heading">
            <h2>Similar Auctions For You</h2>
          </div>
          <div className="similar-auction-filters"></div>
          {filteredSimilarAuctions.length > 0 ? (
            <div className="similar-products-grid">
              {filteredSimilarAuctions.map((auction, index) => (
                <AuctionCard
                  key={auction.auctionId ?? auction.productId ?? index}
                  image={getImages(auction)[0] || ""}
                  title={auction.title || auction.pname || "---"}
                  seller={auction.sellerName || auction.seller || "---"}
                  category={auction.categoryName || auction.category || "---"}
                  timeLeft={auction.timeLeft}
                  auctionId={auction.auctionId}
                  productId={auction.productId}
                  product={auction}
                  onProductClick={onProductDetails}
                />
              ))}
            </div>
          ) : (
            <p className="similar-auctions-empty">
              No similar auctions available right now.
            </p>
          )}
        </section>
      </main>
      <Footer />
      {showRegisterModal && (
        <RegisterForAuction
          product={selectedProduct}
          user={user}
          onClose={() => setShowRegisterModal(false)}
        />
      )}
    </>
  );
}
