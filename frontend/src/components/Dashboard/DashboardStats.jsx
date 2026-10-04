import { useEffect, useState } from "react";

import { getMyBids } from "../../api/bid/bidApi";
import { getMyOrders } from "../../api/order/orderApi";

function DashboardStats() {
  const [activeBids, setActiveBids] = useState(0);
  const [wonAuctions, setWonAuctions] = useState(0);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const bids = await getMyBids();

        setActiveBids(Array.isArray(bids) ? bids.length : 0);
      } catch (error) {
        console.error("Failed to fetch active bids:", error);
        setActiveBids(0);
      }

      try {
        const orders = await getMyOrders();

        setWonAuctions(Array.isArray(orders) ? orders.length : 0);
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
          <p>Active Bids</p>
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
          <h2>8</h2>
        </div>

        <a href="#watchlist">View All →</a>
      </div>

      <div className="stat-card">
        <div className="stat-icon">✉</div>

        <div>
          <p>Messages</p>
          <h2>2</h2>
        </div>

        <a href="#messages">View All →</a>
      </div>
    </section>
  );
}

export default DashboardStats;
