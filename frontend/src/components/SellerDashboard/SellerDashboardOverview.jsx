import AuctionStatusOverview from "./AuctionStatusOverview";
import CurrentlyRunningAuctions from "./CurrentlyRunningAuctions";
import SellerAccountDetails from "./SellerAccountDetails";
import SellerAuctionSummary from "./SellerAuctionSummary";
import SellerCreatedAuctions from "./SellerCreatedAuctions";
import SellerEndedAuctions from "./SellerEndedAuctions";

export default function SellerDashboardOverview() {
  return (
    <div className="seller-overview">
      {/* Page Heading */}
      <div className="seller-overview-heading">
        <div>
          <h1>Seller Dashboard</h1>
          <p>Manage your auctions and track your selling activity.</p>
        </div>
      </div>

      {/* Account Details */}
      <section className="seller-account-section">
        <SellerAccountDetails />
      </section>

      {/* Auction Summary */}
      <section className="seller-summary-section">
        <SellerAuctionSummary />
      </section>

      {/* Currently Running Auctions */}
      <section className="seller-running-section">
        <CurrentlyRunningAuctions />
      </section>

      {/* Bottom Dashboard Sections */}
      <div className="seller-bottom-grid">
        {/* Ended Auctions */}
        <section className="seller-ended-section">
          <SellerEndedAuctions />
        </section>

        {/* Created Auctions */}
        <section className="seller-created-section">
          <SellerCreatedAuctions />
        </section>

        {/* Auction Status Overview */}
        <section className="seller-status-section">
          <AuctionStatusOverview />
        </section>
      </div>
    </div>
  );
}
