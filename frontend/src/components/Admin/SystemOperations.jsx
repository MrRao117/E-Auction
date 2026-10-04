import {
  Activity,
  AlertTriangle,
  Bug,
  ChartNoAxesColumn,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock,
  Cpu,
  Database,
  Download,
  Eye,
  FileText,
  Fingerprint,
  Gauge,
  HardDrive,
  Lock,
  MemoryStick,
  Network,
  Play,
  RefreshCw,
  Search,
  Server,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Terminal,
  Zap,
} from "lucide-react";
import { useState } from "react";
import "./SystemOperations.css";

/* =========================
   NAVIGATION
========================= */

const tabs = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "actuator", label: "Actuator", icon: Server },
  { id: "application", label: "Application", icon: Cpu },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "rate-limit", label: "Rate Limiting", icon: Gauge },
  { id: "database", label: "Database", icon: Database },
  { id: "logs", label: "Logs", icon: FileText },
  { id: "monitoring", label: "Monitoring", icon: ChartNoAxesColumn },
  { id: "configuration", label: "Configuration", icon: Settings },
  { id: "diagnostics", label: "Diagnostics", icon: Stethoscope },
];

/* =========================
   SAMPLE DATA
========================= */

const actuatorEndpoints = [
  [
    "health",
    "/actuator/health",
    "Health status and component checks",
    "Public",
  ],
  ["info", "/actuator/info", "Application information", "Public"],
  ["metrics", "/actuator/metrics", "Application metrics", "Secured"],
  [
    "prometheus",
    "/actuator/prometheus",
    "Prometheus metrics export",
    "Secured",
  ],
  ["env", "/actuator/env", "Environment properties", "Secured"],
  [
    "configprops",
    "/actuator/configprops",
    "Configuration properties",
    "Secured",
  ],
  ["beans", "/actuator/beans", "Spring application beans", "Secured"],
  [
    "conditions",
    "/actuator/conditions",
    "Auto-configuration conditions",
    "Secured",
  ],
  ["mappings", "/actuator/mappings", "Registered request mappings", "Secured"],
  ["loggers", "/actuator/loggers", "Logger configuration", "Secured"],
  ["threaddump", "/actuator/threaddump", "Thread dump information", "Secured"],
  ["heapdump", "/actuator/heapdump", "JVM heap dump", "Restricted"],
  [
    "scheduledtasks",
    "/actuator/scheduledtasks",
    "Scheduled task information",
    "Secured",
  ],
  ["caches", "/actuator/caches", "Cache information", "Secured"],
  [
    "httpexchanges",
    "/actuator/httpexchanges",
    "Recent HTTP exchanges",
    "Secured",
  ],
  ["startup", "/actuator/startup", "Application startup steps", "Secured"],
  [
    "shutdown",
    "/actuator/shutdown",
    "Application shutdown operation",
    "Disabled",
  ],
];

const initialEvents = [
  {
    id: 1,
    level: "INFO",
    source: "Spring Boot",
    message: "Application started successfully",
    time: "2 min ago",
  },
  {
    id: 2,
    level: "WARN",
    source: "HikariCP",
    message: "Database connection pool utilization reached 80%",
    time: "5 min ago",
  },
  {
    id: 3,
    level: "ERROR",
    source: "Payment Service",
    message: "Payment gateway request failed: timeout",
    time: "8 min ago",
  },
  {
    id: 4,
    level: "INFO",
    source: "Spring Security",
    message: "User authentication completed",
    time: "12 min ago",
  },
  {
    id: 5,
    level: "WARN",
    source: "Rate Limiter",
    message: "Rate limit threshold reached for an API client",
    time: "15 min ago",
  },
  {
    id: 6,
    level: "INFO",
    source: "Scheduler",
    message: "Scheduled auction cleanup completed",
    time: "20 min ago",
  },
];

const initialHealth = [
  { name: "Application", status: "UP" },
  { name: "Database", status: "UP" },
  { name: "Disk Space", status: "UP" },
  { name: "SMTP Mail", status: "UP" },
  { name: "External Services", status: "UP" },
  { name: "Redis Cache", status: "UP" },
];

