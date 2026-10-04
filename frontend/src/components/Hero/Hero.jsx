import { useEffect, useState } from "react";
import "./Hero.css";

const slides = [
  {
    category: "Live Auctions",
    titleLine1: "Bid. Win. Own.",
    titleLine2: "Your Next Great Find",
    description: (
      <>
        Discover Unique items, rare collectibles and exclusive deals.
        <br />
        Join Thousands of bidders today!
      </>
    ),
    style: "hero-slide-green",
    frameStyle: "frame-overlap",
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=700&q=85",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=85",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=85",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=700&q=85",
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=700&q=85",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=85",
    ],
  },

  {
    category: "Electronics",
    titleLine1: "Technology That Excites You",
    titleLine2: "Find it. Bid for it. Make it yours.",
    description: (
      <>
        Discover laptops, smartphones, cameras and more.
        <br />
        Find the latest technology at auction.
      </>
    ),
    style: "hero-slide-blue",
    frameStyle: "frame-circle",
    images: [
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=700&q=85",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=700&q=85",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=85",
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=700&q=85",
      "https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=700&q=85",
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=700&q=85",
    ],
  },

  {
    category: "Vehicles",
    titleLine1: "Drive Your Dream",
    titleLine2: "Bid today. Drive Away.",
    description: (
      <>
        Cars, bikes and more at unbeatable prices.
        <br />
        Place your bid and make it yours!
      </>
    ),
    style: "hero-slide-orange",
    frameStyle: "frame-angled",
    images: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=700&q=85",
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=700&q=85",
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=700&q=85",
      "https://images.unsplash.com/photo-1504215680853-026ed2a45def?auto=format&fit=crop&w=700&q=85",
      "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=700&q=85",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=700&q=85",
    ],
  },

  {
    category: "Art & Collectibles",
    titleLine1: "Own a Piece of History",
    titleLine2: "Discover. Bid. Preserve.",
    description: (
      <>
        Art, antiques and rare collectibles up for auction.
        <br />
        Bid on something truly special!
      </>
    ),
    style: "hero-slide-purple",
    frameStyle: "frame-arch",
    images: [
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=700&q=85",
      "https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=700&q=85",
      "https://images.unsplash.com/photo-1577083552431-6e5fd01988e5?auto=format&fit=crop&w=700&q=85",
      "https://images.unsplash.com/photo-1577083288073-40892c0860a4?auto=format&fit=crop&w=700&q=85",
      "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=700&q=85",
      "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=700&q=85",
    ],
  },

  {
    category: "Fashion & Lifestyle",
    titleLine1: "Style For Less",
    titleLine2: "Your style, your bid.",
    description: (
      <>
        Branded fashion, accessories and lifestyle products.
        <br />
        Bid, win and upgrade your style!
      </>
    ),
    style: "hero-slide-red",
    frameStyle: "frame-polaroid",
    images: [
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=700&q=85",
      "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=700&q=85",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=700&q=85",
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=700&q=85",
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=700&q=85",
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=700&q=85",
    ],
  },
];

function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slide = slides[currentSlide];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <section className={`hero ${slide.style}`}>
      <div className="hero-copy">
        <div className="hero-category">
          <span className="category-line"></span>
          <span>{slide.category}</span>
        </div>

        <h1>
          <span>{slide.titleLine1}</span>
          <br />
          {slide.titleLine2}
        </h1>

        <p>{slide.description}</p>
      </div>

      <div className={`hero-art ${slide.frameStyle}`}>
        {slide.images.map((image, index) => (
          <div className={`hero-frame frame-${index + 1}`} key={index}>
            <img src={image} alt={`${slide.category} item ${index + 1}`} />
          </div>
        ))}
      </div>

      <div className="hero-controls">
        <div className="hero-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`hero-dot ${currentSlide === index ? "active" : ""}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Hero;
