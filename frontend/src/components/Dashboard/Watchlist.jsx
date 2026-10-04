import AuctionCard from "../AuctionCard/AuctionCard";

import "./Watchlist.css";

const watchlistItems = [
  {
    id: 1,
    title: "Modern 3BHK Villa",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=500&q=80",
    seller: "Premium Estates",
    category: "Real Estate",
    timeLeft: "5h 45m 30s",
    imageCount: 5,
    verified: true,
    price: "₹75,00,000",
    bids: "24 Bids",
  },
  {
    id: 2,
    title: "Canon EOS R5 Camera",
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=500&q=80",
    seller: "Camera World",
    category: "Electronics",
    timeLeft: "2h 35m 45s",
    imageCount: 5,
    verified: true,
    price: "₹1,25,000",
    bids: "18 Bids",
  },
  {
    id: 3,
    title: "Vintage Landscape Painting",
    image:
      "https://images.unsplash.com/photo-1577083552431-6e5fd01988a5?auto=format&fit=crop&w=500&q=80",
    seller: "Art Gallery",
    category: "Art & Collectibles",
    timeLeft: "30m 10s",
    imageCount: 4,
    verified: true,
    price: "₹25,500",
    bids: "12 Bids",
  },
];

function Watchlist({ mode = "full", onProductDetails, onDiscoverMore }) {
  const handleDiscoverMore = () => {
    if (typeof onDiscoverMore === "function") {
      onDiscoverMore();
    }
  };

  /* =================================
     OVERVIEW WATCHLIST
     ================================= */

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

          <button type="button" className="watchlist-overview-view-all">
            View All →
          </button>
        </div>

        <div className="overview-watchlist-list">
          {watchlistItems.map((item) => (
            <div className="overview-watchlist-item" key={item.id}>
              {/* PRODUCT IMAGE */}
              <div className="overview-watchlist-image">
                <img src={item.image} alt={item.title} />
              </div>

              {/* PRODUCT DETAILS */}
              <div className="overview-watchlist-product">
                <h3>{item.title}</h3>

                <span className="overview-watchlist-label">Current Bid</span>

                <strong className="overview-watchlist-price">
                  {item.price}
                </strong>
              </div>

              {/* COUNTDOWN */}
              <div className="overview-watchlist-timer">
                <div className="overview-watchlist-time">{item.timeLeft}</div>

                <div className="overview-watchlist-time-labels">
                  <span>Hrs</span>
                  <span>Mins</span>
                  <span>Sec</span>
                </div>
              </div>

              {/* BIDS */}
              <div className="overview-watchlist-bids">{item.bids}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* =================================
     FULL WATCHLIST BOARD
     ================================= */

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

          <button type="button" className="watchlist-view-all">
            View All →
          </button>
        </div>

        <div className="watchlist-auction-grid">
          {watchlistItems.map((item) => (
            <AuctionCard
              key={item.id}
              image={item.image}
              title={item.title}
              seller={item.seller}
              category={item.category}
              timeLeft={item.timeLeft}
              imageCount={item.imageCount}
              verified={item.verified}
              onProductClick={onProductDetails}
            />
          ))}

          {/* DISCOVER MORE CARD */}
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
