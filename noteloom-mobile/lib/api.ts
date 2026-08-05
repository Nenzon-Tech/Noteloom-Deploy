import axios from 'axios';
import { API_BASE, HF_TOKEN } from './constants';
import { getSecure } from './storage';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export const authHeaders = (token?: string | null): Record<string, string> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (HF_TOKEN) headers.Authorization = `Bearer ${HF_TOKEN}`;
  if (token) headers['x-user-token'] = `Bearer ${token}`;
  return headers;
};

api.interceptors.request.use(async (config) => {
  try {
    const token = await getSecure('sessionToken');
    if (HF_TOKEN) config.headers.Authorization = `Bearer ${HF_TOKEN}`;
    if (token) config.headers['x-user-token'] = `Bearer ${token}`;
  } catch {}
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Session expired - handled by useSessionManager
    }
    return Promise.reject(error);
  }
);

export const apiGet = async <T>(url: string, params?: Record<string, any>): Promise<T> => {
  const response = await api.get<T>(url, { params });
  return response.data;
};

export const apiPost = async <T>(url: string, data?: any): Promise<T> => {
  const response = await api.post<T>(url, data);
  return response.data;
};

export default api;
