import { AlertTriangle, Clock, CreditCard, Gavel, Users } from "lucide-react";
import "./RecentActivities.css";

const activities = [
  {
    id: 1,
    type: "user",
    title: "New user registered",
    description: "rahul@example.com",
    time: "5 minutes ago",
    icon: Users,
  },
  {
    id: 2,
    type: "verification",
    title: "Product submitted for verification",
    description: "iPhone 15 Pro - by TechStore",
    time: "18 minutes ago",
    icon: Clock,
  },
  {
    id: 3,
    type: "auction",
    title: "Auction created",
    description: "Modern 3BHK Villa",
    time: "1 hour ago",
    icon: Gavel,
  },
  {
    id: 4,
    type: "payment",
    title: "Payment received",
    description: "₹2,45,000 - Order #ORD00123",
    time: "2 hours ago",
    icon: CreditCard,
  },
  {
    id: 5,
    type: "dispute",
    title: "Dispute raised",
    description: "Order #ORD00120",
    time: "3 hours ago",
    icon: AlertTriangle,
  },
];

export default function RecentActivities() {
  return (
    <section className="admin-content-card">
      <div className="admin-section-header">
        <h2>Recent Activities</h2>
        <button type="button" className="admin-view-all">
          View All →
        </button>
      </div>

      <div className="recent-activities-list">
        {activities.map((activity) => {
          const Icon = activity.icon;

          return (
            <div className="recent-activity-item" key={activity.id}>
              <div className={`recent-activity-icon ${activity.type}`}>
                <Icon size={19} />
              </div>

              <div className="recent-activity-content">
                <strong>{activity.title}</strong>
                <span>{activity.description}</span>
              </div>

              <time>{activity.time}</time>
            </div>
          );
        })}
      </div>
    </section>
  );
}
