import axiosClient from "../axiosClient";

// ======================================================
// CATEGORY APIs
// ======================================================

export const getProductCategories = async () => {
  const response = await axiosClient.get("/products/categories");
  return response.data;
};

export const getCategoryById = async (categoryId) => {
  const response = await axiosClient.get(
    `/products/categories/${categoryId}`
  );

  return response.data;
};

export const createCategory = async (categoryData) => {
  const response = await axiosClient.post(
    "/products/categories",
    categoryData
  );

  return response.data;
};

export const updateCategory = async (categoryId, categoryData) => {
  const response = await axiosClient.put(
    `/products/categories/${categoryId}`,
    categoryData
  );

  return response.data;
};

export const deleteCategory = async (categoryId) => {
  const response = await axiosClient.delete(
    `/products/categories/${categoryId}`
  );

  return response.data;
};

// ======================================================
// PRODUCT APIs
// ======================================================

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

// ======================================================
// CREATE PRODUCT
// ======================================================

export const createProduct = async (formData) => {
  console.log("=================================");
  console.log("CREATE PRODUCT API");
  console.log("=================================");

  // --------------------------------
  // Verify FormData
  // --------------------------------
  if (!(formData instanceof FormData)) {
    throw new Error(
      "createProduct() requires FormData."
    );
  }

  // --------------------------------
  // Debug FormData
  // --------------------------------
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(
        `FormData -> ${key}: File`,
        value.name,
        value.type,
        value.size
      );
    } else if (value instanceof Blob) {
      console.log(
        `FormData -> ${key}: Blob`,
        value.type,
        value.size
      );
    } else {
      console.log(
        `FormData -> ${key}:`,
        value
      );
    }
  }

  // --------------------------------
  // IMPORTANT:
  // DO NOT manually set Content-Type.
  //
  // Axios/browser will generate:
  //
  // multipart/form-data;
  // boundary=----------------...
  // --------------------------------
  const response = await axiosClient.post(
    "/products/add",
    formData
  );

  return response.data;
};

// ======================================================
// UPDATE PRODUCT
// ======================================================

export const updateProduct = async (
  productId,
  formData
) => {

  if (!(formData instanceof FormData)) {
    throw new Error(
      "updateProduct() requires FormData."
    );
  }

  const response = await axiosClient.put(
    `/products/${productId}`,
    formData
  );

  return response.data;
};

// ======================================================
// DELETE PRODUCT
// ======================================================

export const deleteProduct = async (productId) => {
  const response = await axiosClient.delete(
    `/products/${productId}`
  );

  return response.data;
};
