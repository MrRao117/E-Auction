import { useEffect, useState } from "react";
import { getMyAuctions } from "../../api/auction/auctionApi";
import Icon from "../Icon/Icon";

export default function SellerCreatedAuctions() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getMyAuctions();

        const auctionList = Array.isArray(response)
          ? response
          : (response?.auctions ?? response?.content ?? response?.data ?? []);

        setAuctions(Array.isArray(auctionList) ? auctionList : []);
      } catch (err) {
        console.error("Error fetching seller auctions:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load your auctions. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  const getAuctionTitle = (auction) =>
    auction.title ||
    auction.auctionTitle ||
    auction.product?.productName ||
    auction.product?.name ||
    auction.productName ||
    "Untitled Auction";

  const getAuctionStatus = (auction) =>
    auction.status || auction.auctionStatus || "UNKNOWN";

  const getAuctionId = (auction) => auction.auctionId || auction.id || "N/A";

  const getAuctionImage = (auction) =>
    auction.product?.imageUrl ||
    auction.product?.image ||
    auction.product?.productImageUrl ||
    auction.productImageUrl ||
    auction.imageUrl ||
    auction.image ||
    "";

  return (
    <div className="seller-created-auctions-card">
      {/* Section Heading */}
      <div className="seller-section-heading">
        <div>
          <span className="seller-section-label">AUCTIONS</span>
          <h2>Created Auctions</h2>
        </div>

        <span className="seller-auction-count">
          {auctions.length} {auctions.length === 1 ? "Auction" : "Auctions"}
        </span>
      </div>

      {/* Auctions List */}
      <div className="seller-created-auctions-list">
        {loading ? (
          <div className="seller-empty-auctions">
            <p>Loading your auctions...</p>
          </div>
        ) : error ? (
          <div className="seller-empty-auctions">
            <h3>Unable to Load Auctions</h3>
            <p>{error}</p>
          </div>
        ) : auctions.length === 0 ? (
          <div className="seller-empty-auctions">
            <div className="seller-empty-icon">
              <Icon name="gavel" size={26} />
            </div>

            <h3>No Auctions Created</h3>
            <p>Your created auctions will appear here.</p>
          </div>
        ) : (
          auctions.map((auction, index) => {
            const imageUrl = getAuctionImage(auction);

            return (
              <div
                className="seller-created-auction-item"
                key={auction.auctionId || auction.id || index}
              >
                {/* Product Image */}
                <div className="seller-created-auction-image">
                  {imageUrl ? (
                    <img src={imageUrl} alt={getAuctionTitle(auction)} />
                  ) : (
                    <Icon name="image" size={32} />
                  )}
                </div>

                {/* Auction Information */}
                <div className="seller-created-auction-info">
                  <h3 className="seller-created-auction-title">
                    {getAuctionTitle(auction)}
                  </h3>

                  <span
                    className={`seller-auction-status seller-status-${String(
                      getAuctionStatus(auction),
                    ).toLowerCase()}`}
                  >
                    {getAuctionStatus(auction)}
                  </span>

                  <span className="seller-created-auction-id">
                    <strong>Auction ID:</strong> {getAuctionId(auction)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
