import { useEffect, useRef, useState } from "react";
import { createAuction, getMyAuctions } from "../../api/auction/auctionApi";
import {
  createCategory,
  createProduct,
  getMyProducts,
  getProductCategories,
} from "../../api/product/productApi";

import "./CreateAuction.css";

export default function CreateAuction() {
  const [pageView, setPageView] = useState("listing"); // listing | add | auction
  const [useCustomCategory, setUseCustomCategory] = useState(false);
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [productImages, setProductImages] = useState([]);
  const [products, setProducts] = useState([]);
  const [assignedProductIds, setAssignedProductIds] = useState(() => new Set());
  const [selectedProductId, setSelectedProductId] = useState("");
  const [flowProductId, setFlowProductId] = useState(null);
  const [flowHasProduct, setFlowHasProduct] = useState(false);
  const [flowAuctionCreated, setFlowAuctionCreated] = useState(false);
  const [isCreatingAuction, setIsCreatingAuction] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const normalizeProduct = (item) => {
    const rawImages = item.imageUrl ?? item.images ?? item.productImages ?? [];
    const images = Array.isArray(rawImages)
      ? rawImages
      : typeof rawImages === "string" && rawImages.trim()
        ? (() => {
            const value = rawImages.trim();

            // New format: a JSON-serialized array of image URLs.
            try {
              const parsed = JSON.parse(value);
              if (Array.isArray(parsed)) {
                return parsed.filter(
                  (image) => typeof image === "string" && image.trim(),
                );
              }
            } catch {
              // Continue with legacy formats below.
            }

            // A data URL contains a comma after "base64"; keep it intact.
            if (/^data:image\//i.test(value)) {
              return [value];
            }

            // Legacy format for ordinary URLs (not Base64 data URLs).
            return value
              .split(",")
              .map((image) => image.trim())
              .filter(Boolean);
          })()
        : [];

    return {
      ...item,
      productId: item.productId ?? item.id ?? null,
      productName:
        item.pname ?? item.productName ?? item.name ?? "Unnamed Product",
      category:
        item.categoryName ??
        item.category?.categoryName ??
        item.category ??
        "—",
      basePrice: item.basePrice ?? 0,
      description: item.description ?? "",
      images,
      verificationStatus:
        item.verificationStatus ??
        item.status ??
        (item.isVerified === true ? "Verified" : "Pending"),
      verifiedBy: item.verifiedBy ?? null,
      verifiedAt: item.verifiedAt ?? null,
      remarks: item.remarks ?? "Product is waiting for admin verification.",
    };
  };

  const getImageSource = (image) => {
    if (typeof image === "string") return image;
    if (image instanceof File) return URL.createObjectURL(image);
    return "";
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await getProductCategories();
        const payload = response?.data ?? response;
        const categoryList = Array.isArray(payload)
          ? payload
          : (payload?.categories ?? payload?.content ?? payload?.data ?? []);
        setCategories(
          (Array.isArray(categoryList) ? categoryList : []).map((item) => ({
            ...item,
            categoryId: item.categoryId ?? item.id,
            categoryName: item.categoryName ?? item.name ?? "",
          })),
        );
      } catch (error) {
        console.error("Failed to load product categories:", error);
        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  const getListFromResponse = (response, keys = []) => {
    const payload = response?.data ?? response;
    if (Array.isArray(payload)) return payload;
    for (const key of keys) {
      if (Array.isArray(payload?.[key])) return payload[key];
    }
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  };

  const getAuctionProductId = (auctionItem) =>
    auctionItem?.productId ??
    auctionItem?.product?.productId ??
    auctionItem?.product?.id ??
    auctionItem?.product_id ??
    auctionItem?.product?.product_id ??
    null;

  const productAlreadyAssigned = (item) =>
    item?.isAssignedToAuction === true ||
    item?.assignedToAuction === true ||
    item?.auctionId != null ||
    item?.auction?.auctionId != null ||
    item?.auction?.id != null ||
    item?.auctionOrder?.auctionId != null;

  useEffect(() => {
    const loadMyProducts = async () => {
      try {
        setIsLoadingProducts(true);
        const [productsResponse, auctionsResponse] = await Promise.all([
          getMyProducts(),
          getMyAuctions(),
        ]);

        const productList = getListFromResponse(productsResponse, [
          "products",
          "content",
          "items",
        ]);
        const auctionList = getListFromResponse(auctionsResponse, [
          "auctions",
          "content",
          "items",
          "myAuctions",
        ]);

        const assignedIds = new Set(
          auctionList
            .map(getAuctionProductId)
            .filter((id) => id != null)
            .map(String),
        );

        productList.forEach((item) => {
          if (productAlreadyAssigned(item) && item.productId != null) {
            assignedIds.add(String(item.productId));
          }
        });

        setProducts(productList.map(normalizeProduct));
        setAssignedProductIds(assignedIds);
      } catch (error) {
        console.error("Failed to load seller products or auctions:", error);
        setProducts([]);
        setAssignedProductIds(new Set());
      } finally {
        setIsLoadingProducts(false);
      }
    };
    loadMyProducts();
  }, []);

  // Refresh the current-session product's verification status periodically
  // so the flow can move from Step 2 to Step 3 after admin verification.
  useEffect(() => {
    if (!flowHasProduct || flowProductId == null || flowAuctionCreated) return;

    let isMounted = true;
    const refreshProductStatus = async () => {
      try {
        const response = await getMyProducts();
        const productList = getListFromResponse(response, [
          "products",
          "content",
          "items",
        ]);
        const updatedProduct = productList
          .map(normalizeProduct)
          .find((item) => String(item.productId) === String(flowProductId));

        if (isMounted && updatedProduct) {
          setProducts((previous) =>
            previous.map((item) =>
              String(item.productId) === String(flowProductId)
                ? { ...item, ...updatedProduct }
                : item,
            ),
          );
        }
      } catch (error) {
        console.error("Failed to refresh product verification status:", error);
      }
    };

    const intervalId = window.setInterval(refreshProductStatus, 10000);
    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [flowHasProduct, flowProductId, flowAuctionCreated]);

  const auctionStartTimeRef = useRef(null);
  const auctionEndTimeRef = useRef(null);

  const [product, setProduct] = useState({
    productId: null,
    productName: "",
    category: "",
    basePrice: "",
    description: "",
  });

  const [auction, setAuction] = useState({
    title: "",
    startTime: "",
    endTime: "",
  });

  const handleCategoryToggle = () => {
    setUseCustomCategory((previous) => !previous);
    setCategory("");
  };

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files || []);

    if (files.length < 1) {
      alert("Please select at least 1 product photo.");
      setProductImages([]);
      return;
    }

    const validFiles = files.filter((file) => {
      const validType = ["image/jpeg", "image/jpg", "image/png"].includes(
        file.type,
      );
      const validSize = file.size <= 5 * 1024 * 1024;
      return validType && validSize;
    });

    if (validFiles.length < 1) {
      alert(
        "Please select at least 1 valid JPG, JPEG, or PNG photo. Each photo must be below 5MB.",
      );
      setProductImages([]);
      return;
    }

    setProductImages(validFiles);
  };

  const handleAddProduct = async () => {
    if (!product.productName.trim()) {
      alert("Please enter product name.");
      return;
    }

    if (!category.trim()) {
      alert("Please select or create a category.");
      return;
    }

    if (!product.basePrice || Number(product.basePrice) <= 0) {
      alert("Please enter a valid base price.");
      return;
    }

    if (!product.description.trim()) {
      alert("Please enter product description.");
      return;
    }

    if (productImages.length < 1) {
      alert("At least 1 product photo is required.");
      return;
    }

    // Convert the selected photos to data URLs for the JSON imageUrl field.
    const readFileAsDataUrl = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
        reader.readAsDataURL(file);
      });

    try {
      setIsAddingProduct(true);

      const imageUrls = await Promise.all(
        productImages.map((file) => readFileAsDataUrl(file)),
      );

      let categoryId;
      let resolvedCategoryName = "";

      if (useCustomCategory) {
        const requestedCategoryName = category.trim();

        // Reuse a category already loaded from the backend (case-insensitive).
        let existingCategory = categories.find(
          (item) =>
            String(item.categoryName ?? "")
              .trim()
              .toLowerCase() === requestedCategoryName.toLowerCase(),
        );

        if (existingCategory?.categoryId != null) {
          categoryId = Number(existingCategory.categoryId);
          resolvedCategoryName = existingCategory.categoryName;
        } else {
          try {
            const createdCategoryResponse = await createCategory({
              categoryName: requestedCategoryName,
            });
            const createdPayload =
              createdCategoryResponse?.data ?? createdCategoryResponse;
            const createdCategory =
              createdPayload?.category ??
              createdPayload?.data ??
              createdPayload;
            categoryId =
              createdCategory?.categoryId ??
              createdCategory?.id ??
              createdCategory?.category?.categoryId;
            resolvedCategoryName =
              createdCategory?.categoryName ?? requestedCategoryName;

            if (!categoryId) {
              throw new Error(
                "Category was created, but its category ID was not returned by the server.",
              );
            }

            const normalizedCreatedCategory = {
              ...createdCategory,
              categoryId: Number(categoryId),
              categoryName: resolvedCategoryName,
            };

            setCategories((previous) => {
              const alreadyAdded = previous.some(
                (item) => String(item.categoryId) === String(categoryId),
              );
              return alreadyAdded
                ? previous
                : [...previous, normalizedCreatedCategory];
            });
          } catch (createError) {
            // A 409 means the name already exists. Refresh categories and reuse its ID.
            if (createError?.response?.status !== 409) {
              throw createError;
            }

            try {
              const refreshedResponse = await getProductCategories();
              const refreshedPayload =
                refreshedResponse?.data ?? refreshedResponse;
              const refreshedList = Array.isArray(refreshedPayload)
                ? refreshedPayload
                : (refreshedPayload?.categories ??
                  refreshedPayload?.content ??
                  refreshedPayload?.data ??
                  []);

              const normalizedCategories = (
                Array.isArray(refreshedList) ? refreshedList : []
              ).map((item) => ({
                ...item,
                categoryId: item.categoryId ?? item.id,
                categoryName: item.categoryName ?? item.name ?? "",
              }));

              existingCategory = normalizedCategories.find(
                (item) =>
                  String(item.categoryName ?? "")
                    .trim()
                    .toLowerCase() === requestedCategoryName.toLowerCase(),
              );

              if (existingCategory?.categoryId == null) {
                throw new Error(
                  `The category "${requestedCategoryName}" already exists, but its ID could not be retrieved. Check the categories API and database connection.`,
                );
              }

              categoryId = Number(existingCategory.categoryId);
              resolvedCategoryName = existingCategory.categoryName;
              setCategories(normalizedCategories);
            } catch (refreshError) {
              if (
                refreshError?.message?.includes(
                  "already exists, but its ID could not be retrieved",
                )
              ) {
                throw refreshError;
              }
              throw new Error(
                `The category "${requestedCategoryName}" already exists (HTTP 409), but the categories list could not be loaded. Please fix GET /products/categories/all first.`,
              );
            }
          }
        }
      } else {
        categoryId = Number(category);
        resolvedCategoryName =
          categories.find(
            (item) => String(item.categoryId) === String(category),
          )?.categoryName ?? "";
      }

      if (!Number.isFinite(Number(categoryId)) || Number(categoryId) <= 0) {
        throw new Error("A valid category ID could not be resolved.");
      }

      const productData = {
        categoryId: Number(categoryId),
        pname: product.productName.trim(),
        basePrice: Number(product.basePrice),
        description: product.description.trim(),
        imageUrl: JSON.stringify(imageUrls),
      };

      const savedProduct = await createProduct(productData);

      const categoryNameForProduct =
        resolvedCategoryName ||
        (useCustomCategory
          ? category.trim()
          : (categories.find(
              (item) => String(item.categoryId) === String(category),
            )?.categoryName ?? category));

      const newProduct = normalizeProduct({
        ...savedProduct,
        productId: savedProduct.productId ?? savedProduct.id ?? null,
        pname:
          savedProduct.pname ??
          savedProduct.productName ??
          product.productName.trim(),
        categoryName:
          savedProduct.categoryName ??
          savedProduct.category?.categoryName ??
          categoryNameForProduct,
        basePrice: savedProduct.basePrice ?? Number(product.basePrice),
        description: savedProduct.description ?? product.description.trim(),
        images: [...productImages],
        isVerified: savedProduct.isVerified ?? false,
        remarks:
          savedProduct.remarks ?? "Product is waiting for admin verification.",
      });

      setProducts((previous) => [...previous, newProduct]);
      setFlowProductId(newProduct.productId);
      setFlowHasProduct(true);
      setFlowAuctionCreated(false);
      setProduct({
        productId: null,
        productName: "",
        category: "",
        basePrice: "",
        description: "",
      });
      setCategory("");
      setUseCustomCategory(false);
      setProductImages([]);
      setPageView("listing");
      alert("Product saved successfully and submitted for verification.");
    } catch (error) {
      console.error("Failed to add product:", error);
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save product. Please try again.",
      );
    } finally {
      setIsAddingProduct(false);
    }
  };

  const handleCreateAuction = async () => {
    if (!selectedProduct) {
      alert("Please select a verified product.");
      return;
    }

    if (
      String(selectedProduct.verificationStatus ?? "")
        .trim()
        .toLowerCase() !== "verified"
    ) {
      alert("This product has not been verified by the admin yet.");
      return;
    }

    if (!auction.startTime || !auction.endTime) {
      alert("Please select auction start and end times.");
      return;
    }

    if (new Date(auction.endTime) <= new Date(auction.startTime)) {
      alert("Auction end time must be after the start time.");
      return;
    }

    const formatDateTime = (dateTime) => {
      if (!dateTime) return null;

      // Add seconds to datetime-local values when they are omitted.
      const dateTimeWithSeconds =
        dateTime.length === 16 ? `${dateTime}:00` : dateTime;

      // The backend expects a space between the date and time.
      return dateTimeWithSeconds.replace("T", " ");
    };

    const auctionData = {
      productId: selectedProduct.productId,
      title: auction.title.trim() || selectedProduct.productName,
      startTime: formatDateTime(auction.startTime),
      endTime: formatDateTime(auction.endTime),
      bidIncrementedBy: Number(selectedProduct.basePrice),
    };

    try {
      setIsCreatingAuction(true);
      await createAuction(auctionData);

      // Keep the product record, but remove it from the auction selector.
      setAssignedProductIds((previous) => {
        const next = new Set(previous);
        next.add(String(selectedProduct.productId));
        return next;
      });
      if (String(flowProductId) === String(selectedProduct.productId)) {
        setFlowAuctionCreated(true);
      }
      setSelectedProductId("");
      setAuction({
        title: "",
        startTime: "",
        endTime: "",
      });

      setPageView("listing");
      alert("Auction created successfully.");
    } catch (error) {
      console.error("Failed to create auction:", error);
      alert(
        error?.response?.data?.message ||
          "Failed to create auction. Please try again.",
      );
    } finally {
      setIsCreatingAuction(false);
    }
  };

  const verifiedProducts = products.filter(
    (item) =>
      String(item.verificationStatus).trim().toLowerCase() === "verified" &&
      item.productId != null &&
      !assignedProductIds.has(String(item.productId)) &&
      !productAlreadyAssigned(item),
  );

  const selectedProduct = products.find(
    (item) => String(item.productId) === String(selectedProductId),
  );

  const auctionEnabled = Boolean(selectedProduct);

  // Flow progress is based only on the product added in this session,
  // not on older products loaded from the database.
  const flowProduct = products.find(
    (item) => String(item.productId) === String(flowProductId),
  );
  const flowProductIsVerified =
    String(flowProduct?.verificationStatus ?? "")
      .trim()
      .toLowerCase() === "verified";

  const currentFlowStep = !flowHasProduct
    ? 1
    : flowAuctionCreated
      ? 4
      : flowProductIsVerified
        ? 3
        : 2;

  const formatPrice = (price) => {
    if (!price) return "₹0";
    return `₹${Number(price).toLocaleString("en-IN")}`;
  };

  return (
    <div className="create-auction-page">
      {/* PAGE HEADING */}
      <div className="create-auction-heading">
        <div>
          <h1 style={{ fontSize: "22px" }}>
            {pageView === "listing"
              ? "Product Listing"
              : pageView === "add"
                ? "Add Product"
                : "Create Auction"}
          </h1>
          <p>
            {pageView === "listing"
              ? "Manage your products and track their verification status."
              : pageView === "add"
                ? "Add your product details. Your product will be reviewed by an admin."
                : "Create an auction only for a product verified by the admin."}
          </p>
        </div>
        {pageView === "listing" && (
          <button
            type="button"
            className="listing-add-product-button"
            onClick={() => setPageView("add")}
          >
            <span>+</span> Add Product
          </button>
        )}
        {pageView !== "listing" && (
          <button
            type="button"
            className="listing-back-button"
            onClick={() => setPageView("listing")}
          >
            ← Back to Product Listing
          </button>
        )}
      </div>

      {pageView === "add" && (
        <div className="create-auction-content add-product-only-content">
          {/* 
            LEFT FORM - ADD PRODUCT
        = */}
          <section className="create-product-card">
            <div className="create-section-header">
              <div className="create-section-number product-step-number">1</div>
              <div>
                <h2>Add Product Details</h2>
                <p>Provide accurate information about your product.</p>
              </div>
            </div>

            <div className="create-product-form">
              {/* PRODUCT NAME */}
              <div className="create-form-group">
                <label htmlFor="productName">
                  Product Name <span>*</span>
                </label>
                <input
                  id="productName"
                  type="text"
                  placeholder="Enter product name"
                  value={product.productName}
                  onChange={(event) =>
                    setProduct({
                      ...product,
                      productName: event.target.value,
                    })
                  }
                />
              </div>

              {/* CATEGORY */}
              <div className="create-form-group">
                <label htmlFor="productCategory">
                  Category <span>*</span>
                </label>

                <div className="category-input-row">
                  {useCustomCategory ? (
                    <input
                      id="productCategory"
                      type="text"
                      placeholder="Write category here"
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                    />
                  ) : (
                    <select
                      id="productCategory"
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                    >
                      <option value="" disabled>
                        {isLoadingCategories
                          ? "Loading categories..."
                          : "Select a category"}
                      </option>
                      {categories.map((item) => (
                        <option
                          key={item.categoryId}
                          value={String(item.categoryId)}
                        >
                          {item.categoryName}
                        </option>
                      ))}
                    </select>
                  )}

                  <button
                    type="button"
                    className="create-category-button"
                    onClick={handleCategoryToggle}
                  >
                    <span>+</span>
                    {useCustomCategory ? "Select Category" : "Create Category"}
                  </button>
                </div>
              </div>

              {/* BASE PRICE */}
              <div className="create-form-group">
                <label htmlFor="basePrice">
                  Base Price <span>*</span>
                </label>
                <div className="price-input-wrapper">
                  <span className="currency-symbol">₹</span>
                  <input
                    id="basePrice"
                    type="number"
                    min="0"
                    placeholder="Enter base price"
                    value={product.basePrice}
                    onChange={(event) =>
                      setProduct({
                        ...product,
                        basePrice: event.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="create-form-group">
                <label htmlFor="productDescription">
                  Description <span>*</span>
                </label>
                <textarea
                  id="productDescription"
                  rows="5"
                  placeholder="Provide a detailed description of your product..."
                  value={product.description}
                  onChange={(event) =>
                    setProduct({
                      ...product,
                      description: event.target.value,
                    })
                  }
                />
              </div>

              {/* PRODUCT PHOTOS */}
              <div className="create-form-group">
                <label htmlFor="productImages">
                  Product Photos <span>*</span>
                </label>

                <div className="product-image-upload">
                  <label htmlFor="productImages" className="upload-placeholder">
                    <div className="upload-icon">↥</div>
                    <strong>Click to upload product photos</strong>
                    <span>Select at least 1 photo</span>
                    <small>JPG, PNG, JPEG • Maximum 5MB per image</small>
                  </label>

                  <input
                    id="productImages"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    multiple
                    hidden
                    onChange={handleImageChange}
                  />
                </div>

                {productImages.length > 0 && (
                  <div
                    className={`photo-count ${
                      productImages.length >= 1 ? "photo-count-valid" : ""
                    }`}
                  >
                    {productImages.length} photos selected
                    {productImages.length >= 1
                      ? " ✓ Minimum requirement satisfied"
                      : " — At least 1 required"}
                  </div>
                )}

                {productImages.length > 0 && (
                  <div className="product-upload-previews">
                    {productImages.map((file, index) => (
                      <div
                        className="product-upload-preview"
                        key={`${file.name}-${index}`}
                      >
                        <img
                          src={getImageSource(file)}
                          alt={`Product ${index + 1}`}
                        />
                        <span>{index + 1}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                className="add-product-button"
                onClick={handleAddProduct}
                disabled={isAddingProduct}
              >
                <span>+</span>
                {isAddingProduct ? "Saving Product..." : "Add Product"}
              </button>
            </div>

            <div className="product-verification-notice">
              <div className="verification-notice-icon">◷</div>
              <div>
                <strong>Product will be reviewed by admin</strong>
                <p>
                  After adding the product, it will go through admin
                  verification. You will be notified once it is verified, and
                  then you can create the auction.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {pageView === "auction" && (
        <div className="create-auction-content auction-only-content">
          {/* 
            RIGHT FORM - AUCTION
        = */}
          <section className="create-auction-card">
            <div className="auction-form-panel">
              <div className="auction-verification-message">
                <div className="auction-message-icon">
                  {auctionEnabled ? "✓" : "!"}
                </div>
                <span>
                  {auctionEnabled
                    ? "This product is verified and ready for auction!"
                    : "Product verification is required before creating an auction."}
                </span>
              </div>

              <div className="auction-selected-product-section">
                <div
                  className="auction-product-gallery"
                  aria-label="Uploaded product photos"
                >
                  {selectedProduct?.images?.length ? (
                    selectedProduct.images.map((image, index) => (
                      <div
                        className="auction-product-gallery-image"
                        key={`${selectedProduct.productId}-image-${index}`}
                      >
                        <img
                          src={getImageSource(image)}
                          alt={`${selectedProduct.productName} photo ${index + 1}`}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="auction-product-gallery-empty">
                      No product photos available.
                    </div>
                  )}
                </div>

                <div className="verified-product-heading">
                  <label>
                    Verified Product <span>*</span>
                  </label>
                  <span className="verified-product-fixed-note">
                    Selected from your verified product listing
                  </span>
                </div>

                <div className="selected-product-card selected-product-inline-card">
                  <div className="selected-product-inline-item">
                    <span>Product Name</span>
                    <strong>
                      {selectedProduct?.productName || "No product selected"}
                    </strong>
                  </div>

                  <div className="selected-product-inline-item">
                    <span>Category</span>
                    <strong>{selectedProduct?.category || "—"}</strong>
                  </div>

                  <div className="selected-product-inline-item">
                    <span>Product ID</span>
                    <strong>{selectedProduct?.productId ?? "—"}</strong>
                  </div>

                  <div className="selected-product-inline-item selected-product-inline-status">
                    <span>Status</span>
                    <strong
                      className={`product-status ${selectedProduct ? "product-status-verified" : ""}`}
                    >
                      {selectedProduct ? "✓ Verified" : "Not selected"}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="auction-form">
                {/* TITLE */}
                <div className="create-form-group auction-title-group">
                  <label htmlFor="auctionTitle">Auction Title</label>
                  <input
                    id="auctionTitle"
                    type="text"
                    placeholder="Enter auction title"
                    value={auction.title}
                    disabled={!auctionEnabled}
                    onChange={(event) =>
                      setAuction({ ...auction, title: event.target.value })
                    }
                  />
                  <small>If left empty, the product name will be used.</small>
                </div>

                {/* BID INCREMENT - SAME AS SELECTED PRODUCT BASE PRICE */}
                <div className="create-form-group bid-increment-group">
                  <label htmlFor="bidIncrement">
                    Bid Increment (Same as Base Price)
                  </label>
                  <input
                    id="bidIncrement"
                    type="number"
                    value={selectedProduct?.basePrice ?? ""}
                    placeholder="Select a verified product"
                    disabled={!auctionEnabled}
                    readOnly
                  />
                </div>

                {/* START TIME */}
                <div className="create-form-group auction-start-group">
                  <label htmlFor="auctionStartTime">
                    Auction Start Time <span>*</span>
                  </label>
                  <div
                    className="datetime-input-wrapper"
                    onClick={() => auctionStartTimeRef.current?.showPicker?.()}
                  >
                    <span className="datetime-icon" aria-hidden="true">
                      📅
                    </span>
                    <input
                      ref={auctionStartTimeRef}
                      id="auctionStartTime"
                      type="datetime-local"
                      value={auction.startTime}
                      disabled={!auctionEnabled}
                      onChange={(event) =>
                        setAuction({
                          ...auction,
                          startTime: event.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* END TIME */}
                <div className="create-form-group auction-end-group">
                  <label htmlFor="auctionEndTime">
                    Auction End Time <span>*</span>
                  </label>
                  <div
                    className="datetime-input-wrapper"
                    onClick={() => auctionEndTimeRef.current?.showPicker?.()}
                  >
                    <span className="datetime-icon" aria-hidden="true">
                      📅
                    </span>
                    <input
                      ref={auctionEndTimeRef}
                      id="auctionEndTime"
                      type="datetime-local"
                      value={auction.endTime}
                      disabled={!auctionEnabled}
                      onChange={(event) =>
                        setAuction({ ...auction, endTime: event.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="create-auction-button"
                disabled={!auctionEnabled || isCreatingAuction}
                onClick={handleCreateAuction}
              >
                <span>⚒</span>
                {isCreatingAuction ? "Creating Auction..." : "Create Auction"}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* PRODUCT LISTING IS THE DEFAULT VIEW */}
      {pageView === "listing" && (
        <section className="added-products-section">
          <div className="added-products-heading">
            <div></div>
            <span>
              {products.length} Product{products.length !== 1 ? "s" : ""}
            </span>
          </div>

          {isLoadingProducts ? (
            <div className="product-list-empty">
              <p>Loading your products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="product-list-empty">
              <div className="product-empty-icon">▧</div>
              <h3>No products added yet</h3>
              <p>Add your first product to submit it for admin verification.</p>
              <button
                type="button"
                className="listing-add-product-button"
                onClick={() => setPageView("add")}
              >
                <span>+</span> Add Product
              </button>
            </div>
          ) : (
            <div className="seller-product-list">
              {products.map((item, index) => {
                const status = String(item.verificationStatus ?? "Pending")
                  .trim()
                  .toLowerCase();
                const isVerified = status === "verified";
                const isRejected = status === "rejected";
                const alreadyAssigned =
                  assignedProductIds.has(String(item.productId)) ||
                  productAlreadyAssigned(item);
                return (
                  <article
                    className="seller-product-row"
                    key={item.productId ?? `${item.productName}-${index}`}
                  >
                    <div className="seller-product-image">
                      {item.images?.[0] ? (
                        <img
                          src={getImageSource(item.images[0])}
                          alt={item.productName}
                        />
                      ) : (
                        <span>No image</span>
                      )}
                    </div>
                    <div className="seller-product-info">
                      <div className="seller-product-details-grid">
                        <div>
                          <span>Product ID</span>
                          <strong>{item.productId ?? "Auto Generated"}</strong>
                        </div>
                        <div>
                          <span>Product Name</span>
                          <strong>{item.productName}</strong>
                        </div>
                        <div>
                          <span>Category</span>
                          <strong>{item.category}</strong>
                        </div>
                        <div>
                          <span>Base Price</span>
                          <strong>{formatPrice(item.basePrice)}</strong>
                        </div>
                      </div>
                      <p className="seller-product-remarks">
                        Remarks:{" "}
                        {item.remarks ||
                          (isVerified
                            ? "Product verified successfully."
                            : "Product is waiting for admin verification.")}
                      </p>
                      <div
                        className={`seller-product-progress ${isVerified ? "is-verified" : ""}`}
                      >
                        {[
                          "Add Product",
                          "Under Verification",
                          "Get Notified",
                          "Create Auction",
                        ].map((step, stepIndex) => {
                          const done =
                            stepIndex === 0 ||
                            (isVerified && stepIndex <= 2) ||
                            (alreadyAssigned && stepIndex <= 3);
                          return (
                            <div
                              className={`seller-progress-step ${done ? "done" : ""}`}
                              key={step}
                            >
                              <span>{done ? "✓" : stepIndex + 1}</span>
                              <strong>{step}</strong>
                              <small>
                                {
                                  [
                                    "(by Seller)",
                                    "(by Admin)",
                                    "(when Verified)",
                                    "(for Verified Product)",
                                  ][stepIndex]
                                }
                              </small>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="seller-product-action">
                      <span
                        className={`product-verification-badge ${isVerified ? "product-verification-badge-verified" : isRejected ? "product-verification-badge-rejected" : "product-verification-badge-pending"}`}
                      >
                        {isVerified
                          ? "✓ Verified"
                          : isRejected
                            ? "Rejected"
                            : "◷ Pending Verification"}
                      </span>
                      <button
                        type="button"
                        className="seller-create-auction-button"
                        disabled={!isVerified || alreadyAssigned}
                        onClick={() => {
                          setSelectedProductId(String(item.productId));
                          setAuction({
                            title: item.productName,
                            startTime: "",
                            endTime: "",
                          });
                          setPageView("auction");
                        }}
                      >
                        ⚒ Create Auction
                      </button>
                      <small>
                        {alreadyAssigned
                          ? "Auction already created"
                          : isVerified
                            ? "Available for verified product"
                            : "Available after verification"}
                      </small>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
