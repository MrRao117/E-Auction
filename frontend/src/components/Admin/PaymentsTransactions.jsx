import {
  ArrowDownToLine,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  Database,
  Eye,
  IndianRupee,
  MoreHorizontal,
  RefreshCw,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import "./PaymentsTransactions.css";

const transactions = [
  {
    id: "TXN001248",
    orderId: "ORD001248",
    name: "Rahul Kumar",
    email: "rahul@gmail.com",
    initial: "R",
    amount: 85000,
    method: "Razorpay (UPI)",
    methodShort: "Razorpay",
    status: "Success",
    date: "10 Sep, 2026",
    time: "10:32 AM",
    fee: 1700,
    settlement: "SET987654321",
    color: "blue",
  },
  {
    id: "TXN001247",
    orderId: "ORD001247",
    name: "Priya Sharma",
    email: "priya@gmail.com",
    initial: "P",
    amount: 125000,
    method: "UPI",
    methodShort: "UPI",
    status: "Success",
    date: "9 Sep, 2026",
    time: "2:18 PM",
    fee: 2500,
    settlement: "SET987654322",
    color: "pink",
  },
  {
    id: "TXN001246",
    orderId: "ORD001246",
    name: "Amit Patel",
    email: "amit@gmail.com",
    initial: "A",
    amount: 78500,
    method: "Credit Card",
    methodShort: "Credit Card",
    status: "Pending",
    date: "8 Sep, 2026",
    time: "11:05 AM",
    fee: 1570,
    settlement: "Pending",
    color: "blue",
  },
  {
    id: "TXN001245",
    orderId: "ORD001245",
    name: "Sneha Das",
    email: "sneha@gmail.com",
    initial: "S",
    amount: 62000,
    method: "Net Banking",
    methodShort: "Net Banking",
    status: "Success",
    date: "7 Sep, 2026",
    time: "5:25 PM",
    fee: 1240,
    settlement: "SET987654323",
    color: "green",
  },
  {
    id: "TXN001244",
    orderId: "ORD001244",
    name: "Arjun Singh",
    email: "arjun@gmail.com",
    initial: "A",
    amount: 187500,
    method: "Wallet",
    methodShort: "Wallet",
    status: "Failed",
    date: "6 Sep, 2026",
    time: "9:15 AM",
    fee: 0,
    settlement: "Not available",
    color: "blue",
  },
  {
    id: "TXN001243",
    orderId: "ORD001243",
    name: "Neha Verma",
    email: "neha@gmail.com",
    initial: "N",
    amount: 92000,
    method: "Razorpay (UPI)",
    methodShort: "Razorpay",
    status: "Refunded",
    date: "5 Sep, 2026",
    time: "1:48 PM",
    fee: 1840,
    settlement: "SET987654324",
    color: "purple",
  },
  {
    id: "TXN001242",
    orderId: "ORD001242",
    name: "Rohan Mehta",
    email: "rohan@gmail.com",
    initial: "R",
    amount: 34500,
    method: "UPI",
    methodShort: "UPI",
    status: "Success",
    date: "4 Sep, 2026",
    time: "3:35 PM",
    fee: 690,
    settlement: "SET987654325",
    color: "purple",
  },
  {
    id: "TXN001241",
    orderId: "ORD001241",
    name: "Ananya Roy",
    email: "ananya@gmail.com",
    initial: "A",
    amount: 55000,
    method: "Credit Card",
    methodShort: "Credit Card",
    status: "Success",
    date: "3 Sep, 2026",
    time: "12:28 PM",
    fee: 1100,
    settlement: "SET987654326",
    color: "blue",
  },
];

const tabs = [
  { label: "All Transactions", value: "All" },
  { label: "Successful", value: "Success" },
  { label: "Pending", value: "Pending" },
  { label: "Failed", value: "Failed" },
  { label: "Refunded", value: "Refunded" },
];

const formatCurrency = (amount) => `₹${Number(amount).toLocaleString("en-IN")}`;

function StatusBadge({ status }) {
  return (
    <span className={`transaction-status ${status.toLowerCase()}`}>
      <span className="status-dot" />
      {status}
    </span>
  );
}

function SummaryCard({ icon: Icon, label, value, change, color, negative }) {
  return (
    <article className={`payment-stat-card ${color}`}>
      <div className="payment-stat-icon">
        <Icon size={27} strokeWidth={2.2} />
      </div>

      <div className="payment-stat-info">
        <span className="payment-stat-label">{label}</span>

        <div className="payment-stat-value-row">
          <strong>{value}</strong>
          <span className={`payment-stat-change ${negative ? "negative" : ""}`}>
            {negative ? "↑" : "↑"} {change}
            <small>vs last month</small>
          </span>
        </div>
      </div>
    </article>
  );
}

export default function PaymentsTransactions() {
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(
    transactions[0],
  );
  const [currentPage, setCurrentPage] = useState(1);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const query = search.toLowerCase();

      const matchesSearch =
        transaction.id.toLowerCase().includes(query) ||
        transaction.orderId.toLowerCase().includes(query) ||
        transaction.name.toLowerCase().includes(query) ||
        transaction.email.toLowerCase().includes(query);

      const matchesTab =
        activeTab === "All" || transaction.status === activeTab;

      const matchesStatus =
        statusFilter === "All" || transaction.status === statusFilter;

      const matchesMethod =
        methodFilter === "All" || transaction.method === methodFilter;

      const matchesDate = !dateFilter || transaction.date.includes(dateFilter);

      return (
        matchesSearch &&
        matchesTab &&
        matchesStatus &&
        matchesMethod &&
        matchesDate
      );
    });
  }, [search, activeTab, statusFilter, methodFilter, dateFilter]);

  const resetFilters = () => {
    setSearch("");
    setActiveTab("All");
    setMethodFilter("All");
    setStatusFilter("All");
    setDateFilter("");
    setCurrentPage(1);
  };

  const exportTransactions = () => {
    const headers = [
      "Transaction ID",
      "Order ID",
      "User",
      "Email",
      "Amount",
      "Payment Method",
      "Status",
      "Date",
      "Time",
    ];

    const rows = filteredTransactions.map((transaction) => [
      transaction.id,
      transaction.orderId,
      transaction.name,
      transaction.email,
      transaction.amount,
      transaction.method,
      transaction.status,
      transaction.date,
      transaction.time,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${value}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "payments-transactions.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const tabCount = (status) => {
    if (status === "All") return "1,248";

    const counts = {
      Success: "982",
      Pending: "42",
      Failed: "126",
      Refunded: "98",
    };

    return counts[status] || 0;
  };

  return (
    <div className="payments-page">
      {/* Page Header */}
      <div className="payments-page-header">
        <div>
          <h1>Payments &amp; Transactions</h1>
          <p>
            Track, manage and monitor all payments and financial transactions on
            your platform.
          </p>
        </div>

        <div className="payments-date-display">
          <CalendarDays size={19} />
          <span>Fri, 11 Sep, 2026</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="payments-stats-grid">
        <SummaryCard
          icon={Database}
          label="Total Transactions"
          value="1,248"
          change="12%"
          color="green"
        />

        <SummaryCard
          icon={IndianRupee}
          label="Total Payment Volume"
          value="₹28,45,600"
          change="18%"
          color="blue"
        />

        <SummaryCard
          icon={Clock3}
          label="Pending Payments"
          value="42"
          change="25%"
          color="orange"
          negative
        />

        <SummaryCard
          icon={RefreshCw}
          label="Refunded Amount"
          value="₹1,24,500"
          change="8%"
          color="red"
          negative
        />
      </div>

      {/* Transactions Section */}
      <section className="payments-main-card">
        {/* Tabs */}
        <div className="payments-tabs-row">
          <div className="payments-tabs">
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab.value}
                className={`payments-tab ${
                  activeTab === tab.value ? "active" : ""
                }`}
                onClick={() => {
                  setActiveTab(tab.value);
                  setCurrentPage(1);
                }}
              >
                {tab.label} ({tabCount(tab.value)})
              </button>
            ))}
          </div>

          <button
            type="button"
            className="payments-export-btn"
            onClick={exportTransactions}
          >
            <ArrowDownToLine size={18} />
            Export Transactions
          </button>
        </div>

        {/* Filters */}
        <div className="payments-filter-row">
          <div className="payments-search-box">
            <Search size={19} />
            <input
              type="text"
              placeholder="Search by transaction ID, order ID, user name, or email..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="payments-select-wrap">
            <select
              value={methodFilter}
              onChange={(event) => setMethodFilter(event.target.value)}
              aria-label="Filter by payment method"
            >
              <option value="All">All Payment Methods</option>
              <option value="Razorpay (UPI)">Razorpay (UPI)</option>
              <option value="UPI">UPI</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Net Banking">Net Banking</option>
              <option value="Wallet">Wallet</option>
            </select>
            <ChevronDown size={15} />
          </div>

          <div className="payments-select-wrap status-select-wrap">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by status"
            >
              <option value="All">All Status</option>
              <option value="Success">Success</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>
            <ChevronDown size={15} />
          </div>

          <div className="payments-date-filter">
            <CalendarDays size={18} />
            <input
              type="text"
              placeholder="Select Date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              aria-label="Filter by date"
            />
          </div>

          <button
            type="button"
            className="payments-reset-btn"
            onClick={resetFilters}
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>

        {/* Table and Details */}
        <div className="payments-content-layout">
          <div className="payments-table-area">
            <div className="payments-table-scroll">
              <table className="payments-table">
                <thead>
                  <tr>
                    <th className="payment-check-col">
                      <input
                        type="checkbox"
                        aria-label="Select all transactions"
                      />
                    </th>
                    <th>Transaction ID</th>
                    <th>Order ID</th>
                    <th>User</th>
                    <th>Amount</th>
                    <th>Payment Method</th>
                    <th>Status</th>
                    <th>Date &amp; Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className={
                        selectedTransaction?.id === transaction.id
                          ? "selected-row"
                          : ""
                      }
                    >
                      <td className="payment-check-col">
                        <input
                          type="checkbox"
                          aria-label={`Select ${transaction.id}`}
                        />
                      </td>

                      <td>
                        <span className="payment-id">{transaction.id}</span>
                      </td>

                      <td>
                        <span className="payment-id">
                          {transaction.orderId}
                        </span>
                      </td>

                      <td>
                        <div className="payment-user-cell">
                          <div
                            className={`payment-user-avatar ${transaction.color}`}
                          >
                            {transaction.initial}
                          </div>
                          <div className="payment-user-info">
                            <strong>{transaction.name}</strong>
                            <span>{transaction.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="payment-amount">
                        {formatCurrency(transaction.amount)}
                      </td>

                      <td>
                        <span className="payment-method">
                          <span className="payment-method-icon">
                            <CreditCard size={16} />
                          </span>
                          {transaction.methodShort}
                        </span>
                      </td>

                      <td>
                        <StatusBadge status={transaction.status} />
                      </td>

                      <td className="payment-date-cell">
                        <span>{transaction.date}</span>
                        <small>{transaction.time}</small>
                      </td>

                      <td>
                        <div className="payment-row-actions">
                          <button
                            type="button"
                            title="View details"
                            aria-label={`View ${transaction.id}`}
                            onClick={() => setSelectedTransaction(transaction)}
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            type="button"
                            title="More actions"
                            aria-label={`More actions for ${transaction.id}`}
                          >
                            <MoreHorizontal size={19} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan="9" className="payments-empty-state">
                        No transactions found. Try changing your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="payments-pagination">
              <span>
                Showing {filteredTransactions.length ? 1 : 0}–
                {filteredTransactions.length} of{" "}
                {activeTab === "All" ? "1,248" : tabCount(activeTab)}{" "}
                transactions
              </span>

              <div className="payments-pagination-controls">
                <button
                  type="button"
                  aria-label="Previous page"
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={17} />
                </button>

                {[1, 2, 3, 4, 5].map((page) => (
                  <button
                    type="button"
                    key={page}
                    className={currentPage === page ? "active" : ""}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}

                <span>...</span>

                <button
                  type="button"
                  onClick={() => setCurrentPage(156)}
                  className={currentPage === 156 ? "active" : ""}
                >
                  156
                </button>

                <button
                  type="button"
                  aria-label="Next page"
                  onClick={() => setCurrentPage((page) => page + 1)}
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          {selectedTransaction && (
            <aside className="transaction-details-panel">
              <div className="transaction-details-header">
                <h2>Transaction Details</h2>
                <button
                  type="button"
                  aria-label="Close transaction details"
                  onClick={() => setSelectedTransaction(null)}
                >
                  <X size={19} />
                </button>
              </div>

              <div className="transaction-result">
                <div
                  className={`transaction-result-icon ${selectedTransaction.status.toLowerCase()}`}
                >
                  {selectedTransaction.status === "Success" ? (
                    <Check size={21} />
                  ) : selectedTransaction.status === "Pending" ? (
                    <Clock3 size={21} />
                  ) : (
                    <AlertTriangle size={21} />
                  )}
                </div>

                <div>
                  <strong>
                    {selectedTransaction.status === "Success"
                      ? "Payment Successful"
                      : `Payment ${selectedTransaction.status}`}
                  </strong>
                  <span>
                    {selectedTransaction.status === "Success"
                      ? "Transaction completed successfully"
                      : `Transaction status: ${selectedTransaction.status}`}
                  </span>
                </div>
              </div>

              <div className="transaction-details-list">
                <div>
                  <span>Transaction ID</span>
                  <strong>{selectedTransaction.id}</strong>
                </div>

                <div>
                  <span>Order ID</span>
                  <strong>{selectedTransaction.orderId}</strong>
                </div>

                <div>
                  <span>User</span>
                  <strong>
                    {selectedTransaction.name}
                    <small>{selectedTransaction.email}</small>
                  </strong>
                </div>

                <div>
                  <span>Amount</span>
                  <strong>{formatCurrency(selectedTransaction.amount)}</strong>
                </div>

                <div>
                  <span>Payment Method</span>
                  <strong>{selectedTransaction.method}</strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>
                    <StatusBadge status={selectedTransaction.status} />
                  </strong>
                </div>

                <div>
                  <span>Transaction Date</span>
                  <strong>
                    {selectedTransaction.date} {selectedTransaction.time}
                  </strong>
                </div>

                <div>
                  <span>Transaction Fee</span>
                  <strong>{formatCurrency(selectedTransaction.fee)}</strong>
                </div>

                <div>
                  <span>Settlement ID</span>
                  <strong>{selectedTransaction.settlement}</strong>
                </div>
              </div>

              <button
                type="button"
                className="transaction-download-btn"
                onClick={() => {
                  const receipt = [
                    "eAuction Payment Receipt",
                    `Transaction ID: ${selectedTransaction.id}`,
                    `Order ID: ${selectedTransaction.orderId}`,
                    `User: ${selectedTransaction.name}`,
                    `Amount: ${formatCurrency(selectedTransaction.amount)}`,
                    `Payment Method: ${selectedTransaction.method}`,
                    `Status: ${selectedTransaction.status}`,
                    `Date: ${selectedTransaction.date} ${selectedTransaction.time}`,
                  ].join("\n");

                  const blob = new Blob([receipt], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");

                  link.href = url;
                  link.download = `${selectedTransaction.id}-receipt.txt`;
                  link.click();

                  URL.revokeObjectURL(url);
                }}
              >
                <ArrowDownToLine size={18} />
                Download Receipt
              </button>
            </aside>
          )}
        </div>
      </section>
    </div>
  );
}
