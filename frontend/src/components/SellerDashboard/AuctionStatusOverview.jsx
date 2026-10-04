import { useEffect, useState } from "react";
import { getMyAuctions } from "../../api/auction/auctionApi";
import Icon from "../Icon/Icon";

export default function AuctionStatusOverview() {
  const [auctions, setAuctions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH SELLER AUCTIONS WHEN DASHBOARD OPENS
  // ==========================================
  useEffect(() => {
    let isMounted = true;

    const fetchAuctions = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await getMyAuctions();

        console.log("My Auctions API Response:", response);

        const payload = response?.data ?? response;

        const auctionList = Array.isArray(payload)
          ? payload
          : (payload?.auctions ?? payload?.content ?? payload?.data ?? []);

        if (!Array.isArray(auctionList)) {
          throw new Error("Invalid auction data received from the server.");
        }

        if (isMounted) {
          setAuctions(auctionList);
        }
      } catch (err) {
        console.error("Failed to load seller auctions:", err);

        if (isMounted) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to load auction statistics.",
          );

          setAuctions([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchAuctions();

    return () => {
      isMounted = false;
    };
  }, []);

  // ==========================================
  // GET AUCTION STATUS
  // ==========================================
  const getStatus = (auction) =>
    String(auction.status ?? auction.auctionStatus ?? "")
      .trim()
      .toUpperCase();

  // ==========================================
  // CALCULATE AUCTION STATUS COUNTS
  // ==========================================
  const statusCounts = {
    scheduled: auctions.filter((auction) =>
      ["SCHEDULED", "UPCOMING"].includes(getStatus(auction)),
    ).length,

    active: auctions.filter((auction) =>
      ["ACTIVE", "LIVE"].includes(getStatus(auction)),
    ).length,

    ended: auctions.filter((auction) =>
      ["ENDED", "COMPLETED"].includes(getStatus(auction)),
    ).length,

    cancelled: auctions.filter((auction) => getStatus(auction) === "CANCELLED")
      .length,
  };

  // Total is the actual number of returned auctions.
  const totalAuctions = auctions.length;

  // ==========================================
  // COMPONENT UI
  // ==========================================
  return (
    <div className="seller-status-overview-card">
      <div className="seller-section-heading">
        <div>
          <span className="seller-section-label">OVERVIEW</span>
          <h2>Auction Status Overview</h2>
        </div>

        <Icon name="barChart" size={20} />
      </div>

      {/* AUCTION STATUS DISPLAY */}
      <div className="seller-status-chart">
        {isLoading ? (
          <div className="seller-chart-empty">
            <div className="seller-chart-icon">
              <Icon name="barChart" size={26} />
            </div>

            <h3>Loading Auction Data...</h3>
            <p>Please wait while we load your auction statistics.</p>
          </div>
        ) : error ? (
          <div className="seller-chart-empty">
            <div className="seller-chart-icon">
              <Icon name="barChart" size={26} />
            </div>

            <h3>Unable to Load Data</h3>
            <p>{error}</p>
          </div>
        ) : totalAuctions === 0 ? (
          <div className="seller-chart-empty">
            <div className="seller-chart-icon">
              <Icon name="barChart" size={26} />
            </div>

            <h3>No Auction Data</h3>
            <p>
              Auction status statistics will appear here once you create
              auctions.
            </p>
          </div>
        ) : (
          <div className="seller-chart-empty">
            <div className="seller-chart-icon">
              <Icon name="barChart" size={26} />
            </div>

            <h3>{totalAuctions} Total Auctions</h3>

            <p>
              Your auction status statistics are updated from your seller
              auction data.
            </p>
          </div>
        )}
      </div>

      {/* STATUS LEGEND */}
      <div className="seller-status-legend">
        <div className="seller-status-legend-item">
          <span className="seller-status-dot scheduled"></span>
          <span>Scheduled</span>
          <strong>{statusCounts.scheduled}</strong>
        </div>

        <div className="seller-status-legend-item">
          <span className="seller-status-dot active"></span>
          <span>Active</span>
          <strong>{statusCounts.active}</strong>
        </div>

        <div className="seller-status-legend-item">
          <span className="seller-status-dot ended"></span>
          <span>Ended</span>
          <strong>{statusCounts.ended}</strong>
        </div>

        <div className="seller-status-legend-item">
          <span className="seller-status-dot cancelled"></span>
          <span>Cancelled</span>
          <strong>{statusCounts.cancelled}</strong>
        </div>
      </div>
    </div>
  );
}
