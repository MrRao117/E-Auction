import axiosClient from "../axiosClient";

// ==========================================
// BID CREATE API
// ==========================================

// 1. Place a bid on an auction
// POST /api/v1/bids/place/{auctionId}
// Access: BUYER, SELLER
export const placeBid = async (auctionId, bidData) => {
  const response = await axiosClient.post(`/bids/place/${auctionId}`, bidData);
  return response.data;
};

// ==========================================
// BID GET APIs
// ==========================================

// 2. Get all bids for an auction
// GET /api/v1/bids/auction/{auctionId}
export const getBidsByAuctionId = async (auctionId) => {
  const response = await axiosClient.get(`/bids/auction/${auctionId}`);
  return response.data;
};

// 3. Get the highest bid for an auction
// GET /api/v1/bids/auction/{auctionId}/highest
export const getHighestBidForAuction = async (auctionId) => {
  const response = await axiosClient.get(`/bids/auction/${auctionId}/highest`);
  return response.data;
};

// 4. Get bids placed by the logged-in user
// GET /api/v1/bids/my-bids
// Access: BUYER, SELLER
export const getMyBids = async () => {
  const response = await axiosClient.get("/bids/my-bids");
  return response.data;
};

// 5. Get complete bid history for an auction (Admin only)
// GET /api/v1/bids/admin/auction/{auctionId}
export const getFullBidsForAdmin = async (auctionId) => {
  const response = await axiosClient.get(`/bids/admin/auction/${auctionId}`);
  return response.data;
};

// 6. Get total bid count for an auction
// GET /api/v1/bids/auction/{auctionId}/count
export const getBidCountForAuction = async (auctionId) => {
  const response = await axiosClient.get(`/bids/auction/${auctionId}/count`);
  return response.data;
};

// 7. Check if the logged-in user is the highest bidder
// GET /api/v1/bids/auction/{auctionId}/is-highest-bidder
// Access: BUYER, SELLER
export const isCurrentUserHighestBidder = async (auctionId) => {
  const response = await axiosClient.get(
    `/bids/auction/${auctionId}/is-highest-bidder`,
  );
  return response.data;
};
