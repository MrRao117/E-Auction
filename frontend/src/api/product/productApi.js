import axiosClient from "../axiosClient";

// ==========================================
// CATEGORY APIs
// ==========================================

// 1. Get all product categories
// GET /api/v1/products/categories/all
export const getProductCategories = async () => {
  const response = await axiosClient.get("/products/categories/all");
  return response.data;
};

// 2. Create a new category
// POST /api/v1/products/categories/create
export const createCategory = async (categoryData) => {
  const response = await axiosClient.post(
    "/products/categories/create",
    categoryData,
  );
  return response.data;
};

// 3. Get category by ID
// GET /api/v1/products/categories/{categoryId}
export const getCategoryById = async (categoryId) => {
  const response = await axiosClient.get(`/products/categories/${categoryId}`);
  return response.data;
};

// ==========================================
// PRODUCT GET APIs
// ==========================================

// 4. Get all products
// GET /api/v1/products
export const getAllProducts = async () => {
  const response = await axiosClient.get("/products");
  return response.data;
};

// 5. Get all verified products
// GET /api/v1/products/verified
export const getVerifiedProducts = async () => {
  const response = await axiosClient.get("/products/verified");
  return response.data;
};

// 6. Get all unverified products (Admin only)
// GET /api/v1/products/unverified
export const getUnverifiedProducts = async () => {
  const response = await axiosClient.get("/products/unverified");
  return response.data;
};

// 7. Get products belonging to the logged-in seller
// GET /api/v1/products/my-products
export const getMyProducts = async () => {
  const response = await axiosClient.get("/products/my-products");
  return response.data;
};

// 8. Get products by category ID
// GET /api/v1/products/category/{categoryId}/products
export const getProductsByCategory = async (categoryId) => {
  const response = await axiosClient.get(
    `/products/category/${categoryId}/products`,
  );
  return response.data;
};

// 9. Get product by ID
// GET /api/v1/products/{productId}
export const getProductById = async (productId) => {
  const response = await axiosClient.get(`/products/${productId}`);
  return response.data;
};

// ==========================================
// PRODUCT CREATE / UPDATE / DELETE APIs
// ==========================================

// 10. Create a new product (Seller only)
// POST /api/v1/products/add
export const createProduct = async (productData) => {
  // Pass formData directly. Do NOT manually override Content-Type headers,
  // as Axios will automatically handle the multipart boundary.
  const response = await axiosClient.post("/products/add", productData);
  return response.data;
};

// 11. Verify a product (Admin only)
// PUT /api/v1/products/{productId}/verify
export const verifyProduct = async (productId, verificationData) => {
  const response = await axiosClient.put(
    `/products/${productId}/verify`,
    verificationData,
  );
  return response.data;
};

// 12. Update a product (Seller only)
// PUT /api/v1/products/{productId}/update
export const updateProduct = async (productId, productData) => {
  const response = await axiosClient.put(
    `/products/${productId}/update`,
    productData,
  );
  return response.data;
};

// 13. Delete a product (Seller or Admin)
// DELETE /api/v1/products/{productId}/delete
export const deleteProduct = async (productId) => {
  const response = await axiosClient.delete(`/products/${productId}/delete`);
  return response.data;
};
