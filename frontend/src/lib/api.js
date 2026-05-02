const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function request(path, options = {}) {
  const token = localStorage.getItem('biteflow_admin_token');
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed.' }));
    throw new Error(error.message || 'Request failed.');
  }

  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  url: API_URL,
  products: () => request('/api/products'),
  createProduct: (body) => request('/api/products', { method: 'POST', body: JSON.stringify(body) }),
  updateProduct: (id, body) => request(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteProduct: (id) => request(`/api/products/${id}`, { method: 'DELETE' }),
  placeOrder: (body) => request('/api/orders', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  orders: () => request('/api/orders'),
  analytics: () => request('/api/analytics'),
  updateStatus: (id, status) => request(`/api/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  confirmPayment: (id) => request(`/api/orders/${id}/payment`, { method: 'PATCH', body: JSON.stringify({}) })
};
