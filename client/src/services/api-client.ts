import axios from "axios";

// Create an axios instance with the base URL of your backend
const apiClient = axios.create({
    baseURL: "http://localhost:3000",
});

export default apiClient;