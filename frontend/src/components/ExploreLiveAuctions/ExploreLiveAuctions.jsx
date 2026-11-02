import { useEffect, useRef, useState } from "react";

import AuctionCard from "../AuctionCard/AuctionCard";

import { getAuctionsByStatus } from "../../api/auction/auctionApi";
import { getProductById } from "../../api/product/productApi";

import { combineAuctionWithProduct } from "../../utils/auctionUtils";

import "./ExploreLiveAuctions.css";

export default function ExploreLiveAuctions({
  onViewAllAuctions,
  onProductDetails,
}) {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const productCache = useRef(new Map());
  const isMountedRef = useRef(false);
  const isFetchingRef = useRef(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    let isActive = true;

    isMountedRef.current = true;

    const fetchLiveAuctions = async () => {
      if (isFetchingRef.current || !isActive) return;

      isFetchingRef.current = true;

      try {
        const response = await getAuctionsByStatus("ACTIVE");

        // Support both a direct array and common API response wrappers.
        const data = response?.data?.data ?? response?.data ?? response;

        const activeAuctions = Array.isArray(data) ? data : [];

        const auctionsWithProducts = await Promise.all(
          activeAuctions.map(async (auction) => {
            try {
              const productId = auction.productId;

              if (productId == null) {
                console.warn(
                  "Skipping auction without a product ID:",
                  auction.auctionId,
                );
                return null;
              }

              let product = productCache.current.get(String(productId));

              if (!product) {
                product = await getProductById(productId);
                productCache.current.set(String(productId), product);
              }

              return combineAuctionWithProduct(auction, product);
            } catch (productError) {
              console.error(
                `Failed to fetch product ${auction.productId}:`,
                productError,
              );

              return null;
            }
          }),
        );

        const validAuctions = auctionsWithProducts.filter(Boolean);

        if (isActive) {
          setAuctions(validAuctions);
          setError("");
          hasLoadedRef.current = true;
        }
      } catch (fetchError) {
        console.error("Failed to fetch live auctions:", fetchError);

        // Keep existing auctions visible if a background refresh fails.
        if (isActive && !hasLoadedRef.current) {
          setError("Unable to load live auctions. Please try again.");
        }
      } finally {
        isFetchingRef.current = false;

        if (isActive) {
          setLoading(false);
        }
      }
    };

    // Fetch immediately when the component mounts.
    fetchLiveAuctions();

    // Refresh the active auction list every 3 seconds.
    const intervalId = setInterval(fetchLiveAuctions, 3000);

    return () => {
      isActive = false;
      isMountedRef.current = false;
      clearInterval(intervalId);
    };
  }, []);

  const handleProductClick = (auction) => {
    if (typeof onProductDetails !== "function") {
      console.error("Product Details navigation handler is missing.");
      return;
    }

    onProductDetails({
      ...auction.product,
      ...auction,
      productId: auction.productId,
      auctionId: auction.auctionId,
    });
  };

  return (
    <section className="upcoming-section live-auctions-section">
      <div className="auction-heading">
        <div className="auction-heading-text">
          <h2 className="live-auction-heading">
            <span className="live-badge">
              <span className="live-indicator"></span>
              LIVE
            </span>
          </h2>

          <h3>Discover auctions happening right now and place your bids.</h3>
        </div>

        <button
          type="button"
          className="auction-view-all"
          onClick={onViewAllAuctions}
        >
          View All Auctions
        </button>
      </div>

      {loading ? (
        <div className="no-auctions">
          <h3>Loading live auctions...</h3>
          <p>Please wait while we fetch the active auctions.</p>
        </div>
      ) : error && auctions.length === 0 ? (
        <div className="no-auctions">
          <h3>Unable to load live auctions</h3>
          <p>{error}</p>

          <button type="button" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      ) : auctions.length > 0 ? (
        <div className="upcoming-grid live-auctions-grid">
          {auctions.map((auction) => (
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
              auctionStatus="ACTIVE"
              product={auction.product}
              verified={auction.verified}
              showLiveBadge={true}
              onProductClick={() => handleProductClick(auction)}
            />
          ))}
        </div>
      ) : (
        <div className="no-auctions">
          <h3>No live auctions found</h3>
          <p>
            There are no active auctions right now. Check back later for new
            bidding opportunities.
          </p>

          <button type="button" onClick={onViewAllAuctions}>
            View All Auctions
          </button>
        </div>
      )}
    </section>
  );
}
