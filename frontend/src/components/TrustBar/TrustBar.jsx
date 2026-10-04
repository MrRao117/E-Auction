import "./TrustBar.css";

import easybid from "../../assets/icons/easybid.png";
import secure from "../../assets/icons/secure.png";
import support from "../../assets/icons/support.png";
import Transparent from "../../assets/icons/Transparent.png";
import vS from "../../assets/icons/verifiedSeller.png";

export default function TrustBar() {
  const features = [
    {
      icon: secure,
      title: "Secure & Safe",
      description: "Your security is our priority",
    },
    {
      icon: vS,
      title: "Verified Seller",
      description: "Verified sellers & buyers",
    },
    {
      icon: easybid,
      title: "Easy Bidding",
      description: "Simple Steps to win",
    },
    {
      icon: Transparent,
      title: "Transparent",
      description: "Clear bidding with no hidden fees",
    },
    {
      icon: support,
      title: "24/7 Support",
      description: "We're here to help",
    },
  ];

  return (
    <section className="trust-bar">
      <div className="trust-features page-container">
        {features.map((feature) => (
          <div className="trust-feature" key={feature.title}>
            <div className="trust-feature-icon">
              <img src={feature.icon} alt="" />
            </div>

            <div className="trust-feature-content">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
