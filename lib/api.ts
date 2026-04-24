// API client for frontend components
import axios from 'axios';

/**
 * API_BASE_URL Configuration
 * 
 * Development: '' (empty string = relative URLs to same server)
 * Production: 'https://gsttaxwale.com' or full URL from env
 * 
 * IMPORTANT: Do NOT include '/api' suffix here - backend routes handle it!
 * Backend routes are at /api/auth/login, /api/orders, etc.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable credentials (cookies, authorization)
});

// Request interceptor: Add authorization token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle errors and token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
