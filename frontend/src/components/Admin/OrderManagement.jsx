import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Eye,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import "./OrderManagement.css";

const ordersData = [
  {
    id: "ORD001248",
    product: "MacBook Pro M3",
    category: "Laptops",
    image: "💻",
    buyer: "Rahul Kumar",
    buyerEmail: "rahul@gmail.com",
    seller: "TechWorld",
    sellerEmail: "techworld.store",
    date: "10 Sep, 2026",
    time: "10:30 AM",
    amount: 85000,
    payment: "Paid",
    status: "Delivered",
  },
  {
    id: "ORD001247",
    product: "Canon EOS R6",
    category: "Cameras",
    image: "📷",
    buyer: "Priya Sharma",
    buyerEmail: "priya@gmail.com",
    seller: "Camera Hub",
    sellerEmail: "camerahub.store",
    date: "9 Sep, 2026",
    time: "2:15 PM",
    amount: 125000,
    payment: "Paid",
    status: "Shipped",
  },
  {
    id: "ORD001246",
    product: "iPhone 15 Pro",
    category: "Mobile Phones",
    image: "📱",
    buyer: "Amit Patel",
    buyerEmail: "amit@gmail.com",
    seller: "Electro Mart",
    sellerEmail: "electro.store",
    date: "8 Sep, 2026",
    time: "11:00 AM",
    amount: 78500,
    payment: "Pending",
    status: "Processing",
  },
  {
    id: "ORD001245",
    product: "Rolex Submariner",
    category: "Watches",
    image: "⌚",
    buyer: "Sneha Das",
    buyerEmail: "sneha@gmail.com",
    seller: "Luxury Time",
    sellerEmail: "luxurytime.store",
    date: "7 Sep, 2026",
    time: "5:20 PM",
    amount: 620000,
    payment: "Paid",
    status: "Delivered",
  },
  {
    id: "ORD001244",
    product: "Toyota Fortuner",
    category: "Automobiles",
    image: "🚙",
    buyer: "Arjun Singh",
    buyerEmail: "arjun@gmail.com",
    seller: "Auto Mart",
    sellerEmail: "automart.store",
    date: "6 Sep, 2026",
    time: "9:10 AM",
    amount: 1875000,
    payment: "Paid",
    status: "Delivered",
  },
  {
    id: "ORD001243",
    product: "LG 65” 4K Smart TV",
    category: "Home Appliances",
    image: "📺",
    buyer: "Neha Verma",
    buyerEmail: "neha@gmail.com",
    seller: "Home Decor",
    sellerEmail: "homedecor.store",
    date: "5 Sep, 2026",
    time: "1:45 PM",
    amount: 92000,
    payment: "Failed",
    status: "Cancelled",
  },
  {
    id: "ORD001242",
    product: "Gold Necklace Set",
    category: "Jewellery",
    image: "📿",
    buyer: "Rohan Mehta",
    buyerEmail: "rohan@gmail.com",
    seller: "Fashion Hub",
    sellerEmail: "fashionhub.store",
    date: "4 Sep, 2026",
    time: "3:30 PM",
    amount: 345000,
    payment: "Paid",
    status: "Shipped",
  },
  {
    id: "ORD001241",
    product: "PlayStation 5",
    category: "Gaming",
    image: "🎮",
    buyer: "Ananya Roy",
    buyerEmail: "ananya@gmail.com",
    seller: "Gamer Zone",
    sellerEmail: "gamerzone.store",
    date: "3 Sep, 2026",
    time: "12:20 PM",
    amount: 55000,
    payment: "Paid",
    status: "Delivered",
  },
];

const orderTabs = [
  { label: "All Orders", value: "All", count: 538 },
  { label: "Processing", value: "Processing", count: 68 },
  { label: "Shipped", value: "Shipped", count: 96 },
  { label: "Delivered", value: "Delivered", count: 426 },
  { label: "Cancelled", value: "Cancelled", count: 44 },
];

const formatCurrency = (amount) => `₹${amount.toLocaleString("en-IN")}`;

function OrderStatCard({ icon: Icon, title, value, change, color, trend }) {
  return (
    <div className={`order-stat-card ${color}`}>
      <div className="order-stat-icon">
        <Icon size={28} />
      </div>

      <div className="order-stat-info">
        <span className="order-stat-title">{title}</span>
        <div className="order-stat-value-row">
          <strong>{value}</strong>
          <span className={`order-stat-change ${trend || ""}`}>
            {trend === "negative" ? "↓" : "↑"} {change}
            <small>vs last month</small>
          </span>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ value, type }) {
  const className = value.toLowerCase().replace(/\s+/g, "-");

  return (
    <span className={`order-status-badge ${type} ${className}`}>
      <span className="status-dot" />
      {value}
    </span>
  );
}

