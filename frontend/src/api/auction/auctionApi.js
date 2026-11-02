import axiosClient from "../axiosClient";

//
// AUCTION APIs
//

/*
 * CREATE AUCTION
 */

// 1. Create Auction (SELLER)
// POST /api/v1/auctions/create
export const createAuction = async (auctionData) => {
  try {
    const response = await axiosClient.post("/auctions/create", auctionData);
    return response.data;
  } catch (error) {
    console.error("Backend error:", error.response?.data);
    console.error("Status:", error.response?.status);
    console.error("Request payload:", auctionData);
    throw error;
  }
};

/*
 * GET AUCTIONS
 */

// 2. Get All Auctions
// GET /api/v1/auctions
export const getAllAuctions = async () => {
  const response = await axiosClient.get("/auctions");
  return response.data;
};

// 3. Get Auctions by Status
// GET /api/v1/auctions/status/{status}
export const getAuctionsByStatus = async (status) => {
  const response = await axiosClient.get(`/auctions/status/${status}`);
  return response.data;
};

// 4. Get Scheduled Auctions
// GET /api/v1/auctions/status/SCHEDULED
export const getScheduledAuctions = async () => {
  return getAuctionsByStatus("SCHEDULED");
};

// 5. Get Auctions Created by Logged-in Seller
// GET /api/v1/auctions/my-auctions
// Optional query parameter: status
export const getMyAuctions = async (status) => {
  const response = await axiosClient.get("/auctions/my-auctions", {
    params: status ? { status } : {},
  });
  return response.data;
};

// 6. Get Auctions by Seller Email (ADMIN)
// GET /api/v1/auctions/admin/seller?email={email}
export const getAuctionsBySellerEmail = async (email) => {
  const response = await axiosClient.get("/auctions/admin/seller", {
    params: { email },
  });
  return response.data;
};

// 7. Get Auction by ID
// GET /api/v1/auctions/{auctionId}
export const getAuctionById = async (auctionId) => {
  const response = await axiosClient.get(`/auctions/${auctionId}`);
  return response.data;
};

/*
 * UPDATE AUCTIONS
 */

// 8. Cancel Auction (SELLER)
// PUT /api/v1/auctions/{auctionId}/cancel
// Returns HTTP 204 No Content
export const cancelAuction = async (auctionId) => {
  await axiosClient.put(`/auctions/${auctionId}/cancel`);
};

// 9. Update Auction Status (ADMIN)
// PUT /api/v1/auctions/{auctionId}/{status}?status={status}
export const updateAuctionStatus = async (auctionId, status) => {
  const response = await axiosClient.put(
    `/auctions/${auctionId}/${status}`,
    null,
    {
      params: { status },
    },
  );

  return response.data;
};
