import axiosClient from "../axiosClient";

//
// PAYMENT PROCESSING API
//

// 1. Process a payment
// POST /api/v1/payments/process
// Access: BUYER, SELLER
// Returns HTTP 201 Created
export const processPayment = async (paymentData) => {
  const response = await axiosClient.post("/payments/process", paymentData);

  return response.data;
};

//
// PAYMENT CALLBACK API
//

// 2. Handle the Razorpay payment callback
// GET /api/v1/payments/callback
// Query parameters:
// razorpay_payment_id
// razorpay_payment_link_id
// razorpay_payment_link_status
// Public access required for Razorpay redirect
export const handlePaymentCallback = async ({
  razorpay_payment_id,
  razorpay_payment_link_id,
  razorpay_payment_link_status,
}) => {
  const response = await axiosClient.get("/payments/callback", {
    params: {
      razorpay_payment_id,
      razorpay_payment_link_id,
      razorpay_payment_link_status,
    },
  });

  return response.data;
};

//
// PAYMENT GET APIs
//

// 3. Get payment by payment ID
// GET /api/v1/payments/{paymentId}
export const getPaymentById = async (paymentId) => {
  const response = await axiosClient.get(`/payments/${paymentId}`);

  return response.data;
};

// 4. Get payment by order ID
// GET /api/v1/payments/order/{orderId}
export const getPaymentByOrderId = async (orderId) => {
  const response = await axiosClient.get(`/payments/order/${orderId}`);

  return response.data;
};

// 5. Get payment by transaction ID
// GET /api/v1/payments/transaction/{transactionId}
export const getPaymentByTransactionId = async (transactionId) => {
  const response = await axiosClient.get(
    `/payments/transaction/${transactionId}`,
  );

  return response.data;
};

//
// ADMIN PAYMENT APIs
//

// 6. Get all payments
// GET /api/v1/payments/admin/all
// Access: ADMIN
export const getAllPayments = async () => {
  const response = await axiosClient.get("/payments/admin/all");

  return response.data;
};

// 7. Update payment status
// PUT /api/v1/payments/admin/{paymentId}/status?status=SUCCESS
// Access: ADMIN
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

// 8. Razorpay webhook endpoint
// POST /api/v1/payments/webhook
// Intended for Razorpay server-to-server webhook requests
// The backend validates the X-Razorpay-Signature header
export const handleRazorpayWebhook = async (payload, signature) => {
  const response = await axiosClient.post("/payments/webhook", payload, {
    headers: {
      "Content-Type": "application/json",
      "X-Razorpay-Signature": signature,
    },
  });

  return response.data;
};
