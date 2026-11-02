import axiosClient from "../axiosClient";

//
// NOTIFICATION GET API
//

// 1. Get notifications for the logged-in user
// GET /api/v1/notifications
export const getMyNotifications = async () => {
  const response = await axiosClient.get("/notifications");

  return response.data;
};

//
// NOTIFICATION STATUS API
//

// 2. Mark a notification as read
// PUT /api/v1/notifications/{id}/read
// Returns HTTP 204 No Content
export const markNotificationAsRead = async (id) => {
  await axiosClient.put(`/notifications/${id}/read`);
};
