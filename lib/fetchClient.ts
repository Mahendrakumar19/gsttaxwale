/**
 * Browser-compatible Fetch API client
 * Replaces axios for client-side use in Next.js 14
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gsttaxwale.com';

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class FetchClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Check all possible token locations
    return (
      sessionStorage.getItem('token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('authToken')
    );
  }

  private buildUrl(endpoint: string): string {
    if (endpoint.startsWith('http')) {
      return endpoint;
    }
    const baseUrl = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL;
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${path}`;
  }

  private getHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  async request<T = any>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const headers = this.getHeaders(options.headers);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      let data: any;
      try {
        data = await response.json();
      } catch {
        // If response is not JSON, create a simple error response
        data = { 
          message: `HTTP ${response.status}`,
          error: response.statusText 
        };
      }

      if (!response.ok) {
        // Handle 401 - redirect to login
        if (response.status === 401) {
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('token');
            localStorage.removeItem('token');
            localStorage.removeItem('authToken');
            window.location.href = '/auth/login';
          }
        }
        
        // Extract error message from various possible response structures
        const errorMessage = 
          data?.message || 
          data?.error?.message || 
          data?.error ||
          data?.errors?.[0]?.message ||
          `HTTP ${response.status}: ${response.statusText}`;
        
        const error = new Error(errorMessage);
        (error as any).status = response.status;
        (error as any).response = data;
        throw error;
      }

      return data;
    } catch (error: any) {
      // If it's already our error with proper message, just log it
      if (error instanceof Error && error.message) {
        console.error(`[FetchClient] ${options.method || 'GET'} ${endpoint}:`, error.message);
      } else {
        // Network or parsing error
        console.error(`[FetchClient] ${options.method || 'GET'} ${endpoint}:`, error);
      }
      throw error;
    }
  }

  async get<T = any>(endpoint: string, options: FetchOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T = any>(
    endpoint: string,
    body?: any,
    options: FetchOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T = any>(
    endpoint: string,
    body?: any,
    options: FetchOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T = any>(
    endpoint: string,
    body?: any,
    options: FetchOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T = any>(endpoint: string, options: FetchOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const fetchClient = new FetchClient();
export default fetchClient;
