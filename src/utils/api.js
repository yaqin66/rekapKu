const API_URL = '/api';

export async function apiGet(endpoint) {
  const response = await fetch(`${API_URL}${endpoint}`);
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Terjadi kesalahan saat mengambil data');
  }
  return response.json();
}

export async function apiPost(endpoint, data) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Terjadi kesalahan saat menyimpan data');
  }
  return response.json();
}

export async function apiPut(endpoint, data) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Terjadi kesalahan saat mengupdate data');
  }
  return response.json();
}

export async function apiDelete(endpoint) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Terjadi kesalahan saat menghapus data');
  }
  return true;
}
