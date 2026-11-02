import axiosClient from "../axiosClient";

//
// DELIVERY AGENT CREATE API
//

// 1. Create a new delivery agent
// POST /api/v1/delivery-agents
// Returns HTTP 201 Created
export const createDeliveryAgent = async (agentData) => {
  const response = await axiosClient.post("/delivery-agents", agentData);

  return response.data;
};

//
// DELIVERY AGENT GET APIs
//

// 2. Get all delivery agents
// GET /api/v1/delivery-agents
export const getAllDeliveryAgents = async () => {
  const response = await axiosClient.get("/delivery-agents");

  return response.data;
};

// 3. Get a delivery agent by ID
// GET /api/v1/delivery-agents/{agentId}
export const getDeliveryAgentById = async (agentId) => {
  const response = await axiosClient.get(`/delivery-agents/${agentId}`);

  return response.data;
};

//
// DELIVERY AGENT STATUS API
//

// 4. Update a delivery agent's status
// PATCH /api/v1/delivery-agents/{agentId}/status
// Query parameter: status
export const updateDeliveryAgentStatus = async (agentId, status) => {
  const response = await axiosClient.patch(
    `/delivery-agents/${agentId}/status`,
    null,
    {
      params: { status },
    },
  );

  return response.data;
};
