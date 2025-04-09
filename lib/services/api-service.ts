import { supabase } from '@/lib/supabase/client';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface ApiOptions {
  method: HttpMethod;
  data?: any;
  requiresAuth?: boolean;
}

/**
 * Centralized API service for making HTTP requests to your backend API
 * 
 * @param endpoint - The API endpoint to call (e.g., '/api/calendar')
 * @param options - Request options including method, data, and auth requirements
 * @returns The response data or throws an error
 */
export const apiService = async (endpoint: string, options: ApiOptions) => {
  const { method, data, requiresAuth = true } = options;
  
  // Build request configuration
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Add request body for non-GET requests
  if (data && method !== 'GET') {
    config.body = JSON.stringify(data);
  }

  // For GET requests with query params, append them to the URL
  let url = endpoint;
  if (method === 'GET' && data) {
    const params = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      params.append(key, String(value));
    });
    url = `${endpoint}?${params.toString()}`;
  }

  try {
    // Make the API request
    const response = await fetch(url, config);
    
    // Handle authentication errors
    if (response.status === 401 && requiresAuth) {
      // Check if we still have a valid session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // If no session, redirect to login
        window.location.href = '/login';
        throw new Error('Authentication required');
      }
    }
    
    // Parse the response
    const responseData = await response.json();
    
    // Handle API errors
    if (!response.ok) {
      throw new Error(responseData.error || 'An error occurred');
    }
    
    return responseData;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Helper methods for common HTTP verbs
export const api = {
  get: (endpoint: string, params?: any, requiresAuth = true) => 
    apiService(endpoint, { method: 'GET', data: params, requiresAuth }),
    
  post: (endpoint: string, data?: any, requiresAuth = true) => 
    apiService(endpoint, { method: 'POST', data, requiresAuth }),
    
  put: (endpoint: string, data?: any, requiresAuth = true) => 
    apiService(endpoint, { method: 'PUT', data, requiresAuth }),
    
  delete: (endpoint: string, data?: any, requiresAuth = true) => 
    apiService(endpoint, { method: 'DELETE', data, requiresAuth }),
    
  patch: (endpoint: string, data?: any, requiresAuth = true) => 
    apiService(endpoint, { method: 'PATCH', data, requiresAuth }),
}; 