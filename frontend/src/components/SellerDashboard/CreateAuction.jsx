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
    const file = event.target.files?.[0];

    if (!file) {
      alert("Please select a product photo.");
      setProductImages([]);
      return;
    }

    const validType = ["image/jpeg", "image/jpg", "image/png"].includes(
      file.type,
    );
    const validSize = file.size <= 5 * 1024 * 1024;

    if (!validType || !validSize) {
      alert(
        "Please select a valid JPG, JPEG, or PNG photo. The photo must be below 5MB.",
      );
      setProductImages([]);
      return;
    }

    // The current Spring Boot endpoint accepts one MultipartFile named `image`.
    setProductImages([file]);
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

    try {
      setIsAddingProduct(true);

      let categoryId;
      let resolvedCategoryName = "";

      if (useCustomCategory) {
        const requestedCategoryName = category.trim();

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
                  `The category "${requestedCategoryName}" already exists, but its ID could not be retrieved.`,
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
                `The category "${requestedCategoryName}" already exists, but categories could not be loaded.`,
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

      // ── BUILD MULTIPART FORM DATA ──────────────────────────
      // Backend expects:
      // @RequestPart("product") CreateProductRequest request
      // @RequestPart("image") MultipartFile image
      const formData = new FormData();

      const productData = {
        pname: product.productName.trim(),
        description: product.description.trim(),
        basePrice: Number(product.basePrice),
        categoryId: Number(categoryId),
      };

      // Send product details as a JSON multipart part named `product`.
      formData.append(
        "product",
        new Blob([JSON.stringify(productData)], {
          type: "application/json",
        }),
      );

      // Send the image as a separate multipart file part named `image`.
      formData.append("image", productImages[0]);

      const savedProduct = await createProduct(formData);
      // ───────────────────────────────────────────────────────

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
          <h1>Create New Auction</h1>
          <p>
            Add your product details first. After admin verification, you can
            create the auction.
          </p>
        </div>
      </div>

      {/* ONLY THE TWO FORMS USE THIS GRID */}
      <div className="create-auction-content">
        {/* =====================================================
            LEFT FORM - ADD PRODUCT
        ====================================================== */}
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
                  <strong>Click to upload product photo</strong>
                  <span>Select 1 photo</span>
                  <small>JPG, PNG, JPEG • Maximum 5MB</small>
                </label>

                <input
                  id="productImages"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
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
                  {productImages.length} photo selected
                  {productImages.length >= 1
                    ? " ✓ Photo selected"
                    : " — 1 required"}
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
                After adding the product, it will go through admin verification.
                You will be notified once it is verified, and then you can
                create the auction.
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            RIGHT FORM - AUCTION
        ====================================================== */}
        <section className="create-auction-card">
          <div className="flow-card">
            <h2>Product to Auction Flow</h2>

            <div className="product-auction-flow">
              <div className="flow-line" />

              <div
                className={`flow-step ${
                  currentFlowStep >= 1 ? "completed" : ""
                } ${currentFlowStep === 1 ? "current" : ""}`}
              >
                <div className="flow-step-number">1</div>
                <strong>Add Product</strong>
                <span>(by Seller)</span>
              </div>

              <div
                className={`flow-step ${
                  currentFlowStep >= 2 ? "completed" : ""
                } ${currentFlowStep === 2 ? "current" : ""}`}
              >
                <div className="flow-step-number">2</div>
                <strong>Under Verification</strong>
                <span>(by Admin)</span>
              </div>

              <div
                className={`flow-step ${
                  currentFlowStep >= 3 ? "completed" : ""
                } ${currentFlowStep === 3 ? "current" : ""}`}
              >
                <div className="flow-step-number">3</div>
                <strong>Get Notified</strong>
                <span>(when Verified)</span>
              </div>

              <div
                className={`flow-step ${
                  currentFlowStep >= 4 ? "completed" : ""
                } ${currentFlowStep === 4 ? "current" : ""}`}
              >
                <div className="flow-step-number">4</div>
                <strong>Create Auction</strong>
                <span>(for Verified Product)</span>
              </div>
            </div>
          </div>

          <div className="auction-form-panel">
            <div className="create-section-header auction-section-header">
              <div className="create-section-number auction-step-number">2</div>
              <div>
                <h2>Create Auction (After Product Verification)</h2>
                <p>
                  Once your product is verified by admin, you can create the
                  auction.
                </p>
              </div>
            </div>

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

            <div className="verified-product-selector">
              <label htmlFor="verifiedProduct">
                Verified Product <span>*</span>
              </label>
              <select
                id="verifiedProduct"
                value={selectedProductId}
                onChange={(event) => setSelectedProductId(event.target.value)}
                disabled={verifiedProducts.length === 0}
              >
                <option value="">
                  {verifiedProducts.length === 0
                    ? "No verified product available yet"
                    : "Select a verified product"}
                </option>
                {verifiedProducts.map((item, index) => (
                  <option
                    key={`${item.productName}-${index}`}
                    value={String(item.productId)}
                  >
                    {item.productName} — {item.category}
                  </option>
                ))}
              </select>
            </div>

            <div className="selected-product-card">
              <div className="selected-product-image">
                {selectedProduct?.images?.[0] ? (
                  <img
                    src={getImageSource(selectedProduct.images[0])}
                    alt={selectedProduct.productName}
                  />
                ) : (
                  <span>Product Image</span>
                )}
              </div>

              <div className="selected-product-details">
                <h3>
                  {selectedProduct?.productName || "Product will appear here"}
                </h3>
                <p>
                  {selectedProduct
                    ? `Category: ${selectedProduct.category}`
                    : "Select a verified product to create an auction."}
                </p>
              </div>

              <div className="selected-product-id">
                <span>Product ID</span>
                <strong>
                  {selectedProduct?.productId ?? "Auto Generated"}
                </strong>
              </div>

              <div
                className={`product-status ${
                  selectedProduct ? "product-status-verified" : ""
                }`}
              >
                {selectedProduct ? "✓ Verified" : "Waiting"}
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
                      setAuction({ ...auction, startTime: event.target.value })
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

      {/* =====================================================
          ADDED PRODUCTS - FULL WIDTH, OUTSIDE THE GRID
      ====================================================== */}
      {products.length > 0 && (
        <section className="added-products-section">
          <div className="added-products-heading">
            <div>
              <h2>Added Products</h2>
              <p>Products submitted to the system for admin verification.</p>
            </div>
            <span>
              {products.length} Product{products.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="added-products-list">
            {isLoadingProducts && <p>Loading your products...</p>}
            {!isLoadingProducts && products.length === 0 && (
              <p>You have not added any products yet.</p>
            )}
            {products.map((item, index) => (
              <article
                className="added-product-details"
                key={`${item.productName}-${index}`}
              >
                <div className="added-product-details-header">
                  <div className="product-title-block">
                    <div className="product-details-number">{index + 1}</div>
                    <div>
                      <h3>PRODUCT DETAILS</h3>
                      <p>
                        Your product has been submitted for admin verification.
                      </p>
                    </div>
                  </div>

                  <span
                    className={`product-verification-badge ${
                      item.verificationStatus === "Verified"
                        ? "product-verification-badge-verified"
                        : "product-verification-badge-pending"
                    }`}
                  >
                    {item.verificationStatus === "Verified"
                      ? "✓ Verified"
                      : "◷ Pending Verification"}
                  </span>
                </div>

                <div className="product-details-main">
                  <div className="product-details-photo-grid">
                    {item.images.map((file, photoIndex) => (
                      <div
                        className="product-detail-photo"
                        key={`${file.name}-${photoIndex}`}
                      >
                        <img
                          src={getImageSource(file)}
                          alt={`${item.productName} ${photoIndex + 1}`}
                        />
                        <span>{photoIndex + 1}</span>
                      </div>
                    ))}
                  </div>

                  <div className="product-details-grid">
                    <div>
                      <span className="product-detail-label">Product ID</span>
                      <strong className="product-detail-value">
                        {item.productId ?? "Auto Generated"}
                      </strong>
                    </div>

                    <div>
                      <span className="product-detail-label">Product Name</span>
                      <strong className="product-detail-value">
                        {item.productName}
                      </strong>
                    </div>

                    <div>
                      <span className="product-detail-label">Category</span>
                      <strong className="product-detail-value">
                        {item.category}
                      </strong>
                    </div>

                    <div>
                      <span className="product-detail-label">Base Price</span>
                      <strong className="product-detail-value">
                        {formatPrice(item.basePrice)}
                      </strong>
                    </div>

                    <div>
                      <span className="product-detail-label">
                        Product Photos
                      </span>
                      <strong className="product-detail-value product-photo-count">
                        {item.images.length} Photos
                      </strong>
                    </div>

                    <div>
                      <span className="product-detail-label">
                        Verification Status
                      </span>
                      <strong
                        className={`product-detail-value ${
                          item.verificationStatus === "Verified"
                            ? "verified-text"
                            : "pending-text"
                        }`}
                      >
                        {item.verificationStatus}
                      </strong>
                    </div>

                    <div>
                      <span className="product-detail-label">Verified By</span>
                      <strong className="product-detail-value">
                        {item.verifiedBy ?? "Not Verified Yet"}
                      </strong>
                    </div>

                    <div>
                      <span className="product-detail-label">Remarks</span>
                      <strong className="product-detail-value remarks-value">
                        {item.remarks}
                      </strong>
                    </div>
                  </div>

                  <div className="product-description-details">
                    <span className="product-detail-label">Description</span>
                    <p>{item.description}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
