import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Grid2X2,
  Image as ImageIcon,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import "./CategoryManagement.css";

const initialCategories = [
  {
    id: "CAT001",
    name: "Electronics",
    description: "Mobiles, Laptops, Cameras...",
    subcategories: 8,
    products: 124,
    status: "Active",
    date: "10 Sep, 2026",
    icon: "💻",
  },
  {
    id: "CAT002",
    name: "Home & Furniture",
    description: "Furniture, Decor, Appliances...",
    subcategories: 6,
    products: 98,
    status: "Active",
    date: "9 Sep, 2026",
    icon: "🛋️",
  },
  {
    id: "CAT003",
    name: "Fashion & Jewellery",
    description: "Clothing, Footwear, Jewellery...",
    subcategories: 7,
    products: 156,
    status: "Active",
    date: "8 Sep, 2026",
    icon: "📿",
  },
  {
    id: "CAT004",
    name: "Sports & Fitness",
    description: "Sports Equipment, Fitness...",
    subcategories: 5,
    products: 76,
    status: "Active",
    date: "7 Sep, 2026",
    icon: "🏀",
  },
  {
    id: "CAT005",
    name: "Vehicles",
    description: "Cars, Bikes, Commercial...",
    subcategories: 4,
    products: 63,
    status: "Inactive",
    date: "6 Sep, 2026",
    icon: "🚙",
  },
  {
    id: "CAT006",
    name: "Art & Collectibles",
    description: "Paintings, Antiques, Collectibles...",
    subcategories: 6,
    products: 89,
    status: "Active",
    date: "5 Sep, 2026",
    icon: "🎨",
  },
  {
    id: "CAT007",
    name: "Cameras & Photography",
    description: "Cameras, Lenses, Accessories...",
    subcategories: 4,
    products: 72,
    status: "Active",
    date: "4 Sep, 2026",
    icon: "📷",
  },
  {
    id: "CAT008",
    name: "Gaming",
    description: "Consoles, Games, Accessories...",
    subcategories: 5,
    products: 68,
    status: "Active",
    date: "3 Sep, 2026",
    icon: "🎮",
  },
  {
    id: "CAT009",
    name: "Industrial Equipment",
    description: "Machinery, Tools, Heavy Equipment...",
    subcategories: 3,
    products: 41,
    status: "Inactive",
    date: "2 Sep, 2026",
    icon: "🛠️",
  },
  {
    id: "CAT010",
    name: "Charity & Social Causes",
    description: "Donations, Fundraising Items...",
    subcategories: 2,
    products: 18,
    status: "Active",
    date: "1 Sep, 2026",
    icon: "❤️",
  },
];

const emptyForm = {
  name: "",
  description: "",
  status: "Active",
  icon: "",
};

