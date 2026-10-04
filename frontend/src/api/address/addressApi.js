import axiosClient from "../axiosClient";

// ==========================================
// ADDRESS APIs
// ==========================================

// 1. Add a new address
// POST /api/v1/addresses/add
export const addAddress = async (addressData) => {
  const response = await axiosClient.post("/addresses/add", addressData);
  return response.data;
};

// 2. Get all addresses of the logged-in user
// GET /api/v1/addresses/my-addresses
export const getMyAddresses = async () => {
  const response = await axiosClient.get("/addresses/my-addresses");
  return response.data;
};

// 3. Get addresses by user email (Admin)
// GET /api/v1/addresses/user?email={email}
export const getAddressesByUserEmail = async (email) => {
  const response = await axiosClient.get("/addresses/user", {
    params: { email },
  });
  return response.data;
};

// 4. Get a specific address by ID
// GET /api/v1/addresses/{addressId}
export const getAddressById = async (addressId) => {
  const response = await axiosClient.get(`/addresses/${addressId}`);
  return response.data;
};

// 5. Update an existing address
// PUT /api/v1/addresses/{addressId}/update
export const updateAddress = async (addressId, addressData) => {
  const response = await axiosClient.put(
    `/addresses/${addressId}/update`,
    addressData,
  );
  return response.data;
};

// 6. Delete an address
// DELETE /api/v1/addresses/{addressId}/delete
export const deleteAddress = async (addressId) => {
  const response = await axiosClient.delete(`/addresses/${addressId}/delete`);
  return response.data;
};
