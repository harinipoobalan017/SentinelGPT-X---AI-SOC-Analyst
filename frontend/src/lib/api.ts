const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface FetchOptions extends RequestInit {
  data?: any;
}

export async function apiFetch(endpoint: string, options: FetchOptions = {}) {
  const { data, headers: customHeaders, ...customOptions } = options;

  const token = localStorage.getItem('sentinel_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method: data ? 'POST' : 'GET',
    ...customOptions,
    headers: {
      ...headers,
      ...customHeaders,
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (response.status === 401) {
    localStorage.removeItem('sentinel_token');
    localStorage.removeItem('sentinel_user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  let result;
  try {
    result = await response.json();
  } catch (err) {
    result = null;
  }

  if (!response.ok) {
    throw new Error(result?.error || 'Something went wrong');
  }

  return result;
}
