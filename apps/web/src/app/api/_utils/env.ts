export const useMockApi = (process.env.NEXT_ENABLE_MOCK_API || '').toLowerCase() === 'true';

export function getBackendBaseUrl() {
  // Prefer explicit API proxy target; fallback to public base for server-side usage
  return process.env.API_PROXY_TARGET || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5005';
}
