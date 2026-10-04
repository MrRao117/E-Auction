import { useCallback, useEffect, useState } from "react";
import "./MyOrders.css";

import { getMyOrders } from "../../api/order/orderApi";
import { getPaymentByOrderId } from "../../api/payment/paymentApi";

const getValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "---";
  }

  return value;
};

const formatDate = (value) => {
  if (!value) return "---";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "---";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "---";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "---";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    Number.isNaN(Number(value))
  ) {
    return "---";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value));
};

const formatStatus = (status) => {
  if (!status) return "---";

  const statusMap = {
    CREATED: "Order Generated",
    PROCESSING: "Processing",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
  };

  return (
    statusMap[String(status).toUpperCase()] ||
    String(status)
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase())
  );
};

const getStatusClass = (status) => {
  const statusMap = {
    CREATED: "generated",
    PROCESSING: "processing",
    SHIPPED: "shipped",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
  };

  return statusMap[String(status || "").toUpperCase()] || "generated";
};

const normalizeOrder = (order, payment) => {
  const status = String(order?.orderStatus || "").toUpperCase();

  return {
    id: getValue(order?.orderId),
    auctionId: getValue(order?.auctionId),
    date: formatDate(order?.orderDate),
    product: getValue(order?.auctionTitle),
    image: "",
    seller: "---",
    quantity: "---",
    price: formatCurrency(order?.winningAmount),
    status: formatStatus(status),
    statusClass: getStatusClass(status),
    paymentMethod: getValue(payment?.method),
    paymentStatus: formatStatus(payment?.paymentStatus),
    transactionId: getValue(payment?.transactionId),
    paymentDate: formatDateTime(payment?.paymentDate),
    paymentAmount: formatCurrency(payment?.totalAmount),
    shippingName: getValue(order?.winnerName),
    shippingAddress: getValue(order?.shippingAddress),
    shippingCity: "---",
    phone: "---",
    deliveredDate: "---",
    expectedDate: "---",

    timeline: {
      generated: formatDate(order?.orderDate),
      processing: "---",
      shipped: "---",
      delivered: "---",
    },
  };
};

function getTimelineSteps(order) {
  const status = order.status;

  const isGenerated = [
    "Order Generated",
    "Processing",
    "Shipped",
    "Delivered",
  ].includes(status);

  const isProcessing = ["Processing", "Shipped", "Delivered"].includes(status);

  const isShipped = ["Shipped", "Delivered"].includes(status);

  const isDelivered = status === "Delivered";

  return [
    {
      label: "Order Generated",
      date: order.timeline.generated,
      completed: isGenerated,
      current: status === "Order Generated",
    },
    {
      label: "Processing",
      date: order.timeline.processing,
      completed: isProcessing,
      current: status === "Processing",
    },
    {
      label: "Shipped",
      date: order.timeline.shipped,
      completed: isShipped,
      current: status === "Shipped",
    },
    {
      label: "Delivered",
      date: order.timeline.delivered,
      completed: isDelivered,
      current: status === "Delivered",
    },
  ];
}

