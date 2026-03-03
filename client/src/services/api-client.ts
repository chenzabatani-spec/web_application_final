import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3000",
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

export default apiClient;