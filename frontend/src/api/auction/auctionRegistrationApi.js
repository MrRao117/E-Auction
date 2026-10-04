import axiosClient from "../axiosClient";

// ==========================================
// AUCTION REGISTRATION APIs
// ==========================================

// 1. Register for an auction
// POST /auction-registration/register/{auctionId}
export const registerForAuction = async (auctionId) => {
  const response = await axiosClient.post(
    `/auction-registration/register/${auctionId}`,
  );
  return response.data;
};

// 2. Cancel auction registration
// DELETE /auction-registration/cancel/{auctionId}
export const cancelRegistration = async (auctionId) => {
  const response = await axiosClient.delete(
    `/auction-registration/cancel/${auctionId}`,
  );
  return response.data;
};

// 3. Check whether the logged-in user is registered
// GET /auction-registration/check/{auctionId}
export const checkAuctionRegistration = async (auctionId) => {
  const response = await axiosClient.get(
    `/auction-registration/check/${auctionId}`,
  );
  return response.data;
};

// Alias for compatibility
export const isUserRegistered = checkAuctionRegistration;

// 4. Get all auctions registered by the logged-in user
// GET /auction-registration/my-registrations
export const getMyRegistrations = async () => {
  const response = await axiosClient.get(
    "/auction-registration/my-registrations",
  );
  return response.data;
};

// Alias for compatibility
export const getMyRegisteredAuctions = getMyRegistrations;

// ==========================================
// PUBLIC REGISTRATION APIs
// ==========================================

// 5. Get the total registration count for an auction
// GET /auction-registration/public/count/{auctionId}
export const getAuctionRegistrationCount = async (auctionId) => {
  const response = await axiosClient.get(
    `/auction-registration/public/count/${auctionId}`,
  );
  return response.data;
};

// Alias for compatibility
export const getRegistrationCount = getAuctionRegistrationCount;

// ==========================================
// ADMIN REGISTRATION API
// ==========================================

// 6. Get registrations for a specific auction
// GET /auction-registration/admin/auction/{auctionId}
export const getRegistrationsForAuction = async (auctionId) => {
  const response = await axiosClient.get(
    `/auction-registration/admin/auction/${auctionId}`,
  );
  return response.data;
};
