import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private api: AxiosInstance;
  private requestCache: Map<string, { data: any; timestamp: number }> = new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:3001/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  private getCacheKey(url: string, params?: any): string {
    return `${url}${params ? JSON.stringify(params) : ''}`;
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  private async deduplicateRequest<T>(
    key: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    const promise = requestFn();
    this.pendingRequests.set(key, promise);

    try {
      const result = await promise;
      return result;
    } finally {
      this.pendingRequests.delete(key);
    }
  }

  async get<T>(url: string, params?: any, useCache = true): Promise<ApiResponse<T>> {
    const cacheKey = this.getCacheKey(url, params);
    
    if (useCache && this.requestCache.has(cacheKey)) {
      const cached = this.requestCache.get(cacheKey)!;
      if (this.isCacheValid(cached.timestamp)) {
        return cached.data;
      }
      this.requestCache.delete(cacheKey);
    }

    return this.deduplicateRequest(cacheKey, async () => {
      try {
        const response = await this.api.get(url, { params });
        const result = response.data;
        
        if (useCache) {
          this.requestCache.set(cacheKey, {
            data: result,
            timestamp: Date.now(),
          });
        }
        
        return result;
      } catch (error) {
        throw this.handleError(error);
      }
    });
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.post(url, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.put(url, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async patch<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.patch(url, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.delete(url);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.response) {
      const message = error.response.data?.error || error.response.data?.message || 'Request failed';
      return new Error(message);
    } else if (error.request) {
      return new Error('Network error - no response received');
    } else {
      return new Error(error.message || 'An unexpected error occurred');
    }
  }

  clearCache(url?: string) {
    if (url) {
      const keysToDelete: string[] = [];
      this.requestCache.forEach((_, key) => {
        if (key.startsWith(url)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => this.requestCache.delete(key));
    } else {
      this.requestCache.clear();
    }
  }

  setAuthToken(token: string) {
    this.api.defaults.headers.common.Authorization = `Bearer ${token}`;
  }

  removeAuthToken() {
    delete this.api.defaults.headers.common.Authorization;
  }
}

export const apiService = new ApiService();
export default apiService; 