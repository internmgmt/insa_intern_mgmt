import { proxyToBackend } from "@/app/api/_utils/proxy";

export const runtime = "nodejs";

export async function DELETE(request: Request) {
  return proxyToBackend(request);
}
