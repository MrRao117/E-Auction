import { useState } from "react";

import "./PaymentMethods.css";

function PaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: "upi",
      name: "UPI",
      details: "john@okaxis",
      provider: "Razorpay",
      paymentType: "UPI Payment",
      isDefault: true,
    },
    {
      id: 2,
      type: "visa",
      name: "Visa",
      details: "•••• •••• •••• 4242",
      expiry: "Expires 12/28",
      provider: "Razorpay",
      paymentType: "Card Payment",
      isDefault: false,
    },
    {
      id: 3,
      type: "mastercard",
      name: "Mastercard",
      details: "•••• •••• •••• 5678",
      expiry: "Expires 08/27",
      provider: "Razorpay",
      paymentType: "Card Payment",
      isDefault: false,
    },
    {
      id: 4,
      type: "bank",
      name: "Net Banking",
      details: "HDFC Bank",
      provider: "Razorpay",
      paymentType: "Net Banking",
      isDefault: false,
    },
  ]);

  const [showAddOptions, setShowAddOptions] = useState(false);

  const handleSetDefault = (id) => {
    setPaymentMethods((currentMethods) =>
      currentMethods.map((method) => ({
        ...method,
        isDefault: method.id === id,
      })),
    );
  };

  const handleRemove = (id) => {
    setPaymentMethods((currentMethods) =>
      currentMethods.filter((method) => method.id !== id),
    );
  };

  const renderPaymentIcon = (type) => {
    if (type === "upi") {
      return (
        <div className="payment-method-icon upi-icon">
          <span>UPI</span>
        </div>
      );
    }

    if (type === "visa") {
      return (
        <div className="payment-method-icon visa-icon">
          <span>VISA</span>
        </div>
      );
    }

    if (type === "mastercard") {
      return (
        <div className="payment-method-icon mastercard-icon">
          <span className="mastercard-circle mastercard-red"></span>
          <span className="mastercard-circle mastercard-yellow"></span>
        </div>
      );
    }

    if (type === "bank") {
      return (
        <div className="payment-method-icon bank-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 9h18" />
            <path d="M5 9v9" />
            <path d="M9 9v9" />
            <path d="M15 9v9" />
            <path d="M19 9v9" />
            <path d="M2 18h20" />
            <path d="M12 3l10 5H2l10-5Z" />
          </svg>
        </div>
      );
    }

    return (
      <div className="payment-method-icon">
        <span>₹</span>
      </div>
    );
  };

  return (
    <div className="payment-methods-page">
      {/* PAGE HEADER */}

      <div className="payment-methods-header">
        <div>
          <h1>Payment Methods</h1>
          <p>
            Manage your payment options for a faster and secure checkout
            experience.
          </p>
        </div>

        <button
          type="button"
          className="add-payment-btn"
          onClick={() => setShowAddOptions(!showAddOptions)}
        >
          <span>+</span>
          Add Payment Method
        </button>
      </div>

      {/* RAZORPAY INFORMATION */}

      <div className="razorpay-security-card">
        <div className="razorpay-brand">
          <span className="razorpay-logo">Razorpay</span>
        </div>

        <div className="razorpay-security-content">
          <div className="razorpay-security-title">
            <span className="security-check">✓</span>
            <strong>Secure Payments</strong>
          </div>

          <p>
            Your payments are securely processed through Razorpay. We do not
            store your sensitive payment details.
          </p>
        </div>

        <div className="razorpay-secure-badge">
          <div className="secure-shield">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 3 20 6v5c0 5.2-3.4 8.7-8 10-4.6-1.3-8-4.8-8-10V6l8-3Z" />
              <path d="m8.5 12 2.2 2.2 4.8-5" />
            </svg>
          </div>

          <div>
            <strong>100% Secure</strong>
            <span>PCI-DSS Compliant</span>
          </div>
        </div>
      </div>

      {/* ADD PAYMENT OPTIONS */}

      {showAddOptions && (
        <div className="add-payment-options">
          <div className="add-payment-options-header">
            <div>
              <h2>Add a New Payment Method</h2>
              <p>
                Choose your preferred payment method and continue securely
                through Razorpay.
              </p>
            </div>

            <button
              type="button"
              className="close-payment-options"
              onClick={() => setShowAddOptions(false)}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="payment-option-grid">
            <button type="button" className="payment-option">
              <span className="payment-option-icon">UPI</span>
              <span>UPI</span>
            </button>

            <button type="button" className="payment-option">
              <span className="payment-option-icon">▣</span>
              <span>Cards</span>
            </button>

            <button type="button" className="payment-option">
              <span className="payment-option-icon">⌂</span>
              <span>Net Banking</span>
            </button>

            <button type="button" className="payment-option">
              <span className="payment-option-icon">▢</span>
              <span>Wallets</span>
            </button>
          </div>
        </div>
      )}

      {/* SAVED PAYMENT METHODS */}

      <section className="saved-payment-section">
        <div className="saved-payment-heading">
          <h2>Saved Payment Methods</h2>
        </div>

        <div className="payment-method-list">
          {paymentMethods.map((method) => (
            <div
              className={`payment-method-row ${
                method.isDefault ? "default-payment-method" : ""
              }`}
              key={method.id}
            >
              {/* ICON */}

              <div className="payment-method-left">
                {renderPaymentIcon(method.type)}
              </div>

              {/* DETAILS */}

              <div className="payment-method-details">
                <div className="payment-method-name-row">
                  <h3>{method.name}</h3>

                  {method.isDefault && (
                    <span className="default-payment-badge">Default</span>
                  )}
                </div>

                <p>{method.details}</p>
              </div>

              {/* EXPIRY */}

              <div className="payment-method-extra">
                {method.expiry && <span>{method.expiry}</span>}
              </div>

              {/* RAZORPAY */}

              <div className="payment-method-provider">
                <strong>{method.provider}</strong>
                <span>{method.paymentType}</span>
              </div>

              {/* ACTIONS */}

              <div className="payment-method-actions">
                {method.isDefault ? (
                  <button
                    type="button"
                    className="remove-payment-btn"
                    onClick={() => handleRemove(method.id)}
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    className="set-default-payment-btn"
                    onClick={() => handleSetDefault(method.id)}
                  >
                    Set as Default
                  </button>
                )}

                <button
                  type="button"
                  className="payment-more-btn"
                  aria-label={`More options for ${method.name}`}
                >
                  •••
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ADD NEW PAYMENT METHOD */}

      <div className="new-payment-method-card">
        <div className="new-payment-icon">
          <span>+</span>
        </div>

        <div className="new-payment-content">
          <h3>Add a New Payment Method</h3>
          <p>
            Choose your preferred payment method and add it securely via
            Razorpay.
          </p>
        </div>

        <div className="new-payment-options">
          <button type="button" onClick={() => setShowAddOptions(true)}>
            <span>UPI</span>
            UPI
          </button>

          <button type="button" onClick={() => setShowAddOptions(true)}>
            <span>▣</span>
            Cards
          </button>

          <button type="button" onClick={() => setShowAddOptions(true)}>
            <span>⌂</span>
            Net Banking
          </button>

          <button type="button" onClick={() => setShowAddOptions(true)}>
            <span>▢</span>
            Wallets
          </button>
        </div>
      </div>

      {/* SECURITY NOTICE */}

      <div className="payment-security-notice">
        <div className="payment-lock-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="5" y="10" width="14" height="11" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            <path d="M12 14v3" />
          </svg>
        </div>

        <div>
          <strong>Razorpay Secure Payments</strong>
          <p>
            Your payment information is protected with bank-level security.
            eAuction does not store your card or UPI details.
          </p>
        </div>
      </div>

      {/* FOOTER */}

      <footer className="dashboard-footer">
        <p className="copyright">© 2026 eAuction. All rights reserved.</p>

        <div className="payment-footer-links">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Help</span>
        </div>
      </footer>
    </div>
  );
}

export default PaymentMethods;
