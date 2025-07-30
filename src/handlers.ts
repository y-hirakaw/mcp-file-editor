import * as fs from "fs/promises";
import * as path from "path";
import { Config } from "./config.js";
import { validatePath, validateFileExtension, checkFileSize, validateContentSize } from "./validation.js";

export interface ToolResult {
  content: Array<{ type: string; text: string }>;
}

export async function handleReadFile(filePath: string, config: Config): Promise<ToolResult> {
  try {
    console.error(`read_file: ${filePath}`);
    
    // バリデーション
    if (!validatePath(filePath)) {
      return {
        content: [
          { type: "text", text: "エラー: 無効なファイルパスです。" }
        ]
      };
    }
    
    if (!validateFileExtension(filePath, config)) {
      return {
        content: [
          { 
            type: "text", 
            text: `エラー: ファイル拡張子 '${path.extname(filePath)}' は許可されていません。許可されている拡張子: [${config.allowedExtensions.join(', ')}]` 
          }
        ]
      };
    }

    // ファイルサイズチェック
    if (!await checkFileSize(filePath, config)) {
      return {
        content: [
          { type: "text", text: `エラー: ファイルサイズが制限を超えています（最大: ${config.maxFileSize} bytes）` }
        ]
      };
    }

    const content = await fs.readFile(filePath, 'utf-8');
    return {
      content: [
        { type: "text", text: content }
      ]
    };
  } catch (error) {
    return {
      content: [
        { 
          type: "text", 
          text: `エラー: ファイルの読み取りに失敗しました - ${error instanceof Error ? error.message : '不明なエラー'}` 
        }
      ]
    };
  }
}

export async function handleWriteFile(filePath: string, content: string, config: Config): Promise<ToolResult> {
  try {
    console.error(`write_file: ${filePath}`);
    
    // バリデーション
    if (!validatePath(filePath)) {
      return {
        content: [
          { type: "text", text: "エラー: 無効なファイルパスです。" }
        ]
      };
    }
    
    if (!validateFileExtension(filePath, config)) {
      return {
        content: [
          { 
            type: "text", 
            text: `エラー: ファイル拡張子 '${path.extname(filePath)}' は許可されていません。許可されている拡張子: [${config.allowedExtensions.join(', ')}]` 
          }
        ]
      };
    }

    // 書き込み内容のサイズチェック
    if (!validateContentSize(content, config)) {
      return {
        content: [
          { type: "text", text: `エラー: 書き込み内容のサイズが制限を超えています（最大: ${config.maxFileSize} bytes）` }
        ]
      };
    }

    // ディレクトリが存在しない場合は作成
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    await fs.writeFile(filePath, content, 'utf-8');
    return {
      content: [
        { type: "text", text: `成功: ファイル '${filePath}' に書き込みました。` }
      ]
    };
  } catch (error) {
    return {
      content: [
        { 
          type: "text", 
          text: `エラー: ファイルの書き込みに失敗しました - ${error instanceof Error ? error.message : '不明なエラー'}` 
        }
      ]
    };
  }
}

export async function handleFileExists(filePath: string): Promise<ToolResult> {
  try {
    console.error(`file_exists: ${filePath}`);
    
    // バリデーション
    if (!validatePath(filePath)) {
      return {
        content: [
          { type: "text", text: "エラー: 無効なファイルパスです。" }
        ]
      };
    }

    const exists = await fs.access(filePath).then(() => true).catch(() => false);
    return {
      content: [
        { type: "text", text: `ファイル '${filePath}' は${exists ? '存在します' : '存在しません'}。` }
      ]
    };
  } catch (error) {
    return {
      content: [
        { 
          type: "text", 
          text: `エラー: ファイル存在確認に失敗しました - ${error instanceof Error ? error.message : '不明なエラー'}` 
        }
      ]
    };
  }
}

