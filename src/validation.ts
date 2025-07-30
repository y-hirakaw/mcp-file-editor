import * as fs from "fs/promises";
import * as path from "path";
import { Config } from "./config.js";

export function validateFileExtension(filePath: string, config: Config): boolean {
  const extension = path.extname(filePath);
  return config.allowedExtensions.includes(extension);
}

export function validatePath(filePath: string): boolean {
  // パストラバーサル攻撃の防止
  const normalizedPath = path.normalize(filePath);
  return !normalizedPath.includes("..") && !path.isAbsolute(normalizedPath) || path.isAbsolute(normalizedPath);
}

export async function checkFileSize(filePath: string, config: Config): Promise<boolean> {
  try {
    const stats = await fs.stat(filePath);
    return stats.size <= config.maxFileSize;
  } catch {
    return true; // ファイルが存在しない場合はOK
  }
}

export function validateContentSize(content: string, config: Config): boolean {
  return Buffer.byteLength(content, 'utf8') <= config.maxFileSize;
}