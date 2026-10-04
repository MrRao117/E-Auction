import { useEffect, useState } from "react";
import { getHighestBidForAuction } from "../../api/bid/bidApi";
import { getMyOrders } from "../../api/order/orderApi";

function WonAuctions() {
  const [wonAuctions, setWonAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWonAuctions = async () => {
      try {
        // 1. Fetch orders belonging to the logged-in buyer
        const response = await getMyOrders();

        const orders = Array.isArray(response)
          ? response
          : response?.data || response?.content || [];

        // 2. Fetch the highest bid for each auction
        const auctionsWithWinner = await Promise.all(
          orders.map(async (order) => {
            try {
              const bidResponse = await getHighestBidForAuction(
                order.auctionId,
              );

              const highestBid =
                bidResponse?.data || bidResponse?.content || bidResponse;

              // 3. Extract the winning bidder's user ID
              const winnerUserId =
                highestBid?.userId ??
                highestBid?.buyerId ??
                highestBid?.bidder?.userId ??
                highestBid?.buyer?.userId ??
                highestBid?.user?.userId ??
                null;

              return {
                ...order,
                winnerUserId,
              };
            } catch (error) {
              console.error(
                `Failed to fetch highest bid for auction ${order.auctionId}:`,
                error,
              );

              return {
                ...order,
                winnerUserId: null,
              };
            }
          }),
        );

        setWonAuctions(auctionsWithWinner);
      } catch (error) {
        console.error("Failed to fetch won auctions:", error);
        setWonAuctions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWonAuctions();
  }, []);

  return (
    <div className="dashboard-card" id="won-auctions">
      <div className="card-header">
        <h2>Won Auctions</h2>
        <a href="#won-auctions">View All →</a>
      </div>

      <div className="won-list">
        {loading ? (
          <p>Loading won auctions...</p>
        ) : wonAuctions.length === 0 ? (
          <p>No won auctions found.</p>
        ) : (
          wonAuctions.map((item) => (
            <div className="won-item" key={item.orderId}>
              <img
                src={
                  item.productImage ||
                  item.image ||
                  item.product?.imageUrl ||
                  item.product?.image ||
                  ""
                }
                alt={item.auctionTitle || "Auction"}
              />

              <div>
                <h3>{item.auctionTitle || "---"}</h3>

                <strong>
                  {item.winningAmount != null
                    ? `₹${Number(item.winningAmount).toLocaleString("en-IN")}`
                    : "---"}
                </strong>

                <p>
                  {item.orderDate
                    ? `Won on ${new Date(item.orderDate).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )}`
                    : "Date unavailable"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default WonAuctions;
