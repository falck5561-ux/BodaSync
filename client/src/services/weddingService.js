const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const WEDDINGS_URL = `${API_BASE_URL}/weddings`;

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message || 'Ocurrió un error al comunicarse con el servidor.'
    );
  }

  return data;
}

export function createWedding(weddingData) {
  return request(WEDDINGS_URL, {
    method: 'POST',
    body: JSON.stringify(weddingData)
  });
}

export function getWeddings() {
  return request(WEDDINGS_URL);
}

export function getWeddingBySlug(slug) {
  return request(`${WEDDINGS_URL}/${encodeURIComponent(slug)}`);
}

export function deleteWedding(id) {
  return request(`${WEDDINGS_URL}/${id}`, {
    method: 'DELETE'
  });
}