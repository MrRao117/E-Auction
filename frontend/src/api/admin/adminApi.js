import axiosClient from "../axiosClient";

// ==========================================
// ADMIN AUTHENTICATION APIs
// ==========================================

// 1. Admin Login
// POST /api/v1/admin/login
export const loginAdmin = async (loginData) => {
  const response = await axiosClient.post("/admin/login", loginData);
  return response.data;
};

// 2. Register a New Admin
// POST /api/v1/admin/register
// Access: ADMIN
export const registerAdmin = async (adminData) => {
  const response = await axiosClient.post("/admin/register", adminData);
  return response.data;
};

// 3. Get Logged-in Admin Profile
// GET /api/v1/admin/me
// Access: ADMIN
export const getMyAdminProfile = async () => {
  const response = await axiosClient.get("/admin/me");
  return response.data;
};