export default function OrderManagement() {
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [paymentFilter, setPaymentFilter] = useState("All Payment Status");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const pageSize = 8;

  const filteredOrders = useMemo(() => {
    return ordersData.filter((order) => {
      const query = search.toLowerCase();

      const matchesSearch =
        order.id.toLowerCase().includes(query) ||
        order.product.toLowerCase().includes(query) ||
        order.buyer.toLowerCase().includes(query) ||
        order.seller.toLowerCase().includes(query);

      const matchesTab = activeTab === "All" || order.status === activeTab;

      const matchesStatus =
        statusFilter === "All Status" || order.status === statusFilter;

      const matchesPayment =
        paymentFilter === "All Payment Status" ||
        order.payment === paymentFilter;

      const matchesDate = !dateFilter || order.date === dateFilter;

      return (
        matchesSearch &&
        matchesTab &&
        matchesStatus &&
        matchesPayment &&
        matchesDate
      );
    });
  }, [search, activeTab, statusFilter, paymentFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));

  const visibleOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const toggleSelectAll = (checked) => {
    setSelectedOrders(checked ? visibleOrders.map((order) => order.id) : []);
  };

  const toggleOrder = (id) => {
    setSelectedOrders((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    );
  };

  const resetFilters = () => {
    setSearch("");
    setActiveTab("All");
    setStatusFilter("All Status");
    setPaymentFilter("All Payment Status");
    setDateFilter("");
    setCurrentPage(1);
  };

  const exportOrders = () => {
    const headers = [
      "Order ID",
      "Product",
      "Buyer",
      "Seller",
      "Date",
      "Amount",
      "Payment Status",
      "Order Status",
    ];

    const rows = filteredOrders.map((order) => [
      order.id,
      order.product,
      order.buyer,
      order.seller,
      order.date,
      order.amount,
      order.payment,
      order.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "orders.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="order-management-page">
      {/* PAGE HEADING */}
      <div className="order-page-heading">
        <div>
          <h1>Order Management</h1>
          <p>Track, manage and update all auction orders on your platform.</p>
        </div>

        <div className="order-date-display">
          <CalendarDays size={19} />
          <span>Fri, 11 Sep, 2026</span>
        </div>
      </div>

      {/* STATISTICS */}
      <div className="order-stats-grid">
        <OrderStatCard
          icon={ShoppingBag}
          title="Total Orders"
          value="538"
          change="18%"
          color="green"
        />

        <OrderStatCard
          icon={Truck}
          title="Delivered Orders"
          value="426"
          change="15%"
          color="blue"
        />

        <OrderStatCard
          icon={Clock}
          title="Processing Orders"
          value="68"
          change="10%"
          color="orange"
        />

        <OrderStatCard
          icon={XCircle}
          title="Cancelled Orders"
          value="44"
          change="8%"
          color="red"
          trend="negative"
        />
      </div>

      {/* TABLE CARD */}
      <section className="order-table-card">
        {/* TABS AND ACTION BUTTONS */}
        <div className="order-tabs-toolbar">
          <div className="order-tabs">
            {orderTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                className={`order-tab ${
                  activeTab === tab.value ? "active" : ""
                }`}
                onClick={() => {
                  setActiveTab(tab.value);
                  setCurrentPage(1);
                }}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          <div className="order-toolbar-actions">
            <button
              type="button"
              className="order-export-button"
              onClick={exportOrders}
            >
              <Download size={18} />
              Export
            </button>

            <button
              type="button"
              className="order-add-button"
              onClick={() =>
                alert("Connect this button to your Add Order form.")
              }
            >
              <Plus size={19} />
              Add Order
            </button>
          </div>
        </div>

        {/* FILTERS */}
        <div className="order-filters">
          <div className="order-search-box">
            <Search size={19} />
            <input
              type="text"
              placeholder="Search by order ID, buyer, seller or product..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="order-select-wrap">
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by order status"
            >
              <option>All Status</option>
              <option>Processing</option>
              <option>Shipped</option>
              <option>Delivered</option>
              <option>Cancelled</option>
            </select>
            <ChevronDown size={15} />
          </div>

          <div className="order-select-wrap payment-filter">
            <select
              value={paymentFilter}
              onChange={(event) => {
                setPaymentFilter(event.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by payment status"
            >
              <option>All Payment Status</option>
              <option>Paid</option>
              <option>Pending</option>
              <option>Failed</option>
            </select>
            <ChevronDown size={15} />
          </div>

          <div className="order-date-filter">
            <CalendarDays size={17} />
            <input
              type="text"
              placeholder="Select Date"
              value={dateFilter}
              onChange={(event) => {
                setDateFilter(event.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by date"
            />
          </div>

          <button
            type="button"
            className="order-reset-button"
            onClick={resetFilters}
          >
            <RotateCcw size={17} />
            Reset
          </button>
        </div>

        {/* ORDER TABLE */}
        <div className="order-table-scroll">
          <table className="order-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={
                      visibleOrders.length > 0 &&
                      visibleOrders.every((order) =>
                        selectedOrders.includes(order.id),
                      )
                    }
                    onChange={(event) => toggleSelectAll(event.target.checked)}
                    aria-label="Select all visible orders"
                  />
                </th>
                <th>Order ID</th>
                <th>Product</th>
                <th>Buyer</th>
                <th>Seller</th>
                <th>Order Date ↓</th>
                <th>Amount</th>
                <th>Payment Status</th>
                <th>Order Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {visibleOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => toggleOrder(order.id)}
                      aria-label={`Select ${order.id}`}
                    />
                  </td>

                  <td className="order-id-cell">{order.id}</td>

                  <td>
                    <div className="order-product-cell">
                      <div className="order-product-image">{order.image}</div>
                      <div>
                        <strong>{order.product}</strong>
                        <span>{order.category}</span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="order-person-cell">
                      <div className="order-avatar buyer-avatar">
                        {order.buyer.charAt(0)}
                      </div>
                      <div>
                        <strong>{order.buyer}</strong>
                        <span>{order.buyerEmail}</span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="order-person-cell">
                      <div className="order-avatar seller-avatar">
                        {order.seller.charAt(0)}
                      </div>
                      <div>
                        <strong>{order.seller}</strong>
                        <span>{order.sellerEmail}</span>
                      </div>
                    </div>
                  </td>

                  <td className="order-date-cell">
                    <span>{order.date}</span>
                    <small>{order.time}</small>
                  </td>

                  <td className="order-amount-cell">
                    {formatCurrency(order.amount)}
                  </td>

                  <td>
                    <StatusBadge value={order.payment} type="payment" />
                  </td>

                  <td>
                    <StatusBadge value={order.status} type="order" />
                  </td>

                  {/* ACTIONS: EYE AND PENCIL */}
                  <td>
                    <div className="order-row-actions">
                      <button
                        type="button"
                        title="View order"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye size={20} />
                      </button>

                      <button
                        type="button"
                        title="Edit order"
                        onClick={() => alert(`Edit ${order.id}`)}
                      >
                        <Pencil size={19} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {visibleOrders.length === 0 && (
                <tr>
                  <td colSpan="10" className="order-empty-state">
                    No orders found. Try changing your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="order-pagination">
          <span>
            Showing{" "}
            {filteredOrders.length ? (currentPage - 1) * pageSize + 1 : 0}–
            {Math.min(currentPage * pageSize, filteredOrders.length)} of{" "}
            {filteredOrders.length} orders
          </span>

          <div className="order-pagination-buttons">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft size={18} />
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <button
                  type="button"
                  key={page}
                  className={currentPage === page ? "active" : ""}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ),
            )}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              aria-label="Next page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div
          className="order-modal-overlay"
          onClick={() => setSelectedOrder(null)}
        >
          <section
            className="order-details-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="order-modal-header">
              <div>
                <h2>Order Details</h2>
                <span>{selectedOrder.id}</span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                aria-label="Close order details"
              >
                ×
              </button>
            </div>

            <div className="order-modal-product">
              <div className="order-product-image">{selectedOrder.image}</div>
              <div>
                <strong>{selectedOrder.product}</strong>
                <span>{selectedOrder.category}</span>
                <b>{formatCurrency(selectedOrder.amount)}</b>
              </div>
            </div>

            <div className="order-detail-row">
              <span>Buyer</span>
              <strong>{selectedOrder.buyer}</strong>
            </div>

            <div className="order-detail-row">
              <span>Seller</span>
              <strong>{selectedOrder.seller}</strong>
            </div>

            <div className="order-detail-row">
              <span>Order Date</span>
              <strong>
                {selectedOrder.date} · {selectedOrder.time}
              </strong>
            </div>

            <div className="order-detail-row">
              <span>Payment Status</span>
              <StatusBadge value={selectedOrder.payment} type="payment" />
            </div>

            <div className="order-detail-row">
              <span>Order Status</span>
              <StatusBadge value={selectedOrder.status} type="order" />
            </div>

            <button
              type="button"
              className="order-modal-close-button"
              onClick={() => setSelectedOrder(null)}
            >
              Close
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
