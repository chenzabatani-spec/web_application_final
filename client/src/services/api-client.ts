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

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          console.error("DEBUG: No refresh token, stopping redirect");
          return Promise.reject(error);
        }

        const response = await axios.post(`${apiClient.defaults.baseURL}/auth/refresh`, {refreshToken: refreshToken});

        const newAccessToken = response.data.accessToken;
        const newRefreshToken = response.data.refreshToken;

        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);

      } catch (refreshError) {
          console.error("Refresh Token failed!!!", refreshError);
          // window.location.href = "/login"; // <--- וגם כאן תשימי // כדי לבטל
          return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  });

export default apiClient;