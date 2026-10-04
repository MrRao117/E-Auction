import { useEffect, useMemo, useState } from "react";

import AuctionCard from "../../components/AuctionCard/AuctionCard";
import Header from "../../components/Header/Header";

import { getAllAuctions } from "../../api/auction/auctionApi";
import {
  getProductById,
  getProductCategories,
} from "../../api/product/productApi";

import "./AllAuction.css";

/* =========================================================
   GET AUCTION LIFECYCLE
========================================================= */

const getAuctionCountdown = (auction, now) => {
  const startMs = auction?.startTime
    ? new Date(auction.startTime).getTime()
    : NaN;

  const endMs = auction?.endTime ? new Date(auction.endTime).getTime() : NaN;

  if (
    !Number.isFinite(startMs) ||
    !Number.isFinite(endMs) ||
    endMs <= startMs
  ) {
    return {
      timeLeft: null,
      countdownLabel: "Time Left",
      countdownStatus: "INVALID",
      realTimeStatus: "INVALID",
    };
  }

  if (now < startMs) {
    return {
      timeLeft: Math.max(0, Math.floor((startMs - now) / 1000)),
      countdownLabel: "Starts In",
      countdownStatus: "UPCOMING",
      realTimeStatus: "SCHEDULED",
    };
  }

  if (now >= endMs) {
    return {
      timeLeft: 0,
      countdownLabel: "Auction Ended",
      countdownStatus: "ENDED",
      realTimeStatus: "ENDED",
    };
  }

  return {
    timeLeft: Math.max(0, Math.floor((endMs - now) / 1000)),
    countdownLabel: "Time Left",
    countdownStatus: "LIVE",
    realTimeStatus: "ACTIVE",
  };
};

/* =========================================================
   ALL AUCTIONS PAGE
========================================================= */

