import {
  ArrowUpRight,
  CalendarDays,
  Camera,
  Car,
  Gavel,
  Gem,
  Home,
  Laptop,
  Package,
  Shirt,
  Smartphone,
  Star,
  Users,
  Watch,
} from "lucide-react";

import { useState } from "react";
import "./ReportsAnalytics.css";

const stats = [
  {
    title: "Total Revenue",
    value: "₹28,45,600",
    change: "18%",
    icon: Gavel,
    color: "green",
  },
  {
    title: "Total Auctions",
    value: "124",
    change: "12%",
    icon: Gavel,
    color: "blue",
  },
  {
    title: "Total Users",
    value: "1,328",
    change: "25%",
    icon: Users,
    color: "purple",
  },
  {
    title: "Total Orders",
    value: "538",
    change: "16%",
    icon: Package,
    color: "orange",
  },
];

const tabs = [
  "Overview",
  "Revenue",
  "Auctions",
  "Users",
  "Sellers",
  "Orders",
  "Payments",
];

const revenueValues = [18, 28, 24, 36, 45, 35, 30, 42, 46, 54, 59, 70];

const auctionStats = [
  { label: "Live", value: 36, color: "green" },
  { label: "Upcoming", value: 52, color: "blue" },
  { label: "Ended", value: 36, color: "orange" },
];

const registrationValues = [17, 15, 26, 22, 24, 20, 28, 37, 24, 27, 31];

const topAuctions = [
  {
    name: "Rolex Submariner",
    id: "AUC00121",
    bid: "₹6,20,000",
    bids: 18,
    status: "Live",
    icon: Watch,
  },
  {
    name: "MacBook Pro M3",
    id: "AUC00124",
    bid: "₹85,000",
    bids: 32,
    status: "Live",
    icon: Laptop,
  },
  {
    name: "iPhone 15 Pro",
    id: "AUC00122",
    bid: "₹78,500",
    bids: 45,
    status: "Upcoming",
    icon: Smartphone,
  },
  {
    name: "Gold Necklace Set",
    id: "AUC00118",
    bid: "₹3,45,000",
    bids: 38,
    status: "Ended",
    icon: Gem,
  },
  {
    name: "Canon EOS R6",
    id: "AUC00123",
    bid: "₹1,25,000",
    bids: 28,
    status: "Live",
    icon: Camera,
  },
];

const topSellers = [
  ["TechWorld", "Rahul Sharma", 24, "₹8,45,000", 46, "4.8"],
  ["Camera Hub", "Priya Verma", 18, "₹5,62,000", 32, "4.6"],
  ["Electro Mart", "Amit Patel", 16, "₹4,78,500", 28, "4.5"],
  ["Luxury Time", "Sneha Das", 12, "₹3,62,000", 21, "4.7"],
  ["Auto Mart", "Arjun Singh", 10, "₹2,85,000", 18, "4.4"],
];

const paymentMethods = [
  { name: "Razorpay (UPI)", percent: 42, amount: "₹11,95,000", color: "green" },
  { name: "Credit Card", percent: 28, amount: "₹7,96,800", color: "blue" },
  { name: "Net Banking", percent: 18, amount: "₹5,12,100", color: "purple" },
  { name: "Wallet", percent: 8, amount: "₹2,28,500", color: "orange" },
  { name: "Others", percent: 4, amount: "₹1,13,100", color: "gray" },
];

const orderStats = [
  { name: "Delivered", value: 426, percent: "79%", color: "green" },
  { name: "Processing", value: 68, percent: "13%", color: "blue" },
  { name: "Cancelled", value: 44, percent: "8%", color: "red" },
];

const categories = [
  {
    name: "Electronics",
    percent: 32,
    amount: "₹9,10,000",
    icon: Smartphone,
    color: "blue",
  },
  {
    name: "Fashion & Jewellery",
    percent: 22,
    amount: "₹6,25,000",
    icon: Shirt,
    color: "purple",
  },
  {
    name: "Automobiles",
    percent: 18,
    amount: "₹5,12,000",
    icon: Car,
    color: "orange",
  },
  {
    name: "Home & Furniture",
    percent: 15,
    amount: "₹4,26,000",
    icon: Home,
    color: "green",
  },
  {
    name: "Others",
    percent: 13,
    amount: "₹3,72,600",
    icon: Package,
    color: "gray",
  },
];

function SectionHeader({ title, action = "View All" }) {
  return (
    <div className="ra-section-header">
      <h3>{title}</h3>
      <button type="button" className="ra-view-all">
        {action}
      </button>
    </div>
  );
}

