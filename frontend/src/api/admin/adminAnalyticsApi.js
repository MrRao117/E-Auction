import axiosClient from "../axiosClient";

// ==========================================
// ADMIN ANALYTICS API
// ==========================================

// GET ADMIN DASHBOARD ANALYTICS
// GET /api/admin/analytics/dashboard
export const getAdminDashboardAnalytics = async () => {
  const response = await axiosClient.get("/admin/analytics/dashboard");
  return response.data;
};