export default function AllAuction({
  onLogin,
  onLogout,
  isLoggedIn,
  user,
  isAdmin,
  onDashboard,
  onAdminDashboard,
  onHome,
  onViewAllAuctions,
  onProductDetails,
  onHowItWorks,
  activeLink,
  onActiveLinkChange,
}) {
  /* =========================================================
     FILTER STATES
  ========================================================= */

  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [auctionType, setAuctionType] = useState("All Types");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000000);

  /* =========================================================
     AUCTION DATA STATES
  ========================================================= */

  const [auctions, setAuctions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
     FETCH ALL CATEGORIES
  ========================================================= */

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        const response = await getProductCategories();

        const allCategories =
          response?.data?.data ?? response?.data ?? response;

        if (isMounted) {
          setCategories(Array.isArray(allCategories) ? allCategories : []);
        }
      } catch (categoryError) {
        console.error("Failed to fetch product categories:", categoryError);

        if (isMounted) {
          setCategories([]);
        }
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  /* =========================================================
     FETCH ALL AUCTIONS + PRODUCT DETAILS
  ========================================================= */

  useEffect(() => {
    let isMounted = true;

    const fetchAuctions = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getAllAuctions();

        const allAuctions = response?.data?.data ?? response?.data ?? response;

        const auctionList = Array.isArray(allAuctions) ? allAuctions : [];

        const auctionsWithProducts = await Promise.all(
          auctionList.map(async (auction) => {
            try {
              const productResponse = await getProductById(auction.productId);

              const product =
                productResponse?.data?.data ??
                productResponse?.data ??
                productResponse;

              if (!product) {
                return null;
              }

              const lifecycle = getAuctionCountdown(auction, Date.now());

              return {
                ...auction,

                /* PRODUCT DETAILS */

                product,
                productId: product.productId ?? auction.productId,
                image: product.imageUrl || "",
                title:
                  product.pname || auction.productTitle || "Untitled Product",
                description: product.description || "",
                seller: product.sellerName || product.sellerEmail || "Seller",
                category: product.categoryName || "Uncategorized",
                verified: product.isVerified === true,

                /* AUCTION DETAILS */

                id: auction.auctionId,

                price:
                  auction.currHighestBid ??
                  auction.basePrice ??
                  product.basePrice ??
                  0,

                /* REAL-TIME DISPLAY STATUS */

                realTimeStatus: lifecycle.realTimeStatus,
                type:
                  lifecycle.realTimeStatus === "ACTIVE"
                    ? "Live Auctions"
                    : lifecycle.realTimeStatus === "SCHEDULED"
                      ? "Scheduled Auctions"
                      : "Ended Auctions",
              };
            } catch (productError) {
              console.error(
                `Failed to fetch product ${auction.productId}:`,
                productError,
              );

              return null;
            }
          }),
        );

        if (isMounted) {
          setAuctions(auctionsWithProducts.filter(Boolean));
        }
      } catch (fetchError) {
        console.error("Failed to fetch all auctions:", fetchError);

        if (isMounted) {
          setError("Unable to load auctions. Please try again.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAuctions();

    return () => {
      isMounted = false;
    };
  }, []);

  /* =========================================================
     CATEGORY FILTER
  ========================================================= */

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category],
    );
  };

  /* =========================================================
     CLEAR FILTERS
  ========================================================= */

  const clearFilters = () => {
    setSearch("");
    setSelectedCategories([]);
    setAuctionType("All Types");
    setMinPrice(0);
    setMaxPrice(10000000);
  };

  /* =========================================================
     FILTER + SORT
  ========================================================= */

  const filteredAuctions = useMemo(() => {
    let result = [...auctions];

    /* REAL-TIME STATUS FILTER */

    result = result.filter((auction) => {
      const lifecycle = getAuctionCountdown(auction, now);

      if (lifecycle.realTimeStatus === "INVALID") {
        return false;
      }

      // Hide ended auctions from all active listings.
      if (lifecycle.realTimeStatus === "ENDED") {
        return false;
      }

      if (auctionType === "Scheduled Auctions") {
        return lifecycle.realTimeStatus === "SCHEDULED";
      }

      if (auctionType === "Live Auctions") {
        return lifecycle.realTimeStatus === "ACTIVE";
      }

      // All Types shows scheduled + active auctions.
      return (
        lifecycle.realTimeStatus === "SCHEDULED" ||
        lifecycle.realTimeStatus === "ACTIVE"
      );
    });

    /* SEARCH */

    if (search.trim()) {
      const value = search.toLowerCase().trim();

      result = result.filter(
        (auction) =>
          auction.title?.toLowerCase().includes(value) ||
          auction.seller?.toLowerCase().includes(value) ||
          auction.category?.toLowerCase().includes(value),
      );
    }

    /* CATEGORY */

    if (selectedCategories.length > 0) {
      result = result.filter((auction) =>
        selectedCategories.includes(auction.category),
      );
    }

    /* PRICE */

    result = result.filter(
      (auction) =>
        Number(auction.price) >= minPrice && Number(auction.price) <= maxPrice,
    );

    return result;
  }, [
    auctions,
    search,
    selectedCategories,
    minPrice,
    maxPrice,
    auctionType,
    now,
  ]);

  const currentAuctions = filteredAuctions;

  /* =========================================================
     RETURN
  ========================================================= */

  return (
    <>
      {/* HEADER */}

      <Header
        onLogin={onLogin}
        onLogout={onLogout}
        isLoggedIn={isLoggedIn}
        user={user}
        isAdmin={isAdmin}
        onDashboard={onDashboard}
        onAdminDashboard={onAdminDashboard}
        onHome={onHome}
        onViewAllAuctions={onViewAllAuctions}
        onHowItWorks={onHowItWorks}
        activeLink={activeLink || "Auctions"}
        onActiveLinkChange={onActiveLinkChange}
      />

      <div className="all-auctions-page">
        <div className="all-auctions-container">
          <div className="auction-main">
            {/* LEFT FILTER SIDEBAR */}

            <aside className="auction-sidebar">
              {/* CATEGORIES */}

              <div className="filter-section">
                <h3>CATEGORIES</h3>

                <label className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedCategories.length === 0}
                    onChange={() => setSelectedCategories([])}
                  />

                  <span className="category-name">All Categories</span>
                </label>

                {categories.map((category) => {
                  const categoryName = category.categoryName;

                  const categoryCount = auctions.filter(
                    (auction) => auction.category === categoryName,
                  ).length;

                  return (
                    <label
                      className="filter-checkbox"
                      key={category.categoryId}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(categoryName)}
                        onChange={() => handleCategoryChange(categoryName)}
                      />

                      <span className="category-name">{categoryName}</span>

                      <span className="category-count">{categoryCount}</span>
                    </label>
                  );
                })}
              </div>

              {/* PRICE RANGE */}

              <div className="filter-section">
                <h3>PRICE RANGE</h3>

                <div className="range-wrapper">
                  <input
                    type="range"
                    min="0"
                    max="10000000"
                    step="5000"
                    value={minPrice}
                    onChange={(e) => {
                      const value = Number(e.target.value);

                      if (value <= maxPrice) {
                        setMinPrice(value);
                      }
                    }}
                    className="range-input"
                  />

                  <input
                    type="range"
                    min="0"
                    max="10000000"
                    step="5000"
                    value={maxPrice}
                    onChange={(e) => {
                      const value = Number(e.target.value);

                      if (value >= minPrice) {
                        setMaxPrice(value);
                      }
                    }}
                    className="range-input"
                  />
                </div>

                <div className="price-labels">
                  <span>Min: ₹{minPrice.toLocaleString("en-IN")}</span>

                  <span>Max: ₹{maxPrice.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* AUCTION TYPE */}

              <div className="filter-section">
                <h3>AUCTION TYPE</h3>

                {["All Types", "Scheduled Auctions", "Live Auctions"].map(
                  (type) => (
                    <label className="radio-option" key={type}>
                      <input
                        type="radio"
                        name="auctionType"
                        value={type}
                        checked={auctionType === type}
                        onChange={(e) => setAuctionType(e.target.value)}
                      />

                      <span>{type}</span>
                    </label>
                  ),
                )}
              </div>

              {/* CLEAR FILTERS */}

              <button
                type="button"
                className="clear-filters-btn"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            </aside>

            {/* AUCTION RESULTS */}

            <section className="auction-results">
              {/* LOADING */}

              {loading ? (
                <div className="no-auctions">
                  <h3>Loading auctions...</h3>
                  <p>Please wait while we fetch the auction details.</p>
                </div>
              ) : error ? (
                /* ERROR */

                <div className="no-auctions">
                  <h3>Unable to load auctions</h3>
                  <p>{error}</p>
                </div>
              ) : currentAuctions.length > 0 ? (
                /* AUCTION CARDS */

                <div className="auction-list">
                  {currentAuctions.map((auction) => {
                    const countdown = getAuctionCountdown(auction, now);

                    return (
                      <AuctionCard
                        key={auction.auctionId}
                        auctionId={auction.auctionId}
                        productId={auction.productId}
                        image={auction.image}
                        title={auction.title}
                        seller={auction.seller}
                        category={auction.category}
                        description={auction.description}
                        basePrice={auction.basePrice}
                        currHighestBid={auction.currHighestBid}
                        startTime={auction.startTime}
                        endTime={auction.endTime}
                        auctionStatus={countdown.realTimeStatus}
                        product={auction.product}
                        timeLeft={countdown.timeLeft}
                        countdownLabel={countdown.countdownLabel}
                        countdownStatus={countdown.countdownStatus}
                        verified={auction.verified}
                        onProductClick={() =>
                          onProductDetails?.({
                            ...auction.product,
                            ...auction,
                            productId: auction.productId,
                            auctionId: auction.auctionId,
                          })
                        }
                      />
                    );
                  })}
                </div>
              ) : (
                /* NO AUCTIONS */

                <div className="no-auctions">
                  <h3>
                    {auctionType === "Live Auctions"
                      ? "No live auctions found"
                      : auctionType === "Scheduled Auctions"
                        ? "No scheduled auctions found"
                        : "No auctions found"}
                  </h3>

                  <p>Try changing your search or filter options.</p>

                  <button type="button" onClick={clearFilters}>
                    Clear Filters
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
