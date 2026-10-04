import axiosClient from "../axiosClient";

// ==========================================
// DELIVERY CREATE API
// ==========================================

// 1. Assign delivery to an agent
// POST /api/v1/deliveries/assign
export const assignDelivery = async (deliveryData) => {
  const response = await axiosClient.post("/deliveries/assign", deliveryData);
  return response.data;
};

// ==========================================
// DELIVERY GET APIs
// ==========================================

// 2. Get all deliveries
// GET /api/v1/deliveries
export const getAllDeliveries = async () => {
  const response = await axiosClient.get("/deliveries");
  return response.data;
};

// 3. Get delivery by delivery ID
// GET /api/v1/deliveries/{deliveryId}
export const getDeliveryById = async (deliveryId) => {
  const response = await axiosClient.get(`/deliveries/${deliveryId}`);
  return response.data;
};

// 4. Get delivery by order ID
// GET /api/v1/deliveries/order/{orderId}
export const getDeliveryByOrderId = async (orderId) => {
  const response = await axiosClient.get(`/deliveries/order/${orderId}`);
  return response.data;
};

// 5. Get deliveries assigned to an agent
// GET /api/v1/deliveries/agent/{agentId}
export const getDeliveriesByAgentId = async (agentId) => {
  const response = await axiosClient.get(`/deliveries/agent/${agentId}`);
  return response.data;
};

// ==========================================
// DELIVERY STATUS UPDATE API
// ==========================================

// 6. Update delivery status
// PATCH /api/v1/deliveries/{deliveryId}/status
export const updateDeliveryStatus = async (deliveryId, status, remarks) => {
  const response = await axiosClient.patch(
    `/deliveries/${deliveryId}/status`,
    null,
    {
      params: {
        status,
        ...(remarks !== undefined && { remarks }),
      },
    },
  );
  return response.data;
};
