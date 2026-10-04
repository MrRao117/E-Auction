import axiosClient from "../axiosClient";

// ==========================================
// ORDER GET APIs
// ==========================================

// 1. Get orders won by the logged-in user
// GET /api/v1/orders/my-orders
// Access: BUYER, SELLER
export const getMyOrders = async () => {
  const response = await axiosClient.get("/orders/my-orders");
  return response.data;
};

// 2. Get order details by order ID
// GET /api/v1/orders/{orderId}
// Access: BUYER, SELLER, ADMIN
export const getOrderById = async (orderId) => {
  const response = await axiosClient.get(`/orders/${orderId}`);
  return response.data;
};

// 3. Get all system orders
// GET /api/v1/orders/admin/all
// Access: ADMIN
export const getAllOrders = async () => {
  const response = await axiosClient.get("/orders/admin/all");
  return response.data;
};

// ==========================================
// ORDER STATUS UPDATE API
// ==========================================

// 4. Update order status
// PUT /api/v1/orders/admin/{orderId}/status?status=SHIPPED
// Access: ADMIN
export const updateOrderStatus = async (orderId, status) => {
  const response = await axiosClient.put(
    `/orders/admin/${orderId}/status`,
    null,
    {
      params: { status },
    },
  );
  return response.data;
};
