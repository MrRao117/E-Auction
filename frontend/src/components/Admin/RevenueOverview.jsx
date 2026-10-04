import { useState } from "react";
import "./RevenueOverview.css";

const revenueData = {
  year: [5.2, 8.6, 7.5, 11.4, 12.8, 12.5, 10.6, 14.3, 16.2],
  month: [2.2, 3.1, 2.8, 4.5, 5.1, 4.6, 6.2, 5.5, 7.1],
  week: [1.2, 2.1, 1.8, 3.2, 2.7, 4.1, 3.5, 4.7, 5.2],
};

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];

export default function RevenueOverview() {
  const [period, setPeriod] = useState("year");
  const values = revenueData[period];
  const max = Math.max(...values, 20);

  return (
    <section className="admin-chart-card">
      <div className="admin-chart-header">
        <h2>Revenue Overview</h2>

        <select
          className="chart-period-select"
          value={period}
          onChange={(event) => setPeriod(event.target.value)}
          aria-label="Revenue period"
        >
          <option value="year">This Year</option>
          <option value="month">This Month</option>
          <option value="week">This Week</option>
        </select>
      </div>

      <div className="revenue-chart">
        <div className="revenue-y-axis">
          <span>20L</span>
          <span>15L</span>
          <span>10L</span>
          <span>5L</span>
          <span>0</span>
        </div>

        <div className="revenue-bars">
          {values.map((value, index) => (
            <div className="revenue-bar-column" key={index}>
              <div className="revenue-bar-wrapper">
                <div
                  className="revenue-bar"
                  style={{ height: `${(value / max) * 100}%` }}
                  title={`₹${value} lakh`}
                />
              </div>

              <span>{months[index]}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
