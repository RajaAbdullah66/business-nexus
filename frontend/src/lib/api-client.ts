// lib/api-client.ts

import { API_BASE_URL } from "./config";

interface ApiClientOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  credentials?: RequestCredentials;
}

interface ApiError extends Error {
  status?: number | string;
  data?: any;
}

/**
 * Makes an authenticated API request to the backend
 * @param endpoint - API endpoint (without the base URL)
 * @param options - Request options (method, headers, body)
 * @returns Promise with the response data
 */
export async function apiClient<T>(endpoint: string, options: ApiClientOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get the auth token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  // Default headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add auth token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Request configuration
  const config: RequestInit = {
    method: options.method || 'GET',
    headers,
    credentials: options.credentials || 'include',
  };
  
  // Add body if provided (and not GET request)
  if (options.body && config.method !== 'GET') {
    config.body = JSON.stringify(options.body);
  }
  
  try {
    const response = await fetch(url, config);
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      // Handle API errors
      if (!response.ok) {
        const error = new Error(data.message || 'An error occurred while fetching the data.') as ApiError;
        error.status = response.status;
        error.data = data;
        throw error;
      }
      
      return data;
    } else {
      // Handle non-JSON responses (like file downloads)
      if (!response.ok) {
        const error = new Error('An error occurred while fetching the data.') as ApiError;
        error.status = response.status;
        throw error;
      }
      
      return response as unknown as T;
    }
  } catch (error: unknown) {
    // Handle network errors or JSON parsing errors
    const apiError = error as ApiError;
    
    if (!apiError.status) {
      apiError.status = 'network-error';
      apiError.message = 'Network error. Please check your connection.';
    }
    
    // Re-throw the error for the caller to handle
    throw apiError;
  }
}

/**
 * Helper function for GET requests
 */
export function get<T>(endpoint: string, options: Omit<ApiClientOptions, 'method'> = {}): Promise<T> {
  return apiClient<T>(endpoint, { ...options, method: 'GET' });
}

/**
 * Helper function for POST requests
 */
export function post<T>(endpoint: string, body: any, options: Omit<ApiClientOptions, 'method' | 'body'> = {}): Promise<T> {
  return apiClient<T>(endpoint, { ...options, method: 'POST', body });
}

/**
 * Helper function for PATCH requests
 */
export function patch<T>(endpoint: string, body: any, options: Omit<ApiClientOptions, 'method' | 'body'> = {}): Promise<T> {
  return apiClient<T>(endpoint, { ...options, method: 'PATCH', body });
}

/**
 * Helper function for DELETE requests
 */
export function del<T>(endpoint: string, options: Omit<ApiClientOptions, 'method'> = {}): Promise<T> {
  return apiClient<T>(endpoint, { ...options, method: 'DELETE' });
}