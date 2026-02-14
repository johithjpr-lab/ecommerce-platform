const API_BASE = '/api';

const getHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('token');
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

const request = async (url, options = {}) => {
  const res = await fetch(`${API_BASE}${url}`, { headers: getHeaders(), ...options });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

export const api = {
  // Auth
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: () => request('/auth/profile'),
  updateProfile: (data) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
  addAddress: (data) => request('/auth/addresses', { method: 'POST', body: JSON.stringify(data) }),
  deleteAddress: (id) => request(`/auth/addresses/${id}`, { method: 'DELETE' }),

  // Products
  getProducts: (params = '') => request(`/products${params ? `?${params}` : ''}`),
  getProduct: (id) => request(`/products/${id}`),
  getCategories: () => request('/products/meta/categories'),

  // Orders
  createOrder: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  getOrders: () => request('/orders'),
  getOrder: (id) => request(`/orders/${id}`),

  // Payments
  getPaymentMethods: () => request('/payments/methods'),
  createPaymentIntent: (data) => request('/payments/stripe/create-intent', { method: 'POST', body: JSON.stringify(data) }),
  getWallet: () => request('/payments/wallet'),
  addWalletFunds: (amount) => request('/payments/wallet/add', { method: 'POST', body: JSON.stringify({ amount }) }),

  // Tracking
  getTracking: (orderId) => request(`/tracking/order/${orderId}`),
  trackByNumber: (num) => request(`/tracking/track/${num}`),

  // Admin
  getAdminStats: () => request('/admin/stats'),
  getInventory: () => request('/admin/inventory'),
  getAdminPayments: () => request('/admin/payments'),
  getAdminCustomers: () => request('/admin/customers'),
  getAllOrders: (params = '') => request(`/orders/admin/all${params ? `?${params}` : ''}`),
  updateOrderStatus: (id, data) => request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),
  createProduct: (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),
};