const initialSecurityEvents = [
  { name: "Failed Login Attempts", value: 3, period: "Last hour" },
  { name: "Active Sessions", value: 12, period: "Current" },
  { name: "Blocked IP Addresses", value: 5, period: "Current" },
  { name: "MFA Enabled Accounts", value: 6, period: "Current" },
  { name: "Recent Security Warnings", value: 2, period: "Today" },
  { name: "Password Expiry Warnings", value: 4, period: "Next 7 days" },
];

const initialLogs = [
  {
    name: "Application Logs",
    file: "app.log",
    size: "45 MB",
    category: "Application",
  },
  { name: "Error Logs", file: "error.log", size: "12 MB", category: "Error" },
  {
    name: "Security Logs",
    file: "security.log",
    size: "8 MB",
    category: "Security",
  },
  {
    name: "Database Logs",
    file: "database.log",
    size: "22 MB",
    category: "Database",
  },
  { name: "API Request Logs", file: "api.log", size: "35 MB", category: "API" },
  { name: "Audit Logs", file: "audit.log", size: "18 MB", category: "Audit" },
];

const initialRules = [
  {
    id: 1,
    name: "Authentication APIs",
    endpoint: "/api/v1/auth/**",
    limit: 10,
    window: "minute",
    status: true,
  },
  {
    id: 2,
    name: "Public APIs",
    endpoint: "/api/v1/public/**",
    limit: 100,
    window: "minute",
    status: true,
  },
  {
    id: 3,
    name: "Auction APIs",
    endpoint: "/api/v1/auctions/**",
    limit: 60,
    window: "minute",
    status: true,
  },
  {
    id: 4,
    name: "Payment APIs",
    endpoint: "/api/v1/payments/**",
    limit: 20,
    window: "minute",
    status: true,
  },
  {
    id: 5,
    name: "Admin APIs",
    endpoint: "/api/v1/admin/**",
    limit: 120,
    window: "minute",
    status: true,
  },
];

/* =========================
   REUSABLE COMPONENTS
========================= */

function StatusBadge({ status }) {
  const value = String(status).toUpperCase();

  let className = "ops-status-neutral";

  if (["UP", "ACTIVE", "PASSED", "ENABLED", "CONFIGURED"].includes(value)) {
    className = "ops-status-success";
  } else if (["WARN", "WARNING", "PENDING", "QUEUED"].includes(value)) {
    className = "ops-status-warning";
  } else if (["ERROR", "DOWN", "FAILED", "BLOCKED"].includes(value)) {
    className = "ops-status-danger";
  }

  return (
    <span className={`ops-status-badge ${className}`}>
      <span className="ops-status-dot" />
      {status}
    </span>
  );
}

function MetricCard({ title, value, subtitle, icon: Icon, color = "green" }) {
  return (
    <div className="ops-metric-card">
      <div className={`ops-metric-icon ${color}`}>
        <Icon size={22} />
      </div>

      <div className="ops-metric-details">
        <p>{title}</p>
        <h3>{value}</h3>
        <span>{subtitle}</span>
      </div>
    </div>
  );
}

function Panel({ title, subtitle, icon: Icon, action, children }) {
  return (
    <section className="ops-panel">
      <div className="ops-panel-header">
        <div className="ops-panel-title">
          {Icon && (
            <div className="ops-panel-icon">
              <Icon size={18} />
            </div>
          )}

          <div>
            <h3>{title}</h3>
            {subtitle && <p>{subtitle}</p>}
          </div>
        </div>

        {action}
      </div>

      <div className="ops-panel-body">{children}</div>
    </section>
  );
}

