import axiosClient from "../axiosClient";

//
// ORDER STATUS UPDATE API
//

// 1. Update the status of an order
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

//
// ORDER STATUS HISTORY API
//

// 2. Get the status history of a specific order
// GET /api/v1/orders/{orderId}/history
// Access: BUYER, SELLER, ADMIN
export const getOrderStatusHistory = async (orderId) => {
  const response = await axiosClient.get(`/orders/${orderId}/history`);

  return response.data;
};
