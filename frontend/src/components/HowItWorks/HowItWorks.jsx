import hiw1 from "../../assets/icons/hiw1.png";
import hiw2 from "../../assets/icons/hiw2.png";
import hiw3 from "../../assets/icons/hiw3.png";
import hiw4 from "../../assets/icons/hiw4.png";

import "./HowItWorks.css";

export default function HowItWorks() {
  const steps = [
    {
      image: hiw1,
      title: "Create Account",
      description: "Register and verify your account",
    },
    {
      image: hiw2,
      title: "Find an Auction",
      description: "Browse available auctions",
    },
    {
      image: hiw3,
      title: "Place Your Bid",
      description: "Place your bid and compete",
    },
    {
      image: hiw4,
      title: "Win & Pay",
      description: "Win the auction and complete payment",
    },
  ];

  return (
    <section className="how-it-works">
      <div className="how-it-works-heading">
        <h2>How eAuction Works</h2>
        <p>Simple steps to participate in an auction</p>
      </div>

      <div className="how-it-works-list">
        {steps.map((step) => (
          <article className="how-it-works-card" key={step.title}>
            <div className="how-it-works-image">
              <img src={step.image} alt={step.title} />
            </div>

            <div className="how-it-works-content">
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
