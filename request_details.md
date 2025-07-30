# ファイル編集特化 MCP サーバー作成プロンプト

Claude Code用のファイル編集に特化したMCP（Model Context Protocol）サーバーをTypeScriptで作成してください。

## 要件

### 基本情報
- **言語**: TypeScript
- **SDK**: @modelcontextprotocol/sdk
- **対象**: Claude Codeでのmdファイル編集の問題解決
- **プロジェクト名**: file-editor-mcp

### 解決したい問題
Claude Codeではmdファイル編集時に以下の問題があります：
- READしてからでないとWRITEできない制約がある
- にも関わらず、いきなりWRITEしようとして失敗することが多い
- ファイル操作が不安定

### 実装する機能

#### 1. 必須ツール (Tools)
以下のツールを実装してください：

**`read_file`**
- ファイルの内容を読み取る
- パラメータ: `path` (string, 必須) - ファイルパス
- 戻り値: ファイルの内容、存在しない場合はエラーメッセージ

**`write_file`**
- ファイルに内容を書き込む（既存ファイルを上書き）
- パラメータ: 
  - `path` (string, 必須) - ファイルパス
  - `content` (string, 必須) - 書き込む内容
- 戻り値: 書き込み成功/失敗のメッセージ

**`append_file`**
- ファイルに内容を追記する
- パラメータ:
  - `path` (string, 必須) - ファイルパス 
  - `content` (string, 必須) - 追記する内容
- 戻り値: 追記成功/失敗のメッセージ

**`create_file`**
- 新しいファイルを作成する（既存ファイルがある場合はエラー）
- パラメータ:
  - `path` (string, 必須) - ファイルパス
  - `content` (string, オプション) - 初期内容（デフォルト: 空文字列）
- 戻り値: 作成成功/失敗のメッセージ

**`delete_file`**
- ファイルを削除する
- パラメータ: `path` (string, 必須) - ファイルパス
- 戻り値: 削除成功/失敗のメッセージ

**`list_files`**
- ディレクトリ内のファイル一覧を取得する
- パラメータ: 
  - `directory` (string, 必須) - ディレクトリパス
  - `pattern` (string, オプション) - ファイル名のパターン（glob形式）
- 戻り値: ファイル一覧

**`file_exists`**
- ファイルの存在確認
- パラメータ: `path` (string, 必須) - ファイルパス
- 戻り値: 存在する/しないのboolean値とメッセージ

**`get_file_info`**
- ファイルの詳細情報を取得（サイズ、更新日時など）
- パラメータ: `path` (string, 必須) - ファイルパス
- 戻り値: ファイル情報のオブジェクト

**`set_allowed_extensions`**
- 許可する拡張子を動的に変更する（ランタイム中のみ有効）
- パラメータ: `extensions` (string[], 必須) - 許可する拡張子の配列（例: [".md", ".txt"]）
- 戻り値: 設定変更成功/失敗のメッセージ
- 注意: 環境変数での設定が優先され、サーバー再起動時にリセットされる

**`get_allowed_extensions`**
- 現在許可されている拡張子一覧を取得する
- パラメータ: なし
- 戻り値: 許可されている拡張子の配列（環境変数設定 > ランタイム変更 > デフォルト設定の順で表示）

#### 2. 安全機能・ガードレール
- **ファイル拡張子制限**: 設定可能な許可拡張子配列による制限
  - デフォルト許可拡張子: `['.md', '.txt', '.json', '.yaml', '.yml', '.csv', '.log']`
  - 設定で変更可能
  - 許可されていない拡張子のファイルは操作拒否
- パストラバーサル攻撃の防止
- 書き込み前の自動バックアップ作成（.bak拡張子）
- ファイルサイズ制限（例: 10MB）
- 危険な操作の確認メッセージ

#### 3. エラーハンドリング  
- 適切なエラーメッセージの提供
- ファイル権限エラーの処理
- ディスク容量不足の検出

### プロジェクト構成

```
file-editor-mcp/
├── src/
│   ├── index.ts          # メインサーバーファイル
│   ├── config/
│   │   └── settings.ts   # 設定管理（許可拡張子など）
│   ├── tools/            # ツール実装
│   │   ├── file-operations.ts
│   │   └── safety.ts     # 安全機能・ガードレール
│   └── utils/
│       └── validation.ts # バリデーション・拡張子チェック
├── package.json
├── tsconfig.json
├── config.json          # 設定ファイル（許可拡張子など）
└── README.md
```

### 技術仕様・参考実装パターン

**`y-hirakaw/mcp-gh-issue-mini` の実装パターンを参考にして以下の構造で実装：**

#### 基本構造
```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as fs from "fs/promises";
import * as path from "path";

// サーバーインスタンス作成
const server = new McpServer({
  name: "mcp-file-editor",
  version: "1.0.0",
  capabilities: {
    tools: {},
  },
});

// 各ツールをserver.tool()で定義
// 最後にStdioServerTransportで接続
```

#### ツール定義パターン
```typescript
server.tool(
  "read_file",
  "ファイルの内容を読み取る",
  {
    path: z.string().describe("読み取るファイルのパス"),
  },
  async ({ path }) => {
    // 実装ロジック
    return {
      content: [
        { type: "text", text: "結果テキスト" }
      ]
    };
  }
);
```

