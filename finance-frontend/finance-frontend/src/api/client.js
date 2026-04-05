// src/api/client.js
// Central fetch wrapper — attaches JWT, parses JSON, throws on errors

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function getToken() {
  return localStorage.getItem('fin_token');
}

async function request(method, path, body = null) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    const err = new Error(data.message || 'Request failed');
    err.status = res.status;
    err.errors = data.errors || null;
    throw err;
  }
  return data;
}

// Auth
export const authApi = {
  login:    (body) => request('POST', '/api/auth/login', body),
  register: (body) => request('POST', '/api/auth/register', body),
  me:       ()     => request('GET',  '/api/auth/me'),
};

// Users
export const usersApi = {
  list:   (params = {}) => request('GET',    `/api/users?${new URLSearchParams(params)}`),
  get:    (id)           => request('GET',    `/api/users/${id}`),
  create: (body)         => request('POST',   '/api/users', body),
  update: (id, body)     => request('PATCH',  `/api/users/${id}`, body),
  delete: (id)           => request('DELETE', `/api/users/${id}`),
};

// Records
export const recordsApi = {
  list:   (params = {}) => {
    const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null));
    return request('GET', `/api/records?${new URLSearchParams(clean)}`);
  },
  get:    (id)       => request('GET',    `/api/records/${id}`),
  create: (body)     => request('POST',   '/api/records', body),
  update: (id, body) => request('PATCH',  `/api/records/${id}`, body),
  delete: (id)       => request('DELETE', `/api/records/${id}`),
};

// Dashboard
export const dashboardApi = {
  summary:    (params = {}) => request('GET', `/api/dashboard/summary?${new URLSearchParams(params)}`),
  byCategory: (params = {}) => request('GET', `/api/dashboard/by-category?${new URLSearchParams(params)}`),
  trends:     (params = {}) => request('GET', `/api/dashboard/trends?${new URLSearchParams(params)}`),
  recent:     (params = {}) => request('GET', `/api/dashboard/recent?${new URLSearchParams(params)}`),
};
