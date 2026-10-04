import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
  UserX,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import PendingVerifications from "./PendingVerifications";
import "./UserManagement.css";

const initialUsers = [
  {
    id: 1,
    name: "Rahul Sharma",
    email: "rahul.sharma@gmail.com",
    phone: "+91 9876543210",
    role: "Buyer",
    status: "Active",
    joined: "12 Sep 2026",
  },
  {
    id: 2,
    name: "Priya Patel",
    email: "priya.patel@gmail.com",
    phone: "+91 9876543211",
    role: "Seller",
    status: "Active",
    joined: "10 Sep 2026",
  },
  {
    id: 3,
    name: "Amit Verma",
    email: "amit.verma@gmail.com",
    phone: "+91 9876543212",
    role: "Buyer",
    status: "Inactive",
    joined: "08 Sep 2026",
  },
  {
    id: 4,
    name: "Sneha Das",
    email: "sneha.das@gmail.com",
    phone: "+91 9876543213",
    role: "Seller",
    status: "Active",
    joined: "06 Sep 2026",
  },
  {
    id: 5,
    name: "Vikash Kumar",
    email: "vikash.kumar@gmail.com",
    phone: "+91 9876543214",
    role: "Buyer",
    status: "Blocked",
    joined: "04 Sep 2026",
  },
  {
    id: 6,
    name: "Ananya Singh",
    email: "ananya.singh@gmail.com",
    phone: "+91 9876543215",
    role: "Seller",
    status: "Active",
    joined: "02 Sep 2026",
  },
  {
    id: 7,
    name: "Rohit Mishra",
    email: "rohit.mishra@gmail.com",
    phone: "+91 9876543216",
    role: "Buyer",
    status: "Active",
    joined: "01 Sep 2026",
  },
  {
    id: 8,
    name: "Neha Gupta",
    email: "neha.gupta@gmail.com",
    phone: "+91 9876543217",
    role: "Seller",
    status: "Inactive",
    joined: "29 Aug 2026",
  },
];