function RevenueTrend() {
  const points = revenueValues
    .map((value, index) => {
      const x = 10 + index * 40;
      const y = 150 - value * 1.8;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <section className="ra-card ra-revenue-chart">
      <div className="ra-card-header">
        <h3>Revenue Trend</h3>
        <select aria-label="Revenue chart metric">
          <option>Revenue</option>
          <option>Orders</option>
          <option>Auctions</option>
        </select>
      </div>

      <div className="ra-line-chart">
        <div className="ra-chart-y-labels">
          {["₹8,00,000", "₹6,00,000", "₹4,00,000", "₹2,00,000", "₹0"].map(
            (label) => (
              <span key={label}>{label}</span>
            ),
          )}
        </div>

        <div className="ra-line-chart-main">
          <div className="ra-line-grid">
            {[0, 1, 2, 3, 4].map((item) => (
              <span key={item} />
            ))}
          </div>

          <svg
            className="ra-line-svg"
            viewBox="0 0 470 160"
            preserveAspectRatio="none"
            role="img"
            aria-label="Revenue trend line chart"
          >
            <defs>
              <linearGradient id="raRevenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity=".25" />
                <stop offset="100%" stopColor="#10b981" stopOpacity=".02" />
              </linearGradient>
            </defs>

            <polygon
              points={`10,160 ${points} 450,160`}
              fill="url(#raRevenueFill)"
            />

            <polyline
              points={points}
              fill="none"
              stroke="#059669"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {revenueValues.map((value, index) => {
              const x = 10 + index * 40;
              const y = 150 - value * 1.8;

              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="3.5"
                  fill="#ffffff"
                  stroke="#059669"
                  strokeWidth="2"
                />
              );
            })}
          </svg>

          <div className="ra-chart-x-labels">
            {["1 Sep", "3 Sep", "5 Sep", "7 Sep", "9 Sep", "11 Sep"].map(
              (label) => (
                <span key={label}>{label}</span>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function AuctionStatistics() {
  return (
    <section className="ra-card ra-auction-statistics">
      <h3>Auction Statistics</h3>

      <div className="ra-auction-stat-content">
        <div className="ra-donut ra-auction-donut">
          <div className="ra-donut-center">
            <strong>124</strong>
            <span>Total Auctions</span>
          </div>
        </div>

        <div className="ra-legend">
          {auctionStats.map((item) => (
            <div className="ra-legend-item" key={item.label}>
              <span className={`ra-legend-dot ${item.color}`} />
              <div>
                <span>{item.label}</span>
                <strong>
                  {item.value} ({Math.round((item.value / 124) * 100)}%)
                </strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function UserRegistration() {
  return (
    <section className="ra-card ra-registration-chart">
      <h3>User Registration</h3>

      <div className="ra-bar-chart">
        <div className="ra-bar-y-labels">
          {[40, 30, 20, 10, 0].map((value) => (
            <span key={value}>{value}</span>
          ))}
        </div>

        <div className="ra-bar-chart-main">
          <div className="ra-bar-grid">
            {[0, 1, 2, 3, 4].map((item) => (
              <span key={item} />
            ))}
          </div>

          <div className="ra-registration-bars">
            {registrationValues.map((value, index) => (
              <div className="ra-registration-column" key={index}>
                <div
                  className="ra-registration-bar"
                  style={{ height: `${(value / 40) * 100}%` }}
                  title={`${value} users`}
                />
              </div>
            ))}
          </div>

          <div className="ra-bar-x-labels">
            {["1 Sep", "3 Sep", "5 Sep", "7 Sep", "9 Sep", "11 Sep"].map(
              (label) => (
                <span key={label}>{label}</span>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function TopPerformingAuctions() {
  return (
    <section className="ra-card ra-table-card">
      <SectionHeader title="Top Performing Auctions" />

      <div className="ra-table-wrapper">
        <table className="ra-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Product</th>
              <th>Auction ID</th>
              <th>Highest Bid</th>
              <th>Total Bids</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {topAuctions.map((auction, index) => {
              const Icon = auction.icon;

              return (
                <tr key={auction.id}>
                  <td>{index + 1}</td>
                  <td>
                    <div className="ra-product-cell">
                      <span className={`ra-product-icon icon-${index}`}>
                        <Icon size={22} />
                      </span>
                      <strong>{auction.name}</strong>
                    </div>
                  </td>
                  <td>{auction.id}</td>
                  <td>{auction.bid}</td>
                  <td>{auction.bids}</td>
                  <td>
                    <span
                      className={`ra-status-badge ${auction.status.toLowerCase()}`}
                    >
                      <i />
                      {auction.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TopSellers() {
  return (
    <section className="ra-card ra-table-card">
      <SectionHeader title="Top Sellers by Revenue" />

      <div className="ra-table-wrapper">
        <table className="ra-table ra-seller-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Seller</th>
              <th>Total Auctions</th>
              <th>Total Revenue</th>
              <th>Orders</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {topSellers.map((seller, index) => (
              <tr key={seller[0]}>
                <td>{index + 1}</td>
                <td>
                  <div className="ra-seller-cell">
                    <span className={`ra-seller-avatar avatar-${index}`}>
                      {seller[0].charAt(0)}
                    </span>
                    <div>
                      <strong>{seller[0]}</strong>
                      <span>{seller[1]}</span>
                    </div>
                  </div>
                </td>
                <td>{seller[2]}</td>
                <td>{seller[3]}</td>
                <td>{seller[4]}</td>
                <td>
                  <span className="ra-rating">
                    <Star size={15} fill="currentColor" />
                    {seller[5]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PaymentBreakdown() {
  return (
    <section className="ra-card ra-payment-card">
      <h3>Payment Method Breakdown</h3>

      <div className="ra-payment-list">
        {paymentMethods.map((item) => (
          <div className="ra-payment-row" key={item.name}>
            <span className={`ra-payment-dot ${item.color}`} />
            <span className="ra-payment-name">{item.name}</span>
            <div className="ra-progress-track">
              <div
                className={`ra-progress-fill ${item.color}`}
                style={{ width: `${item.percent}%` }}
              />
            </div>
            <span className="ra-payment-percent">{item.percent}%</span>
            <span className="ra-payment-amount">{item.amount}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function OrderDistribution() {
  return (
    <section className="ra-card ra-order-card">
      <h3>Order Status Distribution</h3>

      <div className="ra-order-content">
        <div className="ra-donut ra-order-donut">
          <div className="ra-donut-center">
            <strong>538</strong>
            <span>Total Orders</span>
          </div>
        </div>

        <div className="ra-order-legend">
          {orderStats.map((item) => (
            <div className="ra-order-legend-item" key={item.name}>
              <span className={`ra-legend-dot ${item.color}`} />
              <span>{item.name}</span>
              <strong>{item.value}</strong>
              <span className="ra-order-percent">({item.percent})</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryRevenue() {
  return (
    <section className="ra-card ra-category-card">
      <SectionHeader title="Category-wise Revenue" />

      <div className="ra-category-list">
        {categories.map((item) => {
          const Icon = item.icon;

          return (
            <div className="ra-category-row" key={item.name}>
              <span className={`ra-category-icon ${item.color}`}>
                <Icon size={15} />
              </span>
              <span className="ra-category-name">{item.name}</span>
              <span className="ra-category-percent">{item.percent}%</span>
              <span className="ra-category-amount">{item.amount}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function ReportsAnalytics() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [dateRange, setDateRange] = useState("1 Sep, 2026 - 11 Sep, 2026");

  return (
    <main className="reports-analytics-page">
      <header className="ra-page-header">
        <div>
          <h1>Reports &amp; Analytics</h1>
          <p>
            Get insights into your platform’s performance, users, auctions, and
            revenue.
          </p>
        </div>

        <button type="button" className="ra-date-button">
          <CalendarDays size={19} />
          <span>{dateRange}</span>
        </button>
      </header>

      <section className="ra-stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div className={`ra-stat-card ${stat.color}`} key={stat.title}>
              <div className="ra-stat-icon">
                <Icon size={28} />
              </div>
              <div className="ra-stat-info">
                <span>{stat.title}</span>
                <div className="ra-stat-value-row">
                  <strong>{stat.value}</strong>
                  <span className="ra-stat-change">
                    <ArrowUpRight size={17} />
                    {stat.change}
                  </span>
                </div>
                <small>vs last month</small>
              </div>
            </div>
          );
        })}
      </section>

      <nav className="ra-tabs" aria-label="Report categories">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      <div className="ra-chart-grid">
        <RevenueTrend />
        <AuctionStatistics />
        <UserRegistration />
      </div>

      <div className="ra-tables-grid">
        <TopPerformingAuctions />
        <TopSellers />
      </div>

      <div className="ra-bottom-grid">
        <PaymentBreakdown />
        <OrderDistribution />
        <CategoryRevenue />
      </div>
    </main>
  );
}
