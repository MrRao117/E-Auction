import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1",
});

// ===============================
// REQUEST INTERCEPTOR
// ===============================
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    config.headers = config.headers || {};

    // ===============================
    // JWT AUTHORIZATION
    // ===============================
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ===============================
    // IMPORTANT:
    // If request body is FormData,
    // NEVER send application/json.
    //
    // Browser will automatically generate:
    // multipart/form-data; boundary=...
    // ===============================
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ===============================
// RESPONSE INTERCEPTOR
// ===============================
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error(
      "API ERROR:",
      error?.response?.status,
      error?.response?.data || error.message
    );

    return Promise.reject(error);
  }
);

export default axiosClient;
