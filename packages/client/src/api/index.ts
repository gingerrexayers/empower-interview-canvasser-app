import redaxios, { type Response } from 'redaxios';

// Set base URL
redaxios.defaults.baseURL = import.meta.env.VITE_API_URL as string;

// Define a custom error class to mimic some aspects of AxiosError
export class HttpError extends Error {
  response?: Response<unknown>; // redaxios Response type
  status?: number;
  isHttpError = true;

  constructor(message: string, response?: Response<unknown>) {
    super(message);
    this.name = 'HttpError';
    this.response = response;
    this.status = response?.status;
  }
}

// Helper to create options with auth token
const createRequestOptions = (options?: Record<string, any>) => {
  const token = localStorage.getItem('authToken');
  const headers = { ...options?.headers };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return { ...options, headers };
};

// Wrapper functions
const processResponse = async <T = any>(promise: Promise<Response<T>>): Promise<Response<T>> => {
  try {
    const response = await promise;
    if (response.status < 200 || response.status >= 300) {
      // response.data should already be parsed by redaxios if it's JSON
      // Attempt to get a meaningful error message from response.data
      const errorData = response.data as any;
      const errorMessage = errorData?.message || errorData?.error || (typeof errorData === 'string' ? errorData : `Request failed with status ${response.status}`);
      throw new HttpError(errorMessage as string, response);
    }
    return response;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error; // Re-throw our custom HttpError
    }
    // Handle network errors or other non-HttpErrors (e.g., JSON parsing failed in redaxios if content-type is wrong)
    const message = error instanceof Error ? error.message : typeof error === 'string' ? error : 'An unknown network error occurred';
    throw new Error(message); // Throw a generic error for other cases
  }
};

const api = {
  get: <T = any>(url: string, options?: Record<string, any>)
    : Promise<Response<T>> =>
    processResponse(redaxios.get<T>(url, createRequestOptions(options))),
  post: <T = any>(url: string, data?: any, options?: Record<string, any>)
    : Promise<Response<T>> =>
    processResponse(redaxios.post<T>(url, data, createRequestOptions(options))),
  put: <T = any>(url: string, data?: any, options?: Record<string, any>)
    : Promise<Response<T>> =>
    processResponse(redaxios.put<T>(url, data, createRequestOptions(options))),
  delete: <T = any>(url: string, options?: Record<string, any>)
    : Promise<Response<T>> =>
    processResponse(redaxios.delete<T>(url, createRequestOptions(options))),
  patch: <T = any>(url: string, data?: any, options?: Record<string, any>)
    : Promise<Response<T>> =>
    processResponse(redaxios.patch<T>(url, data, createRequestOptions(options))),
  // Add other methods like head, options if needed
};

export default api;
