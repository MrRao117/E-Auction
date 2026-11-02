import { useState } from "react";
import Icon from "../Icon/Icon";
import "./ManualFAQs.css";

const manualItems = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Set up your seller account and profile.",
    details: [
      "Open your Seller Dashboard.",
      "Review your account information and complete any required verification.",
      "Make sure your contact details are correct before creating an auction.",
    ],
  },
  {
    id: "creating-auction",
    title: "Creating an Auction",
    description: "List your item and set auction details.",
    details: [
      "Select Create New Auction from the sidebar.",
      "Enter the item details, description, category, and images.",
      "Configure the starting price, bidding rules, and auction duration.",
      "Review the information and submit your auction.",
    ],
  },
  {
    id: "managing-auctions",
    title: "Managing Your Auctions",
    description: "Edit, monitor, or end your auctions.",
    details: [
      "Review your auctions from the Seller Dashboard.",
      "Monitor auction status and incoming bids.",
      "Use the available management actions for each auction.",
    ],
  },
  {
    id: "understanding-bids",
    title: "Understanding Bids",
    description: "Learn how bidding works and what to expect.",
    details: [
      "Review the current highest bid and auction status.",
      "Monitor bidding activity while your auction is active.",
      "Check the final auction outcome after bidding ends.",
    ],
  },
  {
    id: "payments",
    title: "Payments & Payouts",
    description: "Learn about payments, fees, and payouts.",
    details: [
      "Review the payment status associated with your auction.",
      "Check transaction information when available.",
      "Contact support if you need assistance with a payment.",
    ],
  },
];

const faqItems = [
  {
    question: "How do I create a new auction?",
    answer:
      'Go to "Create New Auction" from the sidebar, enter your item details, configure the available auction settings, and submit your auction.',
  },
  {
    question: "Can I edit an auction after it is published?",
    answer:
      "Editing depends on the auction status and the options supported by your application. Open your auction and check the available management actions.",
  },
  {
    question: "How do I receive my payment?",
    answer:
      "Check the payment and transaction information available in your seller account. The payout process depends on your application's payment workflow.",
  },
  {
    question: "What fees are charged for selling?",
    answer:
      "Check your application's pricing or transaction details for applicable selling fees. Contact support if the information is unavailable.",
  },
  {
    question: "How can I contact support?",
    answer:
      "Use the Contact and Support option in the seller sidebar to access the support process provided by your application.",
  },
];

export default function ManualFAQs() {
  const [expandedFaq, setExpandedFaq] = useState(0);
  const [selectedGuide, setSelectedGuide] = useState(null);

  const toggleFaq = (index) => {
    setExpandedFaq((current) => (current === index ? -1 : index));
  };

  const toggleGuide = (id) => {
    setSelectedGuide((current) => (current === id ? null : id));
  };

  return (
    <div className="manual-faqs-page">
      {/* PAGE HEADING */}
      <div className="manual-faqs-heading">
        <div className="manual-faqs-heading-text">
          <h1>Manual and FAQs</h1>
          <p>
            A complete guide to using your seller account and answers to common
            questions.
          </p>
        </div>
      </div>

      {/* MAIN CONTENT CARD */}
      <section className="manual-faqs-card">
        <div className="manual-faqs-content">
          {/* USER MANUAL SECTION */}
          <section className="manual-section">
            <div className="manual-section-heading">
              <h2>User Manual</h2>
              <p>
                Step-by-step guides to help you list, manage, and sell your
                items.
              </p>
            </div>

            <div className="manual-guide-list">
              {manualItems.map((item, index) => {
                const isExpanded = selectedGuide === item.id;

                return (
                  <div
                    className={`manual-guide-item ${
                      isExpanded ? "selected" : ""
                    }`}
                    key={item.id}
                  >
                    <button
                      type="button"
                      className="manual-guide-question"
                      onClick={() => toggleGuide(item.id)}
                      aria-expanded={isExpanded}
                    >
                      <span className="manual-item-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="manual-guide-text">
                        <strong>{item.title}</strong>
                        <span>{item.description}</span>
                      </span>

                      <Icon
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={19}
                      />
                    </button>

                    {isExpanded && (
                      <div className="manual-guide-details">
                        <ol>
                          {item.details.map((detail, detailIndex) => (
                            <li key={detailIndex}>{detail}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* FREQUENTLY ASKED QUESTIONS */}
          <section className="manual-faq-preview">
            <div className="manual-section-heading">
              <h2>Frequently Asked Questions</h2>
              <p>Quick answers to the most common questions.</p>
            </div>

            <div className="manual-faq-list">
              {faqItems.map((faq, index) => {
                const isExpanded = expandedFaq === index;

                return (
                  <div
                    className={`manual-faq-item ${
                      isExpanded ? "expanded" : ""
                    }`}
                    key={faq.question}
                  >
                    <button
                      type="button"
                      className="manual-faq-question"
                      onClick={() => toggleFaq(index)}
                      aria-expanded={isExpanded}
                    >
                      <span className="manual-item-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="manual-faq-question-text">
                        {faq.question}
                      </span>

                      <Icon
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={19}
                      />
                    </button>

                    {isExpanded && (
                      <div className="manual-faq-answer">
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
