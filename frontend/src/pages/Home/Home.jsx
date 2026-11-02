import ExploreAuctions from "../../components/ExploreAuctions/ExploreAuctions";
import ExploreLiveAuctions from "../../components/ExploreLiveAuctions/ExploreLiveAuctions";
import Footer from "../../components/FooterBanner/FooterBanner";
import Header from "../../components/Header/Header";
import Hero from "../../components/Hero/Hero";
import TrendingAuctions from "../../components/TrendingAuctions/TrendingAuctions";

import "./Home.css";

export default function Home({
  onLogin,
  onLogout,
  isLoggedIn,
  isAdmin,
  user,
  onDashboard,
  onAdminDashboard,
  onViewAllAuctions,
  onProductDetails,
  onHome,
  onHowItWorks,
  activeLink,
  onActiveLinkChange,
}) {
  return (
    <>
      <Header
        onLogin={onLogin}
        onLogout={onLogout}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        user={user}
        onDashboard={onDashboard}
        onAdminDashboard={onAdminDashboard}
        onHome={onHome}
        onViewAllAuctions={onViewAllAuctions}
        onHowItWorks={onHowItWorks}
        activeLink={activeLink}
        onActiveLinkChange={onActiveLinkChange}
      />

      <main>
        {/* Trending Auctions / Auction For You */}
        <div className="auction-content">
          <div className="auction-left">
            <TrendingAuctions
              onViewAllAuctions={onViewAllAuctions}
              onProductDetails={onProductDetails}
            />
          </div>
        </div>

        {/* Hero and existing advertisement section */}
        <Hero />

        {/* Explore Live Auctions — immediately after Hero */}
        <div className="auction-content-explore home-explore-more">
          <div className="auction-left-explore">
            <ExploreLiveAuctions
              onViewAllAuctions={onViewAllAuctions}
              onProductDetails={onProductDetails}
            />
          </div>
        </div>

        {/* Explore More */}
        <div className="auction-content-explore home-explore-more">
          <div className="auction-left-explore">
            <ExploreAuctions
              onViewAllAuctions={onViewAllAuctions}
              onProductDetails={onProductDetails}
            />
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
