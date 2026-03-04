import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_SERVER_BASE_URL || "http://localhost:3000",
});

// Request interceptor to add the bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors and refresh the token
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If we get a 401 error and we haven't already tried to refresh the token
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          // No refresh token, redirect to login
          window.location.href = "/login";
          return Promise.reject(error);
        }

        // Attempt to refresh the token
        // Using pure axios here (instead of apiClient) to bypass interceptors and prevent infinite loops
        const response = await axios.post(`${apiClient.defaults.baseURL}/auth/refresh`, {refreshToken: refreshToken});

        const newAccessToken = response.data.accessToken;
        const newRefreshToken = response.data.refreshToken;

        // Update tokens in localStorage
        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        // Update the original request with the new Tokens and retry it
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);

      } catch (refreshError) {
        // If refreshing the token fails, clear tokens and redirect to login
        console.error("Refresh Token failed, logging out...", refreshError);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  });

export default apiClient;