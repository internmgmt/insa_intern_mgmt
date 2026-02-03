import fs from "fs";
import path from "path";
import os from "os";

export const isDev = process.env.NODE_ENV !== "production";

export function getUploadsRoot() {
  if (isDev) {
    const base = process.env.DEV_DATA_DIR || path.join(os.tmpdir(), "insa_intern_mgmt_dev");
    return path.join(base, "uploads");
  }
  return path.join(process.cwd(), "public", "uploads");
}

export function getDocumentsRoot() {
  return path.join(getUploadsRoot(), "documents");
}

export function getDataFile(name: string) {
  return path.join(getUploadsRoot(), `${name}.json`);
}

export function getDocumentsManifestPath() {
  return path.join(getDocumentsRoot(), "manifest.json");
}

export function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}
