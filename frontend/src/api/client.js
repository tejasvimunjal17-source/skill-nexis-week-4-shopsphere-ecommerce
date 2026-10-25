// All calls to the backend go through this file.
const BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');
export const TOKEN_KEY = 'shopsphere_token';

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details || null;
  }
}

let onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

async function request(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${BASE}${path}`, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError('Cannot reach the server. Check your internet connection and try again.', 0);
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    /* response had no JSON body */
  }

  if (!response.ok) {
    if (response.status === 401 && token && onUnauthorized) onUnauthorized();
    throw new ApiError((data && data.message) || `Request failed (${response.status}).`, response.status, data && data.errors);
  }
  return data;
}

const query = (params) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v !== '' && v != null && qs.set(k, v));
  const text = qs.toString();
  return text ? `?${text}` : '';
};

export const api = {
  register: (body) => request('/auth/register', { method: 'POST', body }),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  me: () => request('/auth/me'),

  listProducts: (params = {}) => request(`/products${query(params)}`),
  categories: () => request('/products/categories'),
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (body) => request('/products', { method: 'POST', body }),
  updateProduct: (id, body) => request(`/products/${id}`, { method: 'PUT', body }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  createOrder: (body) => request('/orders', { method: 'POST', body }),
  myOrders: () => request('/orders/mine'),
  getOrder: (id) => request(`/orders/${id}`),
};
