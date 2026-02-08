import { promises as fs } from 'fs';
import * as path from 'path';
import { diskStorage } from 'multer';
import type { Request } from 'express';
import type { Express } from 'express';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR =
  process.env.FILE_UPLOAD_DIR ||
  path.join(process.cwd(), 'uploads', 'documents');
const PUBLIC_BASE_URL =
  process.env.FILE_BASE_URL || `http://localhost:${process.env.PORT || 5005}`;

async function ensureUploadDir(): Promise<string> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  return UPLOAD_DIR;
}

function generateFileName(originalName: string): string {
  const ext = path.extname(originalName || '') || '';
  return `${uuidv4()}${ext}`;
}

function getRelativePath(fileName: string): string {
  return path.join('documents', fileName);
}

function getAbsolutePath(fileName: string): string {
  return path.join(UPLOAD_DIR, fileName);
}

function getPublicUrl(fileNameOrPath: string): string {
  const fileName = path.basename(fileNameOrPath);
  return `${PUBLIC_BASE_URL}/uploads/documents/${fileName}`;
}

const multerStorage = diskStorage({
  destination: async (
    _req: Request,
    _file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void,
  ) => {
    try {
      const dir = await ensureUploadDir();
      cb(null, dir);
    } catch (err: any) {
      cb(err, '');
    }
  },
  filename: (
    _req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void,
  ) => {
    const name = generateFileName(file.originalname);
    cb(null, name);
  },
});

async function saveFileFromBuffer(buffer: Buffer, originalName: string) {
  const fileName = generateFileName(originalName);
  await ensureUploadDir();
  const absolute = getAbsolutePath(fileName);
  await fs.writeFile(absolute, buffer);
  return {
    fileName,
    path: absolute,
    url: getPublicUrl(fileName),
  };
}

async function removeFileByName(fileName: string) {
  const absolute = getAbsolutePath(fileName);
  try {
    await fs.unlink(absolute);
    return true;
  } catch {
    return false;
  }
}

export {
  UPLOAD_DIR,
  ensureUploadDir,
  generateFileName,
  getRelativePath,
  getAbsolutePath,
  getPublicUrl,
  multerStorage,
  saveFileFromBuffer,
  removeFileByName,
};
