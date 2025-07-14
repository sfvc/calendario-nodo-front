const API_URL = import.meta.env.VITE_API_URL;

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("token");
  if (options.method === 'PATCH') {
    console.log('📦 PATCH BODY:', options.body);
  }
  const res = await fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',
    ...options,
    mode: 'cors', // 👈 necesario para CORS cross-origin
    credentials: 'include', // 👈 solo si usás cookies o necesitas headers auth

    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Error HTTP:', res.status, errorText);
    throw new Error(`Error ${res.status}: ${errorText}`);
  }
  console.log('➡ URL final:', `${API_URL}${path}`);
  return res.json();
}