function StatusTimeline({ order }) {
  const steps = getTimelineSteps(order);

  return (
    <div className="order-timeline">
      <div className="timeline-line">
        {steps.map((step) => (
          <div className="timeline-step" key={step.label}>
            <div
              className={`timeline-circle ${
                step.completed ? "completed" : ""
              } ${step.current ? "current" : ""}`}
            >
              {step.completed && !step.current ? "✓" : ""}
            </div>

            <div className="timeline-label">{step.label}</div>

            {step.date && <div className="timeline-date">{step.date}</div>}
          </div>
        ))}
      </div>

      <div
        className={`order-status-message ${
          order.status === "Delivered"
            ? "success-message"
            : "processing-message"
        }`}
      >
        <span className="status-message-icon">
          {order.status === "Delivered" ? "✓" : "◷"}
        </span>

        <div>
          <strong>
            {order.status === "Delivered"
              ? "Your order has been delivered."
              : order.status === "Shipped"
                ? "Your order has been shipped."
                : order.status === "Processing"
                  ? "Your order is being processed."
                  : order.status === "Cancelled"
                    ? "Your order has been cancelled."
                    : order.status === "Order Generated"
                      ? "Your order has been generated successfully."
                      : "---"}
          </strong>

          <p>
            {order.status === "Delivered"
              ? `Delivered on ${order.deliveredDate}`
              : order.status === "Shipped"
                ? `Expected delivery by ${order.expectedDate}`
                : order.status === "Processing"
                  ? `Expected delivery by ${order.expectedDate}`
                  : order.status === "Order Generated"
                    ? `Expected delivery by ${order.expectedDate}`
                    : "---"}
          </p>
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order }) {
  return (
    <article className="my-order-card">
      <div className="order-card-header">
        <div>
          <span>Order ID:</span> <strong>{order.id}</strong>
        </div>

        <div>
          <span>Placed on:</span> <strong>{order.date}</strong>
        </div>

        <div>
          <span>Total:</span> <strong>{order.price}</strong>
        </div>

        <span className={`order-status ${order.statusClass}`}>
          <span className="status-dot"></span>
          {order.status}
        </span>

        <button type="button" className="invoice-button">
          ▣ View Invoice
        </button>
      </div>

      <div className="order-card-body">
        {/* PRODUCT */}
        <div className="order-product-section">
          <img
            src={order.image}
            alt={order.product}
            className="order-product-image"
          />

          <div className="order-product-details">
            <h3>{order.product}</h3>

            <p>
              <span>Seller:</span> {order.seller}
            </p>

            <p>
              <span>Quantity:</span> {order.quantity}
            </p>

            <strong className="order-product-price">{order.price}</strong>

            <div className="order-product-actions">
              <button type="button" className="outline-order-button">
                View Product
              </button>

              {order.status === "Delivered" ? (
                <button type="button" className="primary-order-button">
                  Contact Seller
                </button>
              ) : (
                <button type="button" className="primary-order-button">
                  Contact Seller
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ORDER TRACKING */}
        <div className="order-tracking-section">
          <StatusTimeline order={order} />
        </div>

        {/* SHIPPING ADDRESS */}
        <div className="order-address-section">
          <h4>
            <span className="address-icon">⌖</span>
            Shipping Address
          </h4>

          <div className="shipping-details">
            <strong>{order.shippingName}</strong>

            <p>{order.shippingAddress}</p>

            <p>{order.shippingCity}</p>

            <p>India</p>

            <p>Phone: {order.phone}</p>
          </div>

          <div className="payment-details">
            <span>Payment:</span>
            <strong>{order.paymentMethod}</strong>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getMyOrders();

      const orderList = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];

      const ordersWithPayments = await Promise.all(
        orderList.map(async (order) => {
          let payment = null;

          try {
            const paymentResponse = await getPaymentByOrderId(order.orderId);

            payment = paymentResponse?.data ?? paymentResponse;
          } catch {
            payment = null;
          }

          return normalizeOrder(order, payment);
        }),
      );

      setOrders(ordersWithPayments);
    } catch (err) {
      setOrders([]);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Unable to load your orders. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (loading) {
    return (
      <section className="my-orders-page">
        <div className="my-orders-header">
          <div>
            <h1>My Orders</h1>
            <p>View and manage your orders from won auctions and purchases.</p>
          </div>
        </div>

        <div className="orders-list">
          <p>Loading your orders...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="my-orders-page">
        <div className="my-orders-header">
          <div>
            <h1>My Orders</h1>
            <p>View and manage your orders from won auctions and purchases.</p>
          </div>
        </div>

        <div className="orders-list">
          <p>{error}</p>

          <button type="button" onClick={fetchOrders}>
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="my-orders-page">
      <div className="my-orders-header">
        <div>
          <h1>My Orders</h1>

          <p>View and manage your orders from won auctions and purchases.</p>
        </div>

        <select className="order-sort" defaultValue="latest">
          <option value="latest">Latest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Amount</option>
          <option value="lowest">Lowest Amount</option>
        </select>
      </div>

      <div className="order-tabs">
        <button className="active" type="button">
          All Orders
        </button>

        <button type="button">Order Generated</button>

        <button type="button">Processing</button>

        <button type="button">Shipped</button>

        <button type="button">Delivered</button>
      </div>

      <div className="orders-list">
        {orders.length === 0 ? (
          <p>No Orders Found!!</p>
        ) : (
          orders.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </div>
    </section>
  );
}