function UserManagement() {
  const [users, setUsers] = useState(initialUsers);
  const [activeTab, setActiveTab] = useState("users");
  const verificationRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Buyer",
  });

  const usersPerPage = 6;

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm);

      const matchesFilter =
        activeFilter === "All" ||
        user.status.toLowerCase() === activeFilter.toLowerCase();

      return matchesSearch && matchesFilter;
    });
  }, [users, searchTerm, activeFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / usersPerPage),
  );

  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage,
  );

  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.status === "Active").length;
  const inactiveUsers = users.filter(
    (user) => user.status === "Inactive",
  ).length;
  const blockedUsers = users.filter((user) => user.status === "Blocked").length;

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleAddUser = (event) => {
    event.preventDefault();

    const user = {
      ...newUser,
      id: Date.now(),
      status: "Active",
      joined: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    };

    setUsers((prev) => [user, ...prev]);

    setNewUser({
      name: "",
      email: "",
      phone: "",
      role: "Buyer",
    });

    setShowAddModal(false);
    setCurrentPage(1);
  };

  const handleUpdateUser = (event) => {
    event.preventDefault();

    setUsers((prev) =>
      prev.map((user) => (user.id === selectedUser.id ? selectedUser : user)),
    );

    setShowEditModal(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = (userId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?",
    );

    if (!confirmed) return;

    setUsers((prev) => prev.filter((user) => user.id !== userId));
  };

  const handleStatusChange = (userId, status) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === userId ? { ...user, status } : user)),
    );
  };

  const handleExport = () => {
    const headers = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Role",
      "Status",
      "Joined",
    ];

    const rows = filteredUsers.map((user) => [
      user.id,
      user.name,
      user.email,
      user.phone,
      user.role,
      user.status,
      user.joined,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "users.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-page user-management-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1>User Management</h1>
          <p>Manage and monitor all registered users on your platform.</p>
        </div>
      </div>

      {/* User Management Tabs and Actions */}
      <div className="user-management-tabs-row">
        <div className="user-management-tabs">
          <button
            type="button"
            className={`user-management-tab ${
              activeTab === "users" ? "active" : ""
            }`}
            onClick={() => setActiveTab("users")}
          >
            <Users size={17} />
            All Users
          </button>

          <button
            type="button"
            className={`user-management-tab ${
              activeTab === "verification" ? "active" : ""
            }`}
            onClick={() => setActiveTab("verification")}
          >
            <ShieldCheck size={17} />
            Seller Verification
          </button>
        </div>

        <div className="user-management-actions">
          {activeTab === "users" ? (
            <>
              <button
                className="admin-btn admin-btn-outline"
                onClick={handleExport}
              >
                <Download size={17} />
                Export
              </button>

              <button
                className="admin-btn admin-btn-primary"
                onClick={() => setShowAddModal(true)}
              >
                <Plus size={18} />
                Add User
              </button>
            </>
          ) : (
            <button
              className="admin-btn admin-btn-outline"
              onClick={() => verificationRef.current?.exportCSV()}
            >
              <Download size={17} />
              Export Sellers
            </button>
          )}
        </div>
      </div>

      {/* All Users Tab */}
      {activeTab === "users" && (
        <>
          {/* Statistics Cards */}
          <div className="user-stats-grid">
            <div className="user-stat-card">
              <div className="user-stat-icon user-stat-icon-green">
                <Users size={22} />
              </div>
              <div>
                <p>Total Users</p>
                <h2>{totalUsers}</h2>
                <span>All registered users</span>
              </div>
            </div>

            <div className="user-stat-card">
              <div className="user-stat-icon user-stat-icon-blue">
                <UserCheck size={22} />
              </div>
              <div>
                <p>Active Users</p>
                <h2>{activeUsers}</h2>
                <span>Currently active</span>
              </div>
            </div>

            <div className="user-stat-card">
              <div className="user-stat-icon user-stat-icon-orange">
                <UserX size={22} />
              </div>
              <div>
                <p>Inactive Users</p>
                <h2>{inactiveUsers}</h2>
                <span>Currently inactive</span>
              </div>
            </div>

            <div className="user-stat-card">
              <div className="user-stat-icon user-stat-icon-red">
                <ShieldCheck size={22} />
              </div>
              <div>
                <p>Blocked Users</p>
                <h2>{blockedUsers}</h2>
                <span>Restricted accounts</span>
              </div>
            </div>
          </div>

          {/* User Table Section */}
          <div className="admin-content-card user-table-card">
            <div className="user-table-toolbar">
              <div className="user-table-heading">
                <h2>All Users</h2>
                <span>{filteredUsers.length} users found</span>
              </div>

              <div className="user-table-actions">
                <div className="user-search-box">
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(event) => handleSearch(event.target.value)}
                  />

                  {searchTerm && (
                    <button
                      className="user-search-clear"
                      onClick={() => handleSearch("")}
                      aria-label="Clear search"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                <div className="user-filter-box">
                  <Filter size={17} />
                  <select
                    value={activeFilter}
                    onChange={(event) => handleFilterChange(event.target.value)}
                  >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="admin-table-wrapper">
              <table className="admin-table user-management-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Phone Number</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <div className="user-info-cell">
                            <div className="user-avatar">
                              {user.name.charAt(0).toUpperCase()}
                            </div>

                            <div className="user-info-text">
                              <strong>{user.name}</strong>
                              <span>{user.email}</span>
                            </div>
                          </div>
                        </td>

                        <td>{user.phone}</td>

                        <td>
                          <span
                            className={`user-role-badge ${
                              user.role === "Seller"
                                ? "user-role-seller"
                                : "user-role-buyer"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`user-status-badge user-status-${user.status.toLowerCase()}`}
                          >
                            <span className="user-status-dot"></span>
                            {user.status}
                          </span>
                        </td>

                        <td>{user.joined}</td>

                        <td>
                          <div className="user-action-buttons">
                            <button
                              className="user-action-btn user-action-view"
                              title="View User"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Eye size={17} />
                            </button>

                            <button
                              className="user-action-btn user-action-edit"
                              title="Edit User"
                              onClick={() => {
                                setSelectedUser({ ...user });
                                setShowEditModal(true);
                              }}
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              className="user-action-btn user-action-delete"
                              title="Delete User"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="user-empty-state">
                        <Users size={34} />
                        <h3>No users found</h3>
                        <p>Try changing your search or filter.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="user-table-pagination">
              <p>
                Showing{" "}
                {filteredUsers.length === 0
                  ? 0
                  : (currentPage - 1) * usersPerPage + 1}
                {" - "}
                {Math.min(
                  currentPage * usersPerPage,
                  filteredUsers.length,
                )} of {filteredUsers.length} users
              </p>

              <div className="user-pagination-buttons">
                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  aria-label="Previous page"
                >
                  <ChevronLeft size={18} />
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1,
                ).map((page) => (
                  <button
                    key={page}
                    className={currentPage === page ? "active" : ""}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  aria-label="Next page"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Seller Verification Tab */}
      {activeTab === "verification" && (
        <PendingVerifications ref={verificationRef} />
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div
          className="admin-modal-overlay"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="admin-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <h2>Add New User</h2>
                <p>Enter the details to create a user.</p>
              </div>

              <button
                className="admin-modal-close"
                onClick={() => setShowAddModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="admin-modal-form">
              <label>
                Full Name
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(event) =>
                    setNewUser({ ...newUser, name: event.target.value })
                  }
                  placeholder="Enter full name"
                />
              </label>

              <label>
                Email Address
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(event) =>
                    setNewUser({ ...newUser, email: event.target.value })
                  }
                  placeholder="Enter email address"
                />
              </label>

              <label>
                Phone Number
                <input
                  type="tel"
                  required
                  value={newUser.phone}
                  onChange={(event) =>
                    setNewUser({ ...newUser, phone: event.target.value })
                  }
                  placeholder="Enter phone number"
                />
              </label>

              <label>
                User Role
                <select
                  value={newUser.role}
                  onChange={(event) =>
                    setNewUser({ ...newUser, role: event.target.value })
                  }
                >
                  <option value="Buyer">Buyer</option>
                  <option value="Seller">Seller</option>
                </select>
              </label>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-btn admin-btn-outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="admin-btn admin-btn-primary">
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div
          className="admin-modal-overlay"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="admin-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <h2>Edit User</h2>
                <p>Update the user's account details.</p>
              </div>

              <button
                className="admin-modal-close"
                onClick={() => setShowEditModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="admin-modal-form">
              <label>
                Full Name
                <input
                  type="text"
                  required
                  value={selectedUser.name}
                  onChange={(event) =>
                    setSelectedUser({
                      ...selectedUser,
                      name: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Email Address
                <input
                  type="email"
                  required
                  value={selectedUser.email}
                  onChange={(event) =>
                    setSelectedUser({
                      ...selectedUser,
                      email: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Phone Number
                <input
                  type="tel"
                  required
                  value={selectedUser.phone}
                  onChange={(event) =>
                    setSelectedUser({
                      ...selectedUser,
                      phone: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                User Role
                <select
                  value={selectedUser.role}
                  onChange={(event) =>
                    setSelectedUser({
                      ...selectedUser,
                      role: event.target.value,
                    })
                  }
                >
                  <option value="Buyer">Buyer</option>
                  <option value="Seller">Seller</option>
                </select>
              </label>

              <label>
                Account Status
                <select
                  value={selectedUser.status}
                  onChange={(event) =>
                    setSelectedUser({
                      ...selectedUser,
                      status: event.target.value,
                    })
                  }
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </label>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-btn admin-btn-outline"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="admin-btn admin-btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {selectedUser && !showEditModal && !showAddModal && (
        <div
          className="admin-modal-overlay"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="admin-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <h2>User Details</h2>
                <p>View the user's account information.</p>
              </div>

              <button
                className="admin-modal-close"
                onClick={() => setSelectedUser(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="user-details-modal">
              <div className="user-details-avatar">
                {selectedUser.name.charAt(0).toUpperCase()}
              </div>

              <h3>{selectedUser.name}</h3>
              <p>{selectedUser.email}</p>

              <div className="user-details-list">
                <div>
                  <span>Phone Number</span>
                  <strong>{selectedUser.phone}</strong>
                </div>

                <div>
                  <span>Role</span>
                  <strong>{selectedUser.role}</strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>{selectedUser.status}</strong>
                </div>

                <div>
                  <span>Joined Date</span>
                  <strong>{selectedUser.joined}</strong>
                </div>
              </div>

              <div className="user-details-status-actions">
                {selectedUser.status !== "Blocked" ? (
                  <button
                    className="admin-btn admin-btn-danger"
                    onClick={() => {
                      handleStatusChange(selectedUser.id, "Blocked");
                      setSelectedUser({
                        ...selectedUser,
                        status: "Blocked",
                      });
                    }}
                  >
                    Block User
                  </button>
                ) : (
                  <button
                    className="admin-btn admin-btn-primary"
                    onClick={() => {
                      handleStatusChange(selectedUser.id, "Active");
                      setSelectedUser({
                        ...selectedUser,
                        status: "Active",
                      });
                    }}
                  >
                    Unblock User
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
