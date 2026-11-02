import CurrentlyRunningAuctions from "./CurrentlyRunningAuctions";
import SellerAccountDetails from "./SellerAccountDetails";
import SellerAuctionSummary from "./SellerAuctionSummary";

export default function SellerDashboardOverview() {
  return (
    <div className="seller-overview">
      {/* Page Heading */}
      <div className="seller-overview-heading">
        <div>
          <h1>My Seller Dashboard</h1>
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

      {/* All Auctions: All, Scheduled, Live, Ended */}
      <section className="seller-running-section">
        <CurrentlyRunningAuctions />
      </section>
    </div>
  );
}
