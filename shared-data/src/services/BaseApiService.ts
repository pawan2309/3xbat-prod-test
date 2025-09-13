import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, ApiRequestOptions, SharedDataError } from '../types';
import { getApiConfig } from '../config';

export class BaseApiService {
  protected api: AxiosInstance;
  private config = getApiConfig();

  constructor(baseURL?: string) {
    this.api = axios.create({
      baseURL: baseURL || this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors (unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            await this.refreshToken();
            return this.api(originalRequest);
          } catch (refreshError) {
            this.handleAuthError();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(this.handleApiError(error));
      }
    );
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  }

  private async refreshToken(): Promise<void> {
    // Implement token refresh logic
    // This should call your refresh token endpoint
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // Example refresh implementation
    // const response = await axios.post('/api/auth/refresh', { refreshToken });
    // localStorage.setItem('authToken', response.data.token);
  }

  private handleAuthError(): void {
    // Clear auth data and redirect to login
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
  }

  private handleApiError(error: any): SharedDataError {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      return new SharedDataError(
        data?.message || `HTTP ${status} Error`,
        `HTTP_${status}`,
        { status, data }
      );
    } else if (error.request) {
      // Request was made but no response received
      return new SharedDataError(
        'Network Error - No response from server',
        'NETWORK_ERROR',
        { request: error.request }
      );
    } else {
      // Something else happened
      return new SharedDataError(
        error.message || 'Unknown error occurred',
        'UNKNOWN_ERROR',
        { originalError: error }
      );
    }
  }

  protected async request<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      params,
      data,
      timeout = this.config.timeout,
    } = options;

    const config: AxiosRequestConfig = {
      method,
      url: endpoint,
      headers: { ...headers },
      params,
      data,
      timeout,
    };

    try {
      const response = await this.api.request(config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  protected async get<T>(
    endpoint: string,
    params?: Record<string, any>,
    options: Partial<ApiRequestOptions> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
      params,
    });
  }

  protected async post<T>(
    endpoint: string,
    data?: any,
    options: Partial<ApiRequestOptions> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      data,
    });
  }

  protected async put<T>(
    endpoint: string,
    data?: any,
    options: Partial<ApiRequestOptions> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      data,
    });
  }

  protected async delete<T>(
    endpoint: string,
    options: Partial<ApiRequestOptions> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }

  protected async patch<T>(
    endpoint: string,
    data?: any,
    options: Partial<ApiRequestOptions> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      data,
    });
  }
}
