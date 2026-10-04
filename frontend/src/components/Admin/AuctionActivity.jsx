const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];
import "./AuctionActivity.css";

const liveValues = [8, 12, 18, 18, 17, 21, 32, 31, 41];
const completedValues = [2, 5, 7, 7, 6, 12, 10, 15, 23];

const chartWidth = 500;
const chartHeight = 130;
const left = 30;
const top = 12;
const bottom = 150;

function getCoordinates(values) {
  return values.map((value, index) => ({
    x: left + (index * chartWidth) / (values.length - 1),
    y: top + chartHeight - (value / 50) * chartHeight,
  }));
}

function getPoints(values) {
  return getCoordinates(values)
    .map((point) => `${point.x},${point.y}`)
    .join(" ");
}

export default function AuctionActivity() {
  const livePoints = getCoordinates(liveValues);
  const completedPoints = getCoordinates(completedValues);

  return (
    <section className="admin-chart-card">
      <div className="admin-chart-header">
        <h2>Auction Activity</h2>

        <div className="admin-chart-legend">
          <span>
            <i className="legend-dot live" />
            Live Auctions
          </span>

          <span>
            <i className="legend-dot completed" />
            Completed Auctions
          </span>
        </div>
      </div>

      <div className="auction-chart">
        <svg
          viewBox="0 0 550 190"
          preserveAspectRatio="none"
          role="img"
          aria-label="Monthly live and completed auction activity"
        >
          {[0, 10, 20, 30, 40, 50].map((value) => {
            const y = top + chartHeight - (value / 50) * chartHeight;

            return (
              <g key={value}>
                <line
                  x1={left}
                  y1={y}
                  x2="540"
                  y2={y}
                  className="chart-grid-line"
                />
                <text x="4" y={y + 4} className="chart-axis-label">
                  {value}
                </text>
              </g>
            );
          })}

          {months.map((month, index) => {
            const x = left + (index * chartWidth) / (months.length - 1);

            return (
              <g key={month}>
                <line
                  x1={x}
                  y1={top}
                  x2={x}
                  y2={bottom}
                  className="chart-vertical-line"
                />
                <text
                  x={x}
                  y="174"
                  textAnchor="middle"
                  className="chart-month-label"
                >
                  {month}
                </text>
              </g>
            );
          })}

          <polygon
            points={`30,150 ${getPoints(liveValues)} 530,150`}
            className="live-area"
          />

          <polygon
            points={`30,150 ${getPoints(completedValues)} 530,150`}
            className="completed-area"
          />

          <polyline points={getPoints(liveValues)} className="live-line" />
          <polyline
            points={getPoints(completedValues)}
            className="completed-line"
          />

          {livePoints.map((point, index) => (
            <circle
              key={`live-${index}`}
              cx={point.x}
              cy={point.y}
              r="3.5"
              className="live-point"
            />
          ))}

          {completedPoints.map((point, index) => (
            <circle
              key={`completed-${index}`}
              cx={point.x}
              cy={point.y}
              r="3.5"
              className="completed-point"
            />
          ))}
        </svg>
      </div>
    </section>
  );
}
