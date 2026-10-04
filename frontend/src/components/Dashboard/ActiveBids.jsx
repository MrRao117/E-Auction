import { useEffect, useState } from "react";

import { getMyRegistrations } from "../../api/auction/auctionRegistrationApi";
import { getBidCountForAuction } from "../../api/bid/bidApi";
import { getProductById } from "../../api/product/productApi";

function ActiveBids({ onLiveAuction }) {
  const [activeBids, setActiveBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch registered auctions
  useEffect(() => {
    let isMounted = true;

    const fetchRegisteredAuctions = async () => {
      try {
        const response = await getMyRegistrations();

        const auctions = Array.isArray(response)
          ? response
          : response?.data || response?.content || [];

        const registeredAuctions = await Promise.all(
          auctions.map(async (auction) => {
            let imageUrl = "";
            let productBasePrice = null;
            let bidCount = null;

            // Fetch product image and base price
            if (auction.productId) {
              try {
                const productResponse = await getProductById(auction.productId);

                const product = productResponse?.data || productResponse;

                imageUrl = product?.imageUrl || "";
                productBasePrice = product?.basePrice ?? null;
              } catch (error) {
                console.error(
                  `Failed to fetch product ${auction.productId}:`,
                  error,
                );
              }
            }

            // Fetch bid count
            if (auction.auctionId) {
              try {
                const countResponse = await getBidCountForAuction(
                  auction.auctionId,
                );

                const countData = countResponse?.data ?? countResponse;

                bidCount =
                  typeof countData === "number"
                    ? countData
                    : (countData?.bidCount ??
                      countData?.totalBids ??
                      countData?.count ??
                      null);
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
              name: auction.productTitle || auction.title || "---",
              image: imageUrl,
              basePrice: productBasePrice,
              endTime: auction.endTime,
              bids: bidCount,
              status: auction.auctionStatus,
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

  // Format countdown as HH : MM : SS
  const formatCountdown = (endTime) => {
    if (!endTime) return "---";

    const remaining = Math.max(0, new Date(endTime).getTime() - currentTime);

    const hours = Math.floor(remaining / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);

    return `${String(hours).padStart(2, "0")} : ${String(minutes).padStart(
      2,
      "0",
    )} : ${String(seconds).padStart(2, "0")}`;
  };

  // Check whether the countdown has reached zero
  const isTimeZero = (endTime) => {
    if (!endTime) return false;

    return new Date(endTime).getTime() <= currentTime;
  };

  // Open the selected auction's Live Auction page
  const handleAuctionClick = (item) => {
    onLiveAuction?.(item);
  };

  return (
    <div className="dashboard-card active-bids-card" id="active-bids">
      <div className="card-header">
        <h2>Registered Auctions</h2>
        <a href="#active-bids">View All →</a>
      </div>

      <div className="bid-list">
        {loading ? (
          <p>No results found.</p>
        ) : activeBids.length === 0 ? (
          <p>No results found.</p>
        ) : (
          activeBids.map((item) => {
            const timeZero = isTimeZero(item.endTime);

            return (
              <div
                className={`bid-item ${timeZero ? "auction-ended" : ""}`}
                key={item.id}
                onClick={() => handleAuctionClick(item)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleAuctionClick(item);
                  }
                }}
                role="button"
                tabIndex={0}
                style={{ cursor: "pointer" }}
              >
                <img src={item.image || undefined} alt={item.name} />

                <div className="bid-info">
                  <h3>{item.name}</h3>
                  <span>Base Price</span>

                  <strong>
                    {item.basePrice != null
                      ? `₹${Number(item.basePrice).toLocaleString("en-IN")}`
                      : "---"}
                  </strong>
                </div>

                <div className="bid-time">
                  <strong>{formatCountdown(item.endTime)}</strong>
                  <small>Hrs&nbsp;&nbsp; Mins&nbsp;&nbsp; Sec</small>
                </div>

                <span className="bid-count">
                  {item.bids != null ? `${item.bids} Bids` : "---"}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ActiveBids;
