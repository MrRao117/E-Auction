const activities = [
  {
    id: 1,
    icon: "⚒",
    text: "You placed a bid on Rolex Submariner Date",
    time: "5 mins ago",
  },
  {
    id: 2,
    icon: "♡",
    text: "You added Canon EOS R5 Camera to watchlist",
    time: "2 hours ago",
  },
  {
    id: 3,
    icon: "🏆",
    text: "You won the bid for Vintage Landscape Painting",
    time: "1 day ago",
  },
  {
    id: 4,
    icon: "▣",
    text: "Your payment for Canon EOS R5 Camera was successful",
    time: "2 days ago",
  },
  {
    id: 5,
    icon: "✉",
    text: "You received a message from Support Team",
    time: "3 days ago",
  },
];

function RecentActivity() {
  return (
    <div className="dashboard-card" id="activity">
      <div className="card-header">
        <h2>Recent Activity</h2>
      </div>

      <div className="activity-list">
        {activities.map((activity) => (
          <div className="activity-item" key={activity.id}>
            <span className="activity-icon">{activity.icon}</span>

            <p>{activity.text}</p>

            <small>{activity.time}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentActivity;
