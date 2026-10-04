import axiosClient from "../axiosClient";

// ===============================
// CATEGORY APIs
// ===============================

export const getCategories = async () => {
  const response = await axiosClient.get("/categories");
  return response.data;
};

export const getCategoryById = async (categoryId) => {
  const response = await axiosClient.get(`/categories/${categoryId}`);
  return response.data;
};

export const createCategory = async (categoryData) => {
  const response = await axiosClient.post("/categories", categoryData);
  return response.data;
};

export const updateCategory = async (categoryId, categoryData) => {
  const response = await axiosClient.put(
    `/categories/${categoryId}`,
    categoryData
  );
  return response.data;
};

export const deleteCategory = async (categoryId) => {
  const response = await axiosClient.delete(
    `/categories/${categoryId}`
  );
  return response.data;
};

// ===============================
// PRODUCT APIs
// ===============================

export const getProducts = async () => {
  const response = await axiosClient.get("/products");
  return response.data;
};

export const getProductById = async (productId) => {
  const response = await axiosClient.get(
    `/products/${productId}`
  );
  return response.data;
};

export const getMyProducts = async () => {
  const response = await axiosClient.get("/products/my");
  return response.data;
};

/*
 * CREATE PRODUCT
 *
 * productData MUST be FormData.
 *
 * The FormData contains:
 *
 * product -> JSON Blob
 * image   -> File
 *
 * We intentionally DO NOT set Content-Type here.
 * The browser/Axios will automatically create:
 *
 * multipart/form-data; boundary=----------------...
 */
export const createProduct = async (productData) => {
  console.log("========== CREATE PRODUCT ==========");
  console.log("Is FormData:", productData instanceof FormData);

  if (!(productData instanceof FormData)) {
    throw new Error(
      "createProduct expects FormData, but received something else."
    );
  }

  for (const [key, value] of productData.entries()) {
    console.log(
      "FORM DATA:",
      key,
      value instanceof File
        ? `File: ${value.name}`
        : value instanceof Blob
        ? `Blob: ${value.type}`
        : value
    );
  }

  const response = await axiosClient.post(
    "/products/add",
    productData
  );

  return response.data;
};

/*
 * UPDATE PRODUCT
 *
 * Also uses FormData because an image may be uploaded.
 */
export const updateProduct = async (productId, productData) => {
  console.log("========== UPDATE PRODUCT ==========");
  console.log("Product ID:", productId);
  console.log("Is FormData:", productData instanceof FormData);

  if (!(productData instanceof FormData)) {
    throw new Error(
      "updateProduct expects FormData, but received something else."
    );
  }

  const response = await axiosClient.put(
    `/products/${productId}`,
    productData
  );

  return response.data;
};

export const deleteProduct = async (productId) => {
  const response = await axiosClient.delete(
    `/products/${productId}`
  );

  return response.data;
};
