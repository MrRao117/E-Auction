/* =========================================================
   AUCTION UTILITIES
   Frontend-only auction lifecycle calculations
========================================================= */

export const getAuctionLifecycle = (auction, now = Date.now()) => {
  const startMs = auction?.startTime
    ? new Date(auction.startTime).getTime()
    : NaN;

  const endMs = auction?.endTime ? new Date(auction.endTime).getTime() : NaN;

  if (
    !Number.isFinite(startMs) ||
    !Number.isFinite(endMs) ||
    endMs <= startMs
  ) {
    return {
      status: "INVALID",
      label: "Time Unavailable",
      remainingSeconds: null,
    };
  }

  if (now < startMs) {
    return {
      status: "SCHEDULED",
      label: "Starts In",
      remainingSeconds: Math.max(0, Math.floor((startMs - now) / 1000)),
    };
  }

  if (now >= endMs) {
    return {
      status: "ENDED",
      label: "Auction Ended",
      remainingSeconds: 0,
    };
  }

  return {
    status: "ACTIVE",
    label: "Time Left",
    remainingSeconds: Math.max(0, Math.floor((endMs - now) / 1000)),
  };
};

/* =========================================================
   FILTER AUCTIONS BY REAL-TIME STATUS
========================================================= */

export const getUpcomingAuctions = (auctions, now = Date.now()) =>
  auctions.filter(
    (auction) => getAuctionLifecycle(auction, now).status === "SCHEDULED",
  );

export const getLiveAuctions = (auctions, now = Date.now()) =>
  auctions.filter(
    (auction) => getAuctionLifecycle(auction, now).status === "ACTIVE",
  );

export const getEndedAuctions = (auctions, now = Date.now()) =>
  auctions.filter(
    (auction) => getAuctionLifecycle(auction, now).status === "ENDED",
  );

/* =========================================================
   NORMALIZE PRODUCT + AUCTION DATA
========================================================= */

export const combineAuctionWithProduct = (auction, product) => ({
  ...auction,
  ...product,

  product,
  productId: product?.productId ?? auction.productId,
  image: product?.imageUrl ?? "",
  title: product?.pname || auction.productTitle || "Untitled Product",
  description: product?.description || "",
  seller: product?.sellerName || product?.sellerEmail || "Seller",
  category: product?.categoryName || "Uncategorized",
  verified: product?.isVerified === true,

  auctionId: auction.auctionId,
  id: auction.auctionId,

  basePrice: auction.basePrice ?? product?.basePrice ?? 0,
  currHighestBid: auction.currHighestBid ?? 0,

  price: auction.currHighestBid ?? auction.basePrice ?? product?.basePrice ?? 0,

  startTime: auction.startTime,
  endTime: auction.endTime,

  auctionStatus: getAuctionLifecycle(auction).status,
});
