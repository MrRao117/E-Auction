import Icon from "../Icon/Icon";

export default function SellerEndedAuctions() {
  return (
    <div className="seller-ended-auctions-card">
      <div className="seller-section-heading">
        <div>
          <span className="seller-section-label">HISTORY</span>

          <h2>Ended Auctions</h2>
        </div>

        <span className="seller-auction-count">0 Auctions</span>
      </div>

      <div className="seller-ended-auctions-list">
        {/* Ended auction data will be loaded from backend */}
        <div className="seller-empty-auctions">
          <div className="seller-empty-icon">
            <Icon name="checkCircle" size={26} />
          </div>

          <h3>No Ended Auctions</h3>

          <p>Your completed auctions will appear here.</p>
        </div>
      </div>
    </div>
  );
}
