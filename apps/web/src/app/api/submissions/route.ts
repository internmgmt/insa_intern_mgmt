import { proxyToBackend } from '@/app/api/_utils/proxy';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  return proxyToBackend(request);
}

export async function POST(request: Request) {
  return proxyToBackend(request);
}
