const API_URL = '/api';

// Helper untuk mengambil token dari localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export async function apiGet(endpoint) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    if (response.status === 401) window.dispatchEvent(new Event('auth_unauthorized'));
    throw new Error(err.error || 'Terjadi kesalahan saat mengambil data');
  }
  return response.json();
}

export async function apiPost(endpoint, data) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    if (response.status === 401) window.dispatchEvent(new Event('auth_unauthorized'));
    throw new Error(err.error || 'Terjadi kesalahan saat menyimpan data');
  }
  return response.json();
}

export async function apiPut(endpoint, data) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    if (response.status === 401) window.dispatchEvent(new Event('auth_unauthorized'));
    throw new Error(err.error || 'Terjadi kesalahan saat mengupdate data');
  }
  return response.json();
}

export async function apiDelete(endpoint) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    if (response.status === 401) window.dispatchEvent(new Event('auth_unauthorized'));
    throw new Error(err.error || 'Terjadi kesalahan saat menghapus data');
  }
  return true;
}
