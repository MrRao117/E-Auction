import {
  AlertTriangle,
  Check,
  Clock,
  Gavel,
  IndianRupee,
  Radio,
  Store,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

import "./AdminStats.css";

const stats = [
  {
    title: "Total Users",
    value: "1,248",
    change: "12%",
    direction: "up",
    icon: Users,
    color: "blue",
  },
  {
    title: "Total Sellers",
    value: "186",
    change: "8%",
    direction: "up",
    icon: Store,
    color: "green",
  },
  {
    title: "Total Auctions",
    value: "320",
    change: "15%",
    direction: "up",
    icon: Gavel,
    color: "yellow",
  },
  {
    title: "Live Auctions",
    value: "48",
    change: "20%",
    direction: "up",
    icon: Radio,
    color: "red",
  },
  {
    title: "Pending Verifications",
    value: "24",
    change: "10%",
    direction: "down",
    icon: Clock,
    color: "yellow",
  },
  {
    title: "Completed Auctions",
    value: "210",
    change: "18%",
    direction: "up",
    icon: Check,
    color: "mint",
  },
  {
    title: "Total Revenue",
    value: "₹ 12,45,000",
    change: "22%",
    direction: "up",
    icon: IndianRupee,
    color: "green",
  },
  {
    title: "Disputes / Tickets",
    value: "7",
    change: "30%",
    direction: "down",
    icon: AlertTriangle,
    color: "red",
  },
];

export default function AdminStats() {
  return (
    <section className="admin-stats-grid">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const TrendIcon = stat.direction === "up" ? TrendingUp : TrendingDown;

        const isRevenue = stat.title === "Total Revenue";

        return (
          <article
            className={`admin-stat-card ${
              isRevenue ? "revenue-stat-card" : ""
            }`}
            key={stat.title}
          >
            <div className={`admin-stat-icon ${stat.color}`}>
              <Icon size={25} strokeWidth={2.2} />
            </div>

            <div className="admin-stat-content">
              <span className="admin-stat-title">{stat.title}</span>

              <div className="admin-stat-value-row">
                <strong>{stat.value}</strong>

                <div
                  className={`admin-stat-change ${
                    stat.direction === "up" ? "positive" : "negative"
                  }`}
                >
                  <span>
                    <TrendIcon size={15} />
                    {stat.change}
                  </span>

                  <small>vs last month</small>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
