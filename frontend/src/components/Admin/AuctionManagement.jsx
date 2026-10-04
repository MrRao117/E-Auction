import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Gavel,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Square,
} from "lucide-react";
import { useState } from "react";
import "./AuctionManagement.css";

const auctionData = [
  {
    id: "AUC0124",
    product: "MacBook Pro M3",
    category: "Laptops",
    seller: "TechWorld",
    owner: "Rahul Sharma",
    startDate: "10 Sep, 2026",
    startTime: "10:00 AM",
    endDate: "15 Sep, 2026",
    endTime: "10:00 AM",
    bid: "₹85,000",
    bids: 32,
    status: "Live",
    image: "💻",
  },
  {
    id: "AUC0123",
    product: "Canon EOS R6",
    category: "Cameras",
    seller: "Camera Hub",
    owner: "Priya Verma",
    startDate: "9 Sep, 2026",
    startTime: "2:00 PM",
    endDate: "14 Sep, 2026",
    endTime: "2:00 PM",
    bid: "₹1,25,000",
    bids: 28,
    status: "Live",
    image: "📷",
  },
  {
    id: "AUC0122",
    product: "iPhone 15 Pro",
    category: "Mobile Phones",
    seller: "Electro Mart",
    owner: "Amit Patel",
    startDate: "8 Sep, 2026",
    startTime: "11:00 AM",
    endDate: "13 Sep, 2026",
    endTime: "11:00 AM",
    bid: "₹78,500",
    bids: 45,
    status: "Upcoming",
    image: "📱",
  },
  {
    id: "AUC0121",
    product: "Rolex Submariner",
    category: "Watches",
    seller: "Luxury Time",
    owner: "Sneha Das",
    startDate: "7 Sep, 2026",
    startTime: "5:00 PM",
    endDate: "12 Sep, 2026",
    endTime: "5:00 PM",
    bid: "₹6,20,000",
    bids: 18,
    status: "Live",
    image: "⌚",
  },
  {
    id: "AUC0120",
    product: "Toyota Fortuner",
    category: "Automobiles",
    seller: "Auto Mart",
    owner: "Arjun Singh",
    startDate: "6 Sep, 2026",
    startTime: "9:00 AM",
    endDate: "11 Sep, 2026",
    endTime: "9:00 AM",
    bid: "₹18,75,000",
    bids: 12,
    status: "Ended",
    image: "🚙",
  },
  {
    id: "AUC0119",
    product: 'LG 65" 4K Smart TV',
    category: "Home Appliances",
    seller: "Home Decor",
    owner: "Neha Verma",
    startDate: "5 Sep, 2026",
    startTime: "1:00 PM",
    endDate: "10 Sep, 2026",
    endTime: "1:00 PM",
    bid: "₹92,000",
    bids: 26,
    status: "Ended",
    image: "📺",
  },
  {
    id: "AUC0118",
    product: "Gold Necklace Set",
    category: "Jewellery",
    seller: "Fashion Hub",
    owner: "Rohan Mehta",
    startDate: "4 Sep, 2026",
    startTime: "3:00 PM",
    endDate: "9 Sep, 2026",
    endTime: "3:00 PM",
    bid: "₹3,45,000",
    bids: 38,
    status: "Live",
    image: "📿",
  },
  {
    id: "AUC0117",
    product: "PlayStation 5",
    category: "Gaming",
    seller: "Game Zone",
    owner: "Anaya Roy",
    startDate: "3 Sep, 2026",
    startTime: "12:00 PM",
    endDate: "8 Sep, 2026",
    endTime: "12:00 PM",
    bid: "₹55,000",
    bids: 21,
    status: "Upcoming",
    image: "🎮",
  },
];

const stats = [
  {
    label: "Total Auctions",
    value: "124",
    change: "18%",
    type: "blue",
    icon: Gavel,
  },
  {
    label: "Live Auctions",
    value: "36",
    change: "25%",
    type: "green",
    icon: ShieldCheck,
  },
  {
    label: "Upcoming Auctions",
    value: "52",
    change: "12%",
    type: "orange",
    icon: Clock,
  },
  {
    label: "Ended Auctions",
    value: "36",
    change: "8%",
    type: "red",
    icon: Square,
    down: true,
  },
];

const tabs = [
  { label: "All Auctions", count: 124 },
  { label: "Live", count: 36 },
  { label: "Upcoming", count: 52 },
  { label: "Ended", count: 36 },
];

