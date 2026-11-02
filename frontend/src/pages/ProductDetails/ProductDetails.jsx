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
    : date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
};

/* Collect image URLs from the card object, product object,
   and common backend image property names. */
const getImages = (item = {}) => {
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

const unwrapResponse = (response) =>
  response?.data?.data ?? response?.data ?? response;

const getRelatedProductId = (item = {}) =>
  item.productId ??
  item.product?.productId ??
  item.product?.id ??
  item.productDetails?.productId;

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
  onLiveAuction,
}) {
  const [productDetails, setProductDetails] = useState(product || null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [similarAuctions, setSimilarAuctions] = useState([]);
  const [similarFilter, setSimilarFilter] = useState("All");

  useEffect(() => {
    setProductDetails(product || null);
    setSelectedImage(0);
    setActiveTab("description");
    setLoadError("");
  }, [product]);

  /* Fetch the latest product details without losing the image
     and auction information received from AuctionCard. */
  useEffect(() => {
    const productId =
      product?.productId ?? product?.product?.productId ?? product?.product?.id;

    if (productId == null || productId === "") return undefined;

    let active = true;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setLoadError("");

        const response = await getProductById(productId);
        const data = unwrapResponse(response);
        const fetched = data?.product ?? data?.productDetails ?? data;

        if (!active || !fetched) return;

        setProductDetails((previous) => {
          const previousData = previous || {};
          const fetchedProduct = fetched.product || {};

          return {
            ...fetchedProduct,
            ...fetched,
            ...previousData,
            ...product,
            ...fetched,
            product: {
              ...(fetchedProduct || {}),
              ...(previousData.product || {}),
              ...(product?.product || {}),
            },
          };
        });
      } catch (error) {
        console.error("Failed to fetch product details:", error);

        if (active) {
          setLoadError("Unable to load the latest product details.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProduct();

    return () => {
      active = false;
    };
  }, [product?.productId, product?.product?.productId, product?.product?.id]);

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
        : raw.sellerDetails || nested.seller || {};

    const images = getImages(raw);

    return {
      ...nested,
      ...raw,

      productId: raw.productId ?? nested.productId ?? nested.id,

      auctionId: raw.auctionId ?? auction.auctionId ?? auction.id,

      image: images[0] || "",
      images,

      title: raw.title ?? raw.pname ?? nested.title ?? nested.pname,

      description: raw.description ?? nested.description,

      basePrice: raw.basePrice ?? nested.basePrice ?? auction.basePrice,

      currHighestBid:
        raw.currHighestBid ??
        raw.currentHighestBid ??
        auction.currHighestBid ??
        auction.currentHighestBid,

      category:
        raw.categoryName ??
        raw.category ??
        nested.categoryName ??
        nested.category,

      categoryId:
        raw.categoryId ??
        raw.category?.categoryId ??
        raw.category?.id ??
        nested.categoryId ??
        nested.category?.categoryId ??
        nested.category?.id,

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

  /*
   * Poll active auctions and match by auction ID OR product ID.
   * Some product payloads do not include auctionId until the auction API
   * returns the matching auction, so do not stop polling when it is missing.
   */
  useEffect(() => {
    const productId =
      selectedProduct.productId ??
      selectedProduct.product?.productId ??
      selectedProduct.product?.id;
    const initialAuctionId =
      selectedProduct.auctionId ??
      selectedProduct.auction?.auctionId ??
      selectedProduct.auction?.id;

    if (
      (productId == null || productId === "") &&
      (initialAuctionId == null || initialAuctionId === "")
    ) {
      return undefined;
    }

    let active = true;
    let isFetchingStatus = false;

    const refreshAuctionStatus = async () => {
      if (isFetchingStatus) return;
      isFetchingStatus = true;

      try {
        const response = await getAuctionsByStatus("ACTIVE");
        const data = unwrapResponse(response);
        const activeAuctions = Array.isArray(data)
          ? data
          : Array.isArray(data?.content)
            ? data.content
            : Array.isArray(data?.auctions)
              ? data.auctions
              : [];

        const matchingAuction = activeAuctions.find((auction) => {
          const candidateAuctionId = auction.auctionId ?? auction.id;
          const candidateProductId =
            auction.productId ??
            auction.product?.productId ??
            auction.product?.id ??
            auction.productDetails?.productId;

          if (initialAuctionId != null && initialAuctionId !== "") {
            return (
              String(candidateAuctionId ?? "") === String(initialAuctionId)
            );
          }

          return (
            productId != null &&
            String(candidateProductId ?? "") === String(productId)
          );
        });

        if (!active || !matchingAuction) return;

        setProductDetails((previous) => {
          if (!previous) return previous;
          const previousAuction = previous.auction || {};
          const nestedProduct = matchingAuction.product || {};

          return {
            ...previous,
            ...matchingAuction,
            productId:
              previous.productId ??
              matchingAuction.productId ??
              nestedProduct.productId ??
              nestedProduct.id ??
              productId,
            auctionId:
              matchingAuction.auctionId ??
              matchingAuction.id ??
              previous.auctionId ??
              previousAuction.auctionId ??
              previousAuction.id,
            auctionStatus: "ACTIVE",
            status: "ACTIVE",
            startTime: matchingAuction.startTime ?? previous.startTime,
            endTime: matchingAuction.endTime ?? previous.endTime,
            currHighestBid:
              matchingAuction.currHighestBid ??
              matchingAuction.currentHighestBid ??
              previous.currHighestBid,
            currentHighestBid:
              matchingAuction.currentHighestBid ??
              matchingAuction.currHighestBid ??
              previous.currentHighestBid,
            auction: {
              ...previousAuction,
              ...matchingAuction,
              status: "ACTIVE",
              auctionStatus: "ACTIVE",
            },
          };
        });
      } catch (error) {
        console.error("Failed to refresh auction status:", error);
      } finally {
        isFetchingStatus = false;
      }
    };

    refreshAuctionStatus();
    const intervalId = setInterval(refreshAuctionStatus, 500);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [
    selectedProduct.productId,
    selectedProduct.product?.productId,
    selectedProduct.product?.id,
    selectedProduct.auctionId,
    selectedProduct.auction?.auctionId,
    selectedProduct.auction?.id,
  ]);

  /* Load related products and show only those with scheduled auctions. */
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
      const data = unwrapResponse(response);

      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.content)) return data.content;
      if (Array.isArray(data?.products)) return data.products;
      if (Array.isArray(data?.auctions)) return data.auctions;

      return [];
    };

    const fetchSimilarAuctions = async () => {
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

          if (productId == null || String(productId) === currentProductId) {
            return [];
          }

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
    };

    fetchSimilarAuctions();

    return () => {
      active = false;
    };
  }, [
    selectedProduct.categoryId,
    selectedProduct.category,
    selectedProduct.productId,
    selectedProduct.auctionId,
  ]);

  const productImages = selectedProduct.images || [];
  const currentImage = productImages[selectedImage] || productImages[0] || "";

  const sellerInitial =
    String(selectedProduct.sellerName || "")
      .trim()
      .charAt(0)
      .toUpperCase() || "—";

  const startTimestamp = selectedProduct.startTime
    ? new Date(selectedProduct.startTime).getTime()
    : NaN;

  const endTimestamp = selectedProduct.endTime
    ? new Date(selectedProduct.endTime).getTime()
    : NaN;

  const isUpcoming = Number.isFinite(startTimestamp) && startTimestamp > now;

  const targetTime = isUpcoming
    ? selectedProduct.startTime
    : selectedProduct.endTime;

  const targetTimestamp = targetTime ? new Date(targetTime).getTime() : NaN;

  const remainingSeconds = Number.isFinite(targetTimestamp)
    ? Math.max(0, Math.floor((targetTimestamp - now) / 1000))
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

  const averageRating = Math.max(
    0,
    Math.min(5, Number(selectedProduct.sellerRating) || 0),
  );

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

  const isLiveAuction =
    String(selectedProduct.auctionStatus ?? "")
      .trim()
      .toUpperCase() === "ACTIVE";

  const similarCategories = [
    "All",
    ...new Set(
      similarAuctions
        .map((item) =>
          typeof item.category === "object"
            ? (item.category?.categoryName ?? item.category?.name)
            : (item.categoryName ?? item.category),
        )
        .filter(Boolean),
    ),
  ];

  const filteredSimilarAuctions =
    similarFilter === "All"
      ? similarAuctions
      : similarAuctions.filter((item) => {
          const category =
            typeof item.category === "object"
              ? (item.category?.categoryName ?? item.category?.name)
              : (item.categoryName ?? item.category);

          return category === similarFilter;
        });

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
                {sellerReviews.map((review, index) => {
                  const rating = Math.max(
                    0,
                    Math.min(5, Number(review.rating) || 0),
                  );

                  return (
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
                          {formatDateTime(
                            review.createdAt ?? review.reviewDate,
                          )}
                        </span>
                      </div>

                      <div className="customer-review-stars">
                        {"★".repeat(rating)}
                        {"☆".repeat(5 - rating)}
                      </div>

                      <p>
                        {blank(
                          review.comment ??
                            review.feedback ??
                            review.reviewText,
                        )}
                      </p>
                    </div>
                  );
                })}
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
              {productImages.length > 0 ? (
                <img
                  key={currentImage}
                  src={currentImage}
                  alt={selectedProduct.title || "Product"}
                  className="product-main-image"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                  onLoad={(event) => {
                    event.currentTarget.style.display = "block";
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
                    className={`product-thumbnail ${
                      selectedImage === index ? "product-thumbnail-active" : ""
                    }`}
                    onClick={() => setSelectedImage(index)}
                    aria-label={`View product image ${index + 1}`}
                  >
                    <img src={image} alt={`Product view ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="product-information">
            <div className="product-category-tag">
              {blank(
                typeof selectedProduct.category === "object"
                  ? (selectedProduct.category?.categoryName ??
                      selectedProduct.category?.name)
                  : selectedProduct.category,
              )}
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

              <div className="product-seller-divider" />

              <div className="product-rating">
                <span className="rating-star">★</span>

                <div>
                  <strong>{blank(selectedProduct.sellerRating)}</strong>
                  <span>({reviewCount} reviews)</span>
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
                  {isUpcoming ? "Starts In" : "Time Left"}
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

              {isLiveAuction ? (
                <button
                  type="button"
                  className="enter-auction-button"
                  onClick={() => onLiveAuction?.(selectedProduct)}
                  disabled={
                    !(
                      selectedProduct.auctionId ??
                      selectedProduct.auction?.auctionId ??
                      selectedProduct.auction?.id
                    )
                  }
                >
                  <span>Enter into the Auction</span>
                  <span aria-hidden="true">→</span>
                </button>
              ) : (
                <>
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
                </>
              )}
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
                  className={`product-tab ${
                    activeTab === tab ? "product-tab-active" : ""
                  }`}
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

          <div className="similar-auction-filters">
            {similarCategories.map((category) => (
              <button
                type="button"
                key={category}
                className={
                  similarFilter === category ? "similar-filter-active" : ""
                }
                onClick={() => setSimilarFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {filteredSimilarAuctions.length > 0 ? (
            <div className="similar-products-grid">
              {filteredSimilarAuctions.map((auction, index) => {
                const images = getImages(auction);
                const category =
                  typeof auction.category === "object"
                    ? (auction.category?.categoryName ?? auction.category?.name)
                    : (auction.categoryName ?? auction.category);

                return (
                  <AuctionCard
                    key={auction.auctionId ?? auction.productId ?? index}
                    image={images[0] || ""}
                    title={auction.title || auction.pname || "---"}
                    seller={auction.sellerName || auction.seller || "---"}
                    category={category || "---"}
                    description={auction.description}
                    basePrice={auction.basePrice}
                    currHighestBid={
                      auction.currHighestBid ?? auction.currentHighestBid
                    }
                    startTime={auction.startTime}
                    endTime={auction.endTime}
                    auctionStatus={
                      auction.auctionStatus ?? auction.status ?? "SCHEDULED"
                    }
                    timeLeft={auction.timeLeft}
                    auctionId={auction.auctionId}
                    productId={getRelatedProductId(auction)}
                    product={auction.product || auction}
                    onProductClick={onProductDetails}
                  />
                );
              })}
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
