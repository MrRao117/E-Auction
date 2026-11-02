import { useEffect, useState } from "react";

import { getMyBids } from "../../api/bid/bidApi";
import { getMyOrders } from "../../api/order/orderApi";

function DashboardStats() {
  const [activeBids, setActiveBids] = useState(0);
  const [wonAuctions, setWonAuctions] = useState(0);

  // No static values for these counters.
  const [watchlistItems, setWatchlistItems] = useState(0);
  const [messages, setMessages] = useState(0);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const bids = await getMyBids();
        const data = bids?.data ?? bids;

        setActiveBids(Array.isArray(data) ? data.length : 0);
      } catch (error) {
        console.error("Failed to fetch active bids:", error);
        setActiveBids(0);
      }

      try {
        const orders = await getMyOrders();
        const data = orders?.data ?? orders;

        setWonAuctions(Array.isArray(data) ? data.length : 0);
      } catch (error) {
        console.error("Failed to fetch won auctions:", error);
        setWonAuctions(0);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <section className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon">⚒</div>

        <div>
          <p>Total Bids</p>
          <h2>{activeBids}</h2>
        </div>

        <a href="#active-bids">View All →</a>
      </div>

      <div className="stat-card">
        <div className="stat-icon">🏆</div>

        <div>
          <p>Won Auctions</p>
          <h2>{wonAuctions}</h2>
        </div>

        <a href="#won-auctions">View All →</a>
      </div>

      <div className="stat-card">
        <div className="stat-icon heart">♥</div>

        <div>
          <p>Watchlist Items</p>
          <h2>{watchlistItems}</h2>
        </div>

        <a href="#watchlist">View All →</a>
      </div>

      <div className="stat-card">
        <div className="stat-icon">✉</div>

        <div>
          <p>Messages</p>
          <h2>{messages}</h2>
        </div>

        <a href="#messages">View All →</a>
      </div>
    </section>
  );
}

export default DashboardStats;
