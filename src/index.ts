#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

import { loadConfig, logConfig } from "./config.js";
import { tools } from "./tools.js";
import {
  handleReadFile,
  handleWriteFile,
  handleFileExists, 
  handleCreateFile,
  handleAppendFile,
  handleGetFileInfo
} from "./handlers.js";

// 設定を読み込み
const config = loadConfig();
logConfig(config);

// MCPサーバーのインスタンス作成
const server = new Server({
  name: "mcp-file-editor",
  version: "1.0.0",
}, {
  capabilities: {
    tools: {},
  },
});

// ツール一覧の処理
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// ツール実行の処理
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "read_file":
      // ファイルの内容を読み取る（拡張子・サイズ制限あり、行数指定可能）
      return await handleReadFile(args?.path as string, config, {
        start_line: args?.start_line as number,
        end_line: args?.end_line as number,
        max_lines: args?.max_lines as number,
      }) as any;

    case "write_file":
      // ファイルに内容を書き込む（既存ファイルを上書き）
      return await handleWriteFile(args?.path as string, args?.content as string, config) as any;

    case "file_exists":
      // ファイルの存在確認
      return await handleFileExists(args?.path as string) as any;

    case "create_file":
      // 新しいファイルを作成（既存ファイルがある場合はエラー）
      return await handleCreateFile(args?.path as string, (args?.content as string) || "", config) as any;

    case "append_file":
      // ファイルに内容を追記する
      return await handleAppendFile(args?.path as string, args?.content as string, config) as any;

    case "get_file_info":
      // ファイルの詳細情報を取得（サイズ、更新日時など）
      return await handleGetFileInfo(args?.path as string, config) as any;

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