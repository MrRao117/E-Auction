import Icon from "../Icon/Icon";

export default function CurrentlyRunningAuctions() {
  return (
    <div className="seller-auction-section">
      <div className="seller-section-heading">
        <div>
          <span className="seller-section-label">LIVE</span>

          <h2>Currently Running Auctions</h2>
        </div>

        <span className="seller-live-indicator">
          <span></span>
          Live Now
        </span>
      </div>

      <div className="seller-running-auctions">
        {/* Auction data will be loaded from backend */}
        <div className="seller-empty-auctions">
          <div className="seller-empty-icon">
            <Icon name="gavel" size={26} />
          </div>

          <h3>No Running Auctions</h3>

          <p>You currently do not have any active auctions.</p>
        </div>
      </div>
    </div>
  );
}
