import { useEffect, useState } from "react";
import { getMyAuctions } from "../../api/auction/auctionApi";
import Icon from "../Icon/Icon";

const filters = [
  { label: "All", value: "ALL" },
  { label: "Scheduled", value: "SCHEDULED" },
  { label: "Live", value: "ACTIVE" },
  { label: "Ended", value: "ENDED" },
];

const statusGroups = {
  SCHEDULED: ["SCHEDULED", "UPCOMING"],
  ACTIVE: ["ACTIVE", "LIVE", "ONGOING"],
  ENDED: ["ENDED", "COMPLETED", "CLOSED"],
};

export default function CurrentlyRunningAuctions() {
  const [auctions, setAuctions] = useState([]);
  const [activeFilter, setActiveFilter] = useState("ALL");
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
          err.response?.data?.message || "Failed to load your auctions.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  const getStatus = (auction) =>
    String(auction.status || auction.auctionStatus || "UNKNOWN").toUpperCase();

  const getTitle = (auction) =>
    auction.title ||
    auction.auctionTitle ||
    auction.product?.productName ||
    auction.product?.name ||
    auction.productName ||
    "Untitled Auction";

  const getAuctionId = (auction) => auction.auctionId || auction.id || "N/A";

  const getImage = (auction) =>
    auction.product?.imageUrl ||
    auction.product?.image ||
    auction.product?.productImageUrl ||
    auction.productImageUrl ||
    auction.imageUrl ||
    auction.image ||
    "";

  const filteredAuctions =
    activeFilter === "ALL"
      ? auctions
      : auctions.filter((auction) =>
          (statusGroups[activeFilter] || []).includes(getStatus(auction)),
        );

  const emptyMessages = {
    ALL: {
      title: "No Auctions Created",
      description: "Your created auctions will appear here.",
      icon: "gavel",
    },
    SCHEDULED: {
      title: "No Scheduled Auctions",
      description: "Your upcoming auctions will appear here.",
      icon: "gavel",
    },
    ACTIVE: {
      title: "No Running Auctions",
      description: "You currently do not have any active auctions.",
      icon: "gavel",
    },
    ENDED: {
      title: "No Ended Auctions",
      description: "Your completed auctions will appear here.",
      icon: "checkCircle",
    },
  };

  const emptyState = emptyMessages[activeFilter];

  return (
    <div className="seller-auction-section seller-all-auctions-section">
      <div className="seller-auction-filters" aria-label="Filter auctions">
        {filters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            className={`seller-auction-filter ${
              activeFilter === filter.value ? "active" : ""
            }`}
            onClick={() => setActiveFilter(filter.value)}
            aria-pressed={activeFilter === filter.value}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="seller-running-auctions">
        {loading ? (
          <div className="seller-empty-auctions">
            <p>Loading your auctions...</p>
          </div>
        ) : error ? (
          <div className="seller-empty-auctions" role="alert">
            <h3>Unable to Load Auctions</h3>
            <p>{error}</p>
          </div>
        ) : filteredAuctions.length === 0 ? (
          <div className="seller-empty-auctions">
            <div className="seller-empty-icon">
              <Icon name={emptyState.icon} size={26} />
            </div>

            <h3>{emptyState.title}</h3>
            <p>{emptyState.description}</p>
          </div>
        ) : (
          <div className="seller-created-auctions-list">
            {filteredAuctions.map((auction, index) => {
              const status = getStatus(auction);
              const imageUrl = getImage(auction);

              return (
                <div
                  className="seller-created-auction-item"
                  key={auction.auctionId || auction.id || index}
                >
                  <div className="seller-created-auction-image">
                    {imageUrl ? (
                      <img src={imageUrl} alt={getTitle(auction)} />
                    ) : (
                      <Icon name="image" size={32} />
                    )}
                  </div>

                  <div className="seller-created-auction-info">
                    <h3 className="seller-created-auction-title">
                      {getTitle(auction)}
                    </h3>

                    <span
                      className={`seller-auction-status seller-status-${status.toLowerCase()}`}
                    >
                      {status}
                    </span>

                    <span className="seller-created-auction-id">
                      <strong>Auction ID:</strong> {getAuctionId(auction)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
