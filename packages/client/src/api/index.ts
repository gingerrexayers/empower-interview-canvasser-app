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
    if (axios.isAxiosError(error)) {
      // The error is an AxiosError. We will pass it along for the calling code to handle.
      // Specific handling for 401 errors (like triggering logout) will be done
      // in the React Query hooks or components that initiate the API call.
      return Promise.reject(error);
    } else {
      // Handle non-Axios errors
      return Promise.reject(new Error(error instanceof Error ? error.message : (typeof error === 'string' ? error : 'An unknown error occurred in the response interceptor')));
    }
  }
);

export default api;
