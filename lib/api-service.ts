type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions {
    method?: RequestMethod;
    headers?: Record<string, string>;
    body?: unknown;
}

class ApiService {
    private static instance: ApiService;
    private baseUrl: string;
    private accessToken: string | null = null;

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
        const { method = 'GET', headers = {}, body } = options;
      
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
      
        const requestOptions: RequestInit = {
          method,
          headers: defaultHeaders,
          credentials: 'include',
        };
      
        if (body) {
          // Only stringify the body if it's not FormData
          requestOptions.body = body instanceof FormData ? body : JSON.stringify(body);
        }
      
        const response = await fetch(`${this.baseUrl}${endpoint}`, requestOptions);
      
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      
        return response.json();
      }

    public async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET', headers });
    }

    public async post<T>(endpoint: string, body: unknown, headers?: Record<string, string>): Promise<T> {
        return this.request<T>(endpoint, { method: 'POST', body, headers });
    }

    public async put<T>(endpoint: string, body: unknown, headers?: Record<string, string>): Promise<T> {
        return this.request<T>(endpoint, { method: 'PUT', body, headers });
    }

    public async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE', headers });
    }

    public async patch<T>(endpoint: string, body: unknown, headers?: Record<string, string>): Promise<T> {
        return this.request<T>(endpoint, { method: 'PATCH', body, headers });
    }
}

export const api = ApiService.getInstance();