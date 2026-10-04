import { useEffect, useState } from "react";
import { getMyAuctions } from "../../api/auction/auctionApi";
import Icon from "../Icon/Icon";

export default function SellerAuctionSummary() {
  const [summary, setSummary] = useState({
    totalAuctions: 0,
    activeAuctions: 0,
    endedAuctions: 0,
    totalEarnings: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAuctionSummary = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getMyAuctions();

        const auctionList = Array.isArray(response)
          ? response
          : (response?.auctions ?? response?.content ?? response?.data ?? []);

        const auctions = Array.isArray(auctionList) ? auctionList : [];

        const activeStatuses = ["ACTIVE", "LIVE", "ONGOING"];
        const endedStatuses = ["ENDED", "COMPLETED", "CLOSED"];

        const activeAuctions = auctions.filter((auction) =>
          activeStatuses.includes(
            String(auction.status || auction.auctionStatus || "").toUpperCase(),
          ),
        ).length;

        const endedAuctionList = auctions.filter((auction) =>
          endedStatuses.includes(
            String(auction.status || auction.auctionStatus || "").toUpperCase(),
          ),
        );

        const totalEarnings = endedAuctionList.reduce((total, auction) => {
          const earnings =
            auction.sellerEarnings ??
            auction.totalEarnings ??
            auction.sellingPrice ??
            auction.finalBid ??
            auction.currentHighestBid ??
            auction.highestBid ??
            0;

          return total + (Number(earnings) || 0);
        }, 0);

        setSummary({
          totalAuctions: auctions.length,
          activeAuctions,
          endedAuctions: endedAuctionList.length,
          totalEarnings,
        });
      } catch (err) {
        console.error("Error fetching auction summary:", err);

        setError(
          err.response?.data?.message || "Failed to load auction summary.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAuctionSummary();
  }, []);

  const formatCurrency = (amount) =>
    `₹${Number(amount).toLocaleString("en-IN")}`;

  const summaryCards = [
    {
      label: "Total Auctions",
      value: summary.totalAuctions,
      description: "All auctions created",
      icon: "gavel",
    },
    {
      label: "Active Auctions",
      value: summary.activeAuctions,
      description: "Currently running",
      icon: "activity",
    },
    {
      label: "Ended Auctions",
      value: summary.endedAuctions,
      description: "Successfully completed",
      icon: "checkCircle",
    },
    {
      label: "Total Earnings",
      value: formatCurrency(summary.totalEarnings),
      description: "From completed auctions",
      icon: "creditCard",
    },
  ];

  return (
    <div className="seller-summary-grid">
      {summaryCards.map((card) => (
        <div className="seller-summary-card" key={card.label}>
          <div className="seller-summary-card-top">
            <div className="seller-summary-icon">
              <Icon name={card.icon} size={20} />
            </div>

            <span className="seller-summary-label">{card.label}</span>
          </div>

          <strong className="seller-summary-value">
            {loading ? "..." : card.value}
          </strong>

          <span className="seller-summary-description">{card.description}</span>
        </div>
      ))}

      {error && (
        <p className="seller-summary-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
