import { supabase } from '@/lib/supabase/client';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface ApiOptions {
  method: HttpMethod;
  data?: unknown;
  requiresAuth?: boolean;
}

const buildHeaders = async (requiresAuth: boolean) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (requiresAuth) {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Auth error:', error);
      window.location.href = '/login';
      throw new Error('Authentication required');
    }
    
    if (data.user) {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.access_token) {
        headers['Authorization'] = `Bearer ${sessionData.session.access_token}`;
      } else {
        window.location.href = '/login';
        throw new Error('Authentication required');
      }
    } else {
      window.location.href = '/login';
      throw new Error('Authentication required');
    }
  }

  return headers;
};

export const apiService = async (endpoint: string, { method, data, requiresAuth = true }: ApiOptions) => {
  try {
    const headers = await buildHeaders(requiresAuth);

    let url = endpoint;
    const config: RequestInit = {
      method,
      headers,
    };

    if (method === 'GET' && data) {
      const params = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    } else if (data) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export const api = {
  get: <T>(endpoint: string, params?: unknown, requiresAuth = true) =>
    apiService(endpoint, { method: 'GET', data: params, requiresAuth }) as Promise<T>,

  post: <T>(endpoint: string, data?: unknown, requiresAuth = true) =>
    apiService(endpoint, { method: 'POST', data, requiresAuth }) as Promise<T>,

  put: <T>(endpoint: string, data?: unknown, requiresAuth = true) =>
    apiService(endpoint, { method: 'PUT', data, requiresAuth }) as Promise<T>,

  delete: <T>(endpoint: string, data?: unknown, requiresAuth = true) =>
    apiService(endpoint, { method: 'DELETE', data, requiresAuth }) as Promise<T>,

  patch: <T>(endpoint: string, data?: unknown, requiresAuth = true) =>
    apiService(endpoint, { method: 'PATCH', data, requiresAuth }) as Promise<T>,
};
