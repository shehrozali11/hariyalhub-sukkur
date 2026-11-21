const API_BASE = import.meta.env.VITE_API_URL || 'https://hariyalhub-sukkur-eq4y.vercel.app/api';

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('hh_nursery_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'API Request Failed');
  return data;
}
