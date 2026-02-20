import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add token
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('jdih_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle 401/403
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('jdih_token');
                localStorage.removeItem('jdih_user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }),
    register: (name: string, email: string, password: string) =>
        api.post('/auth/register', { name, email, password }),
    getProfile: () => api.get('/auth/profile'),
};

// Books API
export interface BookQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    field_type?: string;
    year?: string;
}

export const booksAPI = {
    getAll: (params?: BookQueryParams) => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.set('page', String(params.page));
        if (params?.limit) searchParams.set('limit', String(params.limit));
        if (params?.search) searchParams.set('search', params.search);
        if (params?.field_type) searchParams.set('field_type', params.field_type);
        if (params?.year) searchParams.set('year', params.year);
        const qs = searchParams.toString();
        return api.get(`/books${qs ? `?${qs}` : ''}`);
    },
    getById: (id: number) => api.get(`/books/${id}`),
    create: (data: Record<string, unknown>) => api.post('/books', data),
    update: (id: number, data: Record<string, unknown>) => api.put(`/books/${id}`, data),
    delete: (id: number) => api.delete(`/books/${id}`),
    getFieldTypes: () => api.get('/books/field-types'),
    getStats: () => api.get('/books/stats'),
    getRecommendations: (id: number) => api.get(`/books/${id}/recommendations`),
};

export default api;