function AuctionManagement() {
  const [activeTab, setActiveTab] = useState("All Auctions");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Status");
  const [seller, setSeller] = useState("All Sellers");
  const [selected, setSelected] = useState([]);

  const filteredAuctions = auctionData.filter((auction) => {
    const matchesTab =
      activeTab === "All Auctions" || auction.status === activeTab;

    const searchText = search.toLowerCase();
    const matchesSearch =
      auction.product.toLowerCase().includes(searchText) ||
      auction.seller.toLowerCase().includes(searchText) ||
      auction.id.toLowerCase().includes(searchText);

    const matchesCategory =
      category === "All Categories" || auction.category === category;

    const matchesStatus = status === "All Status" || auction.status === status;

    const matchesSeller = seller === "All Sellers" || auction.seller === seller;

    return (
      matchesTab &&
      matchesSearch &&
      matchesCategory &&
      matchesStatus &&
      matchesSeller
    );
  });

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === filteredAuctions.length) {
      setSelected([]);
    } else {
      setSelected(filteredAuctions.map((auction) => auction.id));
    }
  };

  const resetFilters = () => {
    setSearch("");
    setCategory("All Categories");
    setStatus("All Status");
    setSeller("All Sellers");
    setActiveTab("All Auctions");
    setSelected([]);
  };

  return (
    <div className="auction-management">
      {/* Page Heading */}
      <div className="auction-page-heading">
        <div>
          <h1>Auction Management</h1>
          <p>Create, monitor, and manage all auctions on your platform.</p>
        </div>

        <div className="auction-date">
          <span>▦</span>
          Fri, 11 Sep, 2026
        </div>
      </div>

      {/* Statistics */}
      <div className="auction-stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div className={`auction-stat-card ${stat.type}`} key={stat.label}>
              <div className="auction-stat-icon">
                <Icon size={29} strokeWidth={2.5} />
              </div>

              <div className="auction-stat-info">
                <p>{stat.label}</p>
                <h2>{stat.value}</h2>
              </div>

              <div
                className={`auction-stat-change ${stat.down ? "negative" : ""}`}
              >
                <strong>
                  {stat.down ? "↓" : "↑"} {stat.change}
                </strong>
                <span>vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Table Card */}
      <div className="auction-table-card">
        {/* Tabs */}
        <div className="auction-tabs-row">
          <div className="auction-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.label}
                className={`auction-tab ${
                  activeTab === tab.label ? "active" : ""
                }`}
                onClick={() => setActiveTab(tab.label)}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          <button className="auction-primary-btn">
            <Plus size={20} />
            Create Auction
          </button>
        </div>

        {/* Filters */}
        <div className="auction-filter-row">
          <div className="auction-search-box">
            <Search size={19} />
            <input
              type="text"
              placeholder="Search auction title, product or seller..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="auction-select-wrap">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>All Categories</option>
              {[...new Set(auctionData.map((a) => a.category))].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <ChevronDown size={16} />
          </div>

          <div className="auction-select-wrap">
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>All Status</option>
              <option>Live</option>
              <option>Upcoming</option>
              <option>Ended</option>
            </select>
            <ChevronDown size={16} />
          </div>

          <div className="auction-select-wrap seller-select">
            <select value={seller} onChange={(e) => setSeller(e.target.value)}>
              <option>All Sellers</option>
              {[...new Set(auctionData.map((a) => a.seller))].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <ChevronDown size={16} />
          </div>

          <button className="auction-reset-btn" onClick={resetFilters}>
            <RotateCcw size={17} />
            Reset
          </button>
        </div>

        {/* Table */}
        <div className="auction-table-scroll">
          <table className="auction-table">
            <thead>
              <tr>
                <th className="auction-check-column">
                  <input
                    type="checkbox"
                    checked={
                      filteredAuctions.length > 0 &&
                      selected.length === filteredAuctions.length
                    }
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Product</th>
                <th>Auction ID</th>
                <th>Seller</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Current Bid</th>
                <th>Bids</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredAuctions.map((auction) => (
                <tr key={auction.id}>
                  <td className="auction-check-column">
                    <input
                      type="checkbox"
                      checked={selected.includes(auction.id)}
                      onChange={() => toggleSelect(auction.id)}
                    />
                  </td>

                  <td>
                    <div className="auction-product-cell">
                      <div className="auction-product-image">
                        {auction.image}
                      </div>
                      <div>
                        <strong>{auction.product}</strong>
                        <span>{auction.category}</span>
                      </div>
                    </div>
                  </td>

                  <td className="auction-muted">{auction.id}</td>

                  <td>
                    <div className="auction-seller-cell">
                      <div className="auction-seller-avatar">
                        {auction.seller.charAt(0)}
                      </div>
                      <div>
                        <strong>{auction.seller}</strong>
                        <span>{auction.owner}</span>
                      </div>
                    </div>
                  </td>

                  <td className="auction-date-cell">
                    {auction.startDate}
                    <span>{auction.startTime}</span>
                  </td>

                  <td className="auction-date-cell">
                    {auction.endDate}
                    <span>{auction.endTime}</span>
                  </td>

                  <td className="auction-bid">{auction.bid}</td>
                  <td className="auction-muted">{auction.bids}</td>

                  <td>
                    <span
                      className={`auction-status-badge ${auction.status.toLowerCase()}`}
                    >
                      <i />
                      {auction.status}
                    </span>
                  </td>

                  <td>
                    <div className="auction-actions">
                      <button title="View Auction">
                        <Eye size={18} />
                      </button>
                      <button title="Edit Auction">
                        <Pencil size={17} />
                      </button>
                      <button title="More Options">
                        <MoreHorizontal size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredAuctions.length === 0 && (
                <tr>
                  <td colSpan="10" className="auction-empty-state">
                    No auctions found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="auction-pagination">
          <p>Showing 1–{filteredAuctions.length} of 124 auctions</p>

          <div className="auction-pagination-controls">
            <button aria-label="Previous page">
              <ChevronLeft size={18} />
            </button>
            <button className="current-page">1</button>
            <button>2</button>
            <button>3</button>
            <button>4</button>
            <button>5</button>
            <span>...</span>
            <button>16</button>
            <button aria-label="Next page">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuctionManagement;
