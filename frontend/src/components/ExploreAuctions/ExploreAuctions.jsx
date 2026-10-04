import { useEffect, useState } from "react";

import AuctionCard from "../AuctionCard/AuctionCard";

import { getAllAuctions } from "../../api/auction/auctionApi";
import { getProductById } from "../../api/product/productApi";

import {
  combineAuctionWithProduct,
  getUpcomingAuctions,
} from "../../utils/auctionUtils";

import "./ExploreAuctions.css";

export default function ExploreAuctions({
  onViewAllAuctions,
  onProductDetails,
}) {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => Date.now());

  /* =========================================================
     REAL-TIME CLOCK
  ========================================================= */

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /* =========================================================
     FETCH ALL AUCTIONS AND PRODUCT DETAILS
  ========================================================= */

  useEffect(() => {
    let isMounted = true;

    const fetchAuctions = async () => {
      try {
        setLoading(true);
        setError("");

        const allAuctions = await getAllAuctions();

        const auctionList = Array.isArray(allAuctions) ? allAuctions : [];

        const auctionsWithProducts = await Promise.all(
          auctionList.map(async (auction) => {
            try {
              const product = await getProductById(auction.productId);

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

        if (isMounted) {
          setAuctions(auctionsWithProducts.filter(Boolean));
        }
      } catch (fetchError) {
        console.error("Failed to fetch explore auctions:", fetchError);

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
     UPCOMING AUCTIONS
  ========================================================= */

  const upcomingAuctions = getUpcomingAuctions(auctions, now).slice(0, 6);

  /* =========================================================
     OPEN PRODUCT DETAILS
  ========================================================= */

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

  /* =========================================================
     RETURN
  ========================================================= */

  return (
    <section className="explore-section">
      <div className="explore-heading">
        <div className="explore-heading-text">
          <h2>Explore More</h2>

          <h3>Explore trending auctions and discover items you might love.</h3>
        </div>

        <button
          type="button"
          className="explore-view-all"
          onClick={onViewAllAuctions}
        >
          Explore More
        </button>
      </div>

      {loading ? (
        <div className="no-auctions">
          <h3>Loading auctions...</h3>
          <p>Please wait while we fetch the latest auctions.</p>
        </div>
      ) : error ? (
        <div className="no-auctions">
          <h3>Unable to load auctions</h3>
          <p>{error}</p>
        </div>
      ) : upcomingAuctions.length > 0 ? (
        <div className="explore-grid">
          {upcomingAuctions.map((auction) => (
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
              auctionStatus="SCHEDULED"
              product={auction.product}
              verified={auction.verified}
              onProductClick={() => handleProductClick(auction)}
            />
          ))}
        </div>
      ) : (
        <div className="no-auctions">
          <h3>No scheduled auctions found</h3>
          <p>New auctions will appear here when they become available.</p>

          <button type="button" onClick={onViewAllAuctions}>
            View All Auctions
          </button>
        </div>
      )}
    </section>
  );
}
