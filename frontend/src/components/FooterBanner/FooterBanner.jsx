import "./FooterBanner.css";

export default function FooterBanner() {
  return (
    <footer className="footer-banner">
      <div className="footer-content">
        {/* BRAND */}
        <div className="footer-column footer-brand">
          <div className="footer-brand-name">
            <span>e</span>Auction
          </div>

          <p className="footer-tagline">Bid More, Win More</p>

          <p className="footer-description">
            Discover unique items, rare collectibles and exclusive deals from
            trusted sellers.
          </p>
        </div>

        {/* CONNECT WITH US */}
        <div className="footer-column">
          <h3>Connect With Us</h3>

          <a href="#">Facebook</a>
          <a href="#">Instagram</a>
          <a href="#">LinkedIn</a>
          <a href="#">Twitter</a>
        </div>

        {/* LET US HELP YOU */}
        <div className="footer-column">
          <h3>Let Us Help You</h3>

          <a href="#">Help Center</a>
          <a href="/how-it-works">How It Works</a>
          <a href="/support">FAQ &amp; Support</a>
          <a href="#">Contact Us</a>
        </div>

        {/* FEEDBACK */}
        <div className="footer-column">
          <h3>Feedback</h3>

          <p>Your feedback helps us improve your auction experience.</p>

          <button type="button" className="footer-feedback-btn">
            Give Feedback
          </button>
        </div>

        {/* CONTACT */}
        <div className="footer-column footer-contact">
          <h3>Contact Us</h3>

          <p>
            <strong>Email</strong>
            <br />
            support@eauction.com
          </p>

          <p>
            <strong>Phone</strong>
            <br />
            +91 98765 43210
          </p>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>© 2026 eAuction. All Rights Reserved.</p>

          <p>
            Developed by <strong>Laura pvt. ltd.</strong>
          </p>
        </div>
      </div>
    </footer>
  );
}
