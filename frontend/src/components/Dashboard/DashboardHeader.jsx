function DashboardHeader() {
  return (
    <header className="dashboard-header">
      <div className="welcome">
        <span>Welcome back,</span>
        <h1>Basudev!</h1>
      </div>

      <div className="header-actions">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search for items, collections or auctions..."
          />
          <span>⌕</span>
        </div>

        <button className="cart-icon" aria-label="Cart">
          🛒
          <span>2</span>
        </button>

        <div className="profile">
          <div className="profile-avatar">B</div>
          <strong>Basudev</strong>
          <span>⌄</span>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