#### package.json
```json
{
  "name": "file-editor-mcp",
  "version": "1.0.0",
  "description": "File editing specialized MCP server for Claude Code",
  "type": "module",
  "bin": {
    "file-editor-mcp": "./build/index.js"
  },
  "scripts": {
    "build": "tsc && chmod +x build/index.js",
    "dev": "tsc --watch",
    "start": "node build/index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.6.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.24",
    "typescript": "^5.3.3"
  }
}
```

#### 環境変数による設定
**`y-hirakaw/mcp-gh-issue-mini`と同様に環境変数で設定可能にする：**

- `ALLOWED_EXTENSIONS`: 許可する拡張子をカンマ区切りで指定（例: ".md,.txt,.json"）
- `MAX_FILE_SIZE`: 最大ファイルサイズ（バイト）
- `CREATE_BACKUPS`: バックアップ作成の有効/無効（"true"/"false"）

**実装での環境変数読み込み例：**
```typescript
// 環境変数から許可拡張子を取得（カンマ区切り文字列を配列に変換）
const allowedExtensions = process.env.ALLOWED_EXTENSIONS 
  ? process.env.ALLOWED_EXTENSIONS.split(',').map(ext => ext.trim())
  : [".md", ".txt", ".json", ".yaml", ".yml", ".csv", ".log"]; // デフォルト値

const maxFileSize = process.env.MAX_FILE_SIZE 
  ? parseInt(process.env.MAX_FILE_SIZE, 10)
  : 10485760; // デフォルト10MB

const createBackups = process.env.CREATE_BACKUPS === 'true' 
  ? true 
  : true; // デフォルトでバックアップ有効
```
#### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022", 
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./build",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "build"]  
}
```

#### メイン実装ファイル（src/index.ts）の構造
**`y-hirakaw/mcp-gh-issue-mini`の単一ファイル構造を踏襲：**

1. **必要なインポート**
2. **設定の読み込み・管理**（config.jsonから許可拡張子など）
3. **バリデーション関数**（拡張子チェック、パストラバーサル防止など）
4. **各ツールの実装**（server.tool()で定義）
5. **サーバー起動**（StdioServerTransport接続）

#### エラーハンドリングパターン
```typescript
try {
  // ファイル操作
} catch (error) {
  return {
    content: [
      { 
        type: "text", 
        text: `エラー: ${error instanceof Error ? error.message : '不明なエラー'}` 
      }
    ]
  };
}
```

### 実装ガイドライン

**`y-hirakaw/mcp-gh-issue-mini`の実装パターンに準拠して以下を実装：**

1. **単一ファイル構造** - `src/index.ts`に全機能を統合（複雑な分割は避ける）
2. **McpServer**インスタンスを作成し、`server.tool()`でツール定義
3. **環境変数の優先読み込み** - GitHub Token同様に環境変数を最優先で処理
4. **Zodスキーマ**を使用してパラメータのバリデーションを行う
5. **非同期処理**を適切に使用する（async/await）
6. **詳細なログ出力**を`console.error`で提供（デバッグ用）
7. **わかりやすいエラーメッセージ**を日本語で提供
8. **ファイル操作前の事前チェック**を必ず実行
9. **拡張子チェック**をすべてのファイル操作で最初に実行
   - ファイルパスから拡張子を抽出
   - 許可拡張子配列と照合  
   - 不許可の場合は明確なエラーメッセージで拒否
10. **StdioServerTransport**を使用してClaude Codeとの通信
11. **最終的なサーバー接続**：
    ```typescript
    async function main() {
      const transport = new StdioServerTransport();
      await server.connect(transport);
      console.error("mcp-file-editor running on stdio");
    }
    
    main().catch(console.error);
    ```

### 使用例

実装後、Claude Codeで以下のように使用できることを想定：

```
"mdファイルの内容を読み取って、目次を追加してください"
→ read_file → 内容確認 → write_file で更新

"新しいREADME.mdを作成してください"  
→ create_file で作成

"このファイルに追記してください"
→ append_file で追記

"拡張子制限を.md、.txt、.jsonのみに変更してください"
→ set_allowed_extensions で設定変更

"現在許可されている拡張子を教えてください"
→ get_allowed_extensions で確認
```

**拡張子制限の動作例**：
```
"script.js を読み取ってください"
→ エラー: "ファイル拡張子 '.js' は許可されていません。許可されている拡張子: ['.md', '.txt', '.json']"

"config.ini を作成してください"  
→ エラー: "ファイル拡張子 '.ini' は許可されていません。許可されている拡張子: ['.md', '.txt', '.json']"
```

### セットアップ手順も含める

実装後の設定方法：

1. プロジェクトをビルド: `npm run build`
2. Claude Codeの設定ファイルに追加:

```json
{
  "mcpServers": {
    "file-editor": {
      "command": "node",
      "args": ["/absolute/path/to/file-editor-mcp/build/index.js"]
      "env": {
        "ALLOWED_EXTENSIONS": ".md,.txt,.json,.yaml,.yml",
        "MAX_FILE_SIZE": "10485760", 
        "CREATE_BACKUPS": "true"
      }
    }
  }
}
```

### 注意点

- **セキュリティ**を最優先に考慮した実装
- **Cross-platform**対応（Windows/Mac/Linux）
- **Claude Codeとの互換性**を重視
- **テスト可能な構造**での実装

完全に動作する実装をファイル構成通りに作成してください。特にClaude Codeでのmdファイル編集における問題を解決することに重点を置いてください。