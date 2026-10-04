import axiosClient from "../axiosClient";

/* ==========================================
   CREATE AUCTION
========================================== */

// CREATE AUCTION (SELLER)
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

/* ==========================================
   GET AUCTIONS
========================================== */

// GET ALL AUCTIONS
export const getAllAuctions = async () => {
  const response = await axiosClient.get("/auctions");
  return response.data;
};

// GET AUCTIONS BY STATUS
export const getAuctionsByStatus = async (status) => {
  const response = await axiosClient.get(`/auctions/status/${status}`);

  return response.data;
};

// GET SCHEDULED AUCTIONS
export const getScheduledAuctions = async () => {
  return getAuctionsByStatus("SCHEDULED");
};

// GET AUCTIONS CREATED BY LOGGED-IN SELLER
export const getMyAuctions = async () => {
  const response = await axiosClient.get("/auctions/my-auctions");

  return response.data;
};

// GET AUCTIONS BY SELLER EMAIL (ADMIN)
export const getAuctionsBySellerEmail = async (email) => {
  const response = await axiosClient.get("/auctions/admin/seller", {
    params: { email },
  });

  return response.data;
};

// GET AUCTION BY ID
export const getAuctionById = async (auctionId) => {
  const response = await axiosClient.get(`/auctions/${auctionId}`);

  return response.data;
};

/* ==========================================
   UPDATE AUCTIONS
========================================== */

// CANCEL AUCTION (SELLER)
export const cancelAuction = async (auctionId) => {
  const response = await axiosClient.put(`/auctions/${auctionId}/cancel`);

  return response.data;
};

// UPDATE AUCTION STATUS (ADMIN)
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
