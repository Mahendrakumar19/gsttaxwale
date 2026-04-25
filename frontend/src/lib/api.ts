import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('adminToken');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Extract data from backend response
 * Backend returns: { success, message, data: {...}, timestamp }
 */
export function extractData(response: any) {
  if (response?.data?.data) {
    return response.data.data;
  }
  return response?.data || response;
}

/**
 * Helper to fetch from backend with proper error handling
 */
export async function fetchWithAuth(url: string, options: any = {}) {
  try {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return extractData(data);
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

export default api;
