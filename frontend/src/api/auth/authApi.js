import axiosClient from "../axiosClient";

export const registerUser = async (userData) => {
  const response = await axiosClient.post("/auth/register", userData);

  return response.data;
};

export const loginUser = async (loginData) => {
  const response = await axiosClient.post("/auth/login", loginData);

  return response.data;
};

export const forgotPassword = async (requestData) => {
  const response = await axiosClient.post("/auth/forgot-password", requestData);

  return response.data;
};

export const resetPassword = async (requestData) => {
  const response = await axiosClient.post("/auth/reset-password", requestData);

  return response.data;
};

export const adminLogin = async (loginData) => {
  const response = await axiosClient.post("/admin/login", loginData);

  return response.data;
};
