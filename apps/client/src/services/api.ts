import axios, { type AxiosInstance } from 'axios';

const API_BASE_URL = '/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Clear token and redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Expose axios instance methods
  get<T = any>(url: string, config?: any) {
    return this.axiosInstance.get<T>(url, config);
  }

  post<T = any>(url: string, data?: any, config?: any) {
    return this.axiosInstance.post<T>(url, data, config);
  }

  put<T = any>(url: string, data?: any, config?: any) {
    return this.axiosInstance.put<T>(url, data, config);
  }

  delete<T = any>(url: string, config?: any) {
    return this.axiosInstance.delete<T>(url, config);
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await this.axiosInstance.post<AuthResponse>('/auth/register', credentials);
    return response.data;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.axiosInstance.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  }

  async getProfile(): Promise<User> {
    const response = await this.axiosInstance.get<User>('/auth/profile');
    return response.data;
  }

  async refreshToken(): Promise<AuthResponse> {
    const response = await this.axiosInstance.post<AuthResponse>('/auth/refresh');
    return response.data;
  }
}

export const apiService = new ApiService();
export const api = apiService;