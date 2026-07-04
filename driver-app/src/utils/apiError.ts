import axios from 'axios';

export function apiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const serverMsg = err.response?.data?.error;
    if (typeof serverMsg === 'string') return serverMsg;
    if (err.message.includes('Network Error') || !err.response) {
      return 'Could not reach server. Check Wi‑Fi and that the backend is running at your API URL.';
    }
  }
  return fallback;
}
