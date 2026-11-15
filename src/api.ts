const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '');

export const buildApiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export const getErrorMessage = async (response: Response) => {
  const rawText = await response.text();

  if (!rawText) {
    return 'Respuesta inesperada del servidor.';
  }

  try {
    const parsed = JSON.parse(rawText);
    if (typeof parsed === 'string') {
      return parsed;
    }

    return parsed?.detail ?? parsed?.error ?? rawText;
  } catch {
    return rawText;
  }
};
