import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// Wishlist
export const getWishlist = () => api.get('/wishlist').then((r) => r.data.data);
export const addToWishlist = (bookId: number) => api.post(`/wishlist/${bookId}`);
export const removeFromWishlist = (bookId: number) => api.delete(`/wishlist/${bookId}`);

// Coupons
export const validateCoupon = (code: string, orderTotal: number) =>
  api.post('/coupons/validate', { code, orderTotal }).then((r) => r.data.data);

// Profile
export const getProfile = () => api.get('/profile').then((r) => r.data.data);
export const updateProfile = (data: { name?: string; email?: string; currentPassword: string }) =>
  api.put('/profile', data).then((r) => r.data.data);

// Search suggestions
export const getSearchSuggestions = (q: string) =>
  api.get('/books/suggestions', { params: { q } }).then((r) => r.data.data);

export default api;
