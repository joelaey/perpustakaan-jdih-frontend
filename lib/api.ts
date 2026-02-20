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

// Users API (admin only)
export const usersAPI = {
    getAll: () => api.get('/users'),
    create: (data: { name: string; email: string; password: string; role: string }) =>
        api.post('/users', data),
    update: (id: number, data: Record<string, unknown>) => api.put(`/users/${id}`, data),
    delete: (id: number) => api.delete(`/users/${id}`),
    updateProfile: (data: { name?: string; email?: string }) =>
        api.put('/users/profile', data),
    changePassword: (currentPassword: string, newPassword: string) =>
        api.put('/users/change-password', { currentPassword, newPassword }),
};

// Borrowings API
export const borrowingsAPI = {
    request: (bookId: number, notes?: string) =>
        api.post('/borrowings', { book_id: bookId, notes }),
    getAll: (params?: { status?: string; page?: number; limit?: number }) => {
        const searchParams = new URLSearchParams();
        if (params?.status) searchParams.set('status', params.status);
        if (params?.page) searchParams.set('page', String(params.page));
        if (params?.limit) searchParams.set('limit', String(params.limit));
        const qs = searchParams.toString();
        return api.get(`/borrowings${qs ? `?${qs}` : ''}`);
    },
    updateStatus: (id: number, status: string, adminNotes?: string) =>
        api.put(`/borrowings/${id}/status`, { status, admin_notes: adminNotes }),
    cancel: (id: number) => api.delete(`/borrowings/${id}`),
    getStats: () => api.get('/borrowings/stats'),
};

// Messages API
export const messagesAPI = {
    send: (receiverId: number, message: string) =>
        api.post('/messages', { receiver_id: receiverId, message }),
    getConversations: () => api.get('/messages/conversations'),
    getMessages: (partnerId: number) => api.get(`/messages/${partnerId}`),
    getUnreadCount: () => api.get('/messages/unread'),
    getAdmins: () => api.get('/messages/admins'),
};

export default api;

