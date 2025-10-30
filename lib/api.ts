// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_URL_IMPORTS || 'http://localhost:8000';

interface ImportacionesParams {
  fecha_start?: string;
  fecha_end?: string;
  nombre_importador?: string;
  rut_importador?: string;
  producto?: string;
  pais_origen?: string;
}

export async function getImportaciones(params: ImportacionesParams) {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });

  const url = `${API_BASE_URL}/importaciones/query/?${queryParams.toString()}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }

  return response.json();
}