import {
  ArrowDownWideNarrow,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Package,
  Plus,
  RotateCcw,
  Search,
  X,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getProductById,
  getUnverifiedProducts,
  verifyProduct,
} from "../../api/product/productApi";
import "./ProductVerification.css";

const mapApiProduct = (item) => {
  const photoString = item.imageUrl || item.imageURL || "";
  const photos =
    typeof photoString === "string"
      ? photoString
          .split(",")
          .map((url) => url.trim())
          .filter(Boolean)
          .slice(0, 5)
      : [];
  const isVerified = Boolean(item.isVerified);

  return {
    id: String(item.productId ?? item.id ?? ""),
    name: item.pname || item.productName || item.name || "Untitled product",
    subtitle: item.description || "—",
    seller: item.sellerEmail || item.sellerName || "—",
    sellerName: item.sellerName || item.sellerEmail || "—",
    category: item.categoryName || "Uncategorized",
    date: item.createdAt
      ? new Date(item.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—",
    status:
      item.status === "Rejected" || item.status === "REJECTED"
        ? "Rejected"
        : isVerified
          ? "Approved"
          : "Pending",
    image: photos[0] || "📦",
    photos,
    basePrice: item.basePrice ?? "—",
    remarks: item.remarks || "",
    isVerified,
  };
};

const tabs = ["All Submissions", "Pending", "Approved", "Rejected"];

export default function ProductVerification() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("All Submissions");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [seller, setSeller] = useState("");
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const categories = useMemo(
    () => [
      ...new Set(products.map((product) => product.category).filter(Boolean)),
    ],
    [products],
  );

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getUnverifiedProducts();
      const rows = Array.isArray(response)
        ? response
        : response?.content || response?.products || [];
      setProducts(rows.map(mapApiProduct));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const pendingCount = products.filter(
    (product) => product.status === "Pending",
  ).length;

  const approvedCount = products.filter(
    (product) => product.status === "Approved",
  ).length;

  const rejectedCount = products.filter(
    (product) => product.status === "Rejected",
  ).length;

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesTab =
        activeTab === "All Submissions" || product.status === activeTab;

      const searchText = search.toLowerCase();

      const matchesSearch =
        product.name.toLowerCase().includes(searchText) ||
        product.id.toLowerCase().includes(searchText) ||
        product.seller.toLowerCase().includes(searchText) ||
        product.sellerName.toLowerCase().includes(searchText);

      const matchesCategory = !category || product.category === category;

      const matchesStatus = !status || product.status === status;

      const matchesSeller = !seller || product.seller === seller;

      return (
        matchesTab &&
        matchesSearch &&
        matchesCategory &&
        matchesStatus &&
        matchesSeller
      );
    });
  }, [products, activeTab, search, category, status, seller]);

  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));

  const currentProducts = filteredProducts.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const updateProductStatus = async (id, newStatus) => {
    setError("");
    const product = products.find((item) => item.id === id);
    if (!product) return;

    try {
      const response = await verifyProduct(id, {
        isVerified: newStatus === "Approved",
        remarks: newStatus === "Rejected" ? "Rejected by administrator" : "",
      });

      const updatedProduct = response
        ? mapApiProduct(response)
        : {
            ...product,
            status: newStatus,
            isVerified: newStatus === "Approved",
            remarks:
              newStatus === "Rejected" ? "Rejected by administrator" : "",
          };

      setProducts((previous) =>
        previous.map((item) => (item.id === id ? updatedProduct : item)),
      );

      if (selectedProduct?.id === id) {
        setSelectedProduct(updatedProduct);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Unable to ${newStatus.toLowerCase()} product.`,
      );
    }
  };

  const handleViewProduct = async (product) => {
    setError("");
    try {
      const response = await getProductById(product.id);
      setSelectedProduct(mapApiProduct(response));
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load product details.",
      );
      setSelectedProduct(product);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setCategory("");
    setStatus("");
    setSeller("");
    setActiveTab("All Submissions");
    setPage(1);
  };

  const changeTab = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleFilter = (setter, value) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="product-verification-page">
      {/* Page Heading */}
      <div className="pv-page-heading">
        <div>
          <h1>Product Verification</h1>
          <p>
            Review and verify products submitted by sellers before they go live
            on the platform.
          </p>
        </div>

        <div className="pv-date">
          <span className="pv-calendar-icon">▦</span>
          {new Date().toLocaleDateString("en-IN", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </div>
      </div>

      {error && <p role="alert">{error}</p>}

      {/* Summary Cards */}
      <div className="pv-stats-grid">
        <div className="pv-stat-card pv-stat-green">
          <div className="pv-stat-icon">
            <Package size={30} />
          </div>
          <div className="pv-stat-info">
            <span>Total Submissions</span>
            <div className="pv-stat-value">{products.length}</div>
          </div>
        </div>

        <div className="pv-stat-card pv-stat-blue">
          <div className="pv-stat-icon">
            <CheckCircle size={30} />
          </div>
          <div className="pv-stat-info">
            <span>Approved Products</span>
            <div className="pv-stat-value">{approvedCount}</div>
          </div>
        </div>

        <div className="pv-stat-card pv-stat-orange">
          <div className="pv-stat-icon">
            <Clock size={30} />
          </div>
          <div className="pv-stat-info">
            <span>Pending Review</span>
            <div className="pv-stat-value">{pendingCount}</div>
          </div>
        </div>

        <div className="pv-stat-card pv-stat-red">
          <div className="pv-stat-icon">
            <XCircle size={30} />
          </div>
          <div className="pv-stat-info">
            <span>Rejected Products</span>
            <div className="pv-stat-value">{rejectedCount}</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="pv-main-card">
        {/* Tabs */}
        <div className="pv-tabs">
          {tabs.map((tab) => {
            const count =
              tab === "All Submissions"
                ? products.length
                : tab === "Pending"
                  ? pendingCount
                  : tab === "Approved"
                    ? approvedCount
                    : rejectedCount;

            return (
              <button
                type="button"
                key={tab}
                className={`pv-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => changeTab(tab)}
              >
                {tab} ({count})
              </button>
            );
          })}

          <button
            type="button"
            className="pv-add-button"
            onClick={() => alert("Add Product feature")}
          >
            <Plus size={19} />
            Add Product
          </button>
        </div>

        {/* Filters */}
        <div className="pv-filter-bar">
          <div className="pv-search-box">
            <Search size={19} />
            <input
              type="text"
              placeholder="Search by product name, seller, or ID..."
              value={search}
              onChange={(event) => handleSearch(event.target.value)}
            />
          </div>

          <select
            value={category}
            onChange={(event) => handleFilter(setCategory, event.target.value)}
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {categories.map((categoryName) => (
              <option key={categoryName} value={categoryName}>
                {categoryName}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(event) => handleFilter(setStatus, event.target.value)}
            aria-label="Filter by status"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={seller}
            onChange={(event) => handleFilter(setSeller, event.target.value)}
            aria-label="Filter by seller"
          >
            <option value="">All Sellers</option>
            {[...new Set(products.map((product) => product.seller))].map(
              (sellerName) => (
                <option key={sellerName} value={sellerName}>
                  {sellerName}
                </option>
              ),
            )}
          </select>

          <button
            type="button"
            className="pv-reset-button"
            onClick={resetFilters}
          >
            <RotateCcw size={17} />
            Reset
          </button>
        </div>

        {/* Table */}
        <div className="pv-table-wrapper">
          <table className="pv-table">
            <thead>
              <tr>
                <th className="pv-checkbox-col">
                  <input type="checkbox" aria-label="Select all products" />
                </th>
                <th>Product</th>
                <th>Product ID</th>
                <th>Seller</th>
                <th>Category</th>
                <th>
                  Submitted Date <ArrowDownWideNarrow size={14} />
                </th>
                <th>Status</th>
                <th className="pv-actions-heading">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan="8" className="pv-empty-state">
                    Loading products...
                  </td>
                </tr>
              )}
              {!loading &&
                currentProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="pv-checkbox-col">
                      <input
                        type="checkbox"
                        aria-label={`Select ${product.name}`}
                      />
                    </td>

                    <td>
                      <div className="pv-product-cell">
                        <div className="pv-product-image">
                          {product.photos?.[0] ? (
                            <img src={product.photos[0]} alt={product.name} />
                          ) : (
                            product.image
                          )}
                        </div>
                        <div className="pv-product-details">
                          <strong>{product.name}</strong>
                          <span>{product.subtitle}</span>
                        </div>
                      </div>
                    </td>

                    <td className="pv-muted">{product.id}</td>

                    <td>
                      <div className="pv-seller-cell">
                        <div className="pv-seller-avatar">
                          {product.seller.charAt(0)}
                        </div>
                        <div>
                          <strong>{product.seller}</strong>
                          <span>{product.sellerName}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`pv-category-tag ${product.category
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {product.category}
                      </span>
                    </td>

                    <td className="pv-muted">{product.date}</td>

                    <td>
                      <span
                        className={`pv-status-badge ${product.status.toLowerCase()}`}
                      >
                        <span className="pv-status-dot" />
                        {product.status}
                      </span>
                    </td>

                    <td>
                      <div className="pv-row-actions">
                        <button
                          type="button"
                          className="pv-icon-button"
                          title="View product"
                          onClick={() => handleViewProduct(product)}
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          type="button"
                          className="pv-icon-button pv-approve-icon"
                          title="Approve product"
                          onClick={() =>
                            updateProductStatus(product.id, "Approved")
                          }
                        >
                          <Check size={19} />
                        </button>

                        <button
                          type="button"
                          className="pv-icon-button pv-reject-icon"
                          title="Reject product"
                          onClick={() =>
                            updateProductStatus(product.id, "Rejected")
                          }
                        >
                          <X size={19} />
                        </button>

                        {product.status === "Pending" ? (
                          <button
                            type="button"
                            className="pv-review-button"
                            onClick={() => handleViewProduct(product)}
                          >
                            Review
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="pv-review-button pv-view-button"
                            onClick={() => handleViewProduct(product)}
                          >
                            View
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

              {!loading && currentProducts.length === 0 && (
                <tr>
                  <td colSpan="8" className="pv-empty-state">
                    No products found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pv-pagination">
          <span>
            Showing{" "}
            {filteredProducts.length === 0 ? 0 : (page - 1) * pageSize + 1}–
            {Math.min(page * pageSize, filteredProducts.length)} of{" "}
            {filteredProducts.length} submissions
          </span>

          <div className="pv-pagination-controls">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft size={18} />
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1)
              .slice(0, 5)
              .map((number) => (
                <button
                  type="button"
                  key={number}
                  className={page === number ? "active" : ""}
                  onClick={() => setPage(number)}
                >
                  {number}
                </button>
              ))}

            {totalPages > 5 && <span>...</span>}

            <button
              type="button"
              disabled={page === totalPages}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              aria-label="Next page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div
          className="pv-modal-overlay"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="pv-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pv-modal-header">
              <h2>Product Details</h2>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                aria-label="Close dialog"
              >
                <X size={21} />
              </button>
            </div>

            <div className="pv-modal-product">
              <div className="pv-modal-product-image">
                {selectedProduct.photos?.[0] ? (
                  <img
                    src={selectedProduct.photos[0]}
                    alt={selectedProduct.name}
                  />
                ) : (
                  selectedProduct.image
                )}
              </div>
              <h3>{selectedProduct.name}</h3>
              <p>{selectedProduct.subtitle}</p>
              {selectedProduct.photos?.length > 1 && (
                <div>
                  {selectedProduct.photos.slice(1).map((photo, index) => (
                    <img
                      key={`${photo}-${index}`}
                      src={photo}
                      alt={`${selectedProduct.name} ${index + 2}`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="pv-modal-details">
              <div>
                <span>Product ID</span>
                <strong>{selectedProduct.id}</strong>
              </div>
              <div>
                <span>Seller</span>
                <strong>{selectedProduct.seller}</strong>
              </div>
              <div>
                <span>Seller Name</span>
                <strong>{selectedProduct.sellerName}</strong>
              </div>
              <div>
                <span>Category</span>
                <strong>{selectedProduct.category}</strong>
              </div>
              <div>
                <span>Base Price</span>
                <strong>{selectedProduct.basePrice}</strong>
              </div>
              <div>
                <span>Submitted Date</span>
                <strong>{selectedProduct.date}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong>{selectedProduct.status}</strong>
              </div>
            </div>

            <div className="pv-modal-actions">
              <button
                type="button"
                className="pv-modal-reject"
                onClick={async () => {
                  await updateProductStatus(selectedProduct.id, "Rejected");
                  setSelectedProduct(null);
                }}
              >
                <X size={17} /> Reject
              </button>
              <button
                type="button"
                className="pv-modal-approve"
                onClick={async () => {
                  await updateProductStatus(selectedProduct.id, "Approved");
                  setSelectedProduct(null);
                }}
              >
                <Check size={17} /> Approve Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