function ProgressBar({ label, value, color = "green" }) {
  return (
    <div className="ops-resource-row">
      <div className="ops-resource-label">
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>

      <div className="ops-progress-track">
        <div
          className={`ops-progress-fill ops-progress-${color}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

function DetailList({ items }) {
  return (
    <div className="ops-detail-list">
      {items.map(([label, value]) => (
        <div className="ops-detail-row" key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

function SearchBox({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="ops-search-box">
      <Search size={17} />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="ops-empty-state">
      <CircleHelp size={28} />
      <p>{message}</p>
    </div>
  );
}

/* =========================
   OVERVIEW
========================= */

function OverviewTab({ onTabChange, events, health }) {
  return (
    <div className="ops-content">
      <div className="ops-metrics-grid">
        <MetricCard
          title="Application Status"
          value="UP"
          subtitle="All systems operational"
          icon={CheckCircle2}
          color="green"
        />
        <MetricCard
          title="Uptime"
          value="5d 14h"
          subtitle="Since last restart"
          icon={Clock}
          color="blue"
        />
        <MetricCard
          title="CPU Usage"
          value="32%"
          subtitle="4 available cores"
          icon={Cpu}
          color="purple"
        />
        <MetricCard
          title="Heap Memory"
          value="68%"
          subtitle="1.4 GB / 2 GB"
          icon={MemoryStick}
          color="orange"
        />
        <MetricCard
          title="Active Threads"
          value="86"
          subtitle="12 active requests"
          icon={Activity}
          color="green"
        />
        <MetricCard
          title="API Error Rate"
          value="1.2%"
          subtitle="Last 5 minutes"
          icon={AlertTriangle}
          color="red"
        />
      </div>

      <div className="ops-overview-grid">
        <Panel
          title="System Resource Usage"
          subtitle="Current resource utilization"
          icon={ChartNoAxesColumn}
        >
          <div className="ops-resource-list">
            <ProgressBar label="CPU Usage" value={32} color="green" />
            <ProgressBar label="Heap Memory" value={68} color="blue" />
            <ProgressBar label="Disk Usage" value={42} color="orange" />
            <ProgressBar label="Database Pool" value={40} color="purple" />
          </div>
        </Panel>

        <Panel
          title="JVM Memory"
          subtitle="Heap memory allocation"
          icon={MemoryStick}
        >
          <div className="ops-memory-summary">
            <div className="ops-memory-circle">
              <strong>68%</strong>
              <span>Used</span>
            </div>

            <div className="ops-memory-legend">
              <p>
                <span>Used</span>
                <strong>1.4 GB</strong>
              </p>
              <p>
                <span>Committed</span>
                <strong>1.6 GB</strong>
              </p>
              <p>
                <span>Maximum</span>
                <strong>2 GB</strong>
              </p>
              <p>
                <span>Non-Heap</span>
                <strong>256 MB</strong>
              </p>
            </div>
          </div>
        </Panel>

        <Panel
          title="Database Connection Pool"
          subtitle="Connection pool status"
          icon={Database}
        >
          <div className="ops-resource-list">
            <ProgressBar label="Active Connections" value={40} color="green" />
            <ProgressBar label="Idle Connections" value={60} color="blue" />
            <ProgressBar label="Pending Connections" value={0} color="orange" />
            <p className="ops-muted-text">Maximum pool size: 20</p>
          </div>
        </Panel>
      </div>

      <div className="ops-three-column">
        <Panel
          title="Recent System Events"
          icon={Activity}
          action={
            <button
              className="ops-text-btn"
              onClick={() => onTabChange("logs")}
            >
              View All →
            </button>
          }
        >
          <div className="ops-event-list">
            {events.slice(0, 5).map((event) => (
              <div className="ops-event-row" key={event.id}>
                <StatusBadge status={event.level} />
                <div className="ops-event-content">
                  <p>{event.message}</p>
                  <span>{event.source}</span>
                </div>
                <time>{event.time}</time>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="Health Indicators"
          icon={CheckCircle2}
          action={
            <button className="ops-icon-btn" title="Refresh health">
              <RefreshCw size={16} />
            </button>
          }
        >
          <div className="ops-health-list">
            {health.map((item) => (
              <div className="ops-health-row" key={item.name}>
                <span>{item.name}</span>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="Security Overview"
          icon={ShieldCheck}
          action={
            <button
              className="ops-text-btn"
              onClick={() => onTabChange("security")}
            >
              View Details →
            </button>
          }
        >
          <DetailList
            items={[
              ["Failed Login Attempts", "3"],
              ["Active Sessions", "12"],
              ["Blocked IP Addresses", "5"],
              ["MFA Enabled Accounts", "6"],
              ["Security Warnings", "2"],
            ]}
          />
        </Panel>
      </div>

      <div className="ops-three-column">
        <Panel
          title="API Rate Limiting"
          icon={Gauge}
          action={
            <button
              className="ops-text-btn"
              onClick={() => onTabChange("rate-limit")}
            >
              View Rules →
            </button>
          }
        >
          <div className="ops-mini-stats">
            <div>
              <span>Total Rules</span>
              <strong>5</strong>
            </div>
            <div>
              <span>Active Rules</span>
              <strong>5</strong>
            </div>
            <div>
              <span>Blocked Requests</span>
              <strong>124</strong>
            </div>
            <div>
              <span>Current RPS</span>
              <strong>35 / 100</strong>
            </div>
          </div>
        </Panel>

        <Panel
          title="Actuator Endpoints"
          icon={Server}
          action={
            <button
              className="ops-text-btn"
              onClick={() => onTabChange("actuator")}
            >
              View All →
            </button>
          }
        >
          <div className="ops-endpoint-list">
            {actuatorEndpoints.slice(0, 5).map(([name, path]) => (
              <div className="ops-endpoint-row" key={name}>
                <code>{path}</code>
                <StatusBadge status="UP" />
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="Log Files Quick Access"
          icon={FileText}
          action={
            <button
              className="ops-text-btn"
              onClick={() => onTabChange("logs")}
            >
              Open Logs →
            </button>
          }
        >
          <div className="ops-log-list">
            {initialLogs.slice(0, 5).map((log) => (
              <div className="ops-log-row" key={log.file}>
                <FileText size={16} />
                <span>{log.name}</span>
                <small>{log.size}</small>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

/* =========================
   ACTUATOR
========================= */

function ActuatorTab() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = actuatorEndpoints.filter(
    ([name, path, description, access]) => {
      const matchesSearch = `${name} ${path} ${description}`
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesFilter = filter === "All" || access === filter;

      return matchesSearch && matchesFilter;
    },
  );

  return (
    <div className="ops-content">
      <Panel
        title="Spring Boot Actuator"
        subtitle="Inspect registered Actuator endpoints and their access configuration."
        icon={Server}
      >
        <div className="ops-info-banner">
          <CircleHelp size={19} />
          <p>
            Actuator endpoints depend on your Spring Boot version, dependencies,
            endpoint exposure settings, and security configuration. The status
            shown here is sample data.
          </p>
        </div>

        <div className="ops-toolbar">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search actuator endpoints..."
          />

          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="All">All Access Levels</option>
            <option value="Public">Public</option>
            <option value="Secured">Secured</option>
            <option value="Restricted">Restricted</option>
            <option value="Disabled">Disabled</option>
          </select>
        </div>

        <div className="ops-table-wrapper">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Endpoint</th>
                <th>Path</th>
                <th>Description</th>
                <th>Access</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map(([name, path, description, access]) => (
                <tr key={name}>
                  <td>
                    <strong>{name}</strong>
                  </td>
                  <td>
                    <code>{path}</code>
                  </td>
                  <td>{description}</td>
                  <td>{access}</td>
                  <td>
                    <StatusBadge
                      status={access === "Disabled" ? "Disabled" : "UP"}
                    />
                  </td>
                  <td>
                    <button
                      className="ops-btn ops-btn-outline"
                      type="button"
                      onClick={() =>
                        alert(
                          `Connect ${path} to your backend to inspect its response.`,
                        )
                      }
                    >
                      <Eye size={14} /> Inspect
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6">
                    <EmptyState message="No matching Actuator endpoints." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

/* =========================
   APPLICATION
========================= */

function ApplicationTab() {
  return (
    <div className="ops-content">
      <div className="ops-two-column">
        <Panel title="Application Information" icon={Server}>
          <DetailList
            items={[
              ["Application Name", "eAuction Backend"],
              ["Framework", "Spring Boot"],
              ["Java Version", "17+"],
              ["Application Port", "8080"],
              ["Active Profile", "development"],
              ["Application Status", "Running"],
              ["Uptime", "5 days, 14 hours"],
              ["Context Path", "/"],
            ]}
          />
        </Panel>

        <Panel title="JVM Information" icon={Cpu}>
          <DetailList
            items={[
              ["Heap Used", "1.4 GB"],
              ["Heap Committed", "1.6 GB"],
              ["Heap Maximum", "2 GB"],
              ["Non-Heap Memory", "256 MB"],
              ["Live Threads", "86"],
              ["Daemon Threads", "32"],
              ["Peak Threads", "110"],
              ["Garbage Collector", "G1 GC"],
            ]}
          />
        </Panel>
      </div>

      <Panel title="Application Runtime Settings" icon={Settings}>
        <div className="ops-config-grid">
          {[
            ["Application Logging", "INFO"],
            ["Root Log Level", "INFO"],
            ["Default Timezone", "Asia/Kolkata"],
            ["Request Timeout", "30 seconds"],
            ["Maximum Threads", "200"],
            ["Graceful Shutdown", "Enabled"],
          ].map(([label, value]) => (
            <div className="ops-config-card" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* =========================
   SECURITY
========================= */

function SecurityTab() {
  return (
    <div className="ops-content">
      <div className="ops-metrics-grid">
        <MetricCard
          title="Failed Login Attempts"
          value="3"
          subtitle="Last hour"
          icon={AlertTriangle}
          color="orange"
        />
        <MetricCard
          title="Active Sessions"
          value="12"
          subtitle="Current sessions"
          icon={Eye}
          color="blue"
        />
        <MetricCard
          title="Blocked IPs"
          value="5"
          subtitle="Currently blocked"
          icon={Lock}
          color="red"
        />
        <MetricCard
          title="MFA Enabled"
          value="6"
          subtitle="Accounts protected"
          icon={Fingerprint}
          color="green"
        />
      </div>

      <Panel
        title="Security Controls"
        subtitle="Authentication and access configuration overview."
        icon={ShieldCheck}
      >
        <div className="ops-config-grid">
          {[
            ["JWT Authentication", "Enabled"],
            ["Password Hashing", "BCrypt"],
            ["CORS Configuration", "Configured"],
            ["CSRF Protection", "Configured"],
            ["Session Management", "Configured"],
            ["Role-Based Access", "Enabled"],
            ["Account Lockout", "Configured"],
            ["Audit Logging", "Enabled"],
          ].map(([label, value]) => (
            <div className="ops-config-card" key={label}>
              <span>{label}</span>
              <StatusBadge status={value} />
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Security Event Summary" icon={ShieldAlert}>
        <div className="ops-table-wrapper">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Count</th>
                <th>Time Period</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {initialSecurityEvents.map((item) => (
                <tr key={item.name}>
                  <td>{item.name}</td>
                  <td>
                    <strong>{item.value}</strong>
                  </td>
                  <td>{item.period}</td>
                  <td>
                    <StatusBadge status="Monitoring" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

/* =========================
   RATE LIMITING
========================= */

function RateLimitTab() {
  const [rules, setRules] = useState(initialRules);
  const [name, setName] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [limit, setLimit] = useState("");
  const [windowType, setWindowType] = useState("minute");

  const addRule = (event) => {
    event.preventDefault();

    if (!name.trim() || !endpoint.trim() || Number(limit) <= 0) {
      alert("Enter a rule name, endpoint, and a positive limit.");
      return;
    }

    setRules((previous) => [
      ...previous,
      {
        id: Date.now(),
        name,
        endpoint,
        limit: Number(limit),
        window: windowType,
        status: true,
      },
    ]);

    setName("");
    setEndpoint("");
    setLimit("");
    setWindowType("minute");
  };

  const toggleRule = (id) => {
    setRules((previous) =>
      previous.map((rule) =>
        rule.id === id ? { ...rule, status: !rule.status } : rule,
      ),
    );
  };

  return (
    <div className="ops-content">
      <div className="ops-metrics-grid">
        <MetricCard
          title="Total Rules"
          value={rules.length}
          subtitle="Configured rules"
          icon={Gauge}
        />
        <MetricCard
          title="Active Rules"
          value={rules.filter((r) => r.status).length}
          subtitle="Currently enabled"
          icon={CheckCircle2}
          color="green"
        />
        <MetricCard
          title="Blocked Requests"
          value="124"
          subtitle="Last 24 hours"
          icon={ShieldCheck}
          color="orange"
        />
        <MetricCard
          title="Current Request Rate"
          value="35 RPS"
          subtitle="Sample metric"
          icon={Activity}
          color="blue"
        />
      </div>

      <Panel
        title="Rate Limit Rules"
        subtitle="Manage API request thresholds."
        icon={Gauge}
      >
        <div className="ops-table-wrapper">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Rule Name</th>
                <th>API Endpoint</th>
                <th>Limit</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.id}>
                  <td>
                    <strong>{rule.name}</strong>
                  </td>
                  <td>
                    <code>{rule.endpoint}</code>
                  </td>
                  <td>
                    {rule.limit} requests / {rule.window}
                  </td>
                  <td>
                    <StatusBadge status={rule.status ? "Active" : "Disabled"} />
                  </td>
                  <td>
                    <button
                      className="ops-btn ops-btn-outline"
                      type="button"
                      onClick={() => toggleRule(rule.id)}
                    >
                      {rule.status ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel
        title="Add Rate Limit Rule"
        subtitle="Add a demo rule to this page."
        icon={Zap}
      >
        <form onSubmit={addRule}>
          <div className="ops-form-grid">
            <div className="ops-form-field">
              <label>Rule Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Search API"
                required
              />
            </div>

            <div className="ops-form-field">
              <label>Endpoint Pattern</label>
              <input
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="/api/v1/search/**"
                required
              />
            </div>

            <div className="ops-form-field">
              <label>Request Limit</label>
              <input
                type="number"
                min="1"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder="50"
                required
              />
            </div>

            <div className="ops-form-field">
              <label>Time Window</label>
              <select
                value={windowType}
                onChange={(e) => setWindowType(e.target.value)}
              >
                <option value="second">Per Second</option>
                <option value="minute">Per Minute</option>
                <option value="hour">Per Hour</option>
                <option value="day">Per Day</option>
              </select>
            </div>
          </div>

          <button className="ops-btn ops-btn-primary" type="submit">
            <Check size={16} /> Add Rule
          </button>
        </form>
      </Panel>
    </div>
  );
}

/* =========================
   DATABASE
========================= */

function DatabaseTab() {
  return (
    <div className="ops-content">
      <div className="ops-metrics-grid">
        <MetricCard
          title="Database Status"
          value="UP"
          subtitle="Sample health state"
          icon={Database}
          color="green"
        />
        <MetricCard
          title="Active Connections"
          value="8"
          subtitle="Currently in use"
          icon={Network}
          color="blue"
        />
        <MetricCard
          title="Idle Connections"
          value="12"
          subtitle="Available connections"
          icon={CheckCircle2}
          color="green"
        />
        <MetricCard
          title="Pending Connections"
          value="0"
          subtitle="Waiting for a connection"
          icon={Clock}
          color="orange"
        />
      </div>

      <div className="ops-two-column">
        <Panel title="Connection Pool" icon={Database}>
          <DetailList
            items={[
              ["Pool Name", "HikariCP"],
              ["Maximum Pool Size", "20"],
              ["Minimum Idle", "5"],
              ["Connection Timeout", "30,000 ms"],
              ["Idle Timeout", "600,000 ms"],
              ["Max Lifetime", "1,800,000 ms"],
            ]}
          />
        </Panel>

        <Panel title="Database Health" icon={CheckCircle2}>
          <div className="ops-health-list">
            {[
              ["Database Connectivity", "UP"],
              ["Connection Pool", "UP"],
              ["Disk Space", "UP"],
              ["Query Service", "UP"],
            ].map(([label, status]) => (
              <div className="ops-health-row" key={label}>
                <span>{label}</span>
                <StatusBadge status={status} />
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Database Diagnostics" icon={Activity}>
        <div className="ops-info-banner">
          <CircleHelp size={19} />
          <p>
            Query latency, slow-query details, database locks, and connection
            metrics must be collected from your database monitoring layer.
          </p>
        </div>
      </Panel>
    </div>
  );
}

/* =========================
   LOGS
========================= */

function LogsTab({ events }) {
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("All");

  const filteredEvents = events.filter((event) => {
    const matchesSearch = `${event.message} ${event.source}`
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesSearch && (level === "All" || event.level === level);
  });

  return (
    <div className="ops-content">
      <Panel
        title="Log Files"
        subtitle="Application, database, API, security, and audit logs."
        icon={FileText}
      >
        <div className="ops-table-wrapper">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Log Category</th>
                <th>File Name</th>
                <th>Size</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {initialLogs.map((log) => (
                <tr key={log.file}>
                  <td>{log.name}</td>
                  <td>
                    <code>{log.file}</code>
                  </td>
                  <td>{log.size}</td>
                  <td>
                    <button
                      className="ops-btn ops-btn-outline"
                      type="button"
                      onClick={() =>
                        alert(
                          `Connect your backend log API to view ${log.file}.`,
                        )
                      }
                    >
                      <Eye size={14} /> View
                    </button>
                    <button
                      className="ops-icon-btn"
                      type="button"
                      title={`Download ${log.file}`}
                      onClick={() =>
                        alert(
                          `Connect your backend log API to download ${log.file}.`,
                        )
                      }
                    >
                      <Download size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel
        title="System Log Events"
        subtitle="Search and filter system events."
        icon={Terminal}
      >
        <div className="ops-toolbar">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search log messages..."
          />

          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="All">All Levels</option>
            <option value="INFO">INFO</option>
            <option value="WARN">WARN</option>
            <option value="ERROR">ERROR</option>
          </select>
        </div>

        <div className="ops-event-list">
          {filteredEvents.length ? (
            filteredEvents.map((event) => (
              <div className="ops-event-row" key={event.id}>
                <StatusBadge status={event.level} />
                <div className="ops-event-content">
                  <p>{event.message}</p>
                  <span>{event.source}</span>
                </div>
                <time>{event.time}</time>
              </div>
            ))
          ) : (
            <EmptyState message="No log events match your search." />
          )}
        </div>
      </Panel>
    </div>
  );
}

/* =========================
   MONITORING
========================= */

function MonitoringTab() {
  return (
    <div className="ops-content">
      <div className="ops-metrics-grid">
        <MetricCard
          title="CPU Usage"
          value="32%"
          subtitle="Current utilization"
          icon={Cpu}
          color="blue"
        />
        <MetricCard
          title="Heap Memory"
          value="68%"
          subtitle="1.4 GB / 2 GB"
          icon={MemoryStick}
          color="orange"
        />
        <MetricCard
          title="Disk Usage"
          value="42%"
          subtitle="Sample utilization"
          icon={HardDrive}
          color="green"
        />
        <MetricCard
          title="API Error Rate"
          value="1.2%"
          subtitle="Last 5 minutes"
          icon={Bug}
          color="red"
        />
      </div>

      <Panel
        title="Resource Monitoring"
        subtitle="Current resource usage overview."
        icon={ChartNoAxesColumn}
      >
        <div className="ops-resource-list">
          <ProgressBar label="CPU Utilization" value={32} color="green" />
          <ProgressBar label="Heap Memory" value={68} color="blue" />
          <ProgressBar label="Disk Usage" value={42} color="orange" />
          <ProgressBar label="Database Connections" value={40} color="purple" />
          <ProgressBar
            label="Thread Pool Utilization"
            value={43}
            color="green"
          />
        </div>
      </Panel>

      <Panel title="Monitoring Integrations" icon={Activity}>
        <div className="ops-config-grid">
          {[
            ["Spring Boot Actuator", "Configured"],
            ["Micrometer Metrics", "Configured"],
            ["Prometheus", "Integration Required"],
            ["Grafana", "Integration Required"],
            ["Distributed Tracing", "Integration Required"],
            ["Alert Notifications", "Integration Required"],
          ].map(([label, value]) => (
            <div className="ops-config-card" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* =========================
   CONFIGURATION
========================= */

function ConfigurationTab() {
  const configs = [
    ["server.port", "8080", "Server"],
    ["spring.application.name", "eauction-backend", "Application"],
    ["spring.datasource.hikari.maximum-pool-size", "20", "Database"],
    ["management.endpoints.web.base-path", "/actuator", "Actuator"],
    ["logging.level.root", "INFO", "Logging"],
    ["server.shutdown", "graceful", "Server"],
  ];

  return (
    <div className="ops-content">
      <Panel
        title="Application Configuration"
        subtitle="Runtime configuration overview."
        icon={Settings}
      >
        <div className="ops-info-banner">
          <Lock size={19} />
          <p>
            Sensitive values such as passwords, JWT secrets, API keys, and
            database credentials must never be exposed in this dashboard.
          </p>
        </div>

        <div className="ops-table-wrapper">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Current Value</th>
                <th>Category</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {configs.map(([property, value, category]) => (
                <tr key={property}>
                  <td>
                    <code>{property}</code>
                  </td>
                  <td>{value}</td>
                  <td>{category}</td>
                  <td>
                    <StatusBadge status="Configured" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

/* =========================
   DIAGNOSTICS
========================= */

function DiagnosticsTab() {
  const [tests, setTests] = useState([
    {
      id: 1,
      name: "Application Health Check",
      description: "Verify application health endpoint.",
      status: "Ready",
    },
    {
      id: 2,
      name: "Database Connectivity Test",
      description: "Check database connection.",
      status: "Ready",
    },
    {
      id: 3,
      name: "API Response Test",
      description: "Check API response behavior.",
      status: "Ready",
    },
    {
      id: 4,
      name: "Rate Limiting Test",
      description: "Validate rate limiting behavior.",
      status: "Ready",
    },
    {
      id: 5,
      name: "Security Configuration Check",
      description: "Review configured security controls.",
      status: "Ready",
    },
  ]);

  const runTest = (id) => {
    setTests((previous) =>
      previous.map((test) =>
        test.id === id ? { ...test, status: "Queued" } : test,
      ),
    );

    alert("Connect this diagnostic test to a backend endpoint to execute it.");
  };

  return (
    <div className="ops-content">
      <Panel
        title="Diagnostic Tests"
        subtitle="Available diagnostic checks for your application."
        icon={Stethoscope}
      >
        <div className="ops-diagnostic-list">
          {tests.map((test) => (
            <div className="ops-diagnostic-row" key={test.id}>
              <div className="ops-diagnostic-icon">
                <Bug size={19} />
              </div>

              <div className="ops-diagnostic-info">
                <h4>{test.name}</h4>
                <p>{test.description}</p>
              </div>

              <StatusBadge status={test.status} />

              <button
                className="ops-btn ops-btn-outline"
                type="button"
                onClick={() => runTest(test.id)}
              >
                <Play size={14} /> Run Test
              </button>
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        title="Error Tracking"
        subtitle="Application exceptions and diagnostic information."
        icon={Bug}
      >
        <div className="ops-info-banner">
          <AlertTriangle size={19} />
          <p>
            Error aggregation, stack traces, error trends, and incident
            notifications can be connected using your application logging and
            monitoring backend.
          </p>
        </div>
      </Panel>
    </div>
  );
}

/* =========================
   MAIN COMPONENT
========================= */

export default function SystemOperations() {
  const [activeTab, setActiveTab] = useState("overview");
  const [events] = useState(initialEvents);
  const [health] = useState(initialHealth);

  const activeItem = tabs.find((tab) => tab.id === activeTab);
  const ActiveIcon = activeItem?.icon || Activity;

  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        return (
          <OverviewTab
            onTabChange={setActiveTab}
            events={events}
            health={health}
          />
        );
      case "actuator":
        return <ActuatorTab />;
      case "application":
        return <ApplicationTab />;
      case "security":
        return <SecurityTab />;
      case "rate-limit":
        return <RateLimitTab />;
      case "database":
        return <DatabaseTab />;
      case "logs":
        return <LogsTab events={events} />;
      case "monitoring":
        return <MonitoringTab />;
      case "configuration":
        return <ConfigurationTab />;
      case "diagnostics":
        return <DiagnosticsTab />;
      default:
        return (
          <OverviewTab
            onTabChange={setActiveTab}
            events={events}
            health={health}
          />
        );
    }
  };

  return (
    <div className="system-operations-page">
      <div className="ops-page-header">
        <div className="ops-page-title">
          <div className="ops-page-title-icon">
            <ActiveIcon size={25} />
          </div>

          <div>
            <div className="ops-breadcrumb">
              <span>Admin</span>
              <ChevronRight size={14} />
              <span>System Operations</span>
            </div>

            <h1>System Operations</h1>

            <p>
              Monitor, configure, and diagnose your Spring Boot application,
              security, performance, and infrastructure.
            </p>
          </div>
        </div>

        <div className="ops-header-actions">
          <div className="ops-app-status">
            <span className="ops-status-dot" />
            <div>
              <small>Application Status</small>
              <strong>UP</strong>
            </div>
          </div>

          <button
            className="ops-btn ops-btn-outline"
            type="button"
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            className="ops-btn ops-btn-primary"
            type="button"
            onClick={() => setActiveTab("actuator")}
          >
            <Server size={16} />
            View Actuator Endpoints
          </button>
        </div>
      </div>

      <div className="ops-tabs-wrapper">
        <div className="ops-tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                className={`ops-tab ${isActive ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={17} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {renderTab()}
    </div>
  );
}
