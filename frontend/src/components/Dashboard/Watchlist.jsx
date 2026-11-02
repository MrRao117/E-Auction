import { useNavigate } from "react-router-dom";
import AuctionCard from "../AuctionCard/AuctionCard";
import "./Watchlist.css";

const watchlistItems = [];

function Watchlist({ mode = "full", onProductDetails, onViewAllAuctions }) {
  const navigate = useNavigate();

  const handleDiscoverMore = () => {
    if (typeof onViewAllAuctions === "function") {
      onViewAllAuctions();
    } else {
      navigate("/auctions");
    }
  };

  // OVERVIEW WATCHLIST
  if (mode === "overview") {
    return (
      <div className="dashboard-card overview-watchlist">
        <div className="card-header">
          <div>
            <h2>Watchlist</h2>
            <p className="watchlist-overview-subtitle">
              Auctions you've saved to keep an eye on.
            </p>
          </div>
        </div>

        <div className="overview-watchlist-list">
          {watchlistItems.map((item) => (
            <div className="overview-watchlist-item" key={item.id}>
              <div className="overview-watchlist-image">
                <img src={item.image} alt={item.title} />
              </div>

              <div className="overview-watchlist-product">
                <h3>{item.title}</h3>
                <span className="overview-watchlist-label">Current Bid</span>
                <strong className="overview-watchlist-price">
                  {item.price}
                </strong>
              </div>

              <div className="overview-watchlist-timer">
                <div className="overview-watchlist-time">{item.timeLeft}</div>
                <div className="overview-watchlist-time-labels">
                  <span>Hrs</span>
                  <span>Mins</span>
                  <span>Sec</span>
                </div>
              </div>

              <div className="overview-watchlist-bids">{item.bids}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // FULL WATCHLIST
  return (
    <div className="watchlist-page">
      <section className="dashboard-card watchlist-section" id="watchlist">
        <div className="card-header">
          <div>
            <h2>Watchlist</h2>
            <p className="watchlist-subtitle">
              Auctions you've saved to keep an eye on.
            </p>
          </div>
        </div>

        <div className="watchlist-auction-grid">
          {watchlistItems.map((item) => (
            <AuctionCard
              key={item.id}
              auctionId={item.auctionId}
              productId={item.productId}
              image={item.image}
              title={item.title}
              seller={item.seller}
              category={item.category}
              startTime={item.startTime}
              endTime={item.endTime}
              timeLeft={item.timeLeft}
              imageCount={item.imageCount}
              verified={item.verified}
              onProductClick={onProductDetails}
            />
          ))}

          <button
            type="button"
            className="discover-more-card"
            onClick={handleDiscoverMore}
          >
            <span className="discover-more-plus">+</span>

            <strong>Discover More</strong>

            <span className="discover-more-text">
              Find and add more auctions to your watchlist.
            </span>
          </button>
        </div>
      </section>
    </div>
  );
}

export default Watchlist;
