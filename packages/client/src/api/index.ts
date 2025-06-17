import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a Response Interceptor for error handling
api.interceptors.response.use(
  (response) => response, // Pass through successful responses
  (error) => {
    // If the error is a 401 Unauthorized, log the user out
    if (error.response && error.response.status === 401) {
      // Prevent infinite loops if the logout itself fails
      if (!error.config.url.includes("/auth/login")) {
        localStorage.removeItem("authToken");
        // Redirect to login, force a page reload to clear all state
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
