import axiosClient from "../axiosClient";

// 1. Get the logged-in user's profile
// GET /api/v1/users/me
// Access: Authenticated users
export const getCurrentUser = async () => {
  const response = await axiosClient.get("/users/me");
  return response.data;
};

// 2. Search for a user by email
// GET /api/v1/users/search?email={email}
// Access: ADMIN
export const getUserByEmail = async (email) => {
  const response = await axiosClient.get("/users/search", {
    params: { email },
  });

  return response.data;
};
