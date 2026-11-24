const API_BASE = 'https://hariyalhub-sukkur-eq4y.vercel.app/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('hh_nursery_token');
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
}