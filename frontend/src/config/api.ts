/**
 * API Configuration
 * Centralized configuration for API endpoints
 */

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Export individual endpoints for better organization
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_URL}/auth/login`,
    SIGNUP: `${API_URL}/auth/signup`,
  },
  EVENTS: `${API_URL}/events`,
};
