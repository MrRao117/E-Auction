import axiosClient from "../axiosClient";

// ==========================================
// PAYMENT APIs
// ==========================================

// 1. Process a payment
// POST /api/v1/payments/process
export const processPayment = async (paymentData) => {
  const response = await axiosClient.post("/payments/process", paymentData);
  return response.data;
};

// 2. Get payment by ID
// GET /api/v1/payments/{paymentId}
export const getPaymentById = async (paymentId) => {
  const response = await axiosClient.get(`/payments/${paymentId}`);
  return response.data;
};

// 3. Get payment by order ID
// GET /api/v1/payments/order/{orderId}
export const getPaymentByOrderId = async (orderId) => {
  const response = await axiosClient.get(`/payments/order/${orderId}`);
  return response.data;
};

// 4. Get payment by transaction ID
// GET /api/v1/payments/transaction/{transactionId}
export const getPaymentByTransactionId = async (transactionId) => {
  const response = await axiosClient.get(
    `/payments/transaction/${transactionId}`,
  );
  return response.data;
};

// 5. Get all payments (Admin)
// GET /api/v1/payments/admin/all
export const getAllPayments = async () => {
  const response = await axiosClient.get("/payments/admin/all");
  return response.data;
};

// 6. Update payment status (Admin)
// PUT /api/v1/payments/admin/{paymentId}/status?status=...
export const updatePaymentStatus = async (paymentId, status) => {
  const response = await axiosClient.put(
    `/payments/admin/${paymentId}/status`,
    null,
    {
      params: { status },
    },
  );
  return response.data;
};
