type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions {
    method?: RequestMethod;
    headers?: Record<string, string>;
    body?: unknown;
    timeout?: number;
}

class ApiService {
    private static instance: ApiService;
    private baseUrl: string;
    private accessToken: string | null = null;
    private defaultTimeout = 10000; // 10 seconds default timeout

    private constructor() {
        this.baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/api`;
    }

    public static getInstance(): ApiService {
        if (!ApiService.instance) {
            ApiService.instance = new ApiService();
        }
        return ApiService.instance;
    }

    public setAccessToken(token: string): void {
        this.accessToken = token;
    }

    public clearAccessToken(): void {
        this.accessToken = null;
    }

    private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const { method = 'GET', headers = {}, body, timeout = this.defaultTimeout } = options;
      
        const defaultHeaders: Record<string, string> = {
          ...headers,
        };
        
        // Only set Content-Type to application/json if body is not FormData
        if (!(body instanceof FormData)) {
          defaultHeaders['Content-Type'] = 'application/json';
        }
      
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('access_token');
          if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
          }
        }
      
        // Create AbortController for timeout handling
        const controller = new AbortController();
        const { signal } = controller;
        
        // Set timeout to abort the request if it takes too long
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, timeout);
        
        const requestOptions: RequestInit = {
          method,
          headers: defaultHeaders,
          credentials: 'include',
          signal,
        };
      
        if (body) {
          // Only stringify the body if it's not FormData
          requestOptions.body = body instanceof FormData ? body : JSON.stringify(body);
        }
      
        try {
          const response = await fetch(`${this.baseUrl}${endpoint}`, requestOptions);
          
          clearTimeout(timeoutId); // Clear timeout since request completed
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          return response.json();
        } catch (error) {
          clearTimeout(timeoutId); // Ensure timeout is cleared even on error
          
          // Check if the error was due to timeout
          if (error instanceof Error && error.name === 'AbortError') {
            throw new Error(`Request timeout after ${timeout}ms: ${endpoint}`);
          }
          
          throw error;
        }
      }

    public async get<T>(endpoint: string, headers?: Record<string, string>, timeout?: number): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET', headers, timeout });
    }

    public async post<T>(endpoint: string, body: unknown, headers?: Record<string, string>, timeout?: number): Promise<T> {
        return this.request<T>(endpoint, { method: 'POST', body, headers, timeout });
    }

    public async put<T>(endpoint: string, body: unknown, headers?: Record<string, string>, timeout?: number): Promise<T> {
        return this.request<T>(endpoint, { method: 'PUT', body, headers, timeout });
    }

    public async delete<T>(endpoint: string, headers?: Record<string, string>, timeout?: number): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE', headers, timeout });
    }

    public async patch<T>(endpoint: string, body: unknown, headers?: Record<string, string>, timeout?: number): Promise<T> {
        return this.request<T>(endpoint, { method: 'PATCH', body, headers, timeout });
    }
}

export const api = ApiService.getInstance();