export async function handleCreateFile(filePath: string, content: string, config: Config): Promise<ToolResult> {
  try {
    console.error(`create_file: ${filePath}`);
    
    // バリデーション
    if (!validatePath(filePath)) {
      return {
        content: [
          { type: "text", text: "エラー: 無効なファイルパスです。" }
        ]
      };
    }
    
    if (!validateFileExtension(filePath, config)) {
      return {
        content: [
          { 
            type: "text", 
            text: `エラー: ファイル拡張子 '${path.extname(filePath)}' は許可されていません。許可されている拡張子: [${config.allowedExtensions.join(', ')}]` 
          }
        ]
      };
    }

    // ファイルが既に存在するかチェック
    const exists = await fs.access(filePath).then(() => true).catch(() => false);
    if (exists) {
      return {
        content: [
          { type: "text", text: `エラー: ファイル '${filePath}' は既に存在します。` }
        ]
      };
    }

    // 書き込み内容のサイズチェック
    if (!validateContentSize(content, config)) {
      return {
        content: [
          { type: "text", text: `エラー: 書き込み内容のサイズが制限を超えています（最大: ${config.maxFileSize} bytes）` }
        ]
      };
    }

    // ディレクトリが存在しない場合は作成
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    await fs.writeFile(filePath, content, 'utf-8');
    return {
      content: [
        { type: "text", text: `成功: 新しいファイル '${filePath}' を作成しました。` }
      ]
    };
  } catch (error) {
    return {
      content: [
        { 
          type: "text", 
          text: `エラー: ファイルの作成に失敗しました - ${error instanceof Error ? error.message : '不明なエラー'}` 
        }
      ]
    };
  }
}

export async function handleAppendFile(filePath: string, content: string, config: Config): Promise<ToolResult> {
  try {
    console.error(`append_file: ${filePath}`);
    
    // バリデーション
    if (!validatePath(filePath)) {
      return {
        content: [
          { type: "text", text: "エラー: 無効なファイルパスです。" }
        ]
      };
    }
    
    if (!validateFileExtension(filePath, config)) {
      return {
        content: [
          { 
            type: "text", 
            text: `エラー: ファイル拡張子 '${path.extname(filePath)}' は許可されていません。許可されている拡張子: [${config.allowedExtensions.join(', ')}]` 
          }
        ]
      };
    }

    // ファイルが存在するかチェック
    const exists = await fs.access(filePath).then(() => true).catch(() => false);
    if (!exists) {
      return {
        content: [
          { type: "text", text: `エラー: ファイル '${filePath}' が存在しません。` }
        ]
      };
    }

    // 追記後のファイルサイズをチェック
    const stats = await fs.stat(filePath);
    const newSize = stats.size + Buffer.byteLength(content, 'utf8');
    if (newSize > config.maxFileSize) {
      return {
        content: [
          { type: "text", text: `エラー: 追記後のファイルサイズが制限を超えます（最大: ${config.maxFileSize} bytes）` }
        ]
      };
    }

    await fs.appendFile(filePath, content, 'utf-8');
    return {
      content: [
        { type: "text", text: `成功: ファイル '${filePath}' に内容を追記しました。` }
      ]
    };
  } catch (error) {
    return {
      content: [
        { 
          type: "text", 
          text: `エラー: ファイルへの追記に失敗しました - ${error instanceof Error ? error.message : '不明なエラー'}` 
        }
      ]
    };
  }
}

export async function handleGetFileInfo(filePath: string, config: Config): Promise<ToolResult> {
  try {
    console.error(`get_file_info: ${filePath}`);
    
    // バリデーション
    if (!validatePath(filePath)) {
      return {
        content: [
          { type: "text", text: "エラー: 無効なファイルパスです。" }
        ]
      };
    }

    const stats = await fs.stat(filePath);
    const info = {
      ファイルパス: filePath,
      ファイルサイズ: `${stats.size} bytes`,
      作成日時: stats.birthtime.toLocaleString('ja-JP'),
      更新日時: stats.mtime.toLocaleString('ja-JP'),
      ファイル種別: stats.isFile() ? 'ファイル' : stats.isDirectory() ? 'ディレクトリ' : 'その他',
      拡張子: path.extname(filePath),
      許可状態: validateFileExtension(filePath, config) ? '許可' : '非許可'
    };

    return {
      content: [
        { 
          type: "text", 
          text: Object.entries(info)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n')
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        { 
          type: "text", 
          text: `エラー: ファイル情報の取得に失敗しました - ${error instanceof Error ? error.message : '不明なエラー'}` 
        }
      ]
    };
  }
}