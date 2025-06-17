import axios, {
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
} from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Add a Response Interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response, // Pass through successful responses
  (error: unknown) => {
    // Start with unknown, then check type
    if (axios.isAxiosError(error)) {
      // Type guard for AxiosError
      // error is now typed as AxiosError
      if (error.response && error.response.status === 401) {
        // error.config is guaranteed to exist on AxiosError if the request was made
        if (error.config && !error.config.url?.includes("/auth/login")) {
          localStorage.removeItem("authToken");
          window.location.href = "/login";
        }
      }
      return Promise.reject(error); // AxiosError is an instance of Error
    } else {
      // Handle non-Axios errors
      return Promise.reject(new Error(error instanceof Error ? error.message : (typeof error === 'string' ? error : 'An unknown error occurred in the response interceptor')));
    }
  }
);

export default api;
