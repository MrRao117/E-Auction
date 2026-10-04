import {
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Filter,
  Search,
  ShieldCheck,
  UserCheck,
  X,
  XCircle,
} from "lucide-react";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";

import { getKycByStatus, updateKycStatus } from "../../api/kyc/kycApi";

import "./PendingVerification.css";

const PendingSellerVerification = forwardRef(
  function PendingSellerVerification(_props, ref) {
    const [sellers, setSellers] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [selectedSeller, setSelectedSeller] = useState(null);
    const [remarks, setRemarks] = useState("");

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");

    // ==========================================
    // FORMAT DATE
    // ==========================================

    const formatDate = (dateValue) => {
      if (!dateValue) return "-";

      const date = new Date(dateValue);

      if (Number.isNaN(date.getTime())) {
        return dateValue;
      }

      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    };

    // ==========================================
    // MAP BACKEND STATUS TO UI STATUS
    // ==========================================

    const mapStatus = (status) => {
      switch (status) {
        case "PENDING":
          return "Pending";

        case "VERIFIED":
          return "Approved";

        case "REJECTED":
          return "Rejected";

        default:
          return status || "Pending";
      }
    };

    // ==========================================
    // MAP BACKEND KYC RESPONSE
    // ==========================================

    const mapKycResponse = (kyc) => ({
      id: kyc.kycId,
      name: kyc.userEmail || "Unknown User",
      email: kyc.userEmail || "-",
      phone: "-",
      businessName: "-",
      businessType: "-",
      location: "-",
      documentType: kyc.documentType || "-",
      documentNumber: kyc.documentNumber || "-",
      submittedDate: formatDate(kyc.submittedAt),
      status: mapStatus(kyc.verificationStatus),
      backendStatus: kyc.verificationStatus,
      description: "-",
      remarks: kyc.remarks || "",
    });

    // ==========================================
    // FETCH ALL KYC REQUESTS
    // ==========================================

    const fetchKycs = useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const [pendingResponse, verifiedResponse, rejectedResponse] =
          await Promise.all([
            getKycByStatus("PENDING"),
            getKycByStatus("VERIFIED"),
            getKycByStatus("REJECTED"),
          ]);

        const pending = Array.isArray(pendingResponse) ? pendingResponse : [];

        const verified = Array.isArray(verifiedResponse)
          ? verifiedResponse
          : [];

        const rejected = Array.isArray(rejectedResponse)
          ? rejectedResponse
          : [];

        const allKycs = [...pending, ...verified, ...rejected];

        const mappedKycs = allKycs.map(mapKycResponse);

        // Sort by latest submitted date
        mappedKycs.sort((a, b) => {
          const dateA = new Date(a.submittedDate);
          const dateB = new Date(b.submittedDate);

          return dateB - dateA;
        });

        setSellers(mappedKycs);
      } catch (err) {
        console.error("Failed to fetch KYC requests:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load seller verification requests. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    }, []);

    // ==========================================
    // LOAD DATA ON COMPONENT MOUNT
    // ==========================================

    useEffect(() => {
      fetchKycs();
    }, [fetchKycs]);

    // ==========================================
    // STATISTICS
    // ==========================================

    const pendingCount = sellers.filter(
      (seller) => seller.status === "Pending",
    ).length;

    const underReviewCount = sellers.filter(
      (seller) => seller.status === "Under Review",
    ).length;

    const approvedCount = sellers.filter(
      (seller) => seller.status === "Approved",
    ).length;

    const rejectedCount = sellers.filter(
      (seller) => seller.status === "Rejected",
    ).length;

    // ==========================================
    // SEARCH AND FILTER
    // ==========================================

    const filteredSellers = sellers.filter((seller) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        String(seller.id).toLowerCase().includes(search) ||
        seller.name.toLowerCase().includes(search) ||
        seller.email.toLowerCase().includes(search) ||
        seller.documentType.toLowerCase().includes(search) ||
        seller.documentNumber.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "All" || seller.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // ==========================================
    // STATUS CSS CLASS
    // ==========================================

    const getStatusClass = (status) => {
      switch (status) {
        case "Approved":
          return "status-badge status-success";

        case "Pending":
          return "status-badge status-warning";

        case "Under Review":
          return "status-badge status-info";

        case "Rejected":
          return "status-badge status-danger";

        default:
          return "status-badge";
      }
    };

    // ==========================================
    // OPEN SELLER DETAILS
    // ==========================================

    const openSellerDetails = (seller) => {
      setSelectedSeller(seller);
      setRemarks(seller.remarks || "");
      setError("");
    };

    // ==========================================
    // UPDATE KYC STATUS
    // ==========================================

    const handleStatusUpdate = async (newStatus) => {
      if (!selectedSeller) return;

      if (newStatus === "REJECTED" && !remarks.trim()) {
        alert("Please enter a reason for rejection.");
        return;
      }

      setActionLoading(true);
      setError("");

      try {
        const response = await updateKycStatus(selectedSeller.id, {
          status: newStatus,
          remarks: remarks.trim(),
        });

        const updatedKyc = response;

        const updatedSeller = mapKycResponse(updatedKyc);

        setSellers((previousSellers) =>
          previousSellers.map((seller) =>
            seller.id === updatedSeller.id ? updatedSeller : seller,
          ),
        );

        setSelectedSeller(null);
        setRemarks("");

        alert(
          newStatus === "VERIFIED"
            ? "Seller KYC approved successfully."
            : "Seller KYC rejected successfully.",
        );

        // Refresh data from the backend
        await fetchKycs();
      } catch (err) {
        console.error("Failed to update KYC status:", err);

        setError(
          err.response?.data?.message ||
            "Failed to update verification status. Please try again.",
        );
      } finally {
        setActionLoading(false);
      }
    };

    // ==========================================
    // APPROVE SELLER
    // ==========================================

    const handleApproval = async () => {
      await handleStatusUpdate("VERIFIED");
    };

    // ==========================================
    // REJECT SELLER
    // ==========================================

    const handleRejection = async () => {
      await handleStatusUpdate("REJECTED");
    };

    // ==========================================
    // EXPORT FILTERED RECORDS TO CSV
    // ==========================================

    const exportCSV = () => {
      const headers = [
        "KYC ID",
        "Email",
        "Document Type",
        "Document Number",
        "Submitted Date",
        "Status",
        "Remarks",
      ];

      const rows = filteredSellers.map((seller) => [
        seller.id,
        seller.email,
        seller.documentType,
        seller.documentNumber,
        seller.submittedDate,
        seller.status,
        seller.remarks,
      ]);

      const csv = [headers, ...rows]
        .map((row) =>
          row
            .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
            .join(","),
        )
        .join("\n");

      const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "seller-verification.csv";
      link.click();

      URL.revokeObjectURL(url);
    };

    // ==========================================
    // EXPOSE CSV EXPORT TO USER MANAGEMENT
    // ==========================================

    useImperativeHandle(ref, () => ({
      exportCSV,
    }));

    // ==========================================
    // RENDER
    // ==========================================

    return (
      <div className="admin-page pending-seller-verification">
        {/* Statistics */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-icon">
              <Clock size={22} />
            </div>

            <div>
              <p>Pending Requests</p>
              <h2>{pendingCount}</h2>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon">
              <ShieldCheck size={22} />
            </div>

            <div>
              <p>Under Review</p>
              <h2>{underReviewCount}</h2>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon">
              <CheckCircle size={22} />
            </div>

            <div>
              <p>Approved Sellers</p>
              <h2>{approvedCount}</h2>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon">
              <XCircle size={22} />
            </div>

            <div>
              <p>Rejected Requests</p>
              <h2>{rejectedCount}</h2>
            </div>
          </div>
        </div>

        {/* Seller Table */}
        <div className="admin-table-container">
          <div className="admin-table-header">
            <div>
              <h2>Seller Verification Requests</h2>
              <p>Review and manage seller KYC applications.</p>
            </div>

            <div className="admin-table-actions">
              <div className="admin-search-box">
                <Search size={18} />

                <input
                  type="text"
                  placeholder="Search sellers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="admin-filter-box">
                <Filter size={17} />

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && <div className="admin-error-message">{error}</div>}

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Seller ID</th>
                  <th>Seller Name</th>
                  <th>Business Name</th>
                  <th>Business Type</th>
                  <th>Document</th>
                  <th>Submitted Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="admin-empty-state">
                      Loading seller verification requests...
                    </td>
                  </tr>
                ) : filteredSellers.length > 0 ? (
                  filteredSellers.map((seller) => (
                    <tr key={seller.id}>
                      <td>
                        <strong>{seller.id}</strong>
                      </td>

                      <td>
                        <div className="admin-seller-info">
                          <strong>{seller.name}</strong>
                          <span>{seller.email}</span>
                        </div>
                      </td>

                      <td>{seller.businessName}</td>

                      <td>{seller.businessType}</td>

                      <td>
                        <span className="admin-document-type">
                          <FileText size={15} />
                          {seller.documentType}
                        </span>
                      </td>

                      <td>{seller.submittedDate}</td>

                      <td>
                        <span className={getStatusClass(seller.status)}>
                          {seller.status}
                        </span>
                      </td>

                      <td>
                        <button
                          className="admin-icon-btn"
                          title="View Seller Details"
                          onClick={() => openSellerDetails(seller)}
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="admin-empty-state">
                      No seller verification requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="admin-table-footer">
            <p>
              Showing {filteredSellers.length} of {sellers.length} sellers
            </p>
          </div>
        </div>

        {/* Seller Details Modal */}
        {selectedSeller && (
          <div
            className="admin-modal-overlay"
            onClick={() => {
              if (!actionLoading) {
                setSelectedSeller(null);
              }
            }}
          >
            <div
              className="admin-modal seller-verification-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-modal-header">
                <div>
                  <h2>Seller Verification Details</h2>
                  <p>{selectedSeller.id}</p>
                </div>

                <button
                  className="admin-icon-btn"
                  onClick={() => setSelectedSeller(null)}
                  disabled={actionLoading}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="admin-modal-body">
                {/* Personal Information */}
                <div className="admin-detail-section">
                  <h3>
                    <UserCheck size={18} />
                    Personal Information
                  </h3>

                  <div className="admin-detail-grid">
                    <div>
                      <span>Seller Name</span>
                      <strong>{selectedSeller.name}</strong>
                    </div>

                    <div>
                      <span>Email Address</span>
                      <strong>{selectedSeller.email}</strong>
                    </div>

                    <div>
                      <span>Phone Number</span>
                      <strong>{selectedSeller.phone}</strong>
                    </div>

                    <div>
                      <span>Location</span>
                      <strong>{selectedSeller.location}</strong>
                    </div>
                  </div>
                </div>

                {/* Business Information */}
                <div className="admin-detail-section">
                  <h3>Business Information</h3>

                  <div className="admin-detail-grid">
                    <div>
                      <span>Business Name</span>
                      <strong>{selectedSeller.businessName}</strong>
                    </div>

                    <div>
                      <span>Business Type</span>
                      <strong>{selectedSeller.businessType}</strong>
                    </div>

                    <div>
                      <span>Business Description</span>
                      <strong>{selectedSeller.description}</strong>
                    </div>
                  </div>
                </div>

                {/* KYC Document Details */}
                <div className="admin-detail-section">
                  <h3>
                    <FileText size={18} />
                    KYC Document Details
                  </h3>

                  <div className="admin-detail-grid">
                    <div>
                      <span>Document Type</span>
                      <strong>{selectedSeller.documentType}</strong>
                    </div>

                    <div>
                      <span>Document Number</span>
                      <strong>{selectedSeller.documentNumber}</strong>
                    </div>

                    <div>
                      <span>Submitted Date</span>
                      <strong>{selectedSeller.submittedDate}</strong>
                    </div>
                  </div>
                </div>

                {/* Verification Status */}
                <div className="admin-detail-section">
                  <h3>Verification Status</h3>

                  <span className={getStatusClass(selectedSeller.status)}>
                    {selectedSeller.status}
                  </span>
                </div>

                {/* Admin Remarks */}
                <div className="admin-detail-section">
                  <h3>Admin Remarks</h3>

                  <textarea
                    className="admin-form-input admin-textarea"
                    rows="4"
                    placeholder="Enter verification notes or rejection reason..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    disabled={
                      actionLoading ||
                      selectedSeller.status === "Approved" ||
                      selectedSeller.status === "Rejected"
                    }
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="admin-modal-footer">
                <button
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setSelectedSeller(null)}
                  disabled={actionLoading}
                >
                  Close
                </button>

                <button
                  className="admin-btn admin-btn-danger"
                  onClick={handleRejection}
                  disabled={
                    actionLoading ||
                    selectedSeller.status === "Rejected" ||
                    selectedSeller.status === "Approved"
                  }
                >
                  <XCircle size={18} />
                  {actionLoading ? "Processing..." : "Reject"}
                </button>

                <button
                  className="admin-btn admin-btn-primary"
                  onClick={handleApproval}
                  disabled={
                    actionLoading ||
                    selectedSeller.status === "Approved" ||
                    selectedSeller.status === "Rejected"
                  }
                >
                  <CheckCircle size={18} />
                  {actionLoading ? "Processing..." : "Approve Seller"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);

export default PendingSellerVerification;
