import { useEffect, useState } from "react";

import { getMyRegistrations } from "../../api/auction/auctionRegistrationApi";
import { getBidCountForAuction } from "../../api/bid/bidApi";
import { getProductById } from "../../api/product/productApi";

function ActiveBids({ onLiveAuction, onViewDetails }) {
  const [activeBids, setActiveBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update countdown every second.
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch auctions registered by the authenticated user.
  useEffect(() => {
    let isMounted = true;

    const fetchRegisteredAuctions = async () => {
      try {
        const response = await getMyRegistrations();

        // Support Axios responses and direct API responses.
        const data = response?.data ?? response;

        const auctions = Array.isArray(data)
          ? data
          : Array.isArray(data?.content)
            ? data.content
            : Array.isArray(data?.registrations)
              ? data.registrations
              : Array.isArray(data?.data)
                ? data.data
                : [];

        const registeredAuctions = await Promise.all(
          auctions.map(async (auction) => {
            let imageUrl = "";
            let productBasePrice = auction.basePrice ?? null;
            let bidCount = null;

            // Fetch product image and base price.
            if (auction.productId) {
              try {
                const productResponse = await getProductById(auction.productId);

                const product = productResponse?.data ?? productResponse;

                imageUrl = product?.imageUrl || "";
                productBasePrice = product?.basePrice ?? productBasePrice;
              } catch (error) {
                console.error(
                  `Failed to fetch product ${auction.productId}:`,
                  error,
                );
              }
            }

            // Fetch bid count.
            if (auction.auctionId != null) {
              try {
                const countResponse = await getBidCountForAuction(
                  auction.auctionId,
                );

                const countData = countResponse?.data ?? countResponse;

                const count =
                  typeof countData === "number"
                    ? countData
                    : (countData?.bidCount ??
                      countData?.totalBids ??
                      countData?.count ??
                      null);

                bidCount =
                  count != null && Number.isFinite(Number(count))
                    ? Number(count)
                    : null;
              } catch (error) {
                console.error(
                  `Failed to fetch bid count for auction ${auction.auctionId}:`,
                  error,
                );
              }
            }

            return {
              id: auction.auctionId,
              auctionId: auction.auctionId,
              productId: auction.productId,
              name:
                auction.productTitle ||
                auction.title ||
                auction.product?.pname ||
                "---",
              image: imageUrl,
              basePrice: productBasePrice,
              startTime: auction.startTime,
              endTime: auction.endTime,
              bids: bidCount,
              status: auction.auctionStatus || auction.status || "",
            };
          }),
        );

        if (isMounted) {
          setActiveBids(registeredAuctions);
        }
      } catch (error) {
        console.error("Failed to fetch registered auctions:", error);

        if (isMounted) {
          setActiveBids([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRegisteredAuctions();

    return () => {
      isMounted = false;
    };
  }, []);

  // Determine auction status.
  const getAuctionStatus = (item) => {
    const status = String(item.status || "")
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, "_");

    const start = item.startTime ? new Date(item.startTime).getTime() : NaN;

    const end = item.endTime ? new Date(item.endTime).getTime() : NaN;

    if (status === "CANCELLED") {
      return "CANCELLED";
    }

    if (["ENDED", "COMPLETED", "CLOSED"].includes(status)) {
      return "ENDED";
    }

    if (Number.isFinite(end) && currentTime >= end) {
      return "ENDED";
    }

    if (status === "SCHEDULED") {
      return "SCHEDULED";
    }

    if (status === "ACTIVE") {
      if (Number.isFinite(start) && currentTime < start) {
        return "SCHEDULED";
      }

      return "ACTIVE";
    }

    return "UNAVAILABLE";
  };

  // Format countdown until the auction starts.
  const formatCountdown = (startTime) => {
    if (!startTime) {
      return "-- : -- : --";
    }

    const target = new Date(startTime).getTime();

    if (!Number.isFinite(target)) {
      return "-- : -- : --";
    }

    const remaining = Math.max(0, target - currentTime);

    const hours = Math.floor(remaining / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);

    return `${String(hours).padStart(2, "0")} : ${String(minutes).padStart(
      2,
      "0",
    )} : ${String(seconds).padStart(2, "0")}`;
  };

  // Status label.
  const getStatusLabel = (status) => {
    switch (status) {
      case "SCHEDULED":
        return "Scheduled";
      case "ACTIVE":
        return "Active";
      case "ENDED":
        return "Ended";
      case "CANCELLED":
        return "Cancelled";
      default:
        return "Unavailable";
    }
  };

  // Open the live auction only when active.
  const handleAuctionClick = (item) => {
    const status = getAuctionStatus(item);

    if (status === "SCHEDULED") {
      window.alert("This auction has not started yet.");
      return;
    }

    if (status === "ENDED") {
      window.alert("This auction has ended.");
      return;
    }

    if (status === "CANCELLED") {
      window.alert("This auction has been cancelled.");
      return;
    }

    if (status !== "ACTIVE") {
      window.alert("This auction is currently unavailable.");
      return;
    }

    if (onLiveAuction) {
      onLiveAuction(item);
    } else {
      window.alert("Live auction navigation is not configured.");
    }
  };

  // View details without triggering the card click.
  const handleViewDetails = (event, item) => {
    event.stopPropagation();

    if (onViewDetails) {
      onViewDetails(item);
    } else {
      window.alert("Please connect the View Details handler.");
    }
  };

  // Place Bid opens the existing Live Auction route.
  const handleActionButtonClick = (event, item, status) => {
    event.stopPropagation();

    if (status === "ACTIVE") {
      handleAuctionClick(item);
    } else {
      handleViewDetails(event, item);
    }
  };

  return (
    <div className="dashboard-card active-bids-card" id="active-bids">
      <div className="card-header">
        <h2>Registered Auctions</h2>
        <a href="#active-bids">View All →</a>
      </div>

      <div className="bid-list">
        {loading ? (
          <p>Loading registered auctions...</p>
        ) : activeBids.length === 0 ? (
          <p>No registered auctions found.</p>
        ) : (
          activeBids.map((item) => {
            const status = getAuctionStatus(item);
            const isScheduled = status === "SCHEDULED";
            const canEnter = status === "ACTIVE";

            return (
              <div
                className={`bid-item ${
                  status === "ENDED" ? "auction-ended" : ""
                } ${!canEnter ? "auction-not-enterable" : ""}`}
                key={item.id}
                onClick={() => handleAuctionClick(item)}
                onKeyDown={(event) => {
                  if (
                    event.target === event.currentTarget &&
                    (event.key === "Enter" || event.key === " ")
                  ) {
                    event.preventDefault();
                    handleAuctionClick(item);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`${item.name}, ${getStatusLabel(status)}`}
                title={
                  canEnter
                    ? "Enter live auction"
                    : `${getStatusLabel(status)} auction`
                }
                style={{
                  cursor: canEnter ? "pointer" : "default",
                }}
              >
                <img
                  className="bid-product-image"
                  src={item.image || undefined}
                  alt={item.name}
                />

                <div className="bid-info">
                  <h3>{item.name}</h3>

                  <span className="base-price-label">Base Price</span>

                  <strong className="base-price-value">
                    {item.basePrice != null
                      ? `₹${Number(item.basePrice).toLocaleString("en-IN")}`
                      : "---"}
                  </strong>

                  {/* Small Scheduled badge below Base Price. */}
                  {isScheduled && (
                    <span className="auction-status status-scheduled">
                      Scheduled
                    </span>
                  )}
                </div>

                {/* Countdown for Scheduled; status for other auctions. */}
                <div className="bid-time">
                  {isScheduled ? (
                    <>
                      <strong className="countdown-value">
                        {formatCountdown(item.startTime)}
                      </strong>
                      <small>Hrs&nbsp;&nbsp; Mins&nbsp;&nbsp; Sec</small>
                    </>
                  ) : (
                    <span
                      className={`auction-status status-${status.toLowerCase()}`}
                    >
                      {getStatusLabel(status)}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  className={`view-details-btn ${
                    canEnter ? "place-bid-btn" : ""
                  }`}
                  onClick={(event) =>
                    handleActionButtonClick(event, item, status)
                  }
                >
                  {canEnter ? "Place Bid" : "View Details"}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ActiveBids;
