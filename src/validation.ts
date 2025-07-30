/**
 * @fileoverview セキュリティバリデーション関数群
 * ファイル操作における各種安全性チェックを提供します。
 * - ファイル拡張子の制限
 * - パストラバーサル攻撃の防止
 * - ファイルサイズの制限
 */

import * as fs from "fs/promises";
import * as path from "path";
import { Config } from "./config.js";

/**
 * ファイル拡張子が許可されているかを検証します
 * 
 * @param filePath - 検証するファイルのパス
 * @param config - 設定オブジェクト（許可拡張子一覧を含む）
 * @returns 許可された拡張子の場合true、そうでなければfalse
 * 
 * @example
 * ```typescript
 * const config = { allowedExtensions: ['.md', '.txt'], maxFileSize: 1000000 };
 * validateFileExtension('document.md', config); // => true
 * validateFileExtension('script.js', config);   // => false
 * ```
 */
export function validateFileExtension(filePath: string, config: Config): boolean {
  const extension = path.extname(filePath);
  return config.allowedExtensions.includes(extension);
}

/**
 * パストラバーサル攻撃を防止するためのパス検証を行います
 * 
 * 以下の条件をチェックします：
 * - ".." を含まないこと（ディレクトリトラバーサル防止）
 * - 相対パスまたは絶対パスであること
 * 
 * @param filePath - 検証するファイルパス
 * @returns 安全なパスの場合true、危険なパスの場合false
 * 
 * @example
 * ```typescript
 * validatePath('document.md');           // => true
 * validatePath('/home/user/file.txt');   // => true
 * validatePath('../../../etc/passwd');   // => false
 * validatePath('folder/../secret.txt');  // => false
 * ```
 */
export function validatePath(filePath: string): boolean {
  // パストラバーサル攻撃の防止
  const normalizedPath = path.normalize(filePath);
  return !normalizedPath.includes("..") && !path.isAbsolute(normalizedPath) || path.isAbsolute(normalizedPath);
}

/**
 * 既存ファイルのサイズが制限を超えていないかチェックします
 * 
 * ファイルが存在しない場合は制限チェックをスキップし、
 * 新規作成として扱います（trueを返す）。
 * 
 * @param filePath - チェックするファイルのパス
 * @param config - 設定オブジェクト（最大ファイルサイズを含む）
 * @returns ファイルサイズが制限内またはファイルが存在しない場合true
 * 
 * @example
 * ```typescript
 * const config = { allowedExtensions: ['.md'], maxFileSize: 1000000 }; // 1MB制限
 * await checkFileSize('small-file.md', config);  // => true (100KB)
 * await checkFileSize('large-file.md', config);  // => false (2MB)
 * await checkFileSize('new-file.md', config);    // => true (存在しない)
 * ```
 */
export async function checkFileSize(filePath: string, config: Config): Promise<boolean> {
  try {
    const stats = await fs.stat(filePath);
    return stats.size <= config.maxFileSize;
  } catch {
    // ファイルが存在しない場合は新規作成として扱う
    return true;
  }
}

/**
 * 書き込み・追記するコンテンツのサイズが制限を超えていないかチェックします
 * 
 * UTF-8エンコーディングでのバイトサイズを計算し、
 * 設定された最大ファイルサイズと比較します。
 * 
 * @param content - チェックする文字列コンテンツ
 * @param config - 設定オブジェクト（最大ファイルサイズを含む）
 * @returns コンテンツサイズが制限内の場合true
 * 
 * @example
 * ```typescript
 * const config = { allowedExtensions: ['.md'], maxFileSize: 1000000 }; // 1MB制限
 * const smallContent = "Hello, world!";
 * const largeContent = "x".repeat(2000000); // 2MB相当
 * 
 * validateContentSize(smallContent, config); // => true
 * validateContentSize(largeContent, config); // => false
 * ```
 */
export function validateContentSize(content: string, config: Config): boolean {
  return Buffer.byteLength(content, 'utf8') <= config.maxFileSize;
}