#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs/promises";
import * as path from "path";

// 環境変数から設定を読み込み
const allowedExtensions = process.env.ALLOWED_EXTENSIONS 
  ? process.env.ALLOWED_EXTENSIONS.split(',').map(ext => {
      const trimmed = ext.trim();
      return trimmed.startsWith('.') ? trimmed : '.' + trimmed;
    })
  : [".md", ".txt", ".json", ".yaml", ".yml", ".csv", ".log"];

const maxFileSize = process.env.MAX_FILE_SIZE 
  ? parseInt(process.env.MAX_FILE_SIZE, 10)
  : 10485760; // デフォルト10MB

console.error(`mcp-file-editor設定:
  許可拡張子: ${allowedExtensions.join(', ')}
  最大ファイルサイズ: ${maxFileSize} bytes`);

// バリデーション関数
function validateFileExtension(filePath: string): boolean {
  const extension = path.extname(filePath);
  return allowedExtensions.includes(extension);
}

function validatePath(filePath: string): boolean {
  // パストラバーサル攻撃の防止
  const normalizedPath = path.normalize(filePath);
  return !normalizedPath.includes("..") && !path.isAbsolute(normalizedPath) || path.isAbsolute(normalizedPath);
}

async function checkFileSize(filePath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(filePath);
    return stats.size <= maxFileSize;
  } catch {
    return true; // ファイルが存在しない場合はOK
  }
}

// MCPサーバーのインスタンス作成
const server = new Server({
  name: "mcp-file-editor",
  version: "1.0.0",
}, {
  capabilities: {
    tools: {},
  },
});

// ツール定義
const tools = [
  {
    name: "read_file",
    description: "ファイルの内容を読み取る",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "読み取るファイルのパス",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "write_file",
    description: "ファイルに内容を書き込む（既存ファイルを上書き）",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "書き込むファイルのパス",
        },
        content: {
          type: "string",
          description: "書き込む内容",
        },
      },
      required: ["path", "content"],
    },
  },
  {
    name: "file_exists",
    description: "ファイルの存在確認",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "確認するファイルのパス",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "create_file",
    description: "新しいファイルを作成する（既存ファイルがある場合はエラー）",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "作成するファイルのパス",
        },
        content: {
          type: "string",
          description: "初期内容（デフォルト: 空文字列）",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "append_file", 
    description: "ファイルに内容を追記する",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "追記するファイルのパス",
        },
        content: {
          type: "string",
          description: "追記する内容",
        },
      },
      required: ["path", "content"],
    },
  },
  {
    name: "get_file_info",
    description: "ファイルの詳細情報を取得（サイズ、更新日時など）",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "情報を取得するファイルのパス",
        },
      },
      required: ["path"],
    },
  },
];

// ツール一覧の処理
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools,
  };
});

// ツール実行の処理
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "read_file": {
      const filePath = args?.path as string;
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
        
        if (!validateFileExtension(filePath)) {
          return {
            content: [
              { 
                type: "text", 
                text: `エラー: ファイル拡張子 '${path.extname(filePath)}' は許可されていません。許可されている拡張子: [${allowedExtensions.join(', ')}]` 
              }
            ]
          };
        }

        // ファイルサイズチェック
        if (!await checkFileSize(filePath)) {
          return {
            content: [
              { type: "text", text: `エラー: ファイルサイズが制限を超えています（最大: ${maxFileSize} bytes）` }
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

    case "write_file": {
      const filePath = args?.path as string;
      const content = args?.content as string;
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
        
        if (!validateFileExtension(filePath)) {
          return {
            content: [
              { 
                type: "text", 
                text: `エラー: ファイル拡張子 '${path.extname(filePath)}' は許可されていません。許可されている拡張子: [${allowedExtensions.join(', ')}]` 
              }
            ]
          };
        }

        // 書き込み内容のサイズチェック
        if (Buffer.byteLength(content, 'utf8') > maxFileSize) {
          return {
            content: [
              { type: "text", text: `エラー: 書き込み内容のサイズが制限を超えています（最大: ${maxFileSize} bytes）` }
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

    case "file_exists": {
      const filePath = args?.path as string;
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

    case "create_file": {
      const filePath = args?.path as string;
      const content = (args?.content as string) || "";
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
        
        if (!validateFileExtension(filePath)) {
          return {
            content: [
              { 
                type: "text", 
                text: `エラー: ファイル拡張子 '${path.extname(filePath)}' は許可されていません。許可されている拡張子: [${allowedExtensions.join(', ')}]` 
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
        if (Buffer.byteLength(content, 'utf8') > maxFileSize) {
          return {
            content: [
              { type: "text", text: `エラー: 書き込み内容のサイズが制限を超えています（最大: ${maxFileSize} bytes）` }
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

    case "append_file": {
      const filePath = args?.path as string;
      const content = args?.content as string;
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
        
        if (!validateFileExtension(filePath)) {
          return {
            content: [
              { 
                type: "text", 
                text: `エラー: ファイル拡張子 '${path.extname(filePath)}' は許可されていません。許可されている拡張子: [${allowedExtensions.join(', ')}]` 
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
        if (newSize > maxFileSize) {
          return {
            content: [
              { type: "text", text: `エラー: 追記後のファイルサイズが制限を超えます（最大: ${maxFileSize} bytes）` }
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

    case "get_file_info": {
      const filePath = args?.path as string;
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
          許可状態: validateFileExtension(filePath) ? '許可' : '非許可'
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

    default:
      throw new McpError(
        ErrorCode.MethodNotFound,
        `未知のツール: ${name}`
      );
  }
});

// サーバー起動
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("mcp-file-editor running on stdio");
  } catch (error) {
    console.error("サーバーの起動に失敗しました:", error);
    process.exit(1);
  }
}

main().catch(console.error);