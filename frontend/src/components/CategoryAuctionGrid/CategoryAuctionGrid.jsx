import { useEffect, useState } from "react";
import { getScheduledAuctions } from "../../api/auction/auctionApi";
import AuctionCard from "../AuctionCard/AuctionCard";
import "./CategoryAuctionGrid.css";

const categories = [
  {
    id: 4,
    title: "Art & Collectibles",
    description: "Find unique artwork, antiques, collectibles, and rare items.",
    theme: "art",
    layout: "half",
  },
  {
    id: 6,
    title: "Fashion",
    description:
      "Discover fashion pieces, footwear, handbags, and accessories.",
    theme: "fashion",
    layout: "half",
  },
  {
    id: 12,
    title: "Sports",
    description: "Explore sports equipment, memorabilia, and collectibles.",
    theme: "sports",
    layout: "full",
  },
];

/* Normalize category names for comparison */
const normalizeCategory = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]/g, "");

/* Read the category from the auction/product response */
const getAuctionCategory = (auction) => {
  const product = auction.product ?? auction.productDetails;

  return (
    product?.category?.name ??
    product?.category?.categoryName ??
    product?.categoryName ??
    auction.category?.name ??
    auction.category?.categoryName ??
    auction.categoryName ??
    ""
  );
};

/* CATEGORY PANEL */
function CategoryPanel({
  category,
  auctions,
  loading,
  onProductDetails,
  onExploreCategory,
}) {
  const visibleAuctions = auctions.slice(0, category.layout === "half" ? 3 : 6);

  return (
    <section
      className={`category-auction-panel category-theme-${category.theme} category-layout-${category.layout}`}
    >
      <div className="category-panel-info">
        <div className="category-panel-heading">
          <h2 className="category-panel-title">{category.title}</h2>

          <p className="category-panel-description">{category.description}</p>
        </div>

        {onExploreCategory && (
          <button
            type="button"
            className="category-explore-link"
            onClick={() => onExploreCategory(category)}
            aria-label={`Explore all ${category.title} auctions`}
          >
            Explore <span aria-hidden="true"></span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="category-empty-state" role="status">
          <p>Loading scheduled auctions...</p>
        </div>
      ) : visibleAuctions.length === 0 ? (
        <div className="category-empty-state">
          <h3>No {category.title} scheduled auctions found for now.</h3>
          <p>
            New {category.title.toLowerCase()} auctions will appear here when
            they become available.
          </p>
        </div>
      ) : (
        <div className="category-auction-cards">
          {visibleAuctions.map((auction) => (
            <div
              className="category-auction-card"
              key={auction.auctionId ?? auction.id}
            >
              <AuctionCard
                auctionId={auction.auctionId ?? auction.id}
                productId={
                  auction.productId ??
                  auction.product?.productId ??
                  auction.product?.id
                }
                image={
                  auction.product?.image ??
                  auction.product?.imageUrl ??
                  auction.image
                }
                title={
                  auction.product?.productName ??
                  auction.product?.name ??
                  auction.title ??
                  auction.productName ??
                  "Auction Item"
                }
                seller={
                  auction.seller?.name ??
                  auction.sellerName ??
                  "Verified Seller"
                }
                category={getAuctionCategory(auction)}
                description={
                  auction.product?.description ?? auction.description ?? ""
                }
                basePrice={auction.basePrice ?? auction.startingPrice}
                currHighestBid={
                  auction.currentHighestBid ?? auction.currHighestBid
                }
                startTime={auction.startTime}
                endTime={auction.endTime}
                auctionStatus={auction.status ?? auction.auctionStatus}
                product={auction.product ?? auction.productDetails}
                imageCount={auction.imageCount ?? 5}
                verified={auction.verified ?? true}
                onProductClick={onProductDetails}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* CATEGORY AUCTION GRID */
export default function CategoryAuctionGrid({
  onProductDetails,
  onExploreCategory,
  start = 0,
  limit,
}) {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchScheduledAuctions = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getScheduledAuctions();

        // Support either a direct array or a paginated/wrapped response.
        const data = Array.isArray(response)
          ? response
          : (response?.content ?? response?.data ?? response?.auctions ?? []);

        if (!Array.isArray(data)) {
          throw new Error("Unexpected scheduled auctions response.");
        }

        if (isMounted) {
          setAuctions(data);
        }
      } catch (err) {
        console.error("Failed to fetch scheduled auctions:", err);

        if (isMounted) {
          setError(
            "Unable to load scheduled auctions. Please try again later.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchScheduledAuctions();

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleCategories = categories.slice(
    start,
    limit === undefined ? undefined : start + limit,
  );

  if (error) {
    return (
      <div className="category-auctions-error" role="alert">
        <h3>Unable to load auctions</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="category-auctions-container">
      {visibleCategories.map((category) => {
        const categoryAuctions = auctions.filter((auction) => {
          const auctionCategory = getAuctionCategory(auction);

          return (
            normalizeCategory(auctionCategory) ===
            normalizeCategory(category.title)
          );
        });

        return (
          <div
            className={`category-grid-item category-item-${category.layout}`}
            key={category.id}
          >
            <CategoryPanel
              category={category}
              auctions={categoryAuctions}
              loading={loading}
              onProductDetails={onProductDetails}
              onExploreCategory={onExploreCategory}
            />
          </div>
        );
      })}
    </div>
  );
}
