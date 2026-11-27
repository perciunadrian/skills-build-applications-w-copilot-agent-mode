// Relative /api paths go through the Vite dev proxy, so port 8000 never needs to be public.
export const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

export function workoutSuggestionsPath(userEmail: string): string {
  return `/api/workouts/suggestions/${encodeURIComponent(userEmail)}`;
}

function getErrorDetail(body: string): string | undefined {
  const text = body.trim();
  if (!text) return undefined;

  try {
    const payload: unknown = JSON.parse(text);
    if (typeof payload === 'object' && payload !== null) {
      const error = 'error' in payload ? payload.error : undefined;
      const message = 'message' in payload ? payload.message : undefined;
      if (typeof error === 'string') return error;
      if (typeof message === 'string') return message;
    }
  } catch {
    return text;
  }

  return text;
}

export async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`);
  if (!response.ok) {
    const detail = getErrorDetail(await response.text());
    throw new Error(detail ? `Request failed with ${response.status}: ${detail}` : `Request failed with ${response.status}`);
  }
  return response.json() as Promise<T>;
}
