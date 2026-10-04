import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1",
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // Add JWT token
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    /*
     * IMPORTANT:
     * Product creation/update uses FormData.
     *
     * Do NOT send:
     * Content-Type: application/json
     *
     * The browser must automatically create:
     * multipart/form-data; boundary=...
     */
    if (config.data instanceof FormData) {
      if (config.headers) {
        delete config.headers["Content-Type"];
        delete config.headers["content-type"];
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response) {
      console.error(
        "API Error:",
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      console.error("Network Error:", error.message);
    } else {
      console.error("Request Error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
