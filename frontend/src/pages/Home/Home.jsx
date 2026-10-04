import Footer from "../../components/FooterBanner/FooterBanner";
import Header from "../../components/Header/Header";
import Hero from "../../components/Hero/Hero";
// import HowItWorks from "../../components/HowItWorks/HowItWorks";
import ExploreAuctions from "../../components/ExploreAuctions/ExploreAuctions";
import TrendingAuctions from "../../components/TrendingAuctions/TrendingAuctions";
import TrustBar from "../../components/TrustBar/TrustBar";

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
        <div className="auction-content">
          <div className="auction-left">
            <TrendingAuctions
              onViewAllAuctions={onViewAllAuctions}
              onProductDetails={onProductDetails}
            />
          </div>
        </div>

        <Hero />

        <div className="auction-content-explore">
          <div className="auction-left-explore">
            <ExploreAuctions
              onViewAllAuctions={onViewAllAuctions}
              onProductDetails={onProductDetails}
            />
          </div>
        </div>

        <TrustBar />

        {/* How It Works section */}
        {/* <section id="how-it-works">
          <HowItWorks />
        </section> */}
      </main>

      <Footer />
    </>
  );
}