function CategoryManagement() {
  const [categories, setCategories] = useState(initialCategories);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [mode, setMode] = useState("add");
  const [page, setPage] = useState(1);

  const filteredCategories = categories.filter((category) => {
    const matchesSearch =
      category.name.toLowerCase().includes(search.toLowerCase()) ||
      category.id.toLowerCase().includes(search.toLowerCase()) ||
      category.description.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All Status" || category.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pageSize = 10;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredCategories.length / pageSize),
  );

  const paginatedCategories = filteredCategories.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const openAddForm = () => {
    setMode("add");
    setForm(emptyForm);
    setSelectedCategory(null);
  };

  const openEditForm = (category) => {
    setMode("edit");
    setSelectedCategory(category);
    setForm({
      name: category.name,
      description: category.description,
      status: category.status,
      icon: category.icon,
    });
  };

  const handleSave = (event) => {
    event.preventDefault();

    if (!form.name.trim()) return;

    if (mode === "edit" && selectedCategory) {
      setCategories((previous) =>
        previous.map((category) =>
          category.id === selectedCategory.id
            ? {
                ...category,
                name: form.name,
                description: form.description,
                status: form.status,
                icon: form.icon || category.icon,
              }
            : category,
        ),
      );
    } else {
      const newCategory = {
        id: `CAT${String(categories.length + 1).padStart(3, "0")}`,
        name: form.name,
        description: form.description,
        subcategories: 0,
        products: 0,
        status: form.status,
        date: new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        icon: form.icon || "📦",
      };

      setCategories((previous) => [newCategory, ...previous]);
    }

    setForm(emptyForm);
    setSelectedCategory(null);
    setMode("add");
  };

  const handleDelete = (category) => {
    const confirmed = window.confirm(`Delete category "${category.name}"?`);

    if (confirmed) {
      setCategories((previous) =>
        previous.filter((item) => item.id !== category.id),
      );
    }
  };

  const handleView = (category) => {
    setSelectedCategory(category);
    setMode("view");
    setForm({
      name: category.name,
      description: category.description,
      status: category.status,
      icon: category.icon,
    });
  };

  const closePanel = () => {
    setSelectedCategory(null);
    setMode("add");
    setForm(emptyForm);
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All Status");
    setPage(1);
  };

  return (
    <div className="category-management">
      <div className="category-page-header">
        <div>
          <h1>Categories Management</h1>
          <p>
            Manage product categories for auctions. Add, edit, or organize
            categories and subcategories.
          </p>
        </div>

        <div className="category-date">
          <span>▦</span>
          Fri, 11 Sep, 2026
        </div>
      </div>

      {/* Statistics */}
      <div className="category-stats">
        <div className="category-stat-card stat-green">
          <div className="category-stat-icon">
            <Grid2X2 size={30} />
          </div>
          <div>
            <p>Total Categories</p>
            <h2>{categories.length + 2}</h2>
          </div>
          <div className="category-stat-change">
            <strong>↑ 20%</strong>
            <span>vs last month</span>
          </div>
        </div>

        <div className="category-stat-card stat-blue">
          <div className="category-stat-icon">
            <span>▣</span>
          </div>
          <div>
            <p>Active Categories</p>
            <h2>
              {categories.filter((item) => item.status === "Active").length}
            </h2>
          </div>
          <div className="category-stat-change">
            <strong>↑ 11%</strong>
            <span>vs last month</span>
          </div>
        </div>

        <div className="category-stat-card stat-orange">
          <div className="category-stat-icon">◷</div>
          <div>
            <p>Inactive Categories</p>
            <h2>
              {categories.filter((item) => item.status === "Inactive").length}
            </h2>
          </div>
          <div className="category-stat-change negative">
            <strong>↑ 50%</strong>
            <span>vs last month</span>
          </div>
        </div>

        <div className="category-stat-card stat-purple">
          <div className="category-stat-icon">▱</div>
          <div>
            <p>Total Subcategories</p>
            <h2>
              {categories.reduce(
                (total, item) => total + item.subcategories,
                0,
              )}
            </h2>
          </div>
          <div className="category-stat-change">
            <strong>↑ 16%</strong>
            <span>vs last month</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="category-content">
        <div className="category-toolbar">
          <div className="category-search">
            <Search size={19} />
            <input
              type="text"
              placeholder="Search category name, ID, or description..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="category-filter">
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <ChevronDown size={16} />
          </div>

          <button className="category-reset-btn" onClick={resetFilters}>
            <RotateCcw size={17} />
            Reset
          </button>

          <button className="category-add-btn" onClick={openAddForm}>
            <Plus size={20} />
            Add Category
          </button>
        </div>

        <div className="category-main-layout">
          {/* Category Table */}
          <div className="category-table-section">
            <div className="category-table-scroll">
              <table className="category-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        aria-label="Select all categories"
                      />
                    </th>
                    <th>Category</th>
                    <th>Category ID</th>
                    <th>Subcategories</th>
                    <th>Products</th>
                    <th>Status</th>
                    <th>Created Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedCategories.map((category) => (
                    <tr key={category.id}>
                      <td>
                        <input
                          type="checkbox"
                          aria-label={`Select ${category.name}`}
                        />
                      </td>

                      <td>
                        <div className="category-name-cell">
                          <div className="category-image">{category.icon}</div>
                          <div>
                            <strong>{category.name}</strong>
                            <span>{category.description}</span>
                          </div>
                        </div>
                      </td>

                      <td>{category.id}</td>
                      <td>{category.subcategories}</td>
                      <td>{category.products}</td>

                      <td>
                        <span
                          className={`category-status ${
                            category.status === "Active"
                              ? "status-active"
                              : "status-inactive"
                          }`}
                        >
                          <i />
                          {category.status}
                        </span>
                      </td>

                      <td>{category.date}</td>

                      <td>
                        <div className="category-actions">
                          <button
                            title="View"
                            onClick={() => handleView(category)}
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            title="Edit"
                            onClick={() => openEditForm(category)}
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            title="Delete"
                            onClick={() => handleDelete(category)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {paginatedCategories.length === 0 && (
                    <tr>
                      <td colSpan="8" className="category-empty">
                        No categories found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="category-pagination">
              <span>
                Showing{" "}
                {filteredCategories.length ? (page - 1) * pageSize + 1 : 0}–
                {Math.min(page * pageSize, filteredCategories.length)} of{" "}
                {filteredCategories.length} categories
              </span>

              <div className="category-page-buttons">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((previous) => previous - 1)}
                >
                  <ChevronLeft size={18} />
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1)
                  .slice(0, 3)
                  .map((pageNumber) => (
                    <button
                      key={pageNumber}
                      className={page === pageNumber ? "active" : ""}
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  ))}

                {totalPages > 3 && <span>...</span>}

                {totalPages > 3 && (
                  <button onClick={() => setPage(totalPages)}>
                    {totalPages}
                  </button>
                )}

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((previous) => previous + 1)}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Add / Edit / View Panel */}
          <aside className="category-form-panel">
            <div className="category-panel-header">
              <h2>
                {mode === "view"
                  ? "Category Details"
                  : mode === "edit"
                    ? "Edit Category"
                    : "Add / Edit Category"}
              </h2>

              <button onClick={closePanel} title="Close panel">
                <X size={19} />
              </button>
            </div>

            {mode === "view" && selectedCategory && (
              <div className="category-view-details">
                <div className="category-view-image">
                  {selectedCategory.icon}
                </div>
                <h3>{selectedCategory.name}</h3>
                <p>{selectedCategory.description}</p>
                <p>
                  <strong>Category ID:</strong> {selectedCategory.id}
                </p>
                <p>
                  <strong>Subcategories:</strong>{" "}
                  {selectedCategory.subcategories}
                </p>
                <p>
                  <strong>Products:</strong> {selectedCategory.products}
                </p>
                <p>
                  <strong>Status:</strong> {selectedCategory.status}
                </p>
                <button
                  className="category-add-btn category-view-edit"
                  onClick={() => openEditForm(selectedCategory)}
                >
                  <Pencil size={16} />
                  Edit Category
                </button>
              </div>
            )}

            {mode !== "view" && (
              <>
                <div className="category-form-tabs">
                  <button
                    className={mode === "add" ? "active" : ""}
                    onClick={openAddForm}
                  >
                    Add Category
                  </button>
                  <button
                    className={mode === "edit" ? "active" : ""}
                    onClick={() => {
                      if (selectedCategory) {
                        openEditForm(selectedCategory);
                      }
                    }}
                    disabled={!selectedCategory}
                  >
                    Edit Category
                  </button>
                </div>

                <form className="category-form" onSubmit={handleSave}>
                  <label>
                    Category Name <b>*</b>
                    <input
                      type="text"
                      placeholder="Enter category name"
                      value={form.name}
                      onChange={(event) =>
                        setForm({ ...form, name: event.target.value })
                      }
                      required
                    />
                  </label>

                  <label>
                    Category Description
                    <textarea
                      placeholder="Enter description"
                      rows="4"
                      value={form.description}
                      onChange={(event) =>
                        setForm({ ...form, description: event.target.value })
                      }
                    />
                  </label>

                  <label>
                    Category Image
                    <div className="category-upload">
                      <ImageIcon size={30} />
                      <span>Click to upload image</span>
                      <small>PNG, JPG (Max 2MB)</small>
                      <input
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) {
                            setForm({ ...form, icon: "🖼️" });
                          }
                        }}
                      />
                    </div>
                  </label>

                  <label>
                    Status <b>*</b>
                    <div className="category-status-select">
                      <select
                        value={form.status}
                        onChange={(event) =>
                          setForm({ ...form, status: event.target.value })
                        }
                      >
                        <option>Active</option>
                        <option>Inactive</option>
                      </select>
                      <ChevronDown size={16} />
                    </div>
                  </label>

                  <div className="category-form-actions">
                    <button
                      type="button"
                      className="category-cancel-btn"
                      onClick={closePanel}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="category-save-btn">
                      Save Category
                    </button>
                  </div>
                </form>
              </>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

export default CategoryManagement;
