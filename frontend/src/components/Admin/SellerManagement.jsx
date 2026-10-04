import {
  Ban,
  Camera,
  CarFront,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Eye,
  Filter,
  Gamepad2,
  House,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Shirt,
  Smartphone,
  Store,
  UserRoundCheck,
  Watch,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import "./SellerManagement.css";

const initialSellers = [
  {
    id: 1,
    store: "TechWorld",
    owner: "Rahul Sharma",
    email: "rahul@techworld.com",
    phone: "9876543210",
    category: "Electronics",
    products: 24,
    joined: "10 Sep, 2026",
    status: "Active",
    icon: Store,
    sellerId: "SEL00123",
  },
  {
    id: 2,
    store: "Camera Hub",
    owner: "Priya Verma",
    email: "priya@camerahub.com",
    phone: "9123456780",
    category: "Electronics",
    products: 18,
    joined: "9 Sep, 2026",
    status: "Active",
    icon: Camera,
    sellerId: "SEL00124",
  },
  {
    id: 3,
    store: "Gamer Zone",
    owner: "Amit Patel",
    email: "amit@gamerzone.com",
    phone: "9988776655",
    category: "Gaming",
    products: 32,
    joined: "8 Sep, 2026",
    status: "Suspended",
    icon: Gamepad2,
    sellerId: "SEL00125",
  },
  {
    id: 4,
    store: "Luxury Time",
    owner: "Sneha Das",
    email: "sneha@luxurytime.com",
    phone: "9876123456",
    category: "Watches",
    products: 15,
    joined: "7 Sep, 2026",
    status: "Active",
    icon: Watch,
    sellerId: "SEL00126",
  },
  {
    id: 5,
    store: "Home Decor",
    owner: "Arjun Singh",
    email: "arjun@homedecor.com",
    phone: "9012345678",
    category: "Home & Living",
    products: 28,
    joined: "6 Sep, 2026",
    status: "Pending",
    icon: House,
    sellerId: "SEL00127",
  },
  {
    id: 6,
    store: "Mobile Store",
    owner: "Neha Verma",
    email: "neha@mobilestore.com",
    phone: "9898989898",
    category: "Electronics",
    products: 41,
    joined: "5 Sep, 2026",
    status: "Active",
    icon: Smartphone,
    sellerId: "SEL00128",
  },
  {
    id: 7,
    store: "Fashion Hub",
    owner: "Rohan Mehta",
    email: "rohan@fashionhub.com",
    phone: "9876501234",
    category: "Fashion",
    products: 19,
    joined: "4 Sep, 2026",
    status: "Active",
    icon: Shirt,
    sellerId: "SEL00129",
  },
  {
    id: 8,
    store: "Auto Mart",
    owner: "Ananya Roy",
    email: "ananya@automart.com",
    phone: "9876540987",
    category: "Automotive",
    products: 36,
    joined: "3 Sep, 2026",
    status: "Suspended",
    icon: CarFront,
    sellerId: "SEL00130",
  },
];

const ITEMS_PER_PAGE = 8;
const TOTAL_SELLERS = 186;

const initialForm = {
  store: "",
  owner: "",
  email: "",
  phone: "",
  category: "Electronics",
  products: 0,
  status: "Pending",
};

function SellerStatus({ status }) {
  const statusClass = status.toLowerCase();

  return (
    <span className={`seller-status-badge ${statusClass}`}>
      <span className="seller-status-dot" />
      {status}
    </span>
  );
}

function SellerAvatar({ seller }) {
  const Icon = seller.icon;

  return (
    <div className={`seller-avatar seller-avatar-${seller.id % 6}`}>
      <Icon size={25} strokeWidth={1.9} />
    </div>
  );
}

export default function SellerManagement() {
  const [sellers, setSellers] = useState(initialSellers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [modalType, setModalType] = useState("");
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const filteredSellers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return sellers.filter((seller) => {
      const matchesSearch =
        !query ||
        seller.store.toLowerCase().includes(query) ||
        seller.owner.toLowerCase().includes(query) ||
        seller.email.toLowerCase().includes(query) ||
        seller.sellerId.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All Status" || seller.status === statusFilter;

      const matchesCategory =
        categoryFilter === "All Categories" ||
        seller.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [sellers, search, statusFilter, categoryFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSellers.length / ITEMS_PER_PAGE),
  );

  const paginatedSellers = filteredSellers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const activeCount = sellers.filter(
    (seller) => seller.status === "Active",
  ).length;

  const pendingCount = sellers.filter(
    (seller) => seller.status === "Pending",
  ).length;

  const suspendedCount = sellers.filter(
    (seller) => seller.status === "Suspended",
  ).length;

  const openAddModal = () => {
    setFormData(initialForm);
    setEditingId(null);
    setModalType("add");
  };

  const openEditModal = (seller) => {
    setFormData({
      store: seller.store,
      owner: seller.owner,
      email: seller.email,
      phone: seller.phone,
      category: seller.category,
      products: seller.products,
      status: seller.status,
    });
    setEditingId(seller.id);
    setModalType("edit");
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSaveSeller = (event) => {
    event.preventDefault();

    if (editingId !== null) {
      setSellers((previous) =>
        previous.map((seller) =>
          seller.id === editingId ? { ...seller, ...formData } : seller,
        ),
      );
    } else {
      const newId = Math.max(0, ...sellers.map((seller) => seller.id)) + 1;

      const newSeller = {
        ...formData,
        id: newId,
        sellerId: `SEL${String(123 + newId).padStart(5, "0")}`,
        joined: new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        products: Number(formData.products) || 0,
        icon: Store,
      };

      setSellers((previous) => [newSeller, ...previous]);
      setCurrentPage(1);
    }

    setModalType("");
  };

  const handleDeleteSeller = (seller) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${seller.store}?`,
    );

    if (!confirmed) return;

    setSellers((previous) => previous.filter((item) => item.id !== seller.id));

    setSelectedIds((previous) => previous.filter((id) => id !== seller.id));

    setSelectedSeller(null);
    setModalType("");
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    );
  };

  const handleSelectAll = (checked) => {
    const pageIds = paginatedSellers.map((seller) => seller.id);

    setSelectedIds((previous) => {
      if (checked) {
        return [...new Set([...previous, ...pageIds])];
      }

      return previous.filter((id) => !pageIds.includes(id));
    });
  };

  const handleExport = () => {
    const headers = [
      "Seller ID",
      "Store",
      "Owner",
      "Email",
      "Phone",
      "Category",
      "Products",
      "Joined",
      "Status",
    ];

    const rows = filteredSellers.map((seller) => [
      seller.sellerId,
      seller.store,
      seller.owner,
      seller.email,
      seller.phone,
      seller.category,
      seller.products,
      seller.joined,
      seller.status,
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
    link.download = "seller-management.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All Status");
    setCategoryFilter("All Categories");
    setCurrentPage(1);
  };

  return (
    <div className="seller-management-page">
      {/* Page Header */}
      <div className="seller-page-header">
        <div>
          <h1>Seller Management</h1>
          <p>Manage and monitor all registered sellers on your platform.</p>
        </div>

        <div className="seller-page-date">
          <span className="seller-calendar-icon">▦</span>
          Fri, 11 Sept, 2026
        </div>
      </div>

      {/* Statistics */}
      <div className="seller-stats-grid">
        <div className="seller-stat-card total">
          <div className="seller-stat-icon">
            <Store size={29} />
          </div>
          <div className="seller-stat-info">
            <p>Total Sellers</p>
            <div className="seller-stat-value-row">
              <h2>{TOTAL_SELLERS}</h2>
              <div className="seller-stat-change positive">
                ↑ 8%
                <span>vs last month</span>
              </div>
            </div>
          </div>
        </div>

        <div className="seller-stat-card active">
          <div className="seller-stat-icon">
            <UserRoundCheck size={29} />
          </div>
          <div className="seller-stat-info">
            <p>Active Sellers</p>
            <div className="seller-stat-value-row">
              <h2>{152 + activeCount - 6}</h2>
              <div className="seller-stat-change positive">
                ↑ 12%
                <span>vs last month</span>
              </div>
            </div>
          </div>
        </div>

        <div className="seller-stat-card pending">
          <div className="seller-stat-icon">
            <Clock size={29} />
          </div>
          <div className="seller-stat-info">
            <p>Pending Verification</p>
            <div className="seller-stat-value-row">
              <h2>{24 + pendingCount - 1}</h2>
              <div className="seller-stat-change positive">
                ↑ 20%
                <span>vs last month</span>
              </div>
            </div>
          </div>
        </div>

        <div className="seller-stat-card suspended">
          <div className="seller-stat-icon">
            <Ban size={29} />
          </div>
          <div className="seller-stat-info">
            <p>Suspended Sellers</p>
            <div className="seller-stat-value-row">
              <h2>{10 + suspendedCount - 2}</h2>
              <div className="seller-stat-change negative">
                ↑ 5%
                <span>vs last month</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sellers Table */}
      <section className="seller-table-card">
        <div className="seller-table-toolbar">
          <div className="seller-table-heading">
            <h2>All Sellers</h2>
            <span>
              (
              {filteredSellers.length === sellers.length
                ? TOTAL_SELLERS
                : filteredSellers.length}
              )
            </span>
          </div>

          <div className="seller-table-actions">
            <div className="seller-search-box">
              <Search size={19} />
              <input
                type="text"
                placeholder="Search by name, email, or store..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
              />
              {search && (
                <button
                  type="button"
                  className="seller-search-clear"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="seller-filter-box">
              <Filter size={15} />
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Filter by status"
              >
                <option>All Status</option>
                <option>Active</option>
                <option>Pending</option>
                <option>Suspended</option>
              </select>
              <ChevronDown size={15} />
            </div>

            <div className="seller-filter-box category-filter">
              <select
                value={categoryFilter}
                onChange={(event) => {
                  setCategoryFilter(event.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Filter by category"
              >
                <option>All Categories</option>
                <option>Electronics</option>
                <option>Gaming</option>
                <option>Watches</option>
                <option>Home & Living</option>
                <option>Fashion</option>
                <option>Automotive</option>
              </select>
              <ChevronDown size={15} />
            </div>

            <button
              type="button"
              className="seller-btn seller-btn-outline"
              onClick={handleExport}
            >
              <Download size={17} />
              Export
            </button>

            <button
              type="button"
              className="seller-btn seller-btn-primary"
              onClick={openAddModal}
            >
              <Plus size={20} />
              Add Seller
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="seller-table-wrapper">
          <table className="seller-table">
            <thead>
              <tr>
                <th className="seller-checkbox-column">
                  <input
                    type="checkbox"
                    checked={
                      paginatedSellers.length > 0 &&
                      paginatedSellers.every((seller) =>
                        selectedIds.includes(seller.id),
                      )
                    }
                    onChange={(event) => handleSelectAll(event.target.checked)}
                    aria-label="Select all sellers"
                  />
                </th>
                <th>Store / Seller</th>
                <th>Seller ID</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Category</th>
                <th>Products</th>
                <th>Joined Date ↓</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedSellers.length > 0 ? (
                paginatedSellers.map((seller) => (
                  <tr key={seller.id}>
                    <td className="seller-checkbox-column">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(seller.id)}
                        onChange={() => handleToggleSelect(seller.id)}
                        aria-label={`Select ${seller.store}`}
                      />
                    </td>

                    <td>
                      <div className="seller-store-cell">
                        <SellerAvatar seller={seller} />
                        <div className="seller-store-info">
                          <strong>{seller.store}</strong>
                          <span>{seller.owner}</span>
                        </div>
                      </div>
                    </td>

                    <td>{seller.sellerId}</td>
                    <td>{seller.email}</td>
                    <td>{seller.phone}</td>

                    <td>
                      <span
                        className={`seller-category-badge ${seller.category
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")}`}
                      >
                        {seller.category}
                      </span>
                    </td>

                    <td>{seller.products}</td>
                    <td>{seller.joined}</td>

                    <td>
                      <SellerStatus status={seller.status} />
                    </td>

                    <td>
                      <div className="seller-action-buttons">
                        <button
                          type="button"
                          className="seller-action-btn view"
                          title="View seller"
                          aria-label={`View ${seller.store}`}
                          onClick={() => {
                            setSelectedSeller(seller);
                            setModalType("view");
                          }}
                        >
                          <Eye size={19} />
                        </button>

                        <button
                          type="button"
                          className="seller-action-btn edit"
                          title="Edit seller"
                          aria-label={`Edit ${seller.store}`}
                          onClick={() => openEditModal(seller)}
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          type="button"
                          className="seller-action-btn more"
                          title="More options"
                          aria-label={`More options for ${seller.store}`}
                          onClick={() => {
                            setSelectedSeller(seller);
                            setModalType("actions");
                          }}
                        >
                          <MoreHorizontal size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="seller-empty-state">
                    <Store size={35} />
                    <h3>No sellers found</h3>
                    <p>Try changing your search or filters.</p>
                    <button
                      type="button"
                      className="seller-btn seller-btn-outline"
                      onClick={clearFilters}
                    >
                      Clear Filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="seller-table-pagination">
          <p>
            Showing{" "}
            {filteredSellers.length > 0
              ? (currentPage - 1) * ITEMS_PER_PAGE + 1
              : 0}
            –{Math.min(currentPage * ITEMS_PER_PAGE, filteredSellers.length)} of{" "}
            {filteredSellers.length === sellers.length
              ? TOTAL_SELLERS
              : filteredSellers.length}{" "}
            sellers
          </p>

          <div className="seller-pagination-buttons">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <ChevronLeft size={17} />
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
              const page = index + 1;

              return (
                <button
                  type="button"
                  key={page}
                  className={currentPage === page ? "active" : ""}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              );
            })}

            {totalPages > 5 && (
              <>
                <span className="seller-pagination-ellipsis">...</span>
                <button
                  type="button"
                  className={currentPage === totalPages ? "active" : ""}
                  onClick={() => setCurrentPage(totalPages)}
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>

      {/* Add / Edit Seller Modal */}
      {(modalType === "add" || modalType === "edit") && (
        <div
          className="seller-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setModalType("");
          }}
        >
          <section
            className="seller-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="seller-form-title"
          >
            <div className="seller-modal-header">
              <div>
                <h2 id="seller-form-title">
                  {modalType === "edit" ? "Edit Seller" : "Add New Seller"}
                </h2>
                <p>
                  {modalType === "edit"
                    ? "Update the seller's information."
                    : "Enter the details to register a new seller."}
                </p>
              </div>

              <button
                type="button"
                className="seller-modal-close"
                onClick={() => setModalType("")}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form className="seller-modal-form" onSubmit={handleSaveSeller}>
              <label>
                Store Name
                <input
                  name="store"
                  value={formData.store}
                  onChange={handleFormChange}
                  placeholder="Enter store name"
                  required
                />
              </label>

              <label>
                Seller Name
                <input
                  name="owner"
                  value={formData.owner}
                  onChange={handleFormChange}
                  placeholder="Enter seller name"
                  required
                />
              </label>

              <label>
                Email Address
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  placeholder="seller@example.com"
                  required
                />
              </label>

              <label>
                Phone Number
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  placeholder="Enter phone number"
                  required
                />
              </label>

              <label>
                Category
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                >
                  <option>Electronics</option>
                  <option>Gaming</option>
                  <option>Watches</option>
                  <option>Home & Living</option>
                  <option>Fashion</option>
                  <option>Automotive</option>
                </select>
              </label>

              <label>
                Status
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                >
                  <option>Active</option>
                  <option>Pending</option>
                  <option>Suspended</option>
                </select>
              </label>

              <div className="seller-modal-actions">
                <button
                  type="button"
                  className="seller-btn seller-btn-outline"
                  onClick={() => setModalType("")}
                >
                  Cancel
                </button>

                <button type="submit" className="seller-btn seller-btn-primary">
                  <Check size={17} />
                  {modalType === "edit" ? "Save Changes" : "Add Seller"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* View Seller Modal */}
      {modalType === "view" && selectedSeller && (
        <div
          className="seller-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setModalType("");
          }}
        >
          <section
            className="seller-modal seller-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="seller-details-title"
          >
            <div className="seller-modal-header">
              <div>
                <h2 id="seller-details-title">Seller Details</h2>
                <p>View seller account information.</p>
              </div>

              <button
                type="button"
                className="seller-modal-close"
                onClick={() => setModalType("")}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="seller-details-content">
              <SellerAvatar seller={selectedSeller} />
              <h3>{selectedSeller.store}</h3>
              <p>{selectedSeller.owner}</p>

              <div className="seller-details-list">
                <div>
                  <span>Seller ID</span>
                  <strong>{selectedSeller.sellerId}</strong>
                </div>
                <div>
                  <span>Email</span>
                  <strong>{selectedSeller.email}</strong>
                </div>
                <div>
                  <span>Phone</span>
                  <strong>{selectedSeller.phone}</strong>
                </div>
                <div>
                  <span>Category</span>
                  <strong>{selectedSeller.category}</strong>
                </div>
                <div>
                  <span>Products</span>
                  <strong>{selectedSeller.products}</strong>
                </div>
                <div>
                  <span>Joined Date</span>
                  <strong>{selectedSeller.joined}</strong>
                </div>
                <div>
                  <span>Status</span>
                  <SellerStatus status={selectedSeller.status} />
                </div>
              </div>

              <div className="seller-modal-actions">
                <button
                  type="button"
                  className="seller-btn seller-btn-outline"
                  onClick={() => setModalType("")}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="seller-btn seller-btn-primary"
                  onClick={() => openEditModal(selectedSeller)}
                >
                  <Pencil size={16} />
                  Edit Seller
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* More Actions Modal */}
      {modalType === "actions" && selectedSeller && (
        <div
          className="seller-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setModalType("");
          }}
        >
          <section
            className="seller-modal seller-actions-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="seller-actions-title"
          >
            <div className="seller-modal-header">
              <div>
                <h2 id="seller-actions-title">Seller Actions</h2>
                <p>{selectedSeller.store}</p>
              </div>

              <button
                type="button"
                className="seller-modal-close"
                onClick={() => setModalType("")}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="seller-actions-list">
              <button
                type="button"
                onClick={() => openEditModal(selectedSeller)}
              >
                <Pencil size={17} />
                Edit Seller
              </button>

              <button
                type="button"
                onClick={() => {
                  setSellers((previous) =>
                    previous.map((seller) =>
                      seller.id === selectedSeller.id
                        ? {
                            ...seller,
                            status:
                              seller.status === "Suspended"
                                ? "Active"
                                : "Suspended",
                          }
                        : seller,
                    ),
                  );
                  setModalType("");
                }}
              >
                <Ban size={17} />
                {selectedSeller.status === "Suspended"
                  ? "Activate Seller"
                  : "Suspend Seller"}
              </button>

              <button
                type="button"
                className="danger"
                onClick={() => handleDeleteSeller(selectedSeller)}
              >
                <X size={17} />
                Delete Seller
